import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, ActivityLog, Quest, BossState, Attributes, AIConfig, AIMessage } from '../types';
import { 
  Bot, X, Send, Sparkles, Zap, Shield, ChevronRight, Copy, Check, Volume2, VolumeX, 
  Dumbbell, BookOpen, Lightbulb, BarChart2, Flame, Heart, Compass, Clock, Plus, RefreshCw, Trophy, Key, Cpu,
  ArrowDown, Trash2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { aiService } from '../services/aiService';
import { storageService } from '../services/storageService';
import { ConnectAIModal } from './ConnectAIModal';
import { AIErrorBoundary } from './AIErrorBoundary';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  logs: ActivityLog[];
  bossState?: BossState;
  onAddSuggestedQuest?: (quest: Omit<Quest, 'id' | 'isCompleted'>) => void;
}

export const AICoachDrawer: React.FC<Props> = React.memo(({ 
  isOpen, 
  onClose, 
  user, 
  logs, 
  bossState,
  onAddSuggestedQuest
}) => {
  console.log('[RENDER] AICoachDrawer', { isOpen, userId: user?.id });

  const currentBoss = bossState || (user ? storageService.getBossState(user.id) : null);
  
  const [aiConfig, setAiConfig] = useState<AIConfig>(() => aiService.getConfig());
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const [addedQuestsMap, setAddedQuestsMap] = useState<Record<string, boolean>>({});
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const userIsAtBottomRef = useRef<boolean>(true);
  const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mount / Unmount lifecycle logging
  useEffect(() => {
    console.log('[COMPONENT_MOUNT] AICoachDrawer mounted');
    return () => {
      console.log('[COMPONENT_UNMOUNT] AICoachDrawer unmounted');
    };
  }, []);

  // Initialize/Load Conversation when Drawer opens or user changes
  useEffect(() => {
    console.log('[USE_EFFECT] AICoachDrawer isOpen/userId effect triggered', { isOpen, userId: user?.id });
    if (isOpen && user) {
      console.log(`[DRAWER_OPEN] Drawer opened for user: ${user.id}`);
      const loadedHistory = aiService.getConversation(user.id, user, currentBoss);
      console.log('[STATE_UPDATE] setMessages from loaded conversation history:', loadedHistory.length);
      setMessages(loadedHistory);
      console.log('[STATE_UPDATE] setAiConfig');
      setAiConfig(aiService.getConfig());

      // Lock body scroll
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      // Focus input with clean timeout cleanup
      if (focusTimeoutRef.current) clearTimeout(focusTimeoutRef.current);
      focusTimeoutRef.current = setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
        textareaRef.current?.focus();
      }, 80);
    } else {
      console.log(`[DRAWER_CLOSE] Drawer closed.`);
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';

      // Cancel speech synthesis and abort pending requests on close
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      console.log('[STATE_UPDATE] setIsSpeaking(null)');
      setIsSpeaking(null);
    }

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      if (focusTimeoutRef.current) clearTimeout(focusTimeoutRef.current);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isOpen, user?.id]);

  // Smooth scroll to bottom handler
  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
      userIsAtBottomRef.current = true;
      setShowScrollToBottom(false);
    }
  }, []);

  // Monitor user scroll position (Guarded against state update storms)
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const isAtBottom = distanceFromBottom < 90;
    userIsAtBottomRef.current = isAtBottom;

    // Only set state if changed to avoid unnecessary re-renders during smooth scroll
    setShowScrollToBottom(prev => {
      const needed = !isAtBottom;
      if (prev !== needed) {
        console.log('[STATE_UPDATE] setShowScrollToBottom:', needed);
      }
      return prev === needed ? prev : needed;
    });
  }, []);

  // Instant scroll on message updates if user was at bottom
  useEffect(() => {
    console.log('[USE_EFFECT] AICoachDrawer scroll effect triggered', { messageCount: messages.length, isOpen });
    if (isOpen && userIsAtBottomRef.current && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // Adjust textarea height on input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputQuery(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const quickActionPrompts = useMemo(() => [
    { label: '🏋️ Create Workout', query: 'Design a structured 30-minute workout routine for me today with exercises, sets, and reps.' },
    { label: '📚 Build Study Plan', query: 'Build a high-impact 4-hour study plan with time blocking and revision techniques.' },
    { label: '🧠 Explain Topic', query: 'Explain the core principles of quantum computing in simple, engaging terms.' },
    { label: '📊 Analyze My Progress', query: 'Evaluate my Level, Discipline Score, Streak, and Boss Raid standing. What is my next priority?' },
    { label: '⚡ Daily Motivation', query: 'Give me a grounded, powerful mindset boost to stay disciplined today.' },
    { label: '🛡️ Improve Discipline', query: 'How can I build unshakeable focus and eliminate procrastination starting right now?' },
    { label: '🥗 Nutrition Advice', query: 'Provide practical advice on hydration, protein intake, and energy management for optimal focus.' },
    { label: '⏱️ Productivity Tips', query: 'Share 3 actionable time-management hacks based on cognitive science.' },
  ], []);

  const handleSend = useCallback(async (customQuery?: string) => {
    const queryToSend = (customQuery || inputQuery).trim();
    if (!queryToSend || loading || !user) return;

    if (!customQuery) {
      setInputQuery('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: AIMessage = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      sender: 'user',
      text: queryToSend,
      timestamp
    };

    const mentorMsgId = 'msg_ai_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const placeholderMentorMsg: AIMessage = {
      id: mentorMsgId,
      sender: 'mentor',
      text: '',
      timestamp,
      isStreaming: true
    };

    const updatedHistory = [...messages, userMsg];
    console.log('[STATE_UPDATE] setMessages (adding user message & placeholder)');
    setMessages([...updatedHistory, placeholderMentorMsg]);
    console.log('[STATE_UPDATE] setLoading(true), setIsStreaming(true)');
    setLoading(true);
    setIsStreaming(true);

    userIsAtBottomRef.current = true;
    scrollToBottom(false);

    let accumulatedText = '';

    await aiService.sendMessageStream({
      user,
      bossState: currentBoss,
      logs,
      query: queryToSend,
      conversationHistory: updatedHistory,
      onChunk: (chunk) => {
        accumulatedText += chunk;
        setMessages(prev => prev.map(m => m.id === mentorMsgId ? {
          ...m,
          text: accumulatedText
        } : m));

        if (userIsAtBottomRef.current && messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      },
      onComplete: (fullText, followUps) => {
        const finalMessages = updatedHistory.concat({
          id: mentorMsgId,
          sender: 'mentor',
          text: fullText || accumulatedText || 'CRUX AI Mentor operational.',
          timestamp,
          followUps,
          isStreaming: false
        });

        console.log('[STATE_UPDATE] setMessages (stream completed)');
        setMessages(finalMessages);
        aiService.saveConversation(user.id, finalMessages);

        console.log('[STATE_UPDATE] setLoading(false), setIsStreaming(false)');
        setLoading(false);
        setIsStreaming(false);
        if (userIsAtBottomRef.current && messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      },
      onError: (err) => {
        if (err.code === 'NO_AI_KEY') {
          console.log('[STATE_UPDATE] setIsConnectModalOpen(true)');
          setIsConnectModalOpen(true);
        }
        const errorText = `⚠️ **AI CONNECTION NOTICE:** ${err.message}`;
        const finalMessages = updatedHistory.concat({
          id: mentorMsgId,
          sender: 'mentor',
          text: errorText,
          timestamp,
          isStreaming: false
        });

        console.log('[STATE_UPDATE] setMessages (stream error)');
        setMessages(finalMessages);
        aiService.saveConversation(user.id, finalMessages);

        console.log('[STATE_UPDATE] setLoading(false), setIsStreaming(false)');
        setLoading(false);
        setIsStreaming(false);
      }
    });
  }, [inputQuery, loading, messages, user, currentBoss, logs, scrollToBottom]);

  const handleCopy = useCallback((id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const handleSpeak = useCallback((id: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking === id) {
      window.speechSynthesis.cancel();
      setIsSpeaking(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`~\[\]()]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText.slice(0, 500));
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(null);
    utterance.onerror = () => setIsSpeaking(null);

    setIsSpeaking(id);
    window.speechSynthesis.speak(utterance);
  }, [isSpeaking]);

  const handleClearHistory = useCallback(() => {
    if (!user) return;
    if (window.confirm('Clear AI Mentor conversation history?')) {
      aiService.clearConversation(user.id);
      const resetMessages = aiService.getConversation(user.id, user, currentBoss);
      setMessages(resetMessages);
    }
  }, [user, currentBoss]);

  const extractAndAddQuests = useCallback((msgId: string, text: string) => {
    if (!onAddSuggestedQuest) return;

    const lines = text.split('\n');
    const bulletLines = lines.filter(l => l.trim().startsWith('•') || l.trim().startsWith('-') || l.trim().startsWith('*') || /^\d+\./.test(l.trim()));

    if (bulletLines.length === 0) return;

    bulletLines.slice(0, 4).forEach((line) => {
      let cleanTitle = line.replace(/^[•\-\*\d\.\s]+/, '').replace(/\[.*?\]/, '').trim();
      if (cleanTitle.length > 60) cleanTitle = cleanTitle.slice(0, 60) + '...';

      if (cleanTitle.length > 5) {
        let statReward: keyof Attributes = 'Focus';
        if (cleanTitle.toLowerCase().includes('workout') || cleanTitle.toLowerCase().includes('pushup') || cleanTitle.toLowerCase().includes('run')) {
          statReward = 'Strength';
        } else if (cleanTitle.toLowerCase().includes('water') || cleanTitle.toLowerCase().includes('sleep') || cleanTitle.toLowerCase().includes('stretch')) {
          statReward = 'Health';
        } else if (cleanTitle.toLowerCase().includes('learn') || cleanTitle.toLowerCase().includes('read') || cleanTitle.toLowerCase().includes('study')) {
          statReward = 'Knowledge';
        }

        onAddSuggestedQuest({
          title: cleanTitle,
          description: `Generated by CRUX AI Mentor: ${cleanTitle}`,
          category: 'daily',
          difficulty: 'medium',
          statReward,
          statAmount: 2,
          xpReward: 50,
          coinReward: 35,
          diamondReward: 2,
          iconName: 'Zap'
        });
      }
    });

    setAddedQuestsMap(prev => ({ ...prev, [msgId]: true }));
  }, [onAddSuggestedQuest]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-md overflow-hidden">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            className="w-full max-w-2xl bg-[#090c19] border-l border-purple-500/40 text-white h-full max-h-full flex flex-col shadow-2xl relative overflow-hidden"
          >
            <AIErrorBoundary onReset={() => setMessages(aiService.getConversation(user.id, user, currentBoss))}>
              {/* 1. STICKY HEADER HUD */}
              <div className="flex-shrink-0 p-3.5 sm:p-4 border-b border-purple-900/50 bg-[#060812] flex items-center justify-between z-10 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 p-0.5 shadow-[0_0_20px_rgba(147,51,234,0.4)]">
                    <div className="w-full h-full bg-[#0d0f1a] rounded-[14px] flex items-center justify-center">
                      <Bot className="w-5 h-5 text-purple-400 animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <div className="font-black text-xs sm:text-sm text-white font-mono flex items-center gap-2">
                      CRUX AI MENTOR
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[9px] text-emerald-400 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> ONLINE
                      </span>
                    </div>
                    <div className="text-[10px] text-purple-300/80 font-mono hidden sm:block">
                      PERSONAL OPERATING SYSTEM • PRODUCTIVITY & FITNESS COACH
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClearHistory}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-300 hover:bg-rose-950/40 transition cursor-pointer"
                    title="Clear Conversation History"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setIsConnectModalOpen(true)}
                    className="px-2.5 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/40 text-purple-200 text-[11px] font-mono font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                    title="Configure AI Provider & Key"
                  >
                    <Cpu className="w-3.5 h-3.5 text-purple-400" />
                    <span className="hidden sm:inline">
                      {aiConfig.provider === 'server_default' ? 'Gemini Key' : `${aiConfig.provider.toUpperCase()}`}
                    </span>
                  </button>

                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition cursor-pointer"
                    title="Close Drawer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* 2. HUNTER LIVE TELEMETRY PILL BAR */}
              <div className="flex-shrink-0 px-4 py-2 bg-[#0c0f20] border-b border-purple-900/30 flex items-center justify-between text-[11px] font-mono text-slate-300 overflow-x-auto scrollbar-none z-10">
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold whitespace-nowrap">
                  <Trophy className="w-3.5 h-3.5 text-cyan-400" /> LVL {user?.level ?? 1} {user?.classTitle ?? 'Shadow'}
                </div>
                <div className="flex items-center gap-1 text-purple-300 font-bold whitespace-nowrap">
                  <Zap className="w-3.5 h-3.5 text-purple-400" /> DISCIPLINE: {user?.disciplineScore ?? 0}%
                </div>
                <div className="flex items-center gap-1 text-amber-400 font-bold whitespace-nowrap">
                  <Flame className="w-3.5 h-3.5 text-amber-400" /> STREAK: {user?.streak ?? 0}D
                </div>
              </div>

              {/* 3. QUICK ACTION CHIPS CAROUSEL */}
              <div className="flex-shrink-0 scrollable-chips p-2.5 sm:p-3 bg-[#0a0d1d] border-b border-purple-900/40 gap-2 z-10">
                {quickActionPrompts.map((act) => (
                  <button
                    key={`qa_${act.label}`}
                    onClick={(e) => {
                      handleSend(act.query);
                      (e.currentTarget as HTMLElement).scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                    }}
                    disabled={loading}
                    className="scrollable-chip-item px-3 py-1.5 rounded-xl bg-[#14182f] hover:bg-purple-900/50 border border-purple-800/40 text-purple-200 hover:text-white text-[11px] font-mono transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {act.label}
                  </button>
                ))}
              </div>

              {/* 4. MESSAGES SCROLL CONTAINER */}
              <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3 sm:p-5 scrollbar-thin relative bg-[#090c19]"
              >
                <div className="max-w-[720px] mx-auto w-full space-y-6">
                  {messages.map((msg) => {
                    const isUser = msg.sender === 'user';
                    return (
                      <motion.div
                        key={`msg_${msg.id}`}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                      >
                        {/* Sender Avatar & Header */}
                        <div className={`flex items-center gap-2 mb-1.5 text-[10px] font-mono text-slate-400 px-1 ${isUser ? 'flex-row-reverse' : ''}`}>
                          <span className="font-bold text-slate-300">
                            {isUser ? (user?.hunterName || 'Hunter') : 'CRUX AI Mentor'}
                          </span>
                          <span>•</span>
                          <span>{msg.timestamp}</span>
                        </div>

                        {/* Chat Bubble Container */}
                        <div
                          className={`w-full rounded-2xl p-4 sm:p-5 text-xs sm:text-[13px] leading-relaxed shadow-xl relative transition-all duration-200 ${
                            isUser
                              ? 'max-w-[88%] sm:max-w-[80%] bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 text-white font-medium rounded-tr-sm shadow-cyan-900/20'
                              : 'max-w-[96%] sm:max-w-[90%] bg-[#12162a] border border-purple-500/30 text-slate-200 rounded-tl-sm shadow-purple-950/20'
                          }`}
                        >
                          {isUser ? (
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                          ) : (
                            <div className="space-y-3">
                              {/* Streaming/Typing Animation State */}
                              {msg.text === '' ? (
                                <div className="flex items-center gap-2 py-1.5 text-purple-300 font-mono text-xs">
                                  <Sparkles className="w-4 h-4 animate-spin text-purple-400" />
                                  <span className="animate-pulse">Synthesizing intelligence...</span>
                                  <div className="flex items-center gap-1 ml-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping [animation-delay:0.2s]" />
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping [animation-delay:0.4s]" />
                                  </div>
                                </div>
                              ) : (
                                <div className="markdown-body text-slate-200 text-xs sm:text-[13px] leading-relaxed">
                                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                                  {msg.isStreaming && (
                                    <span className="inline-block w-2 h-4 ml-1 bg-cyan-400 animate-pulse align-middle font-bold" />
                                  )}
                                </div>
                              )}

                              {/* Actions bar for Mentor responses */}
                              {!msg.isStreaming && msg.text !== '' && (
                                <div className="pt-3 border-t border-purple-900/40 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleCopy(msg.id, msg.text)}
                                      className="px-2.5 py-1 rounded-lg bg-black/40 hover:bg-black/60 text-slate-300 flex items-center gap-1 transition cursor-pointer border border-white/5"
                                    >
                                      {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                      <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                                    </button>

                                    <button
                                      onClick={() => handleSpeak(msg.id, msg.text)}
                                      className="px-2.5 py-1 rounded-lg bg-black/40 hover:bg-black/60 text-slate-300 flex items-center gap-1 transition cursor-pointer border border-white/5"
                                    >
                                      {isSpeaking === msg.id ? <VolumeX className="w-3 h-3 text-amber-400" /> : <Volume2 className="w-3 h-3" />}
                                      <span>{isSpeaking === msg.id ? 'Stop Voice' : 'Listen'}</span>
                                    </button>
                                  </div>

                                  {/* Add to Quests button */}
                                  {msg.text.includes('•') && onAddSuggestedQuest && (
                                    <button
                                      onClick={() => extractAndAddQuests(msg.id, msg.text)}
                                      disabled={addedQuestsMap[msg.id]}
                                      className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition cursor-pointer ${
                                        addedQuestsMap[msg.id]
                                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                          : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30'
                                      }`}
                                    >
                                      {addedQuestsMap[msg.id] ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                                      <span>{addedQuestsMap[msg.id] ? 'Missions Added!' : 'Add to Quests'}</span>
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Follow-up suggestion chips */}
                        {!isUser && msg.followUps && msg.followUps.length > 0 && !msg.isStreaming && (
                          <div className="mt-2.5 flex flex-wrap gap-1.5 max-w-[96%] sm:max-w-[90%]">
                            {msg.followUps.map((f) => (
                              <button
                                key={`fup_${msg.id}_${f}`}
                                onClick={() => handleSend(f)}
                                disabled={loading}
                                className="text-[10px] font-mono px-3 py-1.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800/30 text-purple-300 hover:text-white transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-sm active:scale-95"
                              >
                                <ChevronRight className="w-3 h-3 text-purple-400 shrink-0" />
                                <span>{f}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Snap to Bottom Button */}
                <AnimatePresence>
                  {showScrollToBottom && (
                    <motion.button
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                      onClick={() => scrollToBottom(true)}
                      className="absolute bottom-4 right-6 z-20 px-3.5 py-2 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold shadow-2xl flex items-center gap-2 border border-purple-400/40 cursor-pointer transition active:scale-95"
                    >
                      <ArrowDown className="w-4 h-4 animate-bounce" />
                      <span>Scroll to latest</span>
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* 5. STICKY INPUT COMPOSER */}
              <div className="flex-shrink-0 p-3 sm:p-4 border-t border-purple-900/50 bg-[#060812] z-20 shadow-2xl">
                <div className="max-w-[720px] mx-auto w-full">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSend();
                    }}
                    className="relative flex items-center"
                  >
                    <textarea
                      ref={textareaRef}
                      rows={1}
                      value={inputQuery}
                      onChange={handleInputChange}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="Ask CRUX AI Mentor anything (study plan, workout, advice, code, general knowledge)..."
                      className="w-full bg-[#12162a] border border-purple-900/60 focus:border-purple-500 rounded-2xl py-3 pl-4 pr-12 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition shadow-inner resize-none min-h-[44px] max-h-[120px] scrollbar-thin"
                    />
                    <button
                      type="submit"
                      disabled={loading || !inputQuery.trim()}
                      className="absolute right-2.5 bottom-2.5 p-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white transition disabled:opacity-30 shadow-lg shadow-purple-600/30 cursor-pointer flex items-center justify-center"
                      title="Send Message (Enter)"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                  <div className="mt-1.5 flex items-center justify-between px-1 text-[10px] font-mono text-slate-500">
                    <span className="hidden sm:inline">Press Enter to send • Shift+Enter for new line</span>
                    <span className="sm:hidden">Enter to send</span>
                    <span className="text-purple-400 font-bold">
                      {aiConfig.provider === 'server_default' ? 'Gemini 3.6 Flash' : aiConfig.model || aiConfig.provider}
                    </span>
                  </div>
                </div>
              </div>
            </AIErrorBoundary>
          </motion.div>
        </div>
      )}

      <ConnectAIModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onConfigSaved={(cfg) => {
          aiService.saveConfig(cfg);
          setAiConfig(cfg);
        }}
      />
    </AnimatePresence>
  );
});
