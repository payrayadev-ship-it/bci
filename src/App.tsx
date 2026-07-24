import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import FeedView from './components/FeedView';
import CompanyProfileView from './components/CompanyProfileView';
import NewsView from './components/NewsView';
import ChatView from './components/ChatView';
import MatchingView from './components/MatchingView';
import MarketplaceView from './components/MarketplaceView';
import TenderView from './components/TenderView';
import CRMView from './components/CRMView';
import ForumView from './components/ForumView';
import NotificationsView from './components/NotificationsView';
import AdminDashboardView from './components/AdminDashboardView';
import MembershipView from './components/MembershipView';
import { exportToPDF } from './utils/pdfExport';
import MobileAppView from './components/MobileAppView';
import AuthView from './components/AuthView';
import LegalViews from './components/LegalViews';
import FAQView from './components/FAQView';
import EventsView from './components/EventsView';
import ZohoBooksView from './components/ZohoBooksView';

import { AppDatabase, User, UserRole } from './types';
import { Bot, Sparkles, Loader2, Send, FileText, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [db, setDb] = useState<AppDatabase | null>(null);
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Deep-linking prefilled chat state
  const [prefilledPartnerId, setPrefilledPartnerId] = useState<string | null>(null);
  const [prefilledMessage, setPrefilledMessage] = useState<string | null>(null);

  // Standalone AI Copilot Generator states (for the BCI AI Assistant view)
  const [proposalSector, setProposalSector] = useState('Energi Hijau');
  const [proposalType, setProposalType] = useState('Memo Kerja Sama (MOU)');
  const [proposalCompany, setProposalCompany] = useState('PT Pertamina Geothermal');
  const [proposalPrompt, setProposalPrompt] = useState('');
  const [generatingProposal, setGeneratingProposal] = useState(false);
  const [proposalResult, setProposalResult] = useState('');

  // Fetch Full Database from Server
  const fetchDb = async () => {
    try {
      const res = await fetch('/api/db');
      if (res.ok) {
        const data: AppDatabase = await res.json();
        if (data && typeof data === 'object') {
          setDb(data);

          // Restore active user from localStorage if exists
          const storedUserId = localStorage.getItem('bci_user_id');
          if (storedUserId && data.users) {
            const foundUser = data.users.find(u => u.id === storedUserId);
            if (foundUser) {
              setCurrentUser(foundUser);
            } else {
              localStorage.removeItem('bci_user_id');
              setCurrentUser(null);
            }
          } else if (currentUser && data.users) {
            // Sync with any database updates for current user
            const updatedUser = data.users.find(u => u.id === currentUser.id);
            if (updatedUser) {
              setCurrentUser(updatedUser);
            }
          }
        }
      } else {
        console.warn("Backend DB returned status", res.status, "- using local fallback state.");
      }
    } catch (err) {
      console.error("Failed to load backend DB:", err);
    }
  };

  const handleLoginSuccess = (user: User) => {
    localStorage.setItem('bci_user_id', user.id);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('bci_user_id');
    setCurrentUser(null);
    setCurrentView('dashboard');
  };

  useEffect(() => {
    fetchDb();
  }, []);

  // Handle Role Simulation change
  const handleRoleChange = (newRole: UserRole) => {
    if (!db) return;
    const targetUser = db.users.find(u => u.role === newRole);
    if (targetUser) {
      setCurrentUser(targetUser);
    } else {
      // Fallback
      setCurrentUser({
        ...db.users[0],
        role: newRole,
        membership: newRole === 'Super Admin' || newRole === 'Perusahaan' ? 'Enterprise' : 'Pro'
      });
    }
  };

  // Helper to mark notifications read
  const handleMarkNotificationsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'POST' });
      fetchDb();
    } catch (e) {
      console.error(e);
    }
  };

  // Setup prefilled chat for deep linking
  const handleSetPrefilledChat = (partnerId: string, message: string) => {
    setPrefilledPartnerId(partnerId);
    setPrefilledMessage(message);
  };

  const handleClearPrefilledChat = () => {
    setPrefilledPartnerId(null);
    setPrefilledMessage(null);
  };

  // AI Assistant Proposal Generator Action
  const handleGenerateAIProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratingProposal(true);
    setProposalResult('');
    try {
      const companyName = currentUser ? db?.companies.find(c => c.id === currentUser.companyId)?.name || currentUser.name : 'Anggota BCI';
      const response = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: proposalType,
          companyName,
          sector: proposalSector,
          promptDetail: proposalPrompt || `Buatlah proposal draf kemitraan ${proposalType} dengan ${proposalCompany} di bidang pengembangan ${proposalSector}.`
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
      setGeneratingProposal(false);
    }
  };

  if (!db) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#FFFDF7] text-xs">
        <Loader2 className="h-8 w-8 text-[#FF6B00] animate-spin mb-2" />
        <p className="font-extrabold text-gray-800 text-sm">Menghubungkan Portal Nasional Business Connect Indonesia...</p>
        <p className="text-gray-400 font-semibold mt-1">Mengunduh matriks compliance NIB, tender, dan draf kognitif</p>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthView db={db} onLoginSuccess={handleLoginSuccess} />;
  }

  // Format notifications for the header component
  const headerNotifications = (db.notifications || []).map(n => ({
    id: n.id,
    text: n.message,
    time: new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    read: n.isRead
  }));

  if (isMobile) {
    return (
      <MobileAppView
        db={db}
        currentUser={currentUser}
        currentView={currentView}
        onViewChange={setCurrentView}
        onRefresh={fetchDb}
        handleRoleChange={handleRoleChange}
        prefilledPartnerId={prefilledPartnerId}
        prefilledMessage={prefilledMessage}
        handleClearPrefilledChat={handleClearPrefilledChat}
        handleSetPrefilledChat={handleSetPrefilledChat}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF7] flex flex-col font-sans text-slate-800 relative overflow-x-hidden">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-[#FFD54F]/10 to-[#FF6B00]/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-gradient-to-tr from-[#FFC107]/5 to-[#FFB300]/10 rounded-full blur-[100px] pointer-events-none z-0"></div>
      
      {/* Header component */}
      <Header
        currentUser={currentUser}
        onRoleChange={handleRoleChange}
        notifications={headerNotifications}
        onMarkNotificationsRead={handleMarkNotificationsRead}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onLogout={handleLogout}
      />

      {/* Main Container Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        
        {/* Sidebar Component */}
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          userRole={currentUser.role}
        />

        {/* Dynamic Inner Main Workspace Frame */}
        <main className="flex-1 min-w-0">
          {currentView === 'dashboard' && (
            <DashboardView
              db={db}
              currentUser={currentUser}
              onViewChange={setCurrentView}
            />
          )}

          {currentView === 'feed' && (
            <FeedView
              db={db}
              currentUser={currentUser}
              onRefresh={fetchDb}
            />
          )}

          {currentView === 'profile' && (
            <CompanyProfileView
              db={db}
              currentUser={currentUser}
              onViewChange={setCurrentView}
              onSetPrefilledChat={handleSetPrefilledChat}
              onRefresh={fetchDb}
            />
          )}

          {currentView === 'news' && (
            <NewsView
              db={db}
              currentUser={currentUser}
              onRefresh={fetchDb}
            />
          )}

          {currentView === 'chat' && (
            <ChatView
              db={db}
              currentUser={currentUser}
              onRefresh={fetchDb}
              prefilledPartnerId={prefilledPartnerId}
              prefilledMessage={prefilledMessage}
              onClearPrefilledChat={handleClearPrefilledChat}
            />
          )}

          {currentView === 'matching' && (
            <MatchingView
              db={db}
              currentUser={currentUser}
              onViewChange={setCurrentView}
              onSetPrefilledChat={handleSetPrefilledChat}
            />
          )}

          {currentView === 'marketplace' && (
            <MarketplaceView
              db={db}
              currentUser={currentUser}
              onRefresh={fetchDb}
              onSetPrefilledChat={handleSetPrefilledChat}
              onViewChange={setCurrentView}
            />
          )}

          {currentView === 'tender' && (
            <TenderView
              db={db}
              currentUser={currentUser}
              onRefresh={fetchDb}
            />
          )}

          {currentView === 'crm' && (
            <CRMView
              db={db}
              currentUser={currentUser}
              onRefresh={fetchDb}
            />
          )}

          {currentView === 'zoho-books' && (
            <ZohoBooksView
              db={db}
              currentUser={currentUser}
              onRefresh={fetchDb}
            />
          )}

          {currentView === 'forum' && (
            <ForumView
              db={db}
              currentUser={currentUser}
              onRefresh={fetchDb}
            />
          )}

          {currentView === 'notifications' && (
            <NotificationsView
              db={db}
              currentUser={currentUser}
              onRefresh={fetchDb}
              onViewChange={setCurrentView}
            />
          )}

          {currentView === 'admin' && (
            <AdminDashboardView
              db={db}
              currentUser={currentUser}
              onRefresh={fetchDb}
            />
          )}

          {currentView === 'membership' && (
            <MembershipView
              currentUser={currentUser}
              onRefresh={fetchDb}
            />
          )}

          {currentView === 'legal' && (
            <LegalViews
              onBackToDashboard={() => setCurrentView('dashboard')}
            />
          )}

          {currentView === 'faq' && (
            <FAQView />
          )}

          {currentView === 'events' && (
            <EventsView
              db={db}
              currentUser={currentUser}
              onRefresh={fetchDb}
              onViewChange={setCurrentView}
            />
          )}

          {/* Standalone AI Proposal Copywriter assistant view */}
          {currentView === 'ai-assistant' && (
            <div className="space-y-6">
              
              {/* Header visual */}
              <div className="rounded-3xl bg-glossy-gold p-6 text-white flex flex-col md:flex-row gap-4 items-center">
                <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white flex-shrink-0 shadow-lg border border-white/30">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="font-extrabold text-white text-base">BCI AI Proposal & Copywriting Assistant</h2>
                  <p className="text-xs text-white/90">
                    Gunakan kecerdasan kognitif Gemini AI untuk menyusun draf kontrak hukum, surat penawaran tender, memorandum of understanding (MOU), serta promosi barang B2B dengan gaya eksklusif.
                  </p>
                </div>
              </div>

              {/* Form Input block */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="lg:col-span-1 rounded-3xl border border-white bg-white/60 backdrop-blur-lg p-5 shadow-md space-y-4 text-xs">
                  <h3 className="font-extrabold text-gray-900 text-sm">Konfigurasi Proposal AI</h3>
                  
                  <form onSubmit={handleGenerateAIProposal} className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-600">Kategori Berkas</label>
                      <select
                        value={proposalType}
                        onChange={e => setProposalType(e.target.value)}
                        className="w-full rounded-2xl border border-white/60 bg-white/50 p-2.5 outline-none font-bold text-gray-800 focus:bg-white transition-all backdrop-blur-sm"
                      >
                        <option value="Memorandum of Understanding (MOU)">Memorandum of Understanding (MOU)</option>
                        <option value="Proposal Penawaran Tender">Proposal Penawaran Tender</option>
                        <option value="Draf Kontrak Suplai (NDA)">Draf Kontrak Suplai (NDA)</option>
                        <option value="Saluran Promosi Produk B2B">Saluran Promosi Produk B2B</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-600">Sektor Industri Sasaran</label>
                      <input
                        type="text"
                        required
                        value={proposalSector}
                        onChange={e => setProposalSector(e.target.value)}
                        placeholder="Contoh: Manufaktur Logam / IoT Pertanian"
                        className="w-full rounded-2xl border border-white/60 bg-white/50 p-2.5 outline-none focus:bg-white transition-all text-slate-800 font-medium backdrop-blur-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-600">Perusahaan Mitra Sasaran</label>
                      <input
                        type="text"
                        required
                        value={proposalCompany}
                        onChange={e => setProposalCompany(e.target.value)}
                        placeholder="Contoh: PT Semen Indonesia"
                        className="w-full rounded-2xl border border-white/60 bg-white/50 p-2.5 outline-none focus:bg-white transition-all text-slate-800 font-medium backdrop-blur-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-600">Instruksi Tambahan (Opsional)</label>
                      <textarea
                        value={proposalPrompt}
                        onChange={e => setProposalPrompt(e.target.value)}
                        placeholder="Sertifikasi TKDN minimal, skema pembayaran, jaminan kualitas..."
                        rows={3}
                        className="w-full rounded-2xl border border-white/60 bg-white/50 p-2.5 outline-none focus:bg-white transition-all text-slate-800 font-medium backdrop-blur-sm resize-none font-sans"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={generatingProposal}
                      className="w-full flex items-center justify-center gap-2 rounded-xl btn-glossy-gold py-3 font-extrabold text-white cursor-pointer"
                    >
                      {generatingProposal ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-white" />
                          <span>AI Sedang Menulis...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 text-white" />
                          <span>Buat Berkas AI</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* AI Document preview block */}
                <div className="lg:col-span-2 rounded-3xl border border-white bg-white/60 backdrop-blur-lg p-6 shadow-md min-h-[24rem] flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/50">
                    <p className="font-extrabold text-gray-900 text-xs flex items-center gap-1.5">
                      <FileText className="h-4.5 w-4.5 text-[#FF6B00]" />
                      Pratinjau Hasil Dokumen AI
                    </p>
                    <span className="text-[10px] font-bold text-white bg-glossy-gold px-2.5 py-0.5 rounded-full shadow-sm">
                      Optimasi Otomatis
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto max-h-96 pr-2">
                    {generatingProposal ? (
                      <div className="flex h-full flex-col items-center justify-center text-xs text-gray-400 space-y-2">
                        <Loader2 className="h-6 w-6 text-[#FF6B00] animate-spin" />
                        <p className="font-bold text-gray-700">Merumuskan draf hukum & kualifikasi teknis tingkat lanjut...</p>
                      </div>
                    ) : proposalResult ? (
                      <div className="text-xs text-gray-700 whitespace-pre-line leading-relaxed font-mono bg-white/50 border border-white p-5 rounded-2xl shadow-inner font-medium">
                        {proposalResult}
                      </div>
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center text-xs text-gray-400 space-y-1 py-20 text-center">
                        <Sparkles className="h-6 w-6 text-[#FF6B00] animate-pulse mb-1" />
                        <p className="font-extrabold text-gray-700">Draf Kosong</p>
                        <p className="max-w-xs font-bold leading-relaxed text-slate-500">Pilih draf hukum atau proposal penawaran, kemudian klik tombol "Buat Berkas AI".</p>
                      </div>
                    )}
                  </div>

                  {proposalResult && (
                    <div className="flex justify-end gap-2 text-xs pt-3 border-t border-white/50">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(proposalResult);
                          alert('Dokumen AI berhasil disalin ke papan klip!');
                        }}
                        className="rounded-xl bg-white hover:bg-[#FFFDF7] border border-white/80 text-slate-700 font-bold px-3 py-1.5 cursor-pointer transition-all shadow-sm"
                      >
                        Salin Dokumen
                      </button>
                      <button
                        onClick={() => {
                          exportToPDF(proposalResult, {
                            title: proposalType,
                            category: proposalType,
                            sector: proposalSector,
                            targetCompany: proposalCompany,
                          });
                        }}
                        className="rounded-xl bg-gradient-to-r from-[#FFC107] to-[#FF6B00] hover:brightness-110 active:scale-95 text-white font-extrabold px-3 py-1.5 cursor-pointer transition-all shadow-sm shadow-orange-500/15 flex items-center gap-1.5"
                      >
                        <FileText className="h-4 w-4" />
                        <span>Unduh PDF</span>
                      </button>
                    </div>
                  )}

                </div>

              </div>

            </div>
          )}
        </main>

      </div>

    </div>
  );
}
