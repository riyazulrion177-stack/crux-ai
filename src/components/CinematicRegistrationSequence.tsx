import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Zap, Sparkles, Lock, Terminal, Check, User, Crown, BookOpen, BrainCircuit, Sword, Coins, Flame } from 'lucide-react';
import { UserProfile } from '../types';
import { audioService } from '../services/audioService';

interface Props {
  userProfile: UserProfile;
  onEnterApp: () => void;
}

// Class Icon mapping helper
const getClassIcon = (classTitle: string) => {
  switch (classTitle) {
    case 'Shadow Monk': return Sparkles;
    case 'Titan Athlete': return Sword;
    case 'Cyber Scholar': return BrainCircuit;
    case 'Iron Executive': return Crown;
    case 'Creative Weaver': return BookOpen;
    default: return Shield;
  };
};

export const CinematicRegistrationSequence: React.FC<Props> = ({ userProfile, onEnterApp }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [phase, setPhase] = useState<number>(0); // 0: Black, 1: Orb charging, 2: Explosion & Logo, 3: Text & Stats, 4: Card, 5: Hologram & Button
  const [screenShake, setScreenShake] = useState(false);
  const [typedMessageIndex, setTypedMessageIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const ClassIcon = getClassIcon(userProfile.classTitle);

  const systemLines = [
    'SYSTEM ONLINE',
    'Mission Database Loaded',
    'Character Created Successfully',
    'Daily Quest Generated',
    'Future Awaits...'
  ];

  // Timeline Step Trigger
  useEffect(() => {
    // Step 0 -> Step 1: Glowing Blue Energy appears (0.5s)
    const t1 = setTimeout(() => {
      setPhase(1);
    }, 500);

    // Step 1 -> Step 2: Crystal Explosion, Particles, Sound, Logo (1.8s)
    const t2 = setTimeout(() => {
      setPhase(2);
      setScreenShake(true);
      audioService.playCinematicImpact();
      setTimeout(() => setScreenShake(false), 600);
    }, 1800);

    // Step 2 -> Step 3: Text & Zero Stats reveal (2.6s)
    const t3 = setTimeout(() => {
      setPhase(3);
    }, 2700);

    // Step 3 -> Step 4: Reveal Character Card (3.6s)
    const t4 = setTimeout(() => {
      setPhase(4);
    }, 3700);

    // Step 4 -> Step 5: System Message & Enter Button (4.6s)
    const t5 = setTimeout(() => {
      setPhase(5);
    }, 4600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, []);

  // Hologram typewriter effect
  useEffect(() => {
    if (phase >= 5) {
      if (typedMessageIndex < systemLines.length) {
        const timer = setTimeout(() => {
          setTypedMessageIndex(prev => prev + 1);
          audioService.playHologramScan();
        }, 350);
        return () => clearTimeout(timer);
      }
    }
  }, [phase, typedMessageIndex]);

  // Particle Engine Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      decay: number;
      type: 'spark' | 'shard' | 'ring' | 'beam';
      rotation: number;
      vRot: number;
    }

    let particles: Particle[] = [];

    const createExplosion = () => {
      const centerX = width / 2;
      const centerY = height / 2;
      const colors = ['#00f0ff', '#3b82f6', '#8b5cf6', '#d8b4fe', '#ffffff', '#06b6d4'];

      // Spawns 400 high-velocity particles
      for (let i = 0; i < 450; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 18 + 2;
        particles.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 4 + 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          decay: Math.random() * 0.015 + 0.005,
          type: Math.random() > 0.3 ? 'spark' : 'shard',
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.2
        });
      }

      // Spawns crystalline fragment rays
      for (let i = 0; i < 60; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 24 + 10;
        particles.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 8 + 4,
          color: '#00f0ff',
          alpha: 1,
          decay: Math.random() * 0.02 + 0.01,
          type: 'beam',
          rotation: angle,
          vRot: 0
        });
      }
    };

    let particleTriggered = false;

    const render = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, width, height);

      // Trigger burst on Phase 2
      if (phase >= 2 && !particleTriggered) {
        particleTriggered = true;
        createExplosion();
      }

      // Draw background ambient starfield motes
      if (phase >= 1) {
        ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
        for (let i = 0; i < 15; i++) {
          const rx = (Math.sin(Date.now() * 0.001 + i) * 0.5 + 0.5) * width;
          const ry = (Math.cos(Date.now() * 0.0008 + i * 2) * 0.5 + 0.5) * height;
          ctx.beginPath();
          ctx.arc(rx, ry, Math.random() * 2 + 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Update & Draw Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.alpha -= p.decay;
        p.rotation += p.vRot;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;

        if (p.type === 'spark') {
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 10;
          ctx.shadowColor = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'shard') {
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 12;
          ctx.shadowColor = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 2);
        } else if (p.type === 'beam') {
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.strokeStyle = p.color;
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#00f0ff';
          ctx.lineWidth = p.size;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(30, 0);
          ctx.stroke();
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [phase]);

  const handleEnterClick = () => {
    setIsExiting(true);
    audioService.playQuestComplete();
    setTimeout(() => {
      onEnterApp();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black text-white overflow-hidden select-none flex flex-col items-center justify-center font-sans">
      {/* Particle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* Screen Shake Wrapper */}
      <motion.div
        animate={
          screenShake
            ? {
                x: [0, -14, 14, -10, 10, -5, 5, 0],
                y: [0, 10, -10, 8, -8, 3, -3, 0],
                rotate: [0, -1, 1, -0.5, 0.5, 0]
              }
            : {}
        }
        transition={{ duration: 0.5 }}
        className={`relative z-10 w-full max-w-4xl px-4 flex flex-col items-center text-center transition-all duration-500 ${
          isExiting ? 'opacity-0 scale-105 filter blur-sm' : 'opacity-100 scale-100'
        }`}
      >
        {/* Phase 1: Glowing Energy Orb in Center */}
        {phase === 1 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 0.5, 1.3, 1], opacity: [0, 0.8, 1] }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="relative flex items-center justify-center my-12"
          >
            <div className="w-24 h-24 rounded-full bg-cyan-400 shadow-[0_0_100px_#00f0ff,0_0_150px_#3b82f6] animate-pulse" />
            <div className="absolute w-48 h-48 rounded-full border border-cyan-400/40 animate-ping" />
            <div className="absolute w-64 h-64 rounded-full border border-purple-500/20" />
          </motion.div>
        )}

        {/* Phase 2+: CRUX Logo Materialization & Celebration Header */}
        {phase >= 2 && (
          <div className="flex flex-col items-center">
            {/* Logo Bloom */}
            <motion.div
              initial={{ scale: 0.2, opacity: 0, filter: 'blur(20px)' }}
              animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, type: 'spring', stiffness: 120 }}
              className="relative mb-4 group"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 p-[2px] shadow-[0_0_60px_rgba(0,240,255,0.6)]">
                <div className="w-full h-full bg-[#050505] rounded-[14px] flex items-center justify-center border border-cyan-400/30">
                  <span className="font-black font-mono text-4xl md:text-5xl text-cyan-400 tracking-tighter shadow-cyan-400">
                    C
                  </span>
                </div>
              </div>
              <div className="absolute -inset-2 bg-cyan-500/20 blur-xl rounded-full -z-10 animate-pulse" />
            </motion.div>

            {/* Line 1: WELCOME TO CRUX */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-4xl md:text-6xl font-black tracking-widest bg-gradient-to-r from-white via-cyan-200 to-purple-400 bg-clip-text text-transparent uppercase drop-shadow-[0_0_25px_rgba(0,240,255,0.4)]"
            >
              WELCOME TO CRUX
            </motion.h1>

            {/* Line 2: YOUR JOURNEY HAS BEGUN */}
            <motion.p
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-xs md:text-sm font-mono tracking-[0.4em] text-cyan-400 uppercase mt-2 font-bold"
            >
              YOUR JOURNEY HAS BEGUN
            </motion.p>
          </div>
        )}

        {/* Phase 3+: Zero Stat Blueprint Grid (No Fake Progress) */}
        {phase >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="my-6 w-full max-w-xl grid grid-cols-2 sm:grid-cols-5 gap-2.5 px-2"
          >
            <div className="bg-white/5 border border-cyan-500/30 rounded-xl p-2.5 text-center backdrop-blur-md">
              <div className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">STATUS</div>
              <div className="text-xs font-bold text-cyan-300 font-mono mt-0.5">LVL 1 UNLOCKED</div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center backdrop-blur-md">
              <div className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">XP</div>
              <div className="text-xs font-bold text-white font-mono mt-0.5">0 / 100</div>
            </div>

            <div className="bg-white/5 border border-purple-500/30 rounded-xl p-2.5 text-center backdrop-blur-md">
              <div className="text-[9px] font-mono text-purple-300 uppercase tracking-widest">RANK</div>
              <div className="text-xs font-bold text-purple-300 font-mono mt-0.5">ROOKIE</div>
            </div>

            <div className="bg-white/5 border border-amber-500/20 rounded-xl p-2.5 text-center backdrop-blur-md">
              <div className="text-[9px] font-mono text-amber-400 uppercase tracking-widest flex items-center justify-center gap-1">
                <Coins className="w-3 h-3" /> COINS
              </div>
              <div className="text-xs font-bold text-amber-400 font-mono mt-0.5">0</div>
            </div>

            <div className="bg-white/5 border border-amber-500/20 rounded-xl p-2.5 text-center backdrop-blur-md col-span-2 sm:col-span-1">
              <div className="text-[9px] font-mono text-amber-400 uppercase tracking-widest flex items-center justify-center gap-1">
                <Flame className="w-3 h-3" /> STREAK
              </div>
              <div className="text-xs font-bold text-amber-400 font-mono mt-0.5">0 DAYS</div>
            </div>
          </motion.div>
        )}

        {/* Phase 4+: Character Profile Reveal Card */}
        {phase >= 4 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="w-full max-w-lg bg-black/60 border border-cyan-500/30 rounded-2xl p-5 md:p-6 backdrop-blur-xl shadow-2xl shadow-cyan-950/50 relative overflow-hidden text-left"
          >
            {/* Ambient Background Reticles */}
            <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-cyan-400/50" />
            <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-cyan-400/50" />
            <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-cyan-400/50" />
            <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-cyan-400/50" />

            <div className="flex items-center gap-4 border-b border-white/10 pb-4">
              <div className="w-14 h-14 rounded-xl border border-cyan-400/40 bg-cyan-500/10 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)] shrink-0">
                <ClassIcon className="w-7 h-7" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
                  HUNTER CHARACTER CARD
                </div>
                <h3 className="text-xl md:text-2xl font-black text-white tracking-wide">
                  {userProfile.hunterName}
                </h3>
                <div className="text-xs text-purple-300 font-mono mt-0.5 flex items-center gap-2">
                  <span className="bg-purple-950/60 border border-purple-500/30 px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                    {userProfile.classTitle}
                  </span>
                  <span>•</span>
                  <span>LEVEL 1 ROOKIE</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 my-4 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
                <span className="text-zinc-400">DISCIPLINE SCORE</span>
                <span className="text-cyan-400 font-bold">0%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
                <span className="text-zinc-400">ACTIVE TITLE</span>
                <span className="text-purple-300 font-bold truncate">Awakened</span>
              </div>
            </div>

            {/* Locked Attributes Indication */}
            <div className="p-3 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between text-[11px] font-mono text-zinc-500">
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-zinc-600" />
                <span>ADVANCED ATTRIBUTES & RELICS</span>
              </div>
              <span className="text-zinc-600 uppercase tracking-wider font-bold">LOCKED</span>
            </div>
          </motion.div>
        )}

        {/* Phase 5+: Holographic System Terminal Message & Enter Button */}
        {phase >= 5 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-lg mt-5 flex flex-col items-center"
          >
            {/* Hologram Box */}
            <div className="w-full bg-[#050b14]/90 border border-cyan-500/40 rounded-xl p-4 font-mono text-left text-xs space-y-1 shadow-[0_0_25px_rgba(6,182,212,0.15)] relative backdrop-blur-md">
              <div className="text-[10px] text-cyan-500/60 border-b border-cyan-500/20 pb-1 mb-2 font-bold tracking-widest flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                CRUX OVERSEER HUD LOG
              </div>

              {systemLines.slice(0, typedMessageIndex).map((line, idx) => (
                <div key={`cin_sys_${idx}`} className="flex items-center gap-2 text-cyan-300 font-medium">
                  <span className="text-cyan-500 font-bold">&gt;</span>
                  <span>{line}</span>
                  {idx === typedMessageIndex - 1 && <span className="w-2 h-3 bg-cyan-400 animate-pulse inline-block" />}
                </div>
              ))}
            </div>

            {/* Glowing Enter CRUX Button */}
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: '0 0 35px rgba(6,182,212,0.6)' }}
              whileTap={{ scale: 0.97 }}
              onClick={handleEnterClick}
              className="mt-6 w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 text-white font-black font-mono tracking-[0.3em] uppercase text-sm shadow-[0_0_25px_rgba(6,182,212,0.35)] border border-cyan-300/40 flex items-center justify-center gap-3 group transition"
            >
              <span>▶ ENTER CRUX</span>
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
