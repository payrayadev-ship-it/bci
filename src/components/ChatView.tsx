import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Send,
  Plus,
  Video,
  Phone,
  Image as ImageIcon,
  Paperclip,
  Smile,
  Mic,
  Monitor,
  CheckCheck,
  Check,
  FileText,
  Search,
  Sparkles,
  Trash2,
  ChevronLeft,
  MoreVertical,
  MapPin,
  Play,
  Pause,
  X,
  CornerUpLeft,
  Download,
  Sun,
  Moon,
  Camera,
  Upload,
  Info,
  HelpCircle,
  PhoneCall,
  Volume2,
  Pin,
  Star,
  Copy,
  Share2,
  Trash,
  Settings,
  Lock,
  MessageSquare,
  VolumeX,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { AppDatabase, ChatMessage, User } from '../types';

// Import modular sub-components
import ChatSettingsModal from './chat/ChatSettingsModal';
import ChatLongPressMenu from './chat/ChatLongPressMenu';
import ChatVoiceRecorder from './chat/ChatVoiceRecorder';
import ChatForwardModal from './chat/ChatForwardModal';
import DocumentGeneratorModal from './DocumentGeneratorModal';
import { B2BDocumentData, exportToPDF } from '../utils/pdfExport';

interface ChatViewProps {
  db: AppDatabase;
  currentUser: User;
  onRefresh: () => void;
  prefilledPartnerId: string | null;
  prefilledMessage: string | null;
  onClearPrefilledChat: () => void;
  onViewChange?: (view: string) => void;
}

interface EnrichedMessage extends ChatMessage {
  replyTo?: {
    senderName: string;
    message: string;
  };
  location?: {
    address: string;
    mapUrl: string;
  };
  voiceNote?: {
    duration: string;
    waveData: number[];
    playbackSpeed?: number;
  };
  status?: 'sent' | 'delivered' | 'read';
  isPinned?: boolean;
  isStarred?: boolean;
  isDeleted?: boolean;
  isEdited?: boolean;
  reactions?: { emoji: string; count: number }[];
}

export default function ChatView({
  db,
  currentUser,
  onRefresh,
  prefilledPartnerId,
  prefilledMessage,
  onClearPrefilledChat,
  onViewChange
}: ChatViewProps) {
  
  // Active Chat states
  const [activeChatId, setActiveChatId] = useState<string>('usr_2_comp_maju');
  const [mobileActive, setMobileActive] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  
  // History loading
  const [historyLoadedCount, setHistoryLoadedCount] = useState<number>(0);
  const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(false);

  // Messages management state (local state is enriched to allow real-time client side actions: edits, stars, deletes)
  const [messages, setMessages] = useState<EnrichedMessage[]>([]);

  // Input fields
  const [typedMessage, setTypedMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<EnrichedMessage | null>(null);

  // Active Calls
  const [activeCallType, setActiveCallType] = useState<'voice' | 'video' | 'screen' | null>(null);
  const [callTimer, setCallTimer] = useState(0);

  // Custom Attachments before sending
  const [attachedFile, setAttachedFile] = useState<{ name: string; type: ChatMessage['file']['type']; url: string } | null>(null);
  const [attachedLocation, setAttachedLocation] = useState<{ address: string; mapUrl: string } | null>(null);
  const [attachedVoice, setAttachedVoice] = useState<{ duration: string; waveData: number[] } | null>(null);

  // Progress Indicators
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Popups toggles
  const [showMenuPopup, setShowMenuPopup] = useState<boolean>(false);
  const [showAttachMenu, setShowAttachMenu] = useState<boolean>(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [typingPartner, setTypingPartner] = useState<boolean>(false);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);

  // Starred messages filter
  const [showStarredOnly, setShowStarredOnly] = useState<boolean>(false);

  // Search Engine
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchFilterType, setSearchFilterType] = useState<'all' | 'text' | 'image' | 'video' | 'pdf' | 'link'>('all');

  // Swipe gesture trackers
  const [swipeOffset, setSwipeOffset] = useState<{ [id: string]: number }>({});
  const swipeStartX = useRef<number>(0);
  const swipeActiveId = useRef<string | null>(null);

  // Multi select Engine
  const [isMultiSelectMode, setIsMultiSelectMode] = useState<boolean>(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);

  // Long press modal states
  const [showLongPressModal, setShowLongPressModal] = useState<boolean>(false);
  const [selectedMessageForMenu, setSelectedMessageForMenu] = useState<EnrichedMessage | null>(null);

  // B2B Document Maker Modal State
  const [isDocModalOpen, setIsDocModalOpen] = useState<boolean>(false);

  const handleSendDocToChat = (pdfName: string, pdfDataUrl: string, docData: B2BDocumentData) => {
    const subtotal = docData.items.reduce((acc, curr) => acc + (curr.qty * curr.unitPrice), 0);
    const totalVal = subtotal * (docData.includePPN ? 1.11 : 1);
    const newMsg: EnrichedMessage = {
      id: `msg_doc_${Date.now()}`,
      chatId: activeChatId,
      senderId: currentUser.id || 'usr_me',
      senderName: currentUser.name || 'Saya',
      senderAvatar: currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
      message: `📄 *${docData.docType.toUpperCase()} Terbit*: Dokumen ${docData.docNumber} telah dibuat. Total tagihan Rp${totalVal.toLocaleString('id-ID')}.`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      file: {
        name: pdfName,
        type: 'pdf',
        url: pdfDataUrl
      },
      isRead: true,
      status: 'sent'
    };

    setMessages(prev => [...prev, newMsg]);
    db.chatMessages.push(newMsg as any);
    onRefresh();
  };

  // Message Info states
  const [showMsgInfoModal, setShowMsgInfoModal] = useState<boolean>(false);
  const [msgInfoTarget, setMsgInfoTarget] = useState<EnrichedMessage | null>(null);

  // Forward Modal states
  const [showForwardModal, setShowForwardModal] = useState<boolean>(false);
  const [forwardTargets, setForwardTargets] = useState<string[]>([]);

  // Settings Panel states
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [chatWallpaper, setChatWallpaper] = useState<string>('classic-doodle');
  const [chatFontSize, setChatFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [disappearingMessages, setDisappearingMessages] = useState<string>('off');

  // Voice player control states
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [voicePlaybackProgress, setVoicePlaybackProgress] = useState<number>(0);
  const [voiceSpeed, setVoiceSpeed] = useState<{ [id: string]: number }>({});

  // Voice Recorder toggles
  const [isVoiceRecordingActive, setIsVoiceRecordingActive] = useState<boolean>(false);

  // Delete Confirmation Dialogs
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [deleteConfirmScope, setDeleteConfirmScope] = useState<'me' | 'everyone' | 'conversation'>('me');
  const [deleteConfirmTargetId, setDeleteConfirmTargetId] = useState<string | null>(null);

  // Editing Message triggers
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Static list of chat participants
  const chatParticipants = useMemo(() => [
    { 
      id: 'usr_2_comp_maju', 
      name: 'Andi Wijaya (CV Maju Bersama)', 
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120', 
      role: 'Supplier Baja & Konstruksi', 
      online: true,
      lastSeen: 'Online',
      phone: '+62 812-3456-7890',
      nib: '9120109281231',
      about: 'Penyedia besi hollow, pipa galvanis, dan plat baja bersertifikat SNI & TKDN 45%.'
    },
    { 
      id: 'usr_1_comp_telkom', 
      name: 'Budi Santoso (PT Telkom)', 
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120', 
      role: 'Project Manager BUMN', 
      online: true,
      lastSeen: 'Online',
      phone: '+62 821-9988-7766',
      nib: '8120309912882',
      about: 'Divisi Infrastruktur Jaringan & Pengadaan B2B BUMN Republik Indonesia.'
    },
    { 
      id: 'group_bci_forum', 
      name: 'Forum Sinergi B2B Nasional', 
      avatar: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=120', 
      role: 'Grup Publik Komunitas', 
      online: false,
      lastSeen: '1.240 Anggota Aktif',
      phone: 'Wadah Komunikasi',
      nib: 'Sosialisasi TKDN',
      about: 'Grup diskusi resmi pameran nasional, info tender terbaru, dan business matching nasional.'
    }
  ], []);

  const activeChatInfo = useMemo(() => {
    return chatParticipants.find(p => p.id === activeChatId) || chatParticipants[0];
  }, [activeChatId, chatParticipants]);

  // Load and enrich messages initially from db
  useEffect(() => {
    const rawMsgs = db.chatMessages.filter(m => m.chatId === activeChatId);
    
    const enriched: EnrichedMessage[] = rawMsgs.map((msg, idx) => {
      let isReadStatus: 'sent' | 'delivered' | 'read' = 'read';
      if (idx === rawMsgs.length - 1) isReadStatus = 'delivered';
      if (idx === rawMsgs.length - 2) isReadStatus = 'read';

      let customProps: Partial<EnrichedMessage> = { status: isReadStatus };

      if (msg.message.includes('sertifikat') || msg.message.includes('NIB')) {
        customProps.replyTo = {
          senderName: activeChatInfo.name,
          message: 'Mohon kirimkan kelengkapan berkas legalitas perusahaan untuk verifikasi kontrak.'
        };
      }

      if (msg.message.includes('lokasi') || msg.message.includes('gudang')) {
        customProps.location = {
          address: 'Kawasan Industri GIIC Cikarang Blok AA-3, Bekasi, Jawa Barat',
          mapUrl: 'https://maps.google.com'
        };
      }

      if (msg.message.includes('Suara') || msg.message.includes('rekaman') || msg.message.includes('voice')) {
        customProps.voiceNote = {
          duration: '0:42',
          waveData: [10, 24, 45, 12, 60, 32, 15, 45, 78, 34, 12, 50, 90, 42, 20, 35, 10, 5, 25, 40]
        };
      }

      return {
        ...msg,
        ...customProps
      };
    });

    // Handle older simulated messages if history count active
    if (historyLoadedCount > 0) {
      const historyMsgs: EnrichedMessage[] = [
        {
          id: 'hist_1',
          chatId: activeChatId,
          senderId: activeChatInfo.id,
          senderName: activeChatInfo.name,
          senderAvatar: activeChatInfo.avatar,
          message: 'Halo, salam kenal. Kami melihat profil Anda dari portal Business Connect Indonesia (BCI).',
          timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
          isRead: true,
          status: 'read'
        },
        {
          id: 'hist_2',
          chatId: activeChatId,
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderAvatar: currentUser.avatar,
          message: 'Salam kenal Pak. Betul, kami adalah penyedia komponen konstruksi bersertifikasi tingkat nasional.',
          timestamp: new Date(Date.now() - 3600000 * 23).toISOString(),
          isRead: true,
          status: 'read'
        },
        {
          id: 'hist_3',
          chatId: activeChatId,
          senderId: activeChatInfo.id,
          senderName: activeChatInfo.name,
          senderAvatar: activeChatInfo.avatar,
          message: 'Luar biasa. Kami saat ini sedang mencari mitra penyedia dengan kesiapan TKDN tinggi untuk proyek renovasi pergudangan.',
          timestamp: new Date(Date.now() - 3600000 * 22).toISOString(),
          isRead: true,
          status: 'read',
          file: {
            name: 'Persyaratan_Teknis_TKDN_Proyek.pdf',
            type: 'pdf',
            url: '#'
          }
        }
      ];
      setMessages([...historyMsgs, ...enriched]);
    } else {
      setMessages(enriched);
    }
  }, [db.chatMessages, activeChatId, historyLoadedCount, activeChatInfo, currentUser]);

  // Intercept prefilled chat direction
  useEffect(() => {
    if (prefilledPartnerId) {
      setActiveChatId('usr_2_comp_maju'); 
      setMobileActive(true);
      if (prefilledMessage) {
        setTypedMessage(prefilledMessage);
      }
      onClearPrefilledChat();
    }
  }, [prefilledPartnerId, prefilledMessage, onClearPrefilledChat]);

  // Auto Scroll to last message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatLoading]);

  // Timer simulation for active calls
  useEffect(() => {
    let interval: any = null;
    if (activeCallType) {
      interval = setInterval(() => {
        setCallTimer(prev => prev + 1);
      }, 1000);
    } else {
      setCallTimer(0);
    }
    return () => clearInterval(interval);
  }, [activeCallType]);

  // Simulated typing indicator
  useEffect(() => {
    let timer: any = null;
    if (typingPartner) {
      timer = setTimeout(() => {
        setTypingPartner(false);
      }, 3500);
    }
    return () => clearTimeout(timer);
  }, [typingPartner]);

  // Simulated Voice Note playback
  useEffect(() => {
    let timer: any = null;
    if (playingVoiceId) {
      timer = setInterval(() => {
        setVoicePlaybackProgress(prev => {
          if (prev >= 100) {
            setPlayingVoiceId(null);
            return 0;
          }
          const currentSpeed = voiceSpeed[playingVoiceId] || 1;
          return prev + (5 * currentSpeed);
        });
      }, 250);
    } else {
      setVoicePlaybackProgress(0);
    }
    return () => clearInterval(timer);
  }, [playingVoiceId, voiceSpeed]);

  const handleSelectChat = (chatId: string) => {
    setIsChatLoading(true);
    setActiveChatId(chatId);
    setMobileActive(true);
    setHistoryLoadedCount(0);
    setTimeout(() => {
      setIsChatLoading(false);
    }, 450);
  };

  const handleLoadHistory = () => {
    setIsHistoryLoading(true);
    setTimeout(() => {
      setHistoryLoadedCount(prev => prev + 1);
      setIsHistoryLoading(false);
    }, 750);
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // SEND MESSAGE HANDLER
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!typedMessage.trim() && !attachedFile && !attachedLocation && !attachedVoice) return;

    // Handle edit message flow if active
    if (editingMessageId) {
      setMessages(prev => prev.map(m => {
        if (m.id === editingMessageId) {
          return { ...m, message: typedMessage.trim(), isEdited: true };
        }
        return m;
      }));
      setTypedMessage('');
      setEditingMessageId(null);
      return;
    }

    const messageText = typedMessage.trim();
    let payloadMessage = messageText;
    let filePayload = attachedFile ? { ...attachedFile } : undefined;

    let voicePayload: EnrichedMessage['voiceNote'] = undefined;
    let locationPayload: EnrichedMessage['location'] = undefined;

    if (attachedLocation) {
      payloadMessage = `📍 Lokasi Dibagikan: ${attachedLocation.address}`;
      locationPayload = attachedLocation;
    } else if (attachedVoice) {
      payloadMessage = `🎤 Pesan Suara (${attachedVoice.duration})`;
      voicePayload = attachedVoice;
    }

    const tempId = 'temp_' + Date.now();
    const newLocalMsg: EnrichedMessage = {
      id: tempId,
      chatId: activeChatId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      message: payloadMessage,
      timestamp: new Date().toISOString(),
      file: filePayload,
      location: locationPayload,
      voiceNote: voicePayload,
      isRead: false,
      status: 'sent'
    };

    // Prepend to messages state immediately for ultra snappy native-feeling UX
    setMessages(prev => [...prev, newLocalMsg]);
    setTypedMessage('');
    setAttachedFile(null);
    setAttachedLocation(null);
    setAttachedVoice(null);
    setReplyingTo(null);

    // Write back to database to keep global portal state synchronized
    try {
      await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: activeChatId,
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderAvatar: currentUser.avatar,
          message: payloadMessage,
          file: filePayload
        })
      });

      // Update checkmark ticks status
      setTimeout(() => {
        setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'delivered' as const } : m));
        setTimeout(() => {
          setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'read' as const } : m));
        }, 1200);
      }, 850);

      // Trigger high-intelligence automatic responses based on content triggers
      setTimeout(() => {
        setTypingPartner(true);
        setTimeout(async () => {
          let responseText = "Terima kasih atas masukannya, mari kita jadwalkan pertemuan business matching online besok jam 10 pagi untuk membahas detail kerjasama ini.";
          const lowerMsg = messageText.toLowerCase();
          
          if (lowerMsg.includes('harga') || lowerMsg.includes('diskon') || lowerMsg.includes('murah')) {
            responseText = "Baik Pak, untuk kuantitas proyek di atas 1.000 unit kami siap memberikan diskon khusus 5% tambahan serta termin pembayaran bertahap 30 hari.";
          } else if (lowerMsg.includes('sampel') || lowerMsg.includes('contoh') || lowerMsg.includes('uji')) {
            responseText = "Siap Pak, berkas brosur dan sampel fisik material baja bersertifikat TKDN akan kami kirimkan besok pagi melalui kurir ekspres langsung ke alamat Anda.";
          } else if (lowerMsg.includes('legalitas') || lowerMsg.includes('nib') || lowerMsg.includes('npwp')) {
            responseText = "Sertifikasi legalitas lengkap kami (NIB, NPWP, dan Sertifikat SNI ISO) sudah terlampir. Silakan diunduh untuk kelengkapan administrasi tender.";
          } else if (lowerMsg.includes('lokasi') || lowerMsg.includes('alamat') || lowerMsg.includes('gudang')) {
            responseText = "Lokasi fasilitas produksi utama kami berada di Kawasan Industri Cikarang. Pintu gerbang utama langsung bersebelahan dengan pos logistik kontainer.";
          }

          // Write partner response to DB & local state
          const replyId = 'reply_' + Date.now();
          const partnerReply: EnrichedMessage = {
            id: replyId,
            chatId: activeChatId,
            senderId: activeChatInfo.id,
            senderName: activeChatInfo.name,
            senderAvatar: activeChatInfo.avatar,
            message: responseText,
            timestamp: new Date().toISOString(),
            isRead: true,
            status: 'read'
          };

          setMessages(prev => [...prev, partnerReply]);
          setTypingPartner(false);

          await fetch('/api/chat/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chatId: activeChatId,
              senderId: activeChatInfo.id,
              senderName: activeChatInfo.name,
              senderAvatar: activeChatInfo.avatar,
              message: responseText
            })
          });
        }, 1500);
      }, 1000);

    } catch (err) {
      console.error(err);
    }
  };

  const handleInsertSticker = (stickerText: string) => {
    setTypedMessage(prev => prev + stickerText);
    setShowEmojiPicker(false);
  };

  const handleAttachMockFile = (type: 'pdf' | 'excel' | 'image' | 'location' | 'voice') => {
    setShowAttachMenu(false);
    if (type === 'pdf') {
      setAttachedFile({ name: 'Spesifikasi_Alat_Berat_Pabrik.pdf', type: 'pdf', url: '#' });
    } else if (type === 'excel') {
      setAttachedFile({ name: 'RAB_Anggaran_Tender_CV_Maju.xlsx', type: 'excel', url: '#' });
    } else if (type === 'image') {
      setAttachedFile({ name: 'Foto_Produksi_Baja_HotRolled.png', type: 'image', url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=600' });
    } else if (type === 'location') {
      setAttachedLocation({
        address: 'Kawasan Industri GIIC Cikarang Blok AA-3, Bekasi, Jawa Barat',
        mapUrl: 'https://maps.google.com'
      });
    } else if (type === 'voice') {
      setAttachedVoice({
        duration: '0:42',
        waveData: [15, 30, 40, 10, 50, 60, 20, 10, 35, 75, 90, 45, 10, 5, 20, 45, 12, 10, 25, 40]
      });
    }
  };

  const handleRealFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`File "${file.name}" melebihi batas ukuran maksimal (10 MB). Silakan pilih file yang lebih kecil.`);
      e.target.value = '';
      return;
    }

    let fileType: ChatMessage['file']['type'] = 'pdf';
    const mimeType = file.type;
    const fileName = file.name.toLowerCase();

    if (mimeType.startsWith('image/')) {
      fileType = 'image';
    } else if (mimeType.startsWith('video/')) {
      fileType = 'video';
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv')) {
      fileType = 'excel';
    } else if (fileName.includes('proposal') || fileName.includes('kontrak') || fileName.includes('penawaran')) {
      fileType = 'proposal';
    } else if (fileName.endsWith('.pdf')) {
      fileType = 'pdf';
    }

    setIsUploading(true);
    setUploadProgress(10);
    setShowAttachMenu(false);

    setAttachedFile(null);
    setAttachedLocation(null);
    setAttachedVoice(null);

    const reader = new FileReader();
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 40);
        setUploadProgress(10 + percent);
      }
    };

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const fileDataUrl = reader.result;
        let progressVal = 50;
        const intervalId = setInterval(() => {
          progressVal += 10;
          setUploadProgress(progressVal);
          
          if (progressVal >= 100) {
            clearInterval(intervalId);
            setIsUploading(false);
            setAttachedFile({
              name: file.name,
              type: fileType,
              url: fileDataUrl
            });
          }
        }, 120);
      }
    };

    reader.onerror = () => {
      setIsUploading(false);
      alert('Gagal membaca file dari perangkat. Silakan coba kembali.');
    };

    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // INTERACTIVE GESTURE: TOUCH SWIPE DETECTORS
  const handleTouchStart = (e: React.TouchEvent, msgId: string) => {
    if (isMultiSelectMode) return;
    swipeActiveId.current = msgId;
    swipeStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent, msgId: string) => {
    if (swipeActiveId.current !== msgId) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - swipeStartX.current;
    
    // Clamp values
    if (diff > 0 && diff < 120) {
      setSwipeOffset(prev => ({ ...prev, [msgId]: diff }));
    }
  };

  const handleTouchEnd = (msgId: string) => {
    if (swipeActiveId.current !== msgId) return;
    const offset = swipeOffset[msgId] || 0;
    
    if (offset > 65) {
      // Swipe to Reply matched! Set replying message state
      const target = messages.find(m => m.id === msgId);
      if (target) {
        setReplyingTo(target);
        window.navigator.vibrate?.(35);
      }
    }
    
    // Snap back
    setSwipeOffset(prev => ({ ...prev, [msgId]: 0 }));
    swipeActiveId.current = null;
  };

  // DESKTOP GESTURE: MOUSE SWIPE DRAG DETECTORS
  const handleMouseDown = (e: React.MouseEvent, msgId: string) => {
    if (isMultiSelectMode) return;
    swipeActiveId.current = msgId;
    swipeStartX.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent, msgId: string) => {
    if (swipeActiveId.current !== msgId) return;
    const diff = e.clientX - swipeStartX.current;
    if (diff > 0 && diff < 120) {
      setSwipeOffset(prev => ({ ...prev, [msgId]: diff }));
    }
  };

  const handleMouseUpOrLeave = (msgId: string) => {
    if (swipeActiveId.current !== msgId) return;
    const offset = swipeOffset[msgId] || 0;
    
    if (offset > 65) {
      const target = messages.find(m => m.id === msgId);
      if (target) {
        setReplyingTo(target);
      }
    }
    setSwipeOffset(prev => ({ ...prev, [msgId]: 0 }));
    swipeActiveId.current = null;
  };

  // MULTI SELECT ACTIONS
  const handleToggleSelectMessage = (msgId: string) => {
    setSelectedMessageIds(prev =>
      prev.includes(msgId) ? prev.filter(id => id !== msgId) : [...prev, msgId]
    );
  };

  const handleBulkDelete = () => {
    if (selectedMessageIds.length === 0) return;
    setMessages(prev => prev.filter(m => !selectedMessageIds.includes(m.id)));
    setSelectedMessageIds([]);
    setIsMultiSelectMode(false);
    alert('Pesan terpilih berhasil dihapus.');
  };

  const handleBulkCopy = () => {
    if (selectedMessageIds.length === 0) return;
    const texts = messages
      .filter(m => selectedMessageIds.includes(m.id))
      .map(m => `[${m.senderName}]: ${m.message}`)
      .join('\n');
    navigator.clipboard.writeText(texts);
    setSelectedMessageIds([]);
    setIsMultiSelectMode(false);
    alert('Berhasil menyalin seluruh pesan terpilih ke clipboard.');
  };

  const handleBulkStar = () => {
    if (selectedMessageIds.length === 0) return;
    setMessages(prev => prev.map(m => {
      if (selectedMessageIds.includes(m.id)) {
        return { ...m, isStarred: !m.isStarred };
      }
      return m;
    }));
    setSelectedMessageIds([]);
    setIsMultiSelectMode(false);
    alert('Status bintang pesan terpilih berhasil diubah.');
  };

  const handleBulkPin = () => {
    if (selectedMessageIds.length === 0) return;
    setMessages(prev => prev.map(m => {
      if (selectedMessageIds.includes(m.id)) {
        return { ...m, isPinned: !m.isPinned };
      }
      return m;
    }));
    setSelectedMessageIds([]);
    setIsMultiSelectMode(false);
    alert('Pin disematkan pada pesan-pesan terpilih.');
  };

  const handleBulkForwardTrigger = () => {
    if (selectedMessageIds.length === 0) return;
    setShowForwardModal(true);
  };

  // SINGLE GESTURE ACTIONS
  const handleAddReaction = (emoji: string, msgId: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id === msgId) {
        const reactions = m.reactions ? [...m.reactions] : [];
        const existing = reactions.find(r => r.emoji === emoji);
        if (existing) {
          existing.count++;
        } else {
          reactions.push({ emoji, count: 1 });
        }
        return { ...m, reactions };
      }
      return m;
    }));
  };

  const handleCopyMessageText = (msg: EnrichedMessage) => {
    navigator.clipboard.writeText(msg.message);
    alert('Pesan tersalin!');
  };

  const handleDeleteMessageRequest = (msgId: string, scope: 'me' | 'everyone' | 'conversation') => {
    setDeleteConfirmTargetId(msgId);
    setDeleteConfirmScope(scope);
    setShowDeleteConfirm(true);
  };

  const handleExecuteDelete = () => {
    if (deleteConfirmScope === 'conversation') {
      // Clear entire active chat local storage representation
      setMessages([]);
      setShowDeleteConfirm(false);
      alert('Seluruh isi percakapan dibersihkan.');
      return;
    }

    if (!deleteConfirmTargetId) return;

    if (deleteConfirmScope === 'me') {
      setMessages(prev => prev.filter(m => m.id !== deleteConfirmTargetId));
    } else {
      // Delete for Everyone: replace content and mark deleted
      setMessages(prev => prev.map(m => {
        if (m.id === deleteConfirmTargetId) {
          return {
            ...m,
            message: '🚫 Pesan ini telah dihapus oleh pengirim.',
            isDeleted: true,
            file: undefined,
            location: undefined,
            voiceNote: undefined
          };
        }
        return m;
      }));
    }

    setShowDeleteConfirm(false);
    setDeleteConfirmTargetId(null);
  };

  const handleToggleStarSingle = (msgId: string) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isStarred: !m.isStarred } : m));
  };

  const handleTogglePinSingle = (msgId: string) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isPinned: !m.isPinned } : m));
  };

  const handleForwardDone = (targetIds: string[]) => {
    const forwardIds = isMultiSelectMode ? selectedMessageIds : [selectedMessageForMenu?.id || ''];
    const messagesToForward = messages.filter(m => forwardIds.includes(m.id));
    
    alert(`Berhasil meneruskan ${messagesToForward.length} pesan ke ${targetIds.length} penerima.`);
    
    setIsMultiSelectMode(false);
    setSelectedMessageIds([]);
    setShowForwardModal(false);
  };

  // SEARCH SEARCH ENGINE FILTERS
  const processedFilteredMessages = useMemo(() => {
    let result = messages;

    // Filter starred only
    if (showStarredOnly) {
      result = result.filter(m => m.isStarred);
    }

    // Filter search queries
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(m => {
        const textMatch = m.message.toLowerCase().includes(query);
        const fileMatch = m.file?.name.toLowerCase().includes(query);
        const locationMatch = m.location?.address.toLowerCase().includes(query);
        return textMatch || fileMatch || locationMatch;
      });
    }

    // Filter by type
    if (searchFilterType !== 'all') {
      result = result.filter(m => {
        if (searchFilterType === 'image') return m.file?.type === 'image';
        if (searchFilterType === 'video') return m.file?.type === 'video';
        if (searchFilterType === 'pdf') return m.file?.type === 'pdf' || m.file?.type === 'excel' || m.file?.type === 'proposal';
        if (searchFilterType === 'link') return m.message.includes('http://') || m.message.includes('https://') || m.message.includes('www.');
        return true;
      });
    }

    return result;
  }, [messages, searchQuery, searchFilterType, showStarredOnly]);

  // HIGHLIGHT TEXT MATCHER
  const renderHighlightedText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const regex = new RegExp(`(${highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 text-slate-950 font-black rounded-sm px-0.5">{part}</mark>
      ) : (
        part
      )
    );
  };

  // PINNED MESSAGES HEADER BLOCK
  const pinnedMessages = useMemo(() => {
    return messages.filter(m => m.isPinned);
  }, [messages]);

  // VOICE PLAYBACK SPEED CONTROLLER
  const handleToggleVoiceSpeed = (msgId: string) => {
    setVoiceSpeed(prev => {
      const current = prev[msgId] || 1;
      let nextSpeed = 1;
      if (current === 1) nextSpeed = 1.5;
      else if (current === 1.5) nextSpeed = 2;
      return { ...prev, [msgId]: nextSpeed };
    });
  };

  // WALLPAPER MAPPING
  const getWallpaperClass = () => {
    if (chatWallpaper === 'midnight-blue') return 'bg-[#0B141A] text-slate-100';
    if (chatWallpaper === 'coral-peach') return 'bg-[#FFF5F0]';
    if (chatWallpaper === 'slate-dark') return 'bg-[#0F172A] text-slate-100';
    if (chatWallpaper === 'emerald-green') return 'bg-[#E1EFE6]';
    return 'bg-[#F2EFE9]'; // classic doodle
  };

  // FONT SIZE CLASS MAPPING
  const getFontSizeClass = () => {
    if (chatFontSize === 'small') return 'text-[10px]';
    if (chatFontSize === 'large') return 'text-[13px]';
    return 'text-[11.5px]'; // medium (default)
  };

  return (
    <div className={`w-full h-full flex flex-col md:flex-row md:rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-2xl relative ${isDarkMode ? 'dark bg-slate-950 text-white border-slate-800' : 'bg-slate-50/50 text-slate-800'}`}>
      
      {/* SECTION 1: MASTER SIDEBAR - CHAT PARTICIPANT LIST */}
      <div className={`w-full md:w-1/3 border-r border-slate-100 flex flex-col bg-white shrink-0 h-full ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} ${mobileActive ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Sidebar Header */}
        <div className={`p-4 border-b border-slate-100 space-y-3 shrink-0 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-2xl bg-gradient-to-tr from-[#FF6B00]/10 to-amber-500/10 text-[#FF6B00]">
                <MessageSquare className="h-5.5 w-5.5 animate-pulse text-[#FF6B00]" />
              </span>
              <div>
                <h2 className="font-black text-sm tracking-tight text-slate-900 dark:text-white">BCI Connect</h2>
                <p className="text-[10px] text-slate-400 font-bold">Obrolan Kemitraan Aman</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5">
              {/* Starred shortcut */}
              <button
                onClick={() => setShowStarredOnly(!showStarredOnly)}
                className={`p-2 rounded-xl border transition-all ${
                  showStarredOnly 
                    ? 'bg-amber-500 border-amber-500 text-white' 
                    : 'text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title={showStarredOnly ? "Tampilkan Semua" : "Pesan Berbintang"}
              >
                <Star className={`h-4.5 w-4.5 ${showStarredOnly ? 'fill-current' : ''}`} />
              </button>

              {/* Chat settings button */}
              <button
                onClick={() => setShowSettingsModal(true)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Pengaturan Chat"
              >
                <Settings className="h-4.5 w-4.5" />
              </button>

              {onViewChange && (
                <button
                  onClick={() => onViewChange('dashboard')}
                  className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Kembali ke Dashboard"
                >
                  <ChevronLeft className="h-4.5 w-4.5" />
                </button>
              )}
            </div>
          </div>

          <div className="relative">
            <Search className="absolute top-3.5 left-4 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari chat atau pemasok..."
              className={`w-full rounded-2xl border bg-slate-50/50 py-3 pl-11 pr-4 text-xs outline-none transition-all focus:bg-white font-bold min-h-[44px] ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-[#FFC107]' : 'border-slate-200 focus:border-[#FF6B00]'}`}
            />
          </div>
        </div>

        {/* Sidebar Chat List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100/50 dark:divide-slate-800/40">
          {chatParticipants.map(chat => {
            const lastMsg = db.chatMessages.filter(m => m.chatId === chat.id).slice(-1)[0];
            const isActive = activeChatId === chat.id;

            return (
              <button
                key={chat.id}
                onClick={() => handleSelectChat(chat.id)}
                className={`w-full flex items-center gap-3.5 p-4 text-left transition-all cursor-pointer ${
                  isActive 
                    ? (isDarkMode ? 'bg-slate-800/70 border-l-4 border-[#FF6B00]' : 'bg-gradient-to-r from-amber-500/5 to-transparent border-l-4 border-[#FF6B00]') 
                    : (isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/50')
                }`}
              >
                <div className="relative flex-shrink-0">
                  <img src={chat.avatar} alt={chat.name} className="h-12 w-12 rounded-2xl object-cover border border-slate-100 dark:border-slate-800 shadow-sm" />
                  {chat.online ? (
                    <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 animate-pulse"></span>
                  ) : (
                    <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-slate-300 border-2 border-white dark:border-slate-900"></span>
                  )}
                </div>
                <div className="flex-1 min-w-0 text-xs">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className={`font-black truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{chat.name}</p>
                    <span className="text-[9px] text-slate-400 font-bold flex-shrink-0">Baru</span>
                  </div>
                  <p className="text-[10px] text-[#FF6B00] font-black mb-1">{chat.role}</p>
                  <p className={`truncate font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                    {lastMsg ? lastMsg.message : "Belum ada diskusi."}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* E2E Security Badge bottom */}
        <div className={`p-4 border-t border-slate-100 text-[10px] text-center font-bold text-slate-400 shrink-0 flex items-center justify-center gap-1.5 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <Lock className="h-3 w-3 text-emerald-500" />
          <span>Enkripsi End-to-End • Portal BCI 2026</span>
        </div>
      </div>

      {/* SECTION 2: ACTIVE CONVERSATION PANE */}
      <div className={`flex-1 flex flex-col relative h-full overflow-hidden ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50/30'} ${!mobileActive ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Active Chat Header */}
        <div className={`flex items-center justify-between p-3.5 border-b border-slate-100 bg-white shrink-0 shadow-sm relative z-20 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => setMobileActive(false)}
              className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-90 transition-transform flex-shrink-0 cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5 text-slate-600 dark:text-slate-200" />
            </button>

            <div className="relative cursor-pointer flex-shrink-0" onClick={() => setShowMenuPopup(!showMenuPopup)}>
              <img src={activeChatInfo.avatar} alt="Avatar" className="h-10 w-10 rounded-2xl object-cover border border-slate-100 dark:border-slate-700 shadow-sm" />
              {activeChatInfo.online && (
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 animate-ping"></span>
              )}
            </div>

            <div className="text-xs min-w-0 cursor-pointer" onClick={() => setShowMenuPopup(!showMenuPopup)}>
              <h4 className={`font-black leading-none mb-1 truncate max-w-[140px] sm:max-w-[200px] md:max-w-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{activeChatInfo.name}</h4>
              <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 leading-none">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                <span>{activeChatInfo.lastSeen}</span>
              </p>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-1">
            {/* Create B2B Official Document Button */}
            <button
              onClick={() => setIsDocModalOpen(true)}
              className="rounded-xl px-2.5 py-1.5 bg-gradient-to-r from-[#FFC107] to-[#FF6B00] hover:brightness-110 text-white font-black text-[10.5px] flex items-center gap-1.5 shadow-sm shadow-orange-500/20 cursor-pointer transition-all mr-1"
              title="Buat PO, Surat Penawaran, Invoice & Export PDF"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Buat PO / Surat PDF</span>
            </button>

            {/* Search toggler */}
            <button
              onClick={() => setIsSearchPanelOpen(!isSearchPanelOpen)}
              className={`rounded-xl p-2.5 transition-colors cursor-pointer ${
                isSearchPanelOpen ? 'bg-orange-500/10 text-[#FF6B00]' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Cari Isi Pesan"
            >
              <Search className="h-4.5 w-4.5" />
            </button>

            {/* Voice call */}
            <button
              onClick={() => {
                setActiveCallType('voice');
                setCallTimer(0);
              }}
              className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#FF6B00] transition-colors cursor-pointer"
              title="Panggilan Suara"
            >
              <Phone className="h-4.5 w-4.5" />
            </button>

            {/* Video call */}
            <button
              onClick={() => {
                setActiveCallType('video');
                setCallTimer(0);
              }}
              className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#FF6B00] transition-colors cursor-pointer"
              title="Panggilan Video"
            >
              <Video className="h-4.5 w-4.5" />
            </button>

            {/* More / Dropdown */}
            <button
              onClick={() => setShowMenuPopup(!showMenuPopup)}
              className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#FF6B00] transition-colors cursor-pointer"
              title="Pengaturan Kontak"
            >
              <MoreVertical className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* SEARCH BAR / SLIDE OUT PANEL */}
        {isSearchPanelOpen && (
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 flex flex-col gap-2 animate-fade-in shrink-0">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute top-2.5 left-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari kata kunci, nama file, atau alamat lokasi..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 py-2 pl-9 pr-8 text-xs font-bold outline-none focus:bg-white focus:border-[#FF6B00]"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute top-2.5 right-2.5 text-slate-400 hover:text-slate-600">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <button
                onClick={() => {
                  setIsSearchPanelOpen(false);
                  setSearchQuery('');
                }}
                className="text-xs text-slate-500 hover:text-slate-800 font-black px-2 py-1"
              >
                Batal
              </button>
            </div>

            {/* Search Type Filter Badges */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none text-[10px]">
              {(['all', 'text', 'image', 'video', 'pdf', 'link'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setSearchFilterType(type)}
                  className={`px-3 py-1 rounded-full border font-black capitalize flex-shrink-0 transition-all ${
                    searchFilterType === type
                      ? 'bg-[#FF6B00] border-[#FF6B00] text-white'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {type === 'all' ? 'Semua' : type === 'pdf' ? 'Dokumen' : type === 'image' ? 'Foto' : type === 'video' ? 'Video' : type}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MOCK CALL SCREEN OVERLAY */}
        {activeCallType && (
          <div className="absolute inset-0 bg-slate-900/95 text-white z-50 flex flex-col items-center justify-center p-6 animate-fade-in text-center">
            <div className="space-y-4 max-w-xs w-full flex flex-col items-center">
              <div className="relative">
                <img src={activeChatInfo.avatar} alt="Avatar" className="h-24 w-24 rounded-full object-cover border-4 border-[#FF6B00] shadow-2xl" />
                <span className="absolute top-0 right-0 p-2 bg-[#FF6B00] rounded-full text-white animate-bounce">
                  <PhoneCall className="h-4 w-4" />
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black">{activeChatInfo.name}</h3>
                <p className="text-xs text-orange-400 font-bold">{activeChatInfo.role}</p>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                  {activeCallType === 'video' ? 'Kamera Sedang Menyambung...' : 'Panggilan Suara Berlangsung'}
                </p>
                <div className="text-xl font-bold font-mono py-1 text-white animate-pulse">
                  {formatTime(callTimer)}
                </div>
              </div>

              {activeCallType === 'video' && (
                <div className="w-full h-32 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden relative shadow-inner">
                  <img src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=300" alt="Self Video" className="w-full h-full object-cover opacity-60" />
                  <div className="absolute bottom-2 left-2 text-[9px] bg-slate-950/70 px-2 py-1 rounded font-bold">
                    Kamera Anda (Aktif)
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setActiveCallType(null)}
                  className="rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white p-4 cursor-pointer shadow-lg shadow-red-600/30 transition-all flex items-center justify-center"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DETAILED BUSINESS CONTACT PROFILE DRAWER/MODAL POPUP */}
        {showMenuPopup && (
          <div className="absolute right-4 top-16 w-80 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-5 space-y-4 z-40 animate-fade-in text-xs font-semibold">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-wider">Aksi Percakapan</h3>
              <button onClick={() => setShowMenuPopup(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Conversation Actions List */}
            <div className="space-y-1">
              <button
                onClick={() => {
                  setShowMenuPopup(false);
                  handleDeleteMessageRequest('', 'conversation');
                }}
                className="w-full p-2.5 rounded-xl hover:bg-red-500/10 text-red-600 font-bold text-left flex items-center gap-2"
              >
                <Trash className="h-4 w-4" />
                <span>Hapus Percakapan</span>
              </button>
              
              <button
                onClick={() => {
                  setShowMenuPopup(false);
                  alert('Percakapan diarsipkan.');
                }}
                className="w-full p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-left flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Arsipkan Percakapan</span>
              </button>

              <button
                onClick={() => {
                  setShowMenuPopup(false);
                  alert('Percakapan ditandai belum dibaca.');
                }}
                className="w-full p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-left flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Tandai Belum Dibaca</span>
              </button>

              <button
                onClick={() => {
                  setShowMenuPopup(false);
                  alert('Notifikasi dibisukan selama 8 jam.');
                }}
                className="w-full p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-left flex items-center gap-2"
              >
                <VolumeX className="h-4 w-4" />
                <span>Bisukan Notifikasi</span>
              </button>

              <button
                onClick={() => {
                  setShowMenuPopup(false);
                  alert('Pengguna berhasil diblokir.');
                }}
                className="w-full p-2.5 rounded-xl hover:bg-red-500/10 text-red-600 text-left flex items-center gap-2"
              >
                <AlertCircle className="h-4 w-4" />
                <span>Blokir Pengguna</span>
              </button>

              <button
                onClick={() => {
                  setShowMenuPopup(false);
                  alert(`Tindakan Ekspor Riwayat Chat dengan ${activeChatInfo.name} berhasil dibuat.`);
                }}
                className="w-full p-2.5 rounded-xl bg-[#FF6B00] text-white font-black hover:brightness-110 text-center cursor-pointer mt-3"
              >
                Ekspor Obrolan (PDF)
              </button>
            </div>
          </div>
        )}

        {/* IMAGE LIGHTBOX OVERLAY */}
        {lightboxImage && (
          <div className="absolute inset-0 bg-slate-950/98 z-50 flex flex-col justify-between p-4 animate-fade-in">
            <div className="flex items-center justify-between text-white pb-2">
              <div className="text-xs">
                <p className="font-black text-slate-100">{lightboxImage.title}</p>
                <p className="text-[10px] text-slate-400 font-bold">Tekan X untuk menutup</p>
              </div>
              <button onClick={() => setLightboxImage(null)} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 text-white cursor-pointer transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center p-4">
              <img src={lightboxImage.url} alt="Lightbox Preview" className="max-w-full max-h-[75vh] rounded-2xl object-contain shadow-2xl border border-slate-800" />
            </div>

            <div className="flex justify-center pb-4">
              <a
                href={lightboxImage.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#FF6B00] text-white text-xs font-black hover:brightness-110 transition-all shadow-lg"
              >
                <Download className="h-4 w-4" />
                <span>Simpan Gambar</span>
              </a>
            </div>
          </div>
        )}

        {/* MULTI SELECT MODE TOOLBAR (TOP INTERACTIVE BAR) */}
        {isMultiSelectMode && (
          <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-r from-amber-600 to-orange-700 text-white z-40 flex items-center justify-between px-4 animate-fade-in text-xs font-black">
            <div className="flex items-center gap-3">
              <button onClick={() => { setIsMultiSelectMode(false); setSelectedMessageIds([]); }} className="p-2 hover:bg-white/10 rounded-xl">
                <X className="h-5 w-5" />
              </button>
              <span>{selectedMessageIds.length} Terpilih</span>
            </div>

            {/* Bulk actions */}
            <div className="flex items-center gap-2">
              <button onClick={handleBulkCopy} className="p-2.5 hover:bg-white/10 rounded-xl" title="Salin Masal">
                <Copy className="h-4.5 w-4.5" />
              </button>
              <button onClick={handleBulkStar} className="p-2.5 hover:bg-white/10 rounded-xl" title="Bintangi Masal">
                <Star className="h-4.5 w-4.5" />
              </button>
              <button onClick={handleBulkPin} className="p-2.5 hover:bg-white/10 rounded-xl" title="Sematkan Masal">
                <Pin className="h-4.5 w-4.5" />
              </button>
              <button onClick={handleBulkForwardTrigger} className="p-2.5 hover:bg-white/10 rounded-xl" title="Teruskan Masal">
                <CornerUpLeft className="h-4.5 w-4.5" />
              </button>
              <button onClick={handleBulkDelete} className="p-2.5 hover:bg-white/10 rounded-xl text-red-200" title="Hapus Masal">
                <Trash className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        )}

        {/* STICKY PINNED MESSAGES SUBHEADER */}
        {pinnedMessages.length > 0 && (
          <div className="bg-orange-500/5 dark:bg-orange-500/10 border-b border-orange-500/10 px-4 py-2 flex items-center justify-between gap-2 text-[10.5px] shrink-0 z-10 animate-fade-in font-bold">
            <div className="flex items-center gap-2 min-w-0">
              <Pin className="h-3.5 w-3.5 text-[#FF6B00] rotate-45 shrink-0" />
              <div className="truncate text-[#FF6B00]">
                <span>Pesan Disematkan: </span>
                <span className="text-slate-600 dark:text-slate-300">{pinnedMessages[pinnedMessages.length - 1].message}</span>
              </div>
            </div>
            <button onClick={() => handleTogglePinSingle(pinnedMessages[pinnedMessages.length - 1].id)} className="text-slate-400 hover:text-red-500 text-[9px] shrink-0 font-black">
              LEPAS
            </button>
          </div>
        )}

        {/* CORE CHAT MESSAGES PANEL */}
        <div 
          ref={messagesContainerRef}
          className={`flex-1 overflow-y-auto p-4 space-y-4 min-h-0 relative ${getWallpaperClass()}`}
          style={{
            backgroundImage: chatWallpaper === 'classic-doodle'
              ? 'radial-gradient(circle, rgba(0,0,0,0.035) 1px, transparent 1px)'
              : undefined,
            backgroundSize: '16px 16px'
          }}
        >
          {isChatLoading ? (
            <div className="space-y-4 py-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className={`flex items-start gap-2.5 max-w-[70%] ${n % 2 === 0 ? 'ml-auto flex-row-reverse' : ''}`}>
                  <div className="h-8 w-8 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse flex-shrink-0" />
                  <div className="space-y-2 w-full">
                    <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                    <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Load historical trigger */}
              <div className="flex justify-center py-2 shrink-0">
                <button
                  type="button"
                  onClick={handleLoadHistory}
                  disabled={isHistoryLoading}
                  className={`px-4 py-2 rounded-full border border-slate-200/60 dark:border-slate-800 bg-white/90 dark:bg-slate-900 text-[11px] font-black tracking-tight shadow-sm hover:bg-[#FF6B00] hover:text-white hover:border-none cursor-pointer transition-all ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}
                >
                  {isHistoryLoading ? 'Menghubungkan Riwayat...' : 'Muat Riwayat Obrolan Terdahulu'}
                </button>
              </div>

              {/* Day badges */}
              <div className="flex justify-center my-3">
                <span className="px-3 py-1 bg-slate-200/50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-[9px] font-black tracking-wider uppercase rounded-full">
                  Hari Ini
                </span>
              </div>

              {processedFilteredMessages.length === 0 ? (
                <div className="text-center py-12 px-6 space-y-2">
                  <span className="text-4xl animate-bounce inline-block">🤝</span>
                  <p className="text-xs text-slate-400 font-bold">Belum ada pesan yang cocok dengan filter aktif.</p>
                </div>
              ) : (
                processedFilteredMessages.map((msg) => {
                  const isOwn = msg.senderId === currentUser.id;
                  const offset = swipeOffset[msg.id] || 0;
                  const isSelected = selectedMessageIds.includes(msg.id);

                  return (
                    <div 
                      key={msg.id}
                      onTouchStart={(e) => handleTouchStart(e, msg.id)}
                      onTouchMove={(e) => handleTouchMove(e, msg.id)}
                      onTouchEnd={() => handleTouchEnd(msg.id)}
                      onMouseDown={(e) => handleMouseDown(e, msg.id)}
                      onMouseMove={(e) => handleMouseMove(e, msg.id)}
                      onMouseUp={() => handleMouseUpOrLeave(msg.id)}
                      onMouseLeave={() => handleMouseUpOrLeave(msg.id)}
                      className={`flex gap-2.5 max-w-[75%] group relative select-none transition-transform duration-100 ${
                        isOwn ? 'ml-auto flex-row-reverse' : ''
                      } ${isSelected ? 'bg-orange-500/10 dark:bg-orange-500/20 -mx-4 px-4 py-1.5' : ''}`}
                      style={{ transform: `translateX(${offset}px)` }}
                    >
                      {/* Swipe Visual Indicator background */}
                      {offset > 0 && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 p-2 bg-emerald-500 text-white rounded-full animate-pulse transition-opacity">
                          <CornerUpLeft className="h-4.5 w-4.5" />
                        </div>
                      )}

                      {/* Multi select checkbox toggle */}
                      {isMultiSelectMode && (
                        <button
                          type="button"
                          onClick={() => handleToggleSelectMessage(msg.id)}
                          className={`h-5 w-5 rounded-md border flex items-center justify-center flex-shrink-0 self-center transition-all ${
                            isSelected ? 'bg-[#FF6B00] border-[#FF6B00] text-white' : 'border-slate-300 dark:border-slate-600 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                        </button>
                      )}

                      {/* Avatar */}
                      <img 
                        src={msg.senderAvatar} 
                        alt="avatar" 
                        className="h-8 w-8 rounded-xl object-cover flex-shrink-0 border border-slate-100 dark:border-slate-800 shadow-sm" 
                        onClick={() => {
                          if (isMultiSelectMode) {
                            handleToggleSelectMessage(msg.id);
                          } else {
                            setSelectedMessageForMenu(msg);
                            setShowLongPressModal(true);
                          }
                        }}
                      />

                      {/* Bubble block */}
                      <div className="space-y-1 max-w-full">
                        
                        {/* Header details */}
                        <div className={`flex items-center gap-2 text-[10px] text-slate-400 font-bold ${isOwn ? 'justify-end flex-row-reverse' : ''}`}>
                          <span>{msg.senderName}</span>
                          {msg.isStarred && <Star className="h-3 w-3 text-amber-500 fill-current" />}
                          {msg.isPinned && <Pin className="h-3 w-3 text-[#FF6B00]" />}
                          {msg.isEdited && <span className="text-[9px] text-slate-400 font-semibold italic">(Diedit)</span>}
                        </div>

                        {/* Interactive speech bubble */}
                        <div 
                          className={`p-3.5 rounded-2xl shadow-sm relative overflow-hidden transition-colors cursor-pointer ${getFontSizeClass()} ${
                            isOwn 
                              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-tr-none' 
                              : (isDarkMode ? 'bg-slate-900 text-white border border-slate-800 rounded-tl-none' : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none')
                          }`}
                          onDoubleClick={() => handleToggleStarSingle(msg.id)}
                          onClick={() => {
                            if (isMultiSelectMode) {
                              handleToggleSelectMessage(msg.id);
                            }
                          }}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            setSelectedMessageForMenu(msg);
                            setShowLongPressModal(true);
                          }}
                        >
                          {/* Replied Preview */}
                          {msg.replyTo && (
                            <div className={`mb-2 p-2 rounded-xl border text-[10px] font-semibold leading-relaxed border-l-4 ${
                              isOwn 
                                ? 'bg-orange-700/30 border-orange-300 text-white border-l-orange-400' 
                                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 border-l-[#FF6B00]'
                            }`}>
                              <p className="font-black text-[9.5px] mb-0.5">{msg.replyTo.senderName}</p>
                              <p className="truncate">{msg.replyTo.message}</p>
                            </div>
                          )}

                          {/* Message Text with highlight support */}
                          <p className="leading-relaxed font-semibold whitespace-pre-wrap break-words">
                            {renderHighlightedText(msg.message, searchQuery)}
                          </p>

                          {/* 1. PHOTO */}
                          {msg.file?.type === 'image' && (
                            <div className="mt-2 rounded-xl overflow-hidden border border-slate-200/20 shadow-md relative cursor-zoom-in" onClick={() => setLightboxImage({ url: msg.file!.url, title: msg.file!.name })}>
                              <img src={msg.file.url} alt="Attached Preview" className="w-full max-h-48 object-cover hover:scale-105 transition-transform duration-300" />
                              <div className="absolute bottom-2 right-2 bg-slate-900/85 px-2 py-1 rounded text-[9px] font-bold text-white">
                                Pratinjau Foto
                              </div>
                            </div>
                          )}

                          {/* 2. PDF & DOCUMENTS */}
                          {msg.file && (msg.file.type === 'pdf' || msg.file.type === 'excel' || msg.file.type === 'proposal') && (
                            <div className={`mt-2.5 p-2 rounded-xl border flex items-center justify-between gap-3 ${
                              isOwn 
                                ? 'bg-orange-700/30 border-orange-400 text-white' 
                                : 'bg-slate-50 dark:bg-slate-800 border-[#FFD54F]/25 text-slate-800 dark:text-slate-100'
                            }`}>
                              <div className="flex items-center gap-1.5 min-w-0">
                                <FileText className="h-5 w-5 flex-shrink-0 text-[#FF6B00]" />
                                <div className="min-w-0">
                                  <p className="font-bold truncate text-[11px] leading-tight">{msg.file.name}</p>
                                  <p className="text-[9px] text-slate-400 font-bold leading-none mt-0.5">DOKUMEN • 1.2 MB</p>
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (msg.file?.url && (msg.file.url.startsWith('data:') || msg.file.url.startsWith('blob:'))) {
                                    const link = document.createElement('a');
                                    link.href = msg.file.url;
                                    link.download = msg.file.name;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                  } else {
                                    exportToPDF(msg.message, { title: msg.file?.name || 'Dokumen_BCI' });
                                  }
                                }}
                                className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-1 cursor-pointer transition-all ${
                                  isOwn ? 'bg-white text-[#FF6B00] hover:bg-orange-50' : 'bg-[#FF6B00] text-white hover:bg-orange-600'
                                }`}
                                title="Unduh File PDF"
                              >
                                <Download className="h-3.5 w-3.5" />
                                <span>Unduh PDF</span>
                              </button>
                            </div>
                          )}

                          {/* 3. LOCATION PIN MAP */}
                          {msg.location && (
                            <div className={`mt-2 rounded-xl border overflow-hidden ${isOwn ? 'bg-orange-700/25 border-orange-400 text-white' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100'}`}>
                              <div className="p-2.5 flex items-start gap-2 text-[10.5px]">
                                <MapPin className="h-5 w-5 text-red-500 flex-shrink-0" />
                                <div>
                                  <p className="font-black">Lokasi Pabrik Utama</p>
                                  <p className="text-[9.5px] opacity-80 mt-0.5">{msg.location.address}</p>
                                </div>
                              </div>
                              <div className="h-24 bg-slate-200 dark:bg-slate-700 relative">
                                <div className="absolute inset-0 bg-cover bg-center opacity-70" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=300")' }}></div>
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10">
                                  <div className="h-8 w-8 rounded-full bg-red-500 border-2 border-white flex items-center justify-center text-white font-black animate-bounce">
                                    📍
                                  </div>
                                </div>
                              </div>
                              <button 
                                onClick={() => alert('Membuka Google Maps.')}
                                className="w-full text-center py-2 text-[10px] font-black tracking-wider border-t border-slate-200 dark:border-slate-700 bg-white/50 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors uppercase"
                              >
                                Rute Logistik
                              </button>
                            </div>
                          )}

                          {/* 4. VOICE NOTE PLAYBACK */}
                          {msg.voiceNote && (
                            <div className="mt-2.5 flex items-center gap-2.5 w-48 sm:w-56 text-xs select-none">
                              <button
                                onClick={() => setPlayingVoiceId(playingVoiceId === msg.id ? null : msg.id)}
                                className={`h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer transition-transform active:scale-90 ${
                                  isOwn ? 'bg-white text-[#FF6B00]' : 'bg-[#FF6B00] text-white'
                                }`}
                              >
                                {playingVoiceId === msg.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
                              </button>
                              
                              <div className="flex-1 flex items-end gap-0.5 h-6">
                                {msg.voiceNote.waveData.map((h, i) => {
                                  const isActive = playingVoiceId === msg.id && i < (voicePlaybackProgress / 5);
                                  return (
                                    <div 
                                      key={i} 
                                      className="flex-1 rounded-full transition-all" 
                                      style={{ 
                                        height: `${h}%`,
                                        backgroundColor: isActive 
                                          ? (isOwn ? '#FFFFFF' : '#FF6B00') 
                                          : (isOwn ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.2)')
                                      }}
                                    />
                                  );
                                })}
                              </div>

                              {/* Multi-speed modifier button */}
                              <button
                                onClick={() => handleToggleVoiceSpeed(msg.id)}
                                className={`text-[9px] px-1.5 py-0.5 rounded font-black shrink-0 transition-colors ${
                                  isOwn ? 'bg-orange-800/40 text-white' : 'bg-slate-200 dark:bg-slate-800 text-[#FF6B00]'
                                }`}
                                title="Ganti Kecepatan Putar"
                              >
                                {voiceSpeed[msg.id] || 1}x
                              </button>
                            </div>
                          )}

                          {/* Emoji Reactions display */}
                          {msg.reactions && msg.reactions.length > 0 && (
                            <div className="absolute -bottom-2 right-2 flex items-center gap-1 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-100 dark:border-slate-700 shadow-sm text-[10px]">
                              {msg.reactions.map((r, i) => (
                                <span key={i}>{r.emoji} <span className="text-slate-400 font-bold">{r.count}</span></span>
                              ))}
                            </div>
                          )}

                        </div>

                        {/* Timestamp & receipt ticks */}
                        <div className={`flex items-center gap-1 text-[9px] text-slate-400 font-bold ${isOwn ? 'justify-end' : ''}`}>
                          <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {isOwn && (
                            msg.status === 'read' ? (
                              <CheckCheck className="h-3.5 w-3.5 text-blue-500" />
                            ) : msg.status === 'delivered' ? (
                              <CheckCheck className="h-3.5 w-3.5 text-slate-400" />
                            ) : (
                              <Check className="h-3.5 w-3.5 text-slate-400" />
                            )
                          )}
                        </div>

                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing indicator */}
              {typingPartner && (
                <div className="flex gap-2.5 max-w-[60%] text-xs items-center animate-fade-in">
                  <img src={activeChatInfo.avatar} alt="avatar" className="h-8 w-8 rounded-xl object-cover border border-slate-100 shadow-sm" />
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
                    <span className="text-[10.5px] font-bold text-slate-500 dark:text-slate-300">Sedang Mengetik</span>
                    <span className="flex gap-1">
                      <span className="h-1.5 w-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="h-1.5 w-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="h-1.5 w-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* REPLY PREVIEW DRAWER */}
        {replyingTo && (
          <div className={`px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs animate-fade-in shrink-0 ${isDarkMode ? 'bg-slate-900' : 'bg-orange-50/40'}`}>
            <div className="border-l-4 border-[#FF6B00] pl-2 min-w-0">
              <p className="font-black text-[#FF6B00] text-[10px]">Membalas Pesan {replyingTo.senderName}</p>
              <p className="truncate text-slate-500 dark:text-slate-300">{replyingTo.message}</p>
            </div>
            <button onClick={() => setReplyingTo(null)} className="p-1 rounded-full text-slate-400 hover:text-red-500">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* UPLOADING PROGRESS INDICATOR */}
        {isUploading && (
          <div className={`p-3.5 border-t border-slate-100 dark:border-slate-800 space-y-2 animate-fade-in shrink-0 ${isDarkMode ? 'bg-slate-900' : 'bg-orange-50/45'}`}>
            <div className="flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-[#FF6B00] border-t-transparent rounded-full animate-spin"></span>
                <p className="text-[#FF6B00]">Memproses berkas lampiran...</p>
              </div>
              <span className="font-mono text-[11px] text-slate-500">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 h-full transition-all duration-100" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        )}

        {/* READY TO SEND ATTACHMENTS PREVIEW CARDS */}
        {!isUploading && (attachedFile || attachedLocation || attachedVoice) && (
          <div className={`p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold animate-fade-in shrink-0 ${isDarkMode ? 'bg-slate-900 text-amber-500' : 'bg-[#FFFDF7] text-[#FF6B00]'}`}>
            <div className="flex items-center gap-3">
              {attachedFile?.type === 'image' && (
                <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-200/50 bg-slate-100 flex-shrink-0">
                  <img src={attachedFile.url} alt="thumbnail" className="h-full w-full object-cover" />
                </div>
              )}
              {(attachedFile?.type === 'pdf' || attachedFile?.type === 'excel' || attachedFile?.type === 'proposal') && (
                <div className="h-10 w-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-[#FF6B00]" />
                </div>
              )}
              {attachedVoice && (
                <div className="h-10 w-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <Mic className="h-5 w-5 text-[#FF6B00]" />
                </div>
              )}
              {attachedLocation && (
                <div className="h-10 w-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-red-500" />
                </div>
              )}

              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Siap Dikirim</p>
                <p className={`truncate max-w-[180px] sm:max-w-[280px] text-[11.5px] font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  {attachedFile ? attachedFile.name : attachedLocation ? 'Lokasi Pabrik Utama' : `Rekaman Suara (${attachedVoice?.duration})`}
                </p>
              </div>
            </div>
            <button 
              onClick={() => { setAttachedFile(null); setAttachedLocation(null); setAttachedVoice(null); }}
              className="text-slate-400 hover:text-red-500 cursor-pointer transition-colors p-2 rounded-xl hover:bg-slate-100"
              title="Hapus Lampiran"
            >
              <Trash2 className="h-4.5 w-4.5" />
            </button>
          </div>
        )}

        {/* STICKY ACTIVE VOICE RECORDER DRIVER BAR */}
        {isVoiceRecordingActive && (
          <div className="shrink-0 z-30">
            <ChatVoiceRecorder
              onCancel={() => setIsVoiceRecordingActive(false)}
              onSend={(dur, wave) => {
                setAttachedVoice({ duration: dur, waveData: wave });
                setIsVoiceRecordingActive(false);
              }}
            />
          </div>
        )}

        {/* EMOJI & STICKER PICKER DRIVER SHEET */}
        {showEmojiPicker && (
          <div className="absolute bottom-20 left-4 bg-white dark:bg-slate-900 p-3.5 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 z-40 max-w-xs animate-fade-in shrink-0">
            <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-100">
              <span className="font-black text-[10px] text-[#FF6B00] uppercase tracking-wider">Emoji & BCI Stiker</span>
              <button onClick={() => setShowEmojiPicker(false)} className="text-slate-400 hover:text-red-500"><X className="h-4 w-4" /></button>
            </div>
            
            {/* Quick Emojis Grid */}
            <div className="grid grid-cols-5 gap-2.5 pb-2.5">
              {['👍', '🔥', '🤝', '👏', '✅', '😂', '💡', '💯', '📋', '🌟'].map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleInsertSticker(emoji)}
                  className="hover:scale-130 text-xl p-1 transition-transform cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* BCI Custom Business Stickers */}
            <div className="border-t border-slate-50 pt-2 space-y-1.5 text-[10px] font-black">
              <p className="text-[9px] text-slate-400 uppercase tracking-widest mb-1.5">Stiker Cepat Bisnis</p>
              <div className="grid grid-cols-2 gap-1.5">
                {['Deal Setuju 🤝', 'Kirim Invoice 📋', 'TKDN Tinggi ✅', 'Siap Logistik 🚛'].map(sticker => (
                  <button
                    key={sticker}
                    type="button"
                    onClick={() => {
                      setTypedMessage(sticker);
                      setShowEmojiPicker(false);
                    }}
                    className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 text-center hover:bg-orange-500/10 hover:text-[#FF6B00]"
                  >
                    {sticker}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* QUICK ATTACHMENTS MENU */}
        {showAttachMenu && (
          <div className="absolute bottom-20 left-12 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-4 z-40 grid grid-cols-2 gap-3.5 w-72 animate-fade-in text-xs shrink-0 font-bold">
            <button
              onClick={() => {
                setShowAttachMenu(false);
                setIsDocModalOpen(true);
              }}
              className="col-span-2 flex items-center justify-center gap-2 p-3 rounded-2xl bg-gradient-to-r from-[#FFC107] to-[#FF6B00] text-white font-black text-xs shadow-md shadow-orange-500/20 cursor-pointer transition-all hover:brightness-110"
            >
              <FileText className="h-5 w-5" />
              <span>📄 Buat PO, Surat Penawaran & Invoice (PDF)</span>
            </button>

            <button
              onClick={() => handleAttachMockFile('pdf')}
              className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-red-50 hover:bg-red-100/70 dark:bg-red-950/20 dark:hover:bg-red-900/30 text-red-600 cursor-pointer transition-all"
            >
              <FileText className="h-5 w-5" />
              <span className="font-bold text-[10.5px]">Dokumen NIB</span>
            </button>
            <button
              onClick={() => handleAttachMockFile('excel')}
              className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100/70 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/30 text-emerald-600 cursor-pointer transition-all"
            >
              <FileSpreadsheet className="h-5 w-5" />
              <span className="font-bold text-[10.5px]">RAB Anggaran</span>
            </button>
            <button
              onClick={() => handleAttachMockFile('image')}
              className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-blue-50 hover:bg-blue-100/70 dark:bg-blue-950/20 dark:hover:bg-blue-900/30 text-blue-600 cursor-pointer transition-all"
            >
              <ImageIcon className="h-5 w-5" />
              <span className="font-bold text-[10.5px]">Foto Produk</span>
            </button>
            <button
              onClick={() => handleAttachMockFile('location')}
              className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-amber-50 hover:bg-amber-100/70 dark:bg-amber-950/20 dark:hover:bg-amber-900/30 text-[#FF6B00] cursor-pointer transition-all"
            >
              <MapPin className="h-5 w-5" />
              <span className="font-bold text-[10.5px]">Lokasi Gudang</span>
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="col-span-2 flex items-center justify-center gap-2 p-3 rounded-2xl bg-orange-500/10 hover:bg-orange-500/20 text-[#FF6B00] border border-dashed border-orange-500/40 cursor-pointer transition-all font-black text-[11px]"
            >
              <Upload className="h-5 w-5" />
              <span>Unggah dari Perangkat</span>
            </button>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleRealFileUpload} 
              accept="image/*,video/*,.pdf,.xlsx,.xls,.csv"
            />
          </div>
        )}

        {/* BOTTOM STICKY INPUT BAR */}
        {!isVoiceRecordingActive && (
          <div className={`p-3.5 pb-safe border-t border-slate-100 bg-white space-y-3 shrink-0 relative z-30 shadow-lg ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center gap-2">
              
              <button
                type="button"
                onClick={() => {
                  setShowEmojiPicker(!showEmojiPicker);
                  setShowAttachMenu(false);
                }}
                className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300 cursor-pointer active:scale-95 transition-all flex-shrink-0"
                title="Emoji & Stiker"
              >
                <Smile className="h-5.5 w-5.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowAttachMenu(!showAttachMenu);
                  setShowEmojiPicker(false);
                }}
                className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300 cursor-pointer active:scale-95 transition-all flex-shrink-0"
                title="Pilih Lampiran"
              >
                <Paperclip className="h-5.5 w-5.5" />
              </button>

              <form 
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} 
                className="flex-1 flex gap-2 items-center"
              >
                <input
                  type="text"
                  placeholder={editingMessageId ? "Edit pesan Anda..." : "Ketik pesan penawaran resmi..."}
                  value={typedMessage}
                  onChange={e => setTypedMessage(e.target.value)}
                  className={`flex-1 text-sm outline-none border rounded-full px-4.5 py-3 transition-all font-semibold placeholder:text-slate-400/80 min-h-[46px] ${
                    isDarkMode 
                      ? 'bg-slate-800 border-slate-700 text-white focus:bg-slate-900 focus:border-[#FFC107]' 
                      : 'bg-slate-50/70 border-slate-200 text-slate-800 focus:bg-white focus:border-[#FF6B00]'
                  }`}
                />

                {/* Send or Voice toggles */}
                {typedMessage.trim() || attachedFile || attachedLocation || attachedVoice || editingMessageId ? (
                  <button
                    type="submit"
                    className="h-[46px] w-[46px] rounded-full bg-gradient-to-r from-amber-500 to-orange-600 hover:brightness-110 active:scale-95 text-white shadow-md shadow-orange-500/20 cursor-pointer flex items-center justify-center transition-transform flex-shrink-0"
                    title={editingMessageId ? "Perbarui" : "Kirim"}
                  >
                    <Send className="h-5 w-5 fill-current ml-0.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsVoiceRecordingActive(true)}
                    className="h-[46px] w-[46px] rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-orange-500/10 hover:text-[#FF6B00] text-slate-500 dark:text-slate-300 cursor-pointer active:scale-95 flex items-center justify-center transition-all flex-shrink-0"
                    title="Rekam Suara"
                  >
                    <Mic className="h-5 w-5" />
                  </button>
                )}
              </form>

            </div>
          </div>
        )}

      </div>

      {/* MODULAR COMPONENT CONNECTORS */}
      
      {/* 1. SETTINGS MODAL */}
      <ChatSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        wallpaper={chatWallpaper}
        onChangeWallpaper={setChatWallpaper}
        fontSize={chatFontSize}
        onChangeFontSize={setChatFontSize}
        disappearingMessages={disappearingMessages}
        onChangeDisappearing={setDisappearingMessages}
      />

      {/* 2. LONG PRESS / RIGHT CLICK OPTIONS SHEET */}
      <ChatLongPressMenu
        isOpen={showLongPressModal}
        onClose={() => { setShowLongPressModal(false); setSelectedMessageForMenu(null); }}
        message={selectedMessageForMenu}
        currentUserId={currentUser.id}
        onReply={() => setReplyingTo(selectedMessageForMenu)}
        onForward={() => setShowForwardModal(true)}
        onCopy={() => handleCopyMessageText(selectedMessageForMenu!)}
        onEdit={() => {
          setEditingMessageId(selectedMessageForMenu!.id);
          setTypedMessage(selectedMessageForMenu!.message);
        }}
        onDeleteForMe={() => handleDeleteMessageRequest(selectedMessageForMenu!.id, 'me')}
        onDeleteForEveryone={() => handleDeleteMessageRequest(selectedMessageForMenu!.id, 'everyone')}
        onTogglePin={() => handleTogglePinSingle(selectedMessageForMenu!.id)}
        onToggleStar={() => handleToggleStarSingle(selectedMessageForMenu!.id)}
        onViewInfo={() => { setMsgInfoTarget(selectedMessageForMenu); setShowMsgInfoModal(true); }}
        onShare={() => alert(`Membagikan pesan: "${selectedMessageForMenu?.message}"`)}
        onAddReaction={(emoji) => handleAddReaction(emoji, selectedMessageForMenu!.id)}
      />

      {/* 3. MULTI-FORWARD CHAT TARGET MODAL */}
      <ChatForwardModal
        isOpen={showForwardModal}
        onClose={() => { setShowForwardModal(false); }}
        participants={chatParticipants}
        onForwardDone={handleForwardDone}
      />

      {/* 4. DETAILED MESSAGE INFO TIMELINE MODAL */}
      {showMsgInfoModal && msgInfoTarget && (
        <div className="absolute inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 animate-fade-in text-xs font-semibold">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-5 space-y-4 animate-zoom-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-slate-900 dark:text-white text-sm">Informasi Detil Pesan</h3>
              <button onClick={() => { setShowMsgInfoModal(false); setMsgInfoTarget(null); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="space-y-3 text-slate-800 dark:text-slate-200">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1">Isi Pesan</p>
                <p className="font-bold leading-relaxed">{msgInfoTarget.message}</p>
              </div>

              {/* Status Timelines */}
              <div className="space-y-3.5 pt-2">
                <div className="flex items-start gap-3">
                  <span className="p-1 rounded-full bg-blue-500/10 text-blue-500 mt-0.5">
                    <CheckCheck className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-black text-slate-900 dark:text-white leading-none">Dibaca</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">Hari ini, {new Date(msgInfoTarget.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 border-l-2 border-slate-100 dark:border-slate-800 ml-3.5 pl-3 pb-3">
                  <span className="p-1 rounded-full bg-slate-500/10 text-slate-400 mt-0.5">
                    <CheckCheck className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-black text-slate-700 dark:text-slate-300 leading-none">Terkirim & Diterima</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">Hari ini, {new Date(new Date(msgInfoTarget.timestamp).getTime() - 2500).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. CONFIRM DELETE DIALOGS */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 animate-fade-in text-xs font-black">
          <div className="w-full max-w-xs bg-white dark:bg-slate-900 rounded-3xl p-5 space-y-4 border border-slate-100 dark:border-slate-800 animate-zoom-in text-center shadow-2xl">
            <span className="text-3xl animate-pulse inline-block">⚠️</span>
            <div className="space-y-1">
              <h4 className="text-slate-900 dark:text-white font-black text-sm">Hapus Obrolan?</h4>
              <p className="text-slate-500 dark:text-slate-400 text-[10.5px] font-bold leading-relaxed">
                {deleteConfirmScope === 'conversation' 
                  ? 'Apakah Anda yakin ingin menghapus seluruh isi percakapan ini?' 
                  : 'Tindakan ini akan menghapus pesan terpilih secara permanen.'}
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmTargetId(null); }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleExecuteDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white cursor-pointer"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. B2B DOCUMENT GENERATOR MODAL */}
      <DocumentGeneratorModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        defaultRecipientCompany={activeChatInfo?.name || 'PT Industri Maju Bersama'}
        defaultRecipientName={activeChatInfo?.role || 'Budi Santoso'}
        onSendToChat={handleSendDocToChat}
      />

    </div>
  );
}
