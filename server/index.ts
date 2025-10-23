import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { GameRoom } from "./GameRoom.js";

const app = express();
const httpServer = createServer(app);

// Use environment variable for client URL, fallback to localhost for development
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const PORT = process.env.PORT || 3001;

// Store active game rooms
const gameRooms = new Map<string, GameRoom>();

// Store waiting players grouped by desired player count
const waitingLobbies = new Map<
  number,
  Array<{ socketId: string; name: string; color: string; domeType: string }>
>();

io.on("connection", (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Player joins with their name, color, and desired player count
  socket.on(
    "joinGame",
    ({ playerName, playerColor, playerCount, domeType }) => {
      // Server-side input validation and sanitization
      const sanitizedName = (playerName || "Player")
        .toString()
        .trim()
        .substring(0, 20)
        .replace(/[<>]/g, ""); // Remove < and > to prevent HTML injection

      const sanitizedColor = /^#[0-9A-Fa-f]{6}$/.test(playerColor)
        ? playerColor
        : "#4CAF50";

      const validDomeTypes = ["boomer", "yamazaki", "jagdpanzer"];
      const sanitizedDomeType = validDomeTypes.includes(domeType)
        ? domeType
        : "boomer";

      console.log(
        `${sanitizedName} (${socket.id}) wants to join a ${playerCount}-player game with ${sanitizedDomeType}`
      );

      // Validate player count
      if (playerCount < 2 || playerCount > 6) {
        socket.emit("error", {
          message: "Invalid player count. Must be between 2 and 6.",
        });
        return;
      }

      socket.data.playerName = sanitizedName;
      socket.data.playerColor = sanitizedColor;
      socket.data.desiredPlayerCount = playerCount;
      socket.data.domeType = sanitizedDomeType;

      // Get or create lobby for this player count
      if (!waitingLobbies.has(playerCount)) {
        waitingLobbies.set(playerCount, []);
      }

      const lobby = waitingLobbies.get(playerCount)!;

      // Add player to lobby
      lobby.push({
        socketId: socket.id,
        name: sanitizedName,
        color: sanitizedColor,
        domeType: sanitizedDomeType,
      });

      console.log(
        `Lobby for ${playerCount} players now has ${lobby.length} waiting`
      );

      // Notify all players in this lobby about the current count
      lobby.forEach((player) => {
        const playerSocket = io.sockets.sockets.get(player.socketId);
        if (playerSocket) {
          playerSocket.emit("waiting", {
            currentPlayers: lobby.length,
            totalPlayers: playerCount,
          });
        }
      });

      // Check if we have enough players to start a game
      if (lobby.length >= playerCount) {
        // Take the required number of players from the lobby
        const gamePlayers = lobby.splice(0, playerCount);

        // Create a new game room
        const roomId = `game-${Date.now()}-${playerCount}p`;
        const gameRoom = new GameRoom(roomId, playerCount);

        // Add players to the room
        gamePlayers.forEach((player, index) => {
          const playerSocket = io.sockets.sockets.get(player.socketId);
          if (playerSocket) {
            // Calculate health based on dome type
            let health = 100;
            const domeType = player.domeType || "boomer";
            if (domeType === "yamazaki") {
              health = 75;
            } else if (domeType === "jagdpanzer") {
              health = 150;
            }

            const playerData = {
              id: player.socketId,
              name: player.name,
              color: player.color,
              playerNumber: index + 1,
              health: health,
              domeType: domeType,
            };

            gameRoom.addPlayer(playerData);
            playerSocket.join(roomId);
          }
        });

        gameRooms.set(roomId, gameRoom);

        // Notify all players that the game is starting
        io.to(roomId).emit("gameStart", {
          roomId,
          players: gameRoom.players,
          terrain: gameRoom.terrain,
          currentPlayer: 1,
          windSpeed: gameRoom.windSpeed,
          playerLastWinds: Array.from(gameRoom.playerLastWinds.entries()),
        });

        console.log(`Game started: ${roomId} with ${playerCount} players`);
      }
    }
  );

  // Player fires a shot
  socket.on("fire", ({ roomId, power, angle }) => {
    const gameRoom = gameRooms.get(roomId);
    if (!gameRoom) return;

    // Broadcast the shot to all players in the room
    io.to(roomId).emit("shotFired", {
      playerId: socket.id,
      power,
      angle,
    });
  });

  // Player moves their dome
  socket.on("domeMove", ({ roomId, playerNumber, newX, newY }) => {
    const gameRoom = gameRooms.get(roomId);
    if (!gameRoom) return;

    // Update dome position in game room
    const player = gameRoom.players.find(
      (p) => p.playerNumber === playerNumber
    );
    if (player && player.position) {
      player.position.x = newX;
      player.position.y = newY;
    }

    // Broadcast the movement to all players in the room
    io.to(roomId).emit("domeMove", {
      playerId: socket.id,
      playerNumber,
      newX,
      newY,
    });
  });

  // Projectile impact (sent by the client who calculated it)
  socket.on("projectileImpact", ({ roomId, x, damage, hitPlayerId }) => {
    const gameRoom = gameRooms.get(roomId);
    if (!gameRoom) return;

    // Update game state
    if (hitPlayerId && damage > 0) {
      gameRoom.damagePlayer(hitPlayerId, damage);
    }

    // Update terrain with crater
    gameRoom.addCrater(x);

    // Check for winner
    const winner = gameRoom.checkWinner();
    if (winner) {
      io.to(roomId).emit("gameOver", { winner });
      gameRooms.delete(roomId);
      return;
    }

    // Switch turns
    gameRoom.nextTurn();

    // Broadcast updated game state
    io.to(roomId).emit("turnChange", {
      currentPlayer: gameRoom.currentPlayer,
      players: gameRoom.players,
      terrain: gameRoom.terrain,
      windSpeed: gameRoom.windSpeed,
      playerLastWinds: Array.from(gameRoom.playerLastWinds.entries()),
    });
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`Player disconnected: ${socket.id}`);

    // Remove from waiting lobbies
    waitingLobbies.forEach((lobby, playerCount) => {
      const index = lobby.findIndex((p) => p.socketId === socket.id);
      if (index > -1) {
        lobby.splice(index, 1);
        console.log(`Removed ${socket.id} from ${playerCount}-player lobby`);

        // Update remaining players in lobby
        lobby.forEach((player) => {
          const playerSocket = io.sockets.sockets.get(player.socketId);
          if (playerSocket) {
            playerSocket.emit("waiting", {
              currentPlayers: lobby.length,
              totalPlayers: playerCount,
            });
          }
        });
      }
    });

    // Find and end any active games
    for (const [roomId, gameRoom] of gameRooms.entries()) {
      if (gameRoom.hasPlayer(socket.id)) {
        io.to(roomId).emit("opponentDisconnected");
        gameRooms.delete(roomId);
        break;
      }
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`🎮 Game server running on http://localhost:${PORT}`);
});
