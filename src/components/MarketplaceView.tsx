import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag,
  Plus,
  Search,
  CheckCircle,
  Star,
  MessageSquare,
  MapPin,
  MessageCircle,
  Calculator,
  ChevronDown,
  ChevronUp,
  Percent,
  Info,
  Receipt,
  Target,
  RefreshCw,
  Briefcase,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { AppDatabase, B2BProduct, User } from '../types';

interface MarketplaceViewProps {
  db: AppDatabase;
  currentUser: User;
  onRefresh: () => void;
  onSetPrefilledChat: (partnerId: string, message: string) => void;
  onViewChange: (view: string) => void;
}

export default function MarketplaceView({
  db,
  currentUser,
  onRefresh,
  onSetPrefilledChat,
  onViewChange
}: MarketplaceViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedCity, setSelectedCity] = useState<string>('Semua Kota');
  
  // CRM Sync state
  const [syncingProductId, setSyncingProductId] = useState<string | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);

  // Create Product states
  const [showForm, setShowForm] = useState(false);
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState<B2BProduct['category']>('Mesin');
  const [prodPrice, setProdPrice] = useState('');
  const [prodUnit, setProdUnit] = useState('Unit');
  const [prodImage, setProdImage] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodCity, setProdCity] = useState('');
  const [prodProvince, setProdProvince] = useState('');

  const categories = ['Semua', 'Mesin', 'Software', 'Kendaraan', 'Material', 'Alat Berat', 'Jasa', 'Konsultasi'];
  const cities = ['Semua Kota', 'Jakarta Selatan', 'Surabaya', 'Bandung', 'Medan'];

  // Filter products
  const filteredProducts = db.marketplaceProducts.filter(p => {
    const searchMatch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const catMatch = selectedCategory === 'Semua' || p.category === selectedCategory;
    const cityMatch = selectedCity === 'Semua Kota' || p.city === selectedCity;
    return searchMatch && catMatch && cityMatch;
  });

  // Handle Sync Single Product to CRM Pipeline
  const handleSyncToCRM = async (product: B2BProduct) => {
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
      const data = await res.json();
      if (res.ok) {
        setSyncSuccessMessage(data.message || `Prospek "${product.name}" (${product.companyName}) berhasil disinkronkan ke CRM Pipeline!`);
        onRefresh();
        setTimeout(() => setSyncSuccessMessage(null), 6000);
      }
    } catch (err) {
      console.error('Error syncing to CRM:', err);
    } finally {
      setSyncingProductId(null);
    }
  };

  // Handle Sync All Products to CRM
  const handleSyncAllToCRM = async () => {
    setIsSyncingAll(true);
    let count = 0;
    try {
      for (const product of filteredProducts) {
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
          count++;
        }
      }
      setSyncSuccessMessage(`Selesai! ${count} produk marketplace berhasil disinkronkan ke CRM Sales Pipeline secara terpusat.`);
      onRefresh();
      setTimeout(() => setSyncSuccessMessage(null), 6000);
    } catch (err) {
      console.error('Error syncing all to CRM:', err);
    } finally {
      setIsSyncingAll(false);
    }
  };

  // Handle Quotation with Tax breakdown
  const handleQuotationRequestWithTax = (
    p: B2BProduct,
    qty: number,
    includePPN: boolean,
    includePPh23: boolean,
    dpp: number,
    ppnVal: number,
    pphVal: number,
    totalBuyer: number,
    netSeller: number
  ) => {
    const companyRep = db.users.find(u => u.companyId === p.companyId) || db.users[0];
    const prefilledMsg = `Halo ${p.companyName}, saya berminat mengajukan penawaran B2B resmi untuk produk/jasa "${p.name}" (${p.category}) sebanyak ${qty} ${p.unit}.

📌 SIMULASI KALKULATOR PAJAK B2B (PPh 23 & PPN 11%):
• Harga Dasar: Rp${p.price.toLocaleString('id-ID')} / ${p.unit}
• Total Dasar (DPP): Rp${dpp.toLocaleString('id-ID')}
${includePPN ? `• PPN 11%: +Rp${ppnVal.toLocaleString('id-ID')}\n` : ''}${includePPh23 ? `• Potongan PPh 23 (2%): -Rp${pphVal.toLocaleString('id-ID')}\n` : ''}• Estimasi Total Tagihan Pembeli: Rp${totalBuyer.toLocaleString('id-ID')}
• Estimasi Kas Bersih Diterima Penjual (Net UMKM): Rp${netSeller.toLocaleString('id-ID')}

Mohon konfirmasi kesediaan pasokan dan penerbitan draf Faktur/Kontrak B2B resmi. Terima kasih!`;

    onSetPrefilledChat(companyRep.id, prefilledMsg);
    onViewChange('chat');
  };

  // Handle Ask Seller (Direct Floating Action Chat)
  const handleAskSeller = (p: B2BProduct) => {
    const companyRep = db.users.find(u => u.companyId === p.companyId) || db.users[0];
    const prefilledMsg = `Halo ${p.companyName}, saya tertarik dan ingin bertanya lebih lanjut mengenai ketersediaan serta rincian teknis produk "${p.name}" (${p.category}). Apakah produk ini ready stock?`;
    onSetPrefilledChat(companyRep.id, prefilledMsg);
    onViewChange('chat');
  };

  // Submit Product
  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodPrice) return;

    try {
      const company = db.companies.find(c => c.id === currentUser.companyId) || db.companies[0];

      const res = await fetch('/api/marketplace/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: company.id,
          companyName: company.name,
          companyLogo: company.logo,
          category: prodCategory,
          name: prodName,
          price: Number(prodPrice),
          unit: prodUnit,
          image: prodImage || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=400',
          description: prodDesc,
          city: prodCity || 'Jakarta',
          province: prodProvince || 'DKI Jakarta'
        })
      });

      if (res.ok) {
        setProdName('');
        setProdPrice('');
        setProdUnit('Unit');
        setProdImage('');
        setProdDesc('');
        setProdCity('');
        setProdProvince('');
        setShowForm(false);
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification Banner for CRM Sync */}
      <AnimatePresence>
        {syncSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="rounded-3xl border border-emerald-300/80 bg-gradient-to-r from-emerald-900 to-slate-900 p-4 text-white shadow-xl flex items-center justify-between gap-4 glossy-top-highlight"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30">
                <Target className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <p className="font-black text-xs text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                  Sinkronisasi CRM Sales Pipeline Berhasil
                </p>
                <p className="text-[11px] text-slate-200 font-semibold">{syncSuccessMessage}</p>
              </div>
            </div>

            <button
              onClick={() => onViewChange('crm')}
              className="rounded-2xl bg-gradient-to-r from-[#FFC107] to-[#FF6B00] hover:brightness-110 px-4 py-2 text-xs font-black text-white shadow-md flex items-center gap-1.5 shrink-0 cursor-pointer transition-all active:scale-95"
            >
              <span>Kelola di CRM</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feature Banner: Marketplace to CRM Sync */}
      <div className="glass-card rounded-3xl border border-orange-200/80 bg-gradient-to-r from-orange-50/90 via-amber-50/50 to-white p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 glossy-top-highlight">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-[#FFC107] to-[#FF6B00] text-white shadow-md shadow-orange-500/20">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-slate-900 text-sm">Sinkronisasi Prospek B2B ke CRM Pipeline</h3>
              <span className="rounded-full bg-orange-100 text-[#FF6B00] text-[9px] font-black px-2.5 py-0.5 border border-orange-200">Terpusat</span>
            </div>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
              Tarik seluruh catalog & inkuiri barang marketplace ke jalur pipa penjualan CRM untuk follow-up negosiasi dan kontrak MOU.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleSyncAllToCRM}
            disabled={isSyncingAll}
            className="rounded-2xl bg-slate-900 hover:bg-slate-950 text-white px-4 py-2.5 text-xs font-black shadow-md flex items-center gap-2 border border-slate-700 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-amber-300 ${isSyncingAll ? 'animate-spin' : ''}`} />
            <span>{isSyncingAll ? 'Menyinkronkan...' : 'Sinkronkan Semua Produk ke CRM'}</span>
          </button>

          <button
            onClick={() => onViewChange('crm')}
            className="rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 px-4 py-2.5 text-xs font-black shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Briefcase className="h-3.5 w-3.5 text-[#FF6B00]" />
            <span>Lihat CRM ({db.crmLeads.length})</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-5 rounded-3xl border border-slate-200/80 hover:border-orange-200/80 shadow-md hover:shadow-lg transition-all duration-300 glossy-top-highlight"
      >
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute top-3 left-4 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari mesin, software, material, jasa..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs rounded-2xl border border-slate-200 bg-white/60 py-3 pl-11 pr-4 outline-none focus:border-[#FFC107] focus:bg-white font-bold text-slate-800 transition-all duration-200 shadow-inner"
            />
          </div>
          
          <select
            value={selectedCity}
            onChange={e => setSelectedCity(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white/60 px-4 py-2 text-xs font-black text-slate-700 outline-none focus:border-[#FFC107] transition-all duration-200 cursor-pointer hover:bg-white"
          >
            {cities.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-[#FFC107] to-[#FF6B00] hover:brightness-110 px-5 py-3 text-xs font-black text-white shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 cursor-pointer transition-all duration-200"
        >
          <Plus className="h-4 w-4" />
          <span>Jual Produk / Jasa B2B</span>
        </motion.button>
      </motion.div>

      {/* Category horizontal scroll */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1, ease: 'easeOut' }}
        className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none"
      >
        {categories.map(cat => (
          <motion.button
            key={cat}
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all duration-200 whitespace-nowrap cursor-pointer shadow-sm border ${
              selectedCategory === cat
                ? 'bg-gradient-to-r from-[#FFC107] to-[#FF6B00] text-white border-none shadow-md shadow-orange-500/20'
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            {cat}
          </motion.button>
        ))}
      </motion.div>

      {/* Add Product Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="glass-card rounded-3xl p-6 space-y-4 shadow-xl border border-white/60 glossy-top-highlight"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-[#FF6B00]" />
                Daftarkan Produk Baru ke Jaringan Nasional B2B
              </h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold transition-colors">✕</button>
            </div>

            <form onSubmit={handleSubmitProduct} className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="md:col-span-2 space-y-3.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Nama Produk atau Jasa</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Genset Diesel Industri 50KVA Silent Type"
                    value={prodName}
                    onChange={e => setProdName(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white/50 p-3 outline-none focus:border-[#FFC107] focus:bg-white font-bold text-slate-800 shadow-inner transition-all duration-200"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Kategori</label>
                    <select
                      value={prodCategory}
                      onChange={e => setProdCategory(e.target.value as any)}
                      className="w-full rounded-2xl border border-slate-200 bg-white/50 p-3 outline-none focus:border-[#FFC107] focus:bg-white font-bold text-slate-800 shadow-inner transition-all duration-200 cursor-pointer"
                    >
                      {categories.slice(1).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Harga Satuan (IDR)</label>
                    <input
                      type="number"
                      required
                      placeholder="Contoh: 12500000"
                      value={prodPrice}
                      onChange={e => setProdPrice(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white/50 p-3 outline-none focus:border-[#FFC107] focus:bg-white font-bold text-slate-800 shadow-inner transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Satuan Unit</label>
                    <input
                      type="text"
                      placeholder="Contoh: Unit, Bulan, Meter"
                      value={prodUnit}
                      onChange={e => setProdUnit(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white/50 p-3 outline-none focus:border-[#FFC107] focus:bg-white font-bold text-slate-800 shadow-inner transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Deskripsi Teknis Detail</label>
                  <textarea
                    required
                    placeholder="Deskripsikan fitur, spesifikasi teknis, garansi, sertifikasi TKDN, dan skema purnajual..."
                    value={prodDesc}
                    onChange={e => setProdDesc(e.target.value)}
                    rows={4}
                    className="w-full rounded-2xl border border-slate-200 bg-white/50 p-3 outline-none focus:border-[#FFC107] focus:bg-white text-slate-800 resize-none font-bold shadow-inner transition-all duration-200"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Gambar Produk URL</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={prodImage}
                    onChange={e => setProdImage(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white/50 p-3 outline-none focus:border-[#FFC107] focus:bg-white font-bold text-slate-800 shadow-inner transition-all duration-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Kota Lokasi</label>
                    <input
                      type="text"
                      placeholder="Surabaya"
                      value={prodCity}
                      onChange={e => setProdCity(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white/50 p-3 outline-none focus:border-[#FFC107] focus:bg-white font-bold text-slate-800 shadow-inner transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Provinsi Lokasi</label>
                    <input
                      type="text"
                      placeholder="Jawa Timur"
                      value={prodProvince}
                      onChange={e => setProdProvince(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white/50 p-3 outline-none focus:border-[#FFC107] focus:bg-white font-bold text-slate-800 shadow-inner transition-all duration-200"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full rounded-2xl bg-gradient-to-r from-[#FFC107] to-[#FF6B00] hover:brightness-110 py-3.5 font-black text-white text-xs shadow-md shadow-orange-500/20 cursor-pointer mt-4 transition-all duration-200"
                >
                  Daftarkan Produk Sekarang
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((p, index) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: index * 0.05,
              ease: [0.22, 1, 0.36, 1]
            }}
            whileHover={{ y: -6 }}
            className="group flex flex-col glass-card rounded-3xl border border-slate-200/70 hover:border-orange-300/80 overflow-hidden shadow-md hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 text-xs glossy-top-highlight cursor-pointer"
          >
            {/* Visual representation */}
            <div className="relative h-44 overflow-hidden bg-slate-50">
              <img
                src={p.image}
                alt={p.name}
                className="h-full w-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
              />
              <span className="absolute top-3 left-3 rounded-xl bg-gradient-to-r from-[#FFC107] to-[#FF6B00] text-white px-3 py-1 text-[10px] font-black shadow-md shadow-orange-500/10 group-hover:shadow-lg transition-shadow">
                {p.category}
              </span>

              {/* Floating Action Button: Tanya Penjual */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAskSeller(p);
                }}
                className="absolute bottom-3 right-3 bg-slate-900/90 hover:bg-[#FF6B00] text-white px-3 py-1.5 rounded-2xl text-[10.5px] font-black shadow-lg shadow-black/20 backdrop-blur-md flex items-center gap-1.5 border border-white/20 transition-all z-10 cursor-pointer"
                title="Tanya Penjual via Chat Direct"
              >
                <MessageCircle className="h-3.5 w-3.5 text-[#FFC107]" />
                <span>Tanya Penjual</span>
              </motion.button>
            </div>

            {/* Description details */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                
                {/* Author company */}
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase">
                  <img src={p.companyLogo} alt="Logo" className="h-5 w-5 rounded-md object-cover border border-slate-200 shadow-sm" />
                  <span className="truncate">{p.companyName}</span>
                  {p.isVerified && <CheckCircle className="h-3 w-3 text-[#FF6B00] fill-orange-50" />}
                </div>

                <h4 className="font-black text-slate-900 text-sm tracking-tight line-clamp-1 group-hover:text-[#FF6B00] transition-colors duration-200">
                  {p.name}
                </h4>
                
                <p className="text-slate-500 line-clamp-3 leading-relaxed font-semibold">
                  {p.description}
                </p>
              </div>

              {/* Price and location footer */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                    <MapPin className="h-3.5 w-3.5 text-[#FF6B00]" />
                    <span>{p.city}, {p.province}</span>
                  </p>
                  <p className="flex items-center gap-0.5 text-[11px] text-[#FFC107] font-black">
                    <Star className="h-3 w-3 fill-[#FFC107]" />
                    <span>{p.rating}</span>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Harga B2B Dasar:</p>
                    <p className="font-black text-sm text-[#FF6B00]">
                      Rp{p.price.toLocaleString('id-ID')}
                      <span className="text-[9px] font-bold text-slate-400"> / {p.unit}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 w-full sm:w-auto">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSyncToCRM(p);
                      }}
                      disabled={syncingProductId === p.id}
                      className="flex-1 sm:flex-none rounded-2xl bg-slate-900 hover:bg-slate-950 text-white font-black text-[10px] px-3 py-2.5 shadow-sm flex items-center justify-center gap-1 cursor-pointer transition-all border border-slate-700 disabled:opacity-50"
                      title="Sinkronkan produk ini langsung ke CRM Pipeline"
                    >
                      <Target className={`h-3 w-3 text-amber-300 ${syncingProductId === p.id ? 'animate-spin' : ''}`} />
                      <span>{syncingProductId === p.id ? 'Syncing...' : 'Sync to CRM'}</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuotationRequestWithTax(p, 1, true, true, p.price, p.price * 0.11, p.price * 0.02, p.price * 1.11, p.price * 0.98);
                      }}
                      className="flex-1 sm:flex-none rounded-2xl bg-gradient-to-r from-[#FFC107] to-[#FF6B00] hover:brightness-110 text-white font-black text-[10px] px-3.5 py-2.5 shadow-md shadow-orange-500/10 hover:shadow-lg hover:shadow-orange-500/25 flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-200"
                    >
                      <MessageSquare className="h-3 w-3" />
                      <span>Penawaran</span>
                    </motion.button>
                  </div>
                </div>

                {/* Kalkulator Pajak PPh 23 & PPN 11% khusus B2B UMKM */}
                <TaxCalculatorWidget
                  product={p}
                  onSendQuotationWithTax={handleQuotationRequestWithTax}
                />
              </div>

            </div>
          </motion.div>
        ))}

        {filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="col-span-full p-12 text-center glass-card rounded-3xl border border-slate-200/80 shadow-sm space-y-3"
          >
            <div className="h-14 w-14 mx-auto rounded-2xl bg-orange-100 text-[#FF6B00] flex items-center justify-center shadow-inner">
              <ShoppingBag className="h-7 w-7" />
            </div>
            <h4 className="font-black text-slate-800 text-base">Tidak ada produk ditemukan</h4>
            <p className="text-slate-500 text-xs font-bold max-w-md mx-auto">
              Coba ubah kata kunci pencarian atau ganti filter kategori/kota untuk menemukan produk B2B lainnya.
            </p>
          </motion.div>
        )}
      </div>

    </div>
  );
}

// Sub-component: B2B UMKM Tax Calculator Widget (PPh 23 & PPN 11%)
interface TaxCalculatorWidgetProps {
  product: B2BProduct;
  onSendQuotationWithTax: (
    p: B2BProduct,
    qty: number,
    includePPN: boolean,
    includePPh23: boolean,
    dpp: number,
    ppnVal: number,
    pphVal: number,
    totalBuyer: number,
    netSeller: number
  ) => void;
}

function TaxCalculatorWidget({ product, onSendQuotationWithTax }: TaxCalculatorWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [qty, setQty] = useState<number>(1);
  const [includePPN, setIncludePPN] = useState<boolean>(true);
  const [includePPh23, setIncludePPh23] = useState<boolean>(true);

  const safeQty = Math.max(1, qty || 1);
  const dpp = product.price * safeQty;
  const ppnVal = includePPN ? dpp * 0.11 : 0;
  const pphVal = includePPh23 ? dpp * 0.02 : 0;
  const totalBuyer = dpp + ppnVal;
  const netSeller = dpp - pphVal;

  return (
    <div className="mt-2.5 pt-2.5 border-t border-slate-100/90">
      <motion.button
        type="button"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`w-full flex items-center justify-between p-2 rounded-2xl text-[10.5px] font-black transition-all cursor-pointer border ${
          isOpen
            ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-orange-300 text-slate-900 shadow-xs'
            : 'bg-slate-50 hover:bg-orange-50/80 border-slate-200/80 text-slate-700 hover:text-orange-900'
        }`}
      >
        <div className="flex items-center gap-1.5">
          <div className="h-5.5 w-5.5 rounded-lg bg-gradient-to-tr from-[#FF6B00] to-[#FFC107] flex items-center justify-center text-white shadow-xs">
            <Calculator className="h-3 w-3" />
          </div>
          <span className="font-black text-slate-900">Kalkulator Pajak (PPh23 & PPN)</span>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[9px] font-black text-[#FF6B00] bg-white px-1.5 py-0.5 rounded-md border border-slate-200 shadow-2xs">
            Net: Rp{netSeller.toLocaleString('id-ID')}
          </span>
          {isOpen ? <ChevronUp className="h-3.5 w-3.5 text-slate-400" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="overflow-hidden mt-2 bg-slate-900 text-white rounded-2xl p-3 space-y-2.5 text-[10.5px] shadow-lg border border-slate-800"
          >
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">
                  Qty ({product.unit}):
                </label>
                <input
                  type="number"
                  min={1}
                  value={qty}
                  onChange={(e) => setQty(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1 font-black text-white outline-none focus:border-[#FFC107] text-xs"
                />
              </div>

              <div className="flex flex-col justify-end space-y-1">
                <label className="flex items-center gap-1.5 cursor-pointer text-[9.5px] font-bold text-slate-300">
                  <input
                    type="checkbox"
                    checked={includePPN}
                    onChange={(e) => setIncludePPN(e.target.checked)}
                    className="accent-[#FF6B00] rounded cursor-pointer h-3 w-3"
                  />
                  <span>+ PPN 11% (PKP)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-[9.5px] font-bold text-slate-300">
                  <input
                    type="checkbox"
                    checked={includePPh23}
                    onChange={(e) => setIncludePPh23(e.target.checked)}
                    className="accent-[#FFC107] rounded cursor-pointer h-3 w-3"
                  />
                  <span>- PPh 23 (2% Potongan)</span>
                </label>
              </div>
            </div>

            <div className="bg-slate-800/80 rounded-xl p-2 space-y-1 border border-slate-700/80">
              <div className="flex justify-between items-center text-slate-400 text-[9.5px]">
                <span>Dasar Pengenaan Pajak (DPP):</span>
                <span className="font-bold text-slate-200">Rp{dpp.toLocaleString('id-ID')}</span>
              </div>

              {includePPN && (
                <div className="flex justify-between items-center text-emerald-400 text-[9.5px]">
                  <span>+ PPN 11%:</span>
                  <span className="font-bold">+Rp{ppnVal.toLocaleString('id-ID')}</span>
                </div>
              )}

              {includePPh23 && (
                <div className="flex justify-between items-center text-amber-400 text-[9.5px]">
                  <span>- Potongan PPh 23 (2%):</span>
                  <span className="font-bold">-Rp{pphVal.toLocaleString('id-ID')}</span>
                </div>
              )}

              <div className="pt-1 border-t border-slate-700/80 flex justify-between items-center font-black text-white text-[10px]">
                <span className="text-slate-300">Total Tagihan Pembeli:</span>
                <span className="text-[#FFC107]">Rp{totalBuyer.toLocaleString('id-ID')}</span>
              </div>

              <div className="flex justify-between items-center font-black text-[10px] text-[#FF6B00] bg-orange-950/40 px-2 py-0.5 rounded-lg border border-orange-500/30">
                <span className="text-orange-200">Kas Net Diterima Penjual:</span>
                <span>Rp{netSeller.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => {
                e.stopPropagation();
                onSendQuotationWithTax(product, safeQty, includePPN, includePPh23, dpp, ppnVal, pphVal, totalBuyer, netSeller);
              }}
              className="w-full bg-gradient-to-r from-[#FFC107] to-[#FF6B00] hover:brightness-110 text-white font-black text-[10px] py-1.5 px-3 rounded-xl shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              <MessageSquare className="h-3 w-3" />
              <span>Ajukan Penawaran + Simulasi Pajak Ini</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
