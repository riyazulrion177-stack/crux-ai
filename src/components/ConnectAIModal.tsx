import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Key, ShieldCheck, Cpu, Eye, EyeOff, Check, AlertTriangle, RefreshCw, Zap, Sparkles, Trash2 } from 'lucide-react';
import { AIConfig, AIProvider } from '../types';
import { aiService } from '../services/aiService';
import { storageService } from '../services/storageService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved?: (config: AIConfig) => void;
}

const PROVIDER_PRESETS: Record<AIProvider, { name: string; defaultModel: string; models: string[]; iconBg: string; docsUrl: string }> = {
  gemini: {
    name: 'Google Gemini',
    defaultModel: 'gemini-3.6-flash',
    models: ['gemini-3.6-flash', 'gemini-2.5-pro', 'gemini-2.5-flash'],
    iconBg: 'from-blue-600 to-indigo-600',
    docsUrl: 'https://aistudio.google.com/app/apikey'
  },
  openai: {
    name: 'OpenAI',
    defaultModel: 'gpt-4o-mini',
    models: ['gpt-4o-mini', 'gpt-4o', 'gpt-5.5'],
    iconBg: 'from-emerald-600 to-teal-600',
    docsUrl: 'https://platform.openai.com/api-keys'
  },
  anthropic: {
    name: 'Anthropic Claude',
    defaultModel: 'claude-3-5-sonnet-20241022',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'],
    iconBg: 'from-amber-600 to-orange-600',
    docsUrl: 'https://console.anthropic.com/settings/keys'
  },
  server_default: {
    name: 'System Default Gemini Key',
    defaultModel: 'gemini-3.6-flash',
    models: ['gemini-3.6-flash'],
    iconBg: 'from-purple-600 to-indigo-600',
    docsUrl: 'https://aistudio.google.com/'
  }
};

export const ConnectAIModal: React.FC<Props> = ({ isOpen, onClose, onConfigSaved }) => {
  const [config, setConfig] = useState<AIConfig>({
    provider: 'gemini',
    apiKey: '',
    model: 'gemini-3.6-flash',
    isConfigured: false
  });

  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      const saved = aiService.getConfig();
      setConfig(saved);
      setTestResult(null);
      setStatusMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleProviderChange = (prov: AIProvider) => {
    const preset = PROVIDER_PRESETS[prov];
    setConfig(prev => ({
      ...prev,
      provider: prov,
      model: preset.defaultModel,
      apiKey: prov === 'server_default' ? '' : prev.apiKey
    }));
    setTestResult(null);
  };

  const maskApiKey = (key: string) => {
    if (!key) return '';
    if (key.length <= 8) return '••••••••';
    return key.slice(0, 4) + '••••••••' + key.slice(-4);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'System diagnostics ping. Confirm neural link.',
          customConfig: {
            provider: config.provider,
            apiKey: config.apiKey,
            model: config.model
          }
        })
      });

      const data = await res.json();
      if (res.ok && data.reply) {
        setTestResult({
          success: true,
          message: `Connection Verified! Model (${data.model || config.model}) responded successfully.`
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || data.message || 'API test failed. Please verify your API Key.'
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Network error attempting to contact backend proxy.'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (config.provider !== 'server_default' && !config.apiKey.trim()) {
      setStatusMsg('⚠️ Please enter an API key for your chosen provider.');
      return;
    }

    const newConfig: AIConfig = {
      ...config,
      apiKey: config.apiKey.trim(),
      isConfigured: true
    };

    aiService.saveConfig(newConfig);
    setConfig(newConfig);
    setStatusMsg('✅ AI Provider & Key configuration saved securely!');
    if (onConfigSaved) onConfigSaved(newConfig);

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleRemoveKey = () => {
    aiService.removeConfig();
    const resetConfig: AIConfig = {
      provider: 'server_default',
      apiKey: '',
      model: 'gemini-3.6-flash',
      isConfigured: false
    };
    setConfig(resetConfig);
    setTestResult(null);
    setStatusMsg('ℹ️ AI Key removed. Reverted to server default settings.');
    if (onConfigSaved) onConfigSaved(resetConfig);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-[#0d0f1e] border border-purple-500/40 rounded-2xl p-6 shadow-2xl text-white relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 p-0.5 shadow-[0_0_15px_rgba(147,51,234,0.4)]">
            <div className="w-full h-full bg-[#090b16] rounded-[10px] flex items-center justify-center text-purple-400">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-black text-white font-mono tracking-tight flex items-center gap-2">
              CONNECT YOUR AI
            </h2>
            <p className="text-xs text-purple-300/80">
              Power CRUX AI Mentor with your official LLM API key.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 mt-5">
          {/* Provider Selection */}
          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 mb-2">
              SELECT AI PROVIDER
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['gemini', 'openai', 'anthropic', 'server_default'] as AIProvider[]).map((prov) => {
                const preset = PROVIDER_PRESETS[prov];
                const isSelected = config.provider === prov;
                return (
                  <button
                    key={`prov_${prov}`}
                    type="button"
                    onClick={() => handleProviderChange(prov)}
                    className={`p-3 rounded-xl border text-left transition-all relative ${
                      isSelected
                        ? 'bg-[#181c38] border-purple-500 text-white shadow-lg shadow-purple-900/30'
                        : 'bg-[#101326] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold">{preset.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-purple-400" />}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {prov === 'server_default' ? 'Built-in Key' : `Model: ${preset.defaultModel}`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* API Key Input (if not server default) */}
          {config.provider !== 'server_default' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-purple-400" />
                  API KEY ({PROVIDER_PRESETS[config.provider].name})
                </label>
                <a
                  href={PROVIDER_PRESETS[config.provider].docsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-purple-400 hover:underline font-mono"
                >
                  Get Key &rarr;
                </a>
              </div>

              <div className="relative flex items-center">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={config.apiKey}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  placeholder={`Paste your ${PROVIDER_PRESETS[config.provider].name} API Key here...`}
                  className="w-full bg-[#121528] border border-purple-900/50 focus:border-purple-500 rounded-xl py-2.5 pl-3 pr-10 text-xs font-mono text-white placeholder-slate-600 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 text-slate-500 hover:text-slate-300"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {config.isConfigured && config.apiKey && (
                <div className="mt-1 text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <span>Saved Key:</span>
                  <span className="text-purple-300 font-bold">{maskApiKey(config.apiKey)}</span>
                </div>
              )}
            </div>
          )}

          {/* Model Selection */}
          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 mb-1.5">
              MODEL SELECTION
            </label>
            <select
              value={config.model}
              onChange={(e) => setConfig({ ...config, model: e.target.value })}
              className="w-full bg-[#121528] border border-purple-900/50 focus:border-purple-500 rounded-xl p-2.5 text-xs font-mono text-white outline-none"
            >
              {PROVIDER_PRESETS[config.provider].models.map((m) => (
                <option key={`opt_${m}`} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Security Notice */}
          <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-800/30 text-[11px] font-mono text-purple-200/80 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white">Zero Hardcoding & Server Proxy Protection</div>
              Your API key is never committed or exposed client-side. Requests are proxied via backend route `/api/coach`.
            </div>
          </div>

          {/* Test Status Feedback */}
          {testResult && (
            <div className={`p-3 rounded-xl border text-xs font-mono flex items-start gap-2 ${
              testResult.success
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
            }`}>
              {testResult.success ? <Check className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />}
              <div>{testResult.message}</div>
            </div>
          )}

          {statusMsg && (
            <div className="text-xs font-mono text-amber-300 p-2 rounded bg-amber-950/30 border border-amber-500/30">
              {statusMsg}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              className="px-3.5 py-2.5 rounded-xl bg-[#161a33] hover:bg-purple-900/40 border border-purple-700/40 text-purple-200 text-xs font-mono font-bold flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin text-purple-400' : ''}`} />
              <span>{testing ? 'Testing...' : 'Test Connection'}</span>
            </button>

            <div className="flex items-center gap-2">
              {config.isConfigured && config.provider !== 'server_default' && (
                <button
                  type="button"
                  onClick={handleRemoveKey}
                  className="p-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 text-xs font-mono transition"
                  title="Remove Key & Reset"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-mono font-bold shadow-lg shadow-purple-600/30 transition active:scale-95"
              >
                Save & Connect
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
