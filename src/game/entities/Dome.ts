import { ActiveItems } from "../../types/StoreItems";

export class Dome {
  playerId: number;
  x: number;
  y: number;
  radius: number = 40;
  health: number = 100;
  color: string;
  movementRange: number; // Maximum movement points per turn
  movementPointsRemaining: number; // Current movement points available this turn
  gold: number = 0; // Current gold balance
  goldPerTurn: number; // Gold earned at the start of each turn
  activeItems: ActiveItems = { offensive: null, defensive: null }; // Items purchased this turn
  hasShield: boolean = false; // Shield status

  constructor(
    playerId: number,
    x: number,
    y: number,
    color: string,
    movementRange: number = 80, // Default movement points per turn
    goldPerTurn: number = 100 // Default gold per turn
  ) {
    this.playerId = playerId;
    this.x = x;
    this.y = y;
    this.color = color;
    this.movementRange = movementRange;
    this.movementPointsRemaining = movementRange; // Start with full points
    this.goldPerTurn = goldPerTurn;
  }

  resetMovementPoints(): void {
    this.movementPointsRemaining = this.movementRange;
  }

  awardGold(): void {
    this.gold += this.goldPerTurn;
  }

  clearActiveItems(): void {
    this.activeItems = { offensive: null, defensive: null };
  }

  canMove(): boolean {
    return this.movementPointsRemaining > 0;
  }

  takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
  }

  isDestroyed(): boolean {
    return this.health <= 0;
  }
}
