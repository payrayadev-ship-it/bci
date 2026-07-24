import React from 'react';
import {
  X,
  CornerUpLeft,
  ArrowRight,
  Copy,
  Edit,
  Trash,
  Pin,
  Star,
  Info,
  Share2,
  Trash2
} from 'lucide-react';

interface ChatLongPressMenuProps {
  isOpen: boolean;
  onClose: () => void;
  message: {
    id: string;
    senderId: string;
    senderName: string;
    message: string;
    timestamp: string;
    isStarred?: boolean;
    isPinned?: boolean;
  } | null;
  currentUserId: string;
  onReply: () => void;
  onForward: () => void;
  onCopy: () => void;
  onEdit: () => void;
  onDeleteForMe: () => void;
  onDeleteForEveryone: () => void;
  onTogglePin: () => void;
  onToggleStar: () => void;
  onViewInfo: () => void;
  onShare: () => void;
  onAddReaction: (emoji: string) => void;
}

export default function ChatLongPressMenu({
  isOpen,
  onClose,
  message,
  currentUserId,
  onReply,
  onForward,
  onCopy,
  onEdit,
  onDeleteForMe,
  onDeleteForEveryone,
  onTogglePin,
  onToggleStar,
  onViewInfo,
  onShare,
  onAddReaction
}: ChatLongPressMenuProps) {
  if (!isOpen || !message) return null;

  const isOwn = message.senderId === currentUserId;
  
  // Custom WhatsApp style Reactions list
  const reactions = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '✅', '📋'];

  return (
    <div className="absolute inset-0 bg-slate-950/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in font-semibold text-xs text-slate-700 dark:text-slate-300">
      <div className="w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden max-h-[85vh] animate-slide-up">
        
        {/* Top Handle / Close indicator */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="h-1.5 w-12 bg-slate-200 dark:bg-slate-700 rounded-full" />
        </div>

        {/* Reaction Row */}
        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1 overflow-x-auto shrink-0 scrollbar-none bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex gap-2">
            {reactions.map(emoji => (
              <button
                key={emoji}
                onClick={() => {
                  onAddReaction(emoji);
                  onClose();
                }}
                className="text-2xl hover:scale-130 active:scale-95 transition-transform p-1.5 rounded-xl hover:bg-white dark:hover:bg-slate-800"
              >
                {emoji}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-red-500">
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Message Preview Container */}
        <div className="p-4 bg-orange-50/30 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 max-h-24 overflow-y-auto shrink-0">
          <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Pesan Terpilih</p>
          <p className="font-semibold text-slate-700 dark:text-slate-300 truncate text-[11.5px] leading-relaxed">
            {message.message}
          </p>
        </div>

        {/* Options List Grid */}
        <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-2 text-slate-800 dark:text-slate-200">
          
          <button
            onClick={() => { onReply(); onClose(); }}
            className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
          >
            <span className="p-2 bg-blue-500/10 text-blue-500 rounded-xl">
              <CornerUpLeft className="h-4 w-4" />
            </span>
            <span className="font-black text-[11px]">Balas</span>
          </button>

          <button
            onClick={() => { onForward(); onClose(); }}
            className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
          >
            <span className="p-2 bg-purple-500/10 text-purple-500 rounded-xl">
              <ArrowRight className="h-4 w-4" />
            </span>
            <span className="font-black text-[11px]">Teruskan</span>
          </button>

          <button
            onClick={() => { onCopy(); onClose(); }}
            className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
          >
            <span className="p-2 bg-teal-500/10 text-teal-500 rounded-xl">
              <Copy className="h-4 w-4" />
            </span>
            <span className="font-black text-[11px]">Salin</span>
          </button>

          <button
            onClick={() => { onToggleStar(); onClose(); }}
            className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
          >
            <span className={`p-2 rounded-xl ${message.isStarred ? 'bg-amber-500/20 text-amber-500' : 'bg-slate-500/10 text-slate-400'}`}>
              <Star className="h-4 w-4 fill-current" />
            </span>
            <span className="font-black text-[11px]">{message.isStarred ? 'Hapus Bintang' : 'Bintangi'}</span>
          </button>

          <button
            onClick={() => { onTogglePin(); onClose(); }}
            className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
          >
            <span className={`p-2 rounded-xl ${message.isPinned ? 'bg-red-500/20 text-red-500' : 'bg-slate-500/10 text-slate-400'}`}>
              <Pin className="h-4 w-4" />
            </span>
            <span className="font-black text-[11px]">{message.isPinned ? 'Lepas Pin' : 'Pin Obrolan'}</span>
          </button>

          <button
            onClick={() => { onViewInfo(); onClose(); }}
            className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
          >
            <span className="p-2 bg-orange-500/10 text-[#FF6B00] rounded-xl">
              <Info className="h-4 w-4" />
            </span>
            <span className="font-black text-[11px]">Detail Info</span>
          </button>

          <button
            onClick={() => { onShare(); onClose(); }}
            className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
          >
            <span className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <Share2 className="h-4 w-4" />
            </span>
            <span className="font-black text-[11px]">Bagikan</span>
          </button>

          {isOwn && (
            <button
              onClick={() => { onEdit(); onClose(); }}
              className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
            >
              <span className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl">
                <Edit className="h-4 w-4" />
              </span>
              <span className="font-black text-[11px]">Edit Pesan</span>
            </button>
          )}

          <div className="col-span-2 border-t border-slate-100 dark:border-slate-800 my-1" />

          {/* Delete Buttons */}
          <button
            onClick={() => { onDeleteForMe(); onClose(); }}
            className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left text-red-600 dark:text-red-400"
          >
            <span className="p-2 bg-red-500/10 text-red-500 rounded-xl">
              <Trash className="h-4 w-4" />
            </span>
            <span className="font-black text-[11px]">Hapus untuk Saya</span>
          </button>

          {isOwn && (
            <button
              onClick={() => { onDeleteForEveryone(); onClose(); }}
              className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left text-red-600 dark:text-red-500"
            >
              <span className="p-2 bg-red-500/20 text-red-600 rounded-xl animate-pulse">
                <Trash2 className="h-4 w-4" />
              </span>
              <span className="font-black text-[11px]">Hapus untuk Semua</span>
            </button>
          )}

        </div>

      </div>
    </div>
  );
}
