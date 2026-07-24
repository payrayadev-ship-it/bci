import React, { useState } from 'react';
import { Bell, Search, Shield, Sparkles, User as UserIcon, CheckCircle2, Menu, LogOut } from 'lucide-react';
import { User, UserRole } from '../types';
import Logo from './Logo';

interface HeaderProps {
  currentUser: User;
  onRoleChange: (role: UserRole) => void;
  notifications: { id: string; text: string; time: string; read: boolean }[];
  onMarkNotificationsRead: () => void;
  onToggleSidebar: () => void;
  onLogout?: () => void;
}

export default function Header({
  currentUser,
  onRoleChange,
  notifications,
  onMarkNotificationsRead,
  onToggleSidebar,
  onLogout
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const roles: UserRole[] = [
    'Super Admin',
    'Admin',
    'Moderator',
    'Perusahaan',
    'Investor',
    'Supplier',
    'Vendor',
    'Member'
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-orange-500/20 bg-gradient-to-r from-[#FFD54F]/95 via-[#FFC107]/95 to-[#FF6B00]/95 backdrop-blur-md shadow-lg shadow-orange-500/10 text-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left Side: Logo & Burger */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="rounded-lg p-2 text-white/80 hover:bg-white/25 lg:hidden transition-all"
            id="btn-burger"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex items-center gap-2">
            <Logo
              variant="text"
              size={38}
            />
          </div>
        </div>

        {/* Middle Section: Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute top-2.5 left-3.5 h-4 w-4 text-white/70" />
            <input
              type="text"
              placeholder="Cari relasi, tender, produk, berita..."
              className="w-full rounded-full border border-white/30 bg-white/15 py-2 pl-10 pr-4 text-sm text-white placeholder-white/70 outline-none transition-all focus:bg-white/25 focus:border-white/60 focus:ring-2 focus:ring-white/10 backdrop-blur-md shadow-inner"
              id="search-main"
            />
          </div>
        </div>

        {/* Right Section: Simulator, Notifications, User Profile */}
        <div className="flex items-center gap-4">
          
          {/* Simulation Role Switcher Indicator */}
          <div className="relative">
            <button
              onClick={() => setShowRoleSelector(!showRoleSelector)}
              className="flex items-center gap-1.5 rounded-xl border border-white/30 bg-white/15 backdrop-blur-md px-3 py-1.5 text-xs font-bold text-white hover:bg-white/25 transition-all cursor-pointer shadow-sm"
              id="btn-role-selector"
            >
              <Shield className="h-3.5 w-3.5 text-white animate-pulse" />
              <span>Role: {currentUser.role}</span>
              <span className="text-[9px] bg-white text-[#FF6B00] font-black px-1.5 py-0.5 rounded shadow-sm">SIMULATOR</span>
            </button>

            {showRoleSelector && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-white/60 bg-white p-2 shadow-xl z-50 text-slate-800">
                <p className="px-2 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Pilih Perspektif User
                </p>
                <div className="h-px bg-slate-100 my-1"></div>
                {roles.map(r => (
                  <button
                    key={r}
                    onClick={() => {
                      onRoleChange(r);
                      setShowRoleSelector(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-2 py-1.5 text-left text-xs transition-colors hover:bg-[#FFFDF7] ${
                      currentUser.role === r ? 'bg-gradient-to-r from-[#FFD54F]/20 to-[#FF6B00]/10 text-[#FF6B00] font-extrabold shadow-sm border border-[#FFD54F]/30' : 'text-slate-700 font-bold'
                    }`}
                  >
                    <span>{r}</span>
                    {currentUser.role === r && <CheckCircle2 className="h-3.5 w-3.5 text-[#FF6B00]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Membership tier badge */}
          <div className="hidden sm:flex items-center gap-1 rounded-full bg-white text-[#FF6B00] border border-white/50 px-2.5 py-1 text-[10px] font-black shadow-md shadow-orange-600/10">
            <Sparkles className="h-3 w-3 text-[#FFB300] fill-[#FFC107]" />
            <span>{currentUser.membership}</span>
          </div>

          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) onMarkNotificationsRead();
              }}
              className="relative rounded-xl p-2.5 text-white hover:bg-white/20 backdrop-blur-md border border-white/20 shadow-sm transition-all"
              id="btn-notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-extrabold text-[#FF6B00] shadow-md border border-[#FF6B00]/10">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-white/60 bg-white shadow-2xl p-4 z-50 text-slate-800">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h4 className="font-extrabold text-sm text-slate-900">Notifikasi Realtime</h4>
                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shadow-inner">
                    Koneksi Aktif
                  </span>
                </div>
                <div className="mt-2 max-h-60 overflow-y-auto space-y-3">
                  {notifications.length === 0 ? (
                    <p className="text-center text-xs text-slate-400 py-4 font-bold">Belum ada notifikasi baru.</p>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="flex gap-2 text-xs py-1.5 hover:bg-[#FFFDF7] rounded-xl p-1.5 transition-all">
                        <div className="h-2 w-2 mt-1.5 rounded-full bg-[#FF6B00] flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="text-slate-700 font-bold">{n.text}</p>
                          <span className="text-[10px] text-slate-400 font-bold">{n.time}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Info */}
          <div className="flex items-center gap-3 border-l border-white/30 pl-4">
            <div className="flex items-center gap-2">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="h-9 w-9 rounded-xl object-cover ring-2 ring-white/60 shadow-md"
              />
              <div className="hidden lg:block text-left">
                <p className="text-xs font-black text-white leading-tight">{currentUser.name}</p>
                <p className="text-[10px] text-white/80 font-bold leading-none">{currentUser.email}</p>
              </div>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="rounded-xl p-2 text-white hover:bg-white/25 border border-white/20 shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                title="Keluar dari Portal"
                id="btn-logout"
              >
                <LogOut className="h-4.5 w-4.5" />
                <span className="text-[10px] font-black hidden xl:inline">Keluar</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
