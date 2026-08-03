import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, LootItem } from '../types';
import { ShoppingBag, Coins, Gem, Sparkles, Gift, Lock, Check, Plus, X, ShieldCheck, Crown, Package, Store, Tv } from 'lucide-react';
import { audioService } from '../services/audioService';
import { storageService } from '../services/storageService';
import { CoinShop } from './monetization/CoinShop';
import { BattlePassScreen } from './monetization/BattlePassScreen';
import { InventoryScreen } from './monetization/InventoryScreen';
import { MarketplaceScreen } from './monetization/MarketplaceScreen';
import { UpgradeModal } from './monetization/UpgradeModal';
import { RewardAdModal } from './monetization/RewardAdModal';
import { PremiumBadge } from './monetization/PremiumBadge';
import { useSubscription } from '../hooks/useSubscription';

interface Props {
  user: UserProfile;
  onSpendCoins: (amount: number) => boolean;
  onUnlockTitle: (title: string) => void;
}

interface CustomReward {
  id: string;
  name: string;
  costCoins: number;
  purchasedCount: number;
}

export const ShopEconomyView: React.FC<Props> = React.memo(({ user, onSpendCoins, onUnlockTitle }) => {
  const [activeSubTab, setActiveSubTab] = useState<'ARMORY' | 'COIN_SHOP' | 'BATTLE_PASS' | 'INVENTORY' | 'MARKETPLACE'>('ARMORY');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showRewardAdModal, setShowRewardAdModal] = useState(false);
  const { plan } = useSubscription(user.id);

  const [customRewards, setCustomRewards] = useState<CustomReward[]>([
    { id: 'cr_1', name: '1 Hr Video Game Pass', costCoins: 120, purchasedCount: 0 },
    { id: 'cr_2', name: 'Guilt-Free Cheat Meal', costCoins: 300, purchasedCount: 0 },
    { id: 'cr_3', name: 'Buy a New Book / Tech Gadget', costCoins: 650, purchasedCount: 0 },
  ]);

  const [showAddRewardModal, setShowAddRewardModal] = useState(false);
  const [newRewardName, setNewRewardName] = useState('');
  const [newRewardCost, setNewRewardCost] = useState(150);

  const [openingChest, setOpeningChest] = useState(false);
  const [droppedItem, setDroppedItem] = useState<LootItem | null>(null);

  const handleOpenChest = (costCoins: number) => {
    const lootCount = user.lootBoxesCount || 0;

    if (lootCount <= 0 && user.coins < costCoins) {
      alert("Insufficient Gold and no Loot Boxes remaining! Complete real-life missions to earn more.");
      return;
    }

    if (lootCount > 0) {
      // Use free earned Loot Box
      try {
        setOpeningChest(true);
        setDroppedItem(null);
        audioService.playLootOpen();

        setTimeout(() => {
          audioService.playLevelUp();
          const res = storageService.openLootBox(user.id);
          setDroppedItem(res.item);
          setOpeningChest(false);
          if (res.item.type === 'title' && typeof res.item.value === 'string') {
            onUnlockTitle(res.item.value);
          }
        }, 1200);
      } catch (e: any) {
        alert(e.message);
        setOpeningChest(false);
      }
      return;
    }

    // Spend coins if no free box
    if (!onSpendCoins(costCoins)) return;

    setOpeningChest(true);
    setDroppedItem(null);
    audioService.playLootOpen();

    setTimeout(() => {
      audioService.playLevelUp();
      const lootOptions: LootItem[] = [
        { id: 'l1', name: 'Title: The Shadow Sovereign', type: 'title', rarity: 'mythic', value: 'The Shadow Sovereign', icon: '👑' },
        { id: 'l2', name: 'Title: Iron Discipline', type: 'title', rarity: 'epic', value: 'Iron Discipline', icon: '🛡️' },
        { id: 'l3', name: '+15 Bonus Coins', type: 'coins', rarity: 'common', value: 15, icon: '💰' },
        { id: 'l4', name: '+3 Bonus Diamonds', type: 'diamonds', rarity: 'rare', value: 3, icon: '💎' },
      ];

      const won = lootOptions[Math.floor(Math.random() * lootOptions.length)];
      setDroppedItem(won);
      setOpeningChest(false);

      if (won.type === 'title' && typeof won.value === 'string') {
        onUnlockTitle(won.value);
      }
    }, 1200);
  };

  const handleBuyCustomReward = (reward: CustomReward) => {
    if (user.coins < reward.costCoins) {
      alert(`Insufficient Gold! You need ${reward.costCoins} gold.`);
      return;
    }

    if (onSpendCoins(reward.costCoins)) {
      audioService.playQuestComplete();
      setCustomRewards(prev => prev.map(r => r.id === reward.id ? { ...r, purchasedCount: r.purchasedCount + 1 } : r));
    }
  };

  const handleAddCustomReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRewardName.trim()) return;

    setCustomRewards(prev => [
      ...prev,
      { id: 'cr_' + Date.now(), name: newRewardName.trim(), costCoins: newRewardCost, purchasedCount: 0 }
    ]);
    setNewRewardName('');
    setShowAddRewardModal(false);
  };

  return (
    <div className="space-y-6 pb-12 text-slate-100">
      {/* Top Action Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-2xl border border-purple-500/30 bg-[#0d0f1a] p-5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-950 border border-purple-500/40 text-purple-300">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white">Hunter Economy & Monetization</h1>
              <PremiumBadge plan={plan} size="sm" />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Access Cosmetic Shop, Battle Pass, Wardrobe & Template Marketplace
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowRewardAdModal(true)}
            className="rounded-xl border border-amber-500/40 bg-amber-950/60 hover:bg-amber-900/60 px-3.5 py-2 text-xs font-bold text-amber-300 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Tv className="h-4 w-4" />
            Watch Ad for Rewards
          </button>

          <button
            onClick={() => setShowUpgradeModal(true)}
            className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-lg flex items-center gap-1.5 transition cursor-pointer"
          >
            <Crown className="h-4 w-4 text-amber-300" />
            Upgrade Plan
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-800 pb-2 scrollbar-none">
        {[
          { id: 'ARMORY', label: 'Armory & Chests', icon: ShoppingBag },
          { id: 'COIN_SHOP', label: 'Cosmetic Shop', icon: Coins },
          { id: 'BATTLE_PASS', label: 'Battle Pass', icon: ShieldCheck },
          { id: 'INVENTORY', label: 'Inventory', icon: Package },
          { id: 'MARKETPLACE', label: 'Marketplace', icon: Store },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`shrink-0 flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-purple-600 text-white shadow'
                  : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Render Switcher */}
      {activeSubTab === 'COIN_SHOP' && <CoinShop userId={user.id} />}
      {activeSubTab === 'BATTLE_PASS' && <BattlePassScreen userId={user.id} />}
      {activeSubTab === 'INVENTORY' && <InventoryScreen userId={user.id} />}
      {activeSubTab === 'MARKETPLACE' && <MarketplaceScreen userId={user.id} />}

      {activeSubTab === 'ARMORY' && (
        <>
          {/* Loot Box Arena */}
          <div className="rounded-2xl bg-gradient-to-br from-[#120a22] via-[#0f111f] to-[#1a1228] border border-purple-500/40 p-6 md:p-8 shadow-2xl relative overflow-hidden">
            <div className="text-center max-w-xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 text-xs font-mono uppercase">
                <Sparkles className="w-4 h-4 text-purple-400" /> SYSTEM LOOT BOX GACHA
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-wide">
                MYTHIC DISCIPLINE CHEST
              </h2>
              <p className="text-xs text-slate-400">
                Open for a chance to unlock exclusive Hunter Titles, Avatar Frames, and Gold boosters.
              </p>

              <div className="my-6 py-6 flex flex-col items-center justify-center">
                <motion.div
                  animate={openingChest ? { rotate: [-5, 5, -5, 5, 0], scale: [1, 1.1, 1] } : {}}
                  className="w-32 h-32 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 p-[2px] shadow-[0_0_30px_#8a2be280] flex items-center justify-center cursor-pointer"
                >
                  <div className="w-full h-full bg-[#0d0f1a] rounded-[14px] flex items-center justify-center text-4xl">
                    🎁
                  </div>
                </motion.div>

                {droppedItem && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 rounded-xl bg-purple-950/80 border border-purple-500/60 font-mono text-xs text-center"
                  >
                    <div className="text-purple-300 uppercase font-bold text-[10px]">REWARD UNLOCKED!</div>
                    <div className="text-sm font-extrabold text-white mt-1">{droppedItem.name}</div>
                  </motion.div>
                )}
              </div>

              <button
                onClick={() => handleOpenChest(150)}
                disabled={openingChest}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-mono font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 hover:scale-105 transition cursor-pointer"
              >
                {(user.lootBoxesCount || 0) > 0 ? `OPEN LOOT BOX (${user.lootBoxesCount} AVAILABLE)` : 'BUY & OPEN CHEST (150 GOLD)'}
              </button>
            </div>
          </div>

          {/* Real Life Self-Rewards Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-white tracking-wide flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-400" /> REAL-LIFE SELF-REWARDS SHOP
              </h2>
              <button
                onClick={() => setShowAddRewardModal(true)}
                className="px-3.5 py-2 rounded-xl bg-[#12162a] border border-slate-800 text-cyan-400 text-xs font-mono font-bold hover:border-cyan-500 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> ADD REWARD
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {customRewards.map((reward) => (
                <div key={`reward_${reward.id}`} className="p-5 rounded-2xl bg-[#0f111f] border border-slate-800 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="font-bold text-sm text-white">{reward.name}</div>
                    <div className="text-xs text-slate-400 mt-1">Purchased {reward.purchasedCount} times</div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                    <span className="font-mono font-extrabold text-amber-400 text-xs">
                      {reward.costCoins} GOLD
                    </span>
                    <button
                      onClick={() => handleBuyCustomReward(reward)}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold hover:bg-amber-500/30 transition cursor-pointer"
                    >
                      REDEEM
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Add Custom Reward Modal */}
      <AnimatePresence>
        {showAddRewardModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0d0f1c] border border-cyan-500/40 rounded-2xl p-6 shadow-2xl text-white relative"
            >
              <button
                onClick={() => setShowAddRewardModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-lg font-extrabold text-white tracking-wide mb-1 flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-400" /> CREATE CUSTOM SELF-REWARD
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                Earn real-life privileges by staying disciplined.
              </p>

              <form onSubmit={handleAddCustomReward} className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block text-slate-300 uppercase mb-1">Reward Name</label>
                  <input
                    type="text"
                    required
                    value={newRewardName}
                    onChange={(e) => setNewRewardName(e.target.value)}
                    placeholder="e.g. Movie Night / Buy a Coffee / 1 Hr Netflix"
                    className="w-full bg-[#12162a] border border-slate-700 rounded-xl py-2.5 px-3.5 text-white placeholder-slate-600 outline-none focus:border-cyan-500 font-sans text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 uppercase mb-1">Gold Cost</label>
                  <input
                    type="number"
                    min={20}
                    max={2000}
                    value={newRewardCost}
                    onChange={(e) => setNewRewardCost(Number(e.target.value))}
                    className="w-full bg-[#12162a] border border-slate-700 rounded-xl py-2.5 px-3.5 text-amber-400 font-bold outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-extrabold uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:scale-[1.01] transition cursor-pointer"
                >
                  SAVE REWARD TO SHOP
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upgrade & Ad Modals */}
      {showUpgradeModal && (
        <UpgradeModal
          userId={user.id}
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
        />
      )}

      {showRewardAdModal && (
        <RewardAdModal
          userId={user.id}
          isOpen={showRewardAdModal}
          onClose={() => setShowRewardAdModal(false)}
        />
      )}
    </div>
  );
});
