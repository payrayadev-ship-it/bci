import React, { useState } from 'react';
import { X, Search, Check, Send } from 'lucide-react';

interface ChatForwardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onForwardDone: (targetChatIds: string[]) => void;
  participants: {
    id: string;
    name: string;
    role: string;
    avatar: string;
  }[];
}

export default function ChatForwardModal({
  isOpen,
  onClose,
  onForwardDone,
  participants
}: ChatForwardModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const filtered = participants.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSend = () => {
    if (selectedIds.length === 0) {
      alert('Silakan pilih minimal satu tujuan pengiriman.');
      return;
    }
    onForwardDone(selectedIds);
    setSelectedIds([]);
    onClose();
  };

  return (
    <div className="absolute inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 animate-fade-in text-xs font-semibold">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden animate-zoom-in">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-black text-slate-900 dark:text-white text-sm">Teruskan Pesan</h3>
            <p className="text-[10px] text-slate-400 font-bold">Pilih kontak atau grup penerima</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-50 dark:border-slate-800/50 shrink-0">
          <div className="relative">
            <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari penerima..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 py-2 pl-9 pr-3 text-[11px] outline-none transition-all focus:bg-white focus:border-[#FF6B00] dark:text-white"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 max-h-60 space-y-1 divide-y divide-slate-50 dark:divide-slate-800/30">
          {filtered.map(p => {
            const isSelected = selectedIds.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => toggleSelect(p.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                  isSelected ? 'bg-orange-500/5 dark:bg-orange-500/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img src={p.avatar} alt={p.name} className="h-10 w-10 rounded-xl object-cover border border-slate-100 dark:border-slate-800" />
                  <div className="min-w-0">
                    <p className="font-black text-slate-900 dark:text-white truncate">{p.name}</p>
                    <p className="text-[10px] text-[#FF6B00] font-bold truncate">{p.role}</p>
                  </div>
                </div>

                <div className={`h-5 w-5 rounded-md border flex items-center justify-center transition-all ${
                  isSelected ? 'bg-[#FF6B00] border-[#FF6B00] text-white' : 'border-slate-300 dark:border-slate-600'
                }`}>
                  {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between shrink-0">
          <span className="text-[10.5px] text-slate-500 dark:text-slate-400 font-bold">
            {selectedIds.length} Tujuan Terpilih
          </span>
          <button
            onClick={handleSend}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:brightness-110 text-white font-black flex items-center gap-2 cursor-pointer shadow-md shadow-orange-500/10"
          >
            <span>Kirim</span>
            <Send className="h-3.5 w-3.5 fill-current ml-0.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
