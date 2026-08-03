import { AIConfig, AIMessage, UserProfile, BossState, ActivityLog } from '../types';
import { storageService } from './storageService';

const STORAGE_KEY_AI_CONFIG = 'crux_ai_config_v1';
const CHAT_HISTORY_PREFIX = 'crux_ai_chat_v1_';

export interface SendMessageOptions {
  user: UserProfile;
  bossState?: BossState;
  logs: ActivityLog[];
  query: string;
  conversationHistory: AIMessage[];
  onChunk: (chunk: string) => void;
  onComplete: (fullText: string, followUps: string[]) => void;
  onError: (error: { code?: string; message: string }) => void;
}

class AIService {
  private activeAbortController: AbortController | null = null;
  private currentConfig: AIConfig | null = null;

  constructor() {
    this.initProvider();
  }

  /**
   * Initializes or re-initializes the AI Provider settings
   */
  public initProvider(): AIConfig {
    const config = storageService.getAIConfig();
    this.currentConfig = config;

    console.log(`[AI_INIT] Provider initialized: ${config.provider}`);
    if (config.apiKey) {
      const maskedKey = config.apiKey.length > 8 
        ? `${config.apiKey.slice(0, 4)}••••${config.apiKey.slice(-4)}` 
        : '••••••••';
      console.log(`[AI_SERVICE] API key loaded: ${maskedKey}`);
    } else {
      console.log(`[AI_SERVICE] API key loaded: None (Using system default proxy fallback)`);
    }
    console.log(`[AI_SERVICE] Model loaded: ${config.model || 'gemini-3.6-flash'}`);

    return config;
  }

  /**
   * Returns current AIConfig
   */
  public getConfig(): AIConfig {
    if (!this.currentConfig) {
      return this.initProvider();
    }
    return this.currentConfig;
  }

  /**
   * Saves updated AI Config & re-initializes provider
   */
  public saveConfig(config: AIConfig): void {
    storageService.saveAIConfig(config);
    this.currentConfig = config;
    this.initProvider();
  }

  /**
   * Removes AI Config & reverts to default
   */
  public removeConfig(): void {
    storageService.removeAIConfig();
    this.currentConfig = null;
    this.initProvider();
  }

  /**
   * Load saved conversation history for user from localStorage
   */
  public getConversation(userId: string, userProfile: UserProfile, currentBoss: BossState): AIMessage[] {
    const key = `${CHAT_HISTORY_PREFIX}${userId}`;
    console.log(`[AI_SERVICE] Conversation initialized for user: ${userId}`);

    try {
      console.log(`[LOCAL_STORAGE_READ] ${key}`);
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed: AIMessage[] = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Clean up any stale streaming flags
          return parsed.map(m => ({ ...m, isStreaming: false }));
        }
      }
    } catch (e) {
      console.error(`[AI_SERVICE] Error loading conversation history for user ${userId}:`, e);
    }

    // Default welcome message if no history exists
    const welcomeMsg: AIMessage = {
      id: 'm_init',
      sender: 'mentor',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `## Welcome, Hunter ${userProfile.hunterName}. I am your **CRUX AI Mentor**.

I am your personal AI operating system, productivity strategist, fitness coach, study advisor, and life guide.

Whether you need a **workout program**, a **deep study plan**, **concept explanations**, **mindset coaching**, or just a **natural conversation**, I am here for you.

*Current Telemetry:*
- **Level ${userProfile.level}** (${userProfile.classTitle} | Rank: **${userProfile.rank}**)
- **Discipline Score:** ${userProfile.disciplineScore}% | **Streak:** ${userProfile.streak} Days
- **Raid Boss Target:** ${currentBoss.name} (${currentBoss.currentHp}/${currentBoss.maxHp} HP)

How can I assist your evolution today?`,
      followUps: [
        "Build a 4-hour Deep Work schedule for me",
        "Create a 20-minute bodyweight workout",
        "Analyze my current discipline & boss progress",
        "Explain how memory consolidation works"
      ]
    };

    const initialHistory = [welcomeMsg];
    this.saveConversation(userId, initialHistory);
    return initialHistory;
  }

  /**
   * Save conversation history to localStorage safely
   */
  public saveConversation(userId: string, messages: AIMessage[]): void {
    const key = `${CHAT_HISTORY_PREFIX}${userId}`;
    try {
      // Clean messages before saving (strip isStreaming flags and limit max storage history to last 50 messages)
      const cleanMessages = messages.slice(-50).map(({ isStreaming, ...rest }) => rest);
      console.log(`[LOCAL_STORAGE_WRITE] ${key}`);
      localStorage.setItem(key, JSON.stringify(cleanMessages));
    } catch (e) {
      console.error(`[AI_SERVICE] Error saving conversation history for user ${userId}:`, e);
    }
  }

  /**
   * Clear conversation history for user
   */
  public clearConversation(userId: string): void {
    const key = `${CHAT_HISTORY_PREFIX}${userId}`;
    try {
      console.log(`[LOCAL_STORAGE_WRITE] remove ${key}`);
      localStorage.removeItem(key);
      console.log(`[AI_SERVICE] Conversation cleared for user: ${userId}`);
    } catch (e) {
      console.error(`[AI_SERVICE] Error clearing conversation history for user ${userId}:`, e);
    }
  }

  /**
   * Abort any currently active streaming request
   */
  public abortActiveRequest(): void {
    if (this.activeAbortController) {
      console.log(`[AI_SERVICE] Aborting active streaming request.`);
      this.activeAbortController.abort();
      this.activeAbortController = null;
    }
  }

  /**
   * Sends a streaming message to /api/coach
   */
  public async sendMessageStream(options: SendMessageOptions): Promise<void> {
    const { user, bossState, logs, query, conversationHistory, onChunk, onComplete, onError } = options;

    // Abort previous stream if active
    this.abortActiveRequest();

    const controller = new AbortController();
    this.activeAbortController = controller;

    const config = this.getConfig();

    console.log(`[MODEL_CREATED] Model: ${config.model || 'gemini-3.6-flash'}`);
    console.log(`[STREAM_STARTED] Streaming started for query: "${query.slice(0, 40)}..."`);

    try {
      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          userProfile: user,
          bossState,
          recentLogs: logs.slice(0, 10),
          query,
          conversationHistory: conversationHistory.slice(-10).map(m => ({ sender: m.sender, text: m.text })),
          stream: true,
          customConfig: {
            provider: config.provider,
            apiKey: config.apiKey,
            model: config.model
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errMsg = errorData.message || errorData.error || 'Failed to connect to AI Mentor service.';
        console.error(`[AI_SERVICE] Error response (${response.status}):`, errMsg);
        
        onError({
          code: errorData.error,
          message: errMsg
        });
        return;
      }

      let accumulatedText = '';

      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunkText = decoder.decode(value, { stream: true });
          const lines = chunkText.split('\n');

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              const rawData = trimmed.replace('data: ', '').trim();
              if (rawData === '[DONE]') break;
              try {
                const parsed = JSON.parse(rawData);
                if (parsed.chunk) {
                  accumulatedText += parsed.chunk;
                  onChunk(parsed.chunk);
                }
              } catch (e) {
                // Ignore chunk parse glitches
              }
            }
          }
        }
      } else {
        const data = await response.json();
        accumulatedText = data.reply || 'CRUX AI Mentor operational.';
        onChunk(accumulatedText);
      }

      console.log(`[STREAM_ENDED] Streaming ended successfully.`);
      const followUps = this.deriveFollowUps(query, accumulatedText);
      onComplete(accumulatedText, followUps);

    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log(`[STREAM_ENDED] Request was aborted cleanly.`);
        return;
      }
      console.error(`[STREAM_ENDED] Error during streaming:`, err);
      onError({
        message: err.message || 'Connection error contacting AI Mentor service.'
      });
    } finally {
      if (this.activeAbortController === controller) {
        this.activeAbortController = null;
      }
    }
  }

  /**
   * Generates intelligent follow-up prompts
   */
  public deriveFollowUps(userQuery: string, aiReply: string): string[] {
    const lowerQ = userQuery.toLowerCase();
    if (lowerQ.includes('workout') || lowerQ.includes('exercise')) {
      return [
        "Convert this workout into actionable daily quests",
        "Give me nutrition advice for muscle recovery",
        "Adjust workout for home with no equipment"
      ];
    }
    if (lowerQ.includes('study') || lowerQ.includes('learn') || lowerQ.includes('explain')) {
      return [
        "Generate a 3-question quiz on this topic",
        "Create a revision schedule for the week",
        "Add a 45-minute study sprint to my quests"
      ];
    }
    if (lowerQ.includes('progress') || lowerQ.includes('boss') || lowerQ.includes('discipline')) {
      return [
        "How do I deal 100+ damage to Belphegor today?",
        "Give me a 3-step ritual to boost my Focus attribute",
        "Assign me 2 High-Reward Quests for tonight"
      ];
    }
    return [
      "Can you elaborate on step 1?",
      "How can I apply this to my daily routine?",
      "Create a custom quest based on this"
    ];
  }
}

export const aiService = new AIService();
