export const partiboxGuidePagePath = '/partibox.html'

export const partiboxGuideContent = {
  title: '파티박스 식당 안내',
  subtitle: '동서대학교 센텀캠퍼스 · 지하 1층',
  intro:
    '파티박스는 동서대학교 센텀캠퍼스 지하 1층에 있는 한식 뷔페형 구내식당입니다. 외부인도 이용할 수 있으며, 토요일에도 영업합니다.',
  summary: {
    address: '부산 해운대구 센텀동로 55',
    floor: '지하 1층',
    hours: '11:10 – 14:00 (토요일 영업)',
    lunchPrice: '7,000원',
    notes: ['외부인 이용 가능', '반찬 20여 가지', '1인 1계란후라이', '어묵·국 제공'],
  },
  directions: {
    title: '식당 가는 길',
    steps: [
      {
        image: '/images/partibox/direction-1.png',
        caption: '1. 동서대학교 임권택영화영상예술대학 건물 앞 광장으로 이동합니다.',
      },
      {
        image: '/images/partibox/direction-2.png',
        caption: '2. 소향갤러리 표지판이 있는 계단·통로 쪽으로 들어갑니다.',
      },
      {
        image: '/images/partibox/direction-3.png',
        caption: '3. 유리 자동문 입구를 통해 건물 안으로 들어갑니다.',
      },
      {
        image: '/images/partibox/direction-4.png',
        caption: '4. 지하 1층 복도를 따라 이동하면 파티박스 입구(유리 파티션)가 보입니다.',
      },
    ],
  },
  tickets: {
    title: '식권 가격 및 이용 방법',
    intro: '입구 옆 무인 식권발매기에서 터치로 구매합니다. 신용카드·현금 모두 가능하며, 동백전 사용 및 포인트 적립이 됩니다.',
    prices: [
      { label: '식권 1매', amount: '7,000원' },
      { label: '식권 10매', amount: '70,000원' },
      { label: '식권 21매 (20+1)', amount: '140,000원' },
      { label: '식권 42매 (40+2)', amount: '280,000원' },
      { label: '식권 63매 (60+3)', amount: '420,000원' },
    ],
    images: [
      {
        image: '/images/partibox/ticket-1.png',
        caption: '식권발매기 — 카드·현금 결제, 동백전 사용 가능',
      },
      {
        image: '/images/partibox/ticket-2.png',
        caption: '터치 화면에서 수량 선택 후 결제',
      },
    ],
    tips: [
      '식권 발행 후 식권함에 식권만 넣어 주세요. (영수증은 넣지 않습니다)',
      '식권·영수증은 발매기 하단에서 나옵니다.',
    ],
  },
  interior: {
    title: '식당 전경',
    images: [
      {
        image: '/images/partibox/interior-1.png',
        caption: '식권함과 매점 카운터 — 식권을 넣은 뒤 뷔페 라인으로 이동합니다.',
      },
      {
        image: '/images/partibox/interior-2.png',
        caption: '뷔페 라인과 셀프 식기 구역 — 반찬·국·밥을 직접 담아 이용합니다.',
      },
    ],
  },
} as const
