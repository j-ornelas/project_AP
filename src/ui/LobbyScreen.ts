export class LobbyScreen {
  private container: HTMLElement;
  private onJoinCallback?: (
    name: string,
    color: string,
    playerCount: number,
    domeType: string
  ) => void;
  private readonly STORAGE_KEY_NAME = "projectAP_playerName";
  private readonly STORAGE_KEY_COLOR = "projectAP_playerColor";
  private readonly STORAGE_KEY_PLAYER_COUNT = "projectAP_playerCount";
  private readonly STORAGE_KEY_DOME_TYPE = "projectAP_domeType";

  constructor() {
    this.container = this.createUI();
    document.body.appendChild(this.container);
    this.loadSavedPreferences();
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
            <input type="text" id="player-name" maxlength="20" placeholder="Enter your name" value="">
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

          <div class="form-group">
            <label>Choose Your Dome:</label>
            <div class="dome-selector">
              <button class="dome-btn active" data-dome="boomer">
                <div class="dome-name">Boomer</div>
                <div class="dome-stats">
                  <span>❤️ 100</span>
                  <span>🏃 80</span>
                </div>
                <div class="dome-desc">Balanced</div>
              </button>
              <button class="dome-btn" data-dome="yamazaki">
                <div class="dome-name">Yamazaki</div>
                <div class="dome-stats">
                  <span>❤️ 75</span>
                  <span>🏃 160</span>
                </div>
                <div class="dome-desc">Fast & Agile</div>
              </button>
              <button class="dome-btn" data-dome="jagdpanzer">
                <div class="dome-name">Jagdpanzer</div>
                <div class="dome-stats">
                  <span>❤️ 150</span>
                  <span>🏃 16</span>
                </div>
                <div class="dome-desc">Heavy Tank</div>
              </button>
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
    let selectedDomeType = "boomer";

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

    // Dome type selection
    const domeButtons = lobby.querySelectorAll(".dome-btn");
    domeButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        domeButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        selectedDomeType = btn.getAttribute("data-dome") || "boomer";
      });
    });

    // Join game button
    const joinBtn = lobby.querySelector("#join-game-btn") as HTMLButtonElement;
    const nameInput = lobby.querySelector("#player-name") as HTMLInputElement;

    joinBtn?.addEventListener("click", () => {
      const playerName = nameInput.value.trim() || "Player";

      // Save preferences to localStorage
      this.savePreferences(
        playerName,
        selectedColor,
        selectedPlayerCount,
        selectedDomeType
      );

      this.onJoinCallback?.(
        playerName,
        selectedColor,
        selectedPlayerCount,
        selectedDomeType
      );
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
    callback: (
      name: string,
      color: string,
      playerCount: number,
      domeType: string
    ) => void
  ): void {
    this.onJoinCallback = callback;
  }

  destroy(): void {
    this.container.remove();
  }

  private savePreferences(
    name: string,
    color: string,
    playerCount: number,
    domeType: string
  ): void {
    try {
      localStorage.setItem(this.STORAGE_KEY_NAME, name);
      localStorage.setItem(this.STORAGE_KEY_COLOR, color);
      localStorage.setItem(
        this.STORAGE_KEY_PLAYER_COUNT,
        playerCount.toString()
      );
      localStorage.setItem(this.STORAGE_KEY_DOME_TYPE, domeType);
    } catch (error) {
      console.warn("Could not save preferences to localStorage:", error);
    }
  }

  private loadSavedPreferences(): void {
    try {
      const savedName = localStorage.getItem(this.STORAGE_KEY_NAME);
      const savedColor = localStorage.getItem(this.STORAGE_KEY_COLOR);
      const savedPlayerCount = localStorage.getItem(
        this.STORAGE_KEY_PLAYER_COUNT
      );

      // Load saved name
      if (savedName) {
        const nameInput = this.container.querySelector(
          "#player-name"
        ) as HTMLInputElement;
        if (nameInput) {
          nameInput.value = savedName;
        }
      } else {
        // Default name if nothing saved
        const nameInput = this.container.querySelector(
          "#player-name"
        ) as HTMLInputElement;
        if (nameInput) {
          nameInput.value = "Player";
        }
      }

      // Load saved color
      if (savedColor) {
        const colorButtons = this.container.querySelectorAll(".color-btn");
        colorButtons.forEach((btn) => {
          const btnColor = btn.getAttribute("data-color");
          if (btnColor === savedColor) {
            // Remove active from all buttons
            colorButtons.forEach((b) => b.classList.remove("active"));
            // Set this one as active
            btn.classList.add("active");
          }
        });
      }

      // Load saved player count
      if (savedPlayerCount) {
        const countButtons = this.container.querySelectorAll(".count-btn");
        countButtons.forEach((btn) => {
          const btnCount = btn.getAttribute("data-count");
          if (btnCount === savedPlayerCount) {
            // Remove active from all buttons
            countButtons.forEach((b) => b.classList.remove("active"));
            // Set this one as active
            btn.classList.add("active");
          }
        });
      }

      // Load saved dome type
      const savedDomeType = localStorage.getItem(this.STORAGE_KEY_DOME_TYPE);
      if (savedDomeType) {
        const domeButtons = this.container.querySelectorAll(".dome-btn");
        domeButtons.forEach((btn) => {
          const btnDome = btn.getAttribute("data-dome");
          if (btnDome === savedDomeType) {
            // Remove active from all buttons
            domeButtons.forEach((b) => b.classList.remove("active"));
            // Set this one as active
            btn.classList.add("active");
          }
        });
      }
    } catch (error) {
      console.warn("Could not load preferences from localStorage:", error);
    }
  }
}
