import React, { useState } from 'react';
import {
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  Send,
  PlusCircle,
  BarChart3,
  Image,
  Video,
  FileText,
  FileSpreadsheet,
  User as UserIcon,
  CheckCircle2,
  Sparkles,
  Trash2,
  Camera
} from 'lucide-react';
import { AppDatabase, User, FeedPost } from '../types';
import CreatePostModal from './CreatePostModal';

interface FeedViewProps {
  db: AppDatabase;
  currentUser: User;
  onRefresh: () => void;
}

export default function FeedView({ db, currentUser, onRefresh }: FeedViewProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [modalPresetType, setModalPresetType] = useState<'article' | 'polling' | 'document'>('article');
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState<'article' | 'polling' | 'document'>('article');
  
  // Polling inputs
  const [pollTitle, setPollTitle] = useState('');
  const [pollOptions, setPollOptions] = useState([{ text: '' }, { text: '' }]);

  // Interactive comments state
  const [activeCommentPost, setActiveCommentPost] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});
  const [activeReplyCommentId, setActiveReplyCommentId] = useState<string | null>(null);
  const [replyInputs, setReplyInputs] = useState<{ [commentId: string]: string }>({});

  const companyName = currentUser.companyId
    ? db.companies?.find(c => c.id === currentUser.companyId)?.name || 'Anggota BCI'
    : 'Anggota BCI';

  // Handle post creation
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim() && postType === 'article') return;

    let finalContent = postContent;
    let finalOptions: any = undefined;

    if (postType === 'polling') {
      if (!pollTitle.trim()) return;
      finalContent = pollTitle;
      finalOptions = pollOptions.filter(opt => opt.text.trim() !== '');
    }

    try {
      const companyName = currentUser.companyId
        ? db.companies.find(c => c.id === currentUser.companyId)?.name
        : 'Anggota BCI';

      const response = await fetch('/api/feed/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorId: currentUser.id,
          authorName: currentUser.name,
          authorRole: currentUser.role,
          authorAvatar: currentUser.avatar,
          authorCompany: companyName,
          type: postType === 'polling' ? 'polling' : 'article',
          content: finalContent,
          pollingOptions: finalOptions,
          mediaUrl: postType === 'document' ? 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' : undefined,
          documentName: postType === 'document' ? 'Dokumen_Panduan_Kemitraan_UMKM_2026.pdf' : undefined
        })
      });

      if (response.ok) {
        setPostContent('');
        setPollTitle('');
        setPollOptions([{ text: '' }, { text: '' }]);
        setPostType('article');
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to post', err);
    }
  };

  // Handle Likes / Save / Vote
  const handleInteraction = async (postId: string, action: 'like' | 'save' | 'share' | 'repost' | 'vote', optionId?: string) => {
    try {
      const response = await fetch('/api/feed/interact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          userId: currentUser.id,
          userName: currentUser.name,
          userAvatar: currentUser.avatar,
          action,
          optionId
        })
      });

      if (response.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to interact', err);
    }
  };

  // Handle Comments
  const handleCommentSubmit = async (postId: string) => {
    const commentText = commentInputs[postId];
    if (!commentText || !commentText.trim()) return;

    try {
      const response = await fetch('/api/feed/interact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          userId: currentUser.id,
          userName: currentUser.name,
          userAvatar: currentUser.avatar,
          action: 'comment',
          commentText
        })
      });

      if (response.ok) {
        setCommentInputs({ ...commentInputs, [postId]: '' });
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to comment', err);
    }
  };

  // Handle Liking a Comment
  const handleLikeComment = async (postId: string, commentId: string) => {
    try {
      const response = await fetch('/api/feed/interact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          commentId,
          userId: currentUser.id,
          userName: currentUser.name,
          userAvatar: currentUser.avatar,
          action: 'like_comment'
        })
      });

      if (response.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to like comment', err);
    }
  };

  // Handle Replying to a Comment
  const handleReplySubmit = async (postId: string, commentId: string) => {
    const replyText = replyInputs[commentId];
    if (!replyText || !replyText.trim()) return;

    try {
      const response = await fetch('/api/feed/interact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          commentId,
          userId: currentUser.id,
          userName: currentUser.name,
          userAvatar: currentUser.avatar,
          action: 'reply_comment',
          commentText: replyText
        })
      });

      if (response.ok) {
        setReplyInputs({ ...replyInputs, [commentId]: '' });
        setActiveReplyCommentId(null);
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to reply', err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-calibri">
      
      {/* Left 2 Columns: Feed Publisher and Posts */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Publisher Card */}
        <div className="glass-card rounded-3xl border border-slate-200/60 p-4 sm:p-5 shadow-md bg-white glossy-top-highlight">
          
          {/* Simplified Prompt for Mobile View */}
          <div className="flex sm:hidden items-center gap-3 cursor-pointer" onClick={() => setIsCreateModalOpen(true)}>
            <img src={currentUser.avatar} alt="Avatar" className="h-10 w-10 rounded-xl object-cover border border-slate-100 shadow-sm" />
            <div className="flex-1 bg-slate-50 border border-slate-200/60 rounded-full px-4 py-2.5 text-xs text-slate-400 font-bold flex items-center justify-between shadow-inner">
              <span>Mulai postingan bisnis baru...</span>
              <Camera className="h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Full Interactive Publisher for Desktop View */}
          <div className="hidden sm:flex flex-col sm:flex-row items-stretch sm:items-start gap-4">
            {/* User Profile Header on Mobile, Avatar on Desktop */}
            <div className="flex items-center gap-3 sm:block sm:flex-shrink-0">
              <img src={currentUser.avatar} alt="Avatar" className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl object-cover border border-slate-100 shadow-sm" />
              <div className="sm:hidden">
                <span className="text-xs font-black text-slate-800">{currentUser.name}</span>
                <p className="text-[10px] text-slate-400 font-bold">{currentUser.role}</p>
              </div>
            </div>

            <div className="flex-1 min-w-0 w-full">
              {/* Scrollable Post Type Tabs on Mobile */}
              <div className="flex gap-2 border-b border-slate-100 pb-2 mb-3 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
                <button
                  onClick={() => setPostType('article')}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer shadow-sm border ${
                    postType === 'article'
                      ? 'bg-gradient-to-r from-[#FFC107] to-[#FF6B00] text-white border-none shadow-md shadow-orange-500/15'
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Postingan Teks
                </button>
                <button
                  onClick={() => setPostType('polling')}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer shadow-sm border ${
                    postType === 'polling'
                      ? 'bg-gradient-to-r from-[#FFC107] to-[#FF6B00] text-white border-none shadow-md shadow-orange-500/15'
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Buat Polling
                </button>
                <button
                  onClick={() => setPostType('document')}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer shadow-sm border ${
                    postType === 'document'
                      ? 'bg-gradient-to-r from-[#FFC107] to-[#FF6B00] text-white border-none shadow-md shadow-orange-500/15'
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Kirim Dokumen (PDF)
                </button>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-3">
                {postType === 'article' && (
                  <textarea
                    value={postContent}
                    onChange={e => setPostContent(e.target.value)}
                    placeholder="Bagikan berita perusahaan, ide bisnis, atau peluang relasi Anda..."
                    rows={3}
                    className="w-full text-sm outline-none bg-slate-50/50 hover:bg-white rounded-2xl p-3 border border-slate-200 focus:border-[#FFC107] focus:bg-white resize-none text-slate-800 transition-all shadow-inner font-semibold"
                  />
                )}

                {postType === 'polling' && (
                  <div className="space-y-2.5 text-xs font-bold text-slate-700">
                    <input
                      type="text"
                      placeholder="Judul Polling (contoh: Sektor Bisnis Favorit?)"
                      value={pollTitle}
                      onChange={e => setPollTitle(e.target.value)}
                      className="w-full text-sm font-black rounded-2xl border border-slate-200 p-3 outline-none focus:border-[#FFC107] shadow-inner bg-slate-50/50 focus:bg-white"
                    />
                    
                    <div className="space-y-2">
                      {pollOptions.map((opt, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <input
                            type="text"
                            placeholder={`Pilihan ${i + 1}`}
                            value={opt.text}
                            onChange={e => {
                              const newOpts = [...pollOptions];
                              newOpts[i].text = e.target.value;
                              setPollOptions(newOpts);
                            }}
                            className="flex-1 text-xs font-bold rounded-xl border border-slate-200 p-2.5 outline-none focus:border-[#FFC107] shadow-inner bg-slate-50/50 focus:bg-white text-slate-800"
                          />
                          {pollOptions.length > 2 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newOpts = pollOptions.filter((_, idx) => idx !== i);
                                setPollOptions(newOpts);
                              }}
                              className="p-2.5 rounded-xl border border-rose-100 hover:border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer flex items-center justify-center flex-shrink-0"
                              title="Hapus pilihan"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setPollOptions([...pollOptions, { text: '' }])}
                      className="inline-flex items-center gap-1 text-[11px] text-[#FF6B00] font-black hover:underline cursor-pointer"
                    >
                      + Tambah Pilihan
                    </button>
                  </div>
                )}

                {postType === 'document' && (
                  <div className="rounded-2xl border border-dashed border-[#FFC107]/40 bg-[#FFFDF7] p-4 text-center text-xs">
                    <FileText className="h-8 w-8 text-[#FF6B00] mx-auto mb-2" />
                    <p className="font-black text-slate-800">Panduan_Kemitraan_UMKM_2026.pdf</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-bold">Dokumen PDF simulasi siap dilampirkan</p>
                    <textarea
                      value={postContent}
                      onChange={e => setPostContent(e.target.value)}
                      placeholder="Tulis deskripsi ringkas tentang dokumen ini..."
                      rows={2}
                      className="w-full text-xs font-semibold outline-none bg-white rounded-xl p-3 border border-slate-200 mt-3 resize-none shadow-inner"
                    />
                  </div>
                )}

                <div className="flex justify-between items-center pt-2">
                  <div className="flex gap-2 text-slate-400">
                    <Image 
                      onClick={() => { setModalPresetType('article'); setIsCreateModalOpen(true); }}
                      className="h-4.5 w-4.5 cursor-pointer hover:text-[#FF6B00] transition-colors" 
                      title="Unggah foto ke postingan"
                    />
                    <Video 
                      onClick={() => { setModalPresetType('article'); setIsCreateModalOpen(true); }}
                      className="h-4.5 w-4.5 cursor-pointer hover:text-[#FF6B00] transition-colors" 
                      title="Unggah video ke postingan"
                    />
                    <BarChart3 
                      onClick={() => { setModalPresetType('polling'); setIsCreateModalOpen(true); }}
                      className="h-4.5 w-4.5 cursor-pointer hover:text-[#FF6B00] transition-colors" 
                      title="Buat polling interaktif"
                    />
                    <FileText 
                      onClick={() => { setModalPresetType('document'); setIsCreateModalOpen(true); }}
                      className="h-4.5 w-4.5 cursor-pointer hover:text-[#FF6B00] transition-colors" 
                      title="Unggah dokumen PDF atau Excel"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-2xl bg-gradient-to-r from-[#FFC107] to-[#FF6B00] hover:brightness-110 active:scale-95 px-5 py-2.5 text-xs font-black text-white shadow-md shadow-orange-500/20 transition-all cursor-pointer"
                  >
                    Kirim Postingan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Feed Posts */}
        <div className="space-y-4">
          {db.feedPosts.map(post => {
            const hasLiked = post.likes.includes(currentUser.id);
            const hasSaved = post.isSavedBy.includes(currentUser.id);

            // Calculate total votes for polling
            const totalVotes = post.pollingOptions
              ? post.pollingOptions.reduce((acc, curr) => acc + curr.votes.length, 0)
              : 0;

            return (
              <div key={post.id} className="rounded-3xl border border-slate-200/60 bg-white/80 backdrop-blur-md p-5 shadow-md space-y-4 transition-all hover:bg-white/95 hover:shadow-lg glossy-top-highlight">
                
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={post.authorAvatar} alt="Avatar" className="h-10 w-10 rounded-xl object-cover border border-slate-100 shadow-sm" />
                    <div>
                      <h4 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                        {post.authorName}
                        {post.authorCompany && (
                          <span className="text-[10px] font-black text-[#FF6B00] bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-100/35">
                            Verified
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-400 font-bold">
                        {post.authorRole} {post.authorCompany ? `di ${post.authorCompany}` : ''}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold bg-slate-50 px-2 py-1 rounded-lg">
                    {new Date(post.timestamp).toLocaleDateString('id-ID')}
                  </span>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed font-semibold">{post.content}</p>

                  {/* Polling render */}
                  {post.type === 'polling' && post.pollingOptions && (
                    <div className="space-y-2 rounded-2xl bg-[#FFFDF7] border border-[#FFD54F]/25 p-4 shadow-inner">
                      {post.pollingOptions.map(opt => {
                        const votedFor = opt.votes.includes(currentUser.id);
                        const percentage = totalVotes > 0 ? Math.round((opt.votes.length / totalVotes) * 100) : 0;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => handleInteraction(post.id, 'vote', opt.id)}
                            className={`relative w-full text-left p-3 rounded-xl border text-xs font-black overflow-hidden transition-all flex justify-between items-center cursor-pointer ${
                              votedFor ? 'border-[#FFC107] bg-orange-50/30 text-[#FF6B00]' : 'border-slate-200 hover:bg-slate-50 bg-white text-slate-800'
                            }`}
                          >
                            <div className="absolute inset-y-0 left-0 bg-amber-100/30 transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                            <span className="relative z-10 flex items-center gap-1.5 font-bold">
                              {votedFor && <CheckCircle2 className="h-4 w-4 text-[#FF6B00]" />}
                              {opt.text}
                            </span>
                            <span className="relative z-10 text-[10px] font-black text-slate-500">
                              {percentage}% ({opt.votes.length} suara)
                            </span>
                          </button>
                        );
                      })}
                      <p className="text-[10px] text-slate-400 font-black text-right mt-1">Total: {totalVotes} Responden</p>
                    </div>
                  )}

                  {/* Photo attachment render */}
                  {(post.type === 'photo' || (post.mediaUrl && !post.documentName && !post.mediaUrl.startsWith('data:video/'))) && post.mediaUrl && (
                    <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm max-h-96 bg-slate-50 flex items-center justify-center">
                      <img
                        src={post.mediaUrl}
                        alt="media attachment"
                        className="w-full object-cover max-h-96"
                      />
                    </div>
                  )}

                  {/* Video attachment render */}
                  {(post.type === 'video' || (post.mediaUrl && post.mediaUrl.startsWith('data:video/'))) && post.mediaUrl && (
                    <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm max-h-96 bg-slate-950 flex items-center justify-center">
                      <video
                        src={post.mediaUrl}
                        controls
                        className="w-full max-h-96 object-contain"
                      />
                    </div>
                  )}

                  {/* File/Document render */}
                  {post.mediaUrl && post.documentName && (
                    <div className={`flex items-center justify-between p-3.5 rounded-2xl border shadow-sm ${
                      post.documentName.toLowerCase().endsWith('.xlsx') || 
                      post.documentName.toLowerCase().endsWith('.xls') || 
                      post.documentName.toLowerCase().endsWith('.csv')
                        ? 'bg-emerald-50/40 border-emerald-200/60'
                        : 'bg-[#FFFDF7] border-[#FFC107]/40'
                    }`}>
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {post.documentName.toLowerCase().endsWith('.xlsx') || 
                        post.documentName.toLowerCase().endsWith('.xls') || 
                        post.documentName.toLowerCase().endsWith('.csv') ? (
                          <FileSpreadsheet className="h-6 w-6 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <FileText className="h-6 w-6 text-rose-500 flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-black text-slate-800 truncate">{post.documentName}</p>
                          <p className="text-[9px] text-slate-400 font-bold">
                            {post.documentName.toLowerCase().endsWith('.xlsx') || 
                            post.documentName.toLowerCase().endsWith('.xls') || 
                            post.documentName.toLowerCase().endsWith('.csv') 
                              ? 'Berkas Spreadsheets / Excel • 45 KB' 
                              : 'PDF Document • 1.2 MB'}
                          </p>
                        </div>
                      </div>
                      <a
                        href={post.mediaUrl}
                        download={post.documentName}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`rounded-xl text-white px-3.5 py-2 text-[10px] font-black shadow-sm transition-all hover:scale-102 flex-shrink-0 flex items-center gap-1 ${
                          post.documentName.toLowerCase().endsWith('.xlsx') || 
                          post.documentName.toLowerCase().endsWith('.xls') || 
                          post.documentName.toLowerCase().endsWith('.csv')
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-emerald-500/10'
                            : 'bg-gradient-to-r from-[#FFC107] to-[#FF6B00] shadow-orange-500/10'
                        }`}
                      >
                        {post.documentName.toLowerCase().endsWith('.xlsx') || 
                        post.documentName.toLowerCase().endsWith('.xls') || 
                        post.documentName.toLowerCase().endsWith('.csv') ? 'Unduh Excel' : 'Buka PDF'}
                      </a>
                    </div>
                  )}
                </div>

                {/* Interactions buttons bar */}
                <div className="flex items-center justify-between border-t border-b border-slate-100 py-2.5 text-slate-500 text-xs font-bold">
                  <button
                    onClick={() => handleInteraction(post.id, 'like')}
                    className={`flex items-center gap-1.5 hover:text-red-500 cursor-pointer transition-colors ${hasLiked ? 'text-red-500 font-black' : ''}`}
                  >
                    <Heart className={`h-4 w-4 transition-transform active:scale-125 ${hasLiked ? 'fill-red-500 text-red-500' : ''}`} />
                    <span>{post.likes.length} Suka</span>
                  </button>

                  <button
                    onClick={() => {
                      const inputElement = document.getElementById(`comment-input-${post.id}`);
                      if (inputElement) {
                        inputElement.focus();
                      }
                    }}
                    className="flex items-center gap-1.5 hover:text-[#FF6B00] cursor-pointer transition-colors"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>{post.comments.length} Komentar</span>
                  </button>

                  <button
                    onClick={() => handleInteraction(post.id, 'repost')}
                    className="flex items-center gap-1.5 hover:text-emerald-500 cursor-pointer transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>{post.repostsCount} Repost</span>
                  </button>

                  <button
                    onClick={() => handleInteraction(post.id, 'save')}
                    className={`flex items-center gap-1.5 hover:text-[#FF6B00] cursor-pointer transition-colors ${hasSaved ? 'text-[#FF6B00] font-black' : ''}`}
                  >
                    <Bookmark className={`h-4 w-4 transition-transform active:scale-125 ${hasSaved ? 'fill-[#FF6B00] text-[#FF6B00]' : ''}`} />
                    <span>{hasSaved ? 'Tersimpan' : 'Simpan'}</span>
                  </button>
                </div>

                {/* Comments box */}
                <div className="space-y-3 pt-2">
                  
                  {/* Add Comment input */}
                  <div className="flex gap-2">
                    <input
                      id={`comment-input-${post.id}`}
                      type="text"
                      placeholder="Tulis tanggapan Anda..."
                      value={commentInputs[post.id] || ''}
                      onChange={e => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                      className="flex-1 text-xs rounded-2xl border border-slate-200 bg-slate-50/50 p-2.5 outline-none focus:bg-white focus:border-[#FFC107] transition-all text-slate-800 font-bold shadow-inner"
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          handleCommentSubmit(post.id);
                        }
                      }}
                    />
                    <button
                      onClick={() => handleCommentSubmit(post.id)}
                      className="rounded-2xl bg-[#FF6B00] text-white px-4 hover:bg-orange-700 transition-all cursor-pointer flex items-center justify-center font-black text-xs gap-1"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Kirim</span>
                    </button>
                  </div>

                    {/* Comments List */}
                    {post.comments.length > 0 && (
                      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                        {post.comments.map(c => {
                          const commentLikes = c.likes || [];
                          const commentReplies = c.replies || [];
                          const hasLikedComment = commentLikes.includes(currentUser.id);
                          const isReplying = activeReplyCommentId === c.id;

                          return (
                            <div key={c.id} className="space-y-2">
                              {/* Parent Comment */}
                              <div className="flex gap-2.5 bg-[#FFFDF7] border border-[#FFD54F]/25 p-3 rounded-2xl text-xs shadow-sm">
                                <img src={c.authorAvatar} alt="avatar" className="h-7 w-7 rounded-lg object-cover flex-shrink-0 border border-slate-100" />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <p className="font-black text-slate-900">{c.authorName}</p>
                                    <span className="text-[9px] text-slate-400 font-bold">
                                      {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  <p className="text-slate-600 mt-0.5 font-semibold leading-relaxed">{c.content}</p>
                                  
                                  {/* Comment Actions */}
                                  <div className="flex items-center gap-4 mt-2 text-[10px] font-bold text-slate-400">
                                    <button
                                      onClick={() => handleLikeComment(post.id, c.id)}
                                      className={`flex items-center gap-1 hover:text-red-500 cursor-pointer transition-colors ${hasLikedComment ? 'text-red-500 font-black' : ''}`}
                                    >
                                      <Heart className={`h-3 w-3 ${hasLikedComment ? 'fill-red-500 text-red-500' : ''}`} />
                                      <span>{commentLikes.length} Suka</span>
                                    </button>
                                    
                                    <button
                                      onClick={() => setActiveReplyCommentId(isReplying ? null : c.id)}
                                      className={`flex items-center gap-1 hover:text-[#FF6B00] cursor-pointer transition-colors ${isReplying ? 'text-[#FF6B00] font-black' : ''}`}
                                    >
                                      <MessageSquare className="h-3 w-3" />
                                      <span>Balas ({commentReplies.length})</span>
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Nested Replies */}
                              {commentReplies.length > 0 && (
                                <div className="pl-6 space-y-2 border-l-2 border-dashed border-amber-100/60 ml-3.5">
                                  {commentReplies.map(reply => (
                                    <div key={reply.id} className="flex gap-2 bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-[11px] shadow-sm">
                                      <img src={reply.authorAvatar} alt="avatar" className="h-5.5 w-5.5 rounded-md object-cover flex-shrink-0 border border-slate-100" />
                                      <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                          <p className="font-black text-slate-900">{reply.authorName}</p>
                                          <span className="text-[8px] text-slate-400 font-semibold">
                                            {new Date(reply.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                          </span>
                                        </div>
                                        <p className="text-slate-600 mt-0.5 font-medium leading-relaxed">{reply.content}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Reply Input Box */}
                              {isReplying && (
                                <div className="pl-6 ml-3.5 flex gap-2">
                                  <input
                                    type="text"
                                    placeholder={`Balas komentar ${c.authorName}...`}
                                    value={replyInputs[c.id] || ''}
                                    onChange={e => setReplyInputs({ ...replyInputs, [c.id]: e.target.value })}
                                    className="flex-1 text-[11px] rounded-xl border border-slate-200 bg-slate-50/50 p-2 outline-none focus:bg-white focus:border-[#FFC107] transition-all text-slate-800 font-semibold shadow-inner"
                                    onKeyDown={e => {
                                      if (e.key === 'Enter') {
                                        handleReplySubmit(post.id, c.id);
                                      }
                                    }}
                                  />
                                  <button
                                    onClick={() => handleReplySubmit(post.id, c.id)}
                                    className="rounded-xl bg-[#FF6B00] text-white px-3 hover:bg-orange-700 transition-all cursor-pointer flex items-center justify-center text-[10px] font-black"
                                  >
                                    Kirim
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* Right Column: Trending Topics and Recommendations */}
      <div className="space-y-6 text-xs">
        
        {/* Trending Tags */}
        <div className="glass-card rounded-3xl border border-slate-200/60 p-5 shadow-md bg-white glossy-top-highlight">
          <h3 className="font-black text-slate-900 text-sm mb-3 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-[#FF6B00] animate-pulse" />
            Topik Tren Bisnis Indonesia
          </h3>
          <div className="space-y-2.5">
            {[
              { tag: '#TKDN2026', count: '1.2k Postingan', desc: 'Regulasi baru insentif pemerintah' },
              { tag: '#ESGFunding', count: '940 Postingan', desc: 'Syarat mutlak investasi startup' },
              { tag: '#SinergiIKN', count: '850 Postingan', desc: 'Pengadaan infrastruktur pusat data' },
              { tag: '#UMKMGoGlobal', count: '720 Postingan', desc: 'Hilirisasi ekspor komoditas lokal' },
              { tag: '#AIEnergi', count: '450 Postingan', desc: 'Otomatisasi conveyor & hidrolik' }
            ].map((t, i) => (
              <div key={i} className="flex flex-col border-b border-slate-100 pb-2 last:border-b-0">
                <span className="font-black text-xs text-[#FF6B00]">{t.tag}</span>
                <span className="text-[10px] text-slate-400 font-bold">{t.desc} • {t.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations connections */}
        <div className="glass-card rounded-3xl border border-slate-200/60 p-5 shadow-md bg-white glossy-top-highlight">
          <h3 className="font-black text-slate-900 text-sm mb-3">Rekomendasi Relasi Baru</h3>
          <div className="space-y-3">
            {db.companies.map(comp => (
              <div key={comp.id} className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <img src={comp.logo} alt="Logo" className="h-8 w-8 rounded-lg object-cover border border-slate-100" />
                  <div>
                    <p className="font-black text-slate-900 line-clamp-1">{comp.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{comp.sector}</p>
                  </div>
                </div>
                <button className="text-[10px] font-black text-[#FF6B00] hover:bg-orange-50 border border-transparent hover:border-orange-100 px-2 py-1 rounded-lg transition-all cursor-pointer">
                  Hubungkan
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Create Post Modal and FAB for mobile */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        currentUser={currentUser}
        companyName={companyName}
        onPostSuccess={onRefresh}
        initialType={modalPresetType}
      />

      {/* Floating Action Button (FAB) for Mobile View */}
      <div className="fixed bottom-6 right-6 z-40 sm:hidden">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center h-14 w-14 bg-gradient-to-r from-[#FFC107] to-[#FF6B00] hover:brightness-110 active:scale-95 text-white shadow-lg shadow-orange-500/25 rounded-2xl transition-all cursor-pointer"
          title="Buat Postingan Baru"
        >
          <PlusCircle className="h-6 w-6" />
        </button>
      </div>

    </div>
  );
}
