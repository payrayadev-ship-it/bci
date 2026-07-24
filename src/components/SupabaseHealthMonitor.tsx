import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Database,
  Server,
  Zap,
  Clock,
  ShieldCheck,
  BarChart3,
  Terminal,
  Play,
  Check,
  AlertCircle
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface PingRecord {
  id: string;
  time: string;
  timestamp: number;
  supabaseLatency: number | null;
  supabaseStatus: number;
  supabaseOk: boolean;
  apiLatency: number | null;
  apiStatus: number;
  apiOk: boolean;
  errorMessage?: string;
}

interface DiagnosticStep {
  name: string;
  status: 'idle' | 'running' | 'success' | 'error';
  message: string;
  durationMs?: number;
}

export default function SupabaseHealthMonitor() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshIntervalSec, setRefreshIntervalSec] = useState(5);
  const [history, setHistory] = useState<PingRecord[]>([]);
  const [isPinging, setIsPinging] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'diagnostics' | 'logs'>('overview');

  // Diagnostic suite state
  const [isRunningDiag, setIsRunningDiag] = useState(false);
  const [diagSteps, setDiagSteps] = useState<DiagnosticStep[]>([
    { name: 'Konfigurasi Environment Keys', status: 'idle', message: 'Belum diuji' },
    { name: 'Koneksi REST Supabase Ping', status: 'idle', message: 'Belum diuji' },
    { name: 'Supabase Auth Handshake', status: 'idle', message: 'Belum diuji' },
    { name: 'Backend Express /api/db Proxy', status: 'idle', message: 'Belum diuji' },
    { name: 'Row Level Security (RLS) Query Check', status: 'idle', message: 'Belum diuji' },
  ]);

  const historyRef = useRef(history);
  historyRef.current = history;

  const performPing = async () => {
    setIsPinging(true);
    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

    let supabaseLatency: number | null = null;
    let supabaseStatus = 0;
    let supabaseOk = false;
    let errorDetail = '';

    // 1. Supabase Ping
    const startSupa = performance.now();
    try {
      // Light query to verify connection
      const { status, error } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
      const endSupa = performance.now();
      supabaseLatency = Math.round(endSupa - startSupa);
      supabaseStatus = status || (error ? 500 : 200);
      supabaseOk = !error && supabaseStatus < 400;

      if (error) {
        errorDetail = `Supabase error: ${error.message} (${error.code || 'ERR'})`;
      }
    } catch (err: any) {
      const endSupa = performance.now();
      supabaseLatency = Math.round(endSupa - startSupa);
      supabaseStatus = 500;
      supabaseOk = false;
      errorDetail = `Supabase exception: ${err.message || 'Network error'}`;
    }

    // 2. Backend Express API Ping (/api/db)
    let apiLatency: number | null = null;
    let apiStatus = 0;
    let apiOk = false;

    const startApi = performance.now();
    try {
      const res = await fetch('/api/db', { method: 'GET', cache: 'no-store' });
      const endApi = performance.now();
      apiLatency = Math.round(endApi - startApi);
      apiStatus = res.status;
      apiOk = res.ok;

      if (!res.ok && !errorDetail) {
        errorDetail = `Backend /api/db HTTP ${res.status}`;
      }
    } catch (err: any) {
      const endApi = performance.now();
      apiLatency = Math.round(endApi - startApi);
      apiStatus = 500;
      apiOk = false;
      if (!errorDetail) {
        errorDetail = `Backend /api/db exception: ${err.message || 'Fetch error'}`;
      }
    }

    const newRecord: PingRecord = {
      id: Math.random().toString(36).substring(2, 9),
      time: timeStr,
      timestamp: Date.now(),
      supabaseLatency,
      supabaseStatus,
      supabaseOk,
      apiLatency,
      apiStatus,
      apiOk,
      errorMessage: errorDetail || undefined
    };

    setHistory(prev => [...prev.slice(-29), newRecord]);
    setIsPinging(false);
  };

  // Initial ping and interval set up
  useEffect(() => {
    performPing();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      performPing();
    }, refreshIntervalSec * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshIntervalSec]);

  // Derived metrics
  const totalPings = history.length;
  const supaSuccessCount = history.filter(h => h.supabaseOk).length;
  const supaSuccessRate = totalPings > 0 ? Math.round((supaSuccessCount / totalPings) * 100) : 100;

  const validSupaLatencies = history.filter(h => h.supabaseLatency !== null).map(h => h.supabaseLatency as number);
  const avgSupaLatency = validSupaLatencies.length > 0 
    ? Math.round(validSupaLatencies.reduce((a, b) => a + b, 0) / validSupaLatencies.length) 
    : 0;

  const latestSupaLatency = history.length > 0 ? history[history.length - 1].supabaseLatency : 0;
  const latestSupaOk = history.length > 0 ? history[history.length - 1].supabaseOk : true;
  const latestSupaStatus = history.length > 0 ? history[history.length - 1].supabaseStatus : 200;

  const apiSuccessCount = history.filter(h => h.apiOk).length;
  const apiSuccessRate = totalPings > 0 ? Math.round((apiSuccessCount / totalPings) * 100) : 100;
  const validApiLatencies = history.filter(h => h.apiLatency !== null).map(h => h.apiLatency as number);
  const avgApiLatency = validApiLatencies.length > 0 
    ? Math.round(validApiLatencies.reduce((a, b) => a + b, 0) / validApiLatencies.length) 
    : 0;

  const hasStatus500 = history.some(h => h.supabaseStatus >= 500 || h.apiStatus >= 500);

  // Run full diagnostic suite
  const runDiagnostics = async () => {
    setIsRunningDiag(true);

    // Step 1: Env Check
    setDiagSteps(prev => prev.map((s, idx) => idx === 0 ? { ...s, status: 'running', message: 'Mengecek variabel VITE_SUPABASE_URL & ANON_KEY...' } : s));
    await new Promise(r => setTimeout(r, 400));
    const envOk = isSupabaseConfigured;
    setDiagSteps(prev => prev.map((s, idx) => idx === 0 ? { 
      ...s, 
      status: envOk ? 'success' : 'error', 
      message: envOk ? 'URL Supabase & Anon Key terkonfigurasi dengan benar' : 'Variabel environment Supabase belum lengkap' 
    } : s));

    // Step 2: Supabase REST Ping
    setDiagSteps(prev => prev.map((s, idx) => idx === 1 ? { ...s, status: 'running', message: 'Menguji konektivitas REST API Supabase...' } : s));
    const tStart2 = performance.now();
    try {
      const { status, error } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
      const dur2 = Math.round(performance.now() - tStart2);
      setDiagSteps(prev => prev.map((s, idx) => idx === 1 ? { 
        ...s, 
        status: !error && status < 400 ? 'success' : 'error', 
        durationMs: dur2,
        message: !error ? `REST API merespons OK (${dur2}ms)` : `Gagal: ${error.message} (HTTP ${status || 500})` 
      } : s));
    } catch (e: any) {
      setDiagSteps(prev => prev.map((s, idx) => idx === 1 ? { ...s, status: 'error', message: `Exception: ${e.message}` } : s));
    }

    // Step 3: Supabase Auth Handshake
    setDiagSteps(prev => prev.map((s, idx) => idx === 2 ? { ...s, status: 'running', message: 'Memeriksa sesi auth Supabase...' } : s));
    const tStart3 = performance.now();
    try {
      const { data, error } = await supabase.auth.getSession();
      const dur3 = Math.round(performance.now() - tStart3);
      setDiagSteps(prev => prev.map((s, idx) => idx === 2 ? { 
        ...s, 
        status: !error ? 'success' : 'error', 
        durationMs: dur3,
        message: !error ? `Auth Service aktif. User Session: ${data.session ? 'Terautentikasi' : 'Anonim'}` : `Auth Error: ${error.message}` 
      } : s));
    } catch (e: any) {
      setDiagSteps(prev => prev.map((s, idx) => idx === 2 ? { ...s, status: 'error', message: `Exception: ${e.message}` } : s));
    }

    // Step 4: Express API DB Proxy
    setDiagSteps(prev => prev.map((s, idx) => idx === 3 ? { ...s, status: 'running', message: 'Memeriksa backend endpoint /api/db...' } : s));
    const tStart4 = performance.now();
    try {
      const res = await fetch('/api/db', { cache: 'no-store' });
      const dur4 = Math.round(performance.now() - tStart4);
      setDiagSteps(prev => prev.map((s, idx) => idx === 3 ? { 
        ...s, 
        status: res.ok ? 'success' : 'error', 
        durationMs: dur4,
        message: res.ok ? `Backend /api/db merespons HTTP ${res.status} (${dur4}ms)` : `Backend /api/db mengalami HTTP ${res.status}` 
      } : s));
    } catch (e: any) {
      setDiagSteps(prev => prev.map((s, idx) => idx === 3 ? { ...s, status: 'error', message: `Fetch Error: ${e.message}` } : s));
    }

    // Step 5: Row Level Security Query
    setDiagSteps(prev => prev.map((s, idx) => idx === 4 ? { ...s, status: 'running', message: 'Menguji tabel public.profiles RLS...' } : s));
    const tStart5 = performance.now();
    try {
      const { data, error } = await supabase.from('profiles').select('id, email, role').limit(1);
      const dur5 = Math.round(performance.now() - tStart5);
      setDiagSteps(prev => prev.map((s, idx) => idx === 4 ? { 
        ...s, 
        status: !error ? 'success' : 'error', 
        durationMs: dur5,
        message: !error ? `Tabel profiles RLS berfungsi (${data?.length || 0} baris dibaca)` : `RLS Check gagal: ${error.message}` 
      } : s));
    } catch (e: any) {
      setDiagSteps(prev => prev.map((s, idx) => idx === 4 ? { ...s, status: 'error', message: `RLS Check Exception: ${e.message}` } : s));
    }

    setIsRunningDiag(false);
  };

  return (
    <div className="glass-card rounded-3xl p-6 shadow-xl border border-amber-500/20 bg-slate-900/95 text-white">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 p-3 text-emerald-400 border border-emerald-500/30 shadow-inner">
              <Activity className="h-6 w-6 animate-pulse" />
            </div>
            <span className={`absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-slate-900 ${
              latestSupaOk ? 'bg-emerald-500 shadow-[0_0_8px_#10B981]' : 'bg-red-500 shadow-[0_0_8px_#EF4444]'
            }`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight text-white">Monitor Kesehatan Supabase & Server</h2>
              <span className="rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 border border-emerald-500/20">
                Real-Time Diagnostics
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Melacak latensi koneksi, rasio sukses, dan pencegahan otomatis error HTTP 500
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => performPing()}
            disabled={isPinging}
            className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-xs font-bold px-3 py-2 text-slate-200 transition-all border border-slate-700 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isPinging ? 'animate-spin text-amber-400' : ''}`} />
            <span>Ping Sekarang</span>
          </button>

          <div className="flex items-center gap-2 rounded-xl bg-slate-800/80 px-3 py-1.5 border border-slate-700/80 text-xs text-slate-300">
            <span className="font-semibold text-slate-400">Auto:</span>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`font-black text-xs px-2 py-0.5 rounded-md transition-colors ${
                autoRefresh ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700 text-slate-400'
              }`}
            >
              {autoRefresh ? 'ON' : 'OFF'}
            </button>
            {autoRefresh && (
              <select
                value={refreshIntervalSec}
                onChange={e => setRefreshIntervalSec(Number(e.target.value))}
                className="bg-slate-900 text-slate-200 text-xs rounded border border-slate-700 px-1 py-0.5 font-bold focus:outline-none"
              >
                <option value={3}>3s</option>
                <option value={5}>5s</option>
                <option value={10}>10s</option>
                <option value={15}>15s</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 my-4 border-b border-slate-800/80 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'overview'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <BarChart3 className="h-3.5 w-3.5" />
          <span>Grafik & Metrik</span>
        </button>

        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'diagnostics'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Terminal className="h-3.5 w-3.5" />
          <span>Uji Diagnostik Sistem</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'logs'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          <span>Log Riwayat ({history.length})</span>
          {hasStatus500 && (
            <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
          )}
        </button>
      </div>

      {/* Overview Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Metric Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Supabase Status */}
            <div className="rounded-2xl bg-slate-800/60 p-4 border border-slate-700/80">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Status Supabase</span>
                <Database className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="mt-2.5 flex items-baseline gap-2">
                <span className={`text-2xl font-black ${latestSupaOk ? 'text-emerald-400' : 'text-red-400'}`}>
                  {latestSupaOk ? '200 OK' : `ERR ${latestSupaStatus}`}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                {latestSupaOk ? (
                  <CheckCircle2 className="h-3 w-3 text-emerald-400 inline" />
                ) : (
                  <XCircle className="h-3 w-3 text-red-400 inline" />
                )}
                <span>Latensi: {latestSupaLatency ?? '--'} ms</span>
              </p>
            </div>

            {/* Supabase Success Rate */}
            <div className="rounded-2xl bg-slate-800/60 p-4 border border-slate-700/80">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Tingkat Keberhasilan</span>
                <ShieldCheck className="h-4 w-4 text-amber-400" />
              </div>
              <div className="mt-2.5 flex items-baseline gap-2">
                <span className={`text-2xl font-black ${supaSuccessRate >= 95 ? 'text-emerald-400' : supaSuccessRate >= 80 ? 'text-amber-400' : 'text-red-400'}`}>
                  {supaSuccessRate}%
                </span>
              </div>
              <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    supaSuccessRate >= 95 ? 'bg-emerald-400' : supaSuccessRate >= 80 ? 'bg-amber-400' : 'bg-red-400'
                  }`}
                  style={{ width: `${supaSuccessRate}%` }}
                />
              </div>
            </div>

            {/* Average Latency */}
            <div className="rounded-2xl bg-slate-800/60 p-4 border border-slate-700/80">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Rata-rata Latensi</span>
                <Zap className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="mt-2.5 flex items-baseline gap-1">
                <span className="text-2xl font-black text-white">{avgSupaLatency}</span>
                <span className="text-xs text-slate-400 font-bold">ms</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400 font-medium">
                {avgSupaLatency < 200 ? 'Sangat Cepat' : avgSupaLatency < 500 ? 'Normal' : 'Tinggi'}
              </p>
            </div>

            {/* Express API Proxy Status */}
            <div className="rounded-2xl bg-slate-800/60 p-4 border border-slate-700/80">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Backend Express</span>
                <Server className="h-4 w-4 text-indigo-400" />
              </div>
              <div className="mt-2.5 flex items-baseline gap-2">
                <span className={`text-2xl font-black ${apiSuccessRate >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {apiSuccessRate}%
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400 font-medium">
                Avg Latensi API: {avgApiLatency} ms
              </p>
            </div>
          </div>

          {/* Realtime Latency Chart */}
          <div className="rounded-2xl bg-slate-950/70 p-4 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-amber-400" />
                  Grafik Latensi Koneksi (ms)
                </h3>
                <p className="text-[11px] text-slate-400">Visualisasi realtime latensi Supabase vs Express Server</p>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block" /> Supabase
                </span>
                <span className="flex items-center gap-1 text-cyan-400">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 inline-block" /> Express Proxy
                </span>
              </div>
            </div>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="supaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="apiGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="time" stroke="#64748B" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748B" tick={{ fontSize: 10 }} unit="ms" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#F8FAFC', fontSize: '12px' }}
                    formatter={(val: any, name: any) => [
                      `${val} ms`, 
                      name === 'supabaseLatency' ? 'Supabase Latency' : 'Express API Latency'
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="supabaseLatency"
                    stroke="#10B981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#supaGrad)"
                    isAnimationActive={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="apiLatency"
                    stroke="#06B6D4"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#apiGrad)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Diagnostics Tab Content */}
      {activeTab === 'diagnostics' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-white">Uji Diagnostik Ekosistem Supabase</h3>
              <p className="text-xs text-slate-400">Jalankan pengujian komprehensif untuk memeriksa Auth, RLS, REST API, dan Backend Server.</p>
            </div>
            <button
              onClick={runDiagnostics}
              disabled={isRunningDiag}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-95 px-4 py-2 text-xs font-black text-slate-950 transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {isRunningDiag ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-slate-950" />}
              <span>{isRunningDiag ? 'Menguji...' : 'Jalankan Pengujian'}</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {diagSteps.map((step, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between rounded-2xl bg-slate-800/80 p-3.5 border border-slate-700/80"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 border border-slate-700">
                    {step.status === 'idle' && <Clock className="h-4 w-4 text-slate-500" />}
                    {step.status === 'running' && <RefreshCw className="h-4 w-4 animate-spin text-amber-400" />}
                    {step.status === 'success' && <Check className="h-4 w-4 text-emerald-400" />}
                    {step.status === 'error' && <AlertCircle className="h-4 w-4 text-red-400" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-200">{step.name}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{step.message}</p>
                  </div>
                </div>

                {step.durationMs !== undefined && (
                  <span className="rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-mono text-slate-300 border border-slate-800">
                    {step.durationMs} ms
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logs Tab Content */}
      {activeTab === 'logs' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Riwayat pings terakhir ({history.length} sampel)</span>
            {hasStatus500 && (
              <span className="text-red-400 font-bold flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" /> Terdeteksi insiden HTTP 500
              </span>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1 font-mono text-[11px]">
            {history.slice().reverse().map(log => (
              <div
                key={log.id}
                className={`flex items-center justify-between p-2.5 rounded-xl border ${
                  log.supabaseOk && log.apiOk
                    ? 'bg-slate-800/40 border-slate-700/50 text-slate-300'
                    : 'bg-red-950/30 border-red-800/60 text-red-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 font-bold">{log.time}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    log.supabaseOk ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    Supabase: {log.supabaseStatus} ({log.supabaseLatency ?? '--'}ms)
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    log.apiOk ? 'bg-cyan-500/20 text-cyan-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    API DB: {log.apiStatus} ({log.apiLatency ?? '--'}ms)
                  </span>
                </div>

                {log.errorMessage ? (
                  <span className="text-red-400 text-[10px] truncate max-w-xs" title={log.errorMessage}>
                    {log.errorMessage}
                  </span>
                ) : (
                  <span className="text-emerald-400/80 text-[10px]">Healthy</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
