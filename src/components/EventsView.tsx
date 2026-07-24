import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  CheckCircle2,
  Download,
  ExternalLink,
  Plus,
  Search,
  Sparkles,
  RefreshCw,
  FileText,
  Users,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Share2,
  Zap,
  Building2,
  Check,
  AlertCircle
} from 'lucide-react';
import { AppDatabase, BusinessEvent, User } from '../types';

interface EventsViewProps {
  db: AppDatabase;
  currentUser: User;
  onRefresh: () => void;
  onViewChange?: (view: string) => void;
}

type EventCategoryFilter = 'Semua' | 'Kegiatan Bisnis' | 'Temu Matching' | 'Tenggat Tender';

export default function EventsView({ db, currentUser, onRefresh, onViewChange }: EventsViewProps) {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date(2026, 7, 1)); // August 2026
  const [selectedCategory, setSelectedCategory] = useState<EventCategoryFilter>('Semua');
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'calendar' | 'list'>('calendar');

  // Add Event Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [evtTitle, setEvtTitle] = useState('');
  const [evtType, setEvtType] = useState<BusinessEvent['type']>('Seminar');
  const [evtDate, setEvtDate] = useState('2026-08-15');
  const [evtTime, setEvtTime] = useState('10:00 - 12:00 WIB');
  const [evtLoc, setEvtLoc] = useState('Jakarta / Live Stream Zoom');
  const [evtDesc, setEvtDesc] = useState('');
  const [evtOrganizer, setEvtOrganizer] = useState(currentUser.name || 'Member BCI');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync Feedback Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Consolidate All Scheduled Activities
  const consolidatedItems = [
    // 1. Business Events
    ...db.events.map(e => ({
      id: e.id,
      title: e.title,
      type: e.type,
      category: 'Kegiatan Bisnis' as const,
      date: e.date,
      time: e.time,
      location: e.location,
      description: e.description,
      organizer: e.organizer,
      image: e.image,
      isSynced: e.isSynced || false,
      rawItem: e
    })),
    // 2. Tender Deadlines
    ...db.tenders.map(t => ({
      id: `tender_${t.id}`,
      title: `[Tenggat Tender] ${t.title}`,
      type: 'Tender' as const,
      category: 'Tenggat Tender' as const,
      date: t.deadline || '2026-08-30',
      time: '23:59 WIB',
      location: t.location || 'Nasional',
      description: `Batas akhir penyerahan berkas proposal tender senilai Rp${t.value.toLocaleString('id-ID')} untuk ${t.companyName}.`,
      organizer: t.companyName,
      image: t.companyLogo,
      isSynced: false,
      rawItem: t
    })),
    // 3. Business Matching Sessions
    {
      id: 'match_1',
      title: 'Sesi Temu Matching B2B: Manufaktur & Supplier Alat Berat',
      type: 'Business Matching' as const,
      category: 'Temu Matching' as const,
      date: '2026-08-04',
      time: '13:00 - 15:30 WIB',
      location: 'BCI Executive Virtual Room #2',
      description: 'Pertemuan langsung antara vendor alat berat terverifikasi dengan pembeli potensial sektor infrastruktur.',
      organizer: 'AI Matching Engine BCI',
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=400',
      isSynced: true
    },
    {
      id: 'match_2',
      title: 'Temu Investor & Startup Teknologi Energi Terbarukan',
      type: 'Business Matching' as const,
      category: 'Temu Matching' as const,
      date: '2026-08-18',
      time: '14:00 - 16:30 WIB',
      location: 'Grand Ballroom Jakarta & Zoom',
      description: 'Forum penjajakan pendanaan dan kolaborasi teknologi ramah lingkungan dengan jaringan investor BCI.',
      organizer: 'Lestari Ventures & BCI',
      image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=400',
      isSynced: false
    }
  ];

  // Filter Items
  const filteredItems = consolidatedItems.filter(item => {
    const matchesCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.organizer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = !selectedDateStr || item.date === selectedDateStr;
    return matchesCategory && matchesSearch && matchesDate;
  });

  // Calendar Helpers
  const year = selectedMonth.getFullYear();
  const month = selectedMonth.getMonth(); // 0-indexed
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sun, 1 is Mon...
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const handlePrevMonth = () => {
    setSelectedMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedMonth(new Date(year, month + 1, 1));
  };

  // Helper to format date string YYYY-MM-DD
  const formatDateString = (day: number) => {
    const m = (month + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  // Download Single .ics File
  const handleDownloadIcs = (item: typeof consolidatedItems[0]) => {
    const cleanDate = item.date.replace(/-/g, '');
    const dtStart = `${cleanDate}T090000Z`;
    const dtEnd = `${cleanDate}T170000Z`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Business Connect Indonesia (BCI)//Calendar Sync//ID',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:bci-${item.id}-${Date.now()}@bci.id`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${item.title}`,
      `DESCRIPTION:${item.description.replace(/\n/g, ' ')}`,
      `LOCATION:${item.location}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${item.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`File iCal (.ics) untuk "${item.title}" berhasil diunduh! Silakan buka file untuk menyinkronkan dengan kalender lokal perangkat Anda.`);
  };

  // Download Bulk .ics File for All Filtered Schedule
  const handleDownloadBulkIcs = () => {
    if (filteredItems.length === 0) return;

    const vevents = filteredItems.map((item, idx) => {
      const cleanDate = item.date.replace(/-/g, '');
      const dtStart = `${cleanDate}T090000Z`;
      const dtEnd = `${cleanDate}T170000Z`;
      return [
        'BEGIN:VEVENT',
        `UID:bci-bulk-${idx}-${Date.now()}@bci.id`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:${item.title}`,
        `DESCRIPTION:${item.description.replace(/\n/g, ' ')}`,
        `LOCATION:${item.location}`,
        'STATUS:CONFIRMED',
        'END:VEVENT'
      ].join('\r\n');
    }).join('\r\n');

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Business Connect Indonesia (BCI)//Calendar Sync//ID',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      vevents,
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `jadwal-kegiatan-bci-${selectedCategory.toLowerCase().replace(/ /g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Berhasil mengekspor ${filteredItems.length} agenda kegiatan ke file iCal (.ics)!`);
  };

  // Google Calendar URL Generator
  const getGoogleCalendarUrl = (item: typeof consolidatedItems[0]) => {
    const cleanDate = item.date.replace(/-/g, '');
    const dates = `${cleanDate}T090000Z/${cleanDate}T170000Z`;
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: item.title,
      dates: dates,
      details: `${item.description}\n\nPenyelenggara: ${item.organizer}\nDisinkronkan via Business Connect Indonesia (BCI)`,
      location: item.location
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  // Outlook Web Calendar URL Generator
  const getOutlookCalendarUrl = (item: typeof consolidatedItems[0]) => {
    const params = new URLSearchParams({
      path: '/calendar/action/compose',
      rru: 'addevent',
      subject: item.title,
      startdt: `${item.date}T09:00:00Z`,
      enddt: `${item.date}T17:00:00Z`,
      body: `${item.description}\n\nPenyelenggara: ${item.organizer}\nDisinkronkan via BCI`,
      location: item.location
    });
    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
  };

  // Toggle Sync Status with Backend
  const handleToggleSync = async (item: typeof consolidatedItems[0]) => {
    if (item.category === 'Kegiatan Bisnis') {
      try {
        const res = await fetch('/api/events/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId: item.id, userEmail: currentUser.email })
        });
        if (res.ok) {
          onRefresh();
          showToast(`Status sinkronisasi kalender lokal untuk "${item.title}" diperbarui.`);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      showToast(`Jadwal "${item.title}" siap disinkronkan ke kalender perangkat Anda.`);
    }
  };

  // Submit New Business Event Form
  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evtTitle || !evtDate) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/events/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: evtTitle,
          type: evtType,
          date: evtDate,
          time: evtTime,
          location: evtLoc,
          description: evtDesc,
          organizer: evtOrganizer
        })
      });

      if (res.ok) {
        setShowAddModal(false);
        setEvtTitle('');
        setEvtDesc('');
        onRefresh();
        showToast('Agenda kegiatan bisnis baru berhasil ditambahkan dan disinkronkan ke kalender!');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 max-w-md bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-amber-500/30 flex items-start gap-3 backdrop-blur-md"
          >
            <div className="p-1.5 rounded-xl bg-gradient-to-tr from-[#FF6B00] to-[#FFC107] text-white flex-shrink-0">
              <Zap className="h-4 w-4 fill-current" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-xs text-amber-300">Integrasi Kalender Lokal BCI</p>
              <p className="text-xs text-slate-200 mt-0.5 leading-relaxed font-semibold">{toastMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner & Local Calendar Sync Controls */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="glass-card rounded-3xl p-6 shadow-md glossy-top-highlight space-y-4 border border-white/60"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-[#FFC107] text-white flex items-center justify-center shadow-lg shadow-orange-500/20 flex-shrink-0">
              <CalendarIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-black text-slate-900 text-lg">Kalender & Agenda Bisnis BCI</h2>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-emerald-200">
                  Direct Calendar Sync Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 font-bold mt-0.5">
                Sinkronkan jadwal expo, seminar, temu matching B2B, dan tenggat waktu proposal tender langsung ke Apple Calendar, Google Calendar, & Outlook
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleDownloadBulkIcs}
              className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Download className="h-4 w-4 text-[#FFC107]" />
              <span>Ekspor Semua (.ics)</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#FFC107] to-[#FF6B00] hover:brightness-110 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Agenda Bisnis</span>
            </motion.button>
          </div>
        </div>

        {/* Sync Status Info Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 bg-orange-50/70 rounded-2xl border border-orange-100 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#FF6B00] text-white">
              <CalendarDays className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[9.5px] font-black text-orange-600 uppercase tracking-wider">Kegiatan Bisnis</p>
              <p className="text-xs font-black text-slate-900">
                {consolidatedItems.filter(i => i.category === 'Kegiatan Bisnis').length} Event Terdaftar
              </p>
            </div>
          </div>

          <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-100 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-600 text-white">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[9.5px] font-black text-emerald-600 uppercase tracking-wider">Temu Business Matching</p>
              <p className="text-xs font-black text-slate-900">
                {consolidatedItems.filter(i => i.category === 'Temu Matching').length} Sesi Terjadwal
              </p>
            </div>
          </div>

          <div className="p-3 bg-rose-50/70 rounded-2xl border border-rose-100 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-600 text-white">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[9.5px] font-black text-rose-600 uppercase tracking-wider">Tenggat Proposal Tender</p>
              <p className="text-xs font-black text-slate-900">
                {consolidatedItems.filter(i => i.category === 'Tenggat Tender').length} Batas Deadline
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Navigation Controls & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Category Filter Chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {(['Semua', 'Kegiatan Bisnis', 'Temu Matching', 'Tenggat Tender'] as EventCategoryFilter[]).map(cat => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setSelectedDateStr(null);
              }}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap shadow-xs border ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-[#FFC107] to-[#FF6B00] text-white border-none shadow-md shadow-orange-500/20'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* View Switcher & Search */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari acara, lokasi, instansi..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-2xl border border-slate-200 bg-white text-xs font-bold text-slate-800 placeholder-slate-400 outline-none focus:border-[#FF6B00] shadow-xs"
            />
          </div>

          <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-black">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'calendar' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Agenda
            </button>
          </div>
        </div>
      </div>

      {/* Selected Date Filter Banner */}
      {selectedDateStr && (
        <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between text-xs font-bold text-amber-900">
          <span>
            Menampilkan kegiatan pada tanggal: <strong className="font-black text-[#FF6B00]">{selectedDateStr}</strong>
          </span>
          <button
            onClick={() => setSelectedDateStr(null)}
            className="text-[#FF6B00] hover:underline font-black cursor-pointer"
          >
            Tampilkan Semua Tanggal ✕
          </button>
        </div>
      )}

      {/* Main Interactive Calendar Section */}
      {activeTab === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Calendar Month Grid (Left Column - 2 Cols width) */}
          <div className="lg:col-span-2 glass-card rounded-3xl p-6 shadow-md space-y-4 glossy-top-highlight border border-white/60">
            
            {/* Month Header Controller */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-900 text-base">
                  {monthNames[month]} {year}
                </h3>
                <span className="text-[10px] font-extrabold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  2026
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer transition-all shadow-xs"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setSelectedMonth(new Date(2026, 7, 1))}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-black text-slate-700 cursor-pointer shadow-xs"
                >
                  Bulan Ini
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer transition-all shadow-xs"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 text-center text-[11px] font-black text-slate-400 py-1 border-b border-slate-100">
              <span>Ming</span>
              <span>Sen</span>
              <span>Sel</span>
              <span>Rab</span>
              <span>Kam</span>
              <span>Jum</span>
              <span>Sab</span>
            </div>

            {/* Calendar Days Cells Grid */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {/* Empty leading cells */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty_${i}`} className="h-20 sm:h-24 rounded-2xl bg-slate-50/40 border border-transparent" />
              ))}

              {/* Month Day Cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = formatDateString(dayNum);
                const dayItems = consolidatedItems.filter(item => item.date === dateStr);
                const isSelected = selectedDateStr === dateStr;
                const isToday = dayNum === 23 && month === 6; // Mock current date e.g. July 23

                return (
                  <motion.button
                    key={`day_${dayNum}`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedDateStr(isSelected ? null : dateStr)}
                    className={`h-20 sm:h-24 p-1.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'border-[#FF6B00] bg-orange-50/90 shadow-md ring-2 ring-[#FF6B00]/30'
                        : isToday
                        ? 'border-[#FFC107] bg-amber-50/60 font-black'
                        : 'border-slate-200/70 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-xs font-black ${
                        isToday ? 'text-[#FF6B00]' : isSelected ? 'text-slate-900' : 'text-slate-700'
                      }`}>
                        {dayNum}
                      </span>
                      {isToday && (
                        <span className="text-[8px] font-black bg-[#FF6B00] text-white px-1.5 py-0.2 rounded-full">Hari Ini</span>
                      )}
                    </div>

                    {/* Event Dots/Badges */}
                    <div className="space-y-1 w-full overflow-hidden">
                      {dayItems.slice(0, 2).map((item, idx) => (
                        <div
                          key={idx}
                          className={`text-[8.5px] font-extrabold px-1.5 py-0.5 rounded-md truncate ${
                            item.category === 'Kegiatan Bisnis'
                              ? 'bg-orange-100 text-orange-800 border border-orange-200'
                              : item.category === 'Temu Matching'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {item.title}
                        </div>
                      ))}
                      {dayItems.length > 2 && (
                        <p className="text-[8px] font-black text-slate-400 text-right pr-0.5">
                          +{dayItems.length - 2} lagi
                        </p>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Legend Footer */}
            <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-100 text-[10.5px] font-extrabold text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#FF6B00]" />
                <span>Kegiatan Bisnis</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span>Temu Matching</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                <span>Tenggat Tender</span>
              </span>
            </div>

          </div>

          {/* Day / Filter Agenda List (Right Column - 1 Col width) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-sm">
                {selectedDateStr ? `Agenda Tanggal ${selectedDateStr}` : 'Daftar Agenda Terdekat'}
              </h3>
              <span className="text-xs font-bold text-slate-400">
                ({filteredItems.length} Agenda)
              </span>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1 scrollbar-none">
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  className="glass-card rounded-2xl p-4 border border-slate-200/80 hover:border-orange-200 space-y-3 text-xs shadow-sm hover:shadow-md transition-all glossy-top-highlight"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      item.category === 'Kegiatan Bisnis' ? 'bg-orange-100 text-orange-800' :
                      item.category === 'Temu Matching' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {item.category}
                    </span>

                    <span className="text-[10px] font-extrabold text-slate-400">
                      📅 {item.date}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-black text-slate-900 leading-snug">{item.title}</h4>
                    <p className="text-slate-500 font-bold text-[11px] mt-1 line-clamp-2">{item.description}</p>
                  </div>

                  <div className="space-y-1 text-[10.5px] font-extrabold text-slate-600 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                    <p className="flex items-center gap-1.5 truncate">
                      <Clock className="h-3 w-3 text-[#FF6B00] flex-shrink-0" />
                      <span>{item.time}</span>
                    </p>
                    <p className="flex items-center gap-1.5 truncate">
                      <MapPin className="h-3 w-3 text-[#FF6B00] flex-shrink-0" />
                      <span>{item.location}</span>
                    </p>
                  </div>

                  {/* Sync Action Links */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <button
                      onClick={() => handleDownloadIcs(item)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-[10px] flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Download className="h-3 w-3 text-[#FF6B00]" />
                      <span>iCal (.ics)</span>
                    </button>

                    <a
                      href={getGoogleCalendarUrl(item)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#FF6B00] font-black text-[10px] flex items-center gap-1 transition-all"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>Google Cal</span>
                    </a>

                    <a
                      href={getOutlookCalendarUrl(item)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-black text-[10px] flex items-center gap-1 transition-all"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>Outlook</span>
                    </a>
                  </div>
                </div>
              ))}

              {filteredItems.length === 0 && (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 font-bold text-xs space-y-1">
                  <p>Tidak ada agenda kegiatan pada kriteria ini.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      ) : (
        /* Full Agenda List View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredItems.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-3xl p-6 shadow-md border border-slate-200/80 hover:border-orange-300 space-y-4 text-xs transition-all glossy-top-highlight"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img src={item.image} alt="Logo" className="h-10 w-10 rounded-xl object-cover border border-slate-200 shadow-sm" />
                  <div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-black uppercase ${
                      item.category === 'Kegiatan Bisnis' ? 'bg-orange-100 text-orange-800' :
                      item.category === 'Temu Matching' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {item.category}
                    </span>
                    <h4 className="font-black text-slate-900 text-sm mt-1">{item.title}</h4>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-black text-[#FF6B00] text-xs">📅 {item.date}</span>
                </div>
              </div>

              <p className="text-slate-600 leading-relaxed font-bold">{item.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-extrabold text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <p className="flex items-center gap-1.5 truncate">
                  <Clock className="h-3.5 w-3.5 text-[#FF6B00] flex-shrink-0" />
                  <span>{item.time}</span>
                </p>
                <p className="flex items-center gap-1.5 truncate">
                  <MapPin className="h-3.5 w-3.5 text-[#FF6B00] flex-shrink-0" />
                  <span>{item.location}</span>
                </p>
                <p className="flex items-center gap-1.5 truncate sm:col-span-2">
                  <Building2 className="h-3.5 w-3.5 text-[#FF6B00] flex-shrink-0" />
                  <span>Penyelenggara: {item.organizer}</span>
                </p>
              </div>

              {/* Direct Sync Action Bar */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadIcs(item)}
                    className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                  >
                    <Download className="h-3.5 w-3.5 text-[#FFC107]" />
                    <span>Download iCal (.ics)</span>
                  </button>

                  <button
                    onClick={() => handleToggleSync(item)}
                    className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all border ${
                      item.isSynced
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle2 className={`h-3.5 w-3.5 ${item.isSynced ? 'text-emerald-600 fill-emerald-100' : 'text-slate-400'}`} />
                    <span>{item.isSynced ? 'Tersinkronisasi' : 'Sinkronkan'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={getGoogleCalendarUrl(item)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#FF6B00] font-black text-xs flex items-center gap-1 transition-all"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Google Cal</span>
                  </a>

                  <a
                    href={getOutlookCalendarUrl(item)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-black text-xs flex items-center gap-1 transition-all"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Outlook</span>
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Custom Event Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="glass-card rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-white/80 bg-white"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-[#FF6B00]" />
                  <span>Tambah Agenda / Kegiatan Bisnis</span>
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddEvent} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Nama Agenda / Kegiatan</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Rapat Daring Pembahasan Konsorsium Energi"
                    value={evtTitle}
                    onChange={e => setEvtTitle(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white p-3 outline-none focus:border-[#FFC107] font-bold text-slate-800 shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Kategori</label>
                    <select
                      value={evtType}
                      onChange={e => setEvtType(e.target.value as any)}
                      className="w-full rounded-2xl border border-slate-200 bg-white p-3 outline-none focus:border-[#FFC107] font-bold text-slate-800 shadow-inner cursor-pointer"
                    >
                      <option value="Seminar">Seminar</option>
                      <option value="Webinar">Webinar</option>
                      <option value="Workshop">Workshop</option>
                      <option value="Expo">Expo</option>
                      <option value="Business Matching">Business Matching</option>
                      <option value="Networking">Networking</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Tanggal Kegiatan</label>
                    <input
                      type="date"
                      required
                      value={evtDate}
                      onChange={e => setEvtDate(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white p-3 outline-none focus:border-[#FFC107] font-bold text-slate-800 shadow-inner"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Waktu (Jam)</label>
                    <input
                      type="text"
                      required
                      placeholder="10:00 - 12:00 WIB"
                      value={evtTime}
                      onChange={e => setEvtTime(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white p-3 outline-none focus:border-[#FFC107] font-bold text-slate-800 shadow-inner"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Lokasi / Tautan Zoom</label>
                    <input
                      type="text"
                      required
                      placeholder="Jakarta / Live Stream"
                      value={evtLoc}
                      onChange={e => setEvtLoc(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white p-3 outline-none focus:border-[#FFC107] font-bold text-slate-800 shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Keterangan / Agenda Terperinci</label>
                  <textarea
                    rows={3}
                    placeholder="Tuliskan tujuan rapat, target peserta, dan berkas yang diperlukan..."
                    value={evtDesc}
                    onChange={e => setEvtDesc(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white p-3 outline-none focus:border-[#FFC107] font-bold text-slate-800 shadow-inner resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-2xl bg-gradient-to-r from-[#FFC107] to-[#FF6B00] hover:brightness-110 active:scale-95 py-3.5 font-black text-white text-xs shadow-md shadow-orange-500/20 cursor-pointer transition-all mt-2"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan & Sinkronkan ke Kalender'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
