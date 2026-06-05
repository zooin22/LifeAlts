export type ShopItemKind = 'consumable' | 'title';

export interface ShopItem {
  id: string;
  kind: ShopItemKind;
  name: string;
  icon: string;
  desc: string;
  cost: number;
}

/**
 * 상점 아이템 — 금화 소비처(기획서 2단계: 꾸미기·스트릭 복구권).
 * - consumable: 스트릭 복구권 (보유 개수로 관리)
 * - title: 칭호 (구매 시 보유, 착용하면 홈 이름 앞에 표시)
 */
export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'freeze',
    kind: 'consumable',
    name: '스트릭 복구권',
    icon: '🧊',
    desc: '하루 빠져도 연속 기록을 지켜줘요',
    cost: 30,
  },
  {
    id: 'title_diligent',
    kind: 'title',
    name: '성실한',
    icon: '🌱',
    desc: '이름 앞에 붙는 칭호',
    cost: 50,
  },
  {
    id: 'title_unyielding',
    kind: 'title',
    name: '불굴의',
    icon: '🔥',
    desc: '이름 앞에 붙는 칭호',
    cost: 120,
  },
  {
    id: 'title_legend',
    kind: 'title',
    name: '전설의',
    icon: '👑',
    desc: '이름 앞에 붙는 칭호',
    cost: 300,
  },
];

export const SHOP_ITEM_MAP: Record<string, ShopItem> = Object.fromEntries(
  SHOP_ITEMS.map((i) => [i.id, i]),
);
