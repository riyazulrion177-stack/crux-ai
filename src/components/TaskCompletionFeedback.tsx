import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  show: boolean;
  xpReward: number;
  coinReward: number;
  statReward?: string;
  statAmount?: number;
  position?: { x: number; y: number };
  onComplete?: () => void;
}

export const TaskCompletionFeedback: React.FC<Props> = React.memo(({
  show,
  xpReward,
  coinReward,
  statReward,
  statAmount,
  onComplete
}) => {
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (show) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate(8); } catch (e) {}
      }

      const timer = setTimeout(() => {
        if (onCompleteRef.current) onCompleteRef.current();
      }, 250);

      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!show) return null;

  return (
    <AnimatePresence>
      <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center overflow-hidden">
        {/* Soft Blue Subtle Glow Overlay (250ms easeOut) */}
        <motion.div
          initial={{ opacity: 0.25 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="absolute inset-0 bg-cyan-500/10 rounded-2xl"
        />

        {/* Floating +XP Text */}
        <motion.div
          initial={{ opacity: 0.8, y: 0 }}
          animate={{ opacity: 0, y: -18 }}
          transition={{ duration: 0.24, ease: 'easeOut' }}
          className="relative px-2.5 py-0.5 rounded-full bg-[#040814]/90 border border-cyan-400/40 shadow-[0_0_10px_rgba(0,240,255,0.25)] backdrop-blur-md flex items-center gap-2 text-xs font-mono font-bold"
        >
          <span className="text-cyan-300 font-bold text-xs tracking-wider">+{xpReward} XP</span>
          {coinReward > 0 && <span className="text-amber-300 font-bold">+{coinReward} Gold</span>}
          {statReward && statAmount && (
            <span className="text-purple-300 font-bold">+{statAmount} {statReward}</span>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
});

