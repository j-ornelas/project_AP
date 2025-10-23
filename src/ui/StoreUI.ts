import {
  ActiveItems,
  ItemCategory,
  getItemsByCategory,
  getItem,
} from "../types/StoreItems";

export class StoreUI {
  private container: HTMLElement | null = null;
  private onPurchase?: (itemId: string) => void;
  private currentGold: number = 0;
  private activeItems: ActiveItems = { offensive: null, defensive: null };

  constructor() {}

  show(
    gold: number,
    activeItems: ActiveItems,
    onPurchase: (itemId: string) => void
  ): void {
    this.currentGold = gold;
    this.activeItems = activeItems;
    this.onPurchase = onPurchase;

    if (!this.container) {
      this.container = this.createStoreUI();
      document.body.appendChild(this.container);
    } else {
      this.container.style.display = "flex";
    }

    this.render();
  }

  hide(): void {
    if (this.container) {
      this.container.style.display = "none";
    }
  }

  private createStoreUI(): HTMLElement {
    const store = document.createElement("div");
    store.id = "store-overlay";
    store.innerHTML = `
      <div class="store-modal">
        <div class="store-header">
          <h2>🏪 Store</h2>
          <div class="store-gold">💰 <span id="store-gold-amount">0</span>g</div>
          <button id="store-close" class="close-btn">✕</button>
        </div>
        <div class="store-tabs">
          <button class="store-tab active" data-category="defensive">🛡️ Defensive</button>
          <button class="store-tab" data-category="offensive">⚔️ Offensive</button>
        </div>
        <div class="store-content" id="store-items"></div>
        <div class="store-footer">
          <div class="purchase-status">
            <div>Defensive: <span id="defensive-status">None</span></div>
            <div>Offensive: <span id="offensive-status">None</span></div>
          </div>
          <button id="store-done" class="primary-btn">Done Shopping</button>
        </div>
      </div>
    `;

    this.setupEventListeners(store);
    return store;
  }

  private setupEventListeners(store: HTMLElement): void {
    // Close button
    const closeBtn = store.querySelector("#store-close");
    closeBtn?.addEventListener("click", () => this.hide());

    const doneBtn = store.querySelector("#store-done");
    doneBtn?.addEventListener("click", () => this.hide());

    // Tab switching
    const tabs = store.querySelectorAll(".store-tab");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        const category = tab.getAttribute("data-category") as ItemCategory;
        this.renderItems(category);
      });
    });
  }

  private render(): void {
    const goldElement = this.container?.querySelector("#store-gold-amount");
    if (goldElement) {
      goldElement.textContent = this.currentGold.toString();
    }

    this.updatePurchaseStatus();

    // Render the active tab
    const activeTab = this.container?.querySelector(".store-tab.active");
    const category =
      (activeTab?.getAttribute("data-category") as ItemCategory) || "defensive";
    this.renderItems(category);
  }

  private renderItems(category: ItemCategory): void {
    const itemsContainer = this.container?.querySelector("#store-items");
    if (!itemsContainer) return;

    const items = getItemsByCategory(category);
    const purchasedItemInCategory = this.activeItems[category];

    itemsContainer.innerHTML = items
      .map((item) => {
        const canAfford = this.currentGold >= item.cost;
        const isPurchased = item.id === purchasedItemInCategory;
        const hasPurchasedInCategory = purchasedItemInCategory !== null;
        const isDisabled =
          !canAfford || (hasPurchasedInCategory && !isPurchased);

        return `
          <div class="store-item ${isPurchased ? "purchased" : ""} ${
          isDisabled ? "disabled" : ""
        }">
            <div class="item-icon">${item.icon}</div>
            <div class="item-details">
              <div class="item-name">${item.name}</div>
              <div class="item-description">${item.description}</div>
              <div class="item-cost">💰 ${item.cost}g</div>
            </div>
            <button 
              class="item-buy-btn ${isPurchased ? "purchased-btn" : ""}" 
              data-item-id="${item.id}"
              ${isDisabled && !isPurchased ? "disabled" : ""}
              ${isPurchased && item.id === "repair" ? "disabled" : ""}
            >
              ${
                isPurchased && item.id === "repair"
                  ? "✓ Applied"
                  : isPurchased
                  ? "✓ Purchased"
                  : "Buy"
              }
            </button>
          </div>
        `;
      })
      .join("");

    // Add click handlers for buy buttons
    const buyButtons = itemsContainer.querySelectorAll(".item-buy-btn");
    buyButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const itemId = (e.target as HTMLElement).getAttribute("data-item-id");
        if (itemId) {
          this.handlePurchase(itemId);
        }
      });
    });
  }

  private handlePurchase(itemId: string): void {
    const item = getItem(itemId);
    if (!item) return;

    // Just notify the game - let Game.ts handle all state changes
    // Don't modify local state here to avoid conflicts
    this.onPurchase?.(itemId);
  }

  private updatePurchaseStatus(): void {
    const defensiveStatus = this.container?.querySelector("#defensive-status");
    const offensiveStatus = this.container?.querySelector("#offensive-status");

    if (defensiveStatus) {
      const defensiveItem = this.activeItems.defensive
        ? getItem(this.activeItems.defensive)
        : null;
      defensiveStatus.textContent = defensiveItem
        ? `${defensiveItem.icon} ${defensiveItem.name}`
        : "None";
    }

    if (offensiveStatus) {
      const offensiveItem = this.activeItems.offensive
        ? getItem(this.activeItems.offensive)
        : null;
      offensiveStatus.textContent = offensiveItem
        ? `${offensiveItem.icon} ${offensiveItem.name}`
        : "None";
    }
  }

  updateGold(gold: number): void {
    this.currentGold = gold;
    const goldElement = this.container?.querySelector("#store-gold-amount");
    if (goldElement) {
      goldElement.textContent = gold.toString();
    }
  }
}
