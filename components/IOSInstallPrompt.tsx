import React, { useState, useEffect } from 'react';
import { Share, PlusSquare, X } from 'lucide-react';

export const IOSInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Rilevamento specifico per iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    
    // Verifica se è già in modalità "standalone" (app installata)
    const isStandalone = ('standalone' in window.navigator) && (window.navigator as any).standalone;

    // Mostra solo se è iOS e NON è già installata
    if (isIOS && !isStandalone) {
      // Ritardo per non aggredire l'utente appena apre il sito
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-up">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-gray-200 relative max-w-sm mx-auto">
        <button 
          onClick={() => setShowPrompt(false)}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-1"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex items-start gap-4">
          <div className="bg-gray-100 p-2 rounded-xl flex-shrink-0">
             <img src="https://cdn-icons-png.flaticon.com/512/2921/2921222.png" className="w-8 h-8" alt="App Icon" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm">Installa Desk Detox</h4>
            <p className="text-gray-500 text-xs mt-1 leading-relaxed">
              Per un'esperienza migliore, aggiungi questa app alla tua schermata Home.
            </p>
            
            <div className="mt-3 flex flex-col gap-2 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">1.</span>
                <span>Tocca l'icona Condividi</span>
                <Share className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">2.</span>
                <span>Scorri e scegli <span className="font-semibold">"Aggiungi alla Home"</span></span>
                <PlusSquare className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Triangolo che punta verso il basso (verso la barra di navigazione Safari solitamente) */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-r border-b border-gray-200"></div>
      </div>
    </div>
  );
};