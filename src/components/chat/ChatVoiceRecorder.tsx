import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Pause, Play, Send, Mic, X } from 'lucide-react';

interface ChatVoiceRecorderProps {
  onCancel: () => void;
  onSend: (duration: string, waveData: number[]) => void;
}

export default function ChatVoiceRecorder({ onCancel, onSend }: ChatVoiceRecorderProps) {
  const [seconds, setSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [wave, setWave] = useState<number[]>([20, 30, 40, 20, 10, 35, 45, 60, 20, 15, 30, 45, 70, 80, 20, 10, 40, 50, 20, 10]);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
        
        // Generate dynamic live waveform values to make it look incredibly responsive
        setWave(prev => {
          const next = [...prev.slice(1)];
          next.push(Math.floor(Math.random() * 85) + 15);
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  const formatTimer = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSend = () => {
    const formattedDuration = formatTimer(seconds);
    onSend(formattedDuration, wave);
  };

  return (
    <div className="w-full flex items-center justify-between gap-3 p-3.5 bg-orange-50 dark:bg-slate-900 border-t border-orange-100 dark:border-slate-800 animate-slide-up rounded-2xl">
      
      {/* Delete / Cancel button */}
      <button
        onClick={onCancel}
        className="p-3.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-full transition-colors active:scale-90"
        title="Batalkan Rekaman"
      >
        <Trash2 className="h-5 w-5" />
      </button>

      {/* Timer & animated wave */}
      <div className="flex-1 flex items-center gap-4 px-4">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="h-2 w-2 bg-red-500 rounded-full animate-ping" />
          <span className="font-mono font-black text-sm text-slate-800 dark:text-white">
            {formatTimer(seconds)}
          </span>
        </div>

        {/* Waves equalizers */}
        <div className="flex-1 flex items-end gap-1.5 h-8">
          {wave.map((val, idx) => (
            <div
              key={idx}
              className={`flex-1 rounded-full transition-all duration-300 ${isPaused ? 'bg-slate-300 dark:bg-slate-700' : 'bg-orange-500'}`}
              style={{ height: `${val}%`, minWidth: '4px' }}
            />
          ))}
        </div>
      </div>

      {/* Controls: Pause / Play, Send */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsPaused(!isPaused)}
          className={`p-3.5 rounded-full transition-all active:scale-90 flex items-center justify-center ${
            isPaused ? 'bg-[#FF6B00] text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
          title={isPaused ? 'Lanjutkan Rekaman' : 'Jeda Rekaman'}
        >
          {isPaused ? <Play className="h-4.5 w-4.5 fill-current" /> : <Pause className="h-4.5 w-4.5" />}
        </button>

        <button
          onClick={handleSend}
          className="p-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:brightness-110 text-white rounded-full transition-all active:scale-90 shadow-md shadow-orange-500/20"
          title="Kirim Voice Note"
        >
          <Send className="h-5 w-5 fill-current ml-0.5" />
        </button>
      </div>

    </div>
  );
}
