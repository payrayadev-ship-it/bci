/**
 * Business Connect Indonesia (BCI)
 * Shared TypeScript Interfaces
 */

export type UserRole =
  | 'Super Admin'
  | 'Admin'
  | 'Moderator'
  | 'Perusahaan'
  | 'Investor'
  | 'Supplier'
  | 'Vendor'
  | 'Member';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  companyId?: string;
  membership: 'Gratis' | 'Premium' | 'Enterprise';
  phone?: string;
  password?: string;
  language?: 'id' | 'en';
  position?: string;
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  cover: string;
  sector: string;
  description: string;
  foundedYear: number;
  legality: {
    nib: string;
    npwp: string;
    certificates: string[];
  };
  address: {
    city: string;
    province: string;
    fullAddress: string;
    mapsUrl: string;
  };
  contact: {
    website: string;
    email: string;
    whatsapp: string;
    socialMedia: {
      linkedin?: string;
      instagram?: string;
      facebook?: string;
    };
  };
  videoProfileUrl: string;
  photos: string[];
  portfolio: {
    title: string;
    description: string;
    year: number;
    image?: string;
  }[];
  products: {
    name: string;
    price: number;
    image: string;
    description: string;
  }[];
  services: string[];
  employeesCount: number;
  isVerified: boolean;
  rating: number;
  reviewsCount: number;
  followersCount: number;
  followedBy: string[]; // User IDs
}

export interface FeedPost {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  authorCompany?: string;
  type: 'article' | 'news' | 'photo' | 'video' | 'polling' | 'document';
  title?: string;
  content: string;
  mediaUrl?: string; // photo, video or document URL
  documentName?: string; // for PDF/doc
  pollingOptions?: {
    id: string;
    text: string;
    votes: string[]; // array of user IDs
  }[];
  likes: string[]; // array of user IDs
  comments: {
    id: string;
    authorName: string;
    authorAvatar: string;
    content: string;
    timestamp: string;
    likes?: string[]; // array of user IDs
    replies?: {
      id: string;
      authorName: string;
      authorAvatar: string;
      content: string;
      timestamp: string;
    }[];
  }[];
  sharesCount: number;
  repostsCount: number;
  isSavedBy: string[]; // array of user IDs
  timestamp: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  category:
    | 'Ekonomi'
    | 'Investasi'
    | 'Startup'
    | 'UMKM'
    | 'Properti'
    | 'Industri'
    | 'Teknologi'
    | 'AI'
    | 'Energi'
    | 'Otomotif'
    | 'Pemerintahan'
    | 'Tender'
    | 'Ekspor'
    | 'Impor';
  summary: string;
  content: string;
  image: string;
  authorName: string;
  authorRole: string;
  timestamp: string;
  seoKeywords: string[];
  metaDescription: string;
  isModerated: boolean;
}

export interface B2BProduct {
  id: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  category: 'Mesin' | 'Software' | 'Kendaraan' | 'Material' | 'Alat Berat' | 'Jasa' | 'Konsultasi';
  name: string;
  price: number;
  unit: string;
  image: string;
  description: string;
  city: string;
  province: string;
  rating: number;
  isVerified: boolean;
}

export interface Tender {
  id: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  title: string;
  value: number; // in IDR
  deadline: string;
  requirements: string[];
  location: string;
  description: string;
  documents: string[];
  proposals: {
    id: string;
    vendorId: string;
    vendorName: string;
    vendorLogo: string;
    budgetProposed: number;
    timeline: string;
    coverLetter: string;
    status: 'Pending' | 'Review' | 'Disetujui' | 'Ditolak';
    timestamp: string;
  }[];
  isPremium: boolean;
  status: 'Buka' | 'Selesai';
}

export interface BusinessEvent {
  id: string;
  title: string;
  type: 'Seminar' | 'Webinar' | 'Workshop' | 'Expo' | 'Business Matching' | 'Networking';
  date: string;
  time: string;
  location: string; // online zoom link or offline venue
  description: string;
  organizer: string;
  image: string;
  isSynced?: boolean;
}

export interface ForumPost {
  id: string;
  category: string;
  authorName: string;
  authorAvatar: string;
  authorRole: string;
  title: string;
  content: string;
  likes: string[];
  comments: {
    id: string;
    authorName: string;
    authorAvatar: string;
    authorRole: string;
    content: string;
    timestamp: string;
  }[];
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  chatId: string; // e.g. "user1_user2" or "group1"
  senderId: string;
  senderName: string;
  senderAvatar: string;
  message: string;
  timestamp: string;
  file?: {
    name: string;
    type: 'image' | 'video' | 'pdf' | 'excel' | 'proposal';
    url: string;
  };
  isRead: boolean;
}

export interface CRMLead {
  id: string;
  companyId: string;
  contactName: string;
  email: string;
  phone: string;
  dealValue: number;
  stage: 'Prospect' | 'Contacted' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';
  nextFollowUp: string;
  notes: string;
  lastUpdated: string;
  source?: 'Marketplace B2B' | 'Direktori BCI' | 'Tender Proyek' | 'Manual' | string;
  sourceProductId?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'system' | 'matching' | 'legal' | 'tender';
  timestamp: string;
  isRead: boolean;
}

// Zoho Books / BCI Accounting Module Interfaces
export interface ZohoBooksInvoiceItem {
  id: string;
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface ZohoBooksInvoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerCompany: string;
  customerEmail?: string;
  issueDate: string;
  dueDate: string;
  items: ZohoBooksInvoiceItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  status: 'Lunas' | 'Belum Dibayar' | 'Jatuh Tempo' | 'Draft';
  paymentMethod?: string;
  notes?: string;
}

export interface ZohoBooksEstimate {
  id: string;
  estimateNumber: string;
  customerName: string;
  customerCompany: string;
  issueDate: string;
  expiryDate: string;
  items: ZohoBooksInvoiceItem[];
  totalAmount: number;
  status: 'Diterima' | 'Terkirim' | 'Ditolak' | 'Draft';
  notes?: string;
}

export interface ZohoBooksExpense {
  id: string;
  expenseNumber: string;
  category: 'Sewa & Gedung' | 'Gaji & Bonus' | 'Utilitas & Listrik' | 'Pemasaran & Iklan' | 'Transportasi & Logistik' | 'Peralatan Kantor' | 'Lainnya';
  vendorName: string;
  amount: number;
  date: string;
  paymentAccount: 'Bank BCA' | 'Bank Mandiri' | 'Kas Kecil (Cash)' | 'BCI Escrow';
  reference?: string;
  description: string;
  status: 'Disetujui' | 'Draft' | 'Menunggu';
}

export interface ZohoBooksItem {
  id: string;
  sku: string;
  name: string;
  type: 'Barang' | 'Jasa / Layanan';
  unit: string;
  sellingPrice: number;
  costPrice: number;
  stockQty: number;
  taxRate: number;
  description?: string;
}

export interface ZohoBooksContact {
  id: string;
  name: string;
  companyName: string;
  type: 'Pelanggan (Customer)' | 'Pemasok (Vendor)' | 'Keduanya';
  email: string;
  phone: string;
  address: string;
  npwp?: string;
  balance: number;
}

export interface ZohoBooksBankAccount {
  id: string;
  accountName: string;
  bankName: string;
  accountNumber: string;
  balance: number;
  accountType: 'Bank Utama' | 'Kas Kecil' | 'Escrow Account';
  currency: 'IDR' | 'USD';
}

export interface ZohoBooksData {
  invoices: ZohoBooksInvoice[];
  estimates: ZohoBooksEstimate[];
  expenses: ZohoBooksExpense[];
  items: ZohoBooksItem[];
  contacts: ZohoBooksContact[];
  bankAccounts: ZohoBooksBankAccount[];
}

export interface AppDatabase {
  users: User[];
  companies: Company[];
  feedPosts: FeedPost[];
  newsArticles: NewsArticle[];
  marketplaceProducts: B2BProduct[];
  tenders: Tender[];
  events: BusinessEvent[];
  forumPosts: ForumPost[];
  chatMessages: ChatMessage[];
  crmLeads: CRMLead[];
  notifications?: Notification[];
  zohoBooks?: ZohoBooksData;
  auditLogs: {
    id: string;
    user: string;
    action: string;
    timestamp: string;
  }[];
}
