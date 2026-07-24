import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  Users,
  Briefcase,
  Layers,
  Database,
  Terminal,
  AlertOctagon,
  CheckCircle,
  XCircle,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Maximize
} from 'lucide-react';
import { AppDatabase, Company, User } from '../types';

interface AdminDashboardViewProps {
  db: AppDatabase;
  currentUser: User;
  onRefresh: () => void;
}

export default function AdminDashboardView({
  db,
  currentUser,
  onRefresh
}: AdminDashboardViewProps) {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [limitFreePost, setLimitFreePost] = useState(true);
  const [activeTab, setActiveTab] = useState<'companies' | 'logs' | 'settings'>('companies');

  // Guard access
  if (currentUser.role !== 'Super Admin') {
    return (
      <div className="max-w-md mx-auto text-center py-12 px-4 space-y-4 glass-card border border-slate-200 bg-white rounded-3xl shadow-lg glossy-top-highlight mt-12">
        <div className="h-14 w-14 rounded-2xl bg-orange-50 text-[#FF6B00] border border-orange-100 flex items-center justify-center mx-auto shadow-md">
          <AlertOctagon className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <h3 className="font-black text-slate-900 text-sm">Akses Terbatas Terdeteksi</h3>
          <p className="text-xs text-slate-400 font-bold leading-relaxed">
            Halaman ini eksklusif untuk peran <span className="font-black text-[#FF6B00]">Super Admin</span>. Gunakan menu simulator peran di pojok kanan atas layar Anda untuk beralih.
          </p>
        </div>
      </div>
    );
  }

  // Toggle verification status
  const handleToggleVerification = async (companyId: string) => {
    try {
      const res = await fetch('/api/admin/toggle-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId })
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Super Admin header block */}
      <div className="rounded-3xl border border-orange-200/30 bg-gradient-to-r from-slate-900 via-slate-800 to-orange-950 p-6 text-white shadow-md flex flex-col md:flex-row gap-4 items-center justify-between glossy-top-highlight animate-fade-in">
        <div className="flex items-center gap-3.5 text-xs">
          <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/15">
            <ShieldCheck className="h-6 w-6 text-[#FFC107]" />
          </div>
          <div>
            <h2 className="font-black text-base text-white tracking-tight">Enterprise Administrator Command Center</h2>
            <p className="text-orange-100/80 font-semibold mt-0.5">Tinjau kepatuhan dokumen legalitas, log sistem, dan optimalkan rule AI</p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          className="rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2.5 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <RefreshCw className="h-4 w-4 text-[#FFC107] animate-spin" />
          <span>Segarkan Log</span>
        </button>
      </div>

      {/* Grid count cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-xs">
        
        <div className="rounded-3xl border border-slate-200/60 bg-white p-5 shadow-md space-y-1.5 glass-card glossy-top-highlight">
          <div className="flex items-center justify-between text-slate-400 font-black uppercase tracking-wider">
            <span>Total Anggota</span>
            <Users className="h-4.5 w-4.5 text-[#FFC107]" />
          </div>
          <p className="text-xl font-black text-gray-900">{db.users.length} Akun</p>
          <p className="text-[10px] text-slate-400 font-bold">Tersebar di 37 Provinsi</p>
        </div>

        <div className="rounded-3xl border border-slate-200/60 bg-white p-5 shadow-md space-y-1.5 glass-card glossy-top-highlight">
          <div className="flex items-center justify-between text-slate-400 font-black uppercase tracking-wider">
            <span>Perusahaan Terdaftar</span>
            <Building2 className="h-4.5 w-4.5 text-[#FF6B00]" />
          </div>
          <p className="text-xl font-black text-slate-900">{db.companies.length} Entitas</p>
          <p className="text-[10px] text-slate-400 font-bold">BUMN, Swasta, Kontraktor, UMKM</p>
        </div>

        <div className="rounded-3xl border border-slate-200/60 bg-white p-5 shadow-md space-y-1.5 glass-card glossy-top-highlight">
          <div className="flex items-center justify-between text-slate-400 font-black uppercase tracking-wider">
            <span>Barang B2B Terjual</span>
            <Layers className="h-4.5 w-4.5 text-amber-500" />
          </div>
          <p className="text-xl font-black text-slate-900">{db.marketplaceProducts.length} Katalog</p>
          <p className="text-[10px] text-slate-400 font-bold">Mesin, material, logistik, jasa</p>
        </div>

        <div className="rounded-3xl border border-slate-200/60 bg-white p-5 shadow-md space-y-1.5 glass-card glossy-top-highlight">
          <div className="flex items-center justify-between text-slate-400 font-black uppercase tracking-wider">
            <span>Penyimpanan Lokal</span>
            <Database className="h-4.5 w-4.5 text-amber-600" />
          </div>
          <p className="text-xl font-black text-slate-900">JSON OK</p>
          <p className="text-[10px] text-slate-400 font-bold">File: /data/db.json</p>
        </div>

      </div>

      {/* Navigation Inside Admin Dashboard */}
      <div className="flex border-b border-slate-100 text-xs font-black gap-4 pt-2">
        <button
          onClick={() => setActiveTab('companies')}
          className={`pb-2.5 transition-all cursor-pointer border-b-2 ${
            activeTab === 'companies' ? 'text-[#FF6B00] border-[#FF6B00] font-black' : 'text-slate-400 border-transparent hover:text-slate-600'
          }`}
        >
          Kepatuhan Verifikasi NIB ({db.companies.length})
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-2.5 transition-all cursor-pointer border-b-2 ${
            activeTab === 'logs' ? 'text-[#FF6B00] border-[#FF6B00] font-black' : 'text-slate-400 border-transparent hover:text-slate-600'
          }`}
        >
          Sistem Monitor Log
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-2.5 transition-all cursor-pointer border-b-2 ${
            activeTab === 'settings' ? 'text-[#FF6B00] border-[#FF6B00] font-black' : 'text-slate-400 border-transparent hover:text-slate-600'
          }`}
        >
          Konfigurasi Aturan
        </button>
      </div>

      {/* Tabs panels render */}
      {activeTab === 'companies' && (
        <div className="rounded-3xl border border-slate-200/60 bg-white p-5 shadow-md overflow-hidden text-xs glass-card glossy-top-highlight">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-black text-[10px] uppercase">
                  <th className="pb-3">Logo & Nama Perusahaan</th>
                  <th className="pb-3">Nomor NIB Legalitas</th>
                  <th className="pb-3">Provinsi / Sektor</th>
                  <th className="pb-3">Kepatuhan Hukum</th>
                  <th className="pb-3 text-right">Tindakan Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
                {db.companies.map(comp => (
                  <tr key={comp.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <img src={comp.logo} alt="Logo" className="h-9 w-9 rounded-xl object-cover border border-slate-200 shadow-sm" />
                        <div>
                          <p className="font-black text-slate-900">{comp.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{comp.employeesCount} Karyawan</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 font-mono font-black text-slate-800">
                      {comp.legality.nib}
                    </td>
                    <td className="py-4 font-bold text-slate-500">
                      {comp.address.province} • {comp.sector}
                    </td>
                    <td className="py-4 text-xs">
                      {comp.isVerified ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[9px] font-black text-emerald-700 border border-emerald-100">
                          <CheckCircle className="h-3 w-3 text-emerald-600" />
                          <span>TERVERIFIKASI</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-[9px] font-black text-red-700 border border-red-100 animate-pulse">
                          <XCircle className="h-3 w-3 text-red-600" />
                          <span>PENDING NIB</span>
                        </span>
                      )}
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => handleToggleVerification(comp.id)}
                        className={`rounded-xl px-3.5 py-2 text-[10px] font-black transition-all cursor-pointer shadow-sm active:scale-95 border ${
                          comp.isVerified
                            ? 'bg-red-50 hover:bg-red-100 text-red-600 border-red-100'
                            : 'bg-gradient-to-r from-[#FFC107] to-[#FF6B00] hover:brightness-110 text-white border-none shadow-orange-500/10'
                        }`}
                      >
                        {comp.isVerified ? 'Batalkan NIB' : 'Sahkan Kepatuhan'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}      {activeTab === 'logs' && (
        <div className="rounded-3xl border border-slate-800 bg-slate-950/95 p-5 shadow-2xl text-xs space-y-3 font-mono text-slate-300">
          <div className="flex items-center justify-between pb-2 border-b border-slate-900 text-slate-500 font-black text-[10px]">
            <p className="flex items-center gap-1.5">
              <Terminal className="h-4 w-4 text-[#FFC107]" />
              SISTEM CONSOLE LOG - TINGKAT ENTIRE BCI
            </p>
            <span className="text-[#FF6B00] animate-pulse">● LIVE STREAM</span>
          </div>

          <div className="space-y-1.5 text-[11px] leading-relaxed max-h-72 overflow-y-auto">
            <p className="text-slate-500">[2026-07-16 13:14:01] System booted. Ports 3000 mapped for ingress gateway.</p>
            <p className="text-emerald-400 font-black">[2026-07-16 13:14:02] Vercel Serverless Ready: Route /api/(.*) {"->"} api/index.ts</p>
            <p className="text-[#FFC107] font-black">[2026-07-16 13:14:05] GEMINI SDK (gemini-2.5-flash) - Active on Vercel Serverless Functions.</p>
            <p className="text-blue-400">[2026-07-16 13:14:12] Router: Registered API endpoint /api/ai/matching</p>
            <p className="text-blue-400">[2026-07-16 13:14:15] Router: Registered API endpoint /api/ai/smart-tender-match</p>
            <p className="text-blue-400">[2026-07-16 13:14:18] Router: Registered API endpoint /api/ai/assistant</p>
            <p className="text-slate-400">[2026-07-16 13:21:44] Chat: Sent message usr_1_comp_telkom to CV Maju Bersama.</p>
            <p className="text-[#FF6B00] font-black">[2026-07-16 13:22:15] Security Audit: Legality verification compliance check requested.</p>
            <p className="text-emerald-400">[2026-07-16 13:25:31] AI Grounding Engine: Recalculated 3 matrix scores successfully in 2.1s.</p>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-md space-y-5 text-xs glass-card glossy-top-highlight animate-fade-in">
          <h3 className="font-black text-slate-900 text-sm">Pengaturan Sistem Operator BCI</h3>

          <div className="space-y-4">
            
            <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
              <div>
                <p className="font-black text-slate-800">Mode Pemeliharaan (Maintenance Mode)</p>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">Tolak semua lalu lintas API umum untuk keperluan optimasi basis data.</p>
              </div>
              <button onClick={() => setMaintenanceMode(!maintenanceMode)} className="cursor-pointer transition-transform active:scale-90">
                {maintenanceMode ? (
                  <ToggleRight className="h-8 w-8 text-[#FF6B00]" />
                ) : (
                  <ToggleLeft className="h-8 w-8 text-slate-300" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
              <div>
                <p className="font-black text-slate-800">Batasi Posting bagi Anggota Free</p>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">Batas maksimal posting bagi akun Free adalah 3 postingan per hari.</p>
              </div>
              <button onClick={() => setLimitFreePost(!limitFreePost)} className="cursor-pointer transition-transform active:scale-90">
                {limitFreePost ? (
                  <ToggleRight className="h-8 w-8 text-[#FF6B00]" />
                ) : (
                  <ToggleLeft className="h-8 w-8 text-slate-300" />
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
