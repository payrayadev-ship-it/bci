import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Camera,
  Image as ImageIcon,
  Upload,
  BarChart3,
  FileText,
  FileSpreadsheet,
  Trash2,
  AlertCircle,
  RotateCcw,
  Globe,
  Plus,
  Send,
  Zap,
  Check,
  Video
} from 'lucide-react';
import { User } from '../types';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  companyName: string;
  onPostSuccess: () => void;
  initialType?: 'article' | 'polling' | 'document';
}

export default function CreatePostModal({
  isOpen,
  onClose,
  currentUser,
  companyName,
  onPostSuccess,
  initialType = 'article'
}: CreatePostModalProps) {
  const [postType, setPostType] = useState<'article' | 'polling' | 'document'>(initialType);
  const [postContent, setPostContent] = useState('');

  // Sync initialType when modal opens
  useEffect(() => {
    if (isOpen) {
      setPostType(initialType);
    }
  }, [isOpen, initialType]);
  
  // Polling inputs
  const [pollTitle, setPollTitle] = useState('');
  const [pollOptions, setPollOptions] = useState([{ text: '' }, { text: '' }]);
  
  // File attachments state (Photo, Video, Document)
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    type: 'photo' | 'video' | 'pdf' | 'excel';
    dataUrl: string;
    size?: string;
  } | null>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  // File upload triggers
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const cameraFallbackInputRef = useRef<HTMLInputElement>(null);
  
  // Video & Stream refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera stream on unmount or when camera inactive
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    setIsCameraActive(true);
    setAttachedFile(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Fitur kamera tidak didukung di browser ini. Menggunakan input file kamera.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn('Camera stream failed, falling back to input:', err);
      setCameraError(err.message || 'Gagal mengakses kamera langsung. Silakan gunakan kamera bawaan perangkat.');
      
      // Stop state camera active if native stream isn't supported, let user use fallback input
      setIsCameraActive(false);
      if (cameraFallbackInputRef.current) {
        cameraFallbackInputRef.current.click();
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      try {
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setAttachedFile({
            name: `Foto_Kamera_${Date.now()}.jpg`,
            type: 'photo',
            dataUrl,
            size: 'Diambil langsung'
          });
          stopCamera();
        }
      } catch (err) {
        console.error('Failed to capture photo:', err);
        setCameraError('Gagal memproses gambar kamera.');
      }
    }
  };

  const processUploadedFile = (file: File, isCameraCapture = false) => {
    const sizeInKb = Math.round(file.size / 1024);
    const sizeStr = sizeInKb > 1024 
      ? `${(sizeInKb / 1024).toFixed(1)} MB` 
      : `${sizeInKb} KB`;

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const fileType = file.type;
      
      let type: 'photo' | 'video' | 'pdf' | 'excel' = 'photo';
      
      if (fileType.startsWith('image/')) {
        type = 'photo';
        setPostType('article');
      } else if (fileType.startsWith('video/')) {
        type = 'video';
        setPostType('article');
      } else if (fileType === 'application/pdf' || file.name.endsWith('.pdf')) {
        type = 'pdf';
        setPostType('document');
      } else if (
        fileType.includes('spreadsheet') || 
        fileType.includes('excel') || 
        fileType.includes('csv') ||
        file.name.endsWith('.xlsx') || 
        file.name.endsWith('.xls') || 
        file.name.endsWith('.csv')
      ) {
        type = 'excel';
        setPostType('document');
      }

      setAttachedFile({
        name: file.name,
        type,
        dataUrl,
        size: sizeStr
      });
      
      if (isCameraCapture) {
        setIsCameraActive(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isCameraCapture = false) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file, isCameraCapture);
    }
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const triggerVideoSelect = () => {
    if (videoInputRef.current) {
      videoInputRef.current.click();
    }
  };

  const triggerDocSelect = () => {
    if (docInputRef.current) {
      docInputRef.current.click();
    }
  };

  const triggerCameraFallback = () => {
    if (cameraFallbackInputRef.current) {
      cameraFallbackInputRef.current.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (postType === 'article' && !postContent.trim() && !attachedFile) return;
    if (postType === 'polling' && (!pollTitle.trim() || pollOptions.filter(o => o.text.trim() !== '').length < 2)) return;

    let finalContent = postContent;
    let finalOptions: any = undefined;

    if (postType === 'polling') {
      finalContent = pollTitle;
      finalOptions = pollOptions.filter(opt => opt.text.trim() !== '');
    }

    try {
      let determinedType: 'article' | 'polling' | 'document' | 'photo' | 'video' = 'article';
      if (postType === 'polling') {
        determinedType = 'polling';
      } else if (postType === 'document') {
        determinedType = 'document';
      } else if (attachedFile) {
        determinedType = attachedFile.type === 'video' ? 'video' : 'photo';
      }

      const payload = {
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorRole: currentUser.role,
        authorAvatar: currentUser.avatar,
        authorCompany: companyName,
        type: determinedType,
        content: finalContent,
        pollingOptions: finalOptions,
        mediaUrl: attachedFile?.dataUrl || (postType === 'document' ? 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' : undefined),
        documentName: postType === 'document' 
          ? (attachedFile ? attachedFile.name : 'Dokumen_Panduan_Kemitraan_UMKM_2026.pdf') 
          : undefined
      };

      const response = await fetch('/api/feed/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        // Reset states
        setPostContent('');
        setPollTitle('');
        setPollOptions([{ text: '' }, { text: '' }]);
        setAttachedFile(null);
        setPostType('article');
        stopCamera();
        
        onPostSuccess();
        onClose();
      }
    } catch (err) {
      console.error('Failed to publish post from modal:', err);
    }
  };

  // MD3-style Colors & Designs
  // M3 Light Tonal Palette: Surface #F7F2FA, Primary #6750A4, Secondary #625B71
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Card / Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative w-full max-w-lg bg-[#FAF8FF] sm:rounded-[32px] rounded-t-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[85vh] border border-slate-100 z-10 font-calibri"
          >
            
            {/* MD3 Indicator Bar for Bottom Sheet on Mobile */}
            <div className="flex justify-center py-2 sm:hidden flex-shrink-0">
              <div className="w-10 h-1.5 rounded-full bg-slate-300" />
            </div>

            {/* Header */}
            <header className="px-5 py-4 flex items-center justify-between border-b border-slate-200/50 bg-[#FAF8FF] flex-shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    onClose();
                  }}
                  className="p-2 -ml-2 rounded-full hover:bg-slate-200/60 transition-colors cursor-pointer text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
                <h2 className="text-base font-black text-slate-800 tracking-tight">Buat Postingan Baru</h2>
              </div>
              
              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#FFC107] to-[#FF6B00] hover:brightness-110 active:scale-95 text-white px-5 py-2.5 rounded-full text-xs font-black shadow-md shadow-orange-500/15 transition-all cursor-pointer"
              >
                <span>Bagikan</span>
                <Send className="h-3.5 w-3.5" />
              </button>
            </header>

            {/* Content Container (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              
              {/* Profile Bar */}
              <div className="flex items-center gap-3">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-10 w-10 rounded-full object-cover border-2 border-[#FFC107] shadow-sm"
                />
                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-800 leading-tight flex items-center gap-1">
                    {currentUser.name}
                    <Zap className="h-3 w-3 text-amber-500 fill-amber-400" />
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">{currentUser.role} • {companyName}</p>
                </div>
              </div>

              {/* MD3 Tonal Segmented Control for Post Types */}
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-[#E8E1F2]/60 border border-slate-200/20">
                <button
                  type="button"
                  onClick={() => {
                    setPostType('article');
                    stopCamera();
                  }}
                  className={`py-2 rounded-xl text-[11px] font-black tracking-tight transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    postType === 'article'
                      ? 'bg-white text-[#FF6B00] shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  <ImageIcon className="h-4 w-4" />
                  <span>Teks/Foto</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPostType('polling');
                    stopCamera();
                  }}
                  className={`py-2 rounded-xl text-[11px] font-black tracking-tight transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    postType === 'polling'
                      ? 'bg-white text-[#FF6B00] shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Polling</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPostType('document');
                    stopCamera();
                  }}
                  className={`py-2 rounded-xl text-[11px] font-black tracking-tight transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    postType === 'document'
                      ? 'bg-white text-[#FF6B00] shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  <span>Dokumen</span>
                </button>
              </div>

              {/* Dynamic Post Type Content */}
              <div className="space-y-4">
                {postType === 'article' && (
                  <div className="space-y-3">
                    <textarea
                      value={postContent}
                      onChange={e => setPostContent(e.target.value)}
                      placeholder="Apa yang sedang terjadi di bisnis Anda hari ini? Bagikan kolaborasi atau info UMKM terbaru..."
                      rows={4}
                      className="w-full text-sm font-semibold text-slate-700 placeholder-slate-400 bg-transparent border-none outline-none resize-none focus:ring-0"
                    />

                    {!attachedFile && !isCameraActive && (
                      <div className="grid grid-cols-2 gap-3.5 pt-2">
                        <button
                          type="button"
                          onClick={triggerFileSelect}
                          className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-[#FFC107]/30 bg-[#FFFDF7]/60 hover:bg-amber-50/40 text-slate-600 hover:text-[#FF6B00] border-spacing-4 transition-all cursor-pointer group"
                        >
                          <ImageIcon className="h-8 w-8 mb-2 text-slate-400 group-hover:text-[#FF6B00] group-hover:scale-110 transition-all" />
                          <span className="text-xs font-black">Unggah Foto / Gambar</span>
                          <span className="text-[10px] text-slate-400 font-bold mt-0.5">PNG, JPG, GIF</span>
                        </button>
                        <button
                          type="button"
                          onClick={triggerVideoSelect}
                          className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-[#FFC107]/30 bg-[#FFFDF7]/60 hover:bg-amber-50/40 text-slate-600 hover:text-[#FF6B00] border-spacing-4 transition-all cursor-pointer group"
                        >
                          <Video className="h-8 w-8 mb-2 text-slate-400 group-hover:text-[#FF6B00] group-hover:scale-110 transition-all" />
                          <span className="text-xs font-black">Unggah Video</span>
                          <span className="text-[10px] text-slate-400 font-bold mt-0.5">MP4, MOV, WebM</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {postType === 'polling' && (
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Pertanyaan Polling Anda..."
                        value={pollTitle}
                        onChange={e => setPollTitle(e.target.value)}
                        className="w-full text-sm font-black text-slate-800 placeholder-slate-400 bg-white border border-slate-200 rounded-2xl p-3.5 outline-none focus:border-[#FFC107] focus:ring-1 focus:ring-[#FFC107] shadow-sm"
                      />
                    </div>

                    <div className="space-y-2.5">
                      {pollOptions.map((opt, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <span className="text-[10px] font-black text-slate-400 w-5 text-right">{i + 1}.</span>
                          <input
                            type="text"
                            placeholder={`Pilihan jawaban ${i + 1}`}
                            value={opt.text}
                            onChange={e => {
                              const newOpts = [...pollOptions];
                              newOpts[i].text = e.target.value;
                              setPollOptions(newOpts);
                            }}
                            className="flex-1 text-xs font-semibold rounded-xl border border-slate-200 bg-white p-3 outline-none focus:border-[#FF6B00] shadow-sm text-slate-800"
                          />
                          {pollOptions.length > 2 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newOpts = pollOptions.filter((_, idx) => idx !== i);
                                setPollOptions(newOpts);
                              }}
                              className="p-3 rounded-xl border border-rose-100 bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer flex-shrink-0"
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
                      className="inline-flex items-center gap-1.5 text-xs text-[#FF6B00] font-black hover:underline cursor-pointer pl-7 pt-1"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Tambah pilihan jawaban</span>
                    </button>
                  </div>
                )}

                {postType === 'document' && (
                  <div className="space-y-3">
                    <div 
                      onClick={triggerDocSelect}
                      className="rounded-2xl border-2 border-dashed border-[#FFC107]/40 bg-[#FFFDF7] p-5 text-center text-xs shadow-sm cursor-pointer hover:bg-amber-50/20 transition-colors"
                    >
                      {attachedFile && (attachedFile.type === 'pdf' || attachedFile.type === 'excel') ? (
                        <div className="space-y-1">
                          {attachedFile.type === 'excel' ? (
                            <FileSpreadsheet className="h-10 w-10 text-emerald-600 mx-auto mb-2.5 animate-bounce" />
                          ) : (
                            <FileText className="h-10 w-10 text-rose-500 mx-auto mb-2.5 animate-bounce" />
                          )}
                          <p className="font-black text-slate-800">{attachedFile.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{attachedFile.size} • Siap diunggah</p>
                          <span className="inline-block mt-2 text-[9px] text-[#FF6B00] underline font-bold">Ganti berkas</span>
                        </div>
                      ) : (
                        <div>
                          <Upload className="h-10 w-10 text-slate-400 mx-auto mb-2.5" />
                          <p className="font-black text-slate-700">Pilih berkas PDF atau Excel Anda</p>
                          <p className="text-[10px] text-slate-400 mt-1 font-bold">Mendukung format .pdf, .xls, .xlsx, .csv</p>
                        </div>
                      )}
                    </div>
                    <textarea
                      value={postContent}
                      onChange={e => setPostContent(e.target.value)}
                      placeholder="Tambahkan penjelasan singkat tentang berkas/dokumen ini..."
                      rows={2}
                      className="w-full text-xs font-semibold outline-none bg-white rounded-xl p-3 border border-slate-200 resize-none shadow-sm"
                    />
                  </div>
                )}
              </div>

              {/* Live Camera Interface inside the modal */}
              <AnimatePresence>
                {isCameraActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative rounded-2xl overflow-hidden bg-black aspect-video flex flex-col justify-between border-2 border-[#FFC107]/40 shadow-lg"
                  >
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover absolute inset-0"
                    />

                    {/* Camera Guides overlay */}
                    <div className="absolute inset-4 border border-white/20 rounded-xl pointer-events-none flex items-center justify-center">
                      <div className="w-10 h-10 border-t border-l border-white/60 absolute top-0 left-0" />
                      <div className="w-10 h-10 border-t border-r border-white/60 absolute top-0 right-0" />
                      <div className="w-10 h-10 border-b border-l border-white/60 absolute bottom-0 left-0" />
                      <div className="w-10 h-10 border-b border-r border-white/60 absolute bottom-0 right-0" />
                    </div>

                    {/* Header bar controls */}
                    <div className="relative z-10 p-3 bg-gradient-to-b from-black/60 to-transparent flex justify-between items-center text-white">
                      <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                        Live Camera
                      </span>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="p-1 rounded-full bg-white/20 hover:bg-white/40 cursor-pointer text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Bottom capture controls */}
                    <div className="relative z-10 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-center gap-3">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="bg-white hover:bg-white/90 active:scale-95 text-slate-900 rounded-full py-2.5 px-6 text-xs font-black shadow-md cursor-pointer flex items-center gap-1.5"
                      >
                        <Camera className="h-4 w-4 text-[#FF6B00]" />
                        Ambil Foto
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Camera access error */}
              {cameraError && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex gap-2.5 items-start text-xs text-amber-800">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 text-amber-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-black leading-tight">Gagal Membuka Kamera</p>
                    <p className="text-[10px] text-amber-700/80 mt-0.5 font-medium leading-relaxed">{cameraError}</p>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="mt-1.5 text-[10px] text-[#FF6B00] font-black underline hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="h-3 w-3" /> Coba Lagi
                    </button>
                  </div>
                </div>
              )}

              {/* Photo Preview Area with delete button */}
              {attachedFile && attachedFile.type === 'photo' && (
                <div className="relative rounded-2xl overflow-hidden shadow-md max-h-60 bg-slate-100 flex items-center justify-center group border border-slate-200">
                  <img
                    src={attachedFile.dataUrl}
                    alt="attachment"
                    className="w-full object-cover max-h-60"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={triggerFileSelect}
                      className="p-2.5 bg-white rounded-full hover:scale-110 transition-transform text-slate-800 cursor-pointer shadow-md"
                      title="Ganti foto"
                    >
                      <Upload className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setAttachedFile(null)}
                      className="p-2.5 bg-red-500 rounded-full hover:scale-110 transition-transform text-white cursor-pointer shadow-md"
                      title="Hapus foto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Video Preview Area with delete button */}
              {attachedFile && attachedFile.type === 'video' && (
                <div className="relative rounded-2xl overflow-hidden shadow-md max-h-60 bg-slate-950 flex flex-col items-center justify-center border border-slate-200 p-3">
                  <video
                    src={attachedFile.dataUrl}
                    controls
                    className="w-full rounded-xl max-h-40 object-contain"
                  />
                  <div className="flex justify-between items-center w-full mt-2 bg-slate-900/60 p-2 rounded-xl text-white text-[10px]">
                    <span className="font-black truncate max-w-[70%]">{attachedFile.name} ({attachedFile.size})</span>
                    <button
                      type="button"
                      onClick={() => setAttachedFile(null)}
                      className="text-rose-400 hover:text-rose-500 font-black cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" /> Hapus
                    </button>
                  </div>
                </div>
              )}

              {/* Hidden file input elements */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleFileChange}
              />

              <input
                ref={docInputRef}
                type="file"
                accept=".pdf,.xlsx,.xls,.csv,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="hidden"
                onChange={handleFileChange}
              />

              <input
                ref={cameraFallbackInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => handleFileChange(e, true)}
              />

            </div>

            {/* Bottom Actions toolbar (M3 style) */}
            <footer className="bg-[#FAF8FF] px-5 py-3 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
              <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                <Globe className="h-3.5 w-3.5" />
                <span>Publik (Semua Anggota)</span>
              </span>

              {/* MD3 Action Bar */}
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={startCamera}
                  disabled={isCameraActive}
                  className={`p-2.5 rounded-full transition-all flex items-center justify-center cursor-pointer ${
                    isCameraActive
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-white hover:bg-amber-50 text-slate-700 hover:text-[#FF6B00] border border-slate-200 shadow-sm'
                  }`}
                  title="Ambil foto dari kamera"
                >
                  <Camera className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={triggerFileSelect}
                  className="p-2.5 rounded-full bg-white hover:bg-amber-50 text-slate-700 hover:text-[#FF6B00] border border-slate-200 shadow-sm flex items-center justify-center cursor-pointer"
                  title="Unggah foto"
                >
                  <ImageIcon className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={triggerVideoSelect}
                  className="p-2.5 rounded-full bg-white hover:bg-amber-50 text-slate-700 hover:text-[#FF6B00] border border-slate-200 shadow-sm flex items-center justify-center cursor-pointer"
                  title="Unggah video"
                >
                  <Video className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={triggerDocSelect}
                  className="p-2.5 rounded-full bg-white hover:bg-amber-50 text-slate-700 hover:text-[#FF6B00] border border-slate-200 shadow-sm flex items-center justify-center cursor-pointer"
                  title="Unggah PDF / Excel"
                >
                  <FileText className="h-4 w-4" />
                </button>
              </div>
            </footer>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
