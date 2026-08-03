// ==========================================
// CRUX Life OS - CoinShop Component
// Purely Cosmetic Virtual Economy Shop (NO PAY-TO-WIN)
// ==========================================

import React, { useState } from 'react';
import { useCoins } from '../../hooks/useCoins';
import { useInventory } from '../../hooks/useInventory';
import { INITIAL_COSMETIC_CATALOG } from '../../services/inventoryService';
import { InventoryCategory, InventoryItem } from '../../types/monetization';
import { Coins, ShieldCheck, Sparkles, CheckCircle2, ShoppingBag } from 'lucide-react';

interface Props {
  userId: string;
}

export const CoinShop: React.FC<Props> = ({ userId }) => {
  const { balance, spendCoins } = useCoins(userId);
  const { items, addItem } = useInventory(userId);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [notification, setNotification] = useState<string | null>(null);

  const categories = ['ALL', ...Object.values(InventoryCategory)];

  const handlePurchase = (catalogItem: InventoryItem) => {
    const isOwned = items.some((i) => i.id === catalogItem.id);
    if (isOwned) {
      setNotification(`Already owned: ${catalogItem.name}`);
      setTimeout(() => setNotification(null), 2000);
      return;
    }

    const ok = spendCoins(catalogItem.priceCoins, catalogItem.name);
    if (ok) {
      addItem(catalogItem);
      setNotification(`Successfully unlocked ${catalogItem.name}!`);
    } else {
      setNotification('Insufficient Cyber Coins. Complete daily missions to earn more!');
    }
    setTimeout(() => setNotification(null), 2500);
  };

  const filteredCatalog =
    selectedCategory === 'ALL'
      ? INITIAL_COSMETIC_CATALOG
      : INITIAL_COSMETIC_CATALOG.filter((i) => i.category === selectedCategory);

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-slate-950 via-amber-950/30 to-slate-950 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-950/60 px-3 py-1 text-xs font-black text-amber-300 mb-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              STRICTLY NO PAY-TO-WIN
            </div>
            <h2 className="text-2xl font-black text-white">Cosmetic Cyber Emporium</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Customize your Hunter aesthetic with custom themes, avatar frames, titles, pets, and weapon skins.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-amber-500/40 bg-amber-950/80 px-4 py-2.5 shadow-lg">
            <Coins className="h-6 w-6 text-amber-400 animate-pulse" />
            <div>
              <span className="text-[10px] text-amber-300/80 block">Cyber Coins</span>
              <span className="text-lg font-black text-amber-200">{balance.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {notification && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-950/60 p-3 text-center text-xs font-bold text-amber-300">
          {notification}
        </div>
      )}

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              selectedCategory === cat
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'border border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Cosmetic Items Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCatalog.map((item) => {
          const isOwned = items.some((i) => i.id === item.id);

          return (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-md hover:border-amber-500/40 transition-all"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-950/40 text-amber-300">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <span className="rounded-full border border-slate-700 bg-slate-950 px-2.5 py-0.5 text-[10px] font-bold text-slate-400">
                    {item.rarity}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-1">{item.name}</h3>
                <p className="text-xs text-slate-400 mb-4">{item.description}</p>
              </div>

              <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-amber-300 font-black text-sm">
                  <Coins className="h-4 w-4" />
                  {item.priceCoins}
                </div>

                {isOwned ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    Unlocked
                  </span>
                ) : (
                  <button
                    onClick={() => handlePurchase(item)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 px-3 py-1.5 text-xs font-bold text-slate-950 shadow"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    Buy Cosmetic
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
