import React, { useState } from 'react';
import UploadView from './components/UploadView';
import Dashboard from './components/Dashboard';
import { IOSInstallPrompt } from './components/IOSInstallPrompt';
import { analyzeImage } from './services/geminiService';
import { DetoxResponse, ProcessingStatus } from './types';
import { Info } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [data, setData] = useState<DetoxResponse | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelected = async (base64: string) => {
    setCurrentImage(base64);
    setStatus('analyzing');
    setError(null);
    
    try {
      const result = await analyzeImage(base64);
      setData(result);
      setStatus('complete');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Si è verificato un errore durante l'analisi. Riprova.");
      setStatus('error');
    }
  };

  const handleReset = () => {
    setData(null);
    setCurrentImage(null);
    setStatus('idle');
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB] text-gray-900">
      <IOSInstallPrompt />
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 safe-area-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={handleReset}>
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">D</div>
                <span className="font-bold text-xl tracking-tight hidden sm:block">Desk Detox AI</span>
            </div>
            
            <div className="flex items-center gap-4">
                <button className="text-gray-500 hover:text-gray-900 transition-colors">
                    <Info className="w-5 h-5" />
                </button>
                <div className="h-4 w-px bg-gray-200"></div>
                <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
                   <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                   <span className="text-xs font-medium text-gray-600">Gemini 2.5 Flash</span>
                </div>
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 safe-area-bottom">
        {status === 'error' && (
           <div className="max-w-lg mx-auto mt-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 mx-4">
             <div className="flex-shrink-0">⚠️</div>
             <p>{error}</p>
             <button onClick={handleReset} className="ml-auto text-sm font-bold hover:underline">Riprova</button>
           </div>
        )}

        {status === 'complete' && data ? (
          <Dashboard 
            data={data} 
            originalImage={currentImage}
            onReset={handleReset} 
          />
        ) : (
          <UploadView 
            onImageSelected={handleImageSelected} 
            isLoading={status === 'analyzing'} 
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mb-safe">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-400">
            <p className="flex items-center justify-center gap-2">
                Powered by Google Gemini • Built for Efficiency
            </p>
        </div>
      </footer>
    </div>
  );
};

export default App;