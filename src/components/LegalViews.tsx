import React, { useState } from 'react';
import { Shield, FileText, ChevronRight, Search, Scale, Landmark, Database, Users, Sparkles, HelpCircle, AlertCircle, CheckCircle } from 'lucide-react';

interface LegalViewsProps {
  initialTab?: 'terms' | 'privacy';
  onBackToDashboard?: () => void;
  isEmbed?: boolean; // If used as a modal inside Auth or profile
}

export default function LegalViews({ initialTab = 'terms', onBackToDashboard, isEmbed = false }: LegalViewsProps) {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');

  const termsSections = [
    {
      id: 'ketentuan-umum',
      title: '1. Ketentuan Umum & Definisi',
      icon: Scale,
      content: 'Selamat datang di Portal Business Connect Indonesia (Portal BCI). Dengan mengakses, mendaftar, atau menggunakan layanan kami, Anda menyetujui untuk terikat dengan seluruh syarat dan ketentuan yang tercantum di sini. Portal BCI adalah platform jaringan B2B terpadu yang memfasilitasi temu bisnis, B2B marketplace, tender proyek nasional, digitalisasi CRM, serta optimasi copywriting berbasis kecerdasan kognitif buatan (Generative AI). Pengguna didefinisikan sebagai entitas korporat, pemasok (supplier), kontraktor (vendor), investor, asosiasi, atau perwakilan individu resmi yang telah lolos verifikasi kualifikasi.'
    },
    {
      id: 'kepatuhan-tkdn',
      title: '2. Kepatuhan TKDN & Hukum Korporasi',
      icon: Landmark,
      content: 'Setiap entitas yang mendaftar sebagai Supplier atau Vendor diwajibkan memberikan informasi validasi kepatuhan hukum terkait Nomor Induk Berusaha (NIB), Nomor Pokok Wajib Pajak (NPWP), serta sertifikasi Tingkat Komponen Dalam Negeri (TKDN) yang diakreditasi oleh Kementerian Perindustrian Republik Indonesia jika relevan. Manipulasi dokumen legalitas atau pelaporan sertifikasi TKDN fiktif akan mengakibatkan pemblokiran akun secara permanen tanpa pengembalian biaya keanggotaan.'
    },
    {
      id: 'marketplace-tender',
      title: '3. Regulasi Tender & Marketplace B2B',
      icon: Users,
      content: 'Portal BCI bertindak sebagai fasilitator platform dan bukan merupakan pihak dalam transaksi bisnis, kontrak suplai, maupun kontrak pelaksanaan proyek tender antara pengguna. Segala kesepakatan komersial, jaminan kualitas barang/jasa, skema pembayaran, dan pemenuhan Non-Disclosure Agreement (NDA) adalah tanggung jawab penuh masing-masing pihak yang bertransaksi. Pengguna dilarang keras melakukan kolusi tender (bid-rigging), manipulasi harga, atau penawaran palsu.'
    },
    {
      id: 'generative-ai',
      title: '4. Tanggung Jawab Penggunaan BCI AI Assistant',
      icon: Sparkles,
      content: 'Layanan BCI AI Assistant ditenagai oleh model bahasa besar kognitif mutakhir. Draf dokumen hukum, proposal penawaran, surat kerja sama (MOU), dan materi promosi B2B yang dihasilkan oleh sistem AI bersifat saran rujukan (template) operasional. Pengguna memegang tanggung jawab penuh untuk meninjau kembali, memverifikasi kualifikasi hukum, dan menyesuaikan isi berkas tersebut sesuai dengan hukum positif yang berlaku di Republik Indonesia sebelum menandatangani atau menggunakannya secara resmi.'
    },
    {
      id: 'keanggotaan-pembayaran',
      title: '5. Program Membership & Biaya Layanan',
      icon: HelpCircle,
      content: 'Portal BCI menawarkan keanggotaan berjenjang (Free, Pro, Enterprise). Hak akses premium atas draf kognitif, matching kecerdasan buatan, dan detail tender IKN mengikuti status lisensi aktif. Pembayaran biaya langganan dilakukan secara berkala dan tidak dapat di-refund setelah akses fitur premium digunakan secara aktif.'
    }
  ];

  const privacySections = [
    {
      id: 'pengumpulan-data',
      title: '1. Jenis Data yang Kami Kumpulkan',
      icon: Database,
      content: 'Kami mengumpulkan data profil perusahaan termasuk nama entitas resmi, sektor industri, nomor kontak, surel (email), alamat kantor pusat, serta detail jabatan fungsional pengguna (seperti Direktur Utama, Komisaris, General Manager, hingga level Staf Operasional). Pengumpulan data ini ditujukan semata-mata untuk mengoptimalkan kecocokan kemitraan (business matching) dan akurasi verifikasi keanggotaan bisnis nasional.'
    },
    {
      id: 'kedaulatan-data',
      title: '2. Kedaulatan & Keamanan Data (Data Sovereignty)',
      icon: Shield,
      content: 'Sesuai dengan Undang-Undang Perlindungan Data Pribadi (UU PDP) Republik Indonesia, seluruh data transaksi B2B, riwayat pencarian tender, draf proposal AI, dan percakapan rahasia di Pusat Chat BCI disimpan dalam klaster server aman yang tunduk pada aturan kedaulatan data nasional. Kami mengimplementasikan enkripsi TLS saat transit dan enkripsi AES-256 pada database untuk mencegah kebocoran data.'
    },
    {
      id: 'pembagian-data',
      title: '3. Pembagian Data dengan Pihak Ketiga',
      icon: Users,
      content: 'Kami tidak akan pernah menjual, menyewakan, atau memberikan data rahasia perusahaan dan kontak fungsional pengguna kepada broker data eksternal. Informasi profil publik perusahaan hanya dibagikan kepada calon mitra bisnis dalam kerangka "Matching AI" atau partisipasi tender yang secara sadar diajukan atau disetujui oleh pengguna yang bersangkutan.'
    },
    {
      id: 'hak-pengguna',
      title: '4. Hak Akses & Penghapusan Data',
      icon: FileText,
      content: 'Setiap perwakilan perusahaan berhak untuk memperbarui informasi jabatan, mengubah preferensi bahasa komunikasi, mengedit portofolio, atau mengajukan penutupan akun secara permanen melalui Pengaturan Akun. Setelah penutupan akun disetujui, seluruh draf kognitif internal dan data historis yang bersifat privat akan dianonimkan atau dihapus secara permanen dalam waktu 30 hari kerja.'
    }
  ];

  const sectionsToRender = activeTab === 'terms' ? termsSections : privacySections;
  const filteredSections = sectionsToRender.filter(sec => 
    sec.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    sec.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`space-y-6 animate-fade-in ${isEmbed ? 'p-0' : 'max-w-4xl mx-auto'}`}>
      
      {/* Header Banner */}
      {!isEmbed && (
        <div className="rounded-3xl bg-gradient-to-r from-[#FFC107] to-[#FF6B00] p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-white animate-pulse" />
                <span>Kepatuhan Hukum & Privasi Portal BCI</span>
              </h2>
              <p className="text-xs text-white/90 font-bold max-w-xl">
                Dokumen resmi regulasi kepatuhan korporasi, kepatuhan TKDN, penggunaan kecerdasan buatan, serta jaminan perlindungan data fungsional pengguna BCI.
              </p>
            </div>
            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="self-start md:self-center bg-white/20 hover:bg-white/30 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl border border-white/20 cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
              >
                Kembali ke Dashboard
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Grid Interface */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        
        {/* Left Sidebar Menu / Navigation */}
        <div className="md:col-span-1 space-y-4">
          <div className="rounded-2xl border border-slate-200/60 bg-white p-3 shadow-sm space-y-1">
            <button
              onClick={() => { setActiveTab('terms'); setSearchQuery(''); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-black transition-all text-left cursor-pointer ${
                activeTab === 'terms'
                  ? 'bg-gradient-to-r from-[#FFC107]/10 to-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/20'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Persyaratan Layanan</span>
            </button>
            <button
              onClick={() => { setActiveTab('privacy'); setSearchQuery(''); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-black transition-all text-left cursor-pointer ${
                activeTab === 'privacy'
                  ? 'bg-gradient-to-r from-[#FFC107]/10 to-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/20'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Shield className="h-4 w-4" />
              <span>Kebijakan Privasi</span>
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm space-y-3">
            <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Status Regulasi</h4>
            <div className="space-y-2.5 text-[11px] font-bold text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <span>UU PDP No. 27/2022</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <span>Kepatuhan TKDN Kemenperin</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <span>Sertifikat Sandi Negara</span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[10px] font-bold text-slate-400">
              Pembaruan Terakhir:<br/>
              <span className="text-slate-600">17 Juli 2026</span>
            </div>
          </div>
        </div>

        {/* Right Main Legal Contents */}
        <div className="md:col-span-3 space-y-4">
          
          {/* Quick Search Tool */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4.5 w-4.5 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Cari dalam ${activeTab === 'terms' ? 'Persyaratan Layanan' : 'Kebijakan Privasi'} BCI...`}
              className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-[#FF6B00] bg-white transition-all shadow-inner"
            />
          </div>

          {/* Render Documents list */}
          <div className="space-y-4">
            {filteredSections.length > 0 ? (
              filteredSections.map((sec) => {
                const SecIcon = sec.icon;
                return (
                  <div key={sec.id} className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm space-y-3 hover:border-[#FF6B00]/20 transition-all">
                    <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100">
                      <div className="p-1.5 rounded-lg bg-orange-50 text-[#FF6B00]">
                        <SecIcon className="h-4 w-4" />
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-sm">{sec.title}</h3>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {sec.content}
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-slate-200/60 bg-white p-12 text-center space-y-2">
                <AlertCircle className="h-8 w-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-600">Hasil pencarian tidak ditemukan</p>
                <p className="text-[10px] text-slate-400">Silakan gunakan kata kunci lain seperti "AI", "TKDN", "Data", atau "Tender".</p>
              </div>
            )}
          </div>

          {/* Quick Consent Notice Footer */}
          <div className="rounded-2xl bg-amber-50/50 border border-amber-100 p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="text-xs font-extrabold text-amber-800">Persetujuan Eksplisit</h5>
              <p className="text-[10px] text-amber-700/90 leading-relaxed font-bold">
                Dengan terus mengoperasikan akun Anda, mengikuti business matching, mengunggah portofolio penawaran, atau menggunakan utilitas BCI AI Assistant, Anda secara otomatis menyatakan persetujuan tanpa syarat terhadap regulasi Persyaratan Layanan dan Kebijakan Privasi Portal BCI yang berlaku.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
