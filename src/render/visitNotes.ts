import { siteMeta } from '../content/siteContent'

const notes = {
  stx: {
    route: '영상산업센터는 센텀서로 39에 있습니다. 제공된 사진의 정문 표지와 로비 엘리베이터를 차례로 확인하고 4층 식당으로 이동하세요. 인근 건물 이름만 보고 들어가기보다 지도에서 건물 주소를 먼저 대조하는 편이 좋습니다.',
    meal: '입구 식권발매기 사진에는 중식과 석식이 별도로 표시되어 있습니다. 방문한 시간대의 식권 종류와 수량을 확인해 결제한 뒤 배식대로 이동하세요. 음료 자판기는 식권발매기와 다른 기기이므로 식사 가격에 포함된 것으로 판단하지 마세요.',
    caution: '공식 게시판에는 다음 주 식단이 먼저 올라올 수 있습니다. 목록의 게시 순서보다 제목의 적용 기간을 확인하세요. 이 사이트는 오늘이 포함된 기간의 게시물을 우선 선택하며, 찾지 못한 경우 이전 자료를 새 식단으로 표시하지 않습니다.',
    question: '저녁에도 같은 식권으로 이용하나요?',
    answer: '제공된 발매기 사진에는 중식·석식 버튼이 구분되어 있습니다. 저녁 방문이라면 석식 운영 여부와 해당 식권을 현장에서 확인하세요. 메뉴와 가격은 사진 촬영 이후 바뀔 수 있습니다.',
    source: 'https://www.bvic.kr/NcPageLink.do?_menuNo=14&link=bvic%2Fitr%2FITR0400',
    sourceLabel: '영상산업센터 공식 오시는 길',
  },
  partibox: {
    route: '동서대학교 센텀캠퍼스 앞 광장에서 소향갤러리 표지판을 찾는 것이 사진 동선의 시작입니다. 유리문으로 진입한 뒤 지하 1층 복도를 따라 파티박스 간판을 확인하세요. 사진은 한 가지 접근 경로이며 계단 없는 경로를 보장하는 안내는 아닙니다.',
    meal: '입구의 식권발매기에서 수량과 결제 금액을 확인하세요. 제공된 현장 안내는 식권만 식권함에 넣고 영수증은 넣지 않도록 구분합니다. 식권을 처리한 다음 식기와 뷔페 라인을 이용하면 결제 대기와 배식 대기를 혼동하지 않을 수 있습니다.',
    caution: '사진 속 묶음 식권 가격이나 토요일 영업 안내는 당시 게시물 기준입니다. 휴일·방학·행사가 있는 날에는 카카오채널의 당일 공지와 현장 안내를 먼저 확인하세요. 사진만으로 매일 모든 반찬과 부가 서비스가 제공된다고 보장하지 않습니다.',
    question: '외부인도 들어갈 수 있나요?',
    answer: '기존 제공 자료에는 외부인 이용 안내가 있습니다. 다만 건물 출입이나 행사일 운영은 달라질 수 있으므로 처음 방문하거나 주말에 이용할 때 공식 채널에서 당일 안내를 확인하세요.',
    source: 'https://pf.kakao.com/_DCpLK/posts', sourceLabel: '파티박스 공식 소식',
  },
  schmaus: {
    route: '센텀스카이비즈에는 여러 식당이 있으므로 지하 1층이라는 정보만으로는 입구를 찾기 어렵습니다. 제공된 층별 안내판 사진의 C-B105 슈마우스 만찬을 기준으로 복도를 이동하고, 매장 이름을 입구에서 다시 확인하세요.',
    meal: '사진 속 카운터에는 카드 결제와 계좌이체 안내가 있습니다. 먼저 한 끼 또는 묶음 식권의 조건을 확인한 뒤 결제하고 뷔페 라인으로 이동하세요. 10+1 혜택은 변경될 수 있으므로 사용 기한·보관 방식·환불 조건은 구매 전에 매장에 물어보세요.',
    caution: '칠판 사진의 메뉴는 촬영 당시의 예시입니다. 오늘 먹을 메뉴는 최신 카카오채널 게시물의 날짜 또는 매장 입구 칠판을 기준으로 판단하세요. 계란후라이 코너는 현장에 표시된 제공 수량과 이용 순서를 지켜 사용하세요.',
    question: '차량으로 가면 무료 주차인가요?',
    answer: '주차장 입구 사진은 위치를 찾기 위한 자료입니다. 무료 주차 시간이나 식사 시 주차 지원 여부는 확인되지 않았습니다. 차량 방문 전 관리실 또는 매장에 요금과 지원 조건을 확인하세요.',
    source: 'https://pf.kakao.com/_CiVis/posts', sourceLabel: '슈마우스 만찬 공식 소식',
  },
  jeongdam: {
    route: '제공된 사진에서는 센텀스카이비즈 건물 측면 계단을 내려가 B1 6번 출입구로 들어갑니다. 복도에서 세로형 정담 배너와 유리문 위 간판을 찾으세요. 옆 매장과 혼동하지 않도록 메뉴판보다 정담이라는 매장명을 기준으로 확인하면 좋습니다.',
    meal: '입구에는 당일 메뉴판, 안쪽에는 셀프 배식대가 보입니다. 메뉴판의 날짜와 가격을 먼저 확인하고 결제 위치와 식사 이용 순서는 직원 안내를 받으세요. 사진만으로 카드·현금·묶음 식권 등 결제 조건이 확인되지는 않으므로 특정 방식을 보장하지 않습니다.',
    caution: '입구 사진에 보이는 9월 10일 메뉴는 길 찾기와 매장 모습을 설명하기 위한 예시이며 오늘 메뉴가 아닙니다. 식단은 공식 카카오채널의 게시물 날짜와 실제 방문일을 대조하세요. 계란후라이·라면 제공 조건은 현장 안내가 우선합니다.',
    question: '유모차나 휠체어로 같은 길을 이용할 수 있나요?',
    answer: '사진에 소개한 바깥 경로에는 계단이 있습니다. 이 경로를 무장애 동선으로 안내하지 않습니다. 엘리베이터 접근 경로와 출입 가능 여부는 건물 관리실이나 매장에 미리 확인해 주세요.',
    source: 'https://pf.kakao.com/_vKxgdn/posts', sourceLabel: '정담식당 공식 소식',
  },
} as const

export function renderVisitNotes(id: keyof typeof notes): string {
  const note = notes[id]
  return `<section class="my-10 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 space-y-5 text-base leading-relaxed text-slate-700" aria-labelledby="visit-notes-heading">
    <h2 id="visit-notes-heading" class="text-2xl font-bold text-slate-900">처음 방문할 때 확인할 순서</h2>
    <div><h3 class="font-bold text-slate-900">건물에서 식당 입구까지</h3><p>${note.route}</p></div>
    <div><h3 class="font-bold text-slate-900">결제와 배식</h3><p>${note.meal}</p></div>
    <div><h3 class="font-bold text-slate-900">사진과 오늘 정보 구분하기</h3><p>${note.caution}</p></div>
    <div><h3 class="font-bold text-slate-900">${note.question}</h3><p>${note.answer}</p></div>
    <aside class="border-t border-slate-200 pt-5 text-sm leading-relaxed">
      <p>센텀런치 편집 · 안내 본문 개정 2026-10-01</p>
      <p>이 안내는 운영자가 제공한 현장 사진과 공개 안내를 바탕으로 길 찾기·이용 순서를 정리한 비공식 안내입니다. 개정일은 가격·운영 시간을 현장에서 재확인한 날짜가 아닙니다. 촬영일이 확인되지 않은 사진은 촬영일 미상 자료로 사용하며, 사진 속 식단은 방문 동선 설명용 예시입니다.</p>
      <p>대기 시간, 주차 지원, 무장애 접근 등 확인되지 않은 조건은 단정하지 않습니다. 당일 메뉴·가격·휴무는 식당 공지와 현장 안내가 우선입니다.</p>
      <p><a class="underline" href="${note.source}" target="_blank" rel="noopener noreferrer">${note.sourceLabel}</a> · <a class="underline" href="/menu-policy.html">수집·정정 기준</a> · <a class="underline" href="mailto:${siteMeta.contactEmail}">잘못된 정보 제보</a></p>
    </aside>
  </section>`
}
