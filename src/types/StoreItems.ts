export type ItemCategory = "offensive" | "defensive";

export interface StoreItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  category: ItemCategory;
  icon: string;
}

export const STORE_ITEMS: Record<string, StoreItem> = {
  // Defensive Items
  shield: {
    id: "shield",
    name: "Shield",
    description:
      "Absorbs the next hit completely. No damage or terrain change.",
    cost: 300,
    category: "defensive",
    icon: "🛡️",
  },
  repair: {
    id: "repair",
    name: "Repair Kit",
    description: "Restore 30 HP immediately.",
    cost: 200,
    category: "defensive",
    icon: "🔧",
  },
  targeting_computer: {
    id: "targeting_computer",
    name: "Targeting Computer",
    description: "Sets wind to your previous turn's wind value.",
    cost: 100,
    category: "defensive",
    icon: "🎯",
  },

  // Offensive Items
  spread: {
    id: "spread",
    name: "Spread Shot",
    description: "Fire 3 projectiles that spread out.",
    cost: 300,
    category: "offensive",
    icon: "💥",
  },
  nuke: {
    id: "nuke",
    name: "Nuke",
    description: "3x damage radius, 2x damage dealt.",
    cost: 500,
    category: "offensive",
    icon: "☢️",
  },
  digger: {
    id: "digger",
    name: "Digger",
    description: "Drills 3x deeper into terrain.",
    cost: 200,
    category: "offensive",
    icon: "⛏️",
  },
};

export interface ActiveItems {
  offensive: string | null;
  defensive: string | null;
}

export function getItemsByCategory(category: ItemCategory): StoreItem[] {
  return Object.values(STORE_ITEMS).filter(
    (item) => item.category === category
  );
}

export function getItem(itemId: string): StoreItem | undefined {
  return STORE_ITEMS[itemId];
}
