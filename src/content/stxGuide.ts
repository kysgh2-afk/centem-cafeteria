export const stxGuidePagePath = '/stx.html'

export const stxGuideContent = {
  title: '영상산업센터 구내식당 안내',
  subtitle: '부산 영상산업센터 · 4층',
  intro:
    '영상산업센터 구내식당은 부산 해운대구 영상산업센터 4층에 있는 한식 뷔페형 구내식당입니다. 점심·저녁 모두 운영하며, 셀프라면·음료 등 부가 혜택이 있어 가성비가 좋은 편입니다.',
  summary: {
    address: '부산 해운대구 수영로 480',
    floor: '4층',
    hours: '점심 11:30 – 13:30 · 저녁 17:00 – 19:00',
    lunchPrice: '6,500원',
    dinnerPrice: '5,000원',
    notes: ['셀프라면 무료', '샐러드바·계란·음료', '식권 자동판매기 구매', '가성비 좋음'],
  },
  directions: {
    title: '식당 가는 길',
    intro: '영상산업센터 정문에서 엘리베이터를 타고 4층으로 올라가면 식당이 있습니다.',
    steps: [
      {
        image: '/images/stx/direction-1.png',
        caption: '1. 영상산업센터 정문(영상산업센터 표지판)으로 들어갑니다.',
      },
      {
        image: '/images/stx/direction-2.png',
        caption: '2. 로비 엘리베이터를 이용해 4층으로 이동합니다.',
      },
    ],
  },
  amenities: {
    title: '식당 내 편의시설',
    images: [
      {
        image: '/images/stx/coffee-machine.png',
        caption: '셀프 커피·음료 자판기 — 아메리카노, 라떼, 에이드 등 카드 결제로 이용할 수 있습니다.',
      },
    ],
  },
  interior: {
    title: '식당 전경',
    images: [
      {
        image: '/images/stx/interior-1.png',
        caption: '플러스 코너 — 구수한 숭늉과 추가 양념 코너가 마련되어 있습니다.',
      },
      {
        image: '/images/stx/interior-2.png',
        caption: 'FOOD SERVICE 뷔페 라인 — 반찬·국·밥을 직접 담아 이용합니다.',
      },
    ],
  },
  tickets: {
    title: '식권 가격 및 이용 방법',
    intro: '4층 식당 입구 옆 무인 식권발매기에서 터치로 구매합니다. 신용카드·현금 모두 가능합니다.',
    prices: [
      { label: '점심 식권 1매 (중식)', amount: '6,500원' },
      { label: '점심 식권 10매', amount: '65,000원' },
      { label: '점심 식권 20매', amount: '130,000원' },
      { label: '저녁 식권 1매 (석식)', amount: '5,000원' },
      { label: '저녁 식권 10매', amount: '50,000원' },
      { label: '저녁 식권 20매', amount: '100,000원' },
    ],
    images: [
      {
        image: '/images/stx/ticket-1.png',
        caption: '식권발매기 화면 — 중식(파란색)·석식(분홍색) 버튼으로 수량을 선택합니다.',
      },
    ],
    tips: [
      '식권과 영수증은 발매기 하단에서 나옵니다.',
      '식권 구매 후 뷔페 라인으로 이동해 식사하시면 됩니다.',
    ],
  },
} as const
