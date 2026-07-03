import React from 'react';
import { Menu, ShieldCheck } from 'lucide-react';
import { useAppStore } from '../store';

export default function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  const activeView = useAppStore(state => state.activeView);

  const viewNames = {
    analyzer: 'Analisador',
    rules: 'Regras',
    history: 'Histórico'
  };

  return (
    <header className="flex justify-between items-center mb-6 shrink-0">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-slate-800/50 text-slate-400 transition"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            URLGuard <span className="text-indigo-500">PRO</span>
            <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md">
              {viewNames[activeView]}
            </span>
          </h1>
          <p className="text-slate-500 text-sm hidden sm:block">Secure Path & Tracker Audit v2.4</p>
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Status do Motor</span>
          <span className="flex items-center gap-2 text-emerald-400 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Ativo & Protegido
          </span>
        </div>
      </div>
    </header>
  );
}
