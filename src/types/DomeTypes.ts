export interface DomeTypeConfig {
  id: string;
  name: string;
  description: string;
  healthMultiplier: number;
  movementMultiplier: number;
  goldMultiplier: number;
  baseHealth: number;
  baseMovement: number;
  baseGoldPerTurn: number;
}

export const DOME_TYPES: Record<string, DomeTypeConfig> = {
  boomer: {
    id: "boomer",
    name: "Boomer",
    description: "Balanced stats - Jack of all trades",
    healthMultiplier: 1.0,
    movementMultiplier: 1.0,
    goldMultiplier: 1.0,
    baseHealth: 100,
    baseMovement: 80,
    baseGoldPerTurn: 100,
  },
  yamazaki: {
    id: "yamazaki",
    name: "Yamazaki",
    description: "High mobility, lower health",
    healthMultiplier: 0.75,
    movementMultiplier: 2.0,
    goldMultiplier: 1.0,
    baseHealth: 100,
    baseMovement: 80,
    baseGoldPerTurn: 100,
  },
  jagdpanzer: {
    id: "jagdpanzer",
    name: "Jagdpanzer",
    description: "Heavy armor, slow movement",
    healthMultiplier: 1.5,
    movementMultiplier: 0.2,
    goldMultiplier: 1.0,
    baseHealth: 100,
    baseMovement: 80,
    baseGoldPerTurn: 100,
  },
  char: {
    id: "char",
    name: "Char",
    description: "Glass cannon - High income, low health",
    healthMultiplier: 0.2,
    movementMultiplier: 1.0,
    goldMultiplier: 2.5,
    baseHealth: 100,
    baseMovement: 80,
    baseGoldPerTurn: 100,
  },
};

export function getDomeStats(domeTypeId: string): {
  health: number;
  movement: number;
  goldPerTurn: number;
} {
  const config = DOME_TYPES[domeTypeId] || DOME_TYPES.boomer;
  return {
    health: Math.floor(config.baseHealth * config.healthMultiplier),
    movement: Math.floor(config.baseMovement * config.movementMultiplier),
    goldPerTurn: Math.floor(config.baseGoldPerTurn * config.goldMultiplier),
  };
}

export function getDomeTypeConfig(domeTypeId: string): DomeTypeConfig {
  return DOME_TYPES[domeTypeId] || DOME_TYPES.boomer;
}
