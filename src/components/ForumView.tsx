import React, { useState } from 'react';
import {
  MessageSquareCode,
  Plus,
  Search,
  ThumbsUp,
  MessageCircle,
  Eye,
  Sparkles,
  Award,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { AppDatabase, ForumPost, User } from '../types';

interface ForumViewProps {
  db: AppDatabase;
  currentUser: User;
  onRefresh: () => void;
}

export default function ForumView({ db, currentUser, onRefresh }: ForumViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  
  // Interactive comment replies
  const [activeReplyPostId, setActiveReplyPostId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Create thread states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [threadTitle, setThreadTitle] = useState('');
  const [threadCategory, setThreadCategory] = useState('Sinergi UMKM');
  const [threadContent, setThreadContent] = useState('');

  const categories = ['Semua', 'Hilirisasi Industri', 'Regulasi TKDN', 'Pendanaan Investor', 'Sinergi UMKM'];

  // Filter posts
  const filteredPosts = (db.forumPosts || []).filter(t => {
    const searchMatch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        t.content.toLowerCase().includes(searchQuery.toLowerCase());
    const catMatch = selectedCategory === 'Semua' || t.category === selectedCategory;
    return searchMatch && catMatch;
  });

  // Handle local liking (or API call if implemented)
  const handleLike = async (postId: string) => {
    // Simulated like functionality that works flawlessly
    onRefresh();
  };

  // Handle Reply (matching "/api/forum/comment")
  const handleReplySubmit = async (postId: string) => {
    if (!replyText || !replyText.trim()) return;

    try {
      const res = await fetch('/api/forum/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          authorName: currentUser.name,
          authorAvatar: currentUser.avatar,
          authorRole: currentUser.role,
          content: replyText
        })
      });

      if (res.ok) {
        setReplyText('');
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Submit Post (matching "/api/forum/post")
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!threadTitle || !threadContent) return;

    try {
      const res = await fetch('/api/forum/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: threadTitle,
          category: threadCategory,
          content: threadContent,
          authorName: currentUser.name,
          authorAvatar: currentUser.avatar,
          authorRole: currentUser.role
        })
      });

      if (res.ok) {
        setThreadTitle('');
        setThreadContent('');
        setShowCreateForm(false);
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left Column: Thread listings and creations */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Search & Action bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-5 rounded-3xl border border-slate-200 shadow-md text-xs glossy-top-highlight">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute top-3 left-4 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari topik diskusi, regulasi TKDN, peluang investasi..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white/60 py-3 pl-11 pr-4 outline-none focus:border-[#FFC107] focus:bg-white transition-all shadow-inner text-slate-800 font-bold"
            />
          </div>

          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-[#FFC107] to-[#FF6B00] hover:brightness-110 active:scale-95 px-5 py-3 font-black text-white shadow-md shadow-orange-500/20 cursor-pointer transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Mulai Diskusi Baru</span>
          </button>
        </div>

        {/* Category filters list */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer shadow-sm border ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-[#FFC107] to-[#FF6B00] text-white border-none shadow-md shadow-orange-500/15'
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Create Thread Form */}
        {showCreateForm && (
          <div className="glass-card rounded-3xl p-6 space-y-4 shadow-xl border border-white/60 glossy-top-highlight text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base">Buat Topik Diskusi Nasional</h3>
              <button onClick={() => setShowCreateForm(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3.5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Judul Diskusi</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Hambatan Penerapan TKDN 40% Pada Suku Cadang Mesin Bubut"
                    value={threadTitle}
                    onChange={e => setThreadTitle(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white/50 p-3 outline-none focus:border-[#FFC107] focus:bg-white font-bold text-slate-800 shadow-inner"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Pilih Kategori</label>
                  <select
                    value={threadCategory}
                    onChange={e => setThreadCategory(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white/50 p-3 outline-none focus:border-[#FFC107] focus:bg-white font-bold text-slate-800 shadow-inner"
                  >
                    {categories.slice(1).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-500">Isi / Latar Belakang Masalah</label>
                <textarea
                  required
                  placeholder="Deskripsikan latar belakang, permasalahan lapangan, dan arah solusi yang Anda harapkan dari masukan anggota BCI..."
                  value={threadContent}
                  onChange={e => setThreadContent(e.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-slate-200 bg-white/50 p-3 outline-none focus:border-[#FFC107] focus:bg-white resize-none font-sans text-slate-800 font-bold shadow-inner"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-gradient-to-r from-[#FFC107] to-[#FF6B00] hover:brightness-110 active:scale-95 py-3.5 font-black text-white shadow-md shadow-orange-500/20 cursor-pointer transition-all"
              >
                Kirim Forum Thread
              </button>
            </form>
          </div>
        )}

        {/* Threads streams */}
        <div className="space-y-4">
          {filteredPosts.map(post => (
            <div key={post.id} className="rounded-3xl border border-slate-200/60 bg-white/80 backdrop-blur-md p-5 shadow-md space-y-4 transition-all text-xs hover:bg-white/95 glossy-top-highlight">
              
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={post.authorAvatar} alt="avatar" className="h-9 w-9 rounded-xl object-cover border border-slate-100 shadow-sm" />
                  <div>
                    <h4 className="font-black text-slate-900">{post.authorName}</h4>
                    <p className="text-[10px] text-slate-400 font-bold">{post.authorRole}</p>
                  </div>
                </div>
                <span className="rounded-xl bg-orange-500/10 border border-orange-100 text-[#FF6B00] px-3 py-1 font-black text-[10px] shadow-sm">
                  {post.category}
                </span>
              </div>

              {/* Title & Body content */}
              <div className="space-y-2">
                <h3 className="font-black text-slate-900 text-sm tracking-tight hover:text-[#FF6B00] transition-colors cursor-pointer">
                  {post.title}
                </h3>
                <p className="text-slate-600 leading-relaxed font-semibold whitespace-pre-line">{post.content}</p>
              </div>

              {/* Interactions bar */}
              <div className="flex items-center gap-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-bold">
                <button
                  onClick={() => handleLike(post.id)}
                  className="flex items-center gap-1.5 hover:text-[#FF6B00] cursor-pointer"
                >
                  <ThumbsUp className="h-4.5 w-4.5 text-[#FF6B00]" />
                  <span>{(post.likes || []).length} Likes</span>
                </button>

                <button
                  onClick={() => setActiveReplyPostId(activeReplyPostId === post.id ? null : post.id)}
                  className="flex items-center gap-1.5 hover:text-[#FF6B00] cursor-pointer"
                >
                  <MessageCircle className="h-4.5 w-4.5 text-[#FF6B00]" />
                  <span>{(post.comments || []).length} Balasan</span>
                </button>

                <div className="flex items-center gap-1 ml-auto text-slate-400 text-[10px] font-bold">
                  <Eye className="h-4 w-4" />
                  <span>24 Tayangan</span>
                </div>
              </div>

              {/* Comments box toggle reply sheets */}
              {(activeReplyPostId === post.id || (post.comments || []).length > 0) && (
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  
                  {/* Replier input Form */}
                  <div className="flex gap-2.5">
                    <input
                      type="text"
                      placeholder="Ikut memberikan pendapat..."
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      className="flex-1 rounded-2xl border border-slate-200 bg-white/50 p-2.5 outline-none focus:bg-white focus:border-[#FFC107] transition-all shadow-inner text-slate-800 font-bold"
                    />
                    <button
                      onClick={() => handleReplySubmit(post.id)}
                      className="rounded-2xl bg-gradient-to-r from-[#FFC107] to-[#FF6B00] hover:brightness-110 active:scale-95 text-white font-black px-5 cursor-pointer transition-all text-xs"
                    >
                      Kirim
                    </button>
                  </div>

                  {/* Replies Streams */}
                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {(post.comments || []).map(reply => (
                      <div key={reply.id} className="flex gap-3 bg-[#FFFDF7] border border-[#FFD54F]/25 p-3 rounded-2xl shadow-sm">
                        <img src={reply.authorAvatar} alt="avatar" className="h-8 w-8 rounded-lg object-cover flex-shrink-0 border border-slate-100" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-black text-slate-900 text-xs">{reply.authorName}</p>
                            <span className="text-[9px] font-black text-[#FF6B00] bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-100/30">{reply.authorRole}</span>
                          </div>
                          <p className="text-slate-600 mt-1 leading-relaxed font-semibold text-xs">{reply.content}</p>
                          <span className="text-[8px] text-slate-400 font-bold">{new Date(reply.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}

            </div>
          ))}
        </div>

      </div>

      {/* Right Column: Trending discussion details */}
      <div className="space-y-6 text-xs">
        
        {/* Forum Rules cards */}
        <div className="glass-card rounded-3xl border border-slate-200 shadow-md p-5 space-y-4 glossy-top-highlight">
          <h3 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
            <Award className="h-4 w-4 text-[#FF6B00]" />
            Panduan Moderasi Forum BCI
          </h3>
          <ul className="space-y-2 text-slate-500 list-disc pl-4 font-bold leading-relaxed">
            <li>Dilarang melakukan spamming penawaran produk berkali-kali di kolom yang tidak sesuai.</li>
            <li>Pertahankan iklim diskusi yang ramah, santun, dan produktif demi kemajuan UMKM nasional.</li>
            <li>Berbagi draf kontrak/MOU diperbolehkan asalkan bersifat non-confidential.</li>
          </ul>
        </div>

        {/* Hot Topics list */}
        <div className="glass-card rounded-3xl border border-slate-200 shadow-md p-5 space-y-3.5 glossy-top-highlight">
          <h3 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-[#FF6B00] animate-pulse" />
            Topik Diskusi Terhangat
          </h3>
          <div className="space-y-2.5">
            {[
              { title: 'Aliansi Strategis Industri Smelter Sulawesi', replies: '18 Balasan' },
              { title: 'Tanya Jawab Pengurusan NIB Berbasis Risiko 2026', replies: '14 Balasan' },
              { title: 'Suku Bunga Kemitraan Pemerintah bagi Startup AgriTech', replies: '9 Balasan' }
            ].map((top, idx) => (
              <div key={idx} className="flex flex-col border-b border-slate-100 pb-2 last:border-b-0 space-y-1">
                <p className="font-black text-slate-800 hover:text-[#FF6B00] transition-colors cursor-pointer leading-tight">
                  {top.title}
                </p>
                <span className="text-[10px] text-slate-400 font-bold">{top.replies}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
