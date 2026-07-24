import React from 'react';

interface LogoProps {
  variant?: 'icon' | 'text' | 'compact' | 'full';
  className?: string;
  size?: number;
  showSubtitle?: boolean;
}

export default function Logo({
  variant = 'text',
  className = '',
  size,
  showSubtitle = true
}: LogoProps) {
  // Determine icon dimension based on variant or custom size prop
  const iconSize = size || (variant === 'icon' ? 44 : variant === 'full' ? 56 : 38);

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Red Squircle App Icon with White 'B' & Flying Arrow */}
      <div
        className="relative flex-shrink-0 flex items-center justify-center rounded-2xl overflow-hidden shadow-md shadow-red-600/20 transition-transform active:scale-95 group"
        style={{ width: iconSize, height: iconSize }}
      >
        <svg
          viewBox="0 0 512 512"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Vibrant Red Background */}
          <rect width="512" height="512" rx="128" fill="#EE1C25" />
          
          {/* Subtle glossy top overlay highlight for depth */}
          <path
            d="M 0 0 H 512 V 220 Q 256 280 0 220 Z"
            fill="white"
            fillOpacity="0.08"
          />

          {/* White 'B' Body + Flying Paper Airplane Mark */}
          <g fill="white">
            {/* Italicized 'B' Base Shape */}
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M 125 130
                 H 295
                 C 365 130 395 170 380 225
                 C 370 262 340 278 305 284
                 C 335 294 355 316 340 360
                 C 322 410 270 415 185 415
                 H 80
                 L 125 130 Z
                 
                 M 190 185
                 L 165 360
                 H 195
                 C 250 360 275 350 287 315
                 C 297 285 283 270 240 270
                 H 210
                 L 220 215
                 H 250
                 C 290 215 305 200 315 185
                 H 190 Z"
            />

            {/* Dynamic Swoosh Arc to Top-Right Arrow */}
            <path
              d="M 210 285
                 C 285 275 340 230 375 180
                 L 348 192
                 L 438 95
                 L 398 220
                 L 370 163
                 C 335 210 285 255 210 285 Z"
            />
          </g>
        </svg>
      </div>

      {/* Text Branding Options */}
      {variant !== 'icon' && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-1.5">
            <span className={`font-black tracking-tight text-slate-900 ${
              variant === 'full' ? 'text-2xl' : variant === 'compact' ? 'text-sm' : 'text-lg'
            }`}>
              BCI
            </span>
            <span className="bg-[#EE1C25] text-white text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider shadow-xs">
              PORTAL
            </span>
          </div>

          {showSubtitle && variant !== 'compact' && (
            <p className="text-[9.5px] font-black text-slate-500 tracking-wider uppercase mt-0.5">
              Business Connect Indonesia
            </p>
          )}
        </div>
      )}
    </div>
  );
}
