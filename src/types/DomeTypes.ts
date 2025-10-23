export interface DomeTypeConfig {
  id: string;
  name: string;
  description: string;
  healthMultiplier: number;
  movementMultiplier: number;
  baseHealth: number;
  baseMovement: number;
}

export const DOME_TYPES: Record<string, DomeTypeConfig> = {
  boomer: {
    id: "boomer",
    name: "Boomer",
    description: "Balanced stats - Jack of all trades",
    healthMultiplier: 1.0,
    movementMultiplier: 1.0,
    baseHealth: 100,
    baseMovement: 80,
  },
  yamazaki: {
    id: "yamazaki",
    name: "Yamazaki",
    description: "High mobility, lower health",
    healthMultiplier: 0.75,
    movementMultiplier: 2.0,
    baseHealth: 100,
    baseMovement: 80,
  },
  jagdpanzer: {
    id: "jagdpanzer",
    name: "Jagdpanzer",
    description: "Heavy armor, slow movement",
    healthMultiplier: 1.5,
    movementMultiplier: 0.2,
    baseHealth: 100,
    baseMovement: 80,
  },
};

export function getDomeStats(domeTypeId: string): {
  health: number;
  movement: number;
} {
  const config = DOME_TYPES[domeTypeId] || DOME_TYPES.boomer;
  return {
    health: Math.floor(config.baseHealth * config.healthMultiplier),
    movement: Math.floor(config.baseMovement * config.movementMultiplier),
  };
}

export function getDomeTypeConfig(domeTypeId: string): DomeTypeConfig {
  return DOME_TYPES[domeTypeId] || DOME_TYPES.boomer;
}
