import React, { useState } from 'react';
import {
  Building2,
  Calendar,
  Award,
  Globe,
  Mail,
  Phone,
  FileText,
  MapPin,
  CheckCircle,
  Users,
  Video,
  ExternalLink,
  MessageSquare,
  Bookmark,
  ChevronRight,
  Plus,
  Send,
  UserCheck,
  Settings,
  Lock,
  Languages,
  Check,
  Loader2,
  Camera,
  Eye,
  EyeOff,
  User as UserIcon,
  Shield,
  Bell,
  Sparkles,
  Trash2,
  Briefcase,
  Save
} from 'lucide-react';
import { AppDatabase, Company, User } from '../types';
import ProfileImageEditor from './ProfileImageEditor';
import { generateB2BDocumentPDF } from '../utils/pdfExport';

interface CompanyProfileViewProps {
  db: AppDatabase;
  currentUser: User;
  onViewChange: (view: string) => void;
  onSetPrefilledChat: (partnerId: string, message: string) => void;
  onRefresh: () => void;
}

export default function CompanyProfileView({
  db,
  currentUser,
  onViewChange,
  onSetPrefilledChat,
  onRefresh
}: CompanyProfileViewProps) {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(db.companies[0]?.id || '');
  
  // Navigation / Tab mode
  const [activeMode, setActiveMode] = useState<'directory' | 'settings' | 'company_settings'>('directory');

  // Settings states (ganti tlp, ganti password, bahasa, dll)
  const [settingsName, setSettingsName] = useState(currentUser.name);
  const [settingsPhone, setSettingsPhone] = useState(currentUser.phone || '');
  const [settingsPassword, setSettingsPassword] = useState(currentUser.password || '');
  const [settingsLanguage, setSettingsLanguage] = useState<'id' | 'en'>(currentUser.language || 'id');
  const [settingsPosition, setSettingsPosition] = useState(currentUser.position || '');
  const [settingsAvatar, setSettingsAvatar] = useState(currentUser.avatar);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsError, setSettingsError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [imageEditorTarget, setImageEditorTarget] = useState<'avatar' | 'companyLogo' | 'companyCover' | null>(null);

  // Default avatars for quick selector
  const defaultAvatars = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120",
    "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&q=80&w=120",
    "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=120"
  ];

  // Schedule meeting state
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingTopic, setMeetingTopic] = useState('');
  const [meetingSuccess, setMeetingSuccess] = useState(false);

  // --- Company Settings States ---
  const userCompany = db.companies.find(c => c.id === currentUser.companyId) || db.companies[0];

  const [companyName, setCompanyName] = useState(userCompany?.name || 'Perusahaan Baru BCI');
  const [companyLogo, setCompanyLogo] = useState(userCompany?.logo || 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=100');
  const [companyCover, setCompanyCover] = useState(userCompany?.cover || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600');
  const [companySector, setCompanySector] = useState(userCompany?.sector || 'Telekomunikasi & Teknologi');
  const [companyDescription, setCompanyDescription] = useState(userCompany?.description || 'Profil B2B perusahaan kami yang berkomitmen tinggi memberikan pelayanan terbaik.');
  const [companyFoundedYear, setCompanyFoundedYear] = useState(userCompany?.foundedYear || 2020);
  const [companyNIB, setCompanyNIB] = useState(userCompany?.legality?.nib || '9120001000000');
  const [companyNPWP, setCompanyNPWP] = useState(userCompany?.legality?.npwp || '01.000.000.0-000.000');
  const [companyCertificates, setCompanyCertificates] = useState<string[]>(userCompany?.legality?.certificates || ['Sertifikasi Standardisasi Nasional']);
  const [companyCity, setCompanyCity] = useState(userCompany?.address?.city || 'Jakarta');
  const [companyProvince, setCompanyProvince] = useState(userCompany?.address?.province || 'DKI Jakarta');
  const [companyFullAddress, setCompanyFullAddress] = useState(userCompany?.address?.fullAddress || 'Jl. Jendral Sudirman Kav. 52');
  const [companyPostalCode, setCompanyPostalCode] = useState('12190');
  const [companyTagline, setCompanyTagline] = useState('Partner Terpercaya Infrastruktur & Solusi B2B Enterprise');
  const [companyMapsUrl, setCompanyMapsUrl] = useState(userCompany?.address?.mapsUrl || 'https://maps.google.com');
  const [companyWebsite, setCompanyWebsite] = useState(userCompany?.contact?.website || '');
  const [companyEmail, setCompanyEmail] = useState(userCompany?.contact?.email || currentUser.email);
  const [companyWhatsapp, setCompanyWhatsapp] = useState(userCompany?.contact?.whatsapp || '');
  const [companyLinkedin, setCompanyLinkedin] = useState(userCompany?.contact?.socialMedia?.linkedin || '');
  const [companyInstagram, setCompanyInstagram] = useState(userCompany?.contact?.socialMedia?.instagram || '');
  const [companyVideoUrl, setCompanyVideoUrl] = useState(userCompany?.videoProfileUrl || '');
  const [companyEmployees, setCompanyEmployees] = useState(userCompany?.employeesCount || 10);
  const [companyServices, setCompanyServices] = useState<string[]>(userCompany?.services || ['Konsultasi TI', 'Solusi Enterprise']);
  const [companyPortfolio, setCompanyPortfolio] = useState(userCompany?.portfolio || [
    { title: "Rencana Pembangunan Infrastruktur B2B", description: "Penyusunan rencana layanan interkoneksi bisnis terpadu.", year: 2026 }
  ]);
  const [companyProducts, setCompanyProducts] = useState(userCompany?.products || []);

  const [newCertificate, setNewCertificate] = useState('');
  const [newService, setNewService] = useState('');

  // Preset Corporate Logos
  const presetLogos = [
    { name: 'Teknologi & Solusi', url: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=150' },
    { name: 'Infrastruktur & Konstruksi', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&q=80&w=150' },
    { name: 'Investasi & Finansial', url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=150' },
    { name: 'Logistik & Kargo', url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=150' },
    { name: 'Energi & Manufaktur', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=150' }
  ];

  // Handler for Export Test Document with Branding Header Embedded
  const handleTestBrandingExport = () => {
    generateB2BDocumentPDF({
      docType: 'contract',
      docNumber: 'B2B/MOU/' + new Date().getFullYear() + '/001',
      docDate: new Date().toLocaleDateString('id-ID'),
      issuerName: currentUser.name,
      issuerCompany: companyName,
      issuerAddress: `${companyFullAddress}, ${companyCity}, ${companyProvince} ${companyPostalCode}`,
      issuerTaxId: `NIB: ${companyNIB} | NPWP: ${companyNPWP}`,
      issuerLogo: companyLogo,
      recipientName: 'Mitra Usaha B2B BCI',
      recipientCompany: 'PT Kemitraan Nusantara Enterprise',
      recipientAddress: 'Jl. Gatot Subroto No. 88, Jakarta Selatan',
      items: [
        { description: `Paket Kemitraan Strategis & Layanan Industri ${companySector}`, qty: 1, unit: 'Kontrak', unitPrice: 350000000 }
      ],
      includePPN: true,
      includePPh23: false,
      notes: `Diterbitkan otomatis dengan Profil Branding resmi ${companyName}. Alamat resmi & logo perusahaan disematkan pada setiap lembar dokumen B2B.`
    });
  };

  // Portfolio addition forms
  const [newPortTitle, setNewPortTitle] = useState('');
  const [newPortDesc, setNewPortDesc] = useState('');
  const [newPortYear, setNewPortYear] = useState(2026);

  // Product addition forms
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState(100000);
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImg, setNewProdImg] = useState('https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=150');

  const [companySuccess, setCompanySuccess] = useState('');
  const [companyError, setCompanyError] = useState('');
  const [companyLoading, setCompanyLoading] = useState(false);

  const selectedCompany = db.companies.find(c => c.id === selectedCompanyId) || db.companies[0];

  if (!selectedCompany) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 text-sm">Belum ada profil perusahaan.</p>
      </div>
    );
  }

  const isFollowing = selectedCompany.followedBy.includes(currentUser.id);

  // Handle Follow
  const handleFollow = async () => {
    try {
      const response = await fetch('/api/company/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: selectedCompany.id,
          userId: currentUser.id
        })
      });
      if (response.ok) {
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Chat with company helper
  const handleChatDirectly = (prefilledMsg = "") => {
    // Find representative user
    const rep = db.users.find(u => u.companyId === selectedCompany.id) || db.users[0];
    onSetPrefilledChat(rep.id, prefilledMsg || `Halo ${selectedCompany.name}, saya sangat tertarik untuk bekerja sama.`);
    onViewChange('chat');
  };

  // Schedule Meeting submission
  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingDate || !meetingTime || !meetingTopic) return;

    // Simulate API call or sync
    setMeetingSuccess(true);
    setTimeout(() => {
      setShowMeetingModal(false);
      setMeetingSuccess(false);
      setMeetingDate('');
      setMeetingTime('');
      setMeetingTopic('');
    }, 2000);
  };

  // Save Settings handler
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsSuccess('');
    setSettingsError('');

    try {
      const response = await fetch('/api/user/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          name: settingsName,
          phone: settingsPhone,
          password: settingsPassword,
          language: settingsLanguage,
          avatar: settingsAvatar,
          position: settingsPosition
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSettingsSuccess('Pengaturan berhasil diperbarui!');
        onRefresh();
      } else {
        setSettingsError(data.error || 'Gagal memperbarui pengaturan.');
      }
    } catch (err) {
      console.error(err);
      setSettingsError('Koneksi portal terganggu. Silakan coba sesaat lagi.');
    } finally {
      setSettingsLoading(false);
    }
  };

  // Save Company Profile handler
  const handleSaveCompanySettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setCompanyLoading(true);
    setCompanySuccess('');
    setCompanyError('');

    try {
      const response = await fetch('/api/company/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          companyId: currentUser.companyId,
          companyData: {
            name: companyName,
            logo: companyLogo,
            cover: companyCover,
            sector: companySector,
            description: companyDescription,
            foundedYear: Number(companyFoundedYear),
            legality: {
              nib: companyNIB,
              npwp: companyNPWP,
              certificates: companyCertificates
            },
            address: {
              city: companyCity,
              province: companyProvince,
              fullAddress: companyFullAddress,
              mapsUrl: companyMapsUrl
            },
            contact: {
              website: companyWebsite,
              email: companyEmail,
              whatsapp: companyWhatsapp,
              socialMedia: {
                linkedin: companyLinkedin,
                instagram: companyInstagram
              }
            },
            videoProfileUrl: companyVideoUrl,
            services: companyServices,
            portfolio: companyPortfolio,
            products: companyProducts,
            employeesCount: Number(companyEmployees)
          }
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setCompanySuccess('Profil Perusahaan B2B berhasil diperbarui secara permanen!');
        if (data.user && !currentUser.companyId) {
          currentUser.companyId = data.user.companyId;
        }
        onRefresh();
      } else {
        setCompanyError(data.error || 'Gagal memperbarui profil perusahaan.');
      }
    } catch (err) {
      console.error(err);
      setCompanyError('Koneksi portal terganggu. Silakan coba sesaat lagi.');
    } finally {
      setCompanyLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Profile Tab Switcher */}
      <div className="flex bg-white/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/50 shadow-sm gap-2">
        <button
          onClick={() => setActiveMode('directory')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeMode === 'directory'
              ? 'bg-gradient-to-r from-[#FFC107] to-[#FF6B00] text-white shadow-md shadow-orange-500/10'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
          id="tab-profile-directory"
        >
          <Building2 className="h-4 w-4" />
          <span className="hidden sm:inline">Eksplorasi Perusahaan B2B</span>
          <span className="sm:hidden">Eksplorasi</span>
        </button>
        <button
          onClick={() => setActiveMode('settings')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeMode === 'settings'
              ? 'bg-gradient-to-r from-[#FFC107] to-[#FF6B00] text-white shadow-md shadow-orange-500/10'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
          id="tab-profile-settings"
        >
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Pengaturan Akun Saya ⚙️</span>
          <span className="sm:hidden">Akun ⚙️</span>
        </button>
        <button
          onClick={() => setActiveMode('company_settings')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeMode === 'company_settings'
              ? 'bg-gradient-to-r from-[#FFC107] to-[#FF6B00] text-white shadow-md shadow-orange-500/10'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
          id="tab-profile-company-settings"
        >
          <Briefcase className="h-4 w-4" />
          <span className="hidden sm:inline">Profil Perusahaan B2B 🏢</span>
          <span className="sm:hidden">Perusahaan 🏢</span>
        </button>
      </div>

      {activeMode === 'directory' && (
        <div className="space-y-6 animate-fade-in">
          {/* Company Selector Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/60 shadow-md glass-card glossy-top-highlight">
            <div>
              <h3 className="font-black text-slate-900 text-sm">Lihat Perusahaan Terdaftar:</h3>
              <p className="text-[11px] text-slate-400 font-bold mt-0.5">Verifikasi berkas, legalitas usaha, dan profil kualifikasi eksekutif</p>
            </div>
            <div className="flex gap-2">
              {db.companies.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCompanyId(c.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer shadow-sm border ${
                    selectedCompany.id === c.id
                      ? 'bg-gradient-to-r from-[#FFC107] to-[#FF6B00] text-white border-none shadow-md shadow-orange-500/15'
                      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {c.name.split(' ')[1] || c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Main visual Card: Cover and Header Info */}
          <div className="rounded-3xl border border-slate-200/60 bg-white overflow-hidden shadow-md glass-card glossy-top-highlight">
            <div className="relative h-48 sm:h-64 bg-slate-100">
              <img src={selectedCompany.cover} alt="Cover" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
            </div>

            {/* Profile Details Container */}
            <div className="relative px-6 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 gap-4 mb-4">
                <img
                  src={selectedCompany.logo}
                  alt="Logo"
                  className="h-28 w-28 sm:h-32 sm:w-32 rounded-3xl object-cover border-4 border-white bg-white shadow-md"
                />
                
                {/* Call to actions buttons */}
                <div className="flex flex-wrap gap-2 text-xs">
                  <button
                    onClick={handleFollow}
                    className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 font-black shadow-sm transition-all cursor-pointer border ${
                      isFollowing
                        ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                        : 'bg-[#FF6B00] hover:bg-orange-700 text-white border-none shadow-md shadow-orange-500/10'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="h-4 w-4" />
                        <span>Diikuti</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleChatDirectly()}
                    className="flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2.5 font-black text-slate-700 transition-all cursor-pointer shadow-sm"
                  >
                    <MessageSquare className="h-4 w-4 text-[#FF6B00]" />
                    <span>Kirim Chat</span>
                  </button>

                  <button
                    onClick={() => setShowMeetingModal(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-orange-50 border border-orange-200/50 hover:bg-orange-100 px-4 py-2.5 font-black text-[#FF6B00] transition-all cursor-pointer shadow-sm"
                  >
                    <Calendar className="h-4 w-4 text-[#FF6B00]" />
                    <span>Jadwal Meeting</span>
                  </button>
                </div>
              </div>

              {/* Company Name & Sector description */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {selectedCompany.name}
                  </h1>
                  {selectedCompany.isVerified && (
                    <span className="flex items-center gap-1 rounded-xl bg-orange-50 border border-orange-200/50 px-2.5 py-1 text-[10px] font-black text-[#FF6B00] shadow-sm">
                      <CheckCircle className="h-3 w-3 text-[#FF6B00] fill-orange-50" />
                      <span>Kepatuhan NIB Lolos</span>
                    </span>
                  )}
                </div>

                <p className="text-xs font-black text-slate-400 uppercase tracking-wider">
                  Sektor: {selectedCompany.sector} • Didirikan: {selectedCompany.foundedYear}
                </p>
                <p className="text-sm text-slate-600 leading-relaxed max-w-4xl font-semibold">
                  {selectedCompany.description}
                </p>
              </div>

              {/* Followers count row */}
              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-100 text-xs font-black text-slate-500">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-slate-400" />
                  <span>{selectedCompany.followersCount} Followers</span>
                </div>
                <div className="flex items-center gap-1">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  <span>{selectedCompany.employeesCount} Karyawan</span>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  <span>★ {selectedCompany.rating}</span>
                  <span className="text-slate-400">({selectedCompany.reviewsCount} review)</span>
                </div>
              </div>

            </div>
          </div>

          {/* Profile Sections: Tabs Grid layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Columns (About, Portfolio, Products) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Legalitas & Sertifikat */}
              <div className="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-md glass-card glossy-top-highlight">
                <h3 className="font-black text-slate-900 text-base mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-[#FF6B00]" />
                  Kredibilitas Hukum & Sertifikasi Industri
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-slate-50/50 p-4 border border-slate-100 text-xs font-bold text-slate-700">
                    <p className="text-slate-400 uppercase">Nomor Induk Berusaha (NIB)</p>
                    <p className="font-mono text-slate-900 font-black text-sm mt-1">{selectedCompany.legality.nib}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50/50 p-4 border border-slate-100 text-xs font-bold text-slate-700">
                    <p className="text-slate-400 uppercase">NPWP Pajak Perusahaan</p>
                    <p className="font-mono text-slate-900 font-black text-sm mt-1">{selectedCompany.legality.npwp}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-black text-slate-500 mb-2">Sertifikat Terdaftar:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCompany.legality.certificates.map((cert, i) => (
                      <span key={i} className="text-[11px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-1">
                        ✓ {cert}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Video Profile */}
              <div className="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-md glass-card glossy-top-highlight">
                <h3 className="font-black text-slate-900 text-base mb-4 flex items-center gap-2">
                  <Video className="h-5 w-5 text-[#FF6B00]" />
                  Company Video Profile
                </h3>
                <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-900 border border-slate-200 shadow-inner">
                  <video
                    src={selectedCompany.videoProfileUrl}
                    controls
                    className="w-full h-full object-cover"
                    poster="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600"
                  />
                </div>
              </div>

              {/* Portofolio Proyek */}
              <div className="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-md glass-card glossy-top-highlight">
                <h3 className="font-black text-slate-900 text-base mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#FF6B00]" />
                  Portofolio Rekam Jejak Proyek
                </h3>
                <div className="space-y-4">
                  {selectedCompany.portfolio.map((p, i) => (
                    <div key={i} className="flex gap-4 p-4 border border-slate-150 rounded-2xl hover:bg-slate-50/50 transition-all text-xs">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-[#FF6B00] font-black text-sm flex-shrink-0 border border-orange-100">
                        {p.year}
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-slate-900">{p.title}</h4>
                        <p className="text-slate-500 mt-1 leading-relaxed font-semibold">{p.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Produk / Layanan Unggulan */}
              {selectedCompany.products.length > 0 && (
                <div className="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-md glass-card glossy-top-highlight">
                  <h3 className="font-black text-slate-900 text-base mb-4">Produk & Layanan Unggulan</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedCompany.products.map((prod, i) => (
                      <div key={i} className="flex flex-col border border-slate-200 rounded-2xl overflow-hidden text-xs shadow-sm hover:shadow-md transition-all bg-white">
                        <img src={prod.image} alt={prod.name} className="h-32 w-full object-cover border-b border-slate-100" />
                        <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-black text-sm text-slate-900">{prod.name}</h4>
                            <p className="text-slate-500 line-clamp-2 mt-1 font-semibold">{prod.description}</p>
                          </div>
                          <div className="pt-2 border-t border-slate-100 mt-3 flex items-center justify-between">
                            <span className="font-black text-[#FF6B00] text-sm">
                              Rp{prod.price.toLocaleString('id-ID')}
                            </span>
                            <button
                              onClick={() => handleChatDirectly(`Halo, saya tertarik menanyakan penawaran produk "${prod.name}"`)}
                              className="rounded-xl bg-orange-50 hover:bg-orange-100 text-[#FF6B00] border border-orange-100 px-3 py-1.5 text-[10px] font-black cursor-pointer transition-colors"
                            >
                              Minta Penawaran
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Right Column: Contact & Location details */}
            <div className="space-y-6">
              
              {/* Contact Details card */}
              <div className="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-md glass-card glossy-top-highlight space-y-4">
                <h3 className="font-black text-slate-900 text-sm">Hubungi Perusahaan</h3>
                
                <div className="space-y-3.5 text-xs text-slate-600 font-semibold">
                  {selectedCompany.contact.website && (
                    <a href={selectedCompany.contact.website} target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-[#FF6B00] transition-colors">
                      <Globe className="h-4 w-4 text-slate-400" />
                      <span className="truncate">{selectedCompany.contact.website}</span>
                      <ExternalLink className="h-3 w-3 text-slate-400 ml-auto" />
                    </a>
                  )}
                  
                  <a href={`mailto:${selectedCompany.contact.email}`} className="flex items-center gap-3 hover:text-[#FF6B00] transition-colors">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span className="truncate">{selectedCompany.contact.email}</span>
                  </a>

                  <a href={`https://wa.me/${selectedCompany.contact.whatsapp.replace('+', '')}`} className="flex items-center gap-3 hover:text-[#FF6B00] transition-colors">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span className="truncate">{selectedCompany.contact.whatsapp} (WhatsApp)</span>
                  </a>
                </div>

                <div className="h-px bg-slate-100"></div>

                <div className="text-xs space-y-2">
                  <p className="font-black text-slate-800">Layanan Spesialisasi:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCompany.services.map((srv, i) => (
                      <span key={i} className="text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1">
                        {srv}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Maps / Location Address details */}
              <div className="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-md glass-card glossy-top-highlight space-y-4">
                <h3 className="font-black text-slate-900 text-sm">Lokasi & Alamat</h3>
                <div className="text-xs space-y-2">
                  <p className="flex items-start gap-2 text-slate-600 font-semibold">
                    <MapPin className="h-4 w-4 text-[#FF6B00] mt-0.5 flex-shrink-0" />
                    <span>{selectedCompany.address.fullAddress}, {selectedCompany.address.city}, {selectedCompany.address.province}</span>
                  </p>
                </div>
                
                {/* Simulated Map visual */}
                <div className="rounded-2xl border border-orange-100 h-36 overflow-hidden relative bg-orange-50/50 flex items-center justify-center">
                  <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#FF6B00_1px,transparent_1px)] [background-size:16px_16px]"></div>
                  <div className="relative text-center p-4">
                    <MapPin className="h-7 w-7 text-[#FF6B00] mx-auto mb-1 animate-bounce" />
                    <p className="text-[10px] font-black text-[#FF6B00]">{selectedCompany.address.city}</p>
                    <a
                      href={selectedCompany.address.mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[9px] text-[#FF6B00] font-black underline mt-1 block"
                    >
                      Buka Google Maps
                    </a>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {activeMode === 'settings' && (
        /* ACCOUNT SETTINGS VIEW */
        <div className="space-y-6 animate-fade-in">
          {/* Header Card Profile Summary */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 text-white rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex flex-col sm:flex-row items-center gap-5 z-10">
              <div 
                className="relative group cursor-pointer"
                onClick={() => setShowImageEditor(true)}
                title="Buka Studio Edit Foto Profil BCI"
              >
                <img
                  src={settingsAvatar}
                  alt={currentUser.name}
                  className="h-24 w-24 rounded-3xl object-cover ring-4 ring-amber-500/50 shadow-lg group-hover:scale-105 transition-all"
                />
                <div className="absolute bottom-1 right-1 bg-amber-500 hover:bg-amber-600 text-white p-1.5 rounded-xl shadow-md transition-all group-hover:bg-[#FF6B00]">
                  <Camera className="h-4 w-4" />
                </div>
              </div>
              <div className="text-center sm:text-left space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-lg font-black tracking-tight">{currentUser.name}</h2>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {currentUser.role}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-bold">{currentUser.email}</p>
                {currentUser.position && (
                  <p className="text-xs text-[#FF6B00] font-black uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                    <Briefcase className="h-3.5 w-3.5" />
                    <span>{currentUser.position}</span>
                  </p>
                )}
                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[10px] text-slate-400 font-black uppercase mt-1">
                  <span>Keanggotaan BCI:</span>
                  <span className="text-amber-400 font-black">{currentUser.membership}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap z-10">
              <button
                onClick={() => onViewChange('membership')}
                className="px-4 py-2.5 rounded-2xl text-xs font-black bg-gradient-to-r from-[#FFC107] to-[#FF6B00] text-white hover:brightness-105 shadow-md shadow-orange-500/20 transition-all cursor-pointer"
              >
                Upgrade Keanggotaan
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left side: Quick Guides & Avatar selector */}
            <div className="space-y-6">
              {/* Quick Avatar Selector Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-md glass-card glossy-top-highlight space-y-4">
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <Camera className="h-4 w-4 text-[#FF6B00]" />
                  Ganti Foto Profil
                </h3>
                <p className="text-[11px] text-slate-400 font-bold leading-relaxed">Pilih salah satu avatar standar ekosistem BCI di bawah ini:</p>
                
                <div className="grid grid-cols-3 gap-3">
                  {defaultAvatars.map((av, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSettingsAvatar(av)}
                      className={`relative rounded-2xl overflow-hidden aspect-square ring-2 transition-all cursor-pointer ${
                        settingsAvatar === av ? 'ring-[#FF6B00] scale-105 shadow-md' : 'ring-transparent hover:ring-slate-200'
                      }`}
                    >
                      <img src={av} alt={`Pilihan Avatar ${index + 1}`} className="w-full h-full object-cover" />
                      {settingsAvatar === av && (
                        <div className="absolute inset-0 bg-[#FF6B00]/20 flex items-center justify-center">
                          <Check className="h-5 w-5 text-white filter drop-shadow" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1.5">Atau Masukkan URL Kustom</label>
                  <input
                    type="url"
                    value={settingsAvatar}
                    onChange={(e) => setSettingsAvatar(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full text-[11px] rounded-xl border border-slate-200 p-2.5 outline-none focus:border-[#FF6B00] font-bold shadow-inner text-slate-700"
                  />
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowImageEditor(true)}
                    className="w-full flex items-center justify-center gap-2.5 py-3 px-4 bg-gradient-to-r from-amber-500/10 to-orange-500/15 border border-orange-200/60 hover:from-amber-500/20 hover:to-orange-500/25 rounded-2xl text-xs font-black text-[#FF6B00] shadow-sm transition-all cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4 text-[#FF6B00] animate-pulse" />
                    <span>Buka Studio Foto Profil Mandiri 🎨</span>
                  </button>
                  <p className="text-[9px] text-center text-slate-400 font-bold mt-1.5 uppercase tracking-wide">Unggah foto sendiri, edit pencahayaan & haluskan wajah</p>
                </div>
              </div>

              {/* Status & Trust info */}
              <div className="bg-orange-50/40 rounded-3xl p-6 border border-orange-200/20 space-y-3">
                <h4 className="font-black text-slate-900 text-xs flex items-center gap-1.5 text-[#FF6B00]">
                  <Shield className="h-4 w-4" />
                  Keamanan Informasi B2B
                </h4>
                <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                  Semua data profil Anda dilindungi dengan standar enkripsi niaga. Informasi penting seperti nomor telepon dan legalitas dipantau secara real-time demi meminimalisir risiko penipuan di portal nasional BCI.
                </p>
              </div>
            </div>

            {/* Right side: Detailed Settings Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-md glass-card glossy-top-highlight space-y-6">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-slate-900 text-sm">Informasi Personal & Pengaturan</h3>
                    <p className="text-[11px] text-slate-400 font-bold mt-0.5">Lengkapi profil Anda agar terlihat tepercaya di hadapan calon mitra dagang</p>
                  </div>
                  <Settings className="h-4.5 w-4.5 text-[#FF6B00] animate-spin" style={{ animationDuration: '6s' }} />
                </div>

                {/* Alerts */}
                {settingsSuccess && (
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-xs text-emerald-800 font-bold flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span>{settingsSuccess}</span>
                  </div>
                )}
                {settingsError && (
                  <div className="rounded-2xl bg-rose-50 border border-rose-100 p-4 text-xs text-rose-700 font-bold flex items-center gap-2">
                    <Shield className="h-4 w-4 text-rose-600 flex-shrink-0" />
                    <span>{settingsError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
                  {/* Name field */}
                  <div className="space-y-1.5 col-span-1 sm:col-span-2">
                    <label className="font-extrabold text-slate-500 uppercase tracking-wider block">Nama Lengkap Eksekutif</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <UserIcon className="h-4.5 w-4.5 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        required
                        value={settingsName}
                        onChange={(e) => setSettingsName(e.target.value)}
                        placeholder="Contoh: Ir. Budi Santoso"
                        className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-3 outline-none focus:border-[#FF6B00] font-bold shadow-inner text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Jabatan Pengguna (Job Position Selection from bottom to top) */}
                  <div className="space-y-1.5 col-span-1 sm:col-span-2">
                    <label className="font-extrabold text-slate-500 uppercase tracking-wider block">Jabatan / Posisi Eksekutif</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Briefcase className="h-4.5 w-4.5 text-slate-400" />
                      </div>
                      <select
                        required
                        value={settingsPosition}
                        onChange={(e) => setSettingsPosition(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 pl-10 pr-10 py-3 outline-none focus:border-[#FF6B00] font-bold shadow-inner text-slate-800 bg-white cursor-pointer appearance-none"
                      >
                        <option value="" disabled>-- Pilih Jabatan Anda --</option>
                        
                        <optgroup label="1. Manajemen Puncak & Eksekutif (Level Atas)">
                          <option value="Komisaris Utama">Komisaris Utama (President Commissioner)</option>
                          <option value="Komisaris">Komisaris (Commissioner)</option>
                          <option value="Direktur Utama / CEO">Direktur Utama / CEO (Chief Executive Officer)</option>
                          <option value="Direktur Operasional / COO">Direktur Operasional / COO (Chief Operating Officer)</option>
                          <option value="Direktur Keuangan / CFO">Direktur Keuangan / CFO (Chief Financial Officer)</option>
                          <option value="Direktur Teknologi / CTO">Direktur Teknologi / CTO (Chief Technology Officer)</option>
                          <option value="Direktur Pemasaran / CMO">Direktur Pemasaran / CMO (Chief Marketing Officer)</option>
                          <option value="Direktur / Executive Director">Direktur / Executive Director</option>
                        </optgroup>

                        <optgroup label="2. Manajemen Senior (Level Menengah Atas)">
                          <option value="General Manager / Kepala Divisi">General Manager / Kepala Divisi (GM)</option>
                          <option value="Vice President / VP">Vice President / VP</option>
                          <option value="Deputi Direktur">Deputi Direktur (Deputy Director)</option>
                          <option value="Manajer Senior / Senior Manager">Manajer Senior / Senior Manager</option>
                        </optgroup>

                        <optgroup label="3. Manajer & Kepala Bagian (Level Menengah)">
                          <option value="Manajer Regional">Manajer Regional (Regional Manager)</option>
                          <option value="Manajer Cabang">Manajer Cabang (Branch Manager)</option>
                          <option value="Manajer Departemen">Manajer Departemen (Manager)</option>
                          <option value="Asisten Manajer">Asisten Manajer (Assistant Manager)</option>
                          <option value="Kepala Bagian / Head of Section">Kepala Bagian / Head of Section</option>
                        </optgroup>

                        <optgroup label="4. Supervisor & Koordinator (Level Pengawas)">
                          <option value="Supervisor / Pengawas Lapangan">Supervisor / Pengawas Lapangan</option>
                          <option value="Koordinator Tim / Project Coordinator">Koordinator Tim / Project Coordinator</option>
                          <option value="Kepala Regu / Team Leader">Kepala Regu / Team Leader</option>
                        </optgroup>

                        <optgroup label="5. Spesialis & Senior Staff (Level Spesialis)">
                          <option value="Spesialis Kanan / Senior Specialist">Spesialis Kanan / Senior Specialist</option>
                          <option value="Analis Kanan / Senior Analyst">Analis Kanan / Senior Analyst</option>
                          <option value="Staf Ahli / Specialist">Staf Ahli / Specialist</option>
                          <option value="Staf Senior / Senior Staff">Staf Senior / Senior Staff</option>
                        </optgroup>

                        <optgroup label="6. Staf Operasional & Administrasi (Level Pelaksana)">
                          <option value="Staf Teknis / Engineer / Developer">Staf Teknis / Engineer / Developer</option>
                          <option value="Staf Operasional / Pelaksana">Staf Operasional / Pelaksana</option>
                          <option value="Staf Administrasi">Staf Administrasi (Admin)</option>
                          <option value="Staf Keuangan / Akuntan">Staf Keuangan / Akuntan</option>
                          <option value="Staf Pemasaran / Sales / Marketing">Staf Pemasaran / Sales / Marketing</option>
                          <option value="Staf Layanan Pelanggan / Customer Service">Staf Layanan Pelanggan / Customer Service</option>
                          <option value="Staf Logistik / Gudang">Staf Logistik / Gudang</option>
                        </optgroup>

                        <optgroup label="7. Pemula & Magang (Level Bawah)">
                          <option value="Staf Kontrak / Junior Staff">Staf Kontrak / Junior Staff</option>
                          <option value="Magang / Intern">Magang / Intern (Internship)</option>
                        </optgroup>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                        <ChevronRight className="h-4 w-4 rotate-90 transform" />
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold mt-1 block">Pilih tingkat jabatan komplit yang sesuai dengan peran Anda di perusahaan saat ini.</span>
                  </div>

                  {/* Phone number field (ganti nomor tlp) */}
                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-500 uppercase tracking-wider block">Nomor Telepon / WhatsApp</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Phone className="h-4.5 w-4.5 text-slate-400" />
                      </div>
                      <input
                        type="tel"
                        required
                        value={settingsPhone}
                        onChange={(e) => setSettingsPhone(e.target.value)}
                        placeholder="Contoh: +628123456789"
                        className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-3 outline-none focus:border-[#FF6B00] font-bold shadow-inner text-slate-800"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold mt-1 block">Digunakan untuk verifikasi penawaran tender & integrasi chatbot BCI.</span>
                  </div>

                  {/* Password field (ganti pasword) */}
                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-500 uppercase tracking-wider block">Kata Sandi Baru (Password Keamanan)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock className="h-4.5 w-4.5 text-slate-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={settingsPassword}
                        onChange={(e) => setSettingsPassword(e.target.value)}
                        placeholder="Ubah sandi jika ingin ganti"
                        className="w-full rounded-2xl border border-slate-200 pl-10 pr-10 py-3 outline-none focus:border-[#FF6B00] font-bold shadow-inner text-slate-800 animate-fade-in"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold mt-1 block">Pastikan kata sandi aman, kombinasi huruf dan angka.</span>
                  </div>

                  {/* System language (ganti bahasa) */}
                  <div className="space-y-1.5 col-span-1 sm:col-span-2">
                    <label className="font-extrabold text-slate-500 uppercase tracking-wider block">Bahasa Pengantar Portal BCI (Language)</label>
                    <div className="grid grid-cols-2 gap-3 mt-1.5">
                      <button
                        type="button"
                        onClick={() => setSettingsLanguage('id')}
                        className={`flex items-center justify-center gap-2.5 p-3 border rounded-2xl font-black text-center transition-all cursor-pointer ${
                          settingsLanguage === 'id'
                            ? 'border-[#FF6B00] bg-orange-50/40 text-[#FF6B00] shadow-sm'
                            : 'border-slate-200 bg-slate-50/30 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-base">🇮🇩</span>
                        <span className="text-[11px]">Bahasa Indonesia</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSettingsLanguage('en')}
                        className={`flex items-center justify-center gap-2.5 p-3 border rounded-2xl font-black text-center transition-all cursor-pointer ${
                          settingsLanguage === 'en'
                            ? 'border-[#FF6B00] bg-orange-50/40 text-[#FF6B00] shadow-sm'
                            : 'border-slate-200 bg-slate-50/30 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-base">🇬🇧</span>
                        <span className="text-[11px]">English (B2B Global)</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Other systems preference (dan lain lain) */}
                <div className="border-t border-slate-100 pt-5 space-y-4">
                  <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Bell className="h-4 w-4 text-amber-500 animate-pulse" />
                    <span>Notifikasi & Preferensi Sistem</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Notification Preference 1 */}
                    <label className="flex items-start gap-3 p-3.5 border border-slate-100 rounded-2xl hover:bg-slate-50/50 transition-all cursor-pointer bg-slate-50/10">
                      <input type="checkbox" defaultChecked className="mt-1 accent-[#FF6B00]" />
                      <div>
                        <p className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                          <span>Notifikasi Tender Real-time via WA</span>
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5 leading-tight">Kirim undangan tender yang cocok langsung ke nomor WhatsApp saya secara instan.</p>
                      </div>
                    </label>

                    {/* Notification Preference 2 */}
                    <label className="flex items-start gap-3 p-3.5 border border-slate-100 rounded-2xl hover:bg-slate-50/50 transition-all cursor-pointer bg-slate-50/10">
                      <input type="checkbox" defaultChecked className="mt-1 accent-[#FF6B00]" />
                      <div>
                        <p className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                          <span>Auto-Translate Dokumen Tender</span>
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5 leading-tight">Terjemahkan otomatis spesifikasi teknis dokumen tender bahasa asing ke pilihan bahasa terpilih.</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={settingsLoading}
                    className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#FFC107] to-[#FF6B00] hover:brightness-105 active:scale-98 px-6 py-3.5 font-black text-white text-xs cursor-pointer shadow-md shadow-orange-500/10 transition-all"
                  >
                    {settingsLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                        <span>Menyimpan Perubahan...</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 text-white" />
                        <span>Simpan Pengaturan Akun</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Meeting scheduler modal */}
      {showMeetingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-2xl space-y-4 glass-card glossy-top-highlight">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base">Jadwalkan Business Meeting</h3>
              <button onClick={() => setShowMeetingModal(false)} className="text-slate-400 hover:text-red-500 text-sm font-black cursor-pointer">✕</button>
            </div>

            {meetingSuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto" />
                <h4 className="font-black text-slate-900 text-sm">Pertemuan Berhasil Dijadwalkan!</h4>
                <p className="text-xs text-slate-500 font-bold leading-relaxed">Undangan kalender Google Calendar dan Zoom link telah berhasil disinkronkan ke email partner Anda.</p>
              </div>
            ) : (
              <form onSubmit={handleScheduleMeeting} className="space-y-3.5 text-xs text-slate-700">
                <div className="space-y-1">
                  <label className="font-black text-slate-500">Topik Diskusi Kerja Sama</label>
                  <input
                    type="text"
                    required
                    value={meetingTopic}
                    onChange={e => setMeetingTopic(e.target.value)}
                    placeholder="Contoh: Pembahasan Aliansi Suplai Conveyor IKN"
                    className="w-full rounded-2xl border border-slate-200 bg-white p-3 outline-none focus:border-[#FFC107] font-bold shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-black text-slate-500">Pilih Tanggal</label>
                    <input
                      type="date"
                      required
                      value={meetingDate}
                      onChange={e => setMeetingDate(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white p-3 outline-none focus:border-[#FFC107] font-bold shadow-inner"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-black text-slate-500">Pilih Waktu</label>
                    <input
                      type="time"
                      required
                      value={meetingTime}
                      onChange={e => setMeetingTime(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white p-3 outline-none focus:border-[#FFC107] font-bold shadow-inner"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-gradient-to-r from-[#FFC107] to-[#FF6B00] hover:brightness-110 active:scale-95 py-3.5 font-black text-white shadow-md shadow-orange-500/20 cursor-pointer text-center transition-all"
                >
                  Kirim Undangan Jadwal
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {activeMode === 'company_settings' && (
        <div className="space-y-6 animate-fade-in">
          {/* Company Settings Card Container */}
          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xl overflow-hidden">
            
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 p-6 text-white border-b border-slate-800 flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-orange-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
              <div className="flex items-center gap-4 z-10">
                <div className="h-12 w-12 bg-orange-500/15 border border-orange-500/30 rounded-2xl flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="font-black text-sm tracking-tight text-white uppercase">Studio Profil Perusahaan B2B</h3>
                  <p className="text-[11px] text-slate-400 font-bold mt-1">SUNTING LEGALITAS, LOGO, COVER, PRODUK & PORTOFOLIO UTAMA</p>
                </div>
              </div>
              <Settings className="h-5 w-5 text-[#FF6B00] animate-spin" style={{ animationDuration: '8s' }} />
            </div>

            <div className="p-6">
              <form onSubmit={handleSaveCompanySettings} className="space-y-8">
                
                {/* Alerts */}
                {companySuccess && (
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-xs text-emerald-800 font-bold flex items-center gap-2">
                    <CheckCircle className="h-4.5 w-4.5 text-emerald-600 flex-shrink-0" />
                    <span>{companySuccess}</span>
                  </div>
                )}
                {companyError && (
                  <div className="rounded-2xl bg-rose-50 border border-rose-100 p-4 text-xs text-rose-700 font-bold flex items-center gap-2">
                    <Shield className="h-4.5 w-4.5 text-rose-600 flex-shrink-0" />
                    <span>{companyError}</span>
                  </div>
                )}

                {/* Section 1: Modul Profil Branding & Kop Dokumen Ekspor B2B */}
                <div className="bg-gradient-to-br from-amber-50/60 via-orange-50/30 to-white p-6 rounded-3xl border-2 border-orange-200/80 shadow-sm space-y-6">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-orange-200/80">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-gradient-to-tr from-[#FFC107] to-[#FF6B00] text-white shadow-md shadow-orange-500/20">
                        <Sparkles className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-slate-900 text-sm uppercase tracking-wide">Modul Pengaturan 'Profil Branding'</h4>
                          <span className="rounded-full bg-orange-100 text-[#FF6B00] text-[9px] font-black px-2.5 py-0.5 border border-orange-200">
                            Auto-Disematkan ke Dokumen
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">
                          Unggah logo perusahaan langsung dari kamera/berkas dan atur alamat kantor resmi yang otomatis dicetak pada Kop Surat MOU, Penawaran, & Invoice B2B.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleTestBrandingExport}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-950 text-white rounded-2xl text-xs font-black shadow-md flex items-center gap-2 transition-all cursor-pointer border border-slate-700 shrink-0"
                    >
                      <FileText className="h-4 w-4 text-amber-300" />
                      <span>Uji Cetak Kop Surat PDF</span>
                    </button>
                  </div>

                  {/* Sub-grid: Logo Upload Options & Official Address */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Box 1: Unggah Logo Perusahaan (Kamera, File, Studio & Presets) */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                          <Camera className="h-4 w-4 text-[#FF6B00]" />
                          <span>Logo Perusahaan (Kamera & Galeri)</span>
                        </label>
                        <span className="text-[10px] text-slate-400 font-bold">Square 1:1 • PNG/JPG</span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/60">
                        <div className="relative group shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 border-orange-400 shadow-md bg-white">
                          <img src={companyLogo} alt="Logo Perusahaan" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <div 
                            onClick={() => { setImageEditorTarget('companyLogo'); setShowImageEditor(true); }}
                            className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                          >
                            <Camera className="h-6 w-6 text-amber-300" />
                            <span className="text-[9px] font-black mt-1">Ganti Foto</span>
                          </div>
                        </div>

                        <div className="space-y-2 flex-1 text-center sm:text-left">
                          <p className="text-xs font-extrabold text-slate-800">Ubah Logo Resmi Perusahaan</p>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Gunakan kamera perangkat untuk memotret stempel/logo fisik, atau unggah gambar digital perusahaan Anda.
                          </p>

                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => { setImageEditorTarget('companyLogo'); setShowImageEditor(true); }}
                              className="px-3.5 py-2 bg-gradient-to-r from-[#FFC107] to-[#FF6B00] hover:brightness-110 text-white rounded-xl text-xs font-black shadow-sm flex items-center gap-1.5 cursor-pointer transition-all border-none"
                            >
                              <Camera className="h-3.5 w-3.5" />
                              <span>Ambil dari Kamera / Berkas</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Preset Vector B2B Logos */}
                      <div className="space-y-2 pt-1">
                        <span className="text-[11px] font-black text-slate-600 block">Atau Pilih Logo Preset Industri B2B:</span>
                        <div className="flex flex-wrap gap-2">
                          {presetLogos.map((pl, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setCompanyLogo(pl.url)}
                              className={`flex items-center gap-2 p-1.5 pr-3 rounded-xl border text-[11px] font-black transition-all cursor-pointer ${
                                companyLogo === pl.url
                                  ? 'border-[#FF6B00] bg-orange-50 text-[#FF6B00] ring-1 ring-orange-400'
                                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <img src={pl.url} alt={pl.name} className="h-6 w-6 rounded-lg object-cover" />
                              <span>{pl.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Box 2: Pengaturan Alamat Resmi & Kop Surat */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                      <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[#FF6B00]" />
                        <span>Alamat Kantor Resmi Dokumen</span>
                      </label>

                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="font-extrabold text-slate-500 uppercase text-[10px]">Alamat Lengkap Kantor Pusat / Pabrik</label>
                          <input
                            type="text"
                            required
                            value={companyFullAddress}
                            onChange={(e) => setCompanyFullAddress(e.target.value)}
                            placeholder="Gedung Cyber 2 Tower, Lt. 18, Jl. H.R. Rasuna Said Blok X-5"
                            className="w-full mt-1 rounded-xl border border-slate-200 p-2.5 font-bold text-slate-800 outline-none focus:border-[#FF6B00]"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="font-extrabold text-slate-500 uppercase text-[10px]">Kota / Kab</label>
                            <input
                              type="text"
                              required
                              value={companyCity}
                              onChange={(e) => setCompanyCity(e.target.value)}
                              placeholder="Jakarta Selatan"
                              className="w-full mt-1 rounded-xl border border-slate-200 p-2.5 font-bold text-slate-800 outline-none focus:border-[#FF6B00]"
                            />
                          </div>
                          <div>
                            <label className="font-extrabold text-slate-500 uppercase text-[10px]">Provinsi</label>
                            <input
                              type="text"
                              required
                              value={companyProvince}
                              onChange={(e) => setCompanyProvince(e.target.value)}
                              placeholder="DKI Jakarta"
                              className="w-full mt-1 rounded-xl border border-slate-200 p-2.5 font-bold text-slate-800 outline-none focus:border-[#FF6B00]"
                            />
                          </div>
                          <div>
                            <label className="font-extrabold text-slate-500 uppercase text-[10px]">Kode Pos</label>
                            <input
                              type="text"
                              value={companyPostalCode}
                              onChange={(e) => setCompanyPostalCode(e.target.value)}
                              placeholder="12190"
                              className="w-full mt-1 rounded-xl border border-slate-200 p-2.5 font-bold text-slate-800 outline-none focus:border-[#FF6B00]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="font-extrabold text-slate-500 uppercase text-[10px]">Slogan / Tagline Resmi Kop Surat</label>
                          <input
                            type="text"
                            value={companyTagline}
                            onChange={(e) => setCompanyTagline(e.target.value)}
                            placeholder="Partner Terpercaya Infrastruktur & Solusi B2B Enterprise"
                            className="w-full mt-1 rounded-xl border border-slate-200 p-2.5 font-bold text-slate-800 outline-none focus:border-[#FF6B00]"
                          />
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Interactive Live Document Header (Kop Surat) Preview Box */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-[#FF6B00]" />
                        <span>Prinjau Otomatis Kop Surat & Dokumen Ekspor B2B</span>
                      </span>
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Live Template PDF Disematkan
                      </span>
                    </div>

                    {/* Realistic Paper Header Representation */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50/50 to-white space-y-3 font-sans">
                      <div className="flex items-start justify-between gap-4 border-b-2 border-slate-900 pb-3">
                        <div className="flex items-center gap-3">
                          <img src={companyLogo} alt="Logo Header" className="h-12 w-12 rounded-xl object-cover border border-slate-300 shadow-2xs" />
                          <div>
                            <h5 className="font-black text-sm text-slate-900 uppercase tracking-tight">{companyName}</h5>
                            <p className="text-[10px] text-slate-600 font-bold">{companyTagline}</p>
                            <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                              {companyFullAddress}, {companyCity}, {companyProvince} {companyPostalCode}
                            </p>
                          </div>
                        </div>

                        <div className="text-right text-[10px] font-bold text-slate-500 space-y-0.5 shrink-0 hidden sm:block">
                          <p className="text-slate-900 font-black">NIB: {companyNIB}</p>
                          <p>NPWP: {companyNPWP}</p>
                          <p className="text-[#FF6B00]">Email: {companyEmail}</p>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-orange-50/50 border border-orange-100 text-[11px] text-slate-700 font-medium flex items-center justify-between">
                        <span>Setiap dokumen transaksi yang diunggah atau diekspor ke format PDF akan disematkan Kop Surat ini secara otomatis.</span>
                        <button
                          type="button"
                          onClick={handleTestBrandingExport}
                          className="text-[10px] font-black text-[#FF6B00] hover:underline cursor-pointer ml-2 shrink-0"
                        >
                          Unduh Contoh PDF →
                        </button>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Section 2: Visual Branding & Images */}
                <div className="bg-slate-50/40 p-5 rounded-2xl border border-slate-100 space-y-4">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Camera className="h-4 w-4 text-orange-500" />
                    <span>Visual Branding (Logo & Sampul)</span>
                  </h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ketuk gambar untuk membuka Studio Edit Foto (Atur Pencahayaan & Penghalusan)</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                    {/* Company Logo box */}
                    <div className="flex flex-col items-center justify-center border border-dashed border-slate-200 bg-white p-4 rounded-2xl relative text-center">
                      <label className="text-[11px] font-black text-slate-500 mb-3 uppercase tracking-wider">Logo Perusahaan</label>
                      <div 
                        className="relative group cursor-pointer w-24 h-24 rounded-2xl overflow-hidden shadow-md ring-2 ring-orange-500/25 hover:ring-orange-500/50 transition-all bg-slate-100"
                        onClick={() => { setImageEditorTarget('companyLogo'); setShowImageEditor(true); }}
                        title="Edit Logo dengan Studio Foto BCI"
                      >
                        <img src={companyLogo} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                          <Camera className="h-5 w-5 text-white" />
                          <span className="text-[9px] text-white font-black mt-1">Ubah Logo</span>
                        </div>
                      </div>
                      <span className="text-[9px] text-slate-400 font-bold mt-2">Disarankan aspek rasio 1:1</span>
                    </div>

                    {/* Company Cover box */}
                    <div className="col-span-1 md:col-span-2 flex flex-col justify-between border border-dashed border-slate-200 bg-white p-4 rounded-2xl relative">
                      <label className="text-[11px] font-black text-slate-500 mb-2 uppercase tracking-wider">Foto Sampul Profil (Cover Banner)</label>
                      <div 
                        className="relative group cursor-pointer h-24 rounded-2xl overflow-hidden shadow-md ring-2 ring-slate-100 hover:ring-orange-500/50 transition-all bg-slate-100"
                        onClick={() => { setImageEditorTarget('companyCover'); setShowImageEditor(true); }}
                        title="Edit Sampul dengan Studio Foto BCI"
                      >
                        <img src={companyCover} alt="Cover Banner" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                          <Camera className="h-5 w-5 text-white" />
                          <span className="text-[9px] text-white font-black mt-1">Ubah Foto Sampul</span>
                        </div>
                      </div>
                      <span className="text-[9px] text-slate-400 font-bold mt-1.5 leading-none">Akan digunakan sebagai banner di halaman pencarian dan portal direktori B2B.</span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Core Information */}
                <div className="bg-slate-50/40 p-5 rounded-2xl border border-slate-100 space-y-4">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Building2 className="h-4 w-4 text-orange-500" />
                    <span>Informasi Umum Perusahaan</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
                    <div className="space-y-1.5 col-span-1 md:col-span-2">
                      <label className="font-extrabold text-slate-500 uppercase tracking-wider">Nama Resmi Perusahaan (B2B Entity)</label>
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="PT Telekomunikasi Indonesia Tbk"
                        className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-[#FF6B00] font-bold shadow-inner text-slate-800"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-extrabold text-slate-500 uppercase tracking-wider">Sektor Industri / Kategori Bisnis</label>
                      <select
                        value={companySector}
                        onChange={(e) => setCompanySector(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-[#FF6B00] font-bold text-slate-800 bg-white"
                      >
                        <option value="Telekomunikasi & Teknologi">Telekomunikasi & Teknologi</option>
                        <option value="Investasi & Pembiayaan">Investasi & Pembiayaan</option>
                        <option value="Manufaktur & Alat Berat">Manufaktur & Alat Berat</option>
                        <option value="Suplai & Energi Terbarukan">Suplai & Energi Terbarukan</option>
                        <option value="Konstruksi & Infrastruktur">Konstruksi & Infrastruktur</option>
                        <option value="Logistik & Kargo Nasional">Logistik & Kargo Nasional</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="font-extrabold text-slate-500 uppercase tracking-wider">Tahun Berdiri</label>
                        <input
                          type="number"
                          required
                          value={companyFoundedYear}
                          onChange={(e) => setCompanyFoundedYear(Number(e.target.value))}
                          className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-[#FF6B00] font-bold text-slate-800"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-extrabold text-slate-500 uppercase tracking-wider">Jumlah Karyawan</label>
                        <input
                          type="number"
                          required
                          value={companyEmployees}
                          onChange={(e) => setCompanyEmployees(Number(e.target.value))}
                          className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-[#FF6B00] font-bold text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 col-span-1 md:col-span-2">
                      <label className="font-extrabold text-slate-500 uppercase tracking-wider">Deskripsi & Profil Bisnis Utama</label>
                      <textarea
                        rows={3}
                        required
                        value={companyDescription}
                        onChange={(e) => setCompanyDescription(e.target.value)}
                        placeholder="Tuliskan latar belakang industri, visi, misi, dan keunggulan kompetitif perusahaan Anda..."
                        className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-[#FF6B00] font-bold text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Legalitas & Kredibilitas */}
                <div className="bg-slate-50/40 p-5 rounded-2xl border border-slate-100 space-y-4">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Shield className="h-4 w-4 text-orange-500" />
                    <span>Legalitas Bisnis & Sertifikasi Mutu</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
                    <div className="space-y-1.5">
                      <label className="font-extrabold text-slate-500 uppercase tracking-wider">Nomor Induk Berusaha (NIB)</label>
                      <input
                        type="text"
                        required
                        value={companyNIB}
                        onChange={(e) => setCompanyNIB(e.target.value)}
                        placeholder="9120001234567"
                        className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-[#FF6B00] font-bold text-slate-800"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-extrabold text-slate-500 uppercase tracking-wider">Nomor Pokok Wajib Pajak (NPWP)</label>
                      <input
                        type="text"
                        required
                        value={companyNPWP}
                        onChange={(e) => setCompanyNPWP(e.target.value)}
                        placeholder="01.000.123.4-051.000"
                        className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-[#FF6B00] font-bold text-slate-800"
                      />
                    </div>

                    {/* Industrial Certificates Builder */}
                    <div className="space-y-3.5 col-span-1 md:col-span-2 pt-2 bg-white p-4 rounded-xl border border-slate-200/60">
                      <label className="font-extrabold text-slate-500 uppercase tracking-wider block">Daftar Sertifikasi Resmi (ISO / KADIN / SNI / TKDN)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newCertificate}
                          onChange={(e) => setNewCertificate(e.target.value)}
                          placeholder="Masukkan nama sertifikasi baru, contoh: Sertifikat TKDN 45%"
                          className="flex-1 rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-[#FF6B00] font-bold text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newCertificate.trim()) {
                              setCompanyCertificates([...companyCertificates, newCertificate.trim()]);
                              setNewCertificate('');
                            }
                          }}
                          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black text-xs cursor-pointer transition-colors"
                        >
                          Tambah
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1.5">
                        {companyCertificates.map((cert, index) => (
                          <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 animate-fade-in">
                            <Award className="h-3.5 w-3.5 text-[#FF6B00]" />
                            <span>{cert}</span>
                            <button
                              type="button"
                              onClick={() => setCompanyCertificates(companyCertificates.filter((_, i) => i !== index))}
                              className="text-slate-400 hover:text-red-500 font-extrabold ml-1 cursor-pointer"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                        {companyCertificates.length === 0 && (
                          <span className="text-[11px] text-slate-400 font-bold italic">Belum ada sertifikasi terdaftar. Masukkan di atas untuk meningkatkan peluang tender.</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 4: Contact & Locations */}
                <div className="bg-slate-50/40 p-5 rounded-2xl border border-slate-100 space-y-4">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                    <MapPin className="h-4 w-4 text-orange-500" />
                    <span>Lokasi & Kontak Hubungan Niaga</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700">
                    <div className="space-y-1.5">
                      <label className="font-extrabold text-slate-500 uppercase tracking-wider">Kota</label>
                      <input
                        type="text"
                        required
                        value={companyCity}
                        onChange={(e) => setCompanyCity(e.target.value)}
                        placeholder="Jakarta Selatan"
                        className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-[#FF6B00] font-bold text-slate-800"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-extrabold text-slate-500 uppercase tracking-wider">Provinsi</label>
                      <input
                        type="text"
                        required
                        value={companyProvince}
                        onChange={(e) => setCompanyProvince(e.target.value)}
                        placeholder="DKI Jakarta"
                        className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-[#FF6B00] font-bold text-slate-800"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-extrabold text-slate-500 uppercase tracking-wider">Situs Web Perusahaan</label>
                      <input
                        type="url"
                        value={companyWebsite}
                        onChange={(e) => setCompanyWebsite(e.target.value)}
                        placeholder="https://www.example.com"
                        className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-[#FF6B00] font-bold text-slate-800"
                      />
                    </div>

                    <div className="space-y-1.5 col-span-1 md:col-span-2">
                      <label className="font-extrabold text-slate-500 uppercase tracking-wider">Alamat Lengkap Perusahaan</label>
                      <input
                        type="text"
                        required
                        value={companyFullAddress}
                        onChange={(e) => setCompanyFullAddress(e.target.value)}
                        placeholder="Alamat kantor pusat atau area operasional industri..."
                        className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-[#FF6B00] font-bold text-slate-800"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-extrabold text-slate-500 uppercase tracking-wider">Link Google Maps Lokasi</label>
                      <input
                        type="url"
                        value={companyMapsUrl}
                        onChange={(e) => setCompanyMapsUrl(e.target.value)}
                        placeholder="https://maps.google.com/..."
                        className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-[#FF6B00] font-bold text-slate-800"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-extrabold text-slate-500 uppercase tracking-wider">Email Korporat</label>
                      <input
                        type="email"
                        required
                        value={companyEmail}
                        onChange={(e) => setCompanyEmail(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-[#FF6B00] font-bold text-slate-800"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-extrabold text-slate-500 uppercase tracking-wider">WhatsApp Hotline (B2B)</label>
                      <input
                        type="tel"
                        required
                        value={companyWhatsapp}
                        onChange={(e) => setCompanyWhatsapp(e.target.value)}
                        placeholder="+628111234567"
                        className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-[#FF6B00] font-bold text-slate-800"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-extrabold text-slate-500 uppercase tracking-wider">Profil Video URL (MP4 / YouTube)</label>
                      <input
                        type="url"
                        value={companyVideoUrl}
                        onChange={(e) => setCompanyVideoUrl(e.target.value)}
                        placeholder="URL video profil perusahaan untuk promosi"
                        className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-[#FF6B00] font-bold text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 5: List Builders for Services */}
                <div className="bg-slate-50/40 p-5 rounded-2xl border border-slate-100 space-y-4">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Settings className="h-4 w-4 text-orange-500" />
                    <span>Layanan Utama & Jasa Spesialisasi</span>
                  </h4>

                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newService}
                        onChange={(e) => setNewService(e.target.value)}
                        placeholder="Contoh: Jasa Pemasangan Jaringan Serat Optik"
                        className="flex-1 rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-[#FF6B00] font-bold text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newService.trim()) {
                            setCompanyServices([...companyServices, newService.trim()]);
                            setNewService('');
                          }
                        }}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black text-xs cursor-pointer"
                      >
                        Tambah Layanan
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {companyServices.map((svc, index) => (
                        <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-100 rounded-lg text-xs font-bold text-orange-800">
                          <Check className="h-3 w-3 text-orange-500" />
                          <span>{svc}</span>
                          <button
                            type="button"
                            onClick={() => setCompanyServices(companyServices.filter((_, i) => i !== index))}
                            className="text-orange-400 hover:text-red-500 font-extrabold ml-1 cursor-pointer"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Section 6: Portfolio List Builder */}
                <div className="bg-slate-50/40 p-5 rounded-2xl border border-slate-100 space-y-4">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Award className="h-4 w-4 text-orange-500" />
                    <span>Portofolio Rekam Jejak Proyek</span>
                  </h4>

                  {/* Add Portfolio Project Box */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200/60 space-y-3.5 text-xs">
                    <p className="font-black text-slate-800">Tambah Proyek Historis Baru:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-[10px] text-slate-400 font-extrabold uppercase">Judul Proyek / Klien</label>
                        <input
                          type="text"
                          value={newPortTitle}
                          onChange={(e) => setNewPortTitle(e.target.value)}
                          placeholder="Digitalisasi Jaringan Komunikasi IKN"
                          className="w-full rounded-lg border border-slate-200 p-2 outline-none text-xs font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-extrabold uppercase">Tahun Selesai</label>
                        <input
                          type="number"
                          value={newPortYear}
                          onChange={(e) => setNewPortYear(Number(e.target.value))}
                          className="w-full rounded-lg border border-slate-200 p-2 outline-none text-xs font-bold"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-3">
                        <label className="text-[10px] text-slate-400 font-extrabold uppercase">Deskripsi Pekerjaan / Hasil Proyek</label>
                        <textarea
                          rows={2}
                          value={newPortDesc}
                          onChange={(e) => setNewPortDesc(e.target.value)}
                          placeholder="Tuliskan tantangan, solusi, dan performa penyelesaian pekerjaan oleh tim..."
                          className="w-full rounded-lg border border-slate-200 p-2 outline-none text-xs font-bold"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (newPortTitle.trim() && newPortDesc.trim()) {
                          setCompanyPortfolio([...companyPortfolio, {
                            title: newPortTitle.trim(),
                            description: newPortDesc.trim(),
                            year: Number(newPortYear)
                          }]);
                          setNewPortTitle('');
                          setNewPortDesc('');
                        }
                      }}
                      className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black text-xs cursor-pointer transition-colors"
                    >
                      Tambahkan ke Daftar Portofolio
                    </button>
                  </div>

                  {/* Portfolio Listing Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {companyPortfolio.map((port, index) => (
                      <div key={index} className="bg-white p-4.5 rounded-2xl border border-slate-200/50 shadow-sm relative group">
                        <button
                          type="button"
                          onClick={() => setCompanyPortfolio(companyPortfolio.filter((_, i) => i !== index))}
                          className="absolute top-3 right-3 text-slate-300 hover:text-red-500 cursor-pointer"
                          title="Hapus Portofolio"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <span className="text-[9px] font-black px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[#FF6B00] uppercase">Tahun {port.year}</span>
                        <h5 className="font-black text-slate-800 text-xs mt-2 pr-6 leading-snug">{port.title}</h5>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 leading-relaxed pr-2">{port.description}</p>
                      </div>
                    ))}
                    {companyPortfolio.length === 0 && (
                      <p className="text-xs text-slate-400 italic">Belum ada portofolio terdaftar. Masukkan portofolio untuk memikat mitra B2B Anda.</p>
                    )}
                  </div>
                </div>

                {/* Section 7: B2B Products Catalog Builder */}
                <div className="bg-slate-50/40 p-5 rounded-2xl border border-slate-100 space-y-4">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Briefcase className="h-4 w-4 text-orange-500" />
                    <span>Katalog Produk & Layanan Berbayar</span>
                  </h4>

                  {/* Add Product Box */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200/60 space-y-3.5 text-xs">
                    <p className="font-black text-slate-800">Tambah Produk Baru ke Katalog Direktori:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-[10px] text-slate-400 font-extrabold uppercase">Nama Produk / Jasa B2B</label>
                        <input
                          type="text"
                          value={newProdName}
                          onChange={(e) => setNewProdName(e.target.value)}
                          placeholder="Sistem ERP Cloud Enterprise v5"
                          className="w-full rounded-lg border border-slate-200 p-2 outline-none text-xs font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-extrabold uppercase">Harga Unit (IDR)</label>
                        <input
                          type="number"
                          value={newProdPrice}
                          onChange={(e) => setNewProdPrice(Number(e.target.value))}
                          className="w-full rounded-lg border border-slate-200 p-2 outline-none text-xs font-bold"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-3">
                        <label className="text-[10px] text-slate-400 font-extrabold uppercase">Deskripsi Produk & Spesifikasi</label>
                        <textarea
                          rows={2}
                          value={newProdDesc}
                          onChange={(e) => setNewProdDesc(e.target.value)}
                          placeholder="Tuliskan rincian, fitur, atau benefit penting dari layanan/produk..."
                          className="w-full rounded-lg border border-slate-200 p-2 outline-none text-xs font-bold"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (newProdName.trim() && newProdDesc.trim()) {
                          setCompanyProducts([...companyProducts, {
                            name: newProdName.trim(),
                            price: Number(newProdPrice),
                            image: newProdImg,
                            description: newProdDesc.trim()
                          }]);
                          setNewProdName('');
                          setNewProdDesc('');
                        }
                      }}
                      className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black text-xs cursor-pointer transition-colors"
                    >
                      Tambahkan ke Katalog
                    </button>
                  </div>

                  {/* Products Catalog Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {companyProducts.map((prod, index) => (
                      <div key={index} className="bg-white p-4 rounded-2xl border border-slate-200/50 shadow-sm relative group flex gap-3">
                        <button
                          type="button"
                          onClick={() => setCompanyProducts(companyProducts.filter((_, i) => i !== index))}
                          className="absolute top-2 right-2 text-slate-300 hover:text-red-500 cursor-pointer"
                          title="Hapus Produk"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <div className="h-16 w-16 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                          <img src={prod.image} className="h-full w-full object-cover" />
                        </div>
                        <div className="text-xs">
                          <h5 className="font-black text-slate-800 leading-snug">{prod.name}</h5>
                          <p className="text-[#FF6B00] font-black text-[11px] mt-0.5">Rp {prod.price.toLocaleString('id-ID')}</p>
                          <p className="text-[10px] text-slate-400 font-bold mt-1 leading-normal pr-4 line-clamp-2">{prod.description}</p>
                        </div>
                      </div>
                    ))}
                    {companyProducts.length === 0 && (
                      <p className="text-xs text-slate-400 italic">Belum ada produk terdaftar di katalog B2B perusahaan Anda.</p>
                    )}
                  </div>
                </div>

                {/* Final Save Panel */}
                <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveMode('directory')}
                    className="py-3 px-6 text-xs font-black bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-2xl transition-colors cursor-pointer"
                  >
                    Batalkan & Kembali
                  </button>
                  <button
                    type="submit"
                    disabled={companyLoading}
                    className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#FFC107] to-[#FF6B00] hover:brightness-105 active:scale-98 px-8 py-3.5 font-black text-white text-xs cursor-pointer shadow-md shadow-orange-500/10 transition-all"
                  >
                    {companyLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                        <span>Menyimpan Profil B2B...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 text-white" />
                        <span>Simpan Perubahan Profil Perusahaan</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

      {showImageEditor && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in">
          <div className="w-full max-w-4xl relative">
            <ProfileImageEditor
              currentAvatar={
                imageEditorTarget === 'companyLogo'
                  ? companyLogo
                  : imageEditorTarget === 'companyCover'
                  ? companyCover
                  : settingsAvatar
              }
              onSave={(newDataUrl) => {
                if (imageEditorTarget === 'companyLogo') {
                  setCompanyLogo(newDataUrl);
                } else if (imageEditorTarget === 'companyCover') {
                  setCompanyCover(newDataUrl);
                } else {
                  setSettingsAvatar(newDataUrl);
                }
                setShowImageEditor(false);
                setImageEditorTarget(null);
              }}
              onCancel={() => {
                setShowImageEditor(false);
                setImageEditorTarget(null);
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
}
