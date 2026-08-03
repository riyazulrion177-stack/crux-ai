// ==========================================
// CRUX Life OS - InventoryScreen Component
// User Owned Cosmetics & Equippable Showcase
// ==========================================

import React, { useState } from 'react';
import { useInventory } from '../../hooks/useInventory';
import { InventoryCategory } from '../../types/monetization';
import { Package, Sparkles, Check, Shield } from 'lucide-react';

interface Props {
  userId: string;
}

export const InventoryScreen: React.FC<Props> = ({ userId }) => {
  const { items, equipItem, unequipItem } = useInventory(userId);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = ['ALL', ...Object.values(InventoryCategory)];

  const filteredItems =
    selectedCategory === 'ALL'
      ? items
      : items.filter((i) => i.category === selectedCategory);

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-950 border border-purple-500/40 text-purple-300">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Hunter Inventory & Wardrobe</h2>
            <p className="text-xs text-slate-400">Manage owned themes, frames, titles & custom pets</p>
          </div>
        </div>

        <div className="text-right text-xs text-slate-400">
          Total Cosmetics Unlocked: <strong className="text-purple-300 text-sm">{items.length}</strong>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              selectedCategory === cat
                ? 'bg-purple-600 text-white shadow'
                : 'border border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Items List */}
      {filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-500 text-sm">
          No cosmetics owned in this category yet. Visit the Cosmetic Shop!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`flex flex-col justify-between rounded-2xl border p-5 transition-all ${
                item.isEquipped
                  ? 'border-purple-500/60 bg-purple-950/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                  : 'border-slate-800 bg-slate-900/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-purple-300 border border-slate-700">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 border border-slate-700 rounded-full px-2 py-0.5">
                    {item.category}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mb-1">{item.name}</h3>
                <p className="text-xs text-slate-400 mb-4">{item.description}</p>
              </div>

              <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">
                  Unlocked: {item.unlockedAt ? new Date(item.unlockedAt).toLocaleDateString() : 'Active'}
                </span>

                {item.isEquipped ? (
                  <button
                    onClick={() => unequipItem(item.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-purple-400/40 bg-purple-950/60 px-3 py-1 text-xs font-bold text-purple-300"
                  >
                    <Check className="h-3.5 w-3.5" /> Equipped
                  </button>
                ) : (
                  <button
                    onClick={() => equipItem(item.id)}
                    className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1 text-xs font-bold text-white"
                  >
                    Equip
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
