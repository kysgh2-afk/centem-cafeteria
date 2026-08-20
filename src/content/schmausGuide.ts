export const schmausGuidePagePath = '/schmaus.html'

export const schmausGuideContent = {
  title: '슈마우스 만찬 센텀점 안내',
  subtitle: '센텀스카이비즈 · 지하 1층 C-B105',
  intro:
    '슈마우스 만찬 센텀점은 센텀스카이비즈 지하 1층에 있는 한식 뷔페형 구내식당입니다. 식권을 결제한 뒤 뷔페 라인에서 원하는 만큼 담아 이용하며, 계란후라이와 보리차를 셀프로 즐길 수 있습니다.',
  summary: {
    address: '부산 해운대구 센텀중앙로 97',
    floor: '지하 1층 C-B105',
    hours: '점심 11:00 – 14:00',
    lunchPrice: '7,500원',
    notes: ['식권 10장 구매 시 1장 추가', '계란후라이 무료', '보리차 서비스', '한식 뷔페'],
  },
  directions: {
    title: '식당 가는 길',
    intro:
      '센텀스카이비즈 건물로 들어가 지하 1층(B1)으로 이동한 뒤, 층별 안내판에서 C-B105 슈마우스 만찬을 확인하세요.',
    steps: [
      {
        image: '/images/schmaus/building-exterior.webp',
        caption: '1. 센텀중앙로 97, 센텀스카이비즈 건물을 찾습니다.',
      },
      {
        image: '/images/schmaus/parking-entrance.webp',
        caption: '2. 차량 방문 시 건물 주차장 입구를 이용할 수 있습니다. 주차 가능 대수는 현장 전광판에서 확인하세요.',
      },
      {
        image: '/images/schmaus/building-stairs.webp',
        caption: '3. 건물 안에서 지하 1층(B1) 식당가 방향으로 이동합니다.',
      },
      {
        image: '/images/schmaus/b1-directory.webp',
        caption: '4. B1 층별 안내판에서 C-B105 「슈마우스 만찬」 위치를 확인합니다.',
      },
      {
        image: '/images/schmaus/restaurant-entrance.webp',
        caption: '5. 복도를 따라 이동하면 슈마우스 만찬 입구와 유리 파티션이 보입니다.',
      },
    ],
  },
  menu: {
    title: '오늘의 메뉴판',
    intro:
      '매장 입구 칠판에서 당일 메인 메뉴와 국·반찬 구성을 확인할 수 있습니다. 메뉴는 식재료 수급과 매장 사정에 따라 매일 달라질 수 있습니다.',
    image: '/images/schmaus/today-menu-board.webp',
    caption: '촬영일 기준 오늘의 라인업 안내판 — 방문 당일에는 입구 메뉴판을 다시 확인해 주세요.',
  },
  tickets: {
    title: '식권 결제 방식',
    intro:
      '입구 카운터에서 식권을 결제한 뒤 뷔페 라인을 이용합니다. 카드 결제와 계좌이체 안내가 있으며, 여러 번 이용한다면 10+1 묶음 식권을 구매할 수 있습니다.',
    prices: [
      { label: '식권 1장', amount: '7,500원' },
      { label: '식권 10장 + 1장 추가', amount: '75,000원' },
    ],
    image: '/images/schmaus/ticket-payment.webp',
    caption: '카운터 결제 안내 — 카드 결제 또는 계좌이체, 식권 10장 구매 시 1장 추가 제공',
    tips: [
      '식권 묶음 혜택과 결제 방식은 변경될 수 있으니 구매 전에 카운터에서 확인해 주세요.',
      '사진 속 계좌번호는 개인정보 보호를 위해 흐림 처리했습니다.',
    ],
  },
  services: {
    title: '무료 셀프 서비스',
    intro: '식사와 함께 계란후라이와 보리차를 추가 비용 없이 이용할 수 있습니다.',
    items: [
      {
        image: '/images/schmaus/free-egg.webp',
        title: '계란후라이 무료',
        caption: '셀프 계란후라이 코너가 마련되어 있습니다. 현장 안내에 따라 1인 제공 수량을 지켜 이용해 주세요.',
      },
      {
        image: '/images/schmaus/barley-tea.webp',
        title: '보리차 서비스',
        caption: '식당 안쪽 보리차 코너에서 종이컵과 함께 자유롭게 이용할 수 있습니다.',
      },
    ],
  },
  interior: {
    title: '매장 내부와 이용 동선',
    intro:
      '결제 후 뷔페 라인에서 밥·국·반찬을 담고 좌석을 이용합니다. 점심 피크 시간에는 대기 줄이 생길 수 있습니다.',
    images: [
      {
        image: '/images/schmaus/interior-buffet.webp',
        caption: '넓은 좌석과 중앙 뷔페 라인 — 밥·국·반찬을 셀프로 담아 이용합니다.',
      },
      {
        image: '/images/schmaus/interior-line.webp',
        caption: '점심시간 배식 동선 — 혼잡한 시간에는 줄을 따라 순서대로 이동하세요.',
      },
    ],
  },
} as const
