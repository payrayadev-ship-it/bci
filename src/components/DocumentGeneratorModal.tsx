import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  FileText, 
  Plus, 
  Trash2, 
  Download, 
  Send, 
  CheckCircle2, 
  Calculator, 
  Building2, 
  User, 
  Calendar, 
  Hash, 
  Eye, 
  Sparkles,
  FileSpreadsheet,
  FileCheck,
  Upload,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';
import { B2BDocumentData, generateB2BDocumentPDF } from '../utils/pdfExport';
import { AppDatabase, User as UserType } from '../types';

interface DocumentGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  db?: AppDatabase;
  currentUser?: UserType;
  defaultRecipientCompany?: string;
  defaultRecipientName?: string;
  defaultItems?: Array<{ description: string; qty: number; unit: string; unitPrice: number }>;
  defaultDocType?: 'po' | 'quotation' | 'invoice' | 'contract' | 'spk';
  onSendToChat?: (pdfName: string, pdfDataUrl: string, docData: B2BDocumentData) => void;
}

export default function DocumentGeneratorModal({
  isOpen,
  onClose,
  db,
  currentUser,
  defaultRecipientCompany = 'PT Industri Maju Bersama',
  defaultRecipientName = 'Budi Santoso',
  defaultItems,
  defaultDocType = 'po',
  onSendToChat
}: DocumentGeneratorModalProps) {
  // Document Type State
  const [docType, setDocType] = useState<'po' | 'quotation' | 'invoice' | 'contract' | 'spk'>(defaultDocType);
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');

  // Find user's company profile from database
  const userCompany = useMemo(() => {
    if (!currentUser || !db?.companies) return null;
    return db.companies.find(c => c.id === currentUser.companyId) || db.companies[0];
  }, [currentUser, db]);

  // Document Number & Dates
  const [docNumber, setDocNumber] = useState<string>(() => {
    const prefix = defaultDocType.toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}/BCI/2026/07/${randomNum}`;
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const nextMonthStr = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [docDate, setDocDate] = useState<string>(todayStr);
  const [dueDate, setDueDate] = useState<string>(nextMonthStr);

  // Issuer Info (Pengirim / Perusahaan Pengguna)
  const [issuerCompany, setIssuerCompany] = useState<string>('');
  const [issuerName, setIssuerName] = useState<string>('');
  const [issuerAddress, setIssuerAddress] = useState<string>('');
  const [issuerTaxId, setIssuerTaxId] = useState<string>('');
  const [issuerLogo, setIssuerLogo] = useState<string>('');

  // Auto-fill user's company details whenever modal opens or user profile changes
  useEffect(() => {
    if (userCompany || currentUser) {
      setIssuerCompany(userCompany?.name || currentUser?.name || 'PT Nusantara Supply Chain');
      setIssuerName(currentUser?.name || 'Hendra Wijaya');
      const fullAddr = userCompany?.address?.fullAddress 
        ? `${userCompany.address.fullAddress}, ${userCompany.address.city}, ${userCompany.address.province}` 
        : 'Kawasan Industri Pulogadung Blok B4, Jakarta Timur';
      setIssuerAddress(fullAddr);
      setIssuerTaxId(userCompany?.legality?.npwp || userCompany?.legality?.nib || '9120003482195');
      setIssuerLogo(userCompany?.logo || currentUser?.avatar || '');
    } else {
      setIssuerCompany('PT Nusantara Supply Chain');
      setIssuerName('Hendra Wijaya');
      setIssuerAddress('Kawasan Industri Pulogadung Blok B4, Jakarta Timur');
      setIssuerTaxId('9120003482195');
      setIssuerLogo('https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=200');
    }
  }, [userCompany, currentUser, isOpen]);

  const handleResetToUserProfile = () => {
    if (userCompany || currentUser) {
      setIssuerCompany(userCompany?.name || currentUser?.name || 'PT Nusantara Supply Chain');
      setIssuerName(currentUser?.name || 'Hendra Wijaya');
      const fullAddr = userCompany?.address?.fullAddress 
        ? `${userCompany.address.fullAddress}, ${userCompany.address.city}, ${userCompany.address.province}` 
        : 'Kawasan Industri Pulogadung Blok B4, Jakarta Timur';
      setIssuerAddress(fullAddr);
      setIssuerTaxId(userCompany?.legality?.npwp || userCompany?.legality?.nib || '9120003482195');
      setIssuerLogo(userCompany?.logo || currentUser?.avatar || '');
      setIsSuccessToast('Profil perusahaan berhasil disinkronisasi dengan akun Anda!');
      setTimeout(() => setIsSuccessToast(null), 3000);
    }
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setIssuerLogo(reader.result as string);
        setIsSuccessToast('Logo perusahaan berhasil diperbarui!');
        setTimeout(() => setIsSuccessToast(null), 2500);
      };
      reader.readAsDataURL(file);
    }
  };

  // Recipient Info (Penerima)
  const [recipientCompany, setRecipientCompany] = useState<string>(defaultRecipientCompany);
  const [recipientName, setRecipientName] = useState<string>(defaultRecipientName);
  const [recipientAddress, setRecipientAddress] = useState<string>('Jl. Jendral Sudirman No. 45, Jakarta Selatan');

  // Items List
  const [items, setItems] = useState<Array<{ description: string; qty: number; unit: string; unitPrice: number }>>(() => {
    if (defaultItems && defaultItems.length > 0) return defaultItems;
    return [
      { description: 'Pipa Baja Seamless OD 4 Inch Sch 40 Standard API 5L', qty: 50, unit: 'Batang', unitPrice: 1250000 },
      { description: 'Jasa Inspeksi Quality Control & Sertifikasi TKDN', qty: 1, unit: 'Paket', unitPrice: 3500000 }
    ];
  });

  // Taxes
  const [includePPN, setIncludePPN] = useState<boolean>(true);
  const [includePPh23, setIncludePPh23] = useState<boolean>(true);

  // Notes
  const [notes, setNotes] = useState<string>(
    '1. Pembayaran via BCI Escrow / Transfer Rekening Resmi Perusahaan.\n2. Pengiriman H+3 setelah Purchase Order (PO) disetujui.\n3. Termasuk Garansi Resmi 12 Bulan.'
  );

  const [isSuccessToast, setIsSuccessToast] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle Item Editing
  const handleAddItem = () => {
    setItems([
      ...items,
      { description: 'Komponen / Layanan B2B Baru', qty: 1, unit: 'pcs', unitPrice: 500000 }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  // Financial Calculations
  const subtotal = items.reduce((acc, curr) => acc + (curr.qty * curr.unitPrice), 0);
  const ppnVal = includePPN ? subtotal * 0.11 : 0;
  const pphVal = includePPh23 ? subtotal * 0.02 : 0;
  const totalBuyer = subtotal + ppnVal;
  const netSeller = subtotal - pphVal;

  const getDocData = (): B2BDocumentData => ({
    docType,
    docNumber,
    docDate,
    dueDate,
    issuerName,
    issuerCompany,
    issuerAddress,
    issuerTaxId,
    issuerLogo,
    recipientName,
    recipientCompany,
    recipientAddress,
    items,
    includePPN,
    includePPh23,
    notes
  });

  const handleDownloadPDF = () => {
    const docData = getDocData();
    generateB2BDocumentPDF(docData, 'download');
    setIsSuccessToast('Dokumen PDF berhasil diunduh ke perangkat Anda!');
    setTimeout(() => setIsSuccessToast(null), 3500);
  };

  const handleSendToChatAction = () => {
    const docData = getDocData();
    const dataUrl = generateB2BDocumentPDF(docData, 'dataurl') as string;
    const docTitleMap: Record<string, string> = {
      po: 'Purchase_Order_PO',
      quotation: 'Surat_Penawaran_Quotation',
      invoice: 'Invoice_Tagihan_B2B',
      contract: 'Surat_Perjanjian_Kemitraan',
      spk: 'Surat_Perintah_Kerja_SPK'
    };
    const pdfName = `${docTitleMap[docType] || 'Dokumen_B2B'}_${docNumber.replace(/[\/\\#]/g, '_')}.pdf`;

    if (onSendToChat) {
      onSendToChat(pdfName, dataUrl, docData);
      setIsSuccessToast('Dokumen PDF berhasil dikirim ke Percakapan Chat!');
      setTimeout(() => {
        setIsSuccessToast(null);
        onClose();
      }, 1500);
    } else {
      // Fallback download if no chat handler passed
      generateB2BDocumentPDF(docData, 'download');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh] my-auto"
        >
          {/* HEADER BAR */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-[#FFC107] flex items-center justify-center shadow-lg shadow-orange-500/20 text-white">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-base sm:text-lg text-white">Pembuat Dokumen Resmi B2B</h3>
                  <span className="text-[9px] font-black bg-gradient-to-r from-[#FFC107] to-[#FF6B00] text-slate-950 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Export PDF & Share
                  </span>
                </div>
                <p className="text-xs text-slate-300">Buat PO, Surat Penawaran, Invoice & Kontrak Sah dengan Simulasi Pajak</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-2xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* SUCCESS TOAST NOTIFICATION */}
          {isSuccessToast && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-500 text-white px-4 py-2.5 text-xs font-black flex items-center justify-center gap-2 shadow-md shrink-0"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{isSuccessToast}</span>
            </motion.div>
          )}

          {/* DOCUMENT TYPE SELECTOR & TABS */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 space-y-3 shrink-0">
            {/* Document Types Pill Buttons */}
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Pilih Jenis Dokumen Resmi:</p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: 'po', label: 'Purchase Order (PO)', icon: FileSpreadsheet, color: 'from-orange-500 to-amber-500' },
                  { id: 'quotation', label: 'Surat Penawaran', icon: FileText, color: 'from-blue-500 to-indigo-500' },
                  { id: 'invoice', label: 'Invoice & Tagihan', icon: Calculator, color: 'from-emerald-500 to-teal-500' },
                  { id: 'contract', label: 'Surat Perjanjian MOU', icon: FileCheck, color: 'from-purple-500 to-pink-500' },
                  { id: 'spk', label: 'Perintah Kerja (SPK)', icon: Sparkles, color: 'from-red-500 to-orange-500' }
                ].map((type) => {
                  const Icon = type.icon;
                  const isSelected = docType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => {
                        setDocType(type.id as any);
                        setDocNumber(`${type.id.toUpperCase()}/BCI/2026/07/${Math.floor(1000 + Math.random() * 9000)}`);
                      }}
                      className={`p-2.5 rounded-2xl flex items-center justify-center gap-2 text-xs font-black transition-all cursor-pointer border ${
                        isSelected
                          ? `bg-gradient-to-r ${type.color} text-white border-transparent shadow-md`
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-orange-400'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TAB MODE: EDIT vs PREVIEW */}
            <div className="flex justify-between items-center pt-1 border-t border-slate-200/60 dark:border-slate-800">
              <div className="flex bg-slate-200/80 dark:bg-slate-800 p-1 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setActiveTab('form')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    activeTab === 'form'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  📝 Isi Formulir Dokumen
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'preview'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Pratinjau Layout Dokumen</span>
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-3 text-xs font-bold text-slate-500">
                <span>Total Nilai Transaksi:</span>
                <span className="font-black text-slate-900 dark:text-white text-sm bg-orange-500/10 text-[#FF6B00] px-2.5 py-1 rounded-xl border border-orange-500/20">
                  Rp{totalBuyer.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>

          {/* FORM BODY / PREVIEW CANVAS */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
            {activeTab === 'form' ? (
              <div className="space-y-6">
                
                {/* SECTION 1: HEADER METADATA & DATES */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/70 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    <Hash className="h-4 w-4 text-[#FF6B00]" />
                    <span>Identitas Dokumen & Tanggal</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                        Nomor Dokumen:
                      </label>
                      <input
                        type="text"
                        value={docNumber}
                        onChange={(e) => setDocNumber(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-black text-slate-900 dark:text-white outline-none focus:border-[#FF6B00]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                        Tanggal Penerbitan:
                      </label>
                      <input
                        type="date"
                        value={docDate}
                        onChange={(e) => setDocDate(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-[#FF6B00]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                        Tanggal Jatuh Tempo / Validitas:
                      </label>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-[#FF6B00]"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 2: ISSUER & RECIPIENT PARTIES */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* ISSUER (Penerbit) */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/70 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                      <div className="flex items-center gap-2 text-xs font-black text-[#FF6B00] uppercase tracking-wider">
                        <Building2 className="h-4 w-4" />
                        <span>Penerbit (Perusahaan Pengguna)</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleResetToUserProfile}
                        title="Gunakan data & logo dari profil akun BCI Anda"
                        className="flex items-center gap-1 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:text-[#FF6B00] bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer shadow-2xs transition-colors"
                      >
                        <RefreshCw className="h-3 w-3 text-[#FF6B00]" />
                        <span>Sinkron Profil</span>
                      </button>
                    </div>

                    {/* Logo & Company Name */}
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="relative h-11 w-11 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0 flex items-center justify-center">
                        {issuerLogo ? (
                          <img src={issuerLogo} alt="Logo Perusahaan" className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Logo Perusahaan / UMKM:</label>
                        <div className="flex items-center gap-1.5">
                          <label className="flex items-center gap-1 text-[10px] font-black text-white bg-[#FF6B00] hover:bg-[#EE1C25] px-2 py-1 rounded-md cursor-pointer transition-colors shrink-0">
                            <Upload className="h-3 w-3" />
                            <span>Unggah Logo</span>
                            <input type="file" accept="image/*" onChange={handleLogoFileUpload} className="hidden" />
                          </label>
                          <input
                            type="text"
                            placeholder="atau tempel URL Logo..."
                            value={issuerLogo}
                            onChange={(e) => setIssuerLogo(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-[10px] font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-[#FF6B00]"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">Nama Perusahaan / UMKM Penerbit:</label>
                      <input
                        type="text"
                        value={issuerCompany}
                        onChange={(e) => setIssuerCompany(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-black text-slate-900 dark:text-white outline-none focus:border-[#FF6B00]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">Nama Perwakilan (UP):</label>
                        <input
                          type="text"
                          value={issuerName}
                          onChange={(e) => setIssuerName(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-[#FF6B00]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">NIB / NPWP:</label>
                        <input
                          type="text"
                          value={issuerTaxId}
                          onChange={(e) => setIssuerTaxId(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-[#FF6B00]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">Alamat Lengkap Perusahaan:</label>
                      <textarea
                        rows={2}
                        value={issuerAddress}
                        onChange={(e) => setIssuerAddress(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-[#FF6B00]"
                      />
                    </div>
                  </div>

                  {/* RECIPIENT (Penerima) */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/70 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      <User className="h-4 w-4" />
                      <span>Pihak Tujuan (Kepada Yth.)</span>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">Nama Perusahaan Tujuan:</label>
                      <input
                        type="text"
                        value={recipientCompany}
                        onChange={(e) => setRecipientCompany(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-black text-slate-900 dark:text-white outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">Nama Penanggung Jawab / Kontak:</label>
                      <input
                        type="text"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">Alamat Tujuan:</label>
                      <input
                        type="text"
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 3: ITEMS LIST TABLE FORM */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      <FileSpreadsheet className="h-4 w-4 text-[#FF6B00]" />
                      <span>Daftar Rincian Barang / Jasa</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="px-3 py-1 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-[#FF6B00] text-xs font-black flex items-center gap-1 cursor-pointer transition-all border border-orange-500/30"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Tambah Item</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {items.map((item, idx) => (
                      <div key={idx} className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-xs">
                        <div className="sm:col-span-5">
                          <label className="block text-[9px] font-bold text-slate-400 mb-0.5">Deskripsi Barang / Layanan #{idx + 1}</label>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 font-bold text-slate-900 dark:text-white outline-none focus:border-[#FF6B00]"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[9px] font-bold text-slate-400 mb-0.5">Jumlah Qty</label>
                          <input
                            type="number"
                            min={1}
                            value={item.qty}
                            onChange={(e) => handleItemChange(idx, 'qty', parseInt(e.target.value) || 1)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 font-black text-slate-900 dark:text-white outline-none focus:border-[#FF6B00]"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[9px] font-bold text-slate-400 mb-0.5">Satuan</label>
                          <input
                            type="text"
                            value={item.unit}
                            onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                            placeholder="pcs / set"
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 font-bold text-slate-900 dark:text-white outline-none focus:border-[#FF6B00]"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[9px] font-bold text-slate-400 mb-0.5">Harga Satuan (Rp)</label>
                          <input
                            type="number"
                            min={0}
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(idx, 'unitPrice', parseInt(e.target.value) || 0)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 font-black text-slate-900 dark:text-white outline-none focus:border-[#FF6B00]"
                          />
                        </div>

                        <div className="sm:col-span-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            disabled={items.length <= 1}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 disabled:opacity-30 cursor-pointer transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SECTION 4: TAXES & TOTAL CALCULATIONS */}
                <div className="bg-slate-900 text-white p-4.5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-black text-[#FFC107]">
                      <Calculator className="h-4 w-4" />
                      <span>Kalkulasi Pajak & Total Tagihan (PPh 23 & PPN 11%)</span>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-bold">
                      <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                        <input
                          type="checkbox"
                          checked={includePPN}
                          onChange={(e) => setIncludePPN(e.target.checked)}
                          className="accent-[#FF6B00] rounded cursor-pointer h-3.5 w-3.5"
                        />
                        <span>+ PPN 11% (PKP)</span>
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                        <input
                          type="checkbox"
                          checked={includePPh23}
                          onChange={(e) => setIncludePPh23(e.target.checked)}
                          className="accent-[#FFC107] rounded cursor-pointer h-3.5 w-3.5"
                        />
                        <span>- PPh 23 (2%)</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                      <span className="block text-[10px] text-slate-400 font-bold">Subtotal (DPP):</span>
                      <span className="font-black text-white text-sm">Rp{subtotal.toLocaleString('id-ID')}</span>
                    </div>

                    <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                      <span className="block text-[10px] text-emerald-400 font-bold">+ PPN 11%:</span>
                      <span className="font-black text-emerald-400 text-sm">Rp{ppnVal.toLocaleString('id-ID')}</span>
                    </div>

                    <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                      <span className="block text-[10px] text-amber-400 font-bold">- Potongan PPh 23:</span>
                      <span className="font-black text-amber-400 text-sm">-Rp{pphVal.toLocaleString('id-ID')}</span>
                    </div>

                    <div className="bg-gradient-to-r from-orange-950/80 to-amber-950/80 p-2.5 rounded-xl border border-orange-500/40">
                      <span className="block text-[10px] text-orange-200 font-bold">Total Akhir Pembeli:</span>
                      <span className="font-black text-[#FFC107] text-base">Rp{totalBuyer.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>

                {/* SECTION 5: NOTES & TERMS */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/70 space-y-1.5">
                  <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Catatan & Syarat Ketentuan Transaksi:
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-[#FF6B00]"
                  />
                </div>

              </div>
            ) : (
              /* PREVIEW TAB */
              <div className="bg-slate-100 dark:bg-slate-950 p-4 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-inner max-w-2xl mx-auto">
                {/* Paper Preview Card */}
                <div className="bg-white text-slate-900 p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200 space-y-6 font-sans text-xs">
                  {/* Brand Bar */}
                  <div className="border-b-2 border-orange-500 pb-4 flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      {issuerLogo ? (
                        <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shrink-0">
                          <img src={issuerLogo} alt={issuerCompany} className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-[#FF6B00] text-white flex items-center justify-center font-black text-sm shrink-0">
                          {issuerCompany ? issuerCompany.charAt(0).toUpperCase() : 'B'}
                        </div>
                      )}
                      <div>
                        <span className="font-black text-sm text-slate-900 block leading-tight">{issuerCompany || 'PT BUSINESS CONNECT'}</span>
                        <p className="text-[9.5px] text-slate-500 line-clamp-1">{issuerAddress}</p>
                        <p className="text-[9px] text-orange-600 font-black mt-0.5">BCI PORTAL INDONESIA • OFFICIAL B2B NETWORK</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <h2 className="font-black text-sm text-red-600 uppercase">
                        {docType === 'po' ? 'PURCHASE ORDER (PO)' : docType === 'quotation' ? 'SURAT PENAWARAN' : docType === 'invoice' ? 'INVOICE B2B' : docType === 'contract' ? 'PERJANJIAN MOU' : 'PERINTAH KERJA (SPK)'}
                      </h2>
                      <p className="text-[10px] font-bold text-slate-500">No: {docNumber}</p>
                      <p className="text-[10px] text-slate-400">Tgl: {docDate}</p>
                    </div>
                  </div>

                  {/* Parties 2 Cols */}
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-[10.5px]">
                    <div className="space-y-0.5">
                      <p className="font-black text-orange-600 text-[9px] uppercase tracking-wider">DARI (PIHAK PENERBIT):</p>
                      <p className="font-black text-slate-900 text-xs">{issuerCompany}</p>
                      <p className="text-slate-700 font-bold text-[10px]">UP / Perwakilan: {issuerName}</p>
                      <p className="text-slate-600 text-[9.5px] whitespace-pre-line">{issuerAddress}</p>
                      {issuerTaxId && <p className="text-slate-500 text-[9px] font-bold">NIB/NPWP: {issuerTaxId}</p>}
                    </div>

                    <div className="space-y-0.5">
                      <p className="font-black text-blue-600 text-[9px] uppercase tracking-wider">KEPADA YTH (TUJUAN):</p>
                      <p className="font-black text-slate-900 text-xs">{recipientCompany}</p>
                      <p className="text-slate-700 font-bold text-[10px]">UP: {recipientName}</p>
                      <p className="text-slate-600 text-[9.5px] whitespace-pre-line">{recipientAddress}</p>
                      {dueDate && <p className="text-slate-700 font-bold text-[9px]">Jatuh Tempo: {dueDate}</p>}
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-[10px]">
                      <thead className="bg-slate-900 text-white font-bold">
                        <tr>
                          <th className="p-2 text-left w-8">#</th>
                          <th className="p-2 text-left">Deskripsi Barang / Layanan</th>
                          <th className="p-2 text-center">Qty</th>
                          <th className="p-2 text-right">Harga (Rp)</th>
                          <th className="p-2 text-right">Total (Rp)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {items.map((item, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                            <td className="p-2 text-slate-400">{idx + 1}</td>
                            <td className="p-2 font-bold text-slate-800">{item.description}</td>
                            <td className="p-2 text-center">{item.qty} {item.unit}</td>
                            <td className="p-2 text-right">Rp{item.unitPrice.toLocaleString('id-ID')}</td>
                            <td className="p-2 text-right font-black text-slate-900">Rp{(item.qty * item.unitPrice).toLocaleString('id-ID')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Totals & Tax Box */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex-1 text-[9.5px]">
                      <p className="font-black text-slate-700 uppercase mb-1">Catatan Transaksi:</p>
                      <p className="text-slate-600 whitespace-pre-line leading-relaxed">{notes}</p>
                    </div>

                    <div className="bg-slate-900 text-white p-3 rounded-xl space-y-1 text-[10px] w-52 shrink-0">
                      <div className="flex justify-between text-slate-300">
                        <span>Subtotal (DPP):</span>
                        <span className="font-bold">Rp{subtotal.toLocaleString('id-ID')}</span>
                      </div>
                      {includePPN && (
                        <div className="flex justify-between text-emerald-400">
                          <span>+ PPN 11%:</span>
                          <span className="font-bold">Rp{ppnVal.toLocaleString('id-ID')}</span>
                        </div>
                      )}
                      {includePPh23 && (
                        <div className="flex justify-between text-amber-400">
                          <span>- PPh 23 (2%):</span>
                          <span className="font-bold">-Rp{pphVal.toLocaleString('id-ID')}</span>
                        </div>
                      )}
                      <div className="pt-1.5 border-t border-slate-700 flex justify-between font-black text-xs text-[#FFC107]">
                        <span>Total Tagihan:</span>
                        <span>Rp{totalBuyer.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stamp & Verification */}
                  <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-[9px] text-slate-500">
                    <div className="text-center">
                      <p className="font-bold text-slate-700">PIHAK PENERBIT</p>
                      <div className="my-1.5 py-1 px-3 border border-orange-300 bg-orange-50 text-[#FF6B00] font-black rounded-lg">
                        [ VERIFIED STAMP ]
                      </div>
                      <p className="font-bold text-slate-900">{issuerName}</p>
                    </div>

                    <div className="text-center">
                      <p className="font-bold text-slate-700">PIHAK PEMBELI</p>
                      <div className="my-1.5 py-1 px-3 border border-blue-300 bg-blue-50 text-blue-600 font-black rounded-lg">
                        [ DIGITAL APPROVAL ]
                      </div>
                      <p className="font-bold text-slate-900">{recipientName}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* FOOTER ACTIONS BAR */}
          <div className="p-4 bg-slate-900 text-white border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="text-xs text-slate-400 font-bold text-center sm:text-left">
              <span>Status: </span>
              <span className="text-emerald-400 font-black">Siap Diterbitkan ke Format PDF & Chat</span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDownloadPDF}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all border border-slate-700"
              >
                <Download className="h-4 w-4 text-[#FFC107]" />
                <span>Unduh PDF</span>
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSendToChatAction}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#FFC107] to-[#FF6B00] hover:brightness-110 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 cursor-pointer transition-all"
              >
                <Send className="h-4 w-4" />
                <span>Kirim Dokumen PDF ke Chat</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
