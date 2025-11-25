import React, { useState, useEffect } from 'react';
import { DetoxResponse, Category, DetoxItem } from '../types';
import { Trash2, Archive, AlertCircle, Calendar, DollarSign, Search, Eye, EyeOff, ShieldCheck, ExternalLink, CheckCircle, X, Check } from 'lucide-react';
import Stats from './Stats';

interface DashboardProps {
  data: DetoxResponse;
  originalImage: string | null;
  onReset: () => void;
}

interface ItemCardProps {
  item: DetoxItem;
  isPrivacyMode: boolean;
  onDelete: (id: number) => void;
  onArchive: (id: number) => void;
  onTogglePaid: (id: number) => void;
}

const CategoryBadge: React.FC<{ category: Category }> = ({ category }) => {
  const styles = {
    [Category.ACTION]: "bg-red-100 text-red-700 border-red-200",
    [Category.ARCHIVE]: "bg-blue-100 text-blue-700 border-blue-200",
    [Category.TRASH]: "bg-gray-100 text-gray-700 border-gray-200",
  };

  const labels = {
    [Category.ACTION]: "AZIONE",
    [Category.ARCHIVE]: "ARCHIVIO",
    [Category.TRASH]: "CESTINO",
  };

  const icons = {
    [Category.ACTION]: <AlertCircle className="w-3 h-3 mr-1" />,
    [Category.ARCHIVE]: <Archive className="w-3 h-3 mr-1" />,
    [Category.TRASH]: <Trash2 className="w-3 h-3 mr-1" />,
  };

  return (
    <span className={`flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles[category]}`}>
      {icons[category]}
      {labels[category]}
    </span>
  );
};

const ItemCard: React.FC<ItemCardProps> = ({ item, isPrivacyMode, onDelete, onArchive, onTogglePaid }) => {
  
  const generateCalendarUrl = (item: DetoxItem) => {
    if (!item.deadline || item.deadline === 'N/A' || item.isPaid) return null;
    
    // Tentativo di parsing della data
    let dateStr = item.deadline;
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    
    if (!datePattern.test(dateStr)) return null;

    const startDate = dateStr.replace(/-/g, '');
    const title = encodeURIComponent(`Pagare ${item.sender}`);
    const details = encodeURIComponent(`Importo: ${item.amount || 'N/A'}\nNota: ${item.action_suggested}\nGenerato da Desk Detox AI`);
    
    // Imposta orario alle 09:00 AM
    const dates = `${startDate}T090000Z/${startDate}T100000Z`;

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}`;
  };

  const calendarUrl = generateCalendarUrl(item);
  const isPaid = item.isPaid || false;

  return (
    <div className={`bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full relative overflow-hidden group ${isPaid ? 'border-green-200 bg-green-50/30' : 'border-gray-200'}`}>
      
      {/* Badge Urgente */}
      {item.urgency_score >= 8 && item.category === Category.ACTION && !isPaid && (
        <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold z-10">
          URGENTE
        </div>
      )}

      {/* Badge Pagato */}
      {isPaid && (
        <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold z-10 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" /> PAGATO
        </div>
      )}
      
      <div>
        <div className="flex justify-between items-start mb-2 pr-6">
          <CategoryBadge category={item.category} />
        </div>
        
        {/* Dati Censurati se Privacy Mode è attiva */}
        <h4 className={`text-lg font-bold text-gray-900 mb-1 leading-tight transition-all duration-300`}>
          {isPrivacyMode ? '•••••••' : item.sender}
        </h4>
        <p className="text-sm text-gray-500 font-medium mb-3">{item.type}</p>
        
        <div className="space-y-2 mb-4">
            {item.deadline && item.deadline !== 'N/A' && (
                <div className={`flex items-center justify-between text-sm p-2 rounded-lg ${isPaid ? 'bg-green-100 text-green-800' : 'bg-gray-50 text-gray-700'}`}>
                    <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 opacity-50" />
                        <span className={isPaid ? 'line-through opacity-70' : ''}>
                           Scadenza: <span className="font-semibold">{item.deadline}</span>
                        </span>
                    </div>
                </div>
            )}
            {item.amount && (
                <div className="flex items-center text-sm text-gray-900">
                    <DollarSign className={`w-4 h-4 mr-2 ${isPaid ? 'text-gray-400' : 'text-green-500'}`} />
                    <span className={`font-bold transition-all duration-300 ${isPaid ? 'text-gray-500 line-through' : 'text-green-700'}`}>
                      {isPrivacyMode ? '€ ••••' : item.amount}
                    </span>
                </div>
            )}
            {!isPaid && (
              <div className="bg-blue-50 p-2 rounded-lg text-sm text-blue-800 mt-2 border border-blue-100">
                  "{item.action_suggested}"
              </div>
            )}
        </div>
      </div>

      {/* Action Bar Bottom */}
      <div className="pt-3 mt-2 border-t border-gray-100 flex items-center justify-between gap-2">
        
        {/* Link Calendar (solo se Action, non pagato e scadenza valida) */}
        {calendarUrl && item.category === Category.ACTION && !isPaid ? (
          <a 
            href={calendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 px-2 py-1.5 rounded-lg text-xs font-bold transition-colors"
          >
            <Calendar className="w-3.5 h-3.5" />
            Agenda
          </a>
        ) : <div className="flex-1"></div>}

        <div className="flex items-center gap-1">
            {/* Mark as Paid Button */}
            {item.category === Category.ACTION && (
                <button
                    onClick={() => onTogglePaid(item.id)}
                    title={isPaid ? "Segna come non pagato" : "Segna come pagato"}
                    className={`p-1.5 rounded-lg border transition-colors ${
                        isPaid 
                        ? 'bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100' 
                        : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                    }`}
                >
                    {isPaid ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                </button>
            )}

            {/* Archive Button */}
            {item.category !== Category.ARCHIVE && (
                <button
                    onClick={() => onArchive(item.id)}
                    title="Archivia"
                    className="p-1.5 rounded-lg bg-gray-50 text-gray-600 border border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                >
                    <Archive className="w-4 h-4" />
                </button>
            )}

            {/* Delete Button */}
            <button
                onClick={() => onDelete(item.id)}
                title="Elimina"
                className="p-1.5 rounded-lg bg-gray-50 text-gray-600 border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ data, originalImage, onReset }) => {
  // Local state initialized from props
  const [items, setItems] = useState<DetoxItem[]>([]);
  const [filter, setFilter] = useState<Category | 'ALL'>('ALL');
  // Privacy defaults to TRUE
  const [privacyMode, setPrivacyMode] = useState(true);
  const [revealImage, setRevealImage] = useState(false);

  // Sync state if new data arrives
  useEffect(() => {
    setItems(data.items);
  }, [data]);

  // Actions
  const handleDelete = (id: number) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleArchive = (id: number) => {
    setItems(prev => prev.map(item => 
        item.id === id ? { ...item, category: Category.ARCHIVE } : item
    ));
  };

  const handleTogglePaid = (id: number) => {
    setItems(prev => prev.map(item => 
        item.id === id ? { ...item, isPaid: !item.isPaid } : item
    ));
  };

  const filteredItems = items.filter(item => filter === 'ALL' || item.category === filter);
  
  // Calculate total: only Action items, that are NOT paid
  const totalAmount = items
    .filter(i => i.category === Category.ACTION && !i.isPaid && i.amount)
    .reduce((sum, item) => {
        const num = parseFloat(item.amount?.replace(/[^0-9.,]/g, '').replace(',', '.') || '0');
        return sum + num;
    }, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Bar with Privacy Control */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Report Analisi</h1>
          <p className="text-gray-500 mt-1">{data.summary}</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
             <button 
                onClick={() => setPrivacyMode(!privacyMode)}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg border font-medium transition-colors ${
                    privacyMode 
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
            >
                {privacyMode ? <ShieldCheck className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {privacyMode ? 'Privacy Attiva' : 'Privacy Disattivata'}
            </button>
            <button 
                onClick={onReset}
                className="flex-1 md:flex-none bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 font-medium transition-colors shadow-sm"
            >
                Nuova Scansione
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 grid grid-cols-1 gap-4">
            
            {/* Quick Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Documenti</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">{items.length}</div>
                </div>
                <div className="bg-red-50 p-4 rounded-xl shadow-sm border border-red-100">
                    <div className="text-red-600 text-xs font-semibold uppercase tracking-wider">Da Pagare</div>
                    <div className="text-2xl font-bold text-red-700 mt-1">
                        {items.filter(i => i.category === Category.ACTION && !i.isPaid).length}
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Stima Totale</div>
                    <div className={`text-2xl font-bold text-gray-900 mt-1 transition-all ${privacyMode ? 'blur-sm select-none' : ''}`}>
                         €{totalAmount.toFixed(2)}
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Urgenza Max</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">
                        {Math.max(...items.filter(i => !i.isPaid).map(i => i.urgency_score), 0)}/10
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex space-x-2 overflow-x-auto pb-2 no-scrollbar">
                {(['ALL', Category.ACTION, Category.ARCHIVE, Category.TRASH] as const).map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                            filter === cat 
                            ? 'bg-gray-900 text-white' 
                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-transparent'
                        }`}
                    >
                        {cat === 'ALL' ? 'Tutti' : cat === Category.ACTION ? 'Azioni' : cat === Category.ARCHIVE ? 'Archivio' : 'Cestino'}
                    </button>
                ))}
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredItems.length > 0 ? (
                    filteredItems.map(item => (
                        <ItemCard 
                            key={item.id} 
                            item={item} 
                            isPrivacyMode={privacyMode}
                            onDelete={handleDelete}
                            onArchive={handleArchive}
                            onTogglePaid={handleTogglePaid}
                        />
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">
                        <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>Nessun documento trovato.</p>
                    </div>
                )}
            </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
            {/* Image Preview with Auto-Blur */}
            {originalImage && (
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold text-gray-800">Scansione Originale</h3>
                        <button 
                            onClick={() => setRevealImage(!revealImage)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            {revealImage ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    <div 
                        className="relative aspect-video rounded-lg overflow-hidden cursor-pointer bg-gray-100 group"
                        onClick={() => setRevealImage(!revealImage)}
                    >
                        <img 
                            src={`data:image/jpeg;base64,${originalImage}`} 
                            alt="Scanned Desk" 
                            className={`w-full h-full object-cover transition-all duration-500 ${revealImage ? 'filter-none' : 'filter blur-lg scale-110'}`}
                        />
                        {!revealImage && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
                                <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold text-gray-700 flex items-center gap-2 shadow-sm">
                                    <ShieldCheck className="w-3 h-3 text-green-600" />
                                    Protetto da Privacy
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <Stats items={items} />
            
            {/* Action Plan Widget */}
            <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-lg font-bold mb-4">Piano d'Attacco</h3>
                <ul className="space-y-4">
                    {items
                        .filter(i => i.category === Category.ACTION && !i.isPaid)
                        .sort((a, b) => b.urgency_score - a.urgency_score)
                        .slice(0, 5)
                        .map((item, idx) => (
                        <li key={item.id} className="flex gap-3 items-start">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-xs font-bold mt-0.5">
                                {idx + 1}
                            </span>
                            <div className="flex-1">
                                <p className="font-semibold text-sm">{item.action_suggested}</p>
                                <div className="flex justify-between items-center mt-0.5">
                                    <p className="text-xs text-gray-400">
                                        {privacyMode ? '•••••••' : item.sender}
                                    </p>
                                    {item.deadline && <p className="text-xs text-gray-400">Entro {item.deadline}</p>}
                                </div>
                            </div>
                        </li>
                    ))}
                    {items.filter(i => i.category === Category.ACTION && !i.isPaid).length === 0 && (
                        <li className="text-gray-400 italic text-sm">Tutto pulito! Nessuna azione urgente richiesta.</li>
                    )}
                </ul>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;