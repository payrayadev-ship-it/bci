import React, { useState } from 'react';
import {
  Sparkles,
  Award,
  CheckCircle,
  TrendingUp,
  Briefcase,
  Users,
  CheckCircle2,
  Lock,
  ChevronRight,
  UserCheck,
  HelpCircle,
  FileText,
  Shield
} from 'lucide-react';
import { User } from '../types';

interface MembershipViewProps {
  currentUser: User;
  onRefresh: () => void;
  onViewChange?: (view: string) => void;
}

export default function MembershipView({ currentUser, onRefresh, onViewChange }: MembershipViewProps) {
  const [successPlan, setSuccessPlan] = useState<string | null>(null);

  // Upgrade Plan action simulation
  const handleUpgradePlan = (plan: string) => {
    setSuccessPlan(plan);
    setTimeout(() => {
      setSuccessPlan(null);
    }, 3000);
  };

  const currentTier = currentUser.role === 'Super Admin' || currentUser.role === 'Perusahaan' ? 'Enterprise' : 'Pro';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Intro banner */}
      <div className="text-center py-6 space-y-2">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Akselerasikan Pertumbuhan Bisnis Anda Bersama Keanggotaan BCI
        </h2>
        <p className="text-xs text-slate-500 max-w-2xl mx-auto leading-relaxed font-semibold">
          Pilih paket keanggotaan premium untuk membuka prioritas matching AI kognitif, proposal otomatis tanpa batas, verifikasi berkas legalitas kilat, serta pendanaan khusus investor.
        </p>
      </div>

      {successPlan && (
        <div className="rounded-2xl border border-[#FFC107]/40 bg-[#FFFDF7] p-4 text-center text-xs text-[#FF6B00] font-black animate-bounce max-w-md mx-auto shadow-sm">
          🎉 Transaksi Keanggotaan Berhasil! Anda resmi ditingkatkan ke tier <span className="text-[#FF6B00] font-black">{successPlan}</span>. Fitur eksklusif siap digunakan.
        </div>
      )}

      {/* Pricing plans cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch text-xs">
        
        {/* Tier 1: Free */}
        <div className="glass-card rounded-3xl border border-slate-200/60 bg-white p-6 shadow-md flex flex-col justify-between space-y-6 relative overflow-hidden glossy-top-highlight">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">UMKM STARTER</span>
              <h3 className="font-black text-slate-900 text-lg mt-1">Sinergi Free</h3>
              <p className="text-slate-400 mt-1 font-semibold">Bagi pemula dan profesional independen Indonesia</p>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-2xl font-black text-slate-900">Rp0</span>
              <span className="text-slate-400 font-bold"> / selamanya</span>
            </div>

            <div className="space-y-2.5 font-bold text-slate-500">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <span>3 Postingan Feed per hari</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <span>Akses forum diskusi nasional</span>
              </div>
              <div className="flex items-start gap-2 line-through text-slate-300">
                <Lock className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                <span>Verifikasi kepatuhan hukum NIB</span>
              </div>
              <div className="flex items-start gap-2 line-through text-slate-300">
                <Lock className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                <span>Matching AI dengan Investor premium</span>
              </div>
            </div>
          </div>

          <button
            disabled
            className="w-full rounded-2xl bg-slate-100 py-3 font-black text-slate-400 cursor-not-allowed text-center"
          >
            Tier Aktif Anda
          </button>
        </div>

        {/* Tier 2: Pro */}
        <div className="glass-card rounded-3xl border border-slate-200/60 bg-gradient-to-b from-orange-50/20 via-white to-white p-6 shadow-lg flex flex-col justify-between space-y-6 relative overflow-hidden glossy-top-highlight">
          <div className="absolute top-3 right-3 rounded-xl bg-gradient-to-r from-[#FFC107] to-[#FF6B00] text-white px-3 py-1 text-[9px] font-black shadow-md shadow-orange-500/10">Terpopuler</div>
          
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-black text-[#FF6B00] uppercase tracking-widest">UMKM UNGGULAN</span>
              <h3 className="font-black text-slate-900 text-lg mt-1">BCI Pro Sinergi</h3>
              <p className="text-slate-400 mt-1 font-semibold">Sempurna untuk startup, supplier berkembang, & kontraktor nasional</p>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-2xl font-black text-slate-900">Rp499k</span>
              <span className="text-slate-400 font-bold"> / bulan</span>
            </div>

            <div className="space-y-2.5 font-bold text-slate-600">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#FF6B00] mt-0.5 flex-shrink-0" />
                <span>Feed tanpa batas postingan</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#FF6B00] mt-0.5 flex-shrink-0" />
                <span>Akses prioritas B2B Marketplace</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#FF6B00] mt-0.5 flex-shrink-0" />
                <span>Badge Prioritas Matching AI kognitif</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#FF6B00] mt-0.5 flex-shrink-0" />
                <span>Pembuat Proposal AI otomatis (30 proposal)</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleUpgradePlan('Pro Sinergi')}
            className="w-full rounded-2xl bg-gradient-to-r from-[#FFC107] to-[#FF6B00] hover:brightness-110 active:scale-95 py-3 font-black text-white shadow-md shadow-orange-500/20 cursor-pointer text-center transition-all text-xs"
          >
            Tingkatkan Ke Pro
          </button>
        </div>

        {/* Tier 3: Enterprise */}
        <div className="glass-card rounded-3xl border border-[#FFD54F]/35 bg-gradient-to-b from-[#FFFDF7] via-white to-white p-6 shadow-lg flex flex-col justify-between space-y-6 relative overflow-hidden glossy-top-highlight">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-black text-[#FF6B00] uppercase tracking-widest">KORPORASI & INVESTOR</span>
              <h3 className="font-black text-slate-900 text-lg mt-1">BCI Enterprise</h3>
              <p className="text-slate-400 mt-1 font-semibold">Untuk instansi pemerintah, BUMN, investor utama, & kontraktor B2B skala besar</p>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-2xl font-black text-slate-900">Rp2,4jt</span>
              <span className="text-slate-400 font-bold"> / bulan</span>
            </div>

            <div className="space-y-2.5 font-bold text-slate-600">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#FFC107] mt-0.5 flex-shrink-0" />
                <span>Semua manfaat tingkat Pro Sinergi</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#FFC107] mt-0.5 flex-shrink-0" />
                <span>Verifikasi kepatuhan hukum NIB instan</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#FFC107] mt-0.5 flex-shrink-0" />
                <span>Pencocokan AI kognitif dengan investor khusus</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#FFC107] mt-0.5 flex-shrink-0" />
                <span>Sesi video meeting & share screen kapasitas besar</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleUpgradePlan('Enterprise')}
            className="w-full rounded-2xl bg-gradient-to-r from-[#FFD54F] to-[#FFB300] hover:brightness-110 active:scale-95 py-3 font-black text-white shadow-md shadow-orange-500/10 cursor-pointer text-center transition-all text-xs"
          >
            Dapatkan Enterprise
          </button>
        </div>

      </div>

      {/* Pusat Bantuan & Legalitas Block */}
      <div className="glass-card rounded-3xl border border-slate-200/60 p-6 bg-white shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <HelpCircle className="h-4.5 w-4.5 text-[#FF6B00]" />
              <span>Pusat Bantuan & Legalitas BCI</span>
            </h3>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Informasi panduan penggunaan, syarat & ketentuan layanan, serta perlindungan data privasi
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <button
            onClick={() => onViewChange?.('faq')}
            className="p-4 bg-orange-50/40 hover:bg-orange-50 border border-orange-100/80 rounded-2xl flex items-center justify-between group active:scale-98 transition-all cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#FF6B00] text-white shadow-sm">
                <HelpCircle className="h-4 w-4" />
              </div>
              <div>
                <p className="font-black text-slate-900 group-hover:text-[#FF6B00] transition-colors">Pusat Bantuan</p>
                <p className="text-[10px] text-slate-400 font-bold">FAQ & Panduan BCI</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#FF6B00] transition-colors" />
          </button>

          <button
            onClick={() => onViewChange?.('legal')}
            className="p-4 bg-amber-50/40 hover:bg-amber-50 border border-amber-100/80 rounded-2xl flex items-center justify-between group active:scale-98 transition-all cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-sm">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <p className="font-black text-slate-900 group-hover:text-amber-600 transition-colors">Persyaratan Layanan</p>
                <p className="text-[10px] text-slate-400 font-bold">Aturan & Ketentuan B2B</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-amber-600 transition-colors" />
          </button>

          <button
            onClick={() => onViewChange?.('legal')}
            className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200/70 rounded-2xl flex items-center justify-between group active:scale-98 transition-all cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-slate-800 text-white shadow-sm">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <p className="font-black text-slate-900 group-hover:text-slate-700 transition-colors">Kebijakan Privasi</p>
                <p className="text-[10px] text-slate-400 font-bold">Perlindungan Data NIB</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-700 transition-colors" />
          </button>
        </div>
      </div>

    </div>
  );
}
