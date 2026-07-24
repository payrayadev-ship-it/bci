import React, { useState } from 'react';
import { X, Sun, Moon, Database, Sliders, Check, RefreshCw } from 'lucide-react';

interface ChatSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  wallpaper: string;
  onChangeWallpaper: (wp: string) => void;
  fontSize: 'small' | 'medium' | 'large';
  onChangeFontSize: (sz: 'small' | 'medium' | 'large') => void;
  disappearingMessages: string;
  onChangeDisappearing: (val: string) => void;
}

export default function ChatSettingsModal({
  isOpen,
  onClose,
  isDarkMode,
  onToggleDarkMode,
  wallpaper,
  onChangeWallpaper,
  fontSize,
  onChangeFontSize,
  disappearingMessages,
  onChangeDisappearing
}: ChatSettingsModalProps) {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupStatus, setBackupStatus] = useState<string | null>(null);

  const wallpapers = [
    { id: 'classic-doodle', name: 'Classic Doodle', bg: 'bg-[#F2EFE9]', preview: 'bg-amber-100' },
    { id: 'midnight-blue', name: 'Midnight Blue', bg: 'bg-[#0B141A]', preview: 'bg-slate-900' },
    { id: 'coral-peach', name: 'Coral Peach', bg: 'bg-[#FFF5F0]', preview: 'bg-orange-50' },
    { id: 'slate-dark', name: 'Slate Dark', bg: 'bg-[#0F172A]', preview: 'bg-slate-800' },
    { id: 'emerald-green', name: 'Emerald', bg: 'bg-[#E1EFE6]', preview: 'bg-emerald-50' }
  ];

  const handleBackup = () => {
    setIsBackingUp(true);
    setBackupStatus('Sedang mencadangkan database chat ke cloud BCI...');
    setTimeout(() => {
      setBackupStatus('Enkripsi end-to-end sedang disinkronisasi...');
      setTimeout(() => {
        setIsBackingUp(false);
        setBackupStatus('Pencadangan Berhasil! (Ukuran: 142 KB • 100% Aman)');
      }, 1000);
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-slate-950/65 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in text-xs font-semibold">
      <div className="w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[85vh] flex flex-col overflow-hidden animate-slide-up">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Sliders className="h-4.5 w-4.5 text-[#FF6B00]" />
            <h3 className="font-black text-slate-900 dark:text-white text-sm">Pengaturan Obrolan</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* Theme Switcher */}
          <div className="space-y-2">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Tampilan & Tema</p>
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-700 dark:text-slate-300">Tema Gelap (Mata Lelah)</span>
              <button
                onClick={onToggleDarkMode}
                className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-amber-500 text-slate-600 dark:text-amber-400 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {isDarkMode ? (
                  <>
                    <Moon className="h-4 w-4" />
                    <span>Aktif</span>
                  </>
                ) : (
                  <>
                    <Sun className="h-4 w-4 text-amber-500" />
                    <span>Nonaktif</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Wallpaper Selection */}
          <div className="space-y-2">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Wallpaper Chat</p>
            <div className="grid grid-cols-5 gap-2">
              {wallpapers.map(wp => (
                <button
                  key={wp.id}
                  onClick={() => onChangeWallpaper(wp.id)}
                  className={`flex flex-col items-center gap-1 p-1 rounded-xl border transition-all ${
                    wallpaper === wp.id ? 'border-[#FF6B00] bg-orange-500/5' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800'
                  }`}
                >
                  <div className={`h-8 w-full rounded-lg ${wp.preview} border border-slate-100 dark:border-slate-700 flex items-center justify-center`}>
                    {wallpaper === wp.id && <Check className="h-3.5 w-3.5 text-[#FF6B00] stroke-[3]" />}
                  </div>
                  <span className="text-[8.5px] font-bold text-slate-500 dark:text-slate-400 truncate w-full text-center">{wp.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Font Size Selector */}
          <div className="space-y-2">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Ukuran Tulisan</p>
            <div className="flex gap-2">
              {(['small', 'medium', 'large'] as const).map(size => (
                <button
                  key={size}
                  onClick={() => onChangeFontSize(size)}
                  className={`flex-1 py-2.5 rounded-xl border text-center capitalize transition-all ${
                    fontSize === size
                      ? 'border-[#FF6B00] bg-[#FF6B00] text-white font-black'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {size === 'small' ? 'Kecil' : size === 'medium' ? 'Sedang' : 'Besar'}
                </button>
              ))}
            </div>
          </div>

          {/* Disappearing Messages (Keamanan & Efisiensi) */}
          <div className="space-y-2">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Pesan Sementara (Auto Hapus)</p>
            <select
              value={disappearingMessages}
              onChange={(e) => onChangeDisappearing(e.target.value)}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 outline-none font-bold cursor-pointer focus:border-[#FF6B00]"
            >
              <option value="off">Mati (Simpan Selamanya)</option>
              <option value="24h">24 Jam (Sehari)</option>
              <option value="7d">7 Hari (Seminggu)</option>
              <option value="90d">90 Hari (3 Bulan)</option>
            </select>
          </div>

          {/* Backup & Restore */}
          <div className="space-y-2">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Cadangan Chat BCI</p>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-3">
              <div className="flex items-start gap-2.5">
                <Database className="h-5 w-5 text-[#FF6B00] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-[11.5px]">Cadangan Cloud Aman</p>
                  <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                    Cadangkan riwayat chat penawaran, dokumen NIB, dan voice note penting ke cloud server BCI terenkripsi.
                  </p>
                </div>
              </div>

              {backupStatus && (
                <div className={`p-2.5 rounded-xl text-[10px] font-bold ${isBackingUp ? 'bg-amber-500/10 text-amber-500 animate-pulse' : 'bg-emerald-500/10 text-emerald-500'}`}>
                  {backupStatus}
                </div>
              )}

              <button
                type="button"
                onClick={handleBackup}
                disabled={isBackingUp}
                className="w-full py-2.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-[#FF6B00] border border-dashed border-orange-500/30 flex items-center justify-center gap-1.5 transition-all font-black cursor-pointer disabled:opacity-50"
              >
                {isBackingUp ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Database className="h-4 w-4" />
                )}
                <span>Cadangkan Riwayat Chat Sekarang</span>
              </button>
            </div>
          </div>

          {/* Media Auto Download & Quality */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Auto Download</p>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                <span className="text-[10.5px]">Gunakan Wi-Fi</span>
                <input type="checkbox" defaultChecked className="accent-[#FF6B00] h-4 w-4 cursor-pointer" />
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Kualitas Gambar</p>
              <select className="w-full p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-[10.5px]">
                <option value="auto">Otomatis</option>
                <option value="high">Kualitas Terbaik</option>
                <option value="saver">Penghemat Data</option>
              </select>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
