import React, { useState } from 'react';
import {
  TrendingUp,
  Plus,
  Briefcase,
  ChevronRight,
  Sparkles,
  DollarSign,
  User,
  ArrowRight,
  CheckCircle,
  Building2,
  Phone,
  Bot,
  ShoppingBag,
  RefreshCw,
  Target,
  Filter,
  X
} from 'lucide-react';
import { AppDatabase, CRMLead, User as CurrentUser } from '../types';

interface CRMViewProps {
  db: AppDatabase;
  currentUser: CurrentUser;
  onRefresh: () => void;
}

export default function CRMView({ db, currentUser, onRefresh }: CRMViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showMarketplaceModal, setShowMarketplaceModal] = useState(false);
  const [syncingProductId, setSyncingProductId] = useState<string | null>(null);

  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [value, setValue] = useState('');
  const [stage, setStage] = useState<CRMLead['stage']>('Prospect');
  const [notes, setNotes] = useState('');
  const [source, setSource] = useState<'Manual' | 'Marketplace B2B' | 'Direktori BCI'>('Manual');
  const [mobileActiveStage, setMobileActiveStage] = useState<'prospect' | 'negotiation' | 'won'>('prospect');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');

  // Filter leads by source filter
  const allLeads = db.crmLeads;
  const leads = allLeads.filter(l => {
    if (sourceFilter === 'ALL') return true;
    if (sourceFilter === 'Marketplace B2B') return l.source === 'Marketplace B2B';
    if (sourceFilter === 'Manual') return !l.source || l.source === 'Manual' || l.source === 'Direktori BCI';
    return true;
  });

  // Group by stages
  const prospects = leads.filter(l => l.stage === 'Prospect' || l.stage === 'Contacted' || l.stage === 'Proposal');
  const negotiations = leads.filter(l => l.stage === 'Negotiation');
  const deals = leads.filter(l => l.stage === 'Won');

  // Marketplace sourced stats
  const mpLeads = allLeads.filter(l => l.source === 'Marketplace B2B');
  const mpTotalValue = mpLeads.reduce((acc, curr) => acc + (curr.dealValue || 0), 0);

  // Calculate Pipeline statistics
  const totalPipelineValue = leads.reduce((acc, curr) => acc + (curr.dealValue || 0), 0);
  const totalDealValue = deals.reduce((acc, curr) => acc + (curr.dealValue || 0), 0);

  // Pull Marketplace item into CRM Lead
  const handleSyncMarketplaceProduct = async (product: any) => {
    setSyncingProductId(product.id);
    try {
      const res = await fetch('/api/crm/sync-marketplace-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          companyName: product.companyName,
          contactName: `Sales Rep (${product.companyName})`,
          email: 'sales@' + product.companyName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com',
          phone: '08123456789',
          dealValue: product.price,
          notes: `[SINKRONISASI B2B MARKETPLACE] Kategori: ${product.category}. Produk: "${product.name}" di ${product.city}. Satuan: ${product.unit}.`
        })
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSyncingProductId(null);
    }
  };

  // Shift lead to next stage
  const handleShiftStage = async (leadId: string, currentStage: CRMLead['stage']) => {
    let nextStage: CRMLead['stage'] = 'Won';
    if (currentStage === 'Prospect' || currentStage === 'Contacted' || currentStage === 'Proposal') {
      nextStage = 'Negotiation';
    } else if (currentStage === 'Negotiation') {
      nextStage = 'Won';
    } else {
      return; // Already won
    }

    const existingLead = leads.find(l => l.id === leadId);
    if (!existingLead) return;

    try {
      const res = await fetch('/api/crm/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: leadId,
          companyId: existingLead.companyId,
          contactName: existingLead.contactName,
          email: existingLead.email,
          phone: existingLead.phone,
          dealValue: existingLead.dealValue,
          stage: nextStage,
          nextFollowUp: existingLead.nextFollowUp,
          notes: existingLead.notes
        })
      });
      if (res.ok) {
        if (nextStage === 'Negotiation') {
          setMobileActiveStage('negotiation');
        } else if (nextStage === 'Won') {
          setMobileActiveStage('won');
        }
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Add Lead
  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !value) return;

    try {
      const res = await fetch('/api/crm/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: companyName, // Map to companyId field on backend
          contactName: contactName || 'Direktur Utama',
          email: 'kontak@bci.or.id',
          phone: '08123456789',
          dealValue: Number(value),
          stage: stage,
          nextFollowUp: new Date().toISOString().split('T')[0],
          notes: notes || 'Peluang sinergi nasional BCI'
        })
      });

      if (res.ok) {
        setCompanyName('');
        setContactName('');
        setValue('');
        setStage('Prospect');
        setNotes('');
        setShowAddForm(false);
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Sales Pipeline Metrics Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1 */}
        <div className="glass-card rounded-3xl border border-slate-200/60 p-5 shadow-md space-y-2 glossy-top-highlight text-xs bg-white">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Nilai Pipa Penjualan (Forecast)</p>
          <p className="text-xl font-black text-[#FF6B00]">Rp{totalPipelineValue.toLocaleString('id-ID')}</p>
          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold">
            <span className="text-[#FF6B00] font-black">100% Real-time</span>
            <span>akumulasi prospek kemitraan BCI</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="glass-card rounded-3xl border border-slate-200/60 p-5 shadow-md space-y-2 glossy-top-highlight text-xs bg-white">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Nilai Kontrak Deal (MOU Ditandatangani)</p>
          <p className="text-xl font-black text-emerald-600">Rp{totalDealValue.toLocaleString('id-ID')}</p>
          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold">
            <span className="text-emerald-600 font-black">✓ Legal Beres</span>
            <span>MOU ditandatangani digital</span>
          </div>
        </div>

        {/* Card 3: Marketplace Source Indicator */}
        <div className="glass-card rounded-3xl border border-amber-300/60 bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-white p-5 shadow-md space-y-2 glossy-top-highlight text-xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black text-[#FF6B00] uppercase flex items-center gap-1">
              <ShoppingBag className="h-3.5 w-3.5 text-[#FF6B00]" />
              Sumber B2B Marketplace
            </p>
            <span className="rounded-full bg-orange-100 text-[#FF6B00] text-[9px] font-black px-2 py-0.5 border border-orange-200">
              {mpLeads.length} Lead
            </span>
          </div>
          <p className="text-xl font-black text-slate-900">
            Rp{mpTotalValue.toLocaleString('id-ID')}
          </p>
          <p className="text-[10px] text-slate-500 font-semibold">
            Sinkronisasi otomatis dari catalog produk & permintaan penawaran barang.
          </p>
        </div>

      </div>

      {/* Source Filter & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-4 rounded-3xl border border-slate-200/80 shadow-sm bg-white">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-black text-slate-500 flex items-center gap-1 shrink-0">
            <Filter className="h-3.5 w-3.5 text-[#FF6B00]" />
            Filter Sumber:
          </span>
          <button
            onClick={() => setSourceFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              sourceFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua ({allLeads.length})
          </button>
          <button
            onClick={() => setSourceFilter('Marketplace B2B')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              sourceFilter === 'Marketplace B2B'
                ? 'bg-gradient-to-r from-[#FFC107] to-[#FF6B00] text-white shadow-sm'
                : 'bg-orange-50 text-[#FF6B00] hover:bg-orange-100 border border-orange-200/60'
            }`}
          >
            <ShoppingBag className="h-3 w-3" />
            <span>Marketplace ({mpLeads.length})</span>
          </button>
          <button
            onClick={() => setSourceFilter('Manual')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              sourceFilter === 'Manual'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Direct / Manual ({allLeads.length - mpLeads.length})
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowMarketplaceModal(true)}
            className="rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 px-4 py-2.5 text-xs font-black shadow-sm flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
          >
            <RefreshCw className="h-3.5 w-3.5 text-[#FF6B00]" />
            <span>Sinkronkan Produk Marketplace</span>
          </button>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="rounded-2xl bg-gradient-to-r from-[#FFC107] to-[#FF6B00] hover:brightness-110 active:scale-95 px-4 py-2.5 text-xs font-black text-white shadow-md shadow-orange-500/20 flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Daftarkan Lead Manual</span>
          </button>
        </div>
      </div>

      {/* Modal: Sync Marketplace Products into CRM */}
      {showMarketplaceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto glossy-top-highlight">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-orange-100 text-[#FF6B00]">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">Sinkronkan Produk Marketplace ke CRM</h3>
                  <p className="text-[10px] text-slate-500 font-semibold">Tarik katalog barang B2B langsung menjadi jalur pipa penjualan</p>
                </div>
              </div>
              <button
                onClick={() => setShowMarketplaceModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-base transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {db.marketplaceProducts.map(product => {
                const isSynced = allLeads.some(l => l.sourceProductId === product.id);
                return (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white transition-all text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <img src={product.image} alt={product.name} className="h-10 w-10 rounded-xl object-cover border border-slate-200" />
                      <div>
                        <h5 className="font-black text-slate-900">{product.name}</h5>
                        <p className="text-[10px] text-slate-500 font-bold">
                          {product.companyName} • <span className="text-[#FF6B00]">Rp{product.price.toLocaleString('id-ID')}</span> / {product.unit}
                        </p>
                      </div>
                    </div>

                    {isSynced ? (
                      <span className="rounded-xl bg-emerald-50 text-emerald-600 px-3 py-1.5 text-[10px] font-black border border-emerald-200 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Terhubung
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSyncMarketplaceProduct(product)}
                        disabled={syncingProductId === product.id}
                        className="rounded-xl bg-slate-900 hover:bg-slate-950 text-white px-3 py-1.5 text-[10px] font-black shadow-sm flex items-center gap-1 cursor-pointer border border-slate-700 transition-all active:scale-95 disabled:opacity-50"
                      >
                        <RefreshCw className={`h-3 w-3 text-amber-300 ${syncingProductId === product.id ? 'animate-spin' : ''}`} />
                        <span>Tarik Ke CRM</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowMarketplaceModal(false)}
                className="rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 text-xs font-black cursor-pointer transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slide-down Form block */}
      {showAddForm && (
        <div className="glass-card rounded-3xl border border-slate-200/60 p-5 shadow-md bg-white">
          <form onSubmit={handleAddLead} className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-bold text-slate-700">
            <div className="space-y-1">
              <label className="font-bold text-slate-500">Nama Perusahaan Klien</label>
              <input
                type="text"
                required
                placeholder="Contoh: PT Hutama Karya"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white p-2.5 outline-none focus:border-[#FFC107] font-bold shadow-inner"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-500">Nama PIC (Narahubung)</label>
              <input
                type="text"
                placeholder="Contoh: Budi Gunawan"
                value={contactName}
                onChange={e => setContactName(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white p-2.5 outline-none focus:border-[#FFC107] font-bold shadow-inner"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-500">Estimasi Nilai Kontrak (IDR)</label>
              <input
                type="number"
                required
                placeholder="Contoh: 150000000"
                value={value}
                onChange={e => setValue(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white p-2.5 outline-none focus:border-[#FFC107] font-bold shadow-inner"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-500">Tahap Pipeline Awal</label>
              <select
                value={stage}
                onChange={e => setStage(e.target.value as any)}
                className="w-full rounded-2xl border border-slate-200 bg-white p-2.5 outline-none focus:border-[#FFC107] font-bold shadow-inner text-slate-800"
              >
                <option value="Prospect">Prospect</option>
                <option value="Negotiation">Negosiasi</option>
                <option value="Won">MOU / Deal Selesai</option>
              </select>
            </div>

            <div className="space-y-1 md:col-span-3">
              <label className="font-bold text-slate-500">Catatan Diskusi Kemitraan</label>
              <input
                type="text"
                placeholder="Contoh: Pembahasan awal terkait suplai bahan baku semen curah IKN..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white p-2.5 outline-none focus:border-[#FFC107] font-bold shadow-inner"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-2xl bg-[#FF6B00] hover:bg-orange-700 py-3.5 font-black text-white shadow-md shadow-orange-500/10 cursor-pointer transition-colors"
              >
                Daftarkan Prospek
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mobile Kanban Tab Selector */}
      <div className="flex lg:hidden bg-slate-100 p-1 rounded-2xl gap-1">
        <button
          type="button"
          onClick={() => setMobileActiveStage('prospect')}
          className={`flex-1 py-2.5 rounded-xl text-center text-xs font-black transition-all cursor-pointer ${
            mobileActiveStage === 'prospect' ? 'bg-white text-[#FF6B00] shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Prospect ({prospects.length})
        </button>
        <button
          type="button"
          onClick={() => setMobileActiveStage('negotiation')}
          className={`flex-1 py-2.5 rounded-xl text-center text-xs font-black transition-all cursor-pointer ${
            mobileActiveStage === 'negotiation' ? 'bg-white text-amber-500 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Negosiasi ({negotiations.length})
        </button>
        <button
          type="button"
          onClick={() => setMobileActiveStage('won')}
          className={`flex-1 py-2.5 rounded-xl text-center text-xs font-black transition-all cursor-pointer ${
            mobileActiveStage === 'won' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Deal MOU ({deals.length})
        </button>
      </div>

      {/* Kanban Board Columns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1: Prospect */}
        <div className={`rounded-3xl border border-slate-100 bg-slate-50/50 p-4 space-y-4 ${mobileActiveStage === 'prospect' ? 'block' : 'hidden lg:block'}`}>
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/50">
            <h4 className="font-black text-slate-800 text-xs flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span>
              PROSPECT ({prospects.length})
            </h4>
            <span className="text-[10px] font-bold text-slate-400">
              Rp{prospects.reduce((acc, curr) => acc + (curr.dealValue || 0), 0).toLocaleString('id-ID')}
            </span>
          </div>

          <div className="space-y-3">
            {prospects.map(lead => (
              <div key={lead.id} className="rounded-3xl border border-slate-200 bg-white p-4.5 shadow-md space-y-3 text-xs hover:shadow-lg transition-all glossy-top-highlight relative overflow-hidden">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h5 className="font-black text-slate-900">{lead.companyId}</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-bold">PIC: {lead.contactName}</p>
                  </div>
                  {lead.source === 'Marketplace B2B' && (
                    <span className="shrink-0 rounded-full bg-orange-100 text-[#FF6B00] border border-orange-200 text-[9px] font-black px-2 py-0.5 flex items-center gap-1">
                      <ShoppingBag className="h-2.5 w-2.5" />
                      Marketplace
                    </span>
                  )}
                </div>
                
                <p className="text-slate-500 font-semibold line-clamp-2">{lead.notes}</p>
                
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="font-black text-[#FF6B00]">
                    Rp{(lead.dealValue || 0).toLocaleString('id-ID')}
                  </span>
                  
                  <button
                    onClick={() => handleShiftStage(lead.id, lead.stage)}
                    className="rounded-xl bg-orange-50 hover:bg-orange-100 text-[#FF6B00] p-1.5 px-3 text-[10px] font-black flex items-center gap-1 cursor-pointer transition-all border border-orange-100"
                  >
                    <span>Negosiasi</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Negotiation */}
        <div className={`rounded-3xl border border-slate-100 bg-slate-50/50 p-4 space-y-4 ${mobileActiveStage === 'negotiation' ? 'block' : 'hidden lg:block'}`}>
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/50">
            <h4 className="font-black text-slate-800 text-xs flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse"></span>
              NEGOSIASI ({negotiations.length})
            </h4>
            <span className="text-[10px] font-bold text-slate-400">
              Rp{negotiations.reduce((acc, curr) => acc + (curr.dealValue || 0), 0).toLocaleString('id-ID')}
            </span>
          </div>

          <div className="space-y-3">
            {negotiations.map(lead => (
              <div key={lead.id} className="rounded-3xl border border-slate-200 bg-white p-4.5 shadow-md space-y-3 text-xs hover:shadow-lg transition-all glossy-top-highlight relative overflow-hidden">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h5 className="font-black text-slate-900">{lead.companyId}</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-bold">PIC: {lead.contactName}</p>
                  </div>
                  {lead.source === 'Marketplace B2B' && (
                    <span className="shrink-0 rounded-full bg-orange-100 text-[#FF6B00] border border-orange-200 text-[9px] font-black px-2 py-0.5 flex items-center gap-1">
                      <ShoppingBag className="h-2.5 w-2.5" />
                      Marketplace
                    </span>
                  )}
                </div>

                <p className="text-slate-500 font-semibold line-clamp-2">{lead.notes}</p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="font-black text-amber-500">
                    Rp{(lead.dealValue || 0).toLocaleString('id-ID')}
                  </span>

                  <button
                    onClick={() => handleShiftStage(lead.id, lead.stage)}
                    className="rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#22C55E] p-1.5 px-3 text-[10px] font-black flex items-center gap-1 cursor-pointer transition-all border border-emerald-100"
                  >
                    <span>Deal MOU</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Closed Won / Deal */}
        <div className={`rounded-3xl border border-slate-100 bg-slate-50/50 p-4 space-y-4 ${mobileActiveStage === 'won' ? 'block' : 'hidden lg:block'}`}>
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/50">
            <h4 className="font-black text-slate-800 text-xs flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              CLOSED WON MOU ({deals.length})
            </h4>
            <span className="text-[10px] font-bold text-slate-400">
              Rp{deals.reduce((acc, curr) => acc + (curr.dealValue || 0), 0).toLocaleString('id-ID')}
            </span>
          </div>

          <div className="space-y-3">
            {deals.map(lead => (
              <div key={lead.id} className="rounded-3xl border border-[#FFD54F]/40 bg-white p-4.5 shadow-md space-y-3 text-xs glossy-top-highlight relative overflow-hidden">
                <div>
                  <div className="flex items-center justify-between">
                    <h5 className="font-black text-slate-900">{lead.companyId}</h5>
                    <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-bold">PIC: {lead.contactName}</p>
                </div>

                <p className="text-slate-500 font-semibold line-clamp-2">{lead.notes}</p>

                <div className="pt-2 border-t border-slate-100">
                  <p className="text-[9px] text-slate-400 font-black uppercase">Nilai Akhir Deal:</p>
                  <p className="font-black text-emerald-600 text-sm">
                    Rp{(lead.dealValue || 0).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
