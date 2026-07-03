import React from 'react';
import { useAppStore } from '../store';
import { ExternalLink, Trash2 } from 'lucide-react';

export default function HistoryView() {
  const { savedLogs, deleteLog, clearLogs } = useAppStore();

  return (
    <div className="flex flex-col h-full">
      <div className="bg-[#0f111a] border border-slate-800/60 rounded-3xl p-6 shadow-2xl space-y-6 min-h-[500px] flex flex-col">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Histórico de Links Salvos</h3>
          </div>
          {savedLogs.length > 0 && (
            <button onClick={clearLogs} className="text-xs text-rose-400 hover:text-rose-300 font-semibold px-3 py-1.5 bg-rose-500/10 rounded-lg">
              Limpar tudo
            </button>
          )}
        </div>
        
        <div className="flex-1 space-y-3 overflow-y-auto pr-2">
          {savedLogs.map(log => (
            <div key={log.id} className="bg-[#05060a] p-4 rounded-2xl border border-slate-800/60 flex justify-between items-start gap-4 group transition hover:border-slate-700">
              <div className="overflow-hidden">
                <span className="text-[10px] text-slate-500 font-medium">{new Date(log.timestamp).toLocaleString()}</span>
                <p className="text-xs font-mono text-slate-400 truncate line-through decoration-rose-500/50 mt-1">
                  {log.originalUrl}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm font-mono font-bold text-indigo-300 truncate">
                    {log.cleanedUrl}
                  </p>
                  <a href={log.cleanedUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 shrink-0">
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <button onClick={() => deleteLog(log.id)} className="p-2 text-slate-600 hover:text-rose-400 hover:bg-slate-900/50 rounded-lg shrink-0 transition opacity-0 group-hover:opacity-100">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        
        {savedLogs.length === 0 && (
          <div className="bg-[#05060a] p-12 rounded-3xl border border-dashed border-slate-800/60 text-center flex flex-col items-center justify-center">
            <span className="text-sm font-medium text-slate-500 block mb-2">Nenhum link salvo</span>
            <span className="text-xs text-slate-600 block">Os links salvos durante a análise aparecerão aqui.</span>
          </div>
        )}
      </div>
    </div>
  );
}
