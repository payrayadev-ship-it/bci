import React, { useState } from 'react';
import { 
  HelpCircle, 
  Search, 
  Sparkles, 
  FileSignature, 
  Users, 
  Briefcase, 
  ChevronDown, 
  MessageSquare, 
  CheckCircle, 
  Building, 
  Send, 
  ShieldAlert, 
  FileText,
  BadgeAlert
} from 'lucide-react';

interface FAQItem {
  id: string;
  category: 'umum' | 'matching' | 'tender' | 'ai';
  question: string;
  answer: string;
}

export default function FAQView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'semua' | 'umum' | 'matching' | 'tender' | 'ai'>('semua');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Support Ticket Form States
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('umum');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSuccess, setTicketSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoResponse, setAutoResponse] = useState<string | null>(null);

  const categories = [
    { id: 'semua', label: 'Semua Kategori', icon: HelpCircle },
    { id: 'umum', label: 'Umum & Akun', icon: Building },
    { id: 'matching', label: 'Business Matching AI', icon: Users },
    { id: 'tender', label: 'Prosedur Tender B2B', icon: FileSignature },
    { id: 'ai', label: 'BCI AI Assistant', icon: Sparkles },
  ];

  const faqs: FAQItem[] = [
    {
      id: 'umum-1',
      category: 'umum',
      question: 'Apa itu Portal Business Connect Indonesia (Portal BCI)?',
      answer: 'Portal BCI adalah platform jaringan B2B terpadu dan kognitif di Indonesia yang menghubungkan pelaku usaha, supplier, kontraktor, dan investor nasional. Kami menyediakan alat digitalisasi lengkap mulai dari B2B Marketplace, sistem pencocokan bisnis cerdas (Matching AI), manajemen sales leads (CRM), hingga draf dokumen berbasis Generative AI untuk mengakselerasi kolaborasi industri.'
    },
    {
      id: 'umum-2',
      category: 'umum',
      question: 'Bagaimana cara memverifikasi akun perusahaan saya?',
      answer: 'Untuk mendapatkan lencana Verifikasi BCI Premium, Anda perlu melengkapi Profil Perusahaan di tab "Profil Perusahaan" lalu mengisi berkas legalitas penting termasuk Nomor Induk Berusaha (NIB), NPWP Perusahaan, serta sertifikasi Tingkat Komponen Dalam Negeri (TKDN) jika ada. Tim kepatuhan kami akan memeriksa dokumen Anda dalam waktu 1x24 jam.'
    },
    {
      id: 'umum-3',
      category: 'umum',
      question: 'Apa perbedaan keanggotaan Free, Pro, dan Enterprise?',
      answer: 'Anggota Free memiliki akses terbatas pada feed bisnis dan direktori dasar. Anggota Pro mendapatkan akses ke detail tender nasional, rekomendasi Matching AI harian, dan obrolan langsung di Pusat Chat BCI. Anggota Enterprise memperoleh draf hukum AI tanpa batas, prioritas tender proyek IKN, dan manager akun kemitraan khusus.'
    },
    {
      id: 'matching-1',
      category: 'matching',
      question: 'Bagaimana cara kerja sistem Matching AI di Portal BCI?',
      answer: 'Sistem Matching AI menggunakan algoritma kognitif tingkat lanjut untuk menganalisis portofolio, klasifikasi industri, nilai TKDN, dan kapabilitas suplai perusahaan Anda. Sistem secara otomatis mencocokkan profil Anda dengan kebutuhan pasokan (buyer) atau peluang kemitraan aktif yang memiliki relevansi di atas 85%.'
    },
    {
      id: 'matching-2',
      category: 'matching',
      question: 'Bagaimana cara memulai inisiasi temu bisnis dengan calon mitra?',
      answer: 'Buka menu "Matching AI", pilih salah satu perusahaan yang direkomendasikan untuk Anda, lalu klik tombol "Inisiasi Kontak" atau "Hubungi via Chat". Sistem kami akan mengirimkan notifikasi formal dan membuka ruang obrolan aman langsung di Pusat Chat BCI agar kedua belah pihak dapat berdiskusi.'
    },
    {
      id: 'matching-3',
      category: 'matching',
      question: 'Apakah hasil rekomendasi Matching AI diperbarui secara real-time?',
      answer: 'Ya, rekomendasi diperbarui secara real-time setiap kali ada perusahaan baru yang mendaftar atau ketika profil perusahaan lain memperbarui kebutuhan komoditas mereka. Kami merekomendasikan Anda memperbarui deskripsi produk dan jabatan fungsional agar kecocokan semakin akurat.'
    },
    {
      id: 'tender-1',
      category: 'tender',
      question: 'Bagaimana prosedur mengikuti tender proyek di Portal BCI?',
      answer: '1. Masuk ke menu "Proyek Tender". 2. Pilih tender proyek yang aktif sesuai keahlian perusahaan Anda (misalnya Proyek Konstruksi IKN atau Pengadaan Logistik). 3. Tinjau spesifikasi, kualifikasi minimum, nilai HPS, dan persyaratan dokumen TKDN. 4. Klik "Ajukan Penawaran", isi estimasi nilai kontrak, dan unggah draf proposal teknis Anda.'
    },
    {
      id: 'tender-2',
      category: 'tender',
      question: 'Apa peran kepatuhan TKDN dalam memenangkan Tender?',
      answer: 'Dalam pengadaan tender nasional (terutama sektor BUMN dan proyek pemerintah seperti IKN), sertifikasi Tingkat Komponen Dalam Negeri (TKDN) menjadi parameter krusial. Perusahaan dengan persentase TKDN lebih tinggi di atas batas minimum yang ditentukan secara hukum berpeluang mendapatkan preferensi harga dan prioritas kemenangan lebih besar.'
    },
    {
      id: 'tender-3',
      category: 'tender',
      question: 'Apakah Portal BCI memungut komisi dari pemenang tender?',
      answer: 'Tidak, Portal BCI tidak memungut komisi atau potongan persenan dari nilai kontrak tender proyek yang berhasil dimenangkan. Semua proses komersial dilakukan secara independen (B2B) sesuai kesepakatan tertulis antar-perusahaan.'
    },
    {
      id: 'ai-1',
      category: 'ai',
      question: 'Bagaimana cara memanfaatkan BCI AI Assistant untuk bisnis?',
      answer: 'Anda dapat masuk ke tab "BCI AI Assistant" untuk menghasilkan draf proposal bisnis, surat kemitraan resmi (MOU), analisis SWOT kompetitor, hingga draf deskripsi produk marketplace. Cukup masukkan perintah (prompt) detail, dan kecerdasan buatan kami akan merumuskan teks profesional dalam hitungan detik.'
    },
    {
      id: 'ai-2',
      category: 'ai',
      question: 'Apakah dokumen hukum yang dibuat oleh AI memiliki kekuatan hukum?',
      answer: 'Draf dokumen yang dihasilkan oleh BCI AI Assistant adalah saran rujukan berstruktur formal (template). Anda sangat disarankan untuk meninjau kembali draf tersebut bersama konsultan hukum internal perusahaan Anda guna memverifikasi kesesuaian dengan hukum korporat positif di Indonesia sebelum ditandatangani.'
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'semua' || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;

    setIsSubmitting(true);
    
    // Simulate API delay
    setTimeout(() => {
      setIsSubmitting(false);
      setTicketSuccess(true);
      
      // Smart Auto Response Generator based on content!
      const msgLower = ticketMessage.toLowerCase();
      let response = "Terima kasih telah menghubungi Pusat Bantuan BCI. Tiket dukungan Anda telah terdaftar dengan ID tiket #BCI-" + Math.floor(Math.random() * 90000 + 10000) + ". Tim Customer Relations kami akan menghubungi Anda melalui email dalam waktu maksimal 2 jam.";
      
      if (msgLower.includes('tender') || msgLower.includes('proyek')) {
        response = "Sistem Mendeteksi Kueri Tender: Pengajuan draf proposal tender memerlukan verifikasi sertifikasi TKDN. Pastikan dokumen NIB dan profil korporasi Anda di tab 'Profil Perusahaan' sudah lengkap sebelum mengajukan penawaran.";
      } else if (msgLower.includes('matching') || msgLower.includes('mitra')) {
        response = "Sistem Mendeteksi Kueri Matching: Algoritma Matching AI mencocokkan profil berdasarkan kata kunci industri dan deskripsi portofolio produk. Harap tingkatkan deskripsi portofolio Anda di Profil Perusahaan untuk hasil maksimal.";
      } else if (msgLower.includes('bayar') || msgLower.includes('membership') || msgLower.includes('pro') || msgLower.includes('enterprise')) {
        response = "Sistem Mendeteksi Kueri Pembayaran: Transaksi keanggotaan BCI diproses secara instan melalui payment gateway aman. Jika status Anda belum berubah, harap unggah bukti bayar di tiket ini untuk verifikasi manual oleh Finance Manager kami.";
      }
      
      setAutoResponse(response);
    }, 1200);
  };

  const resetForm = () => {
    setTicketSubject('');
    setTicketMessage('');
    setTicketSuccess(false);
    setAutoResponse(null);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      
      {/* Top Hero Section */}
      <div className="rounded-3xl bg-gradient-to-r from-[#FFC107] to-[#FF6B00] p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 space-y-2">
          <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
            <HelpCircle className="h-5.5 w-5.5 text-white animate-bounce" />
            <span>Pusat Bantuan & Edukasi Portal BCI</span>
          </h2>
          <p className="text-xs text-white/95 font-bold max-w-xl leading-relaxed">
            Temukan panduan lengkap cara melakukan Business Matching bertenaga AI, mendaftar tender proyek IKN, kepatuhan TKDN, hingga optimalisasi draf kognitif Generative AI.
          </p>
        </div>
      </div>

      {/* Search and Quick Filters */}
      <div className="bg-white rounded-3xl border border-slate-200/60 p-5 shadow-sm space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4.5 w-4.5 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ketik pertanyaan Anda di sini... (contoh: 'cara kerja matching', 'syarat tender')"
            className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-[#FF6B00] bg-white transition-all shadow-inner"
          />
        </div>

        {/* Categories Tab */}
        <div className="flex flex-wrap gap-2 pt-1">
          {categories.map((cat) => {
            const CatIcon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id as any);
                  setExpandedId(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#FFC107] to-[#FF6B00] text-white shadow-md'
                    : 'bg-slate-50 text-slate-600 border border-slate-200/40 hover:bg-slate-100'
                }`}
              >
                <CatIcon className="h-3.5 w-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Accordion FAQs List */}
      <div className="space-y-3">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            return (
              <div 
                key={faq.id} 
                className={`rounded-2xl border bg-white shadow-sm overflow-hidden transition-all duration-200 ${
                  isExpanded ? 'border-[#FF6B00] ring-1 ring-[#FF6B00]/20' : 'border-slate-200/60 hover:border-slate-300'
                }`}
              >
                {/* Accordion Trigger Header */}
                <button
                  onClick={() => toggleExpand(faq.id)}
                  className="w-full flex items-center justify-between text-left px-5 py-4 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3 pr-4">
                    <span className="text-xs font-black text-[#FF6B00] bg-orange-50 px-2 py-0.5 rounded-md uppercase tracking-wider text-[9px]">
                      {faq.category}
                    </span>
                    <span className="font-extrabold text-slate-800 text-xs sm:text-sm leading-snug">
                      {faq.question}
                    </span>
                  </div>
                  <ChevronDown 
                    className={`h-4 w-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
                      isExpanded ? 'rotate-180 text-[#FF6B00]' : ''
                    }`} 
                  />
                </button>

                {/* Accordion Content Panels */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 border-t border-slate-50 animate-fade-in">
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-semibold">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl border border-slate-200/60 bg-white p-12 text-center space-y-2">
            <BadgeAlert className="h-8 w-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-600">Panduan tidak ditemukan</p>
            <p className="text-[10px] text-slate-400">Gunakan filter pencarian lain atau pilih kategori di atas.</p>
          </div>
        )}
      </div>

      {/* Support Ticketing Center */}
      <div className="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm space-y-5">
        <div className="flex items-start gap-3.5 pb-4 border-b border-slate-100">
          <div className="p-2.5 rounded-2xl bg-orange-50 text-[#FF6B00]">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-extrabold text-slate-900 text-sm">Butuh Bantuan Lebih Lanjut? Hubungi Kami</h4>
            <p className="text-[10px] text-slate-400 font-bold">Kirim tiket dukungan, tim Customer Relations kami akan membalas segera.</p>
          </div>
        </div>

        {ticketSuccess ? (
          <div className="rounded-2xl bg-emerald-50/50 border border-emerald-100 p-5 space-y-4 animate-fade-in">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h5 className="text-xs font-black text-emerald-800">Tiket Dukungan Sukses Dikirim!</h5>
                <p className="text-[11px] text-emerald-700/90 leading-relaxed font-semibold">
                  Pertanyaan Anda telah berhasil dicatat dalam antrean prioritas sistem kedaulatan data BCI.
                </p>
              </div>
            </div>

            {autoResponse && (
              <div className="bg-white rounded-xl border border-emerald-100/80 p-4 space-y-2.5">
                <div className="flex items-center gap-1.5 text-[9px] font-black text-[#FF6B00] uppercase tracking-wider">
                  <Sparkles className="h-3 w-3 animate-pulse" />
                  <span>Saran Instan Sistem Pengetahuan BCI</span>
                </div>
                <p className="text-xs text-slate-600 font-bold leading-relaxed">{autoResponse}</p>
              </div>
            )}

            <button
              onClick={resetForm}
              className="text-xs font-extrabold text-[#FF6B00] hover:underline cursor-pointer"
            >
              Kirim Tiket Pertanyaan Lain
            </button>
          </div>
        ) : (
          <form onSubmit={handleTicketSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category selector */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-500 uppercase tracking-wider text-[10px] block">Kategori Masalah</label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 bg-white outline-none focus:border-[#FF6B00] cursor-pointer"
                >
                  <option value="umum">Umum & Akun</option>
                  <option value="matching">Business Matching AI</option>
                  <option value="tender">Prosedur Tender B2B</option>
                  <option value="ai">BCI AI Assistant</option>
                  <option value="pembayaran">Kendala Pembayaran / Premium</option>
                </select>
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-500 uppercase tracking-wider text-[10px] block">Subjek / Judul Masalah</label>
                <input
                  type="text"
                  required
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="Ketik topik bantuan..."
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-[#FF6B00] bg-white transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Message Body */}
            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-500 uppercase tracking-wider text-[10px] block">Pesan Detail Pertanyaan</label>
              <textarea
                required
                rows={3}
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
                placeholder="Deskripsikan kendala atau pertanyaan Anda sedetail mungkin agar tim teknis kami dapat langsung membantu..."
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:border-[#FF6B00] bg-white transition-all shadow-inner resize-none"
              ></textarea>
            </div>

            {/* Action Submit */}
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-[#FFC107] to-[#FF6B00] hover:brightness-105 text-white text-xs font-black px-5 py-2.5 rounded-2xl shadow-md shadow-orange-500/10 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full"></span>
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>Kirim Tiket Bantuan</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Guide Disclaimer Footer */}
      <div className="rounded-2xl bg-amber-50/50 border border-amber-100 p-4 flex gap-3">
        <ShieldAlert className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h5 className="text-xs font-extrabold text-amber-800">Eskalasi Prioritas & Kerahasiaan</h5>
          <p className="text-[10px] text-amber-700/95 leading-relaxed font-bold">
            Portal BCI menerapkan Sistem Kedaulatan Data sesuai regulasi UU PDP No. 27 Tahun 2022. Seluruh informasi teknis usaha, rahasia dagang, draf proposal tender, dan koordinasi chat B2B dilindungi oleh protokol keamanan militer end-to-end. Jika Anda memiliki eskalasi mendesak, silakan sebutkan ID Verifikasi Kemitraan Anda pada pengiriman tiket.
          </p>
        </div>
      </div>

    </div>
  );
}
