import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  Newspaper,
  ShoppingBag,
  FileSpreadsheet,
  Calendar,
  Handshake,
  Users,
  Sparkles,
  Target,
  Award,
  Search,
  Bell,
  X,
  ChevronRight,
  ChevronLeft,
  ThumbsUp,
  MessageCircle,
  Share2,
  Bookmark,
  MapPin,
  Clock,
  ArrowRight,
  Bot,
  Send,
  FileText,
  CheckCircle2,
  Plus,
  Shield,
  Briefcase,
  LogOut,
  HelpCircle
} from 'lucide-react';
import { AppDatabase, User, UserRole } from '../types';
import { exportToPDF } from '../utils/pdfExport';

// Import subviews
import DashboardView from './DashboardView';
import FeedView from './FeedView';
import CompanyProfileView from './CompanyProfileView';
import NewsView from './NewsView';
import ChatView from './ChatView';
import MatchingView from './MatchingView';
import MarketplaceView from './MarketplaceView';
import TenderView from './TenderView';
import CRMView from './CRMView';
import ForumView from './ForumView';
import NotificationsView from './NotificationsView';
import AdminDashboardView from './AdminDashboardView';
import MembershipView from './MembershipView';
import LegalViews from './LegalViews';
import FAQView from './FAQView';
import EventsView from './EventsView';
import Logo from './Logo';

interface MobileAppViewProps {
  db: AppDatabase;
  currentUser: User;
  currentView: string;
  onViewChange: (view: string) => void;
  onRefresh: () => void;
  handleRoleChange: (newRole: UserRole) => void;
  prefilledPartnerId: string | null;
  prefilledMessage: string | null;
  handleClearPrefilledChat: () => void;
  handleSetPrefilledChat: (partnerId: string, message: string) => void;
  onLogout?: () => void;
}

export default function MobileAppView({
  db,
  currentUser,
  currentView,
  onViewChange,
  onRefresh,
  handleRoleChange,
  prefilledPartnerId,
  prefilledMessage,
  handleClearPrefilledChat,
  handleSetPrefilledChat,
  onLogout,
}: MobileAppViewProps) {
  // Banner carousel state
  const [activeBanner, setActiveBanner] = useState(0);
  const banners = [
    {
      id: 1,
      title: "Hilirisasi Ekspor & Sinergi Kontraktor IKN 2026",
      tag: "Event Nasional",
      desc: "Temu bisnis nasional kontraktor IKN di Jakarta Agustus ini.",
      color: "from-orange-600 via-orange-500 to-amber-500",
    },
    {
      id: 2,
      title: "Sertifikasi TKDN Mudah dengan BCI AI",
      tag: "Panduan AI",
      desc: "Gunakan modul cerdas BCI untuk menguji tingkat komponen dalam negeri.",
      color: "from-amber-600 via-[#FF6B00] to-orange-500",
    },
    {
      id: 3,
      title: "Tender Kementerian PUPR Rp 4.5 Miliar Buka",
      tag: "Peluang Tender",
      desc: "Segera kirim proposal tender konstruksi untuk vendor terverifikasi.",
      color: "from-slate-900 via-slate-800 to-orange-950",
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBanner(prev => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [banners.length]);

  // Search box state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // AI Assistant Bottom Drawer state
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [proposalSector, setProposalSector] = useState('Manufaktur & Mesin');
  const [proposalType, setProposalType] = useState('Perjanjian Kerjasama B2B');
  const [proposalCompany, setProposalCompany] = useState('PT Semen Indonesia');
  const [proposalPrompt, setProposalPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [proposalResult, setProposalResult] = useState('');

  // Notifications drawer state
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Search filtering
  const filteredCompanies = db.companies.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.address.province.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProducts = db.marketplaceProducts.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // handle generate AI
  const handleGenerateAI = async () => {
    setGenerating(true);
    setProposalResult('');
    try {
      const companyName = currentUser.companyId
        ? db.companies.find(c => c.id === currentUser.companyId)?.name || currentUser.name
        : 'Anggota BCI';
      
      const response = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: proposalType,
          companyName,
          sector: proposalSector,
          promptDetail: proposalPrompt || `Buatlah draf dokumen ${proposalType} dengan ${proposalCompany} di sektor ${proposalSector}.`
        })
      });

      if (response.ok) {
        const data = await response.json();
        setProposalResult(data.document || 'Gagal merumuskan draf proposal.');
      } else {
        setProposalResult('Sistem AI BCI sedang padat, silakan coba beberapa saat lagi.');
      }
    } catch (err) {
      console.error(err);
      setProposalResult('Sistem AI BCI offline.');
    } finally {
      setGenerating(false);
    }
  };

  // Helper to trigger specific views with search integration
  const selectQuickMenu = (view: string) => {
    onViewChange(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Interactive like / save simulator for a responsive feel
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [savedPosts, setSavedPosts] = useState<Record<string, boolean>>({});

  const toggleLike = (id: string) => {
    setLikedPosts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSave = (id: string) => {
    setSavedPosts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="block md:hidden min-h-screen bg-[#FFFDF7] pb-24 font-sans text-slate-800 relative select-none">
      
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-[#FFD54F]/10 to-transparent pointer-events-none z-0"></div>

      {/* 1. STICKY HEADER (Mobile Banking Style) */}
      <header className="sticky top-0 z-40 bg-[#FFFDF7]/90 backdrop-blur-md border-b border-slate-100 shadow-sm px-4 py-3 flex items-center justify-between">
        <div className="cursor-pointer" onClick={() => onViewChange('dashboard')}>
          <Logo variant="compact" size={36} />
        </div>

        {/* Action icons right */}
        <div className="flex items-center gap-2.5">
          {/* Search Toggle */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="h-8.5 w-8.5 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 hover:text-[#FF6B00] active:scale-90 transition-all cursor-pointer"
          >
            <Search className="h-4.5 w-4.5" />
          </button>

          {/* Notification bell */}
          <button
            onClick={() => setNotificationsOpen(true)}
            className="h-8.5 w-8.5 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 relative hover:text-[#FF6B00] active:scale-90 transition-all cursor-pointer"
          >
            <Bell className="h-4.5 w-4.5" />
            {(db.notifications?.filter(n => !n.isRead).length ?? 0) > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 rounded-full text-[9px] font-black text-white flex items-center justify-center border-2 border-[#FFFDF7] animate-pulse">
                {db.notifications?.filter(n => !n.isRead).length}
              </span>
            )}
          </button>

          {/* User profile with simulator trigger */}
          <div
            onClick={() => onViewChange('membership')}
            className="h-9 w-9 rounded-full border border-slate-200 overflow-hidden shadow-sm active:scale-90 transition-all cursor-pointer"
          >
            <img src={currentUser.avatar} alt={currentUser.name} className="h-full w-full object-cover" />
          </div>

          {/* Mobile Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="h-8.5 w-8.5 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:text-rose-600 active:scale-90 transition-all cursor-pointer"
              title="Keluar"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          )}
        </div>
      </header>

      {/* SEARCH OVERLAY/BAR (Mobile Banking Inspired) */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white border-b border-slate-100 p-3 shadow-md sticky top-[53px] z-30"
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Cari perusahaan, sektor, komoditas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-10 py-2 text-xs font-semibold focus:outline-none focus:border-[#FF6B00] transition-colors"
                autoFocus
              />
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {searchQuery && (
              <div className="mt-3 max-h-60 overflow-y-auto space-y-2 text-xs divide-y divide-slate-50">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider px-1">Hasil Pencarian</p>
                {filteredCompanies.length === 0 && filteredProducts.length === 0 && (
                  <p className="text-center py-4 text-slate-400">Tidak ada hasil ditemukan.</p>
                )}
                
                {filteredCompanies.slice(0, 3).map(comp => (
                  <div
                    key={comp.id}
                    onClick={() => {
                      onViewChange('profile');
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-2.5 py-2 px-1 hover:bg-slate-50 cursor-pointer"
                  >
                    <img src={comp.logo} className="h-7 w-7 rounded-lg object-cover" />
                    <div>
                      <p className="font-black text-slate-900">{comp.name}</p>
                      <p className="text-[10px] text-slate-400">{comp.sector} • {comp.address.city}</p>
                    </div>
                  </div>
                ))}

                {filteredProducts.slice(0, 3).map(prod => (
                  <div
                    key={prod.id}
                    onClick={() => {
                      onViewChange('marketplace');
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-2.5 py-2 px-1 hover:bg-slate-50 cursor-pointer"
                  >
                    <img src={prod.image} className="h-7 w-7 rounded-lg object-cover" />
                    <div>
                      <p className="font-black text-slate-900">{prod.name}</p>
                      <p className="text-[10px] text-slate-400">Rp {prod.price.toLocaleString('id-ID')} / {prod.unit}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <div className="relative z-10">

        {/* CONDITION 1: MAIN HOMEPAGE WORKSPACE (DASHBOARD) */}
        {currentView === 'dashboard' && (
          <div className="space-y-6 px-4 pt-4 animate-fade-in">

            {/* WELCOME BLOCK */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Selamat Datang di BCI</p>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-1">
                  Hai, {currentUser.name}
                  {currentUser.membership === 'Enterprise' && (
                    <span className="inline-flex h-4 items-center rounded bg-orange-50 px-1 text-[8px] font-black text-[#FF6B00] border border-orange-200">ENT</span>
                  )}
                </h2>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[9px] font-black text-emerald-700 border border-emerald-100">
                  <Shield className="h-3 w-3 text-emerald-600" />
                  <span>NIB TERVERIFIKASI</span>
                </span>
              </div>
            </div>

            {/* 2. QUICK MENU GRID (12 Quick Services) */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-4 shadow-md glass-card glossy-top-highlight">
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider mb-3 px-1">Layanan Utama Sinergi B2B</p>
              
              <div className="grid grid-cols-4 gap-y-4 gap-x-1.5 text-center">
                {/* 1. Chat */}
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  onClick={() => selectQuickMenu('chat')}
                  className="flex flex-col items-center justify-between group cursor-pointer"
                >
                  <div className="h-10.5 w-10.5 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/10 active:scale-95 transition-transform">
                    <MessageSquare className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-[9.5px] font-bold text-slate-700 mt-1.5 leading-tight group-hover:text-[#FF6B00]">Chat</span>
                </motion.div>

                {/* 2. Berita */}
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  onClick={() => selectQuickMenu('news')}
                  className="flex flex-col items-center justify-between group cursor-pointer"
                >
                  <div className="h-10.5 w-10.5 rounded-2xl bg-gradient-to-tr from-blue-500 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-blue-500/10 active:scale-95 transition-transform">
                    <Newspaper className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-[9.5px] font-bold text-slate-700 mt-1.5 leading-tight group-hover:text-blue-500">Berita</span>
                </motion.div>

                {/* 3. Marketplace */}
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  onClick={() => selectQuickMenu('marketplace')}
                  className="flex flex-col items-center justify-between group cursor-pointer"
                >
                  <div className="h-10.5 w-10.5 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/10 active:scale-95 transition-transform">
                    <ShoppingBag className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-[9.5px] font-bold text-slate-700 mt-1.5 leading-tight group-hover:text-emerald-500">B2B</span>
                </motion.div>

                {/* 4. Tender */}
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  onClick={() => selectQuickMenu('tender')}
                  className="flex flex-col items-center justify-between group cursor-pointer"
                >
                  <div className="h-10.5 w-10.5 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-purple-500/10 active:scale-95 transition-transform">
                    <FileSpreadsheet className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-[9.5px] font-bold text-slate-700 mt-1.5 leading-tight group-hover:text-purple-500">Tender</span>
                </motion.div>

                {/* 5. Event */}
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  onClick={() => selectQuickMenu('events')}
                  className="flex flex-col items-center justify-between group cursor-pointer"
                >
                  <div className="h-10.5 w-10.5 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-md shadow-rose-500/10 active:scale-95 transition-transform">
                    <Calendar className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-[9.5px] font-bold text-slate-700 mt-1.5 leading-tight group-hover:text-rose-500">Event</span>
                </motion.div>

                {/* 6. Meeting / Sinergi */}
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  onClick={() => selectQuickMenu('matching')}
                  className="flex flex-col items-center justify-between group cursor-pointer"
                >
                  <div className="h-10.5 w-10.5 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-sky-500/10 active:scale-95 transition-transform">
                    <Handshake className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-[9.5px] font-bold text-slate-700 mt-1.5 leading-tight group-hover:text-sky-500">Sinergi</span>
                </motion.div>

                {/* 7. Forum */}
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  onClick={() => selectQuickMenu('forum')}
                  className="flex flex-col items-center justify-between group cursor-pointer"
                >
                  <div className="h-10.5 w-10.5 rounded-2xl bg-gradient-to-tr from-violet-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/10 active:scale-95 transition-transform">
                    <Users className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-[9.5px] font-bold text-slate-700 mt-1.5 leading-tight group-hover:text-purple-600">Forum</span>
                </motion.div>

                {/* 8. AI Assistant Drawer */}
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setAiDrawerOpen(true)}
                  className="flex flex-col items-center justify-between group cursor-pointer"
                >
                  <div className="h-10.5 w-10.5 rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-[#FFC107] text-white flex items-center justify-center shadow-md shadow-orange-500/15 animate-pulse active:scale-95 transition-transform">
                    <Sparkles className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-[9.5px] font-bold text-slate-700 mt-1.5 leading-tight group-hover:text-[#FF6B00]">Asisten AI</span>
                </motion.div>

                {/* 9. CRM */}
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  onClick={() => selectQuickMenu('crm')}
                  className="flex flex-col items-center justify-between group cursor-pointer"
                >
                  <div className="h-10.5 w-10.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md shadow-amber-500/10 active:scale-95 transition-transform">
                    <Target className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-[9.5px] font-bold text-slate-700 mt-1.5 leading-tight group-hover:text-amber-500">CRM</span>
                </motion.div>

                {/* 10. Profil */}
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  onClick={() => selectQuickMenu('membership')}
                  className="flex flex-col items-center justify-between group cursor-pointer"
                >
                  <div className="h-10.5 w-10.5 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-indigo-500/10 active:scale-95 transition-transform">
                    <Award className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-[9.5px] font-bold text-slate-700 mt-1.5 leading-tight group-hover:text-indigo-600">Profil</span>
                </motion.div>

                {/* 11. Pusat Bantuan (FAQ) */}
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  onClick={() => selectQuickMenu('faq')}
                  className="flex flex-col items-center justify-between group cursor-pointer"
                >
                  <div className="h-10.5 w-10.5 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-600 text-white flex items-center justify-center shadow-md shadow-teal-500/10 active:scale-95 transition-transform">
                    <HelpCircle className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-[9.5px] font-bold text-slate-700 mt-1.5 leading-tight group-hover:text-teal-600">Bantuan</span>
                </motion.div>

                {/* 12. Legalitas (Syarat & Privasi) */}
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  onClick={() => selectQuickMenu('legal')}
                  className="flex flex-col items-center justify-between group cursor-pointer"
                >
                  <div className="h-10.5 w-10.5 rounded-2xl bg-gradient-to-tr from-slate-700 to-slate-900 text-white flex items-center justify-center shadow-md shadow-slate-900/10 active:scale-95 transition-transform">
                    <FileText className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-[9.5px] font-bold text-slate-700 mt-1.5 leading-tight group-hover:text-slate-900">Legalitas</span>
                </motion.div>
              </div>
            </div>

            {/* 3. BANNER CAROUSEL (Auto Slide) */}
            <div className="relative overflow-hidden rounded-[18px] shadow-lg">
              <div className="h-36 relative">
                {banners.map((b, idx) => (
                  <div
                    key={b.id}
                    className={`absolute inset-0 bg-gradient-to-r ${b.color} p-5 text-white flex flex-col justify-between transition-opacity duration-700 ease-in-out ${
                      idx === activeBanner ? 'opacity-100 z-10' : 'opacity-0 z-0'
                    }`}
                  >
                    <div>
                      <span className="inline-block rounded bg-white/20 px-2 py-0.5 text-[8px] font-black tracking-widest uppercase mb-1">
                        {b.tag}
                      </span>
                      <h3 className="text-[13.5px] font-black leading-snug tracking-tight max-w-[85%]">
                        {b.title}
                      </h3>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-white/85 font-medium max-w-[70%] line-clamp-1">{b.desc}</p>
                      <button className="h-6 w-6 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white active:scale-90 transition-transform">
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Dots indicator */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-20">
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveBanner(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === activeBanner ? 'w-4 bg-white' : 'w-1.5 bg-white/40'
                    }`}
                  ></button>
                ))}
              </div>
            </div>

            {/* 4. AKTIVITAS WIDGETS (Small Cards) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Aktivitas & Log Bisnis</h3>
                <span className="text-[10px] text-[#FF6B00] font-black cursor-pointer flex items-center gap-0.5" onClick={() => selectQuickMenu('crm')}>
                  Lihat CRM <ChevronRight className="h-3 w-3" />
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Log 1: Chat Terbaru */}
                <div
                  onClick={() => selectQuickMenu('chat')}
                  className="rounded-2xl border border-slate-200/60 bg-white p-3.5 shadow-sm space-y-2 cursor-pointer hover:border-orange-200 transition-colors"
                >
                  <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase">
                    <MessageSquare className="h-3.5 w-3.5 text-orange-500" />
                    <span>Obrolan B2B</span>
                  </div>
                  <p className="text-[11px] font-black text-slate-900 truncate">
                    {db.chatMessages && db.chatMessages.length > 0 ? db.chatMessages[db.chatMessages.length - 1].message : 'Tidak ada chat baru'}
                  </p>
                  <p className="text-[9px] text-slate-400 font-bold flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" /> Just now
                  </p>
                </div>

                {/* Log 2: Tender Aktif */}
                <div
                  onClick={() => selectQuickMenu('tender')}
                  className="rounded-2xl border border-slate-200/60 bg-white p-3.5 shadow-sm space-y-2 cursor-pointer hover:border-orange-200 transition-colors"
                >
                  <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase">
                    <FileSpreadsheet className="h-3.5 w-3.5 text-purple-500" />
                    <span>Tender Buka</span>
                  </div>
                  <p className="text-[11px] font-black text-slate-900 truncate">
                    {db.tenders && db.tenders.length > 0 ? db.tenders[0].title : 'Menunggu tender'}
                  </p>
                  <p className="text-[9px] text-slate-400 font-bold flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" /> IDR {db.tenders && db.tenders.length > 0 ? (db.tenders[0].value / 1e6).toFixed(0) : '0'}jt+
                  </p>
                </div>
              </div>
            </div>

            {/* 5. BERITA TERBARU (Horizontal Scroll) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Berita & Regulasi Industri</h3>
                <span className="text-[10px] text-[#FF6B00] font-black cursor-pointer flex items-center gap-0.5" onClick={() => selectQuickMenu('news')}>
                  Semua Berita <ChevronRight className="h-3 w-3" />
                </span>
              </div>

              {/* Horizontal Scroll wrapper */}
              <div className="flex gap-4.5 overflow-x-auto pb-2 scrollbar-none snap-x -mx-4 px-4">
                {db.newsArticles.map((article) => (
                  <div
                    key={article.id}
                    onClick={() => selectQuickMenu('news')}
                    className="flex-shrink-0 w-72 rounded-2xl border border-slate-200/60 bg-white p-3.5 shadow-sm snap-start space-y-3 cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="h-28 rounded-xl overflow-hidden relative">
                      <img src={article.image} alt={article.title} className="h-full w-full object-cover" />
                      <span className="absolute top-2 left-2 rounded-md bg-[#FF6B00] px-2 py-0.5 text-[8px] font-black text-white uppercase">
                        {article.category}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="text-[12px] font-black text-slate-900 line-clamp-2 leading-snug">
                        {article.title}
                      </h4>
                      <p className="text-[10.5px] text-slate-400 line-clamp-2 leading-relaxed">
                        {article.summary}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold pt-1 border-t border-slate-50">
                      <span>{article.authorName}</span>
                      <span>16 Juli 2026</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. BUSINESS FEED (LinkedIn style) */}
            <div className="space-y-3 font-calibri">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Business Feed & Kolaborasi</h3>
                <span className="text-[10px] text-[#FF6B00] font-black cursor-pointer flex items-center gap-0.5" onClick={() => selectQuickMenu('feed')}>
                  Ke Feed <ChevronRight className="h-3 w-3" />
                </span>
              </div>

              <div className="space-y-4">
                {db.feedPosts.slice(0, 3).map((post) => {
                  const isLiked = likedPosts[post.id];
                  const isSaved = savedPosts[post.id];
                  return (
                    <div
                      key={post.id}
                      className="rounded-[18px] border border-slate-200/60 bg-white p-5 shadow-sm space-y-3.5 hover:shadow-md transition-shadow"
                    >
                      {/* Author Header */}
                      <div className="flex items-center gap-3">
                        <img src={post.authorAvatar} className="h-9 w-9 rounded-full object-cover border border-slate-100" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-[11.5px] font-black text-slate-900 leading-none">{post.authorName}</p>
                            <span className="inline-block rounded bg-slate-50 px-1 py-0.5 text-[7px] font-black text-[#FF6B00] uppercase border border-slate-100">{post.authorRole}</span>
                          </div>
                          <p className="text-[9.5px] text-slate-400 font-bold mt-0.5">{post.authorCompany || 'BCI Member'} • 16 Jul</p>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="space-y-2">
                        {post.title && (
                          <h4 className="text-[12px] font-black text-slate-900 leading-snug">{post.title}</h4>
                        )}
                        <p className="text-[11px] text-slate-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                        {post.mediaUrl && (
                          <div className="h-44 rounded-xl overflow-hidden border border-slate-100 mt-2">
                            <img src={post.mediaUrl} className="h-full w-full object-cover" />
                          </div>
                        )}
                      </div>

                      {/* Action buttons bar */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-50 text-[10.5px] font-black text-slate-500">
                        <button
                          onClick={() => toggleLike(post.id)}
                          className={`flex items-center gap-1 cursor-pointer transition-colors ${isLiked ? 'text-[#FF6B00]' : 'hover:text-[#FF6B00]'}`}
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                          <span>{post.likes.length + (isLiked ? 1 : 0)} Like</span>
                        </button>
                        <button
                          onClick={() => selectQuickMenu('feed')}
                          className="flex items-center gap-1 cursor-pointer hover:text-blue-600"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          <span>{post.comments.length} Komen</span>
                        </button>
                        <button
                          onClick={() => alert("Tautan disalin ke clipboard!")}
                          className="flex items-center gap-1 cursor-pointer hover:text-emerald-600"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                          <span>Bagikan</span>
                        </button>
                        <button
                          onClick={() => toggleSave(post.id)}
                          className={`flex items-center gap-1 cursor-pointer transition-colors ${isSaved ? 'text-amber-500' : 'hover:text-amber-500'}`}
                        >
                          <Bookmark className="h-3.5 w-3.5" />
                          <span>{isSaved ? 'Tersimpan' : 'Simpan'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 7. MARKETPLACE (Horizontal Scroll) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Katalog Produk Unggulan B2B</h3>
                <span className="text-[10px] text-[#FF6B00] font-black cursor-pointer flex items-center gap-0.5" onClick={() => selectQuickMenu('marketplace')}>
                  Semua Produk <ChevronRight className="h-3 w-3" />
                </span>
              </div>

              <div className="flex gap-4.5 overflow-x-auto pb-2 scrollbar-none snap-x -mx-4 px-4">
                {db.marketplaceProducts.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => selectQuickMenu('marketplace')}
                    className="flex-shrink-0 w-52 rounded-2xl border border-slate-200/60 bg-white p-3.5 shadow-sm snap-start space-y-3 cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="h-28 rounded-xl overflow-hidden relative">
                      <img src={prod.image} alt={prod.name} className="h-full w-full object-cover" />
                      <span className="absolute top-2 left-2 rounded-md bg-slate-900/80 backdrop-blur-md px-2 py-0.5 text-[8px] font-black text-white uppercase">
                        {prod.category}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-[#FF6B00] font-black tracking-wide leading-none">{prod.companyName}</p>
                      <h4 className="text-[11.5px] font-black text-slate-900 truncate">{prod.name}</h4>
                      <p className="text-[11px] text-slate-800 font-extrabold">Rp {prod.price.toLocaleString('id-ID')} / {prod.unit}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      <span>{prod.city}, {prod.province}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 8. EVENT (Horizontal Scroll) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Event & Forum Bisnis</h3>
                <span className="text-[10px] text-[#FF6B00] font-black cursor-pointer flex items-center gap-0.5" onClick={() => selectQuickMenu('events')}>
                  Semua Event <ChevronRight className="h-3 w-3" />
                </span>
              </div>

              <div className="flex gap-4.5 overflow-x-auto pb-2 scrollbar-none snap-x -mx-4 px-4">
                {db.events.map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => selectQuickMenu('events')}
                    className="flex-shrink-0 w-64 rounded-2xl border border-slate-200/60 bg-white p-3.5 shadow-sm snap-start space-y-3 cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="h-28 rounded-xl overflow-hidden relative">
                      <img src={evt.image} alt={evt.title} className="h-full w-full object-cover" />
                      <span className="absolute top-2 left-2 rounded-md bg-amber-500 px-2 py-0.5 text-[8px] font-black text-white uppercase">
                        {evt.type}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[11.5px] font-black text-slate-900 line-clamp-1">{evt.title}</h4>
                      <p className="text-[10px] text-slate-400 font-bold">{evt.organizer}</p>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold pt-1.5 border-t border-slate-50">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3 text-rose-500" /> {evt.date}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-slate-400" /> {evt.location.length > 15 ? 'Hybrid / Online' : evt.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 9. TENDER (Horizontal Scroll) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Pengadaan & Tender Terbuka</h3>
                <span className="text-[10px] text-[#FF6B00] font-black cursor-pointer flex items-center gap-0.5" onClick={() => selectQuickMenu('tender')}>
                  Semua Tender <ChevronRight className="h-3 w-3" />
                </span>
              </div>

              <div className="flex gap-4.5 overflow-x-auto pb-2 scrollbar-none snap-x -mx-4 px-4">
                {db.tenders.map((tend) => (
                  <div
                    key={tend.id}
                    onClick={() => selectQuickMenu('tender')}
                    className="flex-shrink-0 w-60 rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm snap-start space-y-3 cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="inline-flex h-4 items-center rounded-full bg-blue-50 px-2 text-[8px] font-black text-blue-700 border border-blue-100">PU / SWASTA</span>
                        {tend.isPremium && (
                          <span className="inline-flex h-4 items-center rounded-full bg-amber-50 px-2 text-[8px] font-black text-amber-700 border border-amber-100">VIP</span>
                        )}
                      </div>
                      <h4 className="text-[11.5px] font-black text-slate-900 line-clamp-1">{tend.title}</h4>
                      <p className="text-[10px] text-slate-400 font-bold">{tend.companyName}</p>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-2.5 text-center">
                      <p className="text-[8.5px] text-slate-400 font-black uppercase tracking-wider leading-none">NILAI PROYEK</p>
                      <p className="text-[13px] font-black text-[#FF6B00] mt-1">Rp {tend.value.toLocaleString('id-ID')}</p>
                    </div>

                    <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold">
                      <span>Batas: {tend.deadline}</span>
                      <span className="text-[#FF6B00] font-black flex items-center gap-0.5">Kirim Proposal <ArrowRight className="h-3 w-3" /></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 10. PUSAT BANTUAN & INFORMASI LEGALITAS (MOBILE) */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-4 shadow-md glass-card glossy-top-highlight space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <HelpCircle className="h-4 w-4 text-[#FF6B00]" />
                    <span>Pusat Bantuan & Legalitas</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold">Layanan bantuan, syarat ketentuan & privasi terverifikasi</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                {/* Pusat Bantuan / FAQ */}
                <button
                  onClick={() => selectQuickMenu('faq')}
                  className="p-3 bg-orange-50/50 hover:bg-orange-50 border border-orange-100 rounded-2xl flex flex-col items-center justify-between gap-1.5 active:scale-95 transition-all cursor-pointer"
                >
                  <div className="h-8 w-8 rounded-xl bg-[#FF6B00] text-white flex items-center justify-center shadow-sm">
                    <HelpCircle className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-black text-slate-800 leading-tight">Pusat Bantuan</span>
                  <span className="text-[8px] text-[#FF6B00] font-bold">FAQ & Panduan</span>
                </button>

                {/* Persyaratan Layanan */}
                <button
                  onClick={() => selectQuickMenu('legal')}
                  className="p-3 bg-amber-50/50 hover:bg-amber-50 border border-amber-100 rounded-2xl flex flex-col items-center justify-between gap-1.5 active:scale-95 transition-all cursor-pointer"
                >
                  <div className="h-8 w-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
                    <FileText className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-black text-slate-800 leading-tight">Persyaratan Layanan</span>
                  <span className="text-[8px] text-amber-600 font-bold">Syarat & Ketentuan</span>
                </button>

                {/* Kebijakan Privasi */}
                <button
                  onClick={() => selectQuickMenu('legal')}
                  className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-2xl flex flex-col items-center justify-between gap-1.5 active:scale-95 transition-all cursor-pointer"
                >
                  <div className="h-8 w-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shadow-sm">
                    <Shield className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-black text-slate-800 leading-tight">Kebijakan Privasi</span>
                  <span className="text-[8px] text-slate-500 font-bold">Keamanan Data</span>
                </button>
              </div>
            </div>

            {/* Mobile App Footer Links */}
            <div className="pt-4 pb-2 border-t border-slate-200/60 mt-4 text-center space-y-2">
              <p className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-widest">
                BCI Portal Indonesia 2026
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs font-black">
                <button
                  onClick={() => selectQuickMenu('faq')}
                  className="text-[#FF6B00] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>Pusat Bantuan</span>
                </button>
                <span className="text-slate-300">•</span>
                <button
                  onClick={() => selectQuickMenu('legal')}
                  className="text-slate-600 hover:text-[#FF6B00] cursor-pointer flex items-center gap-1"
                >
                  <FileText className="h-3.5 w-3.5 text-slate-400" />
                  <span>Persyaratan Layanan</span>
                </button>
                <span className="text-slate-300">•</span>
                <button
                  onClick={() => selectQuickMenu('legal')}
                  className="text-slate-600 hover:text-[#FF6B00] cursor-pointer flex items-center gap-1"
                >
                  <Shield className="h-3.5 w-3.5 text-slate-400" />
                  <span>Kebijakan Privasi</span>
                </button>
              </div>
              <p className="text-[9px] text-slate-400 font-bold">
                © 2026 Business Connect Indonesia (BCI). Hak Cipta Dilindungi.
              </p>
            </div>

            {/* Bottom spacer */}
            <div className="h-6"></div>

          </div>
        )}

        {/* CONDITION 2: SUB PAGES ROUTER (FRAMED BEAUTIFULLY INSIDE THE MOBILE CONTAINER) */}
        {currentView !== 'dashboard' && (
          currentView === 'chat' ? (
            <div className="animate-fade-in relative z-10 w-full h-[calc(100vh-112px)] bg-white flex flex-col">
              <ChatView
                db={db}
                currentUser={currentUser}
                onRefresh={onRefresh}
                prefilledPartnerId={prefilledPartnerId}
                prefilledMessage={prefilledMessage}
                onClearPrefilledChat={handleClearPrefilledChat}
                onViewChange={onViewChange}
              />
            </div>
          ) : (
            <div className="px-4 py-4 animate-fade-in relative z-10 pb-20">
              {/* Header top row for back buttons or page info inside mobile subview */}
              <div className="mb-4 flex items-center justify-between">
                <button
                  onClick={() => onViewChange('dashboard')}
                  className="flex items-center gap-1 text-xs font-black text-[#FF6B00] active:scale-90 transition-transform cursor-pointer"
                >
                  <ChevronLeft className="h-4.5 w-4.5" />
                  <span>Kembali ke Beranda</span>
                </button>
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">
                  {currentView.toUpperCase()}
                </span>
              </div>

              {/* Dynamic views router inside the mobile shell */}
              <div className="rounded-3xl shadow-sm border border-slate-200/60 bg-white p-1.5 min-h-[500px] overflow-hidden">
                {currentView === 'feed' && (
                  <FeedView db={db} currentUser={currentUser} onRefresh={onRefresh} />
                )}
                {currentView === 'profile' && (
                  <CompanyProfileView
                    db={db}
                    currentUser={currentUser}
                    onViewChange={onViewChange}
                    onSetPrefilledChat={handleSetPrefilledChat}
                    onRefresh={onRefresh}
                  />
                )}
                {currentView === 'news' && (
                  <NewsView db={db} currentUser={currentUser} onRefresh={onRefresh} />
                )}
                {currentView === 'matching' && (
                  <MatchingView
                    db={db}
                    currentUser={currentUser}
                    onViewChange={onViewChange}
                    onSetPrefilledChat={handleSetPrefilledChat}
                  />
                )}
                {currentView === 'marketplace' && (
                  <MarketplaceView
                    db={db}
                    currentUser={currentUser}
                    onRefresh={onRefresh}
                    onSetPrefilledChat={handleSetPrefilledChat}
                    onViewChange={onViewChange}
                  />
                )}
                {currentView === 'tender' && (
                  <TenderView db={db} currentUser={currentUser} onRefresh={onRefresh} />
                )}
                {currentView === 'crm' && (
                  <CRMView db={db} currentUser={currentUser} onRefresh={onRefresh} />
                )}
                {currentView === 'forum' && (
                  <ForumView db={db} currentUser={currentUser} onRefresh={onRefresh} />
                )}
                {currentView === 'notifications' && (
                  <NotificationsView
                    db={db}
                    currentUser={currentUser}
                    onRefresh={onRefresh}
                    onViewChange={onViewChange}
                  />
                )}
                {currentView === 'admin' && (
                  <AdminDashboardView db={db} currentUser={currentUser} onRefresh={onRefresh} />
                )}
                {currentView === 'membership' && (
                  <MembershipView currentUser={currentUser} onRefresh={onRefresh} onViewChange={selectQuickMenu} />
                )}
                {currentView === 'legal' && (
                  <LegalViews onBackToDashboard={() => onViewChange('dashboard')} />
                )}
                {currentView === 'faq' && (
                  <FAQView />
                )}
                {currentView === 'events' && (
                  <EventsView
                    db={db}
                    currentUser={currentUser}
                    onRefresh={onRefresh}
                    onViewChange={onViewChange}
                  />
                )}
              </div>
            </div>
          )
        )}

      </div>

      {/* 3. FLOATING AI ASSISTANT ACTION BUTTON (FAB) */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setAiDrawerOpen(true)}
        className="fixed bottom-22 right-5 z-40 h-13 w-13 rounded-full bg-gradient-to-tr from-[#FF6B00] via-[#FF8F00] to-[#FFC107] text-white flex items-center justify-center shadow-xl shadow-orange-500/30 active:scale-95 cursor-pointer border-2 border-white"
        style={{
          boxShadow: '0 0 20px rgba(255,107,0,0.45)',
        }}
      >
        <Sparkles className="h-6 w-6 animate-pulse" />
      </motion.button>

      {/* 4. BOTTOM NAVIGATION BAR (Mobile Banking Layout) */}
      <nav className="fixed bottom-0 left-0 w-full z-40 bg-[#FFFDF7]/95 backdrop-blur-md border-t border-slate-100 shadow-xl px-4 py-2.5 flex items-center justify-between">
        
        {/* Tab 1: Home */}
        <button
          onClick={() => onViewChange('dashboard')}
          className="flex flex-col items-center justify-center flex-1 cursor-pointer transition-all active:scale-90"
        >
          <div className="flex flex-col items-center">
            <span className={`text-[21px] transition-transform ${currentView === 'dashboard' ? 'scale-110' : 'opacity-65'}`}>🏠</span>
            <span className={`text-[9.5px] font-black tracking-tight mt-0.5 ${currentView === 'dashboard' ? 'text-[#FF6B00]' : 'text-slate-400'}`}>
              Beranda
            </span>
          </div>
        </button>

        {/* Tab 2: Feed */}
        <button
          onClick={() => onViewChange('feed')}
          className="flex flex-col items-center justify-center flex-1 cursor-pointer transition-all active:scale-90"
        >
          <div className="flex flex-col items-center">
            <span className={`text-[21px] transition-transform ${currentView === 'feed' ? 'scale-110' : 'opacity-65'}`}>📰</span>
            <span className={`text-[9.5px] font-black tracking-tight mt-0.5 ${currentView === 'feed' ? 'text-[#FF6B00]' : 'text-slate-400'}`}>
              Feed
            </span>
          </div>
        </button>

        {/* Tab 3: Chat */}
        <button
          onClick={() => onViewChange('chat')}
          className="flex flex-col items-center justify-center flex-1 cursor-pointer transition-all active:scale-90 relative"
        >
          <div className="flex flex-col items-center">
            <span className={`text-[21px] transition-transform ${currentView === 'chat' ? 'scale-110' : 'opacity-65'}`}>💬</span>
            <span className={`text-[9.5px] font-black tracking-tight mt-0.5 ${currentView === 'chat' ? 'text-[#FF6B00]' : 'text-slate-400'}`}>
              Chat
            </span>
          </div>
        </button>

        {/* Tab 4: Business Sinergi */}
        <button
          onClick={() => onViewChange('matching')}
          className="flex flex-col items-center justify-center flex-1 cursor-pointer transition-all active:scale-90"
        >
          <div className="flex flex-col items-center">
            <span className={`text-[21px] transition-transform ${currentView === 'matching' ? 'scale-110' : 'opacity-65'}`}>🤝</span>
            <span className={`text-[9.5px] font-black tracking-tight mt-0.5 ${currentView === 'matching' ? 'text-[#FF6B00]' : 'text-slate-400'}`}>
              Sinergi
            </span>
          </div>
        </button>

        {/* Tab 5: Profil */}
        <button
          onClick={() => onViewChange('membership')}
          className="flex flex-col items-center justify-center flex-1 cursor-pointer transition-all active:scale-90"
        >
          <div className="flex flex-col items-center">
            <span className={`text-[21px] transition-transform ${currentView === 'membership' ? 'scale-110' : 'opacity-65'}`}>👤</span>
            <span className={`text-[9.5px] font-black tracking-tight mt-0.5 ${currentView === 'membership' ? 'text-[#FF6B00]' : 'text-slate-400'}`}>
              Profil
            </span>
          </div>
        </button>

      </nav>

      {/* 5. GORGEOUS SWIPE-UP DRAWER FOR BCI AI CO-PILOT ASSISTANT */}
      <AnimatePresence>
        {aiDrawerOpen && (
          <>
            {/* Backdrop opacity */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setAiDrawerOpen(false)}
              className="fixed inset-0 bg-black z-50"
            ></motion.div>

            {/* Bottom Drawer Content */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-h-[90vh] bg-white rounded-t-[28px] shadow-2xl z-50 flex flex-col pb-6 text-xs overflow-y-auto"
            >
              {/* Header handle block */}
              <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto my-3.5"></div>

              <div className="px-5 pb-4 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="h-8.5 w-8.5 rounded-xl bg-orange-50 flex items-center justify-center text-[#FF6B00]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-[13.5px]">BCI AI Copilot Assistant</h3>
                    <p className="text-[9px] text-[#FF6B00] font-black tracking-wide uppercase">Draf Proposal & Kontrak Legal</p>
                  </div>
                </div>
                <button
                  onClick={() => setAiDrawerOpen(false)}
                  className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer active:scale-90 transition-transform"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Form & Chat Container */}
              <div className="p-5 space-y-4 flex-1">
                <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                  Gunakan model kognitif Gemini untuk merumuskan draf formal kerjasama B2B nasional dalam hitungan detik. Ekspor langsung ke PDF resmi berformat BCI.
                </p>

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Pilih Sektor Sinergi</label>
                    <select
                      value={proposalSector}
                      onChange={(e) => setProposalSector(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#FF6B00]"
                    >
                      <option value="Manufaktur & Mesin">Manufaktur & Mesin</option>
                      <option value="IKN & Konstruksi">IKN & Konstruksi</option>
                      <option value="Energi Baru Terbarukan">Energi Baru Terbarukan</option>
                      <option value="Logistik & Distribusi">Logistik & Distribusi</option>
                      <option value="Startup & Teknologi">Startup & Teknologi</option>
                      <option value="Pertanian & Pangan">Pertanian & Pangan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Format Dokumen AI</label>
                    <select
                      value={proposalType}
                      onChange={(e) => setProposalType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#FF6B00]"
                    >
                      <option value="Perjanjian Kerjasama B2B">Perjanjian Kerjasama B2B</option>
                      <option value="Memorandum of Understanding (MoU)">Memorandum of Understanding (MoU)</option>
                      <option value="Proposal Penawaran Tender Resmi">Proposal Penawaran Tender Resmi</option>
                      <option value="Draf Kontrak Jual Beli Komoditas">Draf Kontrak Jual Beli Komoditas</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Perusahaan Mitra Target</label>
                    <input
                      type="text"
                      value={proposalCompany}
                      onChange={(e) => setProposalCompany(e.target.value)}
                      placeholder="Contoh: PT Semen Indonesia, PT Telkom"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-[#FF6B00]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Detail Tambahan (Opsional)</label>
                    <textarea
                      value={proposalPrompt}
                      onChange={(e) => setProposalPrompt(e.target.value)}
                      placeholder="Contoh: Tambahkan klausul bagi hasil 60-40% dan masa berlaku kontrak 5 tahun..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-[#FF6B00] h-18 resize-none"
                    />
                  </div>

                  <button
                    onClick={handleGenerateAI}
                    disabled={generating}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#FFC107] to-[#FF6B00] text-white font-black text-xs shadow-md shadow-orange-500/25 active:scale-95 transition-transform flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {generating ? (
                      <>
                        <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                        <span>Menganalisis Kepatuhan & Merumuskan...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4.5 w-4.5" />
                        <span>Rumuskan Dokumen Kolaborasi</span>
                      </>
                    )}
                  </button>
                </div>

                {/* AI RESULT BOX WITH EXPORT TO PDF */}
                {proposalResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 rounded-2xl bg-[#FFFDF7] border border-[#FFD54F]/30 text-xs text-slate-700 max-h-64 overflow-y-auto whitespace-pre-line font-medium leading-relaxed shadow-inner"
                  >
                    <div className="font-black text-slate-900 border-b border-slate-100 pb-2 mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1.5"><Bot className="h-4 w-4 text-[#FF6B00]" /> Draf Hasil AI</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(proposalResult);
                            alert("Draf AI disalin ke clipboard!");
                          }}
                          className="text-[10px] text-slate-500 font-black hover:text-[#FF6B00] transition-colors cursor-pointer"
                        >
                          Salin
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          onClick={() => {
                            exportToPDF(proposalResult, {
                              title: proposalType,
                              category: proposalType,
                              sector: proposalSector,
                              targetCompany: proposalCompany,
                            });
                          }}
                          className="text-[10px] text-[#FF6B00] font-black hover:underline cursor-pointer flex items-center gap-0.5"
                        >
                          <FileText className="h-3.5 w-3.5" /> Unduh PDF
                        </button>
                      </div>
                    </div>
                    {proposalResult}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 6. SYSTEM NOTIFICATIONS SLIDE DRAWER */}
      <AnimatePresence>
        {notificationsOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setNotificationsOpen(false)}
              className="fixed inset-0 bg-black z-50"
            ></motion.div>

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl z-50 flex flex-col p-5"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Bell className="h-4.5 w-4.5 text-[#FF6B00]" />
                  <h3 className="font-black text-slate-900 text-sm">Notifikasi Masuk</h3>
                </div>
                <button
                  onClick={() => setNotificationsOpen(false)}
                  className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer active:scale-90 transition-transform"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-3 space-y-3.5">
                {(db.notifications || []).length === 0 ? (
                  <p className="text-center py-10 text-slate-400">Tidak ada notifikasi sistem.</p>
                ) : (
                  db.notifications?.map(n => (
                    <div
                      key={n.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        n.isRead ? 'border-slate-100 bg-white' : 'border-orange-100 bg-orange-50/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[8.5px] font-black text-[#FF6B00] uppercase tracking-wider">{n.type}</span>
                        <span className="text-[9px] text-slate-400 font-bold">Just now</span>
                      </div>
                      <p className="text-[11px] font-black text-slate-900 mt-1">{n.title || 'Informasi BCI'}</p>
                      <p className="text-[10.5px] text-slate-500 mt-1 font-semibold leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>

              <button
                onClick={async () => {
                  try {
                    await fetch('/api/notifications/read-all', { method: 'POST' });
                    onRefresh();
                    setNotificationsOpen(false);
                    alert("Semua notifikasi ditandai dibaca!");
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="w-full py-2.5 rounded-xl border border-[#FF6B00] text-[#FF6B00] font-black text-xs hover:bg-orange-50 cursor-pointer text-center"
              >
                Tandai Semua Dibaca
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
