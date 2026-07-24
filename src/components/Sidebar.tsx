import React from 'react';
import {
  LayoutDashboard,
  Rss,
  Building2,
  Newspaper,
  MessageSquare,
  Sparkles,
  ShoppingBag,
  FileSignature,
  Calendar,
  Bot,
  Target,
  MessagesSquare,
  Award,
  Settings,
  X,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import Logo from './Logo';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
  userRole: string;
}

export default function Sidebar({ currentView, onViewChange, isOpen, onClose, userRole }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'feed', label: 'Feed Bisnis', icon: Rss },
    { id: 'profile', label: 'Profil Perusahaan', icon: Building2 },
    { id: 'news', label: 'Berita Bisnis', icon: Newspaper },
    { id: 'chat', label: 'Pusat Chat BCI', icon: MessageSquare },
    { id: 'matching', label: 'Matching AI', icon: Sparkles, badge: 'AI' },
    { id: 'marketplace', label: 'B2B Marketplace', icon: ShoppingBag },
    { id: 'tender', label: 'Proyek Tender', icon: FileSignature },
    { id: 'zoho-books', label: 'Zoho Books Keuangan', icon: BookOpen, badge: 'Lengkap' },
    { id: 'crm', label: 'CRM Sales Leads', icon: Target },
    { id: 'events', label: 'Event & Seminar', icon: Calendar },
    { id: 'ai-assistant', label: 'BCI AI Assistant', icon: Bot, highlight: true },
    { id: 'forum', label: 'Forum Diskusi', icon: MessagesSquare },
    { id: 'membership', label: 'Program Membership', icon: Award },
    { id: 'faq', label: 'Pusat Bantuan', icon: HelpCircle }
  ];

  // Admin access
  const isAdmin = userRole === 'Super Admin' || userRole === 'Admin' || userRole === 'Moderator';
  if (isAdmin) {
    menuItems.push({ id: 'admin', label: 'Admin Panel', icon: Settings });
  }

  return (
    <>
      {/* Backdrop for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#FF6B00]/10 bg-gradient-to-b from-[#FFD54F] via-[#FFC107] to-[#FF6B00] text-white px-4 py-6 transition-transform lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-xl shadow-orange-500/10`}
      >
        {/* Mobile Close Button */}
        <div className="flex items-center justify-between lg:hidden mb-4">
          <Logo
            variant="compact"
            size={32}
          />
          <button onClick={onClose} className="rounded-xl p-1 hover:bg-white/20 text-white transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar Banner */}
        <div className="mb-6 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md p-4 shadow-md shadow-orange-700/10">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-white animate-pulse" />
            <span className="text-xs font-black text-white uppercase tracking-wider">Premium Access</span>
          </div>
          <p className="text-[11px] text-white font-bold leading-relaxed">
            Gunakan fitur Business Matching & AI Assistant sepuasnya!
          </p>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1 scrollbar-none">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onViewChange(item.id);
                  onClose();
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-extrabold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-white/25 text-white border border-white/50 shadow-[0_0_15px_rgba(255,255,255,0.45)] backdrop-blur-md'
                    : item.highlight
                    ? 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/15 border border-white/20'
                    : 'text-white/85 hover:bg-white/10 hover:text-white'
                }`}
                id={`sidebar-link-${item.id}`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-white/90'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-black ${
                    isActive ? 'bg-white text-[#FF6B00] shadow-sm' : 'bg-white/20 text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="mt-auto pt-4 border-t border-white/20 text-center space-y-1.5">
          <p className="text-[10px] text-white font-extrabold">Business Connect Indonesia</p>
          <div className="flex items-center justify-center gap-2 text-[9px] text-white/85 font-black">
            <button
              onClick={() => {
                onViewChange('legal');
                onClose();
              }}
              className="hover:text-white underline cursor-pointer hover:scale-105 transition-all"
            >
              Syarat Layanan
            </button>
            <span className="opacity-60">•</span>
            <button
              onClick={() => {
                onViewChange('legal');
                onClose();
              }}
              className="hover:text-white underline cursor-pointer hover:scale-105 transition-all"
            >
              Kebijakan Privasi
            </button>
          </div>
          <p className="text-[9px] text-white/70 font-bold uppercase tracking-wider">Versi 2.0.26 Premium</p>
        </div>
      </aside>
    </>
  );
}
