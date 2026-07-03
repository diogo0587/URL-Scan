import React from 'react';
import { X, Search, Settings, FolderOpen, ShieldCheck, Bell } from 'lucide-react';
import { useAppStore } from '../store';
import clsx from 'clsx';

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

export default function Sidebar({ isOpen, closeSidebar }: SidebarProps) {
  const { activeView, setActiveView } = useAppStore();

  const handleNav = (view: 'analyzer' | 'rules' | 'history' | 'settings') => {
    setActiveView(view);
    closeSidebar();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={clsx(
          "fixed inset-0 bg-[#05060a]/80 z-50 transition-opacity duration-300 lg:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={closeSidebar}
      />
      
      {/* Drawer / Rail */}
      <aside 
        className={clsx(
          "fixed lg:static top-0 left-0 bottom-0 w-72 lg:w-20 xl:w-64 bg-[#0a0c14] border-r border-slate-800/50 z-50 transform transition-transform duration-300 ease-in-out flex flex-col justify-between shrink-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div>
          <div className="p-6 flex items-center justify-between lg:justify-center xl:justify-between">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.4)] shrink-0">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-white text-xl lg:hidden xl:block tracking-tight">URLGuard</span>
            <button onClick={closeSidebar} className="lg:hidden p-1 rounded-lg hover:bg-slate-800 text-slate-400" title="Fechar Menu">
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="p-4 lg:p-2 xl:p-4 flex flex-col gap-4 items-stretch lg:items-center xl:items-stretch mt-4">
            <button 
              onClick={() => handleNav('analyzer')} 
              className={clsx(
                "w-full text-left p-3 rounded-xl text-sm font-medium flex items-center gap-3 transition-colors",
                activeView === 'analyzer' 
                  ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-inner" 
                  : "text-slate-500 hover:text-indigo-400"
              )}
            >
              <Search className="w-6 h-6 shrink-0" /> <span className="lg:hidden xl:inline">Analisador</span>
            </button>
            <button 
              onClick={() => handleNav('rules')} 
              className={clsx(
                "w-full text-left p-3 rounded-xl text-sm font-medium flex items-center gap-3 transition-colors",
                activeView === 'rules' 
                  ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-inner" 
                  : "text-slate-500 hover:text-indigo-400"
              )}
            >
              <Settings className="w-6 h-6 shrink-0" /> <span className="lg:hidden xl:inline">Regras</span>
            </button>
            <button 
              onClick={() => handleNav('settings')} 
              className={clsx(
                "w-full text-left p-3 rounded-xl text-sm font-medium flex items-center gap-3 transition-colors",
                activeView === 'settings' 
                  ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-inner" 
                  : "text-slate-500 hover:text-indigo-400"
              )}
            >
              <Bell className="w-6 h-6 shrink-0" /> <span className="lg:hidden xl:inline">Alertas e Configs</span>
            </button>
            <button 
              onClick={() => handleNav('history')} 
              className={clsx(
                "w-full text-left p-3 rounded-xl text-sm font-medium flex items-center gap-3 transition-colors",
                activeView === 'history' 
                  ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-inner" 
                  : "text-slate-500 hover:text-indigo-400"
              )}
            >
              <FolderOpen className="w-6 h-6 shrink-0" /> <span className="lg:hidden xl:inline">Histórico</span>
            </button>
          </nav>
        </div>
        <div className="p-6 flex justify-center mt-auto">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700"></div>
        </div>
      </aside>
    </>
  );
}
