import { io, Socket } from "socket.io-client";

export interface NetworkPlayer {
  id: string;
  name: string;
  color: string;
  playerNumber: number;
  health?: number;
  position?: { x: number; y: number };
  domeType?: string;
}

export interface GameStartData {
  roomId: string;
  players: NetworkPlayer[];
  terrain: number[];
  currentPlayer: number;
  windSpeed: number;
  playerLastWinds: [number, number][];
}

export class NetworkManager {
  private socket: Socket;
  private roomId: string | null = null;
  private localPlayerId: string | null = null;

  // Callbacks
  public onWaiting?: (currentPlayers: number, totalPlayers: number) => void;
  public onGameStart?: (data: GameStartData) => void;
  public onShotFired?: (data: {
    playerId: string;
    power: number;
    angle: number;
  }) => void;
  public onTurnChange?: (data: {
    currentPlayer: number;
    players: NetworkPlayer[];
    terrain: number[];
    windSpeed: number;
    playerLastWinds: [number, number][];
  }) => void;
  public onDomeMove?: (data: {
    playerId: string;
    playerNumber: number;
    newX: number;
    newY: number;
  }) => void;
  public onGameOver?: (data: { winner: NetworkPlayer }) => void;
  public onOpponentDisconnected?: () => void;

  constructor() {
    // Use environment variable for server URL, fallback to localhost for development
    const serverUrl =
      import.meta.env.VITE_SERVER_URL || "http://localhost:3001";
    this.socket = io(serverUrl);
    this.setupListeners();
  }

  private setupListeners(): void {
    this.socket.on("connect", () => {
      console.log("Connected to game server");
      this.localPlayerId = this.socket.id || null;
    });

    this.socket.on(
      "waiting",
      (data: { currentPlayers: number; totalPlayers: number }) => {
        console.log(
          `Waiting for players... (${data.currentPlayers}/${data.totalPlayers})`
        );
        this.onWaiting?.(data.currentPlayers, data.totalPlayers);
      }
    );

    this.socket.on("gameStart", (data: GameStartData) => {
      console.log("Game starting!", data);
      this.roomId = data.roomId;
      this.onGameStart?.(data);
    });

    this.socket.on("shotFired", (data) => {
      console.log("Shot fired by", data.playerId);
      this.onShotFired?.(data);
    });

    this.socket.on("turnChange", (data) => {
      console.log("Turn changed to player", data.currentPlayer);
      this.onTurnChange?.(data);
    });

    this.socket.on("domeMove", (data) => {
      console.log("Dome moved by player", data.playerNumber);
      this.onDomeMove?.(data);
    });

    this.socket.on("gameOver", (data) => {
      console.log("Game over! Winner:", data.winner);
      this.onGameOver?.(data);
    });

    this.socket.on("opponentDisconnected", () => {
      console.log("Opponent disconnected");
      this.onOpponentDisconnected?.();
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });
  }

  joinGame(
    playerName: string,
    playerColor: string,
    playerCount: number,
    domeType: string
  ): void {
    this.socket.emit("joinGame", {
      playerName,
      playerColor,
      playerCount,
      domeType,
    });
  }

  fire(power: number, angle: number): void {
    if (!this.roomId) return;
    this.socket.emit("fire", { roomId: this.roomId, power, angle });
  }

  reportDomeMove(playerNumber: number, newX: number, newY: number): void {
    if (!this.roomId) return;
    this.socket.emit("domeMove", {
      roomId: this.roomId,
      playerNumber,
      newX,
      newY,
    });
  }

  reportImpact(
    x: number,
    _y: number,
    damage: number,
    hitPlayerId?: string
  ): void {
    if (!this.roomId) return;
    this.socket.emit("projectileImpact", {
      roomId: this.roomId,
      x,
      damage,
      hitPlayerId,
    });
  }

  getLocalPlayerId(): string | null {
    return this.localPlayerId;
  }

  disconnect(): void {
    this.socket.disconnect();
  }
}
