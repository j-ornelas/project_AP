import { Dome } from "./entities/Dome";
import { Terrain } from "./entities/Terrain";
import { GameStartData, NetworkPlayer } from "../network/NetworkManager";

export class GameState {
  currentPlayer: number = 1;
  projectileInFlight: boolean = false;
  domes: Dome[] = [];
  terrain: Terrain;
  players: NetworkPlayer[] = [];
  windSpeed: number = 0; // Current wind (-100 to 100)
  playerLastWinds: Map<number, number> = new Map(); // Each player's previous wind

  constructor(gameData?: GameStartData) {
    this.terrain = new Terrain();

    if (gameData) {
      this.initializeFromNetwork(gameData);
    } else {
      this.reset();
    }
  }

  private initializeFromNetwork(gameData: GameStartData): void {
    this.players = gameData.players;
    this.currentPlayer = gameData.currentPlayer;
    this.windSpeed = gameData.windSpeed;
    this.playerLastWinds = new Map(gameData.playerLastWinds);

    // Set terrain from server
    this.terrain.setFromArray(gameData.terrain);

    // Create domes from player data
    this.domes = gameData.players.map((player) => {
      const dome = new Dome(
        player.playerNumber,
        player.position?.x || 0,
        player.position?.y || 0,
        player.color,
        80 // Default movement range
      );
      dome.health = player.health || 100;
      return dome;
    });

    console.log("Game initialized with network data", {
      players: this.players,
      currentPlayer: this.currentPlayer,
      windSpeed: this.windSpeed,
    });
  }

  reset(): void {
    this.currentPlayer = 1;
    this.projectileInFlight = false;

    // Create two domes (players) at opposite ends with movement range
    this.domes = [
      new Dome(1, 200, 0, "#4CAF50", 80),
      new Dome(2, 1000, 0, "#2196F3", 80),
    ];

    // Generate terrain
    this.terrain.generate(1200);

    // Place domes on terrain
    this.domes.forEach((dome) => {
      dome.y = this.terrain.getHeight(dome.x);
    });
  }

  getCurrentDome(): Dome | undefined {
    return this.domes[this.currentPlayer - 1];
  }

  nextTurn(): void {
    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
  }

  canDomeMove(
    domeIndex: number,
    direction: number,
    distance: number = 2
  ): { canMove: boolean; reason?: string } {
    const dome = this.domes[domeIndex];
    if (!dome) return { canMove: false, reason: "Dome not found" };

    if (dome.movementPointsRemaining <= 0) {
      return { canMove: false, reason: "No movement points remaining" };
    }

    // Calculate proposed new position (small incremental move)
    const proposedX = dome.x + direction * distance;

    // Check if out of bounds
    if (proposedX < 50 || proposedX > this.terrain.points.length - 50) {
      return { canMove: false, reason: "Cannot move off edge" };
    }

    // For small movements, just check immediate terrain steepness
    const currentX = Math.floor(dome.x);
    const nextX = Math.floor(proposedX);

    if (
      currentX !== nextX &&
      nextX >= 0 &&
      nextX < this.terrain.points.length
    ) {
      const currentHeight = this.terrain.points[currentX] || 0;
      const nextHeight = this.terrain.points[nextX] || 0;
      const heightDiff = Math.abs(nextHeight - currentHeight);
      const angle =
        Math.atan(heightDiff / Math.abs(distance)) * (180 / Math.PI);

      // Block if terrain is too steep
      if (angle > 70) {
        return { canMove: false, reason: "Terrain too steep" };
      }
    }

    return { canMove: true };
  }

  moveDome(
    domeIndex: number,
    direction: number,
    distance: number = 2
  ): boolean {
    const moveCheck = this.canDomeMove(domeIndex, direction, distance);
    if (!moveCheck.canMove) {
      return false;
    }

    const dome = this.domes[domeIndex];
    const newX = dome.x + direction * distance;

    // Update dome position
    dome.x = newX;

    // Adjust Y position to sit on terrain
    dome.y = this.terrain.getHeight(newX);

    // Deduct movement points
    dome.movementPointsRemaining = Math.max(
      0,
      dome.movementPointsRemaining - distance
    );

    return true;
  }

  resetTurnFlags(): void {
    // Reset movement points at the start of each turn
    this.domes.forEach((dome) => {
      dome.resetMovementPoints();
    });
  }

  getTerrainHeight(x: number): number {
    return this.terrain.getHeight(x);
  }

  createCrater(x: number): void {
    this.terrain.createCrater(x, 50); // Crater radius of 50 pixels
  }

  checkDomeHit(projectileX: number): { damage: number; hitPlayerId?: string } {
    let totalDamage = 0;
    let hitPlayerId: string | undefined;

    this.domes.forEach((dome, index) => {
      const distance = Math.abs(dome.x - projectileX);

      if (distance < 60) {
        // Direct hit radius
        const damage = Math.max(20, 50 - distance);
        dome.takeDamage(damage);
        totalDamage += damage;

        // Get the player ID that was hit
        if (this.players[index]) {
          hitPlayerId = this.players[index].id;
        }

        if (dome.health <= 0) {
          console.log(`Player ${dome.playerId} has been destroyed!`);
        }
      }
    });

    return { damage: totalDamage, hitPlayerId };
  }

  updateFromNetwork(data: {
    currentPlayer: number;
    players: NetworkPlayer[];
    terrain: number[];
    windSpeed: number;
    playerLastWinds: [number, number][];
  }): void {
    this.currentPlayer = data.currentPlayer;
    this.players = data.players;
    this.windSpeed = data.windSpeed;
    this.playerLastWinds = new Map(data.playerLastWinds);

    // Update terrain
    this.terrain.setFromArray(data.terrain);

    // Update dome health and positions
    data.players.forEach((player) => {
      const domeIndex = player.playerNumber - 1;
      if (this.domes[domeIndex]) {
        this.domes[domeIndex].health = player.health || 100;
        if (player.position) {
          this.domes[domeIndex].x = player.position.x;
          this.domes[domeIndex].y = player.position.y;
        }
      }
    });

    this.projectileInFlight = false;
  }

  isLocalPlayerTurn(localPlayerId: string): boolean {
    const localPlayer = this.players.find((p) => p.id === localPlayerId);
    if (!localPlayer) return false;
    return localPlayer.playerNumber === this.currentPlayer;
  }

  updateUI(localPlayerId: string): void {
    // Rebuild player display dynamically
    const playersDisplay = document.getElementById("players-display");
    if (playersDisplay) {
      playersDisplay.innerHTML = "";

      this.players.forEach((player) => {
        const isCurrentTurn = player.playerNumber === this.currentPlayer;
        const isAlive = (player.health || 0) > 0;

        const playerCard = document.createElement("div");
        playerCard.className = `player-card ${
          isCurrentTurn ? "current-turn" : ""
        }`;
        playerCard.id = `player${player.playerNumber}-card`;

        if (!isAlive) {
          playerCard.style.opacity = "0.4";
        }

        const healthPercent = player.health || 0;
        let healthColor = "linear-gradient(90deg, #4CAF50, #45a049)";
        if (healthPercent <= 25) {
          healthColor = "linear-gradient(90deg, #F44336, #D32F2F)";
        } else if (healthPercent <= 50) {
          healthColor = "linear-gradient(90deg, #FF9800, #F57C00)";
        }

        playerCard.innerHTML = `
          <div class="player-name" style="color: ${player.color}">${player.name}</div>
          <div class="player-health-bar">
            <div class="health-fill" style="width: ${healthPercent}%; background: ${healthColor}"></div>
          </div>
        `;

        playersDisplay.appendChild(playerCard);
      });
    }

    // Update wind display
    this.updateWindDisplay(localPlayerId);

    // Update turn indicator
    const isMyTurn = this.isLocalPlayerTurn(localPlayerId);
    const turnIndicator = document.getElementById("turn-indicator");
    const turnMessage = document.getElementById("turn-message");
    const controls = document.getElementById("controls");

    if (turnIndicator && turnMessage && controls) {
      if (isMyTurn) {
        turnIndicator.classList.add("your-turn");
        turnMessage.textContent = "🎯 Your Turn!";
        controls.style.display = "block";
      } else {
        const currentPlayerData = this.players.find(
          (p) => p.playerNumber === this.currentPlayer
        );
        turnIndicator.classList.remove("your-turn");
        turnMessage.textContent = currentPlayerData
          ? `Waiting for ${currentPlayerData.name}...`
          : "Waiting for opponent...";
        controls.style.display = "none";
      }
    }
  }

  private updateWindDisplay(localPlayerId: string): void {
    const currentWindElement = document.getElementById("current-wind");
    const lastWindElement = document.getElementById("last-wind");

    if (currentWindElement) {
      const windText = this.formatWind(this.windSpeed);
      currentWindElement.textContent = windText;

      // Update color class
      currentWindElement.className = "wind-value";
      if (this.windSpeed < -10) {
        currentWindElement.classList.add("wind-left");
      } else if (this.windSpeed > 10) {
        currentWindElement.classList.add("wind-right");
      } else {
        currentWindElement.classList.add("wind-none");
      }
    }

    if (lastWindElement) {
      // Get local player's number
      const localPlayer = this.players.find((p) => p.id === localPlayerId);
      if (localPlayer) {
        const lastWind = this.playerLastWinds.get(localPlayer.playerNumber);
        if (lastWind !== undefined) {
          const windText = this.formatWind(lastWind);
          lastWindElement.textContent = windText;

          // Update color class
          lastWindElement.className = "wind-value";
          if (lastWind < -10) {
            lastWindElement.classList.add("wind-left");
          } else if (lastWind > 10) {
            lastWindElement.classList.add("wind-right");
          } else {
            lastWindElement.classList.add("wind-none");
          }
        } else {
          lastWindElement.textContent = "N/A";
          lastWindElement.className = "wind-value wind-none";
        }
      }
    }
  }

  private formatWind(windSpeed: number): string {
    const absWind = Math.abs(windSpeed);
    if (windSpeed < -10) {
      return `← ${absWind}`;
    } else if (windSpeed > 10) {
      return `${absWind} →`;
    } else {
      return "~ 0 ~";
    }
  }
}
