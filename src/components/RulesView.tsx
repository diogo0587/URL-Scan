import React, { useState } from 'react';
import { useAppStore } from '../store';
import { 
  Trash2, CheckCircle2, Circle, Wand2, Plus, Sparkles, 
  Layers, Check, Info, HelpCircle, ExternalLink, BookmarkCheck 
} from 'lucide-react';
import clsx from 'clsx';

const REGEX_PRESETS = [
  {
    name: 'Remover Identificador de Clique do Facebook (fbclid)',
    description: 'Elimina identificadores de clique invasivos do Facebook de links compartilhados para impedir monitorização.',
    regex: '[?&]fbclid=[^&]*',
    replacement: '',
    isDecode: false,
    category: 'Privacidade'
  },
  {
    name: 'TikTok Tracker Remover',
    description: 'Retira parâmetros de rastreio de referência em compartilhamentos de vídeos e perfis do TikTok (ex: _r, sec_user_id).',
    regex: '(?:tiktok\\.com\\/.*)(?:[?&](?:_r|share_app_id|language|sec_user_id)=[^&]*)',
    replacement: '',
    isDecode: false,
    category: 'Privacidade'
  },
  {
    name: 'Bypass de Redirecionamento Yahoo',
    description: 'Bypass automático de telas de redirecionamento intermediário criadas pelo Yahoo Search.',
    regex: '^https?:\\/\\/(?:www\\.)?yahoo\\.[a-z.]+\\/url\\?.*ru=([^&]+)',
    replacement: '$1',
    isDecode: true,
    category: 'Desvio'
  },
  {
    name: 'Reddit ➔ Old Reddit',
    description: 'Redireciona links do novo Reddit para a versão clássica clássica ultraleve e mais rápida.',
    regex: '^https?:\\/\\/(?:www\\.)?reddit\\.com\\/(.*)',
    replacement: 'https://old.reddit.com/$1',
    isDecode: false,
    category: 'Desempenho'
  },
  {
    name: 'Youtube ➔ Piped (Livre de Anúncios)',
    description: 'Redireciona vídeos para o Piped, uma interface leve que protege a sua privacidade e bloqueia rastreadores do Google.',
    regex: '^https?:\\/\\/(?:www\\.)?youtube\\.com\\/watch\\?v=([^&]+).*',
    replacement: 'https://piped.video/watch?v=$1',
    isDecode: false,
    category: 'Privacidade'
  },
  {
    name: 'Bypass de Redirecionador do Steam',
    description: 'Pula instantaneamente o aviso chato de link externo do Steam Community.',
    regex: '^https?:\\/\\/steamcommunity\\.com\\/linkfilter\\/\\?url=([^&]+)',
    replacement: '$1',
    isDecode: true,
    category: 'Desvio'
  },
  {
    name: 'Wikipédia ➔ Wikiless Mirror',
    description: 'Redireciona artigos da Wikipédia para o espelho Wikiless que previne rastreio de cookies de terceiros.',
    regex: '^https?:\\/\\/([a-z]+)\\.wikipedia\\.org\\/wiki\\/(.*)',
    replacement: 'https://wikiless.org/wiki/$2',
    isDecode: false,
    category: 'Privacidade'
  },
  {
    name: 'Remover Parâmetro de Afiliado Amazon',
    description: 'Apaga IDs de referência de afiliado de links de produtos da Amazon para evitar rastreamento comercial.',
    regex: '[?&](?:tag|ref_|creative)=[^&]*',
    replacement: '',
    isDecode: false,
    category: 'Limpeza'
  }
];

export default function RulesView() {
  const { rules, toggleRule, deleteRule, addRule } = useAppStore();
  const [activeTab, setActiveTab] = useState<'mine' | 'presets' | 'wizard'>('mine');
  
  // Custom manual rule form state
  const [name, setName] = useState('');
  const [regex, setRegex] = useState('');
  const [replacement, setReplacement] = useState('');
  const [isDecode, setIsDecode] = useState(false);

  // Wizard state
  const [wizardType, setWizardType] = useState<'redirect' | 'param' | 'bypass'>('redirect');
  const [wizName, setWizName] = useState('');
  const [wizSource, setWizSource] = useState('');
  const [wizTarget, setWizTarget] = useState('');
  const [wizParam, setWizParam] = useState('');
  const [wizBypassUrl, setWizBypassUrl] = useState('');
  const [wizBypassParam, setWizBypassParam] = useState('');

  // Preset addition feedback state
  const [addedPresetIndex, setAddedPresetIndex] = useState<number | null>(null);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !regex) return;
    addRule({ name, regex, replacement, active: true, isDecode });
    setName('');
    setRegex('');
    setReplacement('');
    setIsDecode(false);
  };

  const handleAddPreset = (preset: typeof REGEX_PRESETS[0], index: number) => {
    addRule({
      name: preset.name,
      regex: preset.regex,
      replacement: preset.replacement,
      active: true,
      isDecode: preset.isDecode
    });
    setAddedPresetIndex(index);
    setTimeout(() => {
      setAddedPresetIndex(null);
    }, 2000);
  };

  // Helper for real-time Wizard Regex rendering
  const getWizGeneratedRegex = () => {
    if (wizardType === 'redirect') {
      const cleanSrc = wizSource ? wizSource.trim() : 'exemplo.com';
      const escapedSource = cleanSrc.replace(/\./g, '\\\\.');
      return `^https?:\\\\/\\\\/(?:[a-z0-9-]+\\\\.)?${escapedSource}\\\\/(.*)`;
    } else if (wizardType === 'param') {
      const cleanParam = wizParam ? wizParam.trim() : 'utm_source';
      const escapedParam = cleanParam.replace(/\./g, '\\\\.');
      return `[?&]${escapedParam}=[^&]*`;
    } else {
      const cleanBypass = wizBypassUrl ? wizBypassUrl.trim() : 'site-redirecionador.com';
      const escapedBypass = cleanBypass.replace(/\./g, '\\\\.');
      const cleanBypassParam = wizBypassParam ? wizBypassParam.trim() : 'url';
      return `^https?:\\\\/\\\\/(?:[a-z0-9-]+\\\\.)?${escapedBypass}\\\\/.*[?&]${cleanBypassParam}=([^&]+)`;
    }
  };

  const getWizGeneratedReplacement = () => {
    if (wizardType === 'redirect') {
      const cleanTgt = wizTarget ? wizTarget.trim() : 'mirror-privado.com';
      return `https://${cleanTgt}/$1`;
    } else if (wizardType === 'param') {
      return '[Removido do query string]';
    } else {
      return '$1';
    }
  };

  const handleSaveWizard = (e: React.FormEvent) => {
    e.preventDefault();
    const finalRegex = getWizGeneratedRegex();
    let finalReplacement = '';
    let finalIsDecode = false;
    let finalName = wizName.trim();

    if (wizardType === 'redirect') {
      if (!wizSource) return;
      const cleanTgt = wizTarget ? wizTarget.trim() : 'mirror-privado.com';
      finalReplacement = `https://${cleanTgt}/$1`;
      if (!finalName) finalName = `${wizSource} ➔ ${cleanTgt}`;
    } else if (wizardType === 'param') {
      if (!wizParam) return;
      finalReplacement = '';
      if (!finalName) finalName = `Remover Parâmetro: ${wizParam}`;
    } else {
      if (!wizBypassUrl || !wizBypassParam) return;
      finalReplacement = '$1';
      finalIsDecode = true;
      if (!finalName) finalName = `Desviar Redirecionador: ${wizBypassUrl}`;
    }

    addRule({
      name: finalName,
      regex: finalRegex,
      replacement: finalReplacement,
      active: true,
      isDecode: finalIsDecode
    });

    // Reset wizard fields
    setWizName('');
    setWizSource('');
    setWizTarget('');
    setWizParam('');
    setWizBypassUrl('');
    setWizBypassParam('');
    
    // Switch back to active list to see changes
    setActiveTab('mine');
  };

  return (
    <div className="space-y-6">
      
      {/* Navigation Header Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0f111a] border border-slate-800/60 p-6 rounded-3xl">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" /> Regras e Higienização Avançada
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure redirecionamentos automáticos de privacidade e crie filtros regex de bypass personalizados.
          </p>
        </div>
        
        {/* Navigation Tab list */}
        <div className="flex bg-[#05060a] border border-slate-800/80 rounded-2xl p-1 shrink-0 w-full md:w-auto">
          <button 
            onClick={() => setActiveTab('mine')}
            className={clsx(
              "flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-xl transition duration-150 flex items-center justify-center gap-1.5",
              activeTab === 'mine' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10" : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Layers className="w-3.5 h-3.5" /> Ativas ({rules.length})
          </button>
          <button 
            onClick={() => setActiveTab('presets')}
            className={clsx(
              "flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-xl transition duration-150 flex items-center justify-center gap-1.5",
              activeTab === 'presets' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10" : "text-slate-400 hover:text-slate-200"
            )}
          >
            <BookmarkCheck className="w-3.5 h-3.5" /> Biblioteca de Presets
          </button>
          <button 
            onClick={() => setActiveTab('wizard')}
            className={clsx(
              "flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-xl transition duration-150 flex items-center justify-center gap-1.5",
              activeTab === 'wizard' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10" : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Wand2 className="w-3.5 h-3.5" /> Construtor Assistido
          </button>
        </div>
      </div>

      {/* Main Container based on active tab */}
      {activeTab === 'mine' && (
        <div className="bg-[#0f111a] border border-slate-800/60 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-200">Suas Regras Customizadas</h3>
              <p className="text-xs text-slate-500">Regras ativas que monitorizam e substituem URLs em tempo real.</p>
            </div>
            {rules.length > 0 && (
              <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-full font-bold">
                ENGINE ATIVA
              </span>
            )}
          </div>
          
          {rules.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rules.map(rule => (
                <div 
                  key={rule.id} 
                  className={clsx(
                    "p-4 rounded-2xl border flex flex-col gap-3 transition-all relative overflow-hidden group", 
                    rule.active 
                      ? "bg-[#05060a] border-indigo-900/50 shadow-[0_0_15px_rgba(79,70,229,0.03)] hover:border-indigo-500/40" 
                      : "bg-[#05060a]/50 border-slate-900 opacity-50 hover:opacity-75"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-2 cursor-pointer select-none" onClick={() => toggleRule(rule.id)}>
                      {rule.active ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="text-xs font-bold text-slate-200 leading-tight block">{rule.name}</span>
                        {rule.isDecode && (
                          <span className="text-[9px] text-amber-500 font-bold uppercase mt-0.5 block tracking-wide">Decodifica URL</span>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteRule(rule.id)} 
                      className="text-slate-600 hover:text-rose-400 p-1 rounded-lg hover:bg-rose-500/10 transition shrink-0" 
                      title="Excluir regra"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  <div className="bg-slate-950/60 p-3 rounded-xl text-[10px] font-mono text-slate-400 break-all border border-slate-900/80 space-y-1">
                    <div className="text-indigo-400/85 font-semibold">RegEx: <span className="text-slate-300 font-normal">{rule.regex}</span></div>
                    {rule.replacement ? (
                      <div className="text-emerald-400/85 font-semibold">Substituir: <span className="text-slate-300 font-normal">{rule.replacement}</span></div>
                    ) : (
                      <div className="text-amber-500/85 font-semibold">Remover parâmetro</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-[#05060a]/30 rounded-2xl border border-slate-900">
              <Layers className="w-8 h-8 text-slate-700 mx-auto mb-2" />
              <span className="text-xs text-slate-400 font-semibold block">Sem regras de processamento customizadas</span>
              <p className="text-[10px] text-slate-500 mt-1 max-w-xs mx-auto">Adicione novas regras usando o Construtor Assistido ou importe presets rápidos da biblioteca.</p>
            </div>
          )}

          {/* Manual addition form at the bottom */}
          <form onSubmit={handleManualSubmit} className="bg-[#05060a] p-5 rounded-2xl border border-slate-800/60 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Criar Regra Manualmente (Avançado)</span>
              <span className="cursor-help" title="Use isto apenas se já souber escrever expressões regulares">
                <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold uppercase">Nome da Regra</label>
                <input 
                  value={name} onChange={e => setName(e.target.value)}
                  type="text" placeholder="Ex: Twitter Mirror" 
                  className="w-full bg-[#0f111a] border border-slate-800 text-xs text-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500 transition-colors" required 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold uppercase font-mono">Regex Matcher</label>
                <input 
                  value={regex} onChange={e => setRegex(e.target.value)}
                  type="text" placeholder="Ex: twitter\.com/(.*)" 
                  className="w-full bg-[#0f111a] border border-slate-800 text-xs text-slate-200 font-mono rounded-xl p-3 focus:outline-none focus:border-indigo-500 transition-colors" required 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold uppercase font-mono">Replacement Target</label>
                <input 
                  value={replacement} onChange={e => setReplacement(e.target.value)}
                  type="text" placeholder="Ex: fxtwitter.com/$1" 
                  className="w-full bg-[#0f111a] border border-slate-800 text-xs text-slate-200 font-mono rounded-xl p-3 focus:outline-none focus:border-indigo-500 transition-colors" 
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={isDecode} 
                  onChange={e => setIsDecode(e.target.checked)}
                  className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 bg-[#0f111a] w-4 h-4"
                />
                <span className="text-xs text-slate-300">Decodificar URI no final (URL Decode)</span>
              </label>

              <button type="submit" className="w-full sm:w-auto py-2.5 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition duration-150 active:scale-95 flex items-center justify-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Adicionar Regra
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Preset Library Tab */}
      {activeTab === 'presets' && (
        <div className="bg-[#0f111a] border border-slate-800/60 rounded-3xl p-6 shadow-2xl space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Biblioteca de Presets Rápidos</h3>
            <p className="text-xs text-slate-500">Adicione filtros de privacidade pré-configurados para os maiores sites da web com um clique.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {REGEX_PRESETS.map((preset, index) => {
              // Check if rule already imported
              const isAlreadyAdded = rules.some(r => r.regex === preset.regex);
              
              return (
                <div 
                  key={index} 
                  className={clsx(
                    "p-5 rounded-2xl border bg-[#05060a] flex flex-col justify-between gap-4 transition-all hover:border-slate-700/60",
                    isAlreadyAdded ? "border-emerald-950/40" : "border-slate-800/80"
                  )}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className={clsx(
                        "px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase",
                        preset.category === 'Privacidade' ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" :
                        preset.category === 'Desvio' ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                        "bg-slate-800 text-slate-400"
                      )}>
                        {preset.category}
                      </span>
                      
                      {isAlreadyAdded && (
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> IMPORTADA
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-slate-200 leading-snug">{preset.name}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">{preset.description}</p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="bg-slate-950/60 p-3 rounded-xl text-[10px] font-mono text-slate-500 border border-slate-900/80 break-all">
                      <div>Regex: <span className="text-slate-400">{preset.regex}</span></div>
                      {preset.replacement && <div className="mt-1">Destino: <span className="text-slate-400">{preset.replacement}</span></div>}
                    </div>

                    <button 
                      onClick={() => handleAddPreset(preset, index)}
                      disabled={isAlreadyAdded || addedPresetIndex === index}
                      className={clsx(
                        "w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5",
                        isAlreadyAdded 
                          ? "bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed" 
                          : addedPresetIndex === index
                            ? "bg-emerald-600 text-white"
                            : "bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/20"
                      )}
                    >
                      {addedPresetIndex === index ? (
                        <>
                          <Check className="w-3.5 h-3.5 animate-pulse" /> Ativada com Sucesso!
                        </>
                      ) : isAlreadyAdded ? (
                        "Já Instalada na Engine"
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" /> Adicionar Filtro
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Regex Wizard Tab */}
      {activeTab === 'wizard' && (
        <form onSubmit={handleSaveWizard} className="bg-[#0f111a] border border-slate-800/60 rounded-3xl p-6 shadow-2xl space-y-6 max-w-4xl">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-200">Construtor de Regex Inteligente</h3>
            <p className="text-xs text-slate-500">Crie filtros avançados selecionando opções de linguagem natural. Nós compilamos a expressão regular por si.</p>
          </div>

          {/* Type of rule */}
          <div className="space-y-2">
            <label className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest block">O que deseja fazer?</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-[#05060a] p-1 rounded-2xl border border-slate-800/80">
              <button
                type="button"
                onClick={() => setWizardType('redirect')}
                className={clsx(
                  "py-3 text-xs font-bold rounded-xl transition duration-150 flex flex-col items-center justify-center gap-1",
                  wizardType === 'redirect' ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
                )}
              >
                <span>Redirecionar Domínio</span>
                <span className="text-[9px] font-normal opacity-70">Ex: twitter ➔ fxtwitter</span>
              </button>
              <button
                type="button"
                onClick={() => setWizardType('param')}
                className={clsx(
                  "py-3 text-xs font-bold rounded-xl transition duration-150 flex flex-col items-center justify-center gap-1",
                  wizardType === 'param' ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
                )}
              >
                <span>Limpar Parâmetro</span>
                <span className="text-[9px] font-normal opacity-70">Ex: remover utm_source</span>
              </button>
              <button
                type="button"
                onClick={() => setWizardType('bypass')}
                className={clsx(
                  "py-3 text-xs font-bold rounded-xl transition duration-150 flex flex-col items-center justify-center gap-1",
                  wizardType === 'bypass' ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
                )}
              >
                <span>Desviar Redirecionador</span>
                <span className="text-[9px] font-normal opacity-70">Ex: steam linkfilter bypass</span>
              </button>
            </div>
          </div>

          {/* Fields according to selection */}
          <div className="bg-[#05060a] border border-slate-800 p-5 rounded-2xl space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 font-bold uppercase">Nome Amigável</label>
              <input 
                type="text"
                value={wizName}
                onChange={e => setWizName(e.target.value)}
                placeholder={
                  wizardType === 'redirect' ? 'Ex: Redirecionar Instagram para Espelho' :
                  wizardType === 'param' ? 'Ex: Remover Rastreador de Vídeo' :
                  'Ex: Desviar tela de confirmação'
                }
                className="w-full bg-[#0f111a] border border-slate-800 text-xs text-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {wizardType === 'redirect' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">Domínio de Origem (Excluído o protocolo)</label>
                  <input 
                    type="text"
                    value={wizSource}
                    onChange={e => setWizSource(e.target.value)}
                    placeholder="instagram.com"
                    className="w-full bg-[#0f111a] border border-slate-800 text-xs font-mono text-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500 transition-colors"
                    required
                  />
                  <p className="text-[10px] text-slate-500">Qualquer link deste domínio será capturado.</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">Domínio de Destino (Novo Espelho)</label>
                  <input 
                    type="text"
                    value={wizTarget}
                    onChange={e => setWizTarget(e.target.value)}
                    placeholder="ddinstagram.com"
                    className="w-full bg-[#0f111a] border border-slate-800 text-xs font-mono text-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500 transition-colors"
                    required
                  />
                  <p className="text-[10px] text-slate-500">Mantém todo o caminho do URL original no espelho.</p>
                </div>
              </div>
            )}

            {wizardType === 'param' && (
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold uppercase">Nome do Parâmetro na Query String</label>
                <input 
                  type="text"
                  value={wizParam}
                  onChange={e => setWizParam(e.target.value)}
                  placeholder="Ex: ref_src"
                  className="w-full bg-[#0f111a] border border-slate-800 text-xs font-mono text-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500 transition-colors"
                  required
                />
                <p className="text-[10px] text-slate-500">Este parâmetro e o seu valor serão expurgados da URL higienizada.</p>
              </div>
            )}

            {wizardType === 'bypass' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">Domínio do Redirecionador</label>
                  <input 
                    type="text"
                    value={wizBypassUrl}
                    onChange={e => setWizBypassUrl(e.target.value)}
                    placeholder="google.com"
                    className="w-full bg-[#0f111a] border border-slate-800 text-xs font-mono text-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500 transition-colors"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">Parâmetro que contém o URL real</label>
                  <input 
                    type="text"
                    value={wizBypassParam}
                    onChange={e => setWizBypassParam(e.target.value)}
                    placeholder="q"
                    className="w-full bg-[#0f111a] border border-slate-800 text-xs font-mono text-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500 transition-colors"
                    required
                  />
                </div>
              </div>
            )}
          </div>

          {/* Compile preview */}
          <div className="bg-[#05060a]/60 border border-slate-800/80 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 flex-1">
              <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest block">Compilação Regex Dinâmica</span>
              <div className="font-mono text-[11px] leading-relaxed break-all text-slate-400">
                <div className="flex gap-2"><span className="text-amber-500 font-bold">Regex:</span> <code className="text-indigo-300 font-medium select-all">{getWizGeneratedRegex()}</code></div>
                <div className="flex gap-2"><span className="text-emerald-500 font-bold font-mono">Subst:</span> <code className="text-emerald-400 font-medium select-all">{getWizGeneratedReplacement()}</code></div>
              </div>
            </div>
            
            <button 
              type="submit"
              className="shrink-0 py-3 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition duration-150 flex items-center justify-center gap-1"
            >
              <Check className="w-3.5 h-3.5" /> Salvar Regra na Engine
            </button>
          </div>
        </form>
      )}

    </div>
  );
}
