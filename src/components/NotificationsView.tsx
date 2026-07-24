import React from 'react';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  FileText,
  TrendingUp,
  Sparkles,
  Award,
  ChevronRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { AppDatabase, Notification, User } from '../types';

interface NotificationsViewProps {
  db: AppDatabase;
  currentUser: User;
  onRefresh: () => void;
  onViewChange: (view: string) => void;
}

export default function NotificationsView({
  db,
  currentUser,
  onRefresh,
  onViewChange
}: NotificationsViewProps) {
  
  // Filter alerts for current user
  const userNotifications = db.notifications;

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAction = (type: string) => {
    if (type === 'matching') {
      onViewChange('matching');
    } else if (type === 'tender') {
      onViewChange('tender');
    } else {
      onViewChange('chat');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Header alert */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h2 className="font-black text-slate-900 text-base flex items-center gap-1.5">
            <Bell className="h-5 w-5 text-[#FF6B00] animate-bounce" />
            Pemberitahuan Sistem BCI
          </h2>
          <p className="text-xs text-slate-400 font-bold mt-0.5">Kelola konfirmasi legalitas NIB, matching investor, dan update draf kontrak</p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="rounded-2xl bg-[#FFFDF7] border border-orange-200/50 hover:bg-orange-50/70 text-[#FF6B00] px-4 py-2.5 text-xs font-black flex items-center gap-1 cursor-pointer shadow-sm transition-all active:scale-95"
        >
          <Check className="h-3.5 w-3.5" />
          <span>Tandai Semua Dibaca</span>
        </button>
      </div>

      {/* Notifications list stream */}
      <div className="space-y-3.5">
        {userNotifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200/60 shadow-md glass-card">
            <Bell className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-xs font-black">Kotak masuk pemberitahuan kosong.</p>
          </div>
        ) : (
          userNotifications.map(notif => {
            return (
              <div
                key={notif.id}
                className={`rounded-3xl border p-4.5 shadow-md flex items-start gap-4 transition-all text-xs glossy-top-highlight relative overflow-hidden hover:shadow-lg ${
                  notif.isRead 
                    ? 'bg-white border-slate-200/60' 
                    : 'bg-[#FFFDF7]/70 border-[#FFD54F]/45'
                }`}
              >
                {/* Visual Type indicator icons */}
                <div className={`h-11 w-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm font-black ${
                  notif.type === 'system' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                  notif.type === 'matching' ? 'bg-orange-50 text-[#FF6B00] border border-orange-100' :
                  notif.type === 'legal' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-[#FFB300] border border-amber-100'
                }`}>
                  {notif.type === 'system' && <ShieldCheck className="h-5 w-5" />}
                  {notif.type === 'matching' && <Sparkles className="h-5 w-5" />}
                  {notif.type === 'legal' && <Award className="h-5 w-5" />}
                  {notif.type === 'tender' && <FileText className="h-5 w-5" />}
                </div>

                {/* Text details */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-slate-900 text-sm">{notif.title}</h4>
                    <span className="text-[9px] text-slate-400 font-bold bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">{new Date(notif.timestamp).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-600 font-semibold leading-relaxed">{notif.message}</p>
                </div>

                {/* Right Action Trigger */}
                <button
                  onClick={() => handleAction(notif.type)}
                  className="rounded-xl bg-white border border-slate-200 hover:border-orange-200 hover:bg-orange-50/50 p-2 text-slate-400 hover:text-[#FF6B00] self-center cursor-pointer shadow-sm transition-all"
                >
                  <ChevronRight className="h-4.5 w-4.5" />
                </button>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
