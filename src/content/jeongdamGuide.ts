export const jeongdamGuidePagePath = '/jeongdam.html'

export const jeongdamGuideContent = {
  title: '정담식당 센텀점 안내',
  subtitle: '센텀스카이비즈 · 지하 1층',
  intro:
    '정담식당 센텀점은 센텀스카이비즈 지하 1층에 있는 가정식 셀프 백반 식당입니다. 건물 진입부터 식당 입구까지 사진으로 차례대로 확인하고, 점심 가격과 이용 정보를 함께 살펴보세요.',
  summary: {
    address: '부산 해운대구 센텀중앙로 97',
    floor: '지하 1층',
    hours: '점심 11:00 – 14:00',
    lunchPrice: '7,500원',
    notes: ['가정식 셀프 백반', '한식 뷔페', '셀프 계란후라이', '셀프 라면'],
  },
  directions: {
    title: '사진으로 보는 식당 가는 길',
    intro:
      '센텀스카이비즈 건물 바깥의 지하 계단을 이용하면 지하 1층 식당가로 바로 이동할 수 있습니다. 아래 사진의 표지와 출입구를 순서대로 따라가세요.',
    steps: [
      {
        image: '/images/jeongdam/building-stairs.webp',
        caption: '1. 센텀스카이비즈 건물 측면의 지하로 내려가는 계단을 찾습니다.',
      },
      {
        image: '/images/jeongdam/b1-exit-6.webp',
        caption: '2. 계단 아래 지하 1층 6번 출입구로 들어갑니다.',
      },
      {
        image: '/images/jeongdam/corridor.webp',
        caption: '3. 출입구 안쪽 복도를 따라 이동하면 정담식당 간판이 보입니다.',
      },
      {
        image: '/images/jeongdam/restaurant-sign.webp',
        caption: '4. 세로형 정담 배너와 당일 메뉴판이 놓인 입구를 확인하세요.',
      },
      {
        image: '/images/jeongdam/restaurant-entrance.webp',
        caption: '5. 정담 간판 아래 유리문이 식당 입구입니다.',
      },
    ],
  },
  dining: {
    title: '식당 내부와 이용 방식',
    intro:
      '매장 안쪽에 밥·국·반찬이 놓인 셀프 배식대가 마련되어 있습니다. 현장 안내에 따라 원하는 메뉴를 담아 이용하면 됩니다.',
    images: [
      {
        image: '/images/jeongdam/interior-buffet.webp',
        caption: '정담식당 내부 전경과 셀프 배식대 모습입니다.',
      },
    ],
  },
  tips: {
    title: '방문 전 알아두면 좋은 점',
    items: [
      '점심 이용 가격은 7,500원입니다. 가격과 운영 시간은 현장 사정에 따라 달라질 수 있습니다.',
      '계란후라이와 라면은 추가요금 없이 셀프로 이용할 수 있습니다.',
      '당일 메뉴는 식당 입구 메뉴판과 공식 카카오채널에서 확인할 수 있습니다.',
      '사진 속 메뉴판은 촬영일 기준 예시이며 실제 방문일의 식단과 다를 수 있습니다.',
    ],
  },
  menuUrl: 'https://pf.kakao.com/_vKxgdn/posts',
} as const
