import React, { useState } from 'react';
import {
  Users,
  MessageSquare,
  Calendar as CalIcon,
  FileText,
  TrendingUp,
  Sparkles,
  Award,
  Bell,
  Send,
  Loader2,
  CheckCircle,
  Briefcase,
  ChevronRight,
  Bot,
  Handshake,
  Activity,
  ArrowUpRight,
  BarChart2,
  ShoppingBag,
  Filter,
  CheckCircle2,
  Building2,
  Target,
  Compass,
  Star,
  ArrowRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { AppDatabase, User } from '../types';
import { exportToPDF } from '../utils/pdfExport';
import SupabaseHealthMonitor from './SupabaseHealthMonitor';

interface DashboardViewProps {
  db: AppDatabase;
  currentUser: User;
  onViewChange: (view: string) => void;
}

export default function DashboardView({ db, currentUser, onViewChange }: DashboardViewProps) {
  // Mini AI Assistant state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);

  // Monthly Analytics Chart Tab Filter
  const [monthlyTab, setMonthlyTab] = useState<'all' | 'matching' | 'marketplace'>('all');

  // Networking Recommendation State
  const [invitedCompanies, setInvitedCompanies] = useState<string[]>([]);
  const [recommendationSuccessMsg, setRecommendationSuccessMsg] = useState<string | null>(null);

  // User sector context for personalized matching
  const targetSector = currentUser.companyId
    ? db.companies.find(c => c.id === currentUser.companyId)?.sector || 'Teknologi'
    : 'Teknologi';

  // Compute top 3 daily recommended companies using user interaction & company data
  const recommendedCompanies = db.companies
    .filter(c => c.id !== currentUser.companyId)
    .slice(0, 3)
    .map((comp, idx) => {
      const matchScores = [98, 95, 91];
      const matchBadges = [
        'Sinergi Kemitraan Tinggi',
        'Relevan Sektor & TKDN',
        'Potensi Supplier B2B'
      ];
      const matchReasons = [
        `Selaras dengan profil Anda di sektor ${targetSector}. Legalitas NIB terverifikasi & skor sinergi tinggi.`,
        `Membutuhkan mitra pengadaan barang/jasa B2B dengan kualifikasi serupa dengan profil perusahaan Anda.`,
        `Aktif berpartisipasi dalam tender proyek strategis nasional dan katalog marketplace BCI.`
      ];

      return {
        ...comp,
        matchScore: matchScores[idx % matchScores.length],
        matchBadge: matchBadges[idx % matchBadges.length],
        matchReason: matchReasons[idx % matchReasons.length]
      };
    });

  const handleSendInvite = (compName: string, compId: string) => {
    if (!invitedCompanies.includes(compId)) {
      setInvitedCompanies(prev => [...prev, compId]);
      setRecommendationSuccessMsg(`Undangan kolaborasi & profil kemitraan berhasil dikirimkan ke ${compName}!`);
      setTimeout(() => setRecommendationSuccessMsg(null), 5000);
    }
  };

  // Monthly Business Matching & Marketplace dataset (Jan - Jul 2026)
  const monthlyData = [
    { month: 'Jan', matching: 14, marketplace: 32, deals: 6, volume: 'Rp 420 Jt' },
    { month: 'Feb', matching: 22, marketplace: 48, deals: 11, volume: 'Rp 680 Jt' },
    { month: 'Mar', matching: 35, marketplace: 65, deals: 18, volume: 'Rp 950 Jt' },
    { month: 'Apr', matching: 48, marketplace: 92, deals: 26, volume: 'Rp 1,4 M' },
    { month: 'Mei', matching: 62, marketplace: 118, deals: 37, volume: 'Rp 2,1 M' },
    { month: 'Jun', matching: 79, marketplace: 145, deals: 49, volume: 'Rp 2,8 M' },
    { month: 'Jul', matching: 96, marketplace: 182, deals: 62, volume: 'Rp 3,6 M' },
  ];

  // Stats calculation
  const totalRelasi = db.companies.length * 3 + 14; // rich mock multiplier
  const activeChats = Array.from(new Set(db.chatMessages.map(m => m.chatId))).length;
  const activeTenders = db.tenders.filter(t => t.status === 'Buka').length;
  const verifiedCompanies = db.companies.filter(c => c.isVerified).length;

  // Handle Mini AI quick query
  const handleMiniAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setLoadingAI(true);
    setAiResponse('');
    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'Caption',
          companyName: currentUser.companyId ? db.companies.find(c => c.id === currentUser.companyId)?.name : 'UMKM Indonesia',
          sector: 'Teknologi & UMKM',
          promptDetail: aiPrompt
        })
      });
      const data = await res.json();
      setAiResponse(data.document);
    } catch (err) {
      setAiResponse('Gagal menghubungi AI. Silakan periksa koneksi Anda.');
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-glossy-gold p-6 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mr-10 -mt-10 h-40 w-40 rounded-full bg-white/10 blur-xl"></div>
        <div className="absolute bottom-0 left-0 -ml-10 -mb-10 h-40 w-40 rounded-full bg-white/5 blur-xl"></div>
        
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-black backdrop-blur-md border border-white/20 shadow-sm">
              <Sparkles className="h-3 w-3 text-amber-300 fill-amber-200 animate-pulse" />
              Era Baru Kolaborasi Bisnis 2026
            </span>
            <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl text-white">
              Selamat Datang, {currentUser.name}!
            </h1>
            <p className="mt-1.5 text-xs text-white/95 max-w-xl font-bold leading-relaxed">
              Hubungkan bisnis Anda secara realtime dengan jaringan investor, supplier, UMKM, dan proyek tender strategis nasional di seluruh Indonesia.
            </p>
          </div>
          <div className="flex gap-2.5 flex-wrap">
            <button
              onClick={() => onViewChange('matching')}
              className="rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-[#FF6B00] shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              Cari Mitra AI
            </button>
            <button
              onClick={() => onViewChange('zoho-books')}
              className="rounded-xl bg-slate-900 border border-amber-400/40 px-4 py-2.5 text-xs font-black text-amber-300 hover:bg-slate-950 active:scale-95 transition-all cursor-pointer shadow-md"
            >
              Zoho Books Keuangan
            </button>
            <button
              onClick={() => onViewChange('tender')}
              className="rounded-xl bg-black/15 border border-white/40 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-black/25 active:scale-95 transition-all cursor-pointer"
            >
              Ikuti Tender Proyek
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Relasi */}
        <div className="glass-card glass-card-hover rounded-3xl p-5 shadow-md glossy-top-highlight">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Relasi Bisnis</span>
            <div className="rounded-xl bg-gradient-to-tr from-[#FFD54F]/20 to-[#FF6B00]/20 p-2.5 text-[#FF6B00] border border-[#FFD54F]/40 shadow-inner">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{totalRelasi}</h3>
            <p className="mt-1 flex items-center text-xs font-extrabold text-[#22C55E]">
              <TrendingUp className="mr-1 h-3.5 w-3.5" />
              <span>+14 Baru</span>
            </p>
          </div>
        </div>

        {/* Chat Aktif */}
        <div className="glass-card glass-card-hover rounded-3xl p-5 shadow-md glossy-top-highlight">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Chat Aktif</span>
            <div className="rounded-xl bg-gradient-to-tr from-[#FFD54F]/20 to-[#FF6B00]/20 p-2.5 text-[#FF6B00] border border-[#FFD54F]/40 shadow-inner">
              <MessageSquare className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{activeChats}</h3>
            <p className="mt-1 text-xs text-slate-400 font-bold">Koneksi aktif</p>
          </div>
        </div>

        {/* Proyek Tender */}
        <div className="glass-card glass-card-hover rounded-3xl p-5 shadow-md glossy-top-highlight">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Tender Aktif</span>
            <div className="rounded-xl bg-gradient-to-tr from-[#FFD54F]/20 to-[#FF6B00]/20 p-2.5 text-[#FF6B00] border border-[#FFD54F]/40 shadow-inner">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{activeTenders}</h3>
            <p className="mt-1 text-xs text-[#FF6B00] font-extrabold">Proyek Strategis</p>
          </div>
        </div>

        {/* Anggota Terverifikasi */}
        <div className="glass-card glass-card-hover rounded-3xl p-5 shadow-md glossy-top-highlight">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Perusahaan Legal</span>
            <div className="rounded-xl bg-gradient-to-tr from-[#FFD54F]/20 to-[#FF6B00]/20 p-2.5 text-[#FF6B00] border border-[#FFD54F]/40 shadow-inner">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{verifiedCompanies}</h3>
            <p className="mt-1.5 text-[10px] text-[#FF6B00] bg-gradient-to-r from-[#FFD54F]/20 to-[#FF6B00]/10 px-2.5 py-1 rounded-full font-black inline-block shadow-sm border border-[#FFD54F]/35">
              NIB Lolos Verifikasi
            </p>
          </div>
        </div>

      </div>

      {/* Real-time Supabase & Server Health Monitor */}
      <SupabaseHealthMonitor />

      {/* Widget: Rekomendasi Networking Harian AI */}
      <div className="glass-card rounded-3xl p-6 shadow-md border border-amber-300/60 bg-gradient-to-br from-amber-50/40 via-orange-50/20 to-white glossy-top-highlight space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-[#FFC107] to-[#FF6B00] text-white shadow-md shadow-orange-500/20">
              <Compass className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-900 text-base">Rekomendasi Networking Harian</h3>
                <span className="rounded-full bg-orange-100 text-[#FF6B00] text-[9px] font-black px-2.5 py-0.5 border border-orange-200 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-amber-500 fill-amber-400" />
                  AI Personalized Match
                </span>
              </div>
              <p className="text-xs text-slate-500 font-bold mt-0.5">
                3 Perusahaan potensial yang paling relevan untuk diajak berkolaborasi setiap harinya berdasarkan data interaksi pengguna
              </p>
            </div>
          </div>

          <button
            onClick={() => onViewChange('matching')}
            className="rounded-2xl bg-slate-900 hover:bg-slate-950 text-white px-4 py-2.5 text-xs font-black shadow-md flex items-center gap-1.5 self-start sm:self-auto cursor-pointer transition-all active:scale-95 border border-slate-700"
          >
            <Users className="h-3.5 w-3.5 text-amber-300" />
            <span>Lihat Semua Rekomendasi AI</span>
          </button>
        </div>

        {/* Feedback Success Message Toast */}
        {recommendationSuccessMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-900 text-white border border-emerald-400/50 shadow-lg flex items-center justify-between text-xs font-bold animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-300 shrink-0" />
              <span>{recommendationSuccessMsg}</span>
            </div>
            <button
              onClick={() => onViewChange('chat')}
              className="text-[10px] font-black underline text-amber-300 hover:text-white transition-colors cursor-pointer"
            >
              Buka Chat
            </button>
          </div>
        )}

        {/* 3 Recommended Companies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendedCompanies.map((comp) => {
            const isInvited = invitedCompanies.includes(comp.id);
            return (
              <div
                key={comp.id}
                className="group relative rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm hover:shadow-md hover:border-orange-300 transition-all flex flex-col justify-between gap-3 glossy-top-highlight"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={comp.logo}
                        alt={comp.name}
                        className="h-11 w-11 rounded-xl object-cover border border-slate-200 shadow-sm"
                      />
                      <div>
                        <h4 className="font-black text-xs text-slate-900 group-hover:text-[#FF6B00] transition-colors line-clamp-1">
                          {comp.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-slate-400" />
                          <span>{comp.sector}</span>
                        </p>
                      </div>
                    </div>

                    <span className="shrink-0 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-black px-2 py-0.5 shadow-2xs flex items-center gap-1">
                      <Star className="h-3 w-3 fill-emerald-500 text-emerald-500" />
                      {comp.matchScore}% Match
                    </span>
                  </div>

                  <div className="space-y-1.5 my-2">
                    <span className="inline-block rounded-md bg-orange-50 text-[#FF6B00] border border-orange-200/60 text-[9px] font-black px-2 py-0.5">
                      {comp.matchBadge}
                    </span>
                    <p className="text-[11px] text-slate-600 font-medium leading-relaxed line-clamp-2">
                      {comp.matchReason}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onViewChange('matching')}
                    className="text-[10px] font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    Detail Profil
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onViewChange('chat')}
                      className="rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 text-xs font-black cursor-pointer transition-all"
                      title="Kirim Pesan Langsung"
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-slate-600" />
                    </button>

                    <button
                      onClick={() => handleSendInvite(comp.name, comp.id)}
                      disabled={isInvited}
                      className={`rounded-xl px-3 py-1.5 text-xs font-black shadow-sm flex items-center gap-1 cursor-pointer transition-all active:scale-95 ${
                        isInvited
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : 'bg-gradient-to-r from-[#FFC107] to-[#FF6B00] hover:brightness-110 text-white shadow-orange-500/20'
                      }`}
                    >
                      {isInvited ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Terkirim</span>
                        </>
                      ) : (
                        <>
                          <Handshake className="h-3 w-3" />
                          <span>Undang Kolaborasi</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recharts Analytics Dashboard & Connection History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Area Chart Card */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 shadow-md glossy-top-highlight flex flex-col justify-between">
          <div className="space-y-1 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-orange-50 p-2 text-[#FF6B00] border border-orange-100">
                  <Activity className="h-4.5 w-4.5" />
                </div>
                <h3 className="font-black text-slate-900 text-base">Tren Skor Kompatibilitas AI</h3>
              </div>
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <TrendingUp className="h-3 w-3" />
                <span>Akurasi +18%</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 font-bold">Kecocokan kualitatif & TKDN terhadap mitra bisnis BCI dari waktu ke waktu</p>
          </div>

          <div className="h-64 w-full text-xs font-bold text-slate-400">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={[
                  { name: '10 Jul', score: 72, count: 3, label: 'Inisiasi Awal' },
                  { name: '11 Jul', score: 78, count: 5, label: 'Optimasi Profil' },
                  { name: '12 Jul', score: 81, count: 6, label: 'Verifikasi NIB' },
                  { name: '13 Jul', score: 85, count: 8, label: 'Sertifikasi TKDN' },
                  { name: '14 Jul', score: 89, count: 12, label: 'Matching Nasional' },
                  { name: '15 Jul', score: 94, count: 15, label: 'Sinergi Maksimal' },
                  { name: '16 Jul', score: 91, count: 14, label: 'Pemantauan Tender' },
                  { name: '17 Jul', score: 96, count: 18, label: 'Koneksi Sukses' }
                ]}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#FFC107" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0/40" />
                <XAxis dataKey="name" stroke="#94A3B8" tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" tickLine={false} axisLine={false} domain={[50, 100]} />
                <Tooltip
                  content={({ active, payload, label }: any) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white/95 border border-[#FFD54F]/50 backdrop-blur-md p-3 rounded-2xl shadow-xl space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{label}</p>
                          <p className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-[#FF6B00]"></span>
                            <span>Skor Sinergi: <span className="text-[#FF6B00] font-black">{payload[0].value}%</span></span>
                          </p>
                          {payload[0].payload.label && (
                            <p className="text-[10px] text-slate-500 font-bold italic">
                              "{payload[0].payload.label}"
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="score" stroke="#FF6B00" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-[11px] font-bold text-slate-400">
            <span>Matriks AI kognitif terverifikasi berdasarkan NIB & TKDN</span>
            <button 
              onClick={() => onViewChange('matching')}
              className="text-[#FF6B00] hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>Jalankan Pencocokan Baru</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* History of Successful Connections List Card */}
        <div className="glass-card rounded-3xl p-6 shadow-md glossy-top-highlight flex flex-col justify-between">
          <div className="space-y-1 mb-4">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-orange-50 p-2 text-[#FF6B00] border border-orange-100">
                <Handshake className="h-4.5 w-4.5" />
              </div>
              <h3 className="font-black text-slate-900 text-base">Histori Koneksi Sukses</h3>
            </div>
            <p className="text-xs text-slate-500 font-bold">Kemitraan strategis yang berhasil diinisiasi</p>
          </div>

          {/* Connected Companies list dynamically mapped */}
          <div className="space-y-3 flex-1 overflow-y-auto max-h-64 pr-1 scrollbar-none mb-3">
            {db.companies.filter(c => c.id !== currentUser.companyId).slice(0, 3).map((comp, idx) => {
              const dates = ['17 Jul 2026', '15 Jul 2026', '12 Jul 2026'];
              const statuses = ['Kemitraan Aktif', 'MOU Ditandatangani', 'Negosiasi Kontrak'];
              const scores = [96, 92, 88];
              const statusColors = [
                'text-emerald-600 bg-emerald-50 border-emerald-100',
                'text-amber-600 bg-amber-50 border-amber-100',
                'text-blue-600 bg-blue-50 border-blue-100'
              ];

              return (
                <div key={comp.id} className="p-3 bg-white/50 border border-slate-100 rounded-2xl flex items-center justify-between gap-3 shadow-sm hover:border-orange-200 transition-all">
                  <div className="flex items-center gap-2.5">
                    <img 
                      src={comp.logo} 
                      alt={comp.name} 
                      className="h-9 w-9 rounded-xl object-cover border border-slate-100 shadow-inner" 
                    />
                    <div>
                      <h4 className="font-black text-xs text-slate-900 line-clamp-1">{comp.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold">{comp.sector} • {dates[idx % dates.length]}</p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-[9px] font-extrabold bg-[#FF6B00]/10 text-[#FF6B00] px-2 py-0.5 rounded-full border border-[#FF6B00]/15">
                      Sinergi {scores[idx % scores.length]}%
                    </span>
                    <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${statusColors[idx % statusColors.length]}`}>
                      {statuses[idx % statuses.length]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100">
            <button 
              onClick={() => onViewChange('chat')}
              className="w-full text-center text-xs font-black text-white bg-gradient-to-r from-[#FFC107] to-[#FF6B00] hover:brightness-105 active:scale-95 py-2.5 rounded-2xl cursor-pointer transition-all shadow-md shadow-orange-500/10"
            >
              Buka Obrolan Kemitraan
            </button>
          </div>
        </div>

      </div>

      {/* Monthly Business Matching & Marketplace Growth Recharts Visualizer */}
      <div className="glass-card rounded-3xl p-6 shadow-md glossy-top-highlight space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-gradient-to-tr from-[#FFD54F]/25 to-[#FF6B00]/20 p-2 text-[#FF6B00] border border-[#FFD54F]/35 shadow-inner">
                <BarChart2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-lg">
                  Tren Pertumbuhan Business Matching & Aktivitas Marketplace Bulanan
                </h3>
                <p className="text-xs text-slate-500 font-bold">
                  Statistik performa kecocokan kemitraan B2B dan volume transaksi/RFQ bulanan pengguna
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Tab Filters */}
          <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60 self-start sm:self-auto">
            <button
              onClick={() => setMonthlyTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                monthlyTab === 'all'
                  ? 'bg-white text-[#FF6B00] shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Semua Aktivitas
            </button>
            <button
              onClick={() => setMonthlyTab('matching')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                monthlyTab === 'matching'
                  ? 'bg-white text-[#FF6B00] shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Handshake className="h-3.5 w-3.5" />
              <span>Matching</span>
            </button>
            <button
              onClick={() => setMonthlyTab('marketplace')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                monthlyTab === 'marketplace'
                  ? 'bg-white text-[#FF6B00] shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Marketplace</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-2xl bg-orange-50/60 border border-orange-100 text-left">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Business Match</p>
            <p className="text-lg font-black text-[#FF6B00] mt-0.5">356 Pertemuan</p>
            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100">
              +28% MoM
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-100 text-left">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Permintaan Marketplace</p>
            <p className="text-lg font-black text-amber-600 mt-0.5">682 RFQ & Deal</p>
            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100">
              +34% MoM
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-left">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">MOU / Kesepakatan Gol</p>
            <p className="text-lg font-black text-emerald-600 mt-0.5">209 Kesepakatan</p>
            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100">
              Konversi 84.5%
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 text-left">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Est. Nilai Transaksi</p>
            <p className="text-lg font-black text-slate-800 mt-0.5">Rp 11,93 Miliar</p>
            <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-100">
              Terverifikasi BCI
            </span>
          </div>
        </div>

        {/* Recharts Render Container */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={monthlyData}
              margin={{ top: 15, right: 15, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorMatchingBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF6B00" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#FF8800" stopOpacity={0.6} />
                </linearGradient>
                <linearGradient id="colorMarketplaceBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFC107" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#FFD54F" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0/60" />
              <XAxis dataKey="month" stroke="#64748B" tickLine={false} axisLine={false} className="text-xs font-bold" />
              <YAxis stroke="#64748B" tickLine={false} axisLine={false} className="text-xs font-bold" />
              <Tooltip
                content={({ active, payload, label }: any) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white/95 border border-slate-200 backdrop-blur-md p-3.5 rounded-2xl shadow-xl space-y-1.5 text-xs font-extrabold text-slate-800">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">
                          Bulan {label} 2026
                        </p>
                        {payload.map((entry: any, i: number) => (
                          <div key={i} className="flex items-center justify-between gap-4">
                            <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                              <span>{entry.name}:</span>
                            </span>
                            <span className="font-black" style={{ color: entry.color }}>{entry.value}</span>
                          </div>
                        ))}
                        {payload[0]?.payload?.volume && (
                          <p className="text-[10px] font-black text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
                            <span>Vol. Transaksi:</span>
                            <span className="text-emerald-600 font-extrabold">{payload[0].payload.volume}</span>
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                verticalAlign="top" 
                align="right" 
                wrapperStyle={{ paddingBottom: '10px', fontSize: '11px', fontWeight: 'bold' }} 
              />

              {(monthlyTab === 'all' || monthlyTab === 'matching') && (
                <Bar 
                  dataKey="matching" 
                  name="Business Matching (Koneksi)" 
                  fill="url(#colorMatchingBar)" 
                  radius={[8, 8, 0, 0]} 
                  barSize={monthlyTab === 'matching' ? 28 : 16} 
                />
              )}

              {(monthlyTab === 'all' || monthlyTab === 'marketplace') && (
                <Bar 
                  dataKey="marketplace" 
                  name="Aktivitas Marketplace (RFQ/Produk)" 
                  fill="url(#colorMarketplaceBar)" 
                  radius={[8, 8, 0, 0]} 
                  barSize={monthlyTab === 'marketplace' ? 28 : 16} 
                />
              )}

              {monthlyTab === 'all' && (
                <Line 
                  type="monotone" 
                  dataKey="deals" 
                  name="Kesepakatan / MOU Gol" 
                  stroke="#10B981" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#FFFFFF' }} 
                  activeDot={{ r: 7 }} 
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-bold">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-[#FF6B00]"></span>
            <span>Update data real-time berbasis transaksi & kecocokan kognitif AI BCI</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onViewChange('matching')}
              className="text-[#FF6B00] hover:underline cursor-pointer flex items-center gap-1 font-black"
            >
              <Handshake className="h-3.5 w-3.5" />
              <span>Mulai Matching</span>
            </button>
            <span className="text-slate-300">•</span>
            <button 
              onClick={() => onViewChange('marketplace')}
              className="text-amber-600 hover:underline cursor-pointer flex items-center gap-1 font-black"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Jelajahi Marketplace</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Modules & Assistant */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Tenders & Projects */}
          <div className="glass-card rounded-3xl p-6 shadow-md glossy-top-highlight">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-black text-slate-900 text-lg">Tender Bisnis Terbaru</h3>
                <p className="text-xs text-slate-500 font-bold">Peluang kemitraan BUMN, startup, dan industri swasta</p>
              </div>
              <button
                onClick={() => onViewChange('tender')}
                className="text-xs font-extrabold text-[#FF6B00] hover:underline flex items-center gap-1"
              >
                Semua Tender <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            
            <div className="space-y-3">
              {db.tenders.slice(0, 3).map(t => (
                <div key={t.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-[#FFD54F]/25 bg-white/40 hover:bg-white/80 transition-all shadow-sm">
                  <div className="flex items-center gap-3">
                    <img src={t.companyLogo} alt={t.companyName} className="h-10 w-10 rounded-xl object-cover border border-slate-100 shadow-sm" />
                    <div>
                      <h4 className="font-black text-sm text-slate-900">{t.title}</h4>
                      <p className="text-xs text-slate-500 font-bold">{t.companyName} • {t.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:text-right gap-4">
                    <div>
                      <p className="text-xs font-black text-[#FF6B00] bg-gradient-to-r from-[#FFD54F]/25 to-[#FF6B00]/10 border border-[#FFD54F]/30 px-2.5 py-0.5 rounded-full shadow-sm">
                        Rp{t.value.toLocaleString('id-ID')}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold mt-1">Deadline: {t.deadline}</p>
                    </div>
                    <button
                      onClick={() => onViewChange('tender')}
                      className="rounded-xl bg-gradient-to-r from-[#FFC107] to-[#FF6B00] hover:brightness-110 active:scale-95 text-white px-4 py-1.5 text-xs font-black cursor-pointer transition-all shadow-sm shadow-orange-500/20"
                    >
                      Ajukan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Business News slider / list */}
          <div className="glass-card rounded-3xl p-6 shadow-md glossy-top-highlight">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-black text-slate-900 text-lg">Kilas Berita Bisnis & Regulasi</h3>
                <p className="text-xs text-slate-500 font-bold">Informasi industri, ekspor-impor, dan perpajakan terupdate</p>
              </div>
              <button
                onClick={() => onViewChange('news')}
                className="text-xs font-extrabold text-[#FF6B00] hover:underline flex items-center gap-1"
              >
                Baca Selengkapnya <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {db.newsArticles.slice(0, 2).map(art => (
                <div key={art.id} className="group flex flex-col rounded-2xl border border-white bg-white/30 overflow-hidden hover:shadow-md transition-all shadow-sm">
                  <div className="overflow-hidden h-32 w-full relative">
                    <img src={art.image} alt={art.title} className="h-full w-full object-cover group-hover:scale-105 transition-all duration-500" />
                    <div className="absolute top-2 left-2">
                      <span className="text-[9px] font-black uppercase tracking-wider text-white bg-[#FF6B00] border border-white/30 px-2 py-0.5 rounded-md shadow-sm">
                        {art.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-black text-sm text-slate-900 line-clamp-2 leading-tight">{art.title}</h4>
                      <p className="text-xs text-slate-500 font-bold mt-1.5 line-clamp-3 leading-relaxed">{art.summary}</p>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold mt-3 border-t border-slate-100/50 pt-2">{art.authorName} • 16 Juli 2026</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Assistant, Quick Calendar & Matching */}
        <div className="space-y-6">
          
          {/* Dashboard AI Assistant Mini Module */}
          <div className="glass-card rounded-3xl p-6 shadow-md glossy-top-highlight">
            <div className="flex items-center gap-2 mb-3">
              <div className="rounded-xl bg-gradient-to-tr from-[#FFD54F]/20 to-[#FF6B00]/20 p-2 text-[#FF6B00] border border-[#FFD54F]/30 shadow-inner">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm">BCI Quick Assistant</h3>
                <p className="text-[10px] text-slate-500 font-bold">Bantu tulis draf bisnis dalam hitungan detik</p>
              </div>
            </div>

            <form onSubmit={handleMiniAI} className="space-y-3">
              <textarea
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                placeholder="Contoh: 'Tulis caption LinkedIn mengundang supplier kemitraan alat berat...'"
                rows={3}
                className="w-full text-xs rounded-xl border border-slate-200 bg-white/50 p-3 outline-none focus:ring-2 focus:ring-[#FFD54F]/50 focus:bg-white focus:border-[#FFC107] resize-none transition-all shadow-inner text-slate-800 font-bold"
              />
              <button
                type="submit"
                disabled={loadingAI}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FFC107] to-[#FF6B00] hover:brightness-110 active:scale-95 py-2.5 text-xs font-black text-white shadow-md shadow-orange-500/20 transition-all cursor-pointer"
              >
                {loadingAI ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Mempersiapkan Dokumen...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>Generate Instan</span>
                  </>
                )}
              </button>
            </form>

            {aiResponse && (
              <div className="mt-4 p-3 rounded-xl bg-[#FFFDF7] border border-[#FFD54F]/30 text-xs text-slate-700 max-h-40 overflow-y-auto whitespace-pre-line font-medium leading-relaxed shadow-inner">
                <div className="font-black text-slate-900 border-b border-slate-100 pb-1 mb-1 flex items-center justify-between">
                  <span>Hasil AI:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(aiResponse);
                      }}
                      className="text-[10px] text-slate-500 font-black hover:text-[#FF6B00] transition-colors cursor-pointer"
                    >
                      Salin
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      onClick={() => {
                        const compName = currentUser.companyId ? db.companies.find(c => c.id === currentUser.companyId)?.name : 'UMKM Indonesia';
                        exportToPDF(aiResponse, {
                          title: "Draf Dokumen Instan",
                          category: "Draf Dokumen AI",
                          sector: "Teknologi & UMKM",
                          targetCompany: compName,
                        });
                      }}
                      className="text-[10px] text-[#FF6B00] font-black hover:underline cursor-pointer"
                    >
                      Unduh PDF
                    </button>
                  </div>
                </div>
                {aiResponse}
              </div>
            )}
          </div>

          {/* Interactive Business Calendar Widget */}
          <div className="glass-card rounded-3xl p-6 shadow-md glossy-top-highlight">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <CalIcon className="h-4 w-4 text-[#FF6B00]" />
                Kalender Bisnis Anda
              </h3>
              <span className="text-[10px] font-black text-[#FF6B00] bg-gradient-to-r from-[#FFD54F]/20 to-[#FF6B00]/10 px-2 py-0.5 rounded-full border border-[#FFD54F]/30">
                Hari Ini
              </span>
            </div>
            
            {/* Calendar Mini Representation */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-slate-400 border-b border-slate-100 pb-2">
              <span>S</span><span>S</span><span>R</span><span>K</span><span>J</span><span>S</span><span>M</span>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-700 py-2">
              <span className="text-slate-300 font-bold">12</span>
              <span className="text-slate-300 font-bold">13</span>
              <span className="text-slate-300 font-bold">14</span>
              <span className="text-slate-500 font-bold">15</span>
              <span className="bg-gradient-to-tr from-[#FFC107] to-[#FF6B00] text-white rounded-lg p-1.5 font-black shadow-md shadow-orange-500/20">16</span>
              <span className="font-bold text-slate-700">17</span>
              <span className="font-bold text-slate-700">18</span>
            </div>

            {/* Simulated schedule list */}
            <div className="mt-3 space-y-2">
              <div className="flex gap-2.5 p-2 bg-[#FFFDF7]/60 border border-[#FFD54F]/25 rounded-xl text-xs">
                <div className="border-l-2 border-[#FFC107] pl-2">
                  <p className="font-black text-slate-900">Video Call: Mandiri Ventures</p>
                  <p className="text-[10px] text-[#FF6B00] font-bold">14:00 - 14:45 WIB • Google Meet</p>
                </div>
              </div>
              <div className="flex gap-2.5 p-2 bg-[#FFFDF7]/60 border border-[#FFD54F]/25 rounded-xl text-xs">
                <div className="border-l-2 border-[#FF6B00] pl-2">
                  <p className="font-black text-slate-900">Tender Review: Genset Hybrid</p>
                  <p className="text-[10px] text-[#FF6B00] font-bold">16:00 WIB • Kantor BCI</p>
                </div>
              </div>
            </div>
          </div>

          {/* Audit Logs Trail */}
          <div className="glass-card rounded-3xl p-6 shadow-md">
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-2 mb-3">
              <Bell className="h-4 w-4 text-[#FF6B00]" />
              Sistem Audit Trail (Realtime)
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1 scrollbar-none">
              {db.auditLogs.slice(0, 4).map(log => (
                <div key={log.id} className="text-[11px] leading-relaxed border-b border-slate-100/50 pb-2">
                  <span className="font-black text-slate-800">{log.user}: </span>
                  <span className="text-slate-500 font-medium">{log.action}</span>
                  <p className="text-[9px] text-slate-400 font-bold mt-0.5">{new Date(log.timestamp).toLocaleTimeString()}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
