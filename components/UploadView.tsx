import React, { useRef, useState, useCallback } from 'react';
import { Camera, Upload, Image as ImageIcon, FileVideo } from 'lucide-react';

interface UploadViewProps {
  onImageSelected: (base64: string) => void;
  isLoading: boolean;
}

const UploadView: React.FC<UploadViewProps> = ({ onImageSelected, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Extract base64 part
      const base64 = result.split(',')[1];
      onImageSelected(base64);
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.error("Camera access denied:", err);
      alert("Impossibile accedere alla fotocamera. Controlla i permessi.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        const base64 = dataUrl.split(',')[1];
        
        // Stop stream
        const stream = video.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
        setCameraActive(false);
        
        onImageSelected(base64);
      }
    }
  };

  const stopCamera = () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        setCameraActive(false);
      }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        
        <div className="space-y-4">
            <div className="inline-flex items-center justify-center p-4 bg-green-100 rounded-2xl mb-2">
                <div className="relative">
                    <ImageIcon className="w-10 h-10 text-green-600" />
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                        <div className="bg-red-500 w-3 h-3 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
            Desk Detox AI
            </h1>
            <p className="text-lg text-gray-500 max-w-lg mx-auto">
            Il tuo assistente esecutivo per il disordine. Carica una foto della tua scrivania o dei tuoi documenti e lascia che l'IA organizzi tutto.
            </p>
        </div>

        {cameraActive ? (
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black w-full max-w-md mx-auto aspect-[3/4] md:aspect-video">
                <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-cover"
                />
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
                    <button 
                        onClick={stopCamera}
                        className="bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-full font-semibold hover:bg-white/30 transition"
                    >
                        Annulla
                    </button>
                    <button 
                        onClick={capturePhoto}
                        className="bg-white text-gray-900 px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition transform flex items-center gap-2"
                    >
                        <Camera className="w-5 h-5" /> Scatta
                    </button>
                </div>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-xl mx-auto">
                <button 
                    onClick={startCamera}
                    disabled={isLoading}
                    className="group relative flex flex-col items-center justify-center p-8 bg-white border-2 border-gray-100 rounded-2xl shadow-sm hover:border-green-500 hover:shadow-md transition-all duration-300 h-64"
                >
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Camera className="w-8 h-8 text-green-600" />
                    </div>
                    <span className="text-lg font-semibold text-gray-900">Scatta Foto</span>
                    <span className="text-sm text-gray-500 mt-2">Usa la fotocamera</span>
                </button>

                <div 
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`cursor-pointer group relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl transition-all duration-300 h-64 ${
                        isDragging 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 bg-white hover:border-green-400 hover:bg-gray-50'
                    }`}
                >
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="w-8 h-8 text-blue-600" />
                    </div>
                    <span className="text-lg font-semibold text-gray-900">Carica File</span>
                    <span className="text-sm text-gray-500 mt-2 text-center">Trascina o clicca per caricare<br/>(JPG, PNG)</span>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        className="hidden" 
                    />
                </div>
            </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        {isLoading && (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4"></div>
                <h3 className="text-xl font-bold text-gray-800 animate-pulse">Analisi in corso...</h3>
                <p className="text-gray-500 mt-2">Sto leggendo i tuoi documenti</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default UploadView;