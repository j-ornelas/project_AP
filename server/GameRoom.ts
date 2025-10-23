export interface Player {
  id: string;
  name: string;
  color: string;
  playerNumber: number;
  health?: number;
  position?: { x: number; y: number };
}

export class GameRoom {
  roomId: string;
  players: Player[] = [];
  currentPlayer: number = 1;
  terrain: number[] = [];
  domePositions: { x: number; y: number }[] = [];
  maxPlayers: number;

  constructor(roomId: string, maxPlayers: number = 2) {
    this.roomId = roomId;
    this.maxPlayers = maxPlayers;
    this.generateTerrain();
  }

  private generateTerrain(): void {
    // Generate simple rolling hills
    const width = 1200;
    const baseHeight = 500;
    const amplitude = 100;
    const frequency = 0.01;

    for (let x = 0; x < width; x++) {
      const y =
        baseHeight +
        Math.sin(x * frequency) * amplitude +
        Math.sin(x * frequency * 2) * (amplitude / 2) +
        Math.sin(x * frequency * 0.5) * (amplitude / 3);

      this.terrain.push(y);
    }

    // Set dome positions dynamically based on player count
    this.domePositions = this.calculateDomePositions(width);
  }

  private calculateDomePositions(width: number): { x: number; y: number }[] {
    const positions: { x: number; y: number }[] = [];
    const margin = 100; // Distance from edges
    const usableWidth = width - 2 * margin;

    // Distribute domes evenly across the terrain
    for (let i = 0; i < this.maxPlayers; i++) {
      const x = margin + (i * usableWidth) / (this.maxPlayers - 1);
      const xRounded = Math.round(x);
      positions.push({
        x: xRounded,
        y: this.terrain[xRounded] || 500,
      });
    }

    return positions;
  }

  addPlayer(player: Player): void {
    const position = this.domePositions[this.players.length];
    this.players.push({
      ...player,
      health: 100,
      position,
    });
  }

  hasPlayer(playerId: string): boolean {
    return this.players.some((p) => p.id === playerId);
  }

  damagePlayer(playerId: string, damage: number): void {
    const player = this.players.find((p) => p.id === playerId);
    if (player && player.health !== undefined) {
      player.health = Math.max(0, player.health - damage);
    }
  }

  addCrater(x: number): void {
    const centerX = Math.floor(x);
    const radius = 50;
    const startX = Math.max(0, Math.floor(centerX - radius));
    const endX = Math.min(this.terrain.length - 1, Math.ceil(centerX + radius));

    for (let i = startX; i <= endX; i++) {
      const distance = Math.abs(i - centerX);
      const normalizedDistance = distance / radius;

      if (normalizedDistance <= 1) {
        const depth = (Math.cos(normalizedDistance * Math.PI) + 1) / 2;
        const craterDepth = depth * radius * 0.8;
        this.terrain[i] += craterDepth;
      }
    }
  }

  nextTurn(): void {
    this.currentPlayer = (this.currentPlayer % this.maxPlayers) + 1;
  }

  checkWinner(): Player | null {
    const alivePlayers = this.players.filter((p) => (p.health ?? 0) > 0);
    if (alivePlayers.length === 1) {
      return alivePlayers[0];
    }
    return null;
  }
}
