import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { cleanTrackers, applyRules, isSuspicious, isHomograph, scanThreats, TRACKING_PARAMS } from '../utils';
import { ShieldAlert, Sparkles, Copy, QrCode, Bookmark, X, RefreshCcw, Undo2, Redo2, Loader2, ArrowRight, AlertTriangle, Info, Brain } from 'lucide-react';
import QRModal from './QRModal';
import ReactMarkdown from 'react-markdown';
import { analyzeUrlWithAI } from '../aiService';

export default function AnalyzerView() {
  const { 
    urlInput, setUrlInput, 
    pushUrlHistory, undoUrl, redoUrl, historyIndex, urlHistory,
    rules, saveLog,
    threatConfigs, addSecurityAlert, securityAlerts, dismissSecurityAlert,
    aiConfig
  } = useAppStore();

  const [parsedUrl, setParsedUrl] = useState<URL | null>(null);
  const [paramsList, setParamsList] = useState<{key: string, value: string, isTracker: boolean}[]>([]);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  
  const [auditResult, setAuditResult] = useState<string>('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditError, setAuditError] = useState('');

  const [traceResult, setTraceResult] = useState<string[]>([]);
  const [isTracing, setIsTracing] = useState(false);

  useEffect(() => {
    try {
      const u = new URL(urlInput);
      setParsedUrl(u);
      const params: {key: string, value: string, isTracker: boolean}[] = [];
      u.searchParams.forEach((value, key) => {
        params.push({ key, value, isTracker: TRACKING_PARAMS.includes(key.toLowerCase()) });
      });
      setParamsList(params);

      // Scan and trigger active threat alerts automatically
      const detectedAlerts = scanThreats(urlInput, threatConfigs);
      detectedAlerts.forEach(alert => {
        addSecurityAlert(alert);
      });
    } catch {
      setParsedUrl(null);
      setParamsList([]);
    }
  }, [urlInput, threatConfigs, addSecurityAlert]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUrlInput(e.target.value);
  };

  const commitChange = (newUrl: string) => {
    pushUrlHistory(newUrl);
  };

  const handleClean = () => {
    const cleaned = cleanTrackers(urlInput);
    if (cleaned !== urlInput) commitChange(cleaned);
  };

  const handleApplyRules = () => {
    const processed = applyRules(urlInput, rules);
    if (processed !== urlInput) commitChange(processed);
  };

  const handleRemoveParam = (paramKey: string) => {
    try {
      const u = new URL(urlInput);
      u.searchParams.delete(paramKey);
      commitChange(u.toString());
    } catch {}
  };

  const handleClearAllParams = () => {
    try {
      const u = new URL(urlInput);
      u.search = '';
      commitChange(u.toString());
    } catch {}
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(urlInput);
      // could add toast here
    } catch {}
  };

  const handleSave = () => {
    if (urlHistory.length > 0) {
      saveLog(urlHistory[0], urlInput); // original vs current
    } else {
      saveLog(urlInput, urlInput);
    }
  };

  const runAudit = async () => {
    if (!urlInput) return;
    setIsAuditing(true);
    setAuditError('');
    setAuditResult('');
    
    try {
      if (aiConfig.enabled && aiConfig.apiKey) {
        // Run completely client-side (100% serverless / GitHub Pages compatible)
        const result = await analyzeUrlWithAI(urlInput, aiConfig);
        setAuditResult(result);
      } else {
        // Fallback to Express backend proxy if running locally/fullstack
        const res = await fetch('/api/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: urlInput })
        });
        const data = await res.json();
        if (data.error) {
          setAuditError(data.error + '. Nota: Pode configurar um Provedor de IA próprio na aba "Alertas e Configs" para processamento local direto.');
        } else {
          setAuditResult(data.result);
        }
      }
    } catch (e: any) {
      setAuditError(e.message || 'Falha ao realizar a auditoria de IA.');
    } finally {
      setIsAuditing(false);
    }
  };

  const runTrace = async () => {
    if (!urlInput) return;
    setIsTracing(true);
    setTraceResult([]);
    
    try {
      const res = await fetch('/api/trace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput })
      });
      const data = await res.json();
      if (data.error) {
        // error
      } else {
        setTraceResult(data.trace || []);
      }
    } catch (e) {
      // error
    } finally {
      setIsTracing(false);
    }
  };

  const isSusp = parsedUrl ? isSuspicious(parsedUrl.hostname) : false;
  const isHomo = parsedUrl ? isHomograph(parsedUrl.hostname) : false;

  const currentUrlAlerts = securityAlerts.filter(a => a.url === urlInput && !a.dismissed);

  return (
    <div className="flex flex-col h-full">
      {currentUrlAlerts.length > 0 && (
        <div className="mb-4 space-y-2 animate-in fade-in duration-300">
          {currentUrlAlerts.map(alert => (
            <div 
              key={alert.id}
              className={`p-4 rounded-2xl border flex items-start gap-3 relative overflow-hidden ${
                alert.priority === 'high' 
                  ? 'bg-rose-950/20 border-rose-500/30 text-rose-200' 
                  : alert.priority === 'medium' 
                    ? 'bg-amber-950/20 border-amber-500/30 text-amber-200' 
                    : 'bg-indigo-950/20 border-indigo-500/30 text-indigo-200'
              }`}
            >
              {/* Border highlight */}
              <div className={`absolute top-0 bottom-0 left-0 w-1 ${
                alert.priority === 'high' ? 'bg-rose-500 animate-pulse' : alert.priority === 'medium' ? 'bg-amber-500' : 'bg-indigo-500'
              }`} />

              <div className="shrink-0 mt-0.5 ml-1">
                {alert.priority === 'high' ? (
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                ) : alert.priority === 'medium' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                ) : (
                  <Info className="w-4 h-4 text-indigo-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-[10px] uppercase tracking-wider">
                    {alert.priority === 'high' ? 'Risco Crítico' : alert.priority === 'medium' ? 'Risco Médio' : 'Informação'}
                  </span>
                  <span className="text-[10px] opacity-60">• {alert.threatName}</span>
                </div>
                <p className="text-xs mt-0.5 leading-relaxed">{alert.message}</p>
              </div>
              <button 
                onClick={() => dismissSecurityAlert(alert.id)}
                className="p-1 hover:bg-white/10 rounded-lg text-current opacity-70 hover:opacity-100 transition shrink-0"
                title="Descartar Alerta"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 lg:grid-rows-6 gap-4 min-h-[700px]">
        
        {/* Input Module */}
        <div className="lg:col-span-8 lg:row-span-2 bg-[#0f111a] border border-slate-800/60 rounded-3xl p-6 shadow-2xl flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em]">Análise de Link</h2>
            <div className="flex gap-2">
              <button onClick={undoUrl} disabled={historyIndex <= 0} className="px-3 py-1 bg-slate-800/80 hover:bg-slate-700 rounded-lg text-[10px] font-bold text-slate-300 disabled:opacity-50 transition">UNDO</button>
              <button onClick={redoUrl} disabled={historyIndex >= urlHistory.length - 1} className="px-3 py-1 bg-slate-800/80 hover:bg-slate-700 rounded-lg text-[10px] font-bold text-slate-300 disabled:opacity-50 transition">REDO</button>
            </div>
          </div>

          <div className="relative flex-1 group">
            <textarea 
              value={urlInput}
              onChange={handleInputChange}
              className="w-full h-full min-h-[100px] bg-[#05060a] border border-slate-800 rounded-2xl p-4 pr-12 font-mono text-sm text-indigo-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 outline-none resize-none placeholder-slate-700 transition-all" 
              placeholder="Cole a URL suspeita aqui..."
            />
            {urlInput && (
              <button onClick={() => setUrlInput('')} className="absolute right-3 top-3 text-slate-500 hover:text-rose-400 transition">
                <X className="w-5 h-5" />
              </button>
            )}
            <div className="absolute bottom-3 right-3 flex gap-2">
              <button onClick={handleClean} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 transition-transform active:scale-95 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Limpar Rastreadores
              </button>
            </div>
          </div>
        </div>

        {/* Threat Profile (Replaces Anatomy) */}
        <div className="lg:col-span-4 lg:row-span-4 bg-gradient-to-b from-[#161a29] to-[#0f111a] border border-slate-700/30 rounded-3xl p-6 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xs font-bold text-rose-400 uppercase tracking-widest">Perfil de Risco</h2>
            {parsedUrl && <span className="text-xs font-mono font-bold bg-slate-800/80 px-2 py-1 rounded-md text-slate-300">{parsedUrl.hostname}</span>}
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Rastreadores</span>
                <span className="text-xs text-slate-500">{paramsList.filter(p => p.isTracker).length} parâmetros suspeitos</span>
              </div>
              <span className="text-2xl font-mono font-bold text-rose-500">
                {paramsList.length > 0 ? Math.round((paramsList.filter(p => p.isTracker).length / paramsList.length) * 100) : 0}%
              </span>
            </div>
            
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500 transition-all duration-500" style={{ width: `${paramsList.length > 0 ? (paramsList.filter(p => p.isTracker).length / paramsList.length) * 100 : 0}%` }}></div>
            </div>
            
            {isSusp || isHomo ? (
              <div className="flex flex-wrap gap-2">
                 {isSusp && <span className="px-2 py-1 rounded-lg text-xs font-bold bg-amber-950/50 text-amber-400 border border-amber-800/50">⚠️ Domínio Suspeito</span>}
                 {isHomo && <span className="px-2 py-1 rounded-lg text-xs font-bold bg-rose-950/50 text-rose-400 border border-rose-800/50">🚨 Homógrafo</span>}
              </div>
            ) : null}

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">Todos os Parâmetros ({paramsList.length})</span>
                {paramsList.length > 0 && (
                  <button onClick={handleClearAllParams} className="text-[10px] font-semibold text-rose-400 hover:underline">Limpar Todos</button>
                )}
              </div>
              
              {paramsList.length > 0 ? (
                paramsList.map((p, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${p.isTracker ? 'bg-rose-950/20 border-rose-900/30' : 'bg-slate-900/50 border-slate-800/60'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${p.isTracker ? 'bg-rose-500/10 text-rose-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                      {p.key.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex flex-col overflow-hidden flex-1">
                      <span className="text-xs font-bold truncate">{p.key}</span>
                      <span className="text-[10px] text-slate-500 font-mono truncate">{p.value}</span>
                    </div>
                    <button onClick={() => handleRemoveParam(p.key)} className="p-1 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-rose-400 shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center p-4 bg-slate-900/30 rounded-xl border border-slate-800/50">
                  <span className="text-xs text-slate-500 block">Nenhum parâmetro encontrado.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Audit Section */}
        <div className="lg:col-span-8 lg:row-span-2 bg-[#0f111a] border border-slate-800/60 rounded-3xl p-6 flex flex-col">
           <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em]">Auditoria de IA</h2>
                {aiConfig.enabled && aiConfig.apiKey ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 capitalize flex items-center gap-1">
                    <Brain className="w-3 h-3 text-emerald-400 animate-pulse" /> IA do Navegador ({aiConfig.provider})
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">
                    Servidor (Padrão)
                  </span>
                )}
              </div>
              <button 
                onClick={runAudit} 
                disabled={isAuditing}
                className="py-1.5 px-3 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 disabled:opacity-50 text-indigo-400 font-semibold rounded-lg text-xs flex items-center gap-2 transition cursor-pointer"
              >
                {isAuditing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                <span>{isAuditing ? 'Analisando...' : 'Iniciar Análise'}</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto bg-[#05060a] rounded-2xl border border-slate-800/60 p-4">
              {auditError ? (
                <div className="text-rose-400 text-xs">{auditError}</div>
              ) : auditResult ? (
                <div className="markdown-body text-slate-300 text-sm leading-relaxed">
                  <ReactMarkdown>{auditResult}</ReactMarkdown>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-600 text-xs">
                  Inicie a auditoria para analisar a URL usando IA.
                </div>
              )}
            </div>
        </div>

        {/* Redirect Chain */}
        <div className="lg:col-span-4 lg:row-span-2 bg-[#0f111a] border border-slate-800/60 rounded-3xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Cadeia de Redirecionamento</h2>
            <button 
              onClick={runTrace} 
              disabled={isTracing}
              className="text-xs text-emerald-400 hover:text-emerald-300 transition font-semibold flex items-center gap-1"
            >
              {isTracing ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Testar'}
            </button>
          </div>
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2">
            {traceResult.length > 0 ? (
              traceResult.map((t, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-emerald-500 ring-4 ring-emerald-500/20' : i === traceResult.length - 1 ? 'bg-indigo-500' : 'bg-amber-500'}`}></div>
                    {i < traceResult.length - 1 && <div className="w-px h-10 bg-slate-800 my-1"></div>}
                  </div>
                  <div className={`flex-1 bg-slate-900/30 border ${i === traceResult.length - 1 ? 'border-indigo-500/30 shadow-[0_0_15px_rgba(79,70,229,0.1)]' : 'border-slate-800'} p-3 rounded-xl`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-[10px] font-bold uppercase ${i === traceResult.length - 1 ? 'text-indigo-400' : 'text-slate-500'}`}>
                        {i === 0 ? 'Origem' : i === traceResult.length - 1 ? 'Destino Final' : 'Passo ' + i}
                      </span>
                    </div>
                    <p className={`text-xs font-mono truncate ${i === traceResult.length - 1 ? 'text-indigo-300' : 'text-slate-400'}`}>{t}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center">
                <span className="text-xs text-slate-600 block text-center">Teste redirecionamentos ocultos de encurtadores.</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Controls */}
        <div className="lg:col-span-4 lg:row-span-2 bg-[#0f111a] border border-slate-800/60 rounded-3xl p-5 flex flex-col gap-3 justify-center">
          <button onClick={handleCopy} className="w-full flex items-center justify-between p-3 bg-slate-900 hover:bg-slate-800 rounded-2xl border border-slate-800 transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400"><Copy className="w-4 h-4" /></div>
              <span className="text-xs font-bold text-slate-300">Copiar Link Limpo</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
          </button>
          <button onClick={() => setIsQRModalOpen(true)} className="w-full flex items-center justify-between p-3 bg-slate-900 hover:bg-slate-800 rounded-2xl border border-slate-800 transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400"><QrCode className="w-4 h-4" /></div>
              <span className="text-xs font-bold text-slate-300">Gerar QR Code</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-purple-400 transition-colors" />
          </button>
          <button onClick={handleApplyRules} className="w-full flex items-center justify-between p-3 bg-slate-900 hover:bg-slate-800 rounded-2xl border border-slate-800 transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400"><RefreshCcw className="w-4 h-4" /></div>
              <span className="text-xs font-bold text-slate-300">Aplicar Substituições</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
          </button>
          <button onClick={handleSave} className="w-full flex items-center justify-between p-3 bg-slate-900 hover:bg-slate-800 rounded-2xl border border-slate-800 transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400"><Bookmark className="w-4 h-4" /></div>
              <span className="text-xs font-bold text-slate-300">Guardar Histórico</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition-colors" />
          </button>
        </div>

      </div>
      
      <QRModal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} url={urlInput} />
    </div>
  );
}
