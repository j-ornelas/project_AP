import { Game } from "./game/Game";
import "./styles/main.css";

// Initialize the game when DOM is loaded
window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;

  if (!canvas) {
    console.error("Canvas element not found!");
    return;
  }

  // Create and start the game
  const game = new Game(canvas);
  game.start();

  // Handle window resize
  window.addEventListener("resize", () => {
    game.resize();
  });
});
