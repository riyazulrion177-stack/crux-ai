// ==========================================
// CRUX Life OS - useInventory Hook
// User Inventory & Cosmetics Management
// ==========================================

import { useState, useEffect, useCallback } from 'react';
import { InventoryItem, InventoryCategory } from '../types/monetization';
import { inventoryService } from '../services/inventoryService';

export function useInventory(userId: string) {
  const [items, setItems] = useState<InventoryItem[]>(() =>
    inventoryService.getInventory(userId)
  );

  useEffect(() => {
    if (userId) {
      setItems(inventoryService.getInventory(userId));
    }
  }, [userId]);

  const equipItem = useCallback(
    (itemId: string) => {
      const updated = inventoryService.equipItem(userId, itemId);
      setItems([...updated]);
    },
    [userId]
  );

  const unequipItem = useCallback(
    (itemId: string) => {
      const updated = inventoryService.unequipItem(userId, itemId);
      setItems([...updated]);
    },
    [userId]
  );

  const addItem = useCallback(
    (item: InventoryItem) => {
      const updated = inventoryService.addItem(userId, item);
      setItems([...updated]);
    },
    [userId]
  );

  const getEquippedItem = useCallback(
    (category: InventoryCategory) => {
      return items.find((i) => i.category === category && i.isEquipped);
    },
    [items]
  );

  return {
    items,
    equipItem,
    unequipItem,
    addItem,
    getEquippedItem,
  };
}
