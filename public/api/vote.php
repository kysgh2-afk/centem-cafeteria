<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

const VALID_IDS = ['stx', 'partibox', 'dawa', 'manna'];
const IP_SALT = 'centem-cafeteria-vote-v1';

$dataDir = __DIR__ . '/data';
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}

$tz = new DateTimeZone('Asia/Seoul');
$today = (new DateTime('now', $tz))->format('Y-m-d');
$file = $dataDir . '/votes-' . $today . '.json';

function getClientIp(): string
{
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $parts = explode(',', (string) $_SERVER['HTTP_X_FORWARDED_FOR']);
        return trim($parts[0]);
    }

    if (!empty($_SERVER['HTTP_CF_CONNECTING_IP'])) {
        return (string) $_SERVER['HTTP_CF_CONNECTING_IP'];
    }

    return (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
}

function defaultCounts(): array
{
    return [
        'stx' => 0,
        'partibox' => 0,
        'dawa' => 0,
        'manna' => 0,
    ];
}

function loadData(string $file, string $today): array
{
    if (!file_exists($file)) {
        return [
            'date' => $today,
            'counts' => defaultCounts(),
            'voters' => [],
        ];
    }

    $raw = file_get_contents($file);
    $data = json_decode($raw ?: '', true);

    if (!is_array($data)) {
        return [
            'date' => $today,
            'counts' => defaultCounts(),
            'voters' => [],
        ];
    }

    $data['counts'] = array_merge(defaultCounts(), $data['counts'] ?? []);
    $data['voters'] = is_array($data['voters'] ?? null) ? $data['voters'] : [];

    return $data;
}

function saveData(string $file, array $data): bool
{
    $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    if ($json === false) {
        return false;
    }

    return file_put_contents($file, $json, LOCK_EX) !== false;
}

function respond(array $payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

$ipHash = hash('sha256', getClientIp() . IP_SALT);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $data = loadData($file, $today);

    respond([
        'date' => $today,
        'counts' => $data['counts'],
        'hasVoted' => isset($data['voters'][$ipHash]),
        'votedFor' => $data['voters'][$ipHash] ?? null,
    ]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input') ?: '', true);
    $cafeteriaId = is_array($input) ? ($input['cafeteriaId'] ?? '') : '';

    if (!in_array($cafeteriaId, VALID_IDS, true)) {
        respond(['error' => 'invalid_cafeteria'], 400);
    }

    $data = loadData($file, $today);

    if (isset($data['voters'][$ipHash])) {
        respond([
            'error' => 'already_voted',
            'date' => $today,
            'counts' => $data['counts'],
            'hasVoted' => true,
            'votedFor' => $data['voters'][$ipHash],
        ], 409);
    }

    $data['counts'][$cafeteriaId] = ($data['counts'][$cafeteriaId] ?? 0) + 1;
    $data['voters'][$ipHash] = $cafeteriaId;

    if (!saveData($file, $data)) {
        respond(['error' => 'save_failed'], 500);
    }

    respond([
        'success' => true,
        'date' => $today,
        'counts' => $data['counts'],
        'hasVoted' => true,
        'votedFor' => $cafeteriaId,
    ]);
}

respond(['error' => 'method_not_allowed'], 405);
