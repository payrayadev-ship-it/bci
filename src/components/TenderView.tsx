import React, { useState, useEffect } from 'react';
import {
  FileSignature,
  Plus,
  Briefcase,
  Calendar,
  CheckCircle,
  FileText,
  DollarSign,
  MapPin,
  Sparkles,
  Search,
  CheckCircle2,
  Lock,
  ChevronLeft,
  Target,
  Award,
  Zap,
  RefreshCw,
  ShieldCheck,
  Building2,
  ThumbsUp,
  SlidersHorizontal,
  Bot
} from 'lucide-react';
import { AppDatabase, Tender, User } from '../types';

interface TenderViewProps {
  db: AppDatabase;
  currentUser: User;
  onRefresh: () => void;
}

export default function TenderView({ db, currentUser, onRefresh }: TenderViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTenderId, setActiveTenderId] = useState<string | null>(db.tenders[0]?.id || null);
  const [mobileActiveView, setMobileActiveView] = useState<'list' | 'detail'>('list');

  // Proposal form state
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposalBudget, setProposalBudget] = useState('');
  const [proposalTimeline, setProposalTimeline] = useState('');
  const [proposalLetter, setProposalLetter] = useState('');
  const [proposalSuccess, setProposalSuccess] = useState(false);

  // New Tender creation state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [tenderTitle, setTenderTitle] = useState('');
  const [tenderValue, setTenderValue] = useState('');
  const [tenderDeadline, setTenderDeadline] = useState('');
  const [tenderLoc, setTenderLoc] = useState('');
  const [tenderDesc, setTenderDesc] = useState('');
  const [tenderReq, setTenderReq] = useState('');
  const [isPremium, setIsPremium] = useState(false);

  // Smart Tender Matching AI state
  const [smartMatches, setSmartMatches] = useState<Array<{
    tenderId: string;
    matchPercentage: number;
    fitLevel: string;
    reasons: string[];
    aiSummary: string;
  }>>([]);
  const [loadingSmartMatch, setLoadingSmartMatch] = useState(false);
  const [filterOnlyRecommended, setFilterOnlyRecommended] = useState(false);
  const [isAutoDrafting, setIsAutoDrafting] = useState(false);

  const company = db.companies.find(c => c.id === currentUser.companyId) || db.companies[0];

  // Fetch Smart Tender Matches from backend
  const fetchSmartMatches = async () => {
    setLoadingSmartMatch(true);
    try {
      const res = await fetch('/api/ai/smart-tender-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: company.id })
      });
      if (res.ok) {
        const data = await res.json();
        setSmartMatches(data.matches || []);
      }
    } catch (e) {
      console.error("Smart Tender Match Error:", e);
    } finally {
      setLoadingSmartMatch(false);
    }
  };

  useEffect(() => {
    fetchSmartMatches();
  }, [currentUser.companyId]);

  // Combine tenders with AI match scores
  const matchedTenders = db.tenders.map(t => {
    const match = smartMatches.find(m => m.tenderId === t.id);
    return {
      ...t,
      matchScore: match ? match.matchPercentage : 78,
      fitLevel: match ? match.fitLevel : 'Tinggi',
      reasons: match ? match.reasons : [`Sesuai Klasifikasi Sektor ${company.sector}`],
      aiSummary: match ? match.aiSummary : `Proyek "${t.title}" direkomendasikan berdasarkan portofolio PT ${company.name}.`
    };
  }).sort((a, b) => b.matchScore - a.matchScore);

  // Filter tenders based on search & recommendation toggle
  const filteredTenders = matchedTenders.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterOnlyRecommended) {
      return matchesSearch && t.matchScore >= 80;
    }
    return matchesSearch;
  });

  const selectedTender = matchedTenders.find(t => t.id === activeTenderId) || matchedTenders[0];

  // Auto-Draft Proposal with AI
  const handleAutoDraftProposal = () => {
    if (!selectedTender) return;
    setIsAutoDrafting(true);
    setShowProposalForm(true);

    setTimeout(() => {
      // Competitive budget estimation (~94% of tender budget)
      const estimatedBudget = Math.round(selectedTender.value * 0.94);
      setProposalBudget(estimatedBudget.toString());
      setProposalTimeline("30 - 45 Hari Kerja (Akselerasi BCI)");

      setProposalLetter(
        `Draf Proposal Penawaran Penjualan Resmi PT ${company.name}\n\n` +
        `Kepada Yth. Panitia Pengadaan ${selectedTender.companyName},\n\n` +
        `Melalui sistem BCI Smart Tender Matching (Skor Kesesuaian Kualifikasi ${selectedTender.matchScore}%), ` +
        `PT ${company.name} secara resmi mengajukan proposal penawaran untuk proyek "${selectedTender.title}".\n\n` +
        `ALASAN UTAMA KUALIFIKASI VENDOR:\n` +
        `1. Sektor KBLI Terverifikasi: Pengalaman teruji di bidang ${company.sector}.\n` +
        `2. Sertifikasi Legalitas & TKDN: Memiliki NIB (${company.legality?.nib || "9120001234567"}) & standar verifikasi nasional.\n` +
        `3. Kapasitas Finansial & Garansi: Dukungan garansi purnajual komprehensif serta kepatuhan batas waktu pengerjaan.\n\n` +
        `Demikian penawaran ini kami susun. Kami siap melampirkan berkas fisik teknis untuk tahap klarifikasi lebih lanjut.`
      );
      setIsAutoDrafting(false);
    }, 600);
  };

  // Submit proposal
  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalBudget || !proposalTimeline) return;

    try {
      const res = await fetch('/api/tender/propose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenderId: selectedTender.id,
          vendorId: company.id,
          vendorName: company.name,
          vendorLogo: company.logo,
          budgetProposed: Number(proposalBudget),
          timeline: proposalTimeline,
          coverLetter: proposalLetter
        })
      });

      if (res.ok) {
        setProposalSuccess(true);
        setTimeout(() => {
          setProposalSuccess(false);
          setShowProposalForm(false);
          setProposalBudget('');
          setProposalTimeline('');
          setProposalLetter('');
          onRefresh();
        }, 2000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Submit Tender Creation
  const handleCreateTender = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenderTitle || !tenderValue) return;

    try {
      const res = await fetch('/api/tender/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: company.id,
          companyName: company.name,
          companyLogo: company.logo,
          title: tenderTitle,
          value: Number(tenderValue),
          deadline: tenderDeadline || new Date().toISOString().split('T')[0],
          requirements: tenderReq.split(',').map(r => r.trim()),
          location: tenderLoc,
          description: tenderDesc,
          isPremium
        })
      });

      if (res.ok) {
        setTenderTitle('');
        setTenderValue('');
        setTenderDeadline('');
        setTenderLoc('');
        setTenderDesc('');
        setTenderReq('');
        setIsPremium(false);
        setShowCreateForm(false);
        onRefresh();
        fetchSmartMatches();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Accept proposal
  const handleProposalStatus = async (proposalId: string, status: 'Disetujui' | 'Ditolak') => {
    try {
      const res = await fetch('/api/tender/proposal-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenderId: selectedTender.id,
          proposalId,
          status
        })
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const isOwner = currentUser.companyId === selectedTender?.companyId;

  return (
    <div className="space-y-6">
      
      {/* Smart Tender Matching AI Overview Banner */}
      <div className="glass-card rounded-3xl p-5 sm:p-6 shadow-md glossy-top-highlight space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-[#FFC107] text-white flex items-center justify-center shadow-lg shadow-orange-500/20 flex-shrink-0 animate-pulse">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-slate-900 text-lg">Smart Tender Matching AI</h2>
                <span className="bg-orange-100 text-[#FF6B00] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-orange-200/80">
                  Rekomendasi Presisi
                </span>
              </div>
              <p className="text-xs text-slate-500 font-bold mt-0.5">
                Rekomendasi tender otomatis berdasarkan analisis kecocokan profil industri ({company.sector}), kualifikasi legalitas NIB, dan riwayat sertifikasi TKDN
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchSmartMatches}
              disabled={loadingSmartMatch}
              className="px-4 py-2.5 rounded-2xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-[#FF6B00] font-black text-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingSmartMatch ? 'animate-spin' : ''}`} />
              <span>{loadingSmartMatch ? 'Menganalisis...' : 'Analisis Ulang AI'}</span>
            </button>
          </div>
        </div>

        {/* Company Qualification Context Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-200/70 text-slate-700">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider">Sektor Industri Perusahaan</p>
              <p className="text-xs font-black text-slate-900 truncate">{company.sector}</p>
            </div>
          </div>

          <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500 text-white shadow-xs">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[9.5px] font-black text-emerald-600 uppercase tracking-wider">Status NIB & Legalitas</p>
              <p className="text-xs font-black text-slate-900 truncate">
                {company.isVerified ? 'NIB Terverifikasi BCI' : 'Kualifikasi Standar'}
              </p>
            </div>
          </div>

          <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-100 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-xs">
              <Award className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[9.5px] font-black text-amber-700 uppercase tracking-wider">Tender Skor Fit &gt; 80%</p>
              <p className="text-xs font-black text-slate-900 truncate">
                {matchedTenders.filter(t => t.matchScore >= 80).length} Tender Direkomendasikan
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Active Tender Lists with Smart Matching Filters */}
        <div className={`lg:col-span-1 space-y-4 ${mobileActiveView === 'detail' ? 'hidden lg:block' : 'block'}`}>
          
          {/* Search & Header */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-sm">Proyek & Tender Aktif</h3>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="rounded-xl bg-gradient-to-r from-[#FFC107] to-[#FF6B00] hover:brightness-110 p-2.5 text-white shadow-md shadow-orange-500/20 flex items-center justify-center cursor-pointer transition-all"
                id="btn-add-tender"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama proyek / instansi..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-2xl border border-slate-200/80 bg-white/70 text-xs font-bold text-slate-800 placeholder-slate-400 outline-none focus:border-[#FF6B00] focus:bg-white shadow-xs transition-all"
              />
            </div>

            {/* Smart Tender Filter Toggle */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/60 text-xs font-black">
              <button
                onClick={() => setFilterOnlyRecommended(false)}
                className={`flex-1 py-1.5 rounded-xl transition-all cursor-pointer ${
                  !filterOnlyRecommended
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Semua ({matchedTenders.length})
              </button>
              <button
                onClick={() => setFilterOnlyRecommended(true)}
                className={`flex-1 py-1.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  filterOnlyRecommended
                    ? 'bg-white text-[#FF6B00] shadow-sm'
                    : 'text-slate-500 hover:text-[#FF6B00]'
                }`}
              >
                <Sparkles className="h-3 w-3 text-[#FF6B00]" />
                <span>Smart Match AI ({matchedTenders.filter(t => t.matchScore >= 80).length})</span>
              </button>
            </div>
          </div>

          {/* Tender Cards */}
          <div className="space-y-2.5 max-h-[calc(100vh-22rem)] overflow-y-auto pr-1 scrollbar-none">
            {filteredTenders.map(t => {
              const isActive = selectedTender?.id === t.id;
              const isHighMatch = t.matchScore >= 85;

              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setActiveTenderId(t.id);
                    setMobileActiveView('detail');
                  }}
                  className={`w-full p-4 rounded-2xl border text-left text-xs space-y-2.5 transition-all cursor-pointer relative overflow-hidden ${
                    isActive
                      ? 'bg-gradient-to-r from-[#FFC107] to-[#FF6B00] text-white border-none shadow-lg shadow-orange-500/25'
                      : 'glass-card border-white/60 hover:bg-white/80 backdrop-blur-sm text-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img src={t.companyLogo} alt="Logo" className="h-8 w-8 rounded-xl object-cover border border-white/50 shadow-sm flex-shrink-0" />
                      <div className="min-w-0">
                        <h4 className={`font-black truncate ${isActive ? 'text-white' : 'text-slate-900'}`}>{t.title}</h4>
                        <p className={`text-[10px] font-bold truncate ${isActive ? 'text-white/85' : 'text-slate-500'}`}>{t.companyName}</p>
                      </div>
                    </div>

                    {/* AI Smart Match Badge */}
                    <div className={`px-2 py-0.5 rounded-full text-[9.5px] font-black flex items-center gap-1 flex-shrink-0 ${
                      isActive
                        ? 'bg-white/20 text-white border border-white/30'
                        : isHighMatch
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xs'
                        : 'bg-orange-100 text-[#FF6B00] border border-orange-200'
                    }`}>
                      <Zap className="h-2.5 w-2.5 fill-current" />
                      <span>{t.matchScore}% Match</span>
                    </div>
                  </div>

                  {/* AI Match Reason Tag */}
                  <div className={`text-[9.5px] font-extrabold px-2 py-1 rounded-lg ${
                    isActive ? 'bg-black/10 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    💡 {t.reasons[0] || 'Kesesuaian kualifikasi vendor'}
                  </div>

                  <div className="flex items-center justify-between border-t border-black/5 pt-2">
                    <span className={`font-black ${isActive ? 'text-white' : 'text-[#FF6B00]'}`}>
                      Rp{t.value.toLocaleString('id-ID')}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                      isActive ? 'bg-white/20 text-white shadow-sm' : (t.isPremium ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700')
                    }`}>
                      {t.isPremium ? 'Premium' : 'Umum'}
                    </span>
                  </div>
                </button>
              );
            })}

            {filteredTenders.length === 0 && (
              <div className="p-6 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 font-bold text-xs space-y-1">
                <p>Tidak ada tender yang memenuhi kriteria pencarian.</p>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Tender Detailed Specifications, AI Fit Analysis, & Proposals */}
        <div className={`lg:col-span-2 space-y-6 ${mobileActiveView === 'list' ? 'hidden lg:block' : 'block'}`}>
          
          {/* Create Tender Form */}
          {showCreateForm && (
            <div className="glass-card rounded-3xl p-6 space-y-4 shadow-xl glossy-top-highlight border border-white/60">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="font-black text-slate-900 text-base">Buat Proyek Pengadaan Tender Baru</h3>
                <button onClick={() => setShowCreateForm(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
              </div>

              <form onSubmit={handleCreateTender} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Nama Proyek</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pengadaan Panel Surya Atap Pabrik 50KWp"
                    value={tenderTitle}
                    onChange={e => setTenderTitle(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white/50 p-3 outline-none focus:border-[#FFC107] focus:bg-white font-bold text-slate-800 transition-all shadow-inner"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Nilai Proyek (Rp)</label>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 1200000000"
                    value={tenderValue}
                    onChange={e => setTenderValue(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white/50 p-3 outline-none focus:border-[#FFC107] focus:bg-white font-bold text-slate-800 transition-all shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Batas Akhir (Deadline)</label>
                    <input
                      type="date"
                      required
                      value={tenderDeadline}
                      onChange={e => setTenderDeadline(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white/50 p-3 outline-none focus:border-[#FFC107] focus:bg-white font-bold text-slate-800 transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Lokasi Proyek</label>
                    <input
                      type="text"
                      placeholder="Contoh: Jakarta / IKN"
                      value={tenderLoc}
                      onChange={e => setTenderLoc(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white/50 p-3 outline-none focus:border-[#FFC107] focus:bg-white font-bold text-slate-800 transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="font-bold text-slate-500">Persyaratan Legalitas & Kualifikasi Vendor (Pisahkan dengan koma)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Minimal TKDN 45%, Memiliki NIB Aktif, Pengalaman 3 Tahun"
                    value={tenderReq}
                    onChange={e => setTenderReq(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white/50 p-3 outline-none focus:border-[#FFC107] focus:bg-white font-bold text-slate-800 transition-all shadow-inner"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="font-bold text-slate-500">Deskripsi Pekerjaan Terperinci</label>
                  <textarea
                    required
                    placeholder="Deskripsikan ruang lingkup pekerjaan, jadwal pelaksanaan, draf spesifikasi teknis barang, dan skema purnajual..."
                    value={tenderDesc}
                    onChange={e => setTenderDesc(e.target.value)}
                    rows={4}
                    className="w-full rounded-2xl border border-slate-200 bg-white/50 p-3 outline-none focus:border-[#FFC107] focus:bg-white text-slate-800 resize-none font-bold transition-all shadow-inner"
                  />
                </div>

                <div className="flex items-center gap-2 md:col-span-2 py-1">
                  <input
                    type="checkbox"
                    id="chk-premium"
                    checked={isPremium}
                    onChange={e => setIsPremium(e.target.checked)}
                    className="h-4 w-4 text-[#FF6B00] border-slate-300 rounded focus:ring-[#FFD54F]"
                  />
                  <label htmlFor="chk-premium" className="font-black text-slate-700">Tandai sebagai Tender Premium</label>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-gradient-to-r from-[#FFC107] to-[#FF6B00] hover:brightness-110 active:scale-95 py-3 font-extrabold text-white text-xs shadow-md shadow-orange-500/20 cursor-pointer transition-all md:col-span-2"
                >
                  Buka Tender Proyek Sekarang
                </button>
              </form>
            </div>
          )}

          {selectedTender ? (
            <div className="glass-card rounded-3xl p-6 shadow-md space-y-6 glossy-top-highlight">
              
              {/* Back button for mobile */}
              <div className="lg:hidden pb-1">
                <button
                  type="button"
                  onClick={() => setMobileActiveView('list')}
                  className="flex items-center gap-1.5 text-xs font-black text-[#FF6B00] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Kembali ke Daftar Proyek</span>
                </button>
              </div>

              {/* Header info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3 text-xs">
                  <img src={selectedTender.companyLogo} alt="logo" className="h-12 w-12 rounded-xl object-cover border border-slate-100 shadow-sm" />
                  <div>
                    <h2 className="font-black text-slate-900 text-base">{selectedTender.title}</h2>
                    <p className="text-slate-400 font-extrabold">{selectedTender.companyName} • Lokasi: {selectedTender.location}</p>
                  </div>
                </div>
                <div className="text-left text-xs">
                  <p className="font-black text-slate-400 uppercase tracking-wider text-[10px]">Nilai Pagu Tender:</p>
                  <p className="text-lg font-black text-[#FF6B00]">Rp{selectedTender.value.toLocaleString('id-ID')}</p>
                </div>
              </div>

              {/* Smart Tender Matching AI Fit Analysis Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-50/90 via-amber-50/70 to-emerald-50/80 border border-orange-200/80 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[#FF6B00] text-white">
                      <Zap className="h-4 w-4 fill-current" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-xs">Analisis Kecocokan AI (Smart Matching Fit)</h4>
                      <p className="text-[10px] text-slate-500 font-bold">Evaluasi kualifikasi PT {company.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-orange-200 shadow-xs">
                    <span className="text-[10px] text-slate-400 font-bold">Skor Fit:</span>
                    <span className="text-sm font-black text-[#FF6B00]">{selectedTender.matchScore}%</span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 font-bold leading-relaxed bg-white/70 p-3 rounded-xl border border-orange-100">
                  {selectedTender.aiSummary}
                </p>

                {/* Alignment points */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {selectedTender.reasons.map((reason, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-800 font-extrabold bg-white/60 px-2.5 py-1.5 rounded-lg border border-slate-200/50">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                      <span className="text-[10.5px] truncate">{reason}</span>
                    </div>
                  ))}
                </div>

                {/* Action buttons: Proposal Submit & Auto-Draft */}
                {!isOwner && (
                  <div className="pt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleAutoDraftProposal}
                      disabled={isAutoDrafting}
                      className="flex-1 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FFC107] hover:brightness-110 active:scale-95 px-4 py-2.5 font-black text-white text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Bot className={`h-4 w-4 ${isAutoDrafting ? 'animate-spin' : ''}`} />
                      <span>{isAutoDrafting ? 'Memformulasi Proposal AI...' : 'Auto-Draft Proposal AI'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowProposalForm(!showProposalForm)}
                      className="rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 px-4 py-2.5 font-black text-slate-800 text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      <FileSignature className="h-4 w-4 text-[#FF6B00]" />
                      <span>Manual Form</span>
                    </button>
                  </div>
                )}
              </div>

              {/* General Description */}
              <div className="space-y-2 text-xs">
                <h3 className="font-black text-slate-900">Deskripsi Pekerjaan Terperinci:</h3>
                <p className="text-slate-600 leading-relaxed font-bold">{selectedTender.description}</p>
              </div>

              {/* Requirements Checklist */}
              <div className="space-y-2.5 text-xs">
                <h3 className="font-black text-slate-900">Persyaratan Kualifikasi Vendor:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedTender.requirements.map((req, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-700 font-bold">
                      <CheckCircle className="h-4 w-4 text-[#22C55E] flex-shrink-0" />
                      <span>{req}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attached specifications docs */}
              <div className="space-y-2 text-xs">
                <h3 className="font-black text-slate-900">Dokumen Spesifikasi & Rencana Kerja:</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTender.documents.map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-[#FFFDF7] border border-[#FFD54F]/30 rounded-xl px-3 py-1.5 font-bold text-[#FF6B00] shadow-sm">
                      <FileText className="h-4 w-4 text-[#FF6B00]" />
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Proposal submit Modal/Sheet */}
              {showProposalForm && (
                <div className="p-5 rounded-2xl bg-[#FFFDF7]/90 border border-[#FFD54F]/40 text-xs space-y-4 shadow-inner">
                  <div className="flex items-center justify-between pb-2 border-b border-orange-100">
                    <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                      <FileSignature className="h-4 w-4 text-[#FF6B00]" />
                      <span>Kirim Proposal Vendor Formal</span>
                    </h4>
                    <button onClick={() => setShowProposalForm(false)} className="text-slate-400 hover:text-slate-600 font-black">✕</button>
                  </div>
                  
                  {proposalSuccess ? (
                    <div className="py-4 text-center space-y-2">
                      <CheckCircle2 className="h-10 w-10 text-[#22C55E] mx-auto animate-bounce" />
                      <h5 className="font-black text-slate-900">Proposal Berhasil Dikirim!</h5>
                      <p className="text-slate-500 font-bold">Proposal Anda sedang draf antrean review panitia pengadaan.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitProposal} className="space-y-3.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-500">Nilai Anggaran Penawaran (Rp)</label>
                          <input
                            type="number"
                            required
                            value={proposalBudget}
                            onChange={e => setProposalBudget(e.target.value)}
                            placeholder="Contoh: 1150000000"
                            className="w-full rounded-2xl border border-slate-200 bg-white p-2.5 outline-none focus:border-[#FFC107] font-bold text-slate-800 shadow-inner"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-slate-500">Estimasi Durasi Pengerjaan</label>
                          <input
                            type="text"
                            required
                            value={proposalTimeline}
                            onChange={e => setProposalTimeline(e.target.value)}
                            placeholder="Contoh: 45 Hari Kerja"
                            className="w-full rounded-2xl border border-slate-200 bg-white p-2.5 outline-none focus:border-[#FFC107] font-bold text-slate-800 shadow-inner"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-500">Surat Pengantar & Rencana Strategis (Auto-Draft AI Ready)</label>
                        <textarea
                          required
                          value={proposalLetter}
                          onChange={e => setProposalLetter(e.target.value)}
                          placeholder="Uraikan mengapa CV/PT Anda berkompeten, sertifikasi TKDN lokal Anda, dan jaminan purnajual..."
                          rows={6}
                          className="w-full rounded-2xl border border-slate-200 bg-white p-3 outline-none focus:border-[#FFC107] text-slate-800 font-bold shadow-inner"
                        />
                      </div>

                      <button
                        type="submit"
                        className="rounded-2xl bg-gradient-to-r from-[#FFC107] to-[#FF6B00] hover:brightness-110 active:scale-95 text-white font-black py-3 w-full shadow-md shadow-orange-500/20 cursor-pointer text-center transition-all"
                      >
                        Kirim Berkas Proposal Penawaran
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* List of proposals submitted */}
              <div className="space-y-3 pt-6 border-t border-slate-100">
                <h3 className="font-black text-slate-900 text-sm">
                  Proposals Masuk ({selectedTender.proposals.length})
                </h3>

                <div className="space-y-3">
                  {selectedTender.proposals.map(prop => (
                    <div key={prop.id} className="p-4 rounded-2xl border border-slate-200/60 bg-white/40 backdrop-blur-sm space-y-3 text-xs shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img src={prop.vendorLogo} alt="Logo" className="h-8 w-8 rounded-lg object-cover border border-slate-100" />
                          <div>
                            <h4 className="font-black text-slate-900">{prop.vendorName}</h4>
                            <p className="text-[10px] text-slate-400 font-bold">Penyelesaian: {prop.timeline}</p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase ${
                            prop.status === 'Disetujui' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                            prop.status === 'Ditolak' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {prop.status}
                          </span>
                        </div>
                      </div>

                      <p className="text-slate-600 leading-relaxed font-bold whitespace-pre-line">{prop.coverLetter}</p>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Harga Proposal:</span>
                          <p className="font-black text-[#FF6B00]">Rp{prop.budgetProposed.toLocaleString('id-ID')}</p>
                        </div>

                        {isOwner && prop.status === 'Pending' && (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleProposalStatus(prop.id, 'Disetujui')}
                              className="rounded-xl bg-[#22C55E] hover:brightness-110 text-white font-black px-3.5 py-1.5 text-[10px] cursor-pointer transition-all shadow-sm shadow-emerald-500/10"
                            >
                              Setujui
                            </button>
                            <button
                              onClick={() => handleProposalStatus(prop.id, 'Ditolak')}
                              className="rounded-xl bg-white hover:bg-red-50 text-red-600 border border-red-200 font-black px-3.5 py-1.5 text-[10px] cursor-pointer transition-all"
                            >
                              Tolak
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-slate-500 text-sm font-bold">Pilih tender di daftar kiri untuk melihat perincian kualifikasi.</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
