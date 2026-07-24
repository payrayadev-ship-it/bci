import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  Loader2,
  ChevronRight,
  TrendingUp,
  MapPin,
  CheckCircle,
  Briefcase,
  Star,
  Users,
  Target
} from 'lucide-react';
import { AppDatabase, Company, User } from '../types';

interface MatchingViewProps {
  db: AppDatabase;
  currentUser: User;
  onViewChange: (view: string) => void;
  onSetPrefilledChat: (partnerId: string, message: string) => void;
}

export interface MatchingResult {
  company: Company;
  matchPercentage: number;
  reason: string;
}

export default function MatchingView({
  db,
  currentUser,
  onViewChange,
  onSetPrefilledChat
}: MatchingViewProps) {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(db.companies[0]?.id || '');
  const [targetSector, setTargetSector] = useState('Semua Sektor');
  const [targetProvince, setTargetProvince] = useState('Semua Provinsi');
  
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<MatchingResult[]>([]);
  const [isGroundedAI, setIsGroundedAI] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  const currentCompany = db.companies.find(c => c.id === selectedCompanyId) || db.companies[0];

  const handleRunMatching = async () => {
    if (!selectedCompanyId) return;
    setLoading(true);
    setWarningMessage('');
    try {
      const response = await fetch('/api/ai/matching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: selectedCompanyId,
          targetSector,
          targetProvince
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMatches(data.matches || []);
        setIsGroundedAI(!!data.aiGrounded);
        if (data.message) {
          setWarningMessage(data.message);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Run automatically on first render
  useEffect(() => {
    handleRunMatching();
  }, [selectedCompanyId]);

  // Handle Match Chat Action
  const handleConnectWithMatch = (matchedComp: Company, score: number) => {
    const rep = db.users.find(u => u.companyId === matchedComp.id) || db.users[0];
    const prefilledMsg = `Halo ${matchedComp.name}! BCI Business Matching AI mencocokkan kemitraan kita dengan nilai kecocokan tinggi sebesar ${score}%. Saya ingin mendiskusikan peluang aliansi strategis di bidang ${currentCompany.sector}.`;
    onSetPrefilledChat(rep.id, prefilledMsg);
    onViewChange('chat');
  };

  return (
    <div className="space-y-6">
      
      {/* Intro visual banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FFD54F] via-[#FFC107] to-[#FF6B00] p-6 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mr-10 -mt-10 h-40 w-40 rounded-full bg-white/10 blur-xl"></div>
        <div className="absolute bottom-0 left-0 -ml-10 -mb-10 h-40 w-40 rounded-full bg-white/5 blur-xl"></div>
        <div className="relative flex flex-col md:flex-row gap-4 items-center">
          <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center text-[#FF6B00] flex-shrink-0 shadow-lg border border-[#FFD54F]">
            <Bot className="h-7 w-7" />
          </div>
          <div>
            <h2 className="font-black text-white text-lg flex items-center gap-1.5 drop-shadow-sm">
              BCI Cognitive Business Matching AI
              <span className="text-[10px] bg-white text-[#FF6B00] px-2 py-0.5 rounded-full font-black shadow-sm">V2.0</span>
            </h2>
            <p className="text-xs text-white/95 max-w-2xl leading-relaxed mt-0.5 font-bold">
              Teknologi AI kognitif menyaring data kualitatif dan kuantitatif (legalitas NIB, kedekatan logistik provinsi, kecocokan bidang usaha, dan rekam jejak portofolio) untuk merekomendasikan kemitraan ideal dengan risiko terminasi terendah.
            </p>
          </div>
        </div>
      </div>

      {/* Parameter Settings Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white/50 border border-slate-200 backdrop-blur-lg p-5 rounded-3xl shadow-md text-xs">
        
        {/* Match Target Company */}
        <div className="space-y-1">
          <label className="font-bold text-slate-500">Kemitraan Untuk Perusahaan:</label>
          <select
            value={selectedCompanyId}
            onChange={e => setSelectedCompanyId(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white/60 p-2.5 outline-none font-bold text-slate-800 focus:border-[#FFC107] focus:bg-white backdrop-blur-sm transition-all shadow-inner"
          >
            {db.companies.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Sector Target */}
        <div className="space-y-1">
          <label className="font-bold text-slate-500">Filter Sektor Target:</label>
          <select
            value={targetSector}
            onChange={e => setTargetSector(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white/60 p-2.5 outline-none font-bold text-slate-800 focus:border-[#FFC107] focus:bg-white backdrop-blur-sm transition-all shadow-inner"
          >
            <option value="Semua Sektor">Semua Sektor</option>
            <option value="Telekomunikasi">Telekomunikasi & Teknologi</option>
            <option value="Investasi">Investasi & Modal Ventura</option>
            <option value="Manufaktur">Manufaktur & Alat Berat</option>
          </select>
        </div>

        {/* Province Target */}
        <div className="space-y-1">
          <label className="font-bold text-slate-500">Filter Lokasi Provinsi:</label>
          <select
            value={targetProvince}
            onChange={e => setTargetProvince(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white/60 p-2.5 outline-none font-bold text-slate-800 focus:border-[#FFC107] focus:bg-white backdrop-blur-sm transition-all shadow-inner"
          >
            <option value="Semua Provinsi">Semua Provinsi</option>
            <option value="DKI Jakarta">DKI Jakarta</option>
            <option value="Jawa Timur">Jawa Timur</option>
          </select>
        </div>

        {/* Action Button */}
        <div className="flex items-end">
          <button
            onClick={handleRunMatching}
            disabled={loading}
            className="w-full flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-[#FFC107] to-[#FF6B00] hover:brightness-110 active:scale-95 py-3 font-extrabold text-white shadow-md shadow-orange-500/20 cursor-pointer transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Menganalisis...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Jalankan AI Matching</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Local Rule Engine/Telemetry warning if any */}
      {warningMessage && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 leading-relaxed font-bold shadow-inner">
          ⚠️ {warningMessage}
        </div>
      )}

      {/* Matches List Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 bg-white/60 border border-slate-200 backdrop-blur-lg rounded-3xl shadow-md">
            <Loader2 className="h-8 w-8 text-[#FF6B00] animate-spin mx-auto mb-2" />
            <p className="text-sm font-black text-slate-800">Menjalankan Komputasi Matriks AI...</p>
            <p className="text-xs text-slate-500 mt-1 font-bold">Mengalkulasi kecocokan legalitas NIB, letak kota, dan sinergi proyek</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-10 bg-white/60 border border-slate-200 backdrop-blur-lg rounded-3xl shadow-md">
            <p className="text-slate-500 text-sm font-bold">Tidak ada kecocokan terdeteksi untuk kriteria ini.</p>
          </div>
        ) : (
          matches.map(({ company, matchPercentage, reason }) => {
            return (
              <div
                key={company.id}
                className="glass-card rounded-3xl p-6 shadow-md hover:shadow-lg transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6 glossy-top-highlight"
              >
                {/* Left block: Score Gauge and Profile */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 flex-1">
                  
                  {/* Gauge */}
                  <div className="relative flex items-center justify-center h-20 w-20 rounded-full bg-orange-500/10 flex-shrink-0 border border-white">
                    <svg className="absolute transform -rotate-90 w-20 h-20">
                      <circle
                        cx="40"
                        cy="40"
                        r="34"
                        stroke="rgba(255, 107, 0, 0.1)"
                        strokeWidth="5"
                        fill="transparent"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="34"
                        stroke="#FF6B00"
                        strokeWidth="5"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 34}
                        strokeDashoffset={2 * Math.PI * 34 * (1 - matchPercentage / 100)}
                      />
                    </svg>
                    <div className="text-center relative">
                      <span className="text-base font-black text-[#FF6B00]">{matchPercentage}%</span>
                      <p className="text-[7px] text-[#FFB300] font-black uppercase tracking-wider">COGNITIVE</p>
                    </div>
                  </div>

                  {/* Profile texts */}
                  <div className="space-y-2 text-xs flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-black text-slate-900 text-sm tracking-tight">{company.name}</h4>
                      {company.isVerified && (
                        <span className="flex items-center gap-0.5 rounded-full bg-[#FF6B00]/10 border border-[#FFD54F]/50 px-2 py-0.5 text-[9px] font-black text-[#FF6B00] shadow-sm">
                          <CheckCircle className="h-2.5 w-2.5 text-[#FF6B00]" /> Verified
                        </span>
                      )}
                    </div>
                    
                    <p className="font-extrabold text-slate-400 uppercase tracking-wider text-[9px]">
                      Sektor: {company.sector} • Lokasi: {company.address.city}, {company.address.province}
                    </p>

                    {/* AI reasoning paragraph */}
                    <div className="p-3.5 rounded-2xl bg-[#FFFDF7] border border-[#FFD54F]/30 shadow-inner">
                      <p className="font-black text-[#FF6B00] text-[10px] flex items-center gap-1 mb-1">
                        <Sparkles className="h-3 w-3 text-[#FF6B00]" /> Analisis Sinergi Kemitraan:
                      </p>
                      <p className="text-slate-700 font-bold leading-relaxed">{reason}</p>
                    </div>
                  </div>

                </div>

                {/* Right block: Action connect */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                  <div className="rounded-2xl bg-[#FFFDF7]/60 p-3 border border-[#FFD54F]/25 text-right text-xs space-y-1">
                    <div className="flex items-center justify-between sm:justify-end gap-1 text-[10px] text-slate-500 font-bold">
                      <Users className="h-3 w-3" />
                      <span>{company.followersCount} Followers</span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-1 text-[10px] text-amber-600 font-bold">
                      <Star className="h-3 w-3 fill-amber-500 stroke-amber-500" />
                      <span>{company.rating} Rating</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleConnectWithMatch(company, matchPercentage)}
                    className="rounded-2xl bg-gradient-to-r from-[#FFC107] to-[#FF6B00] hover:brightness-110 active:scale-95 px-4 py-3 font-black text-white text-xs shadow-md shadow-orange-500/20 cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>Hubungi Kemitraan</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
