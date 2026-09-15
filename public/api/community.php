<?php
declare(strict_types=1);

date_default_timezone_set('Asia/Seoul');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, private');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');

const ADMIN_SALT = '893717ced5572419fdf60b5d2c228a6b';
const ADMIN_HASH = 'c7acd1779b27af87d9ec3b11ae1c2394463980269102e44f5037826b41a286ed';
const ADMIN_ITERATIONS = 200000;
const PAGE_SIZE = 20;

$dataDir = __DIR__ . '/.data';
$dataFile = $dataDir . '/community.json';

function respond(array $payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function fail(string $message, int $status = 400): void
{
    respond(['error' => $message], $status);
}

function defaultData(): array
{
    return ['posts' => [], 'comments' => [], 'reports' => [], '_rate' => []];
}

function normalizeData($value): array
{
    $data = is_array($value) ? $value : [];
    foreach (['posts', 'comments', 'reports', '_rate'] as $key) {
        if (!isset($data[$key]) || !is_array($data[$key])) $data[$key] = [];
    }
    return $data;
}

function ensureStorage(string $dataDir, string $dataFile): void
{
    if (!is_dir($dataDir) && !mkdir($dataDir, 0750, true) && !is_dir($dataDir)) {
        fail('커뮤니티 저장 공간을 준비하지 못했습니다.', 503);
    }
    if (!file_exists($dataFile)) {
        $created = file_put_contents($dataFile, json_encode(defaultData(), JSON_UNESCAPED_UNICODE), LOCK_EX);
        if ($created === false) fail('커뮤니티 저장 공간을 준비하지 못했습니다.', 503);
        @chmod($dataFile, 0640);
    }
}

function readData(string $dataFile): array
{
    $handle = fopen($dataFile, 'r');
    if ($handle === false || !flock($handle, LOCK_SH)) fail('커뮤니티 데이터를 불러오지 못했습니다.', 503);
    $raw = stream_get_contents($handle);
    flock($handle, LOCK_UN);
    fclose($handle);
    return normalizeData($raw ? json_decode($raw, true) : null);
}

function mutateData(string $dataFile, callable $callback)
{
    $handle = fopen($dataFile, 'c+');
    if ($handle === false || !flock($handle, LOCK_EX)) fail('요청을 저장하지 못했습니다.', 503);
    $raw = stream_get_contents($handle);
    $data = normalizeData($raw ? json_decode($raw, true) : null);
    $result = $callback($data);
    rewind($handle);
    ftruncate($handle, 0);
    $encoded = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    if ($encoded === false || fwrite($handle, $encoded) === false) {
        flock($handle, LOCK_UN);
        fclose($handle);
        fail('요청을 저장하지 못했습니다.', 503);
    }
    fflush($handle);
    flock($handle, LOCK_UN);
    fclose($handle);
    return $result;
}

function inputJson(): array
{
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    if (strpos(strtolower($contentType), 'application/json') !== 0) fail('올바르지 않은 요청입니다.', 415);
    $raw = file_get_contents('php://input');
    if ($raw === false || strlen($raw) > 20000) fail('요청 내용이 너무 큽니다.', 413);
    $input = json_decode($raw, true);
    if (!is_array($input)) fail('입력 내용을 확인해 주세요.');
    return $input;
}

function textValue(array $input, string $key, int $min, int $max, string $label): string
{
    $value = trim(str_replace("\0", '', (string) ($input[$key] ?? '')));
    $length = function_exists('mb_strlen') ? mb_strlen($value, 'UTF-8') : strlen($value);
    if ($length < $min || $length > $max) fail("{$label}은(는) {$min}~{$max}자로 입력해 주세요.");
    return $value;
}

function validateSafeContent(string $value): void
{
    if (preg_match('/(?:https?:\/\/|www\.)/iu', $value)) fail('안전한 운영을 위해 외부 링크는 등록할 수 없습니다.');
    if (preg_match('/[\w.%+\-]+@[\w.\-]+\.[A-Za-z]{2,}/u', $value)) fail('개인정보 보호를 위해 이메일 주소는 등록할 수 없습니다.');
    if (preg_match('/(?:01[016789]|0\d{1,2})[- .]?\d{3,4}[- .]?\d{4}/u', $value)) fail('개인정보 보호를 위해 전화번호는 등록할 수 없습니다.');
}

function visitorHash(): string
{
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    return hash('sha256', $ip . '|centum-community-v1');
}

function enforceRateLimit(array &$data, string $action, int $limit, int $windowSeconds): void
{
    $now = time();
    $visitor = visitorHash();
    $data['_rate'] = array_values(array_filter($data['_rate'], static fn($item) => is_array($item) && (int) ($item['time'] ?? 0) >= $now - 86400));
    $recent = array_filter($data['_rate'], static fn($item) => ($item['visitor'] ?? '') === $visitor && ($item['action'] ?? '') === $action && (int) ($item['time'] ?? 0) >= $now - $windowSeconds);
    if (count($recent) >= $limit) fail('요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.', 429);
    $data['_rate'][] = ['visitor' => $visitor, 'action' => $action, 'time' => $now];
}

function verifyAdmin(): void
{
    $password = (string) ($_SERVER['HTTP_X_ADMIN_PASSWORD'] ?? '');
    if ($password === '') fail('운영자 인증이 필요합니다.', 401);
    $hash = hash_pbkdf2('sha256', $password, ADMIN_SALT, ADMIN_ITERATIONS, 64, false);
    if (!hash_equals(ADMIN_HASH, $hash)) fail('운영자 비밀번호가 올바르지 않습니다.', 401);
}

function publicPost(array $post, int $commentCount = 0, ?int $reportCount = null): array
{
    $output = [
        'id' => (string) ($post['id'] ?? ''),
        'category' => (string) ($post['category'] ?? ''),
        'title' => (string) ($post['title'] ?? ''),
        'body' => (string) ($post['body'] ?? ''),
        'nickname' => (string) ($post['nickname'] ?? ''),
        'createdAt' => (string) ($post['createdAt'] ?? ''),
        'updatedAt' => (string) ($post['updatedAt'] ?? ''),
        'commentCount' => $commentCount,
        'status' => (string) ($post['status'] ?? 'published'),
    ];
    if ($reportCount !== null) $output['reportCount'] = $reportCount;
    return $output;
}

function publicComment(array $comment, ?int $reportCount = null): array
{
    $output = [
        'id' => (string) ($comment['id'] ?? ''),
        'postId' => (string) ($comment['postId'] ?? ''),
        'body' => (string) ($comment['body'] ?? ''),
        'nickname' => (string) ($comment['nickname'] ?? ''),
        'createdAt' => (string) ($comment['createdAt'] ?? ''),
        'status' => (string) ($comment['status'] ?? 'published'),
    ];
    if ($reportCount !== null) $output['reportCount'] = $reportCount;
    return $output;
}

function containsText(string $haystack, string $needle): bool
{
    if ($needle === '') return true;
    return function_exists('mb_stripos') ? mb_stripos($haystack, $needle, 0, 'UTF-8') !== false : stripos($haystack, $needle) !== false;
}

ensureStorage($dataDir, $dataFile);
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
$action = (string) ($_GET['action'] ?? 'list');

if ($method === 'GET' && $action === 'list') {
    $data = readData($dataFile);
    $query = trim((string) ($_GET['q'] ?? ''));
    if (strlen($query) > 120) fail('검색어가 너무 깁니다.');
    $page = max(1, (int) ($_GET['page'] ?? 1));
    $publishedComments = array_filter($data['comments'], static fn($comment) => ($comment['status'] ?? '') === 'published');
    $posts = array_values(array_filter($data['posts'], static function ($post) use ($query): bool {
        if (($post['status'] ?? '') !== 'published') return false;
        return containsText((string) (($post['title'] ?? '') . ' ' . ($post['body'] ?? '')), $query);
    }));
    usort($posts, static fn($a, $b) => strcmp((string) ($b['createdAt'] ?? ''), (string) ($a['createdAt'] ?? '')));
    $total = count($posts);
    $totalPages = max(1, (int) ceil($total / PAGE_SIZE));
    $page = min($page, $totalPages);
    $posts = array_slice($posts, ($page - 1) * PAGE_SIZE, PAGE_SIZE);
    $items = array_map(static function ($post) use ($publishedComments): array {
        $count = count(array_filter($publishedComments, static fn($comment) => ($comment['postId'] ?? '') === ($post['id'] ?? '')));
        return publicPost($post, $count);
    }, $posts);
    respond(['posts' => $items, 'page' => $page, 'totalPages' => $totalPages, 'total' => $total]);
}

if ($method === 'GET' && $action === 'detail') {
    $data = readData($dataFile);
    $id = (string) ($_GET['id'] ?? '');
    $post = null;
    foreach ($data['posts'] as $candidate) {
        if (($candidate['id'] ?? '') === $id && ($candidate['status'] ?? '') === 'published') $post = $candidate;
    }
    if ($post === null) fail('게시글을 찾을 수 없습니다.', 404);
    $comments = array_values(array_filter($data['comments'], static fn($comment) => ($comment['postId'] ?? '') === $id && ($comment['status'] ?? '') === 'published'));
    usort($comments, static fn($a, $b) => strcmp((string) ($a['createdAt'] ?? ''), (string) ($b['createdAt'] ?? '')));
    respond(['post' => publicPost($post, count($comments)), 'comments' => array_map('publicComment', $comments)]);
}

if ($method === 'GET' && $action === 'admin-list') {
    verifyAdmin();
    $data = readData($dataFile);
    $openReports = array_values(array_filter($data['reports'], static fn($report) => ($report['status'] ?? 'open') === 'open'));
    $posts = array_map(static function ($post) use ($data, $openReports): array {
        $comments = array_filter($data['comments'], static fn($comment) => ($comment['postId'] ?? '') === ($post['id'] ?? ''));
        $reports = array_filter($openReports, static fn($report) => ($report['type'] ?? '') === 'post' && ($report['targetId'] ?? '') === ($post['id'] ?? ''));
        return publicPost($post, count($comments), count($reports));
    }, $data['posts']);
    usort($posts, static fn($a, $b) => strcmp($b['createdAt'], $a['createdAt']));
    $comments = array_map(static function ($comment) use ($openReports): array {
        $reports = array_filter($openReports, static fn($report) => ($report['type'] ?? '') === 'comment' && ($report['targetId'] ?? '') === ($comment['id'] ?? ''));
        return publicComment($comment, count($reports));
    }, $data['comments']);
    $reports = array_map(static fn($report) => [
        'id' => (string) ($report['id'] ?? ''),
        'type' => (string) ($report['type'] ?? ''),
        'targetId' => (string) ($report['targetId'] ?? ''),
        'reason' => (string) ($report['reason'] ?? ''),
        'createdAt' => (string) ($report['createdAt'] ?? ''),
    ], $openReports);
    respond(['posts' => $posts, 'comments' => $comments, 'reports' => $reports]);
}

if ($method !== 'POST') fail('지원하지 않는 요청입니다.', 405);
$input = inputJson();

if ($action === 'create') {
    $result = mutateData($dataFile, static function (array &$data) use ($input): array {
        enforceRateLimit($data, 'create', 3, 600);
        if (trim((string) ($input['website'] ?? '')) !== '') fail('등록할 수 없는 요청입니다.');
        if (($input['agree'] ?? '') !== 'on') fail('커뮤니티 운영 원칙에 동의해 주세요.');
        $category = 'general';
        $nickname = textValue(['nickname' => trim((string) ($input['nickname'] ?? '')) ?: '익명'], 'nickname', 2, 12, '닉네임');
        $title = textValue($input, 'title', 4, 80, '제목');
        $body = textValue($input, 'body', 10, 2000, '내용');
        $password = textValue($input, 'password', 6, 30, '글 비밀번호');
        validateSafeContent($nickname . ' ' . $title . ' ' . $body);
        $now = date(DATE_ATOM);
        $id = bin2hex(random_bytes(8));
        $data['posts'][] = [
            'id' => $id, 'category' => $category, 'title' => $title, 'body' => $body, 'nickname' => $nickname,
            'passwordHash' => password_hash($password, PASSWORD_DEFAULT), 'createdAt' => $now, 'updatedAt' => $now, 'status' => 'published',
        ];
        return ['id' => $id];
    });
    respond($result, 201);
}

if ($action === 'update') {
    $result = mutateData($dataFile, static function (array &$data) use ($input): array {
        enforceRateLimit($data, 'update', 5, 600);
        $id = (string) ($input['id'] ?? '');
        $category = 'general';
        $nickname = textValue(['nickname' => trim((string) ($input['nickname'] ?? '')) ?: '익명'], 'nickname', 2, 12, '닉네임');
        $title = textValue($input, 'title', 4, 80, '제목');
        $body = textValue($input, 'body', 10, 2000, '내용');
        $password = textValue($input, 'password', 6, 30, '글 비밀번호');
        validateSafeContent($nickname . ' ' . $title . ' ' . $body);
        foreach ($data['posts'] as &$post) {
            if (($post['id'] ?? '') !== $id || ($post['status'] ?? '') === 'deleted') continue;
            if (!password_verify($password, (string) ($post['passwordHash'] ?? ''))) fail('글 비밀번호가 올바르지 않습니다.', 403);
            $post['category'] = $category;
            $post['nickname'] = $nickname;
            $post['title'] = $title;
            $post['body'] = $body;
            $post['updatedAt'] = date(DATE_ATOM);
            return ['id' => $id];
        }
        unset($post);
        fail('게시글을 찾을 수 없습니다.', 404);
    });
    respond($result);
}

if ($action === 'comment') {
    $result = mutateData($dataFile, static function (array &$data) use ($input): array {
        enforceRateLimit($data, 'comment', 8, 600);
        if (trim((string) ($input['website'] ?? '')) !== '') fail('등록할 수 없는 요청입니다.');
        $postId = (string) ($input['postId'] ?? '');
        $exists = count(array_filter($data['posts'], static fn($post) => ($post['id'] ?? '') === $postId && ($post['status'] ?? '') === 'published')) > 0;
        if (!$exists) fail('게시글을 찾을 수 없습니다.', 404);
        $nickname = textValue(['nickname' => trim((string) ($input['nickname'] ?? '')) ?: '익명'], 'nickname', 2, 12, '닉네임');
        $body = textValue($input, 'body', 2, 500, '댓글');
        $password = textValue($input, 'password', 6, 30, '댓글 비밀번호');
        validateSafeContent($nickname . ' ' . $body);
        $id = bin2hex(random_bytes(8));
        $data['comments'][] = [
            'id' => $id, 'postId' => $postId, 'body' => $body, 'nickname' => $nickname,
            'passwordHash' => password_hash($password, PASSWORD_DEFAULT), 'createdAt' => date(DATE_ATOM), 'status' => 'published',
        ];
        return ['id' => $id];
    });
    respond($result, 201);
}

if ($action === 'delete') {
    $result = mutateData($dataFile, static function (array &$data) use ($input): array {
        enforceRateLimit($data, 'delete', 8, 600);
        $type = (string) ($input['type'] ?? '');
        $id = (string) ($input['id'] ?? '');
        $password = textValue($input, 'password', 6, 30, '비밀번호');
        $collection = $type === 'post' ? 'posts' : ($type === 'comment' ? 'comments' : '');
        if ($collection === '') fail('삭제 대상을 확인해 주세요.');
        foreach ($data[$collection] as &$item) {
            if (($item['id'] ?? '') !== $id || ($item['status'] ?? '') === 'deleted') continue;
            if (!password_verify($password, (string) ($item['passwordHash'] ?? ''))) fail('비밀번호가 올바르지 않습니다.', 403);
            $item['status'] = 'deleted';
            $item['nickname'] = '';
            $item['body'] = '';
            $item['passwordHash'] = '';
            if ($type === 'post') $item['title'] = '삭제된 게시글';
            if ($type === 'post') {
                foreach ($data['comments'] as &$comment) {
                    if (($comment['postId'] ?? '') !== $id) continue;
                    $comment['status'] = 'deleted';
                    $comment['nickname'] = '';
                    $comment['body'] = '';
                    $comment['passwordHash'] = '';
                }
                unset($comment);
            }
            return ['ok' => true];
        }
        unset($item);
        fail('삭제할 내용을 찾을 수 없습니다.', 404);
    });
    respond($result);
}

if ($action === 'report') {
    $result = mutateData($dataFile, static function (array &$data) use ($input): array {
        enforceRateLimit($data, 'report', 5, 600);
        $type = (string) ($input['type'] ?? '');
        $id = (string) ($input['id'] ?? '');
        if (!in_array($type, ['post', 'comment'], true)) fail('신고 대상을 확인해 주세요.');
        $reason = textValue($input, 'reason', 2, 200, '신고 사유');
        validateSafeContent($reason);
        $collection = $type === 'post' ? 'posts' : 'comments';
        $exists = count(array_filter($data[$collection], static fn($item) => ($item['id'] ?? '') === $id && ($item['status'] ?? '') !== 'deleted')) > 0;
        if (!$exists) fail('신고할 내용을 찾을 수 없습니다.', 404);
        $visitor = visitorHash();
        $duplicate = count(array_filter($data['reports'], static fn($report) => ($report['targetId'] ?? '') === $id && ($report['type'] ?? '') === $type && ($report['visitor'] ?? '') === $visitor && ($report['status'] ?? 'open') === 'open')) > 0;
        if ($duplicate) fail('이미 신고한 내용입니다.', 409);
        $data['reports'][] = [
            'id' => bin2hex(random_bytes(8)), 'type' => $type, 'targetId' => $id, 'reason' => $reason,
            'visitor' => $visitor, 'createdAt' => date(DATE_ATOM), 'status' => 'open',
        ];
        return ['ok' => true];
    });
    respond($result, 201);
}

if ($action === 'admin-moderate') {
    verifyAdmin();
    $result = mutateData($dataFile, static function (array &$data) use ($input): array {
        $type = (string) ($input['type'] ?? '');
        $id = (string) ($input['id'] ?? '');
        $status = (string) ($input['status'] ?? '');
        if (!in_array($status, ['published', 'hidden', 'deleted'], true)) fail('처리 상태를 확인해 주세요.');
        $collection = $type === 'post' ? 'posts' : ($type === 'comment' ? 'comments' : '');
        if ($collection === '') fail('처리 대상을 확인해 주세요.');
        foreach ($data[$collection] as &$item) {
            if (($item['id'] ?? '') !== $id) continue;
            $item['status'] = $status;
            if ($status === 'deleted') {
                $item['nickname'] = '';
                $item['body'] = '';
                $item['passwordHash'] = '';
                if ($type === 'post') {
                    $item['title'] = '삭제된 게시글';
                    foreach ($data['comments'] as &$comment) {
                        if (($comment['postId'] ?? '') !== $id) continue;
                        $comment['status'] = 'deleted';
                        $comment['nickname'] = '';
                        $comment['body'] = '';
                        $comment['passwordHash'] = '';
                    }
                    unset($comment);
                }
            }
            return ['ok' => true];
        }
        unset($item);
        fail('처리 대상을 찾을 수 없습니다.', 404);
    });
    respond($result);
}

if ($action === 'admin-resolve') {
    verifyAdmin();
    $result = mutateData($dataFile, static function (array &$data) use ($input): array {
        $id = (string) ($input['id'] ?? '');
        $before = count($data['reports']);
        $data['reports'] = array_values(array_filter($data['reports'], static fn($report) => ($report['id'] ?? '') !== $id));
        if (count($data['reports']) === $before) fail('신고 내역을 찾을 수 없습니다.', 404);
        return ['ok' => true];
    });
    respond($result);
}

fail('지원하지 않는 요청입니다.', 404);
