import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import AnalyzerView from './components/AnalyzerView';
import RulesView from './components/RulesView';
import HistoryView from './components/HistoryView';
import SettingsView from './components/SettingsView';
import { useAppStore } from './store';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const activeView = useAppStore(state => state.activeView);

  return (
    <div className="bg-[#05060a] text-slate-200 font-sans min-h-screen flex selection:bg-indigo-500 selection:text-white overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden p-4 lg:p-6">
        <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto">
          {activeView === 'analyzer' && <AnalyzerView />}
          {activeView === 'rules' && <RulesView />}
          {activeView === 'history' && <HistoryView />}
          {activeView === 'settings' && <SettingsView />}
        </main>

        <footer className="mt-4 flex flex-col sm:flex-row justify-between items-center px-4 shrink-0 gap-4">
          <div className="flex gap-8">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Total Analisado</span>
              <span className="text-sm font-mono text-slate-400">1,248 URLs</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Lixo Removido</span>
              <span className="text-sm font-mono text-emerald-500">4.2 MB</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-slate-600 hidden md:inline-block">Localização: <span className="text-slate-400 font-mono">Lisbon, PT</span></span>
            <div className="h-4 w-px bg-slate-800 hidden md:block"></div>
            <span className="text-slate-600">Versão <span className="text-indigo-500">2.4.0-Stable</span></span>
          </div>
        </footer>
      </div>
    </div>
  );
}
