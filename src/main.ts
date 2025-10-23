import { Game } from "./game/Game";
import { NetworkManager, GameStartData } from "./network/NetworkManager";
import { LobbyScreen } from "./ui/LobbyScreen";
import "./styles/main.css";
import "./styles/lobby.css";

let game: Game | null = null;
let networkManager: NetworkManager | null = null;
let lobbyScreen: LobbyScreen | null = null;

// Initialize when DOM is loaded
window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;

  if (!canvas) {
    console.error("Canvas element not found!");
    return;
  }

  // Initialize network manager
  networkManager = new NetworkManager();

  // Show lobby screen
  lobbyScreen = new LobbyScreen();

  // Handle player joining
  lobbyScreen.onJoin((playerName, playerColor, playerCount, domeType) => {
    console.log(
      `${playerName} joining with color ${playerColor}, ${playerCount} players, ${domeType} dome`
    );
    networkManager?.joinGame(playerName, playerColor, playerCount, domeType);
  });

  // Handle waiting for opponent
  networkManager.onWaiting = (currentPlayers, totalPlayers) => {
    lobbyScreen?.showWaiting(currentPlayers, totalPlayers);
  };

  // Handle game start
  networkManager.onGameStart = (data: GameStartData) => {
    console.log("Game starting with data:", data);
    lobbyScreen?.hide();

    // Create and start the game with network data
    game = new Game(canvas, networkManager!, data);
    game.start();
  };

  // Handle opponent disconnect
  networkManager.onOpponentDisconnected = () => {
    alert("Your opponent disconnected!");
    location.reload();
  };

  // Handle window resize
  window.addEventListener("resize", () => {
    game?.resize();
  });
});
