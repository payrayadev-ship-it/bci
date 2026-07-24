import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Plus,
  Search,
  Filter,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Building2,
  Users,
  Package,
  Landmark,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Printer,
  Send,
  RefreshCw,
  Receipt,
  Sparkles,
  X,
  ChevronRight,
  FileSpreadsheet,
  Edit,
  Trash2
} from 'lucide-react';
import {
  AppDatabase,
  User,
  ZohoBooksData,
  ZohoBooksInvoice,
  ZohoBooksEstimate,
  ZohoBooksExpense,
  ZohoBooksItem,
  ZohoBooksContact,
  ZohoBooksBankAccount
} from '../types';
import DocumentGeneratorModal from './DocumentGeneratorModal';

interface ZohoBooksViewProps {
  db: AppDatabase | null;
  currentUser: User;
  onRefresh: () => void;
}

export default function ZohoBooksView({ db, currentUser, onRefresh }: ZohoBooksViewProps) {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'dashboard' | 'invoices' | 'estimates' | 'expenses' | 'items' | 'contacts' | 'banking' | 'reports'>('dashboard');

  // Subfilters
  const [invoiceFilter, setInvoiceFilter] = useState<'semua' | 'Lunas' | 'Belum Dibayar' | 'Jatuh Tempo'>('semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Document Generator Modal State
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [docModalType, setDocModalType] = useState<'po' | 'quotation' | 'invoice' | 'contract' | 'spk'>('invoice');
  const [docDefaultRecipientCompany, setDocDefaultRecipientCompany] = useState('PT Industri Maju Bersama');
  const [docDefaultRecipientName, setDocDefaultRecipientName] = useState('Budi Santoso');
  const [docDefaultItems, setDocDefaultItems] = useState<Array<{ description: string; qty: number; unit: string; unitPrice: number }>>([
    { description: 'Produk B2B / Layanan Konsultasi', qty: 1, unit: 'Paket', unitPrice: 15000000 }
  ]);

  // Quick Action Modals
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isToastMessage, setIsToastMessage] = useState<string | null>(null);

  // Form States for Expense
  const [expCategory, setExpCategory] = useState<'Sewa & Gedung' | 'Gaji & Bonus' | 'Utilitas & Listrik' | 'Pemasaran & Iklan' | 'Transportasi & Logistik' | 'Peralatan Kantor' | 'Lainnya'>('Gaji & Bonus');
  const [expVendor, setExpVendor] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expAccount, setExpAccount] = useState<'Bank BCA' | 'Bank Mandiri' | 'Kas Kecil (Cash)' | 'BCI Escrow'>('Bank BCA');
  const [expDesc, setExpDesc] = useState('');
  const [submittingExpense, setSubmittingExpense] = useState(false);

  // Form States for Item
  const [itemName, setItemName] = useState('');
  const [itemSku, setItemSku] = useState('');
  const [itemType, setItemType] = useState<'Barang' | 'Jasa / Layanan'>('Barang');
  const [itemUnit, setItemUnit] = useState('Unit');
  const [itemPrice, setItemPrice] = useState('');
  const [itemCost, setItemCost] = useState('');
  const [itemStock, setItemStock] = useState('10');
  const [submittingItem, setSubmittingItem] = useState(false);

  // Form States for Contact
  const [contactName, setContactName] = useState('');
  const [contactCompany, setContactCompany] = useState('');
  const [contactType, setContactType] = useState<'Pelanggan (Customer)' | 'Pemasok (Vendor)' | 'Keduanya'>('Pelanggan (Customer)');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactAddress, setContactAddress] = useState('');
  const [submittingContact, setSubmittingContact] = useState(false);

  // Extract Books Data from DB with robust fallbacks
  const books: ZohoBooksData = useMemo(() => {
    if (db?.zohoBooks) return db.zohoBooks;

    // Fallback seed if DB not initialized yet
    return {
      invoices: [
        {
          id: 'inv_101',
          invoiceNumber: 'INV-2026-001',
          customerName: 'Budi Santoso',
          customerCompany: 'PT Telkom Indonesia',
          customerEmail: 'budi.santoso@telkom.co.id',
          issueDate: '2026-07-01',
          dueDate: '2026-07-31',
          items: [
            { id: 'item_i1', description: 'Pengadaan Mesin Conveyor Otomatis High Speed', qty: 2, unit: 'Unit', unitPrice: 45000000, total: 90000000 },
            { id: 'item_i2', description: 'Jasa Instalasi & Kalibrasi Sensor Industri', qty: 1, unit: 'Paket', unitPrice: 15000000, total: 15000000 }
          ],
          subtotal: 105000000,
          taxAmount: 11550000,
          totalAmount: 116550000,
          paidAmount: 116550000,
          status: 'Lunas',
          paymentMethod: 'Bank Transfer BCA',
          notes: 'Lunas via BCI Escrow Account.'
        },
        {
          id: 'inv_102',
          invoiceNumber: 'INV-2026-002',
          customerName: 'Siti Rahma',
          customerCompany: 'Lestari Capital & Ventures',
          customerEmail: 'siti.rahma@lestari.vc',
          issueDate: '2026-07-10',
          dueDate: '2026-08-10',
          items: [
            { id: 'item_i3', description: 'Lisensi Cloud ERP Indibiz B2B (12 Bulan)', qty: 1, unit: 'Tahun', unitPrice: 42000000, total: 42000000 }
          ],
          subtotal: 42000000,
          taxAmount: 4620000,
          totalAmount: 46620000,
          paidAmount: 0,
          status: 'Belum Dibayar',
          notes: 'Termin 30 Hari Kerja.'
        }
      ],
      estimates: [
        {
          id: 'est_201',
          estimateNumber: 'EST-2026-008',
          customerName: 'Andi Wijaya',
          customerCompany: 'CV Maju Bersama Teknik',
          issueDate: '2026-07-12',
          expiryDate: '2026-08-12',
          items: [
            { id: 'item_e1', description: 'Penawaran Pembuatan Moulding Cor Logam Presisi', qty: 5, unit: 'Set', unitPrice: 18000000, total: 90000000 }
          ],
          totalAmount: 99900000,
          status: 'Diterima',
          notes: 'Sesuai dengan kesepakatan spesifikasi teknis BCI Matching.'
        }
      ],
      expenses: [
        {
          id: 'exp_301',
          expenseNumber: 'EXP-2026-015',
          category: 'Sewa & Gedung',
          vendorName: 'PT SCBD Realty Land',
          amount: 25000000,
          date: '2026-07-05',
          paymentAccount: 'Bank BCA',
          reference: 'TRX-SCBD-9912',
          description: 'Sewa Ruang Kantor Operasional Lt. 12 Bulan Juli 2026',
          status: 'Disetujui'
        },
        {
          id: 'exp_302',
          expenseNumber: 'EXP-2026-016',
          category: 'Utilitas & Listrik',
          vendorName: 'PT PLN (Persero) Industri',
          amount: 8500000,
          date: '2026-07-11',
          paymentAccount: 'Bank Mandiri',
          reference: 'PLN-IND-77821',
          description: 'Tagihan Daya Listrik Pabrik 33.000 VA',
          status: 'Disetujui'
        }
      ],
      items: [
        {
          id: 'itm_401',
          sku: 'MCH-CNV-01',
          name: 'Mesin Conveyor Industri Otomatis',
          type: 'Barang',
          unit: 'Unit',
          sellingPrice: 45000000,
          costPrice: 32000000,
          stockQty: 8,
          taxRate: 11,
          description: 'Conveyor belt industri kecepatan tinggi VFD'
        },
        {
          id: 'itm_402',
          sku: 'SRV-ERP-SUB',
          name: 'Langganan Software Cloud ERP BCI',
          type: 'Jasa / Layanan',
          unit: 'Bulan',
          sellingPrice: 3500000,
          costPrice: 800000,
          stockQty: 999,
          taxRate: 11,
          description: 'Sistem ERP cloud instan terintegrasi perpajakan'
        }
      ],
      contacts: [
        {
          id: 'cnt_501',
          name: 'Budi Santoso',
          companyName: 'PT Telkom Indonesia',
          type: 'Pelanggan (Customer)',
          email: 'budi.santoso@telkom.co.id',
          phone: '+628111234567',
          address: 'Telkom Landmark Tower, Jakarta Selatan',
          npwp: '01.000.123.4-051.000',
          balance: 46620000
        },
        {
          id: 'cnt_502',
          name: 'Andi Wijaya',
          companyName: 'CV Maju Bersama Teknik',
          type: 'Pemasok (Vendor)',
          email: 'sales@majubersamateknik.co.id',
          phone: '+6281355556666',
          address: 'Kawasan Industri Rungkut, Surabaya',
          npwp: '03.444.555.6-061.000',
          balance: -15000000
        }
      ],
      bankAccounts: [
        {
          id: 'bnk_601',
          accountName: 'Rekening Utama Operasional',
          bankName: 'Bank BCA',
          accountNumber: '8830-1293-88',
          balance: 385400000,
          accountType: 'Bank Utama',
          currency: 'IDR'
        },
        {
          id: 'bnk_602',
          accountName: 'Rekening Kas & Payroll',
          bankName: 'Bank Mandiri',
          accountNumber: '137-00-19283-11',
          balance: 142000000,
          accountType: 'Bank Utama',
          currency: 'IDR'
        },
        {
          id: 'bnk_603',
          accountName: 'BCI Escrow Security Deposit',
          bankName: 'BCI Escrow Account',
          accountNumber: 'ESCROW-BCI-8899',
          balance: 95000000,
          accountType: 'Escrow Account',
          currency: 'IDR'
        }
      ]
    };
  }, [db]);

  // Financial Metrics
  const metrics = useMemo(() => {
    const totalIncome = books.invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
    const totalReceivables = books.invoices
      .filter(inv => inv.status === 'Belum Dibayar' || inv.status === 'Jatuh Tempo')
      .reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0);
    const totalExpenses = books.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const netProfit = totalIncome - totalExpenses;
    const totalCashBank = books.bankAccounts.reduce((sum, bnk) => sum + bnk.balance, 0);

    return {
      totalIncome,
      totalReceivables,
      totalExpenses,
      netProfit,
      totalCashBank
    };
  }, [books]);

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return books.invoices.filter(inv => {
      const matchStatus = invoiceFilter === 'semua' || inv.status === invoiceFilter;
      const matchSearch =
        inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.customerCompany.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [books.invoices, invoiceFilter, searchQuery]);

  // Handlers
  const handleOpenDocGenerator = (
    type: 'po' | 'quotation' | 'invoice' | 'contract' | 'spk',
    recipientCompany?: string,
    recipientName?: string,
    items?: Array<{ description: string; qty: number; unit: string; unitPrice: number }>
  ) => {
    setDocModalType(type);
    setDocDefaultRecipientCompany(recipientCompany || 'PT Industri Maju Bersama');
    setDocDefaultRecipientName(recipientName || 'Budi Santoso');
    if (items) setDocDefaultItems(items);
    setIsDocModalOpen(true);
  };

  const handleMarkAsPaid = async (invoiceId: string) => {
    try {
      const res = await fetch('/api/zoho-books/invoice/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId, status: 'Lunas' })
      });

      if (res.ok) {
        setIsToastMessage('Status Invoice berhasil diperbarui menjadi LUNAS!');
        setTimeout(() => setIsToastMessage(null), 3000);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expVendor || !expAmount) return;

    setSubmittingExpense(true);
    try {
      const res = await fetch('/api/zoho-books/expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expenseNumber: `EXP-2026-0${Math.floor(100 + Math.random() * 900)}`,
          category: expCategory,
          vendorName: expVendor,
          amount: Number(expAmount),
          date: new Date().toISOString().split('T')[0],
          paymentAccount: expAccount,
          description: expDesc || `Pengeluaran operasional ${expCategory}`,
          status: 'Disetujui'
        })
      });

      if (res.ok) {
        setIsExpenseModalOpen(false);
        setExpVendor('');
        setExpAmount('');
        setExpDesc('');
        setIsToastMessage('Beban pengeluaran berhasil dicatat!');
        setTimeout(() => setIsToastMessage(null), 3000);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingExpense(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !itemPrice) return;

    setSubmittingItem(true);
    try {
      const res = await fetch('/api/zoho-books/item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: itemSku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
          name: itemName,
          type: itemType,
          unit: itemUnit,
          sellingPrice: Number(itemPrice),
          costPrice: Number(itemCost) || Number(itemPrice) * 0.7,
          stockQty: Number(itemStock) || 0,
          taxRate: 11,
          description: `Katalog ${itemType} B2B`
        })
      });

      if (res.ok) {
        setIsItemModalOpen(false);
        setItemName('');
        setItemSku('');
        setItemPrice('');
        setItemCost('');
        setIsToastMessage('Barang/Layanan baru berhasil ditambahkan!');
        setTimeout(() => setIsToastMessage(null), 3000);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingItem(false);
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactCompany) return;

    setSubmittingContact(true);
    try {
      const res = await fetch('/api/zoho-books/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactName,
          companyName: contactCompany,
          type: contactType,
          email: contactEmail || 'kontak@perusahaan.co.id',
          phone: contactPhone || '+628123456789',
          address: contactAddress || 'Kawasan Bisnis BCI, Jakarta',
          balance: 0
        })
      });

      if (res.ok) {
        setIsContactModalOpen(false);
        setContactName('');
        setContactCompany('');
        setContactEmail('');
        setContactPhone('');
        setContactAddress('');
        setIsToastMessage('Kontak B2B baru berhasil ditambahkan!');
        setTimeout(() => setIsToastMessage(null), 3000);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingContact(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto pb-24">
      {/* Toast Notification */}
      <AnimatePresence>
        {isToastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 z-50 bg-[#15803D] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 font-bold text-xs"
          >
            <CheckCircle2 className="h-5 w-5 text-amber-300" />
            <span>{isToastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Header Zoho Books Suite */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 p-6 sm:p-8 text-white shadow-xl border border-amber-500/20">
        <div className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-black uppercase tracking-wider">
              <BookOpen className="h-3.5 w-3.5" />
              <span>Smart Cloud Accounting • Integration BCI 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Zoho Books Financial Suite
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
              Kelola pencatatan keuangan, faktur penjualan, tagihan vendor, laporan laba rugi, serta ketaatan pajak PPN & PPh secara otomatis dalam satu portal B2B terpadu.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => handleOpenDocGenerator('invoice')}
              className="flex items-center gap-2 bg-gradient-to-r from-[#FF6B00] to-[#EE1C25] hover:opacity-95 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-orange-500/20 cursor-pointer transition-all active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>+ Buat Invoice Baru</span>
            </button>
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs px-3.5 py-2.5 rounded-xl backdrop-blur-sm cursor-pointer transition-all"
            >
              <Receipt className="h-4 w-4 text-amber-400" />
              <span>Catat Pengeluaran</span>
            </button>
          </div>
        </div>

        {/* Bottom Navigation Tabs */}
        <div className="mt-8 pt-4 border-t border-white/10 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs font-bold">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <PieChart className="h-4 w-4" />
            <span>Overview Keuangan</span>
          </button>

          <button
            onClick={() => setActiveTab('invoices')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'invoices'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Penjualan & Faktur ({books.invoices.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('estimates')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'estimates'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Penawaran Harga ({books.estimates.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'expenses'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Receipt className="h-4 w-4" />
            <span>Beban & Pengeluaran ({books.expenses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('items')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'items'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Package className="h-4 w-4" />
            <span>Katalog Stok ({books.items.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('contacts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'contacts'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Kontak B2B ({books.contacts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('banking')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'banking'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Landmark className="h-4 w-4" />
            <span>Kas & Bank ({books.bankAccounts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            <span>Laporan & Pajak</span>
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW FINANCIAL DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Key Financial Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Income */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Pendapatan (Masuk)</span>
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Rp {metrics.totalIncome.toLocaleString('id-ID')}
              </p>
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Dari Invoice Terbayar</span>
              </div>
            </div>

            {/* Total Receivables (Piutang) */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Piutang Usaha (Unpaid)</span>
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-black text-[#FF6B00] tracking-tight">
                Rp {metrics.totalReceivables.toLocaleString('id-ID')}
              </p>
              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>Menunggu Pembayaran Pelanggan</span>
              </div>
            </div>

            {/* Total Expenses */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Beban / Pengeluaran</span>
                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600">
                  <ArrowDownRight className="h-5 w-5" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
                Rp {metrics.totalExpenses.toLocaleString('id-ID')}
              </p>
              <div className="flex items-center gap-1 text-[11px] font-bold text-rose-600">
                <span>Operasional, Gaji & Sewa</span>
              </div>
            </div>

            {/* Net Profit */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl border border-slate-700 shadow-md space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Laba Bersih Estimasi</span>
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Rp {metrics.netProfit.toLocaleString('id-ID')}
              </p>
              <div className="text-[11px] font-medium text-slate-300">
                Laba Operasional B2B Perusahaan
              </div>
            </div>
          </div>

          {/* Quick Bank Balances & Recent Transactions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bank Accounts Widget */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Landmark className="h-5 w-5 text-[#FF6B00]" />
                  <h3 className="font-black text-slate-900 dark:text-white text-sm">Saldo Bank & Escrow</h3>
                </div>
                <span className="text-xs font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full">
                  Real-time
                </span>
              </div>

              <div className="space-y-3">
                {books.bankAccounts.map(bnk => (
                  <div key={bnk.id} className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-xs">{bnk.bankName}</p>
                      <p className="text-[10px] font-medium text-slate-500">{bnk.accountName} • {bnk.accountNumber}</p>
                    </div>
                    <span className="font-black text-xs text-slate-900 dark:text-white">
                      Rp {bnk.balance.toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs font-bold">
                <span className="text-slate-500">Total Kas Terkonsolidasi:</span>
                <span className="text-[#FF6B00] font-black">Rp {metrics.totalCashBank.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Recent Invoices Feed */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#FF6B00]" />
                  <h3 className="font-black text-slate-900 dark:text-white text-sm">Aktivitas Faktur Terbaru</h3>
                </div>
                <button
                  onClick={() => setActiveTab('invoices')}
                  className="text-xs font-bold text-[#FF6B00] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Lihat Semua</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-medium">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                      <th className="pb-2">No. Faktur</th>
                      <th className="pb-2">Pelanggan B2B</th>
                      <th className="pb-2">Jatuh Tempo</th>
                      <th className="pb-2">Total Nilai</th>
                      <th className="pb-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {books.invoices.slice(0, 4).map(inv => (
                      <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 font-bold text-[#FF6B00]">{inv.invoiceNumber}</td>
                        <td className="py-3">
                          <p className="font-bold text-slate-900 dark:text-white">{inv.customerCompany}</p>
                          <p className="text-[10px] text-slate-500">{inv.customerName}</p>
                        </td>
                        <td className="py-3 text-slate-500">{inv.dueDate}</td>
                        <td className="py-3 font-black text-slate-900 dark:text-white">
                          Rp {inv.totalAmount.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 text-right">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                            inv.status === 'Lunas' 
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INVOICES (PENJUALAN) */}
      {activeTab === 'invoices' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          {/* Top Filter & Search Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/70 p-1.5 rounded-2xl w-full sm:w-auto">
              {(['semua', 'Lunas', 'Belum Dibayar', 'Jatuh Tempo'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setInvoiceFilter(st)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer capitalize ${
                    invoiceFilter === st
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-black'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari no. faktur / perusahaan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-[#FF6B00]"
                />
              </div>

              <button
                onClick={() => handleOpenDocGenerator('invoice')}
                className="flex items-center gap-1.5 bg-[#FF6B00] hover:bg-[#EE1C25] text-white font-black text-xs px-4 py-2 rounded-xl shadow-md cursor-pointer transition-colors shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>Invoice Baru</span>
              </button>
            </div>
          </div>

          {/* Table of Invoices */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] border-b border-slate-200 dark:border-slate-700">
                  <th className="p-3.5 rounded-l-xl">No. Faktur</th>
                  <th className="p-3.5">Penerima (Pelanggan)</th>
                  <th className="p-3.5">Tanggal Terbit</th>
                  <th className="p-3.5">Jatuh Tempo</th>
                  <th className="p-3.5">Total Faktur (PPN 11%)</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right rounded-r-xl">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-black text-[#FF6B00]">{inv.invoiceNumber}</td>
                    <td className="p-3.5">
                      <p className="font-bold text-slate-900 dark:text-white">{inv.customerCompany}</p>
                      <p className="text-[10px] text-slate-500">UP: {inv.customerName}</p>
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">{inv.issueDate}</td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">{inv.dueDate}</td>
                    <td className="p-3.5 font-black text-slate-900 dark:text-white">
                      Rp {inv.totalAmount.toLocaleString('id-ID')}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                        inv.status === 'Lunas' 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {inv.status !== 'Lunas' && (
                          <button
                            onClick={() => handleMarkAsPaid(inv.id)}
                            title="Tandai Lunas"
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 cursor-pointer transition-colors"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenDocGenerator('invoice', inv.customerCompany, inv.customerName, inv.items)}
                          title="Cetak PDF / Buka Generator"
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 cursor-pointer transition-colors"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ESTIMATES (PENAWARAN HARGA) */}
      {activeTab === 'estimates' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base">Surat Penawaran Harga (Estimates)</h3>
              <p className="text-xs text-slate-500">Kelola dokumen Quotation & Penawaran resmi sebelum disetujui menjadi Invoice</p>
            </div>
            <button
              onClick={() => handleOpenDocGenerator('quotation')}
              className="flex items-center gap-1.5 bg-[#FF6B00] text-white font-black text-xs px-4 py-2 rounded-xl shadow-md cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Buat Penawaran</span>
            </button>
          </div>

          <div className="space-y-3">
            {books.estimates.map(est => (
              <div key={est.id} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-[#FF6B00] text-sm">{est.estimateNumber}</span>
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-[10px] font-black">
                      {est.status}
                    </span>
                  </div>
                  <p className="font-bold text-slate-900 dark:text-white text-xs">{est.customerCompany} • UP: {est.customerName}</p>
                  <p className="text-[11px] text-slate-500">Masa Berlaku: s/d {est.expiryDate}</p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="block text-[10px] text-slate-400 uppercase font-bold">Total Penawaran:</span>
                    <span className="font-black text-slate-900 dark:text-white text-base">
                      Rp {est.totalAmount.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenDocGenerator('invoice', est.customerCompany, est.customerName, est.items)}
                    className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Ubah ke Invoice</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: EXPENSES (BEBAN PENGELUARAN) */}
      {activeTab === 'expenses' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base">Pencatatan Beban & Pengeluaran</h3>
              <p className="text-xs text-slate-500">Pantau beban sewa, gaji, utility, dan biaya operasional bisnis secara realtime</p>
            </div>
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs px-4 py-2 rounded-xl shadow-md cursor-pointer transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Catat Pengeluaran</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200 dark:border-slate-700">
                  <th className="p-3.5 rounded-l-xl">No. Ref</th>
                  <th className="p-3.5">Kategori Beban</th>
                  <th className="p-3.5">Vendor / Pemasok</th>
                  <th className="p-3.5">Tanggal</th>
                  <th className="p-3.5">Rekening Sumber</th>
                  <th className="p-3.5 text-right rounded-r-xl">Jumlah Pengeluaran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {books.expenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 font-bold text-rose-600">{exp.expenseNumber}</td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">{exp.category}</td>
                    <td className="p-3.5 text-slate-700 dark:text-slate-300">{exp.vendorName}</td>
                    <td className="p-3.5 text-slate-500">{exp.date}</td>
                    <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">{exp.paymentAccount}</td>
                    <td className="p-3.5 text-right font-black text-rose-600">
                      Rp {exp.amount.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: ITEMS & INVENTORY */}
      {activeTab === 'items' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base">Katalog Produk & Stok Barang</h3>
              <p className="text-xs text-slate-500">Daftar harga jual, HPP / Modal, stok inventaris, dan penetapan pajak PPN</p>
            </div>
            <button
              onClick={() => setIsItemModalOpen(true)}
              className="flex items-center gap-1.5 bg-[#FF6B00] text-white font-black text-xs px-4 py-2 rounded-xl shadow-md cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Barang / Jasa</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {books.items.map(itm => (
              <div key={itm.id} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-slate-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                    {itm.sku}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black">
                    {itm.type}
                  </span>
                </div>
                <h4 className="font-black text-slate-900 dark:text-white text-sm">{itm.name}</h4>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Harga Jual:</span>
                    <span className="font-black text-emerald-600">Rp {itm.sellingPrice.toLocaleString('id-ID')} / {itm.unit}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Sisa Stok:</span>
                    <span className="font-black text-slate-900 dark:text-white">{itm.stockQty} {itm.unit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: CONTACTS (PELANGGAN & VENDOR) */}
      {activeTab === 'contacts' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base">Direktori Kontak Pelanggan & Vendor</h3>
              <p className="text-xs text-slate-500">Kelola profil keuangan mitra, NIB/NPWP, serta saldo piutang dan utang B2B</p>
            </div>
            <button
              onClick={() => setIsContactModalOpen(true)}
              className="flex items-center gap-1.5 bg-[#FF6B00] text-white font-black text-xs px-4 py-2 rounded-xl shadow-md cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Kontak</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {books.contacts.map(cnt => (
              <div key={cnt.id} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-[#FF6B00]">{cnt.companyName}</span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                    {cnt.type}
                  </span>
                </div>

                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-xs">{cnt.name}</p>
                  <p className="text-[10px] text-slate-500">{cnt.email} • {cnt.phone}</p>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{cnt.address}</p>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
                  <span className="text-[10px] text-slate-500 font-bold">Saldo Terkait:</span>
                  <span className={`font-black ${cnt.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    Rp {Math.abs(cnt.balance).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: BANKING & CASH */}
      {activeTab === 'banking' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base">Kas, Rekening Bank & BCI Escrow</h3>
              <p className="text-xs text-slate-500">Pencatatan mutasi kas dan keamanan transaksi escrow otomatis</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {books.bankAccounts.map(bnk => (
              <div key={bnk.id} className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl border border-slate-700 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-black text-amber-400 text-xs">{bnk.bankName}</span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-white/10 text-white">
                    {bnk.accountType}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-300">{bnk.accountName}</p>
                  <p className="font-mono text-xs text-slate-400">{bnk.accountNumber}</p>
                </div>
                <div className="pt-2 border-t border-white/10">
                  <span className="text-[10px] text-slate-400 block font-bold">Saldo Efektif:</span>
                  <p className="text-lg font-black text-white">
                    Rp {bnk.balance.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: FINANCIAL REPORTS & TAXES */}
      {activeTab === 'reports' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <div>
            <h3 className="font-black text-slate-900 dark:text-white text-base">Laporan Keuangan & Konsolidasi Pajak</h3>
            <p className="text-xs text-slate-500">Ringkasan Laba Rugi, PPN 11%, dan PPh 23 terhitung otomatis untuk pelaporan fiskal</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Laba Rugi Summary */}
            <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
              <h4 className="font-black text-slate-900 dark:text-white text-sm border-b border-slate-200 dark:border-slate-700 pb-2">
                Laporan Laba Rugi (Profit & Loss)
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1">
                  <span className="text-slate-600 dark:text-slate-400">Total Pendapatan Usaha:</span>
                  <span className="font-bold text-emerald-600">Rp {metrics.totalIncome.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-600 dark:text-slate-400">Total Beban Operasional:</span>
                  <span className="font-bold text-rose-600">(Rp {metrics.totalExpenses.toLocaleString('id-ID')})</span>
                </div>
                <div className="flex justify-between py-2 border-t border-slate-200 dark:border-slate-700 font-black text-sm">
                  <span className="text-slate-900 dark:text-white">Laba Bersih Sebelum Pajak:</span>
                  <span className="text-[#FF6B00]">Rp {metrics.netProfit.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            {/* Pajak Summary */}
            <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
              <h4 className="font-black text-slate-900 dark:text-white text-sm border-b border-slate-200 dark:border-slate-700 pb-2">
                Estimasi Kewajiban Pajak B2B (Fiskal)
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1">
                  <span className="text-slate-600 dark:text-slate-400">PPN Keluaran 11% (Terpungut):</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    Rp {Math.round(metrics.totalIncome * 0.11).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-600 dark:text-slate-400">PPh 23 Jasa & Konsultasi (2%):</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    Rp {Math.round(metrics.totalIncome * 0.02).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-t border-slate-200 dark:border-slate-700 font-black text-sm">
                  <span className="text-slate-900 dark:text-white">Total Faktur Pajak Terbit:</span>
                  <span className="text-emerald-600">{books.invoices.length} Faktur</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: CATAT BEBAN PENGELUARAN */}
      <AnimatePresence>
        {isExpenseModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="font-black text-slate-900 dark:text-white text-base">Catat Beban Pengeluaran Baru</h3>
                <button onClick={() => setIsExpenseModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddExpense} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Kategori Beban:</label>
                  <select
                    value={expCategory}
                    onChange={(e: any) => setExpCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white outline-none focus:border-[#FF6B00]"
                  >
                    <option value="Sewa & Gedung">Sewa & Gedung</option>
                    <option value="Gaji & Bonus">Gaji & Bonus</option>
                    <option value="Utilitas & Listrik">Utilitas & Listrik</option>
                    <option value="Pemasaran & Iklan">Pemasaran & Iklan</option>
                    <option value="Transportasi & Logistik">Transportasi & Logistik</option>
                    <option value="Peralatan Kantor">Peralatan Kantor</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-500 mb-1">Nama Vendor / Penerima:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: PT PLN (Persero)"
                    value={expVendor}
                    onChange={(e) => setExpVendor(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-500 mb-1">Jumlah Pengeluaran (Rp):</label>
                  <input
                    type="number"
                    required
                    placeholder="5000000"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-500 mb-1">Sumber Rekening Pembayaran:</label>
                  <select
                    value={expAccount}
                    onChange={(e: any) => setExpAccount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white outline-none focus:border-[#FF6B00]"
                  >
                    <option value="Bank BCA">Bank BCA</option>
                    <option value="Bank Mandiri">Bank Mandiri</option>
                    <option value="Kas Kecil (Cash)">Kas Kecil (Cash)</option>
                    <option value="BCI Escrow">BCI Escrow</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-500 mb-1">Keterangan Tambahan:</label>
                  <textarea
                    rows={2}
                    placeholder="Sewa kantor bulan Juli..."
                    value={expDesc}
                    onChange={(e) => setExpDesc(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsExpenseModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submittingExpense}
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black cursor-pointer shadow-md"
                  >
                    {submittingExpense ? 'Simpan...' : 'Simpan Pengeluaran'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: TAMBAH BARANG / KATALOG */}
      <AnimatePresence>
        {isItemModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="font-black text-slate-900 dark:text-white text-base">Tambah Barang / Layanan Baru</h3>
                <button onClick={() => setIsItemModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddItem} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Nama Produk / Layanan:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Mesin Cor Presisi"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Tipe:</label>
                    <select
                      value={itemType}
                      onChange={(e: any) => setItemType(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white outline-none focus:border-[#FF6B00]"
                    >
                      <option value="Barang">Barang</option>
                      <option value="Jasa / Layanan">Jasa / Layanan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Satuan Unit:</label>
                    <input
                      type="text"
                      placeholder="Unit / Paket / Bulan"
                      value={itemUnit}
                      onChange={(e) => setItemUnit(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white outline-none focus:border-[#FF6B00]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Harga Jual (Rp):</label>
                    <input
                      type="number"
                      required
                      placeholder="15000000"
                      value={itemPrice}
                      onChange={(e) => setItemPrice(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white outline-none focus:border-[#FF6B00]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Modal / HPP (Rp):</label>
                    <input
                      type="number"
                      placeholder="10000000"
                      value={itemCost}
                      onChange={(e) => setItemCost(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white outline-none focus:border-[#FF6B00]"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsItemModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submittingItem}
                    className="px-5 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#EE1C25] text-white font-black cursor-pointer shadow-md"
                  >
                    {submittingItem ? 'Menyimpan...' : 'Tambah Katalog'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: TAMBAH KONTAK B2B */}
      <AnimatePresence>
        {isContactModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="font-black text-slate-900 dark:text-white text-base">Tambah Kontak B2B Baru</h3>
                <button onClick={() => setIsContactModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddContact} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Nama Perusahaan / UMKM:</label>
                  <input
                    type="text"
                    required
                    placeholder="PT Industri Bersama"
                    value={contactCompany}
                    onChange={(e) => setContactCompany(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-500 mb-1">Nama Kontak Perwakilan (UP):</label>
                  <input
                    type="text"
                    required
                    placeholder="Budi Santoso"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-500 mb-1">Jenis Kontak:</label>
                  <select
                    value={contactType}
                    onChange={(e: any) => setContactType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white outline-none focus:border-[#FF6B00]"
                  >
                    <option value="Pelanggan (Customer)">Pelanggan (Customer)</option>
                    <option value="Pemasok (Vendor)">Pemasok (Vendor)</option>
                    <option value="Keduanya">Keduanya</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Email:</label>
                    <input
                      type="email"
                      placeholder="budi@perusahaan.co.id"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white outline-none focus:border-[#FF6B00]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">No. WhatsApp:</label>
                    <input
                      type="text"
                      placeholder="+628123456789"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white outline-none focus:border-[#FF6B00]"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsContactModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submittingContact}
                    className="px-5 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#EE1C25] text-white font-black cursor-pointer shadow-md"
                  >
                    {submittingContact ? 'Menyimpan...' : 'Tambah Kontak'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DOCUMENT GENERATOR MODAL DIRECT INTEGRATION */}
      <DocumentGeneratorModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        db={db || undefined}
        currentUser={currentUser}
        defaultDocType={docModalType}
        defaultRecipientCompany={docDefaultRecipientCompany}
        defaultRecipientName={docDefaultRecipientName}
        defaultItems={docDefaultItems}
      />
    </div>
  );
}
