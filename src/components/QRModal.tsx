import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRModalProps {
  url: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function QRModal({ url, isOpen, onClose }: QRModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#05060a]/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f111a] border border-slate-800/60 shadow-2xl rounded-3xl p-8 max-w-sm w-full space-y-6 text-center transform transition-all">
        <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-widest">Abrir no Telemóvel</h4>
        
        <div className="bg-white p-4 rounded-2xl inline-block shadow-[0_0_30px_rgba(255,255,255,0.1)]">
          <QRCodeSVG value={url} size={200} level="H" />
        </div>
        
        <p className="text-[10px] font-mono text-slate-500 break-all bg-[#05060a] p-3 rounded-xl border border-slate-800/50">
          {url}
        </p>
        
        <button 
          onClick={onClose}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-600/20 transition-transform active:scale-95"
        >
          Fechar QR Code
        </button>
      </div>
    </div>
  );
}
