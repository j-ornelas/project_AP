export class LobbyScreen {
  private container: HTMLElement;
  private onJoinCallback?: (
    name: string,
    color: string,
    playerCount: number
  ) => void;

  constructor() {
    this.container = this.createUI();
    document.body.appendChild(this.container);
  }

  private createUI(): HTMLElement {
    const lobby = document.createElement("div");
    lobby.id = "lobby-screen";
    lobby.innerHTML = `
      <div class="lobby-content">
        <h1>Project AP</h1>
        <p class="subtitle">Multiplayer Artillery Game</p>
        
        <div class="lobby-form">
          <div class="form-group">
            <label for="player-name">Your Name:</label>
            <input type="text" id="player-name" maxlength="20" placeholder="Enter your name" value="Player">
          </div>
          
          <div class="form-group">
            <label>Choose Your Color:</label>
            <div class="color-picker">
              <button class="color-btn" data-color="#4CAF50" style="background: #4CAF50"></button>
              <button class="color-btn" data-color="#2196F3" style="background: #2196F3"></button>
              <button class="color-btn" data-color="#FF9800" style="background: #FF9800"></button>
              <button class="color-btn" data-color="#E91E63" style="background: #E91E63"></button>
              <button class="color-btn" data-color="#9C27B0" style="background: #9C27B0"></button>
              <button class="color-btn active" data-color="#F44336" style="background: #F44336"></button>
            </div>
          </div>
          
          <div class="form-group">
            <label for="player-count">Number of Players:</label>
            <div class="player-count-selector">
              <button class="count-btn" data-count="2">2</button>
              <button class="count-btn active" data-count="3">3</button>
              <button class="count-btn" data-count="4">4</button>
              <button class="count-btn" data-count="5">5</button>
              <button class="count-btn" data-count="6">6</button>
            </div>
          </div>
          
          <button id="join-game-btn" class="primary-btn">Find Game</button>
        </div>
        
        <div id="waiting-message" class="waiting-message" style="display: none;">
          <div class="spinner"></div>
          <p id="waiting-text">Searching for players...</p>
          <p id="waiting-count" class="waiting-count"></p>
        </div>
      </div>
    `;

    this.setupEventListeners(lobby);
    return lobby;
  }

  private setupEventListeners(lobby: HTMLElement): void {
    let selectedColor = "#F44336";
    let selectedPlayerCount = 3;

    // Color selection
    const colorButtons = lobby.querySelectorAll(".color-btn");
    colorButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        colorButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        selectedColor = btn.getAttribute("data-color") || "#F44336";
      });
    });

    // Player count selection
    const countButtons = lobby.querySelectorAll(".count-btn");
    countButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        countButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        selectedPlayerCount = parseInt(btn.getAttribute("data-count") || "3");
      });
    });

    // Join game button
    const joinBtn = lobby.querySelector("#join-game-btn") as HTMLButtonElement;
    const nameInput = lobby.querySelector("#player-name") as HTMLInputElement;

    joinBtn?.addEventListener("click", () => {
      const playerName = nameInput.value.trim() || "Player";
      this.onJoinCallback?.(playerName, selectedColor, selectedPlayerCount);
    });

    // Enter key to join
    nameInput?.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        joinBtn?.click();
      }
    });
  }

  showWaiting(currentPlayers?: number, totalPlayers?: number): void {
    const waitingMsg = this.container.querySelector(
      "#waiting-message"
    ) as HTMLElement;
    const form = this.container.querySelector(".lobby-form") as HTMLElement;
    const waitingCount = this.container.querySelector(
      "#waiting-count"
    ) as HTMLElement;

    if (waitingMsg) waitingMsg.style.display = "block";
    if (form) form.style.display = "none";

    if (
      waitingCount &&
      currentPlayers !== undefined &&
      totalPlayers !== undefined
    ) {
      waitingCount.textContent = `Waiting for players... (${currentPlayers}/${totalPlayers})`;
    }
  }

  hide(): void {
    this.container.style.display = "none";
  }

  show(): void {
    this.container.style.display = "flex";
  }

  onJoin(
    callback: (name: string, color: string, playerCount: number) => void
  ): void {
    this.onJoinCallback = callback;
  }

  destroy(): void {
    this.container.remove();
  }
}
