import React, { useState } from 'react';
import { useAppStore } from '../store';
import { ThreatConfig, Rule } from '../types';
import { 
  Bell, Shield, AlertTriangle, CheckCircle2, Trash2, 
  Wand2, Plus, Check, Play, Info, Eye, ShieldAlert, Sparkles, RefreshCw,
  Brain, Key, Globe, EyeOff, Cpu
} from 'lucide-react';

export default function SettingsView() {
  const { 
    threatConfigs, updateThreatConfig, 
    securityAlerts, dismissSecurityAlert, clearSecurityAlerts,
    addRule, setActiveView, aiConfig, updateAiConfig, resetToDefaults
  } = useAppStore();

  const [showApiKey, setShowApiKey] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Regex Builder State
  const [builderType, setBuilderType] = useState<'redirect' | 'param' | 'bypass'>('redirect');
  const [sourceDomain, setSourceDomain] = useState('instagram.com');
  const [targetDomain, setTargetDomain] = useState('ddinstagram.com');
  const [paramName, setParamName] = useState('utm_source');
  const [bypassParam, setBypassParam] = useState('q');
  const [ruleName, setRuleName] = useState('Instagram ➔ DDInstagram');
  const [isDecode, setIsDecode] = useState(false);
  const [builderSuccess, setBuilderSuccess] = useState(false);

  // Helper to compute live preview of Regex
  const getGeneratedRegex = () => {
    if (builderType === 'redirect') {
      const escapedDomain = sourceDomain.replace(/\./g, '\\\\.');
      return `^https?:\\\\/\\\\/(?:[a-z0-9-]+\\\\.)?${escapedDomain}\\\\/(.*)`;
    } else if (builderType === 'param') {
      const escapedParam = paramName.replace(/\./g, '\\\\.');
      return `[?&]${escapedParam}=[^&]*`;
    } else {
      // bypass redirect
      const escapedDomain = sourceDomain.replace(/\./g, '\\\\.');
      return `^https?:\\\\/\\\\/(?:[a-z0-9-]+\\\\.)?${escapedDomain}\\\\/.*[?&]${bypassParam}=([^&]+)`;
    }
  };

  const getGeneratedReplacement = () => {
    if (builderType === 'redirect') {
      return `https://${targetDomain}/$1`;
    } else if (builderType === 'param') {
      return '';
    } else {
      return '$1';
    }
  };

  const handleBuildRule = () => {
    const regex = getGeneratedRegex();
    const replacement = getGeneratedReplacement();
    
    addRule({
      name: ruleName || `Regra Gerada (${sourceDomain})`,
      active: true,
      regex,
      replacement,
      isDecode: builderType === 'bypass' || isDecode
    });

    setBuilderSuccess(true);
    setTimeout(() => {
      setBuilderSuccess(false);
    }, 3000);
  };

  const activeAlerts = securityAlerts.filter(a => !a.dismissed);

  // Styling helper for priorities
  const getPriorityBadge = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_8px_rgba(239,68,68,0.2)]">
            CRÍTICO
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            MÉDIO
          </span>
        );
      case 'low':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            BAIXO
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Description */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0f111a] border border-slate-800/60 p-6 rounded-3xl">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-400" /> Configuração de Alertas e Segurança
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gira os gatilhos das notificações de ameaças em tempo real e utilize o assistente de construção de Regex.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500">Alertas Ativos:</span>
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {activeAlerts.length}
          </span>
        </div>
      </div>

      {/* GitHub Pages Tutorial Banner */}
      <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 tracking-wide uppercase">
            Guia de Implantação
          </span>
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5 mt-1">
            Como publicar este URLGuard no GitHub Pages grátis?
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
            Toda a lógica de higienização de URLs, regras customizadas e inteligência artificial do app corre **100% no navegador**. Para hospedar de graça no GitHub Pages:
            <span className="block mt-1 font-mono text-[11px] text-indigo-300">
              1. Exporte o projeto (como ZIP ou GitHub pelo menu superior) ➔ 2. Faça o upload para o GitHub ➔ 3. Ative o GitHub Pages nas Definições do repositório apontando para a pasta <code className="bg-slate-900 px-1 py-0.5 rounded text-white">dist/</code> com a sua build!
            </span>
          </p>
        </div>
        <a 
          href="https://pages.github.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="shrink-0 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 transition flex items-center gap-1 cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5" /> Abrir GitHub Pages
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Notification settings & active alerts list */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Threat Notification triggers */}
          <div className="bg-[#0f111a] border border-slate-800/60 rounded-3xl p-6 shadow-xl">
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-400" /> Gatilhos de Ameaça Customizados
            </h2>
            
            <div className="divide-y divide-slate-800/60 space-y-4">
              {threatConfigs.map((config) => (
                <div key={config.id} className="pt-4 first:pt-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1 max-w-md">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{config.name}</span>
                      {getPriorityBadge(config.priority)}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{config.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0">
                    {/* Priority Selector */}
                    <div className="flex bg-[#05060a] border border-slate-800 rounded-lg p-0.5">
                      {(['low', 'medium', 'high'] as const).map((level) => (
                        <button
                          key={level}
                          onClick={() => updateThreatConfig(config.id, { priority: level })}
                          className={`px-2 py-1 text-[10px] font-bold rounded-md transition-colors capitalize ${
                            config.priority === level 
                              ? level === 'high' ? 'bg-rose-500/20 text-rose-400' 
                                : level === 'medium' ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-indigo-500/20 text-indigo-400'
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {level === 'low' ? 'Baixo' : level === 'medium' ? 'Médio' : 'Alta'}
                        </button>
                      ))}
                    </div>

                    {/* Enable Switch */}
                    <button
                      onClick={() => updateThreatConfig(config.id, { enabled: !config.enabled })}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        config.enabled ? 'bg-indigo-600' : 'bg-slate-800'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          config.enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Triggered security alerts log */}
          <div className="bg-[#0f111a] border border-slate-800/60 rounded-3xl p-6 shadow-xl flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xs font-bold text-rose-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" /> Registo de Alertas de Segurança
              </h2>
              {securityAlerts.length > 0 && (
                <button 
                  onClick={clearSecurityAlerts} 
                  className="text-xs text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Limpar Histórico
                </button>
              )}
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
              {securityAlerts.length > 0 ? (
                securityAlerts.map((alert) => (
                  <div 
                    key={alert.id} 
                    className={`p-4 rounded-2xl border transition-all duration-300 flex items-start gap-3 relative overflow-hidden ${
                      alert.dismissed 
                        ? 'bg-[#05060a]/40 border-slate-900 opacity-60' 
                        : alert.priority === 'high' 
                          ? 'bg-rose-950/10 border-rose-900/40 shadow-[inset_0_1px_20px_rgba(244,63,94,0.05)]' 
                          : alert.priority === 'medium' 
                            ? 'bg-amber-950/10 border-amber-900/40' 
                            : 'bg-indigo-950/10 border-indigo-900/40'
                    }`}
                  >
                    {/* Border highlight */}
                    <div className={`absolute top-0 bottom-0 left-0 w-1 ${
                      alert.priority === 'high' ? 'bg-rose-500' : alert.priority === 'medium' ? 'bg-amber-500' : 'bg-indigo-500'
                    }`} />

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white">{alert.threatName}</span>
                        {getPriorityBadge(alert.priority)}
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                        {alert.dismissed && (
                          <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-bold">LIDO</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{alert.message}</p>
                      <p className="text-[10px] text-indigo-400/80 font-mono truncate break-all selection:bg-indigo-500">{alert.url}</p>
                    </div>

                    {!alert.dismissed && (
                      <button 
                        onClick={() => dismissSecurityAlert(alert.id)}
                        className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
                        title="Marcar como lido"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 bg-[#05060a]/30 rounded-2xl border border-slate-900">
                  <span className="text-xs text-slate-500 block">Nenhum alerta de segurança registado recentemente.</span>
                  <p className="text-[10px] text-slate-600 mt-1 max-w-xs mx-auto">Cole URLs suspeitas na aba do Analisador para testar a deteção de ameaças automatizada.</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Dynamic Regex Helper Constructor */}
        <div className="lg:col-span-5">
          <div className="bg-gradient-to-b from-[#111322] to-[#0f111a] border border-indigo-500/15 rounded-3xl p-6 shadow-2xl space-y-6">
            
            <div className="space-y-1">
              <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-indigo-400" /> Construtor de Regex URLGuard
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Crie regras de bypass ou redirecionamento sem tocar em expressões regulares complexas.
              </p>
            </div>

            {/* Type selector */}
            <div className="grid grid-cols-3 gap-2 bg-[#05060a] p-1 rounded-xl border border-slate-800/80">
              <button
                onClick={() => {
                  setBuilderType('redirect');
                  setRuleName('Instagram ➔ DDInstagram');
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-colors ${
                  builderType === 'redirect' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Redirecionar
              </button>
              <button
                onClick={() => {
                  setBuilderType('param');
                  setRuleName('Remover Parâmetro Custom');
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-colors ${
                  builderType === 'param' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Remover Param
              </button>
              <button
                onClick={() => {
                  setBuilderType('bypass');
                  setRuleName('Desviar Redirecionamento URL');
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-colors ${
                  builderType === 'bypass' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Desviar Redir
              </button>
            </div>

            {/* Fields based on selected type */}
            <div className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nome Amigável da Regra</label>
                <input 
                  type="text" 
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  className="w-full bg-[#05060a] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-indigo-300 outline-none focus:border-indigo-500/50"
                  placeholder="Nome amigável da regra"
                />
              </div>

              {builderType === 'redirect' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Domínio Original</label>
                    <input 
                      type="text" 
                      value={sourceDomain}
                      onChange={(e) => {
                        setSourceDomain(e.target.value);
                        // Update default rule name nicely
                        const cleanSrc = e.target.value.replace('.com', '');
                        setRuleName(`${cleanSrc.charAt(0).toUpperCase() + cleanSrc.slice(1)} Redirection`);
                      }}
                      className="w-full bg-[#05060a] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-indigo-300 outline-none focus:border-indigo-500/50 font-mono"
                      placeholder="twitter.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Novo Domínio (Destino)</label>
                    <input 
                      type="text" 
                      value={targetDomain}
                      onChange={(e) => setTargetDomain(e.target.value)}
                      className="w-full bg-[#05060a] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-indigo-300 outline-none focus:border-indigo-500/50 font-mono"
                      placeholder="fxtwitter.com"
                    />
                  </div>
                </div>
              )}

              {builderType === 'param' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Parâmetro de Consulta</label>
                  <input 
                    type="text" 
                    value={paramName}
                    onChange={(e) => setParamName(e.target.value)}
                    className="w-full bg-[#05060a] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-indigo-300 outline-none focus:border-indigo-500/50 font-mono"
                    placeholder="utm_source"
                  />
                  <p className="text-[10px] text-slate-500">Isto irá identificar e deletar o parâmetro indicado de qualquer URL limpa.</p>
                </div>
              )}

              {builderType === 'bypass' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Domínio Encurtador</label>
                    <input 
                      type="text" 
                      value={sourceDomain}
                      onChange={(e) => setSourceDomain(e.target.value)}
                      className="w-full bg-[#05060a] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-indigo-300 outline-none focus:border-indigo-500/50 font-mono"
                      placeholder="google.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Parâmetro de Redirecionamento</label>
                    <input 
                      type="text" 
                      value={bypassParam}
                      onChange={(e) => setBypassParam(e.target.value)}
                      className="w-full bg-[#05060a] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-indigo-300 outline-none focus:border-indigo-500/50 font-mono"
                      placeholder="q"
                    />
                  </div>
                </div>
              )}

              {builderType !== 'param' && (
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setIsDecode(!isDecode)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isDecode ? 'bg-indigo-600' : 'bg-slate-800'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isDecode ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className="text-xs text-slate-300">Decodificar URL de destino (URL Decode)</span>
                </div>
              )}

            </div>

            {/* Live Generated Regex Preview Box */}
            <div className="bg-[#05060a] border border-slate-800/80 rounded-2xl p-4 space-y-3">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Compilador de Expressão Regular (Regex)</span>
              
              <div className="space-y-2 font-mono text-[11px] leading-relaxed">
                <div>
                  <span className="text-amber-500">Expressão regular:</span>
                  <div className="bg-slate-900 px-3 py-1.5 rounded-lg text-indigo-300 overflow-x-auto select-all whitespace-pre">
                    {getGeneratedRegex()}
                  </div>
                </div>
                <div>
                  <span className="text-emerald-500">Substituição:</span>
                  <div className="bg-slate-900 px-3 py-1.5 rounded-lg text-emerald-400 overflow-x-auto select-all whitespace-pre">
                    {getGeneratedReplacement() || '[Remover do query string]'}
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="pt-2">
              <button
                onClick={handleBuildRule}
                disabled={builderSuccess}
                className={`w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
                  builderSuccess 
                    ? 'bg-emerald-600 text-white shadow-emerald-600/10' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/10 hover:shadow-indigo-600/20'
                }`}
              >
                {builderSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 animate-bounce" />
                    <span>Regra Adicionada com Sucesso!</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Adicionar ao URLGuard</span>
                  </>
                )}
              </button>
              
              {builderSuccess && (
                <button
                  onClick={() => setActiveView('rules')}
                  className="w-full mt-2 py-2 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 hover:underline text-center"
                >
                  Ir para a aba de Regras para testar ➔
                </button>
              )}
            </div>

          </div>

          {/* AI Provider Config */}
          <div className="bg-gradient-to-b from-[#111322] to-[#0f111a] border border-indigo-500/15 rounded-3xl p-6 shadow-2xl space-y-5 mt-6">
            <div className="space-y-1">
              <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Brain className="w-4 h-4 text-indigo-400" /> Provedor de Inteligência Artificial (IA)
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Configure um provedor de IA para habilitar a Análise Inteligente de URLs diretamente no seu navegador.
              </p>
            </div>

            {/* Provider selector */}
            <div className="grid grid-cols-4 gap-1.5 bg-[#05060a] p-1 rounded-xl border border-slate-800/80">
              {(['gemini', 'openai', 'openrouter', 'custom'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    const defaultEp = p === 'gemini' ? 'https://generativelanguage.googleapis.com/v1beta/models' :
                                      p === 'openai' ? 'https://api.openai.com/v1' :
                                      p === 'openrouter' ? 'https://openrouter.ai/api/v1' : '';
                    const defaultModel = p === 'gemini' ? 'gemini-2.5-flash' :
                                         p === 'openai' ? 'gpt-4o-mini' :
                                         p === 'openrouter' ? 'google/gemini-2.5-flash' : '';
                    updateAiConfig({
                      provider: p,
                      apiEndpoint: defaultEp,
                      model: defaultModel
                    });
                  }}
                  className={`py-1.5 text-[10px] font-bold rounded-lg transition-colors capitalize ${
                    aiConfig.provider === p ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Input fields */}
            <div className="space-y-4">
              {/* API Key */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Key className="w-3.5 h-3.5" /> Chave de API (API Key)
                </label>
                <div className="relative">
                  <input 
                    type={showApiKey ? "text" : "password"} 
                    value={aiConfig.apiKey}
                    onChange={(e) => updateAiConfig({ apiKey: e.target.value })}
                    className="w-full bg-[#05060a] border border-slate-800 rounded-xl pl-4 pr-10 py-2.5 text-xs text-indigo-300 outline-none focus:border-indigo-500/50 font-mono"
                    placeholder={
                      aiConfig.provider === 'gemini' ? 'AIzaSy...' :
                      aiConfig.provider === 'openai' ? 'sk-...' :
                      aiConfig.provider === 'openrouter' ? 'sk-or-v1-...' : 'Insira a chave do provedor'
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition p-1"
                  >
                    {showApiKey ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              {/* API Endpoint & Model (conditional/editable) */}
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" /> Endpoint API
                  </label>
                  <input 
                    type="text" 
                    value={aiConfig.apiEndpoint}
                    onChange={(e) => updateAiConfig({ apiEndpoint: e.target.value })}
                    className="w-full bg-[#05060a] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-indigo-300 outline-none focus:border-indigo-500/50 font-mono"
                    placeholder="https://api..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5" /> Nome do Modelo
                  </label>
                  <input 
                    type="text" 
                    value={aiConfig.model}
                    onChange={(e) => updateAiConfig({ model: e.target.value })}
                    className="w-full bg-[#05060a] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-indigo-300 outline-none focus:border-indigo-500/50 font-mono"
                    placeholder="gpt-4o-mini"
                  />
                </div>
              </div>

              {/* Enabled Switch */}
              <div className="flex items-center justify-between bg-[#05060a]/50 p-3 rounded-2xl border border-slate-800/50">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-white">Ativar Análise Avançada por IA</span>
                  <p className="text-[10px] text-slate-500">Habilita o botão de auditoria inteligente na aba principal.</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateAiConfig({ enabled: !aiConfig.enabled })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    aiConfig.enabled ? 'bg-indigo-600' : 'bg-slate-800'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      aiConfig.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

            </div>

            {/* GitHub Pages Readiness Indicator */}
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 space-y-1.5 text-[11px] leading-relaxed text-emerald-400">
              <span className="font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Compatível com GitHub Pages (100% Serverless)
              </span>
              <p className="text-slate-400 text-[10px] leading-normal">
                Esta aplicação foi desenhada para correr de forma totalmente estática e independente. Toda a lógica de higienização de URLs, regras regex, e as requisições de Inteligência Artificial ocorrem **diretamente no seu navegador** via chamadas assíncronas seguras, sem depender de nenhum servidor intermediário próprio. Suas chaves de API nunca saem do seu cliente local.
              </p>
            </div>

            {/* Restore Defaults Module */}
            <div className="bg-rose-950/5 border border-rose-900/20 rounded-2xl p-4 space-y-3">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest block">Restaurar Parâmetros Originais</span>
                <p className="text-slate-400 text-[10px] leading-normal">
                  Redefine todas as regras de privacidade padrão e os novos gatilhos de segurança inteligente avançada de fábrica (incluindo IP bruto, extensão falsa e encurtadores).
                </p>
              </div>
              
              {!showResetConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="py-2 px-4 bg-rose-950/40 hover:bg-rose-900/30 text-rose-400 border border-rose-500/10 rounded-xl text-xs font-bold transition duration-150"
                >
                  Restaurar Definições de Fábrica
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      resetToDefaults();
                      setShowResetConfirm(false);
                    }}
                    className="py-1.5 px-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition"
                  >
                    Confirmar e Resetar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="py-1.5 px-3.5 bg-[#05060a] border border-slate-800 text-slate-400 hover:text-slate-200 rounded-lg text-xs font-semibold transition"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
