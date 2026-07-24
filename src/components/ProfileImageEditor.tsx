import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Sun, 
  Sparkles, 
  Contrast, 
  RotateCw, 
  Sliders, 
  Check, 
  X, 
  RotateCcw, 
  RefreshCw,
  Image as ImageIcon,
  Camera
} from 'lucide-react';

interface ProfileImageEditorProps {
  currentAvatar: string;
  onSave: (newDataUrl: string) => void;
  onCancel: () => void;
}

export default function ProfileImageEditor({ currentAvatar, onSave, onCancel }: ProfileImageEditorProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  
  // Camera Webcam States
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Image Adjustment States
  const [brightness, setBrightness] = useState(100); // 50 - 200
  const [smoothing, setSmoothing] = useState(0); // 0 - 10 (blur equivalent)
  const [contrast, setContrast] = useState(100); // 50 - 200
  const [saturation, setSaturation] = useState(100); // 0 - 200
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [activeFilter, setActiveFilter] = useState('normal'); // normal, bw, vintage, warm, cool, studio

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Stop camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 640 }, facingMode: 'user' }
      });
      streamRef.current = stream;
      setIsCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError("Izin perangkat kamera ditolak atau tidak tersedia pada browser/perangkat Anda.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const captureCameraPhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const tempCanvas = document.createElement('canvas');
    const size = Math.min(video.videoWidth || 640, video.videoHeight || 640);
    tempCanvas.width = size;
    tempCanvas.height = size;
    const ctx = tempCanvas.getContext('2d');
    if (ctx) {
      const sx = ((video.videoWidth || size) - size) / 2;
      const sy = ((video.videoHeight || size) - size) / 2;
      ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
      const dataUrl = tempCanvas.toDataURL('image/png');
      setImageSrc(dataUrl);
      stopCamera();
      // Reset adjustments
      setBrightness(100);
      setSmoothing(0);
      setContrast(100);
      setSaturation(100);
      setRotation(0);
      setActiveFilter('normal');
    }
  };

  // Load initial image if it's a valid dataURL or unsplash image
  useEffect(() => {
    if (currentAvatar) {
      // We can pre-load the current avatar as the base to edit
      loadImageFromUrl(currentAvatar);
    }
  }, [currentAvatar]);

  const loadImageFromUrl = (url: string) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setImageSrc(url);
    };
    img.onerror = () => {
      console.log("Could not load current avatar for editing, waiting for file upload.");
    };
    img.src = url;
  };

  // Preset Filters
  const applyPreset = (preset: string) => {
    setActiveFilter(preset);
    switch (preset) {
      case 'normal':
        setBrightness(100);
        setSmoothing(0);
        setContrast(100);
        setSaturation(100);
        break;
      case 'studio':
        setBrightness(115);
        setSmoothing(1.5);
        setContrast(105);
        setSaturation(105);
        break;
      case 'bw':
        setBrightness(100);
        setSmoothing(0);
        setContrast(125);
        setSaturation(0);
        break;
      case 'vintage':
        setBrightness(95);
        setSmoothing(1);
        setContrast(90);
        setSaturation(70);
        break;
      case 'warm':
        setBrightness(105);
        setSmoothing(0.5);
        setContrast(100);
        setSaturation(120);
        break;
      case 'cool':
        setBrightness(100);
        setSmoothing(0.5);
        setContrast(105);
        setSaturation(85);
        break;
      default:
        break;
    }
  };

  // Handle Drag & Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Format berkas harus berupa gambar (PNG, JPG, JPEG)!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImageSrc(e.target.result as string);
        // Reset adjustments on new image upload
        setBrightness(100);
        setSmoothing(0);
        setContrast(100);
        setSaturation(100);
        setRotation(0);
        setActiveFilter('normal');
      }
    };
    reader.readAsDataURL(file);
  };

  // Render processed image onto Canvas
  useEffect(() => {
    if (!imageSrc) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageRef.current = img;
      drawCanvas();
    };
    img.src = imageSrc;
  }, [imageSrc, brightness, smoothing, contrast, saturation, rotation, activeFilter]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high-quality resolution square for avatar (e.g. 400x400)
    const size = 400;
    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, size, size);
    ctx.save();

    // Move origin to center for rotation
    ctx.translate(size / 2, size / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    // Apply adjustments using HTML5 Canvas Filter string
    // Brightness, Contrast, Saturation, Blur (smoothing)
    // Map smoothing to px blur (e.g. 0 to 10 mapped to 0 to 4px for smooth subtleness)
    const blurPx = smoothing * 0.4;
    
    // Construct filter string
    let filterString = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    if (blurPx > 0) {
      filterString += ` blur(${blurPx}px)`;
    }
    
    // Custom fine-tuning presets that cannot be done with simple sliders easily
    if (activeFilter === 'vintage') {
      filterString += ' sepia(35%)';
    } else if (activeFilter === 'cool') {
      filterString += ' hue-rotate(15deg)';
    } else if (activeFilter === 'warm') {
      filterString += ' hue-rotate(-10deg)';
    }

    ctx.filter = filterString;

    // Calculate source crop to keep it center-cropped square
    const imgWidth = img.width;
    const imgHeight = img.height;
    const minDim = Math.min(imgWidth, imgHeight);
    const sx = (imgWidth - minDim) / 2;
    const sy = (imgHeight - minDim) / 2;

    // Draw the image onto the square canvas centered
    ctx.drawImage(
      img,
      sx, sy, minDim, minDim, // Source square
      -size / 2, -size / 2, size, size // Destination square
    );

    ctx.restore();
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setBrightness(100);
    setSmoothing(0);
    setContrast(100);
    setSaturation(100);
    setRotation(0);
    setActiveFilter('normal');
  };

  const handleApply = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Get the high quality JPEG representation
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    onSave(dataUrl);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xl overflow-hidden text-slate-800 animate-fade-in">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 p-5 text-white flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 bg-amber-500/15 border border-amber-500/30 rounded-xl flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h4 className="font-black text-sm tracking-tight text-white">Studio Foto Profil Mandiri</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Unggah, Potong, Penghalusan & Atur Pencahayaan</p>
          </div>
        </div>
        <button 
          type="button" 
          onClick={onCancel}
          className="h-8 w-8 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 flex items-center justify-center transition-colors cursor-pointer border border-slate-700/50"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Side: Upload Zone & Preview Canvas */}
        <div className="space-y-4">
          <div className="text-xs font-black text-slate-400 uppercase tracking-wider">Preview Foto & Area Kerja</div>

          {/* Canvas Wrapper */}
          <div className="relative rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center p-4 min-h-[340px] transition-all overflow-hidden">
            {isCameraActive ? (
              /* Live Camera Stream View */
              <div className="flex flex-col items-center space-y-3 w-full">
                <div className="relative rounded-2xl overflow-hidden shadow-lg border-2 border-orange-500 bg-black w-72 h-72">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md animate-pulse flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                    <span>LIVE KAMERA</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={captureCameraPhoto}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#FFC107] to-[#FF6B00] hover:brightness-110 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all border-none"
                  >
                    <Camera className="h-4 w-4" />
                    <span>Tangkap Foto (Snapshot)</span>
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-3.5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-black text-xs rounded-xl cursor-pointer transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            ) : imageSrc ? (
              <div className="relative flex flex-col items-center">
                {/* Visual Canvas containing the cropped, processed image */}
                <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-white">
                  <canvas 
                    ref={canvasRef} 
                    className="w-72 h-72 block object-cover rounded-2xl" 
                  />
                  <div className="absolute top-2 right-2 flex gap-1.5 z-10">
                    <button
                      type="button"
                      onClick={handleRotate}
                      title="Rotasi Gambar"
                      className="p-2 bg-slate-900/85 hover:bg-slate-800 text-white rounded-xl shadow-md transition-colors cursor-pointer border border-slate-700/50"
                    >
                      <RotateCw className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleReset}
                      title="Reset Pengaturan"
                      className="p-2 bg-slate-900/85 hover:bg-slate-800 text-white rounded-xl shadow-md transition-colors cursor-pointer border border-slate-700/50"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  <button
                    type="button"
                    onClick={triggerFileSelect}
                    className="flex items-center gap-1.5 text-[11px] font-black text-[#FF6B00] bg-orange-50 border border-orange-100 hover:bg-orange-100 rounded-xl px-3.5 py-2 transition-all cursor-pointer shadow-sm"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Ganti Berkas</span>
                  </button>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="flex items-center gap-1.5 text-[11px] font-black text-slate-700 bg-slate-100 border border-slate-200 hover:bg-slate-200 rounded-xl px-3.5 py-2 transition-all cursor-pointer shadow-sm"
                  >
                    <Camera className="h-3.5 w-3.5 text-orange-500" />
                    <span>Ambil dari Kamera</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Drag Drop Upload & Camera Zone */
              <div className="w-full h-full flex flex-col items-center justify-center py-8 px-6 text-center space-y-4 rounded-2xl">
                <div className="h-14 w-14 rounded-2xl bg-orange-50 text-[#FF6B00] flex items-center justify-center border border-orange-100 shadow-sm animate-pulse">
                  <Upload className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-800">Unggah Gambar / Logo Perusahaan</p>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">Tarik & Lepas foto di sini atau ambil foto langsung dari kamera</p>
                </div>

                {cameraError && (
                  <p className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 p-2 rounded-xl text-center">
                    {cameraError}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={triggerFileSelect}
                    className="px-4 py-2.5 bg-[#FF6B00] hover:bg-orange-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition-all border-none shadow-orange-500/10 flex items-center gap-1.5"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Pilih Berkas</span>
                  </button>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-950 text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition-all border-none flex items-center gap-1.5"
                  >
                    <Camera className="h-3.5 w-3.5 text-amber-400" />
                    <span>Ambil dari Kamera</span>
                  </button>
                </div>
              </div>
            )}

            {/* Hidden Input */}
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*"
              className="hidden" 
              onChange={handleFileInputChange}
            />
          </div>
        </div>

        {/* Right Side: Professional Adjustment Sliders & Presets */}
        <div className="space-y-6 flex flex-col justify-between">
          
          <div className="space-y-5">
            <div className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="h-4 w-4 text-slate-400" />
              <span>Kontrol Studio & Penyelarasan</span>
            </div>

            {/* Sliders Container */}
            <div className="space-y-4.5 bg-slate-50/50 rounded-2xl p-4.5 border border-slate-200/50">
              
              {/* Brightness Adjustment (Pencahayaan) */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                    <Sun className="h-4 w-4 text-amber-500" />
                    Pencahayaan (Brightness)
                  </span>
                  <span className="text-xs font-black text-[#FF6B00] bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-100">
                    {brightness}%
                  </span>
                </div>
                <input 
                  type="range"
                  min="50"
                  max="200"
                  disabled={!imageSrc}
                  value={brightness}
                  onChange={(e) => setBrightness(parseInt(e.target.value))}
                  className="w-full accent-[#FF6B00] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                />
              </div>

              {/* Skin Smoothing Adjustment (Penghalusan) */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-emerald-500 animate-pulse" />
                    Penghalusan Wajah (Skin Softening)
                  </span>
                  <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                    {smoothing === 0 ? 'Mati' : `Level ${smoothing}`}
                  </span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  disabled={!imageSrc}
                  value={smoothing}
                  onChange={(e) => setSmoothing(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                />
                <span className="text-[10px] text-slate-400 font-bold block leading-normal">Fungsi cerdas menyamarkan noda & melembutkan tekstur wajah secara profesional.</span>
              </div>

              {/* Contrast Adjustment */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                    <Contrast className="h-4 w-4 text-indigo-500" />
                    Kontras Warna (Contrast)
                  </span>
                  <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                    {contrast}%
                  </span>
                </div>
                <input 
                  type="range"
                  min="50"
                  max="200"
                  disabled={!imageSrc}
                  value={contrast}
                  onChange={(e) => setContrast(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                />
              </div>

              {/* Saturation Adjustment */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4 text-pink-500" />
                    Kepekatan Warna (Saturation)
                  </span>
                  <span className="text-xs font-black text-pink-700 bg-pink-50 px-2 py-0.5 rounded-lg border border-pink-100">
                    {saturation}%
                  </span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="200"
                  disabled={!imageSrc}
                  value={saturation}
                  onChange={(e) => setSaturation(parseInt(e.target.value))}
                  className="w-full accent-pink-500 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                />
              </div>

            </div>

            {/* Filter Presets section */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-600 block">Preset Filter Studio BCI</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'normal', name: 'Original', desc: 'Tanpa Efek' },
                  { id: 'studio', name: 'Studio Glow', desc: 'Cerah Halus' },
                  { id: 'bw', name: 'Monochrome', desc: 'B&W Klasik' },
                  { id: 'vintage', name: 'Sepia Retro', desc: 'Estetik Vintage' },
                  { id: 'warm', name: 'Golden Hour', desc: 'Hangat Alami' },
                  { id: 'cool', name: 'Cool Business', desc: 'Eksekutif Dingin' }
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    disabled={!imageSrc}
                    onClick={() => applyPreset(f.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                      activeFilter === f.id
                        ? 'border-[#FF6B00] bg-orange-50/50 text-[#FF6B00]'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <p className="text-[11px] font-black leading-tight">{f.name}</p>
                    <p className="text-[9px] text-slate-400 font-bold mt-0.5 leading-none">{f.desc}</p>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Save / Cancel buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 text-xs font-black bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl transition-colors cursor-pointer"
            >
              Batalkan
            </button>
            <button
              type="button"
              disabled={!imageSrc}
              onClick={handleApply}
              className="flex-1 py-3 text-xs font-black text-white bg-gradient-to-r from-[#FFC107] to-[#FF6B00] hover:brightness-105 disabled:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-md shadow-orange-500/10 flex items-center justify-center gap-1.5 cursor-pointer border-none"
            >
              <Check className="h-4 w-4" />
              <span>Simpan Foto Hasil Edit</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
