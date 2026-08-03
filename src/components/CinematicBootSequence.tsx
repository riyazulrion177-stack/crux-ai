import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Cpu, Lock, CheckCircle2 } from 'lucide-react';
import { audioService } from '../services/audioService';

interface Props {
  hunterName?: string;
  onBootComplete: () => void;
}

export const CinematicBootSequence: React.FC<Props> = ({ hunterName = 'Hunter', onBootComplete }) => {
  const [step, setStep] = useState<number>(0);
  const onBootCompleteRef = useRef(onBootComplete);

  useEffect(() => {
    onBootCompleteRef.current = onBootComplete;
  }, [onBootComplete]);

  useEffect(() => {
    // Silent fast startup sequence
    const t1 = setTimeout(() => {
      setStep(1);
    }, 50);

    const t2 = setTimeout(() => {
      setStep(2);
    }, 110);

    const t3 = setTimeout(() => {
      setStep(3);
    }, 170);

    const t4 = setTimeout(() => {
      setStep(4);
    }, 220);

    const t5 = setTimeout(() => {
      if (onBootCompleteRef.current) {
        onBootCompleteRef.current();
      }
    }, 280);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(10px)', transition: { duration: 0.3 } }}
      className="fixed inset-0 z-50 bg-[#020409] text-white flex flex-col items-center justify-center overflow-hidden font-mono selection:bg-cyan-500/30"
    >
      {/* 1. Holographic Cyber Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00f0ff08_1px,transparent_1px),linear-gradient(to_bottom,#00f0ff08_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* 2. Soft Volumetric Cyan Energy Waves */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.35, 0.15]
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none"
      />

      {/* 3. Floating Micro Energy Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`boot_particle_${i}`}
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
              opacity: Math.random() * 0.5 + 0.2,
              scale: Math.random() * 0.8 + 0.4
            }}
            animate={{
              y: [null, '-=60px'],
              opacity: [null, 0]
            }}
            transition={{
              duration: Math.random() * 2 + 1.5,
              repeat: Infinity,
              ease: 'linear',
              delay: Math.random() * 2
            }}
            className="absolute w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]"
          />
        ))}
      </div>

      {/* 4. Central Core Hologram Display */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm px-6">
        {/* CRUX Logo with Soft Cyan Rim Glow */}
        <AnimatePresence>
          {step >= 1 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0, filter: 'blur(8px)' }}
              animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
              transition={{ type: 'spring', stiffness: 220, damping: 20 }}
              className="relative mb-8"
            >
              {/* Outer Cyan Glowing Aura Ring */}
              <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -inset-4 rounded-3xl bg-cyan-500/20 blur-xl"
              />

              {/* Logo Container */}
              <div className="w-20 h-20 rounded-2xl bg-[#050b18] border border-cyan-400/50 flex items-center justify-center shadow-[0_0_35px_rgba(0,240,255,0.35)] relative overflow-hidden backdrop-blur-xl">
                {/* Glass Reflection Highlight */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-cyan-400/10 to-white/20 pointer-events-none" />

                {/* Sleek Interlocking C-X Emblem */}
                <div className="relative font-black text-2xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 via-cyan-100 to-blue-400 flex items-center gap-0.5">
                  <span className="text-cyan-400 drop-shadow-[0_0_10px_#00f0ff]">C</span>
                  <span className="text-blue-300 font-extrabold -ml-1">X</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* System Boot Telemetry Lines */}
        <div className="w-full space-y-3 font-mono text-xs text-left bg-[#040814]/80 border border-cyan-500/20 rounded-xl p-4 shadow-[0_0_30px_rgba(0,240,255,0.1)] backdrop-blur-md">
          {/* Line 1: SYSTEM ONLINE */}
          <AnimatePresence>
            {step >= 2 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2.5 text-cyan-300 font-bold tracking-wider"
              >
                <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-pulse shrink-0" />
                <span className="uppercase">SYSTEM ONLINE</span>
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff] animate-ping" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Line 2: Authenticating Hunter... */}
          <AnimatePresence>
            {step >= 3 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2.5 text-slate-400 text-[11px]"
              >
                <Lock className="w-3.5 h-3.5 text-cyan-400/80 shrink-0" />
                <span>Authenticating Hunter session...</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Line 3: Identity Verified */}
          <AnimatePresence>
            {step >= 4 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2.5 text-emerald-400 font-bold text-[11px] pt-1 border-t border-cyan-500/20"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 shadow-[0_0_8px_#34d399]" />
                <span className="tracking-wide uppercase">IDENTITY VERIFIED: {hunterName}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Loading Scanline Progress Bar */}
        <div className="w-full h-1 bg-cyan-950/80 rounded-full mt-4 overflow-hidden relative border border-cyan-500/30">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: step === 0 ? '0%' : step === 1 ? '20%' : step === 2 ? '50%' : step === 3 ? '75%' : '100%' }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-cyan-500 via-blue-400 to-cyan-300 shadow-[0_0_12px_#00f0ff]"
          />
        </div>
      </div>
    </motion.div>
  );
};
