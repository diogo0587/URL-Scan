import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Trash2, CheckCircle2, Circle } from 'lucide-react';
import clsx from 'clsx';

export default function RulesView() {
  const { rules, toggleRule, deleteRule, addRule } = useAppStore();
  
  const [name, setName] = useState('');
  const [regex, setRegex] = useState('');
  const [replacement, setReplacement] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !regex || !replacement) return;
    addRule({ name, regex, replacement, active: true, isDecode: false });
    setName('');
    setRegex('');
    setReplacement('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-[#0f111a] border border-slate-800/60 rounded-3xl p-6 shadow-2xl space-y-6 min-h-[500px]">
        <div>
          <h3 className="text-base font-bold text-slate-100">Regras de Redirecionamento de Privacidade</h3>
          <p className="text-xs text-slate-400 font-medium">Substitua domínios intrusivos por espelhos de privacidade.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map(rule => (
            <div key={rule.id} className={clsx("p-4 rounded-2xl border flex flex-col gap-2 transition-all", rule.active ? "bg-[#05060a] border-indigo-900/50 shadow-[0_0_10px_rgba(79,70,229,0.05)]" : "bg-[#05060a] border-slate-800 opacity-60")}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => toggleRule(rule.id)}>
                  {rule.active ? <CheckCircle2 className="w-4 h-4 text-indigo-400" /> : <Circle className="w-4 h-4 text-slate-500" />}
                  <span className="text-sm font-bold text-slate-300">{rule.name}</span>
                </div>
                <button onClick={() => deleteRule(rule.id)} className="text-slate-500 hover:text-rose-400 transition" title="Remover Regra">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="bg-slate-900/50 p-3 rounded-lg text-[10px] font-mono text-slate-400 break-all border border-slate-800">
                {rule.regex} <br/> ➔ {rule.replacement}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="bg-[#05060a] p-5 rounded-2xl border border-slate-800/60 space-y-4">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block">Adicionar Nova Regra</span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input 
              value={name} onChange={e => setName(e.target.value)}
              type="text" placeholder="Nome" 
              className="bg-[#0f111a] border border-slate-800 text-sm text-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500 transition-colors" required 
            />
            <input 
              value={regex} onChange={e => setRegex(e.target.value)}
              type="text" placeholder="Regex" 
              className="bg-[#0f111a] border border-slate-800 text-sm text-slate-200 font-mono rounded-xl p-3 focus:outline-none focus:border-indigo-500 transition-colors" required 
            />
            <input 
              value={replacement} onChange={e => setReplacement(e.target.value)}
              type="text" placeholder="Substituição" 
              className="bg-[#0f111a] border border-slate-800 text-sm text-slate-200 font-mono rounded-xl p-3 focus:outline-none focus:border-indigo-500 transition-colors" required 
            />
          </div>
          <button type="submit" className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-transform active:scale-95">
            Guardar Regra
          </button>
        </form>
      </div>
    </div>
  );
}
