// ==========================================
// CRUX Life OS - MarketplaceScreen Component
// User Template & Knowledge Pack Marketplace
// ==========================================

import React, { useState } from 'react';
import { marketplaceService } from '../../services/marketplaceService';
import { MarketplaceCategory, MarketplaceItem } from '../../types/monetization';
import { useCoins } from '../../hooks/useCoins';
import { Store, Star, Download, Coins, CheckCircle, Tag } from 'lucide-react';

interface Props {
  userId: string;
}

export const MarketplaceScreen: React.FC<Props> = ({ userId }) => {
  const { balance } = useCoins(userId);
  const [items, setItems] = useState<MarketplaceItem[]>(() => marketplaceService.getItems(userId));
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [notification, setNotification] = useState<string | null>(null);

  const categories = ['ALL', ...Object.values(MarketplaceCategory)];

  const handleAcquire = (itemId: string) => {
    const res = marketplaceService.acquireItem(userId, itemId);
    setNotification(res.message);
    if (res.success) {
      setItems([...marketplaceService.getItems(userId)]);
    }
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredItems =
    selectedCategory === 'ALL'
      ? items
      : items.filter((i) => i.category === selectedCategory);

  return (
    <div className="space-y-6 text-slate-100">
      {/* Banner */}
      <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-950 border border-cyan-500/40 text-cyan-300">
            <Store className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">System Marketplace</h2>
            <p className="text-xs text-slate-300">
              Community & S-Rank Creator Templates, Study Plans, Workout Packs & Focus Routines
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-950/60 px-3.5 py-2 text-xs font-bold text-cyan-300">
          <Coins className="h-4 w-4 text-amber-400" />
          Balance: {balance.toLocaleString()} Coins
        </div>
      </div>

      {notification && (
        <div className="rounded-xl border border-cyan-500/40 bg-cyan-950/60 p-3 text-center text-xs font-bold text-cyan-300">
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
                ? 'bg-cyan-500 text-slate-950 shadow'
                : 'border border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
            }`}
          >
            {cat.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-md hover:border-cyan-500/40 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="rounded-full border border-cyan-500/30 bg-cyan-950/60 px-2.5 py-0.5 text-[10px] font-bold text-cyan-300">
                  {item.category}
                </span>

                <div className="flex items-center gap-1 text-xs text-amber-400 font-bold">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  {item.rating} ({item.salesCount})
                </div>
              </div>

              <h3 className="text-base font-bold text-white mb-1">{item.title}</h3>
              <p className="text-xs text-slate-400 mb-3">{item.description}</p>

              <div className="space-y-1 mb-4">
                {item.previewDetails.map((detail, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                    <CheckCircle className="h-3 w-3 text-cyan-400 shrink-0" />
                    <span>{detail}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {item.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
                    <Tag className="h-2.5 w-2.5" /> {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between">
              <div className="flex items-center gap-1 text-amber-300 font-black text-sm">
                <Coins className="h-4 w-4" />
                {item.priceCoins} Coins
              </div>

              {item.isPurchased ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                  <CheckCircle className="h-4 w-4" /> Unlocked in Library
                </span>
              ) : (
                <button
                  onClick={() => handleAcquire(item.id)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-3.5 py-1.5 text-xs font-black text-slate-950 shadow"
                >
                  <Download className="h-3.5 w-3.5" /> Acquire Pack
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
