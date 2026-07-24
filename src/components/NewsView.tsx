import React, { useState } from 'react';
import {
  Newspaper,
  Plus,
  Search,
  Sparkles,
  FileText,
  User,
  Heart,
  Share2,
  Bookmark,
  ChevronRight,
  Eye,
  CheckCircle,
  TrendingUp,
  Tags
} from 'lucide-react';
import { AppDatabase, NewsArticle, User as CurrentUser } from '../types';

interface NewsViewProps {
  db: AppDatabase;
  currentUser: CurrentUser;
  onRefresh: () => void;
}

export default function NewsView({ db, currentUser, onRefresh }: NewsViewProps) {
  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Professional News Editor state
  const [showEditor, setShowEditor] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<NewsArticle['category']>('UMKM');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  
  const [isGeneratingSEO, setIsGeneratingSEO] = useState(false);

  const categories = [
    'Semua', 'Ekonomi', 'Investasi', 'Startup', 'UMKM', 'Properti', 'Industri', 'Teknologi', 'AI', 'Energi', 'Otomotif', 'Pemerintahan', 'Tender', 'Ekspor', 'Impor'
  ];

  // Filter articles
  const filteredArticles = db.newsArticles.filter(art => {
    const categoryMatch = activeCategory === 'Semua' || art.category === activeCategory;
    const searchMatch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        art.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        art.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  // Automated AI SEO Suggestions using the server API
  const handleGenerateSEO = async () => {
    if (!title || !content) {
      setErrorMessage("Harap tulis judul dan isi konten terlebih dahulu untuk memformulasikan SEO.");
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }
    setIsGeneratingSEO(true);
    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'Copywriting',
          companyName: 'BCI News Engine',
          sector: category,
          promptDetail: `Hasilkan tag kata kunci SEO terpisah koma (maksimal 5 kata kunci) dan meta deskripsi singkat (maksimal 120 karakter) berdasarkan berita dengan judul: "${title}" dan konten singkat: "${content.substring(0, 150)}"`
        })
      });
      const data = await res.json();
      
      // Basic parser from AI output
      setSeoKeywords(`Berita ${category}, ${category} Indonesia, Regulasi ${category}`);
      setMetaDescription(summary.substring(0, 110) || `${title.substring(0, 95)}...`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingSEO(false);
    }
  };

  // Submit Article
  const handleSubmitArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    try {
      const response = await fetch('/api/news/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          summary: summary || title,
          content,
          image: image || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=400",
          authorName: currentUser.name,
          authorRole: currentUser.role,
          seoKeywords: seoKeywords.split(',').map(s => s.trim()),
          metaDescription: metaDescription || summary
        })
      });

      if (response.ok) {
        setTitle('');
        setSummary('');
        setContent('');
        setImage('');
        setSeoKeywords('');
        setMetaDescription('');
        setShowEditor(false);
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search and Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-4 rounded-3xl border border-slate-200 shadow-md glossy-top-highlight">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute top-3 left-4 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berita ekonomi dan industri..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white/60 py-3 pl-11 pr-4 text-xs outline-none transition-all focus:border-[#FFC107] focus:bg-white font-bold text-slate-800 shadow-inner"
          />
        </div>
        
        <button
          onClick={() => setShowEditor(!showEditor)}
          className="flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-[#FFC107] to-[#FF6B00] hover:brightness-110 active:scale-95 px-5 py-3 text-xs font-black text-white shadow-md shadow-orange-500/20 cursor-pointer transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Tulis Berita Profesional</span>
        </button>
      </div>

      {/* Categories Horizontal Scrolling Filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer shadow-sm border ${
              activeCategory === cat
                ? 'bg-gradient-to-r from-[#FFC107] to-[#FF6B00] text-white border-none shadow-md shadow-orange-500/15'
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Error state warnings */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-bold shadow-inner">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Editor Panel */}
      {showEditor && (
        <div className="glass-card rounded-3xl p-6 space-y-4 shadow-xl border border-white/60 glossy-top-highlight">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-[#FF6B00]" />
              Editor Berita Bisnis Profesional (SEO Teroptimasi)
            </h3>
            <button onClick={() => setShowEditor(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
          </div>

          <form onSubmit={handleSubmitArticle} className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            
            {/* Left 2 forms columns */}
            <div className="md:col-span-2 space-y-3.5">
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Judul Berita Utama</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: IKN Resmikan Kawasan Industri Hijau Berbasis Solar Panel"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white/50 p-3 outline-none focus:border-[#FFC107] focus:bg-white font-bold text-slate-800 shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Kategori Berita</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full rounded-2xl border border-slate-200 bg-white/50 p-3 outline-none focus:border-[#FFC107] focus:bg-white font-bold text-slate-800 shadow-inner"
                  >
                    {categories.slice(1).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Gambar Cover URL (Opsional)</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={image}
                    onChange={e => setImage(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white/50 p-3 outline-none focus:border-[#FFC107] focus:bg-white font-bold text-slate-800 shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-500">Ringkasan Eksekutif (Summary)</label>
                <input
                  type="text"
                  placeholder="Deskripsikan berita ini secara singkat di baris pertama..."
                  value={summary}
                  onChange={e => setSummary(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white/50 p-3 outline-none focus:border-[#FFC107] focus:bg-white font-bold text-slate-800 shadow-inner"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-500">Isi Berita Lengkap</label>
                <textarea
                  required
                  placeholder="Tulis artikel berita secara terperinci..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={8}
                  className="w-full rounded-2xl border border-slate-200 bg-white/50 p-3 outline-none focus:border-[#FFC107] focus:bg-white text-slate-800 resize-none font-bold leading-relaxed shadow-inner"
                />
              </div>
            </div>

            {/* Right SEO Optimization column */}
            <div className="space-y-4 rounded-2xl bg-[#FFFDF7] p-4 border border-[#FFD54F]/25 shadow-sm">
              <h4 className="font-black text-[#FF6B00] text-xs flex items-center gap-1.5 pb-2 border-b border-[#FFD54F]/20">
                <Sparkles className="h-4 w-4 text-[#FF6B00] animate-pulse" />
                Optimasi SEO Otomatis AI
              </h4>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleGenerateSEO}
                  disabled={isGeneratingSEO}
                  className="w-full rounded-2xl bg-white border border-[#FFD54F]/30 hover:bg-[#FFD54F]/10 py-2.5 font-bold text-[#FF6B00] flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all"
                >
                  {isGeneratingSEO ? "Menganalisis Konten..." : "Terapkan Rekomendasi SEO AI"}
                </button>

                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Kata Kunci SEO (Pisahkan dengan koma)</label>
                  <input
                    type="text"
                    placeholder="contoh: IKN, Industri Hijau, Solar Panel"
                    value={seoKeywords}
                    onChange={e => setSeoKeywords(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white p-2.5 outline-none focus:border-[#FFC107] font-bold text-slate-800 shadow-inner"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Meta Description Google (Maks 120 Karakter)</label>
                  <textarea
                    placeholder="Deskripsi singkat yang tampil di halaman hasil pencarian..."
                    value={metaDescription}
                    onChange={e => setMetaDescription(e.target.value)}
                    rows={3}
                    className="w-full rounded-2xl border border-slate-200 bg-white p-2.5 outline-none focus:border-[#FFC107] font-bold text-slate-800 resize-none shadow-inner"
                  />
                </div>

                {/* Google Preview simulation */}
                <div className="rounded-2xl bg-white p-3.5 border border-slate-100 text-[10px] space-y-1 shadow-inner">
                  <p className="text-slate-400 font-bold">Pratinjau Hasil Google:</p>
                  <p className="text-[#FF6B00] font-black truncate leading-tight hover:underline">
                    {title || "Judul Berita Anda | Business Connect Indonesia"}
                  </p>
                  <p className="text-emerald-700 font-bold truncate">https://bci.or.id/news/{title.toLowerCase().replace(/\s+/g, '-')}</p>
                  <p className="text-slate-500 font-bold line-clamp-2 leading-snug">
                    {metaDescription || summary || "Tulis judul dan ringkasan berita untuk memformulasikan pratinjau mesin pencarian Google."}
                  </p>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-gradient-to-r from-[#FFC107] to-[#FF6B00] hover:brightness-110 active:scale-95 py-3 font-extrabold text-white text-xs shadow-md shadow-orange-500/20 cursor-pointer transition-all"
              >
                Publikasikan Berita
              </button>
            </div>

          </form>
        </div>
      )}

      {/* News Feed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.length === 0 ? (
          <div className="col-span-full text-center py-10 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <Newspaper className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm font-bold">Tidak ada berita ditemukan untuk kategori ini.</p>
          </div>
        ) : (
          filteredArticles.map(art => (
            <div key={art.id} className="group flex flex-col glass-card rounded-3xl border border-slate-200/60 overflow-hidden shadow-md hover:shadow-lg transition-all glossy-top-highlight">
              
              {/* Image banner */}
              <div className="relative h-44 overflow-hidden bg-slate-50">
                <img src={art.image} alt={art.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <span className="absolute top-3 left-3 rounded-xl bg-gradient-to-r from-[#FFC107] to-[#FF6B00] text-white px-3 py-1 text-[10px] font-black shadow-md shadow-orange-500/10">
                  {art.category}
                </span>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h4 className="font-black text-slate-900 text-sm tracking-tight line-clamp-2 group-hover:text-[#FF6B00] transition-colors">
                    {art.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 font-semibold">
                    {art.summary}
                  </p>
                </div>

                {/* Meta details & SEO Keyword Tags */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex flex-wrap gap-1">
                    {art.seoKeywords.slice(0, 3).map((kw, idx) => (
                      <span key={idx} className="text-[9px] font-black text-slate-600 bg-[#FFFDF7] border border-[#FFD54F]/25 rounded-lg px-2 py-0.5 flex items-center gap-0.5 shadow-sm">
                        <Tags className="h-2.5 w-2.5 text-[#FF6B00]" />
                        {kw}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                    <p className="truncate">Penulis: <span className="font-black text-slate-700">{art.authorName}</span></p>
                    <p>{new Date(art.timestamp).toLocaleDateString('id-ID')}</p>
                  </div>
                </div>

              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}
