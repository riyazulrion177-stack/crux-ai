// ==========================================
// CRUX Life OS - Inventory Service
// Manages User Cosmetics & Equippables
// ==========================================

import { InventoryItem, InventoryCategory } from '../types/monetization';

const STORAGE_KEY_INVENTORY = 'crux_inventory_v1';

export const INITIAL_COSMETIC_CATALOG: InventoryItem[] = [
  {
    id: 'cos_theme_cyber_neon',
    name: 'Cyber Neon Matrix',
    description: 'Electric cyan and magenta glowing aura theme.',
    category: InventoryCategory.THEME,
    rarity: 'RARE',
    icon: 'Sparkles',
    isEquipped: true,
    isConsumable: false,
    priceCoins: 300,
  },
  {
    id: 'cos_theme_gold_celestial',
    name: 'Gold Celestial',
    description: 'Royal golden celestial starlight canvas theme.',
    category: InventoryCategory.THEME,
    rarity: 'LEGENDARY',
    icon: 'Crown',
    isEquipped: false,
    isConsumable: false,
    priceCoins: 1200,
  },
  {
    id: 'cos_frame_shadow_aura',
    name: 'Shadow Monarch Frame',
    description: 'Dark purple smoking shadow flame border for avatar.',
    category: InventoryCategory.FRAME,
    rarity: 'EPIC',
    icon: 'Shield',
    isEquipped: false,
    isConsumable: false,
    priceCoins: 600,
  },
  {
    id: 'cos_title_system_architect',
    name: 'System Architect',
    description: 'Special title badge displayed under your hunter name.',
    category: InventoryCategory.TITLE,
    rarity: 'EPIC',
    icon: 'Terminal',
    isEquipped: true,
    isConsumable: false,
    priceCoins: 400,
  },
  {
    id: 'cos_weapon_laser_blade',
    name: 'Plasma Katana Skin',
    description: 'Futuristic energy blade weapon visual override.',
    category: InventoryCategory.WEAPON_SKIN,
    rarity: 'RARE',
    icon: 'Zap',
    isEquipped: false,
    isConsumable: false,
    priceCoins: 500,
  },
  {
    id: 'cos_pet_cyber_sprite',
    name: 'Cyber Sprite Companion',
    description: 'Mini floating AI companion sprite that floats beside your stat card.',
    category: InventoryCategory.PET,
    rarity: 'LEGENDARY',
    icon: 'Bot',
    isEquipped: false,
    isConsumable: false,
    priceCoins: 1500,
  },
  {
    id: 'cos_aura_glitch_particle',
    name: 'Glitch Stream Aura',
    description: 'Matrix particle stream animation trailing mission completions.',
    category: InventoryCategory.AURA,
    rarity: 'RARE',
    icon: 'Flame',
    isEquipped: false,
    isConsumable: false,
    priceCoins: 450,
  },
];

export class InventoryService {
  private cache: Map<string, InventoryItem[]> = new Map();

  public getInventory(userId: string): InventoryItem[] {
    const key = `${STORAGE_KEY_INVENTORY}_${userId}`;
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.cache.set(key, parsed);
        return parsed;
      }
    } catch {
      // Ignore
    }

    // Default unlocked starter cosmetics
    const starterItems = INITIAL_COSMETIC_CATALOG.slice(0, 3).map((item) => ({
      ...item,
      unlockedAt: new Date().toISOString(),
    }));

    this.saveInventory(userId, starterItems);
    return starterItems;
  }

  public saveInventory(userId: string, items: InventoryItem[]): void {
    const key = `${STORAGE_KEY_INVENTORY}_${userId}`;
    this.cache.set(key, items);
    try {
      localStorage.setItem(key, JSON.stringify(items));
    } catch {
      // Storage quota
    }
  }

  public addItem(userId: string, item: InventoryItem): InventoryItem[] {
    const inventory = this.getInventory(userId);
    const existingIndex = inventory.findIndex((i) => i.id === item.id);

    if (existingIndex >= 0) {
      if (item.isConsumable) {
        inventory[existingIndex].quantity = (inventory[existingIndex].quantity || 1) + 1;
      }
    } else {
      inventory.push({
        ...item,
        unlockedAt: new Date().toISOString(),
      });
    }

    this.saveInventory(userId, inventory);
    return inventory;
  }

  public equipItem(userId: string, itemId: string): InventoryItem[] {
    const inventory = this.getInventory(userId);
    const target = inventory.find((i) => i.id === itemId);
    if (!target) return inventory;

    // Unequip other items in same category
    inventory.forEach((item) => {
      if (item.category === target.category) {
        item.isEquipped = item.id === itemId;
      }
    });

    this.saveInventory(userId, inventory);
    return inventory;
  }

  public unequipItem(userId: string, itemId: string): InventoryItem[] {
    const inventory = this.getInventory(userId);
    const target = inventory.find((i) => i.id === itemId);
    if (target) {
      target.isEquipped = false;
      this.saveInventory(userId, inventory);
    }
    return inventory;
  }
}

export const inventoryService = new InventoryService();
