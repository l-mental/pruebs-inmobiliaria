import React from 'react';

interface LogoProps {
  subtitle?: string;
  compact?: boolean;
  theme?: 'dark' | 'light';
  showSlogan?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  subtitle = 'Crea tu origen y construye tu futuro...',
  compact = false,
  theme = 'dark',
  showSlogan = true,
}) => {
  const isLight = theme === 'light';

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Exact emblem matching the uploaded logo: 
          House outline with chimney on the right, 
          flourishing green tree on top, 
          golden roots spreading downwards through and beyond the house. */}
      <div className="relative flex-shrink-0 w-12 h-12 flex items-center justify-center">
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md">
          <defs>
            {/* Gold Gradients */}
            <linearGradient id="goldBarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#bf8f3b" />
              <stop offset="30%" stopColor="#f3d87b" />
              <stop offset="70%" stopColor="#ffd978" />
              <stop offset="100%" stopColor="#a37628" />
            </linearGradient>

            <linearGradient id="goldRootsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f7e189" />
              <stop offset="50%" stopColor="#dfaf44" />
              <stop offset="100%" stopColor="#b68123" />
            </linearGradient>

            <linearGradient id="treeGreenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#99d64f" />
              <stop offset="100%" stopColor="#5ea128" />
            </linearGradient>

            <linearGradient id="houseStrokeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#96612c" />
              <stop offset="100%" stopColor="#693e15" />
            </linearGradient>
          </defs>

          {/* House Outline with Chimney */}
          {/* Chimney on the right roof slope */}
          <path
            d="M 122 84 L 122 72 L 132 72 L 132 94 Z"
            fill="#78471c"
            stroke="#96612c"
            strokeWidth="2"
          />

          {/* House Gable Roof & Walls outline */}
          <path
            d="M 40 106 L 100 48 L 160 106 L 152 106 L 152 144 L 48 144 L 48 106 Z"
            fill="none"
            stroke="#835222"
            strokeWidth="5"
            strokeLinejoin="round"
          />

          {/* Tree Canopy (Lush stylized green leaves above roof) */}
          <g fill="url(#treeGreenGrad)">
            {/* Center top leaf */}
            <path d="M 100 24 C 95 10, 105 10, 100 24 Z" />
            <ellipse cx="100" cy="28" rx="8" ry="16" transform="rotate(0 100 28)" />
            {/* Left leaves */}
            <ellipse cx="88" cy="33" rx="7" ry="14" transform="rotate(-30 88 33)" />
            <ellipse cx="78" cy="43" rx="6.5" ry="13" transform="rotate(-55 78 43)" />
            <ellipse cx="72" cy="56" rx="6" ry="12" transform="rotate(-75 72 56)" />
            <ellipse cx="86" cy="48" rx="6.5" ry="13" transform="rotate(-35 86 48)" />
            <ellipse cx="94" cy="42" rx="6" ry="12" transform="rotate(-15 94 42)" />
            {/* Right leaves */}
            <ellipse cx="112" cy="33" rx="7" ry="14" transform="rotate(30 112 33)" />
            <ellipse cx="122" cy="43" rx="6.5" ry="13" transform="rotate(55 122 43)" />
            <ellipse cx="128" cy="56" rx="6" ry="12" transform="rotate(75 128 56)" />
            <ellipse cx="114" cy="48" rx="6.5" ry="13" transform="rotate(35 114 48)" />
            <ellipse cx="106" cy="42" rx="6" ry="12" transform="rotate(15 106 42)" />
            {/* Leaf central accents / vein cutouts */}
            <ellipse cx="100" cy="30" rx="2" ry="7" fill="#fef08a" opacity="0.6" />
            <ellipse cx="89" cy="35" rx="1.8" ry="6" transform="rotate(-30 89 35)" fill="#fef08a" opacity="0.6" />
            <ellipse cx="111" cy="35" rx="1.8" ry="6" transform="rotate(30 111 35)" fill="#fef08a" opacity="0.6" />
          </g>

          {/* Tree Trunk Base meeting the roof apex */}
          <path
            d="M 94 65 Q 100 58 106 65 L 100 80 Z"
            fill="#5ea128"
          />

          {/* Golden Roots System (Spreading out through and below the house) */}
          <g fill="url(#goldRootsGrad)" stroke="#693e15" strokeWidth="1.2">
            {/* Center main root trunk */}
            <path d="M 100 76 Q 96 90 92 105 Q 98 120 100 138 Q 102 120 108 105 Q 104 90 100 76 Z" />
            {/* Left major spreading roots */}
            <path d="M 95 94 Q 75 100 55 102 Q 35 105 28 108 Q 38 114 58 110 Q 78 108 93 103 Z" />
            <path d="M 92 106 Q 72 114 56 122 Q 42 130 32 135 Q 44 133 60 126 Q 78 118 90 112 Z" />
            <path d="M 94 114 Q 82 124 74 136 Q 68 144 64 148 Q 72 144 80 134 Q 88 124 96 118 Z" />
            <path d="M 98 122 Q 92 134 88 145 Q 86 150 84 153 Q 90 148 94 138 Q 98 130 100 124 Z" />
            {/* Right major spreading roots */}
            <path d="M 105 94 Q 125 100 145 102 Q 165 105 172 108 Q 162 114 142 110 Q 122 108 107 103 Z" />
            <path d="M 108 106 Q 128 114 144 122 Q 158 130 168 135 Q 156 133 140 126 Q 122 118 110 112 Z" />
            <path d="M 106 114 Q 118 124 126 136 Q 132 144 136 148 Q 128 144 120 134 Q 112 124 104 118 Z" />
            <path d="M 102 122 Q 108 134 112 145 Q 114 150 116 153 Q 110 148 106 138 Q 102 130 100 124 Z" />
            {/* Center deep roots */}
            <path d="M 98 135 Q 96 148 95 160 Q 98 152 100 142 Q 102 152 105 160 Q 104 148 102 135 Z" />
          </g>
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="leading-tight flex flex-col justify-center">
        {/* Top gold bar and "INMOBILIARIA" */}
        <div className="flex items-center gap-1.5">
          <span className={`block text-[9.5px] tracking-[0.24em] uppercase font-bold font-serif-brand ${
            isLight ? 'text-amber-800' : 'text-[#f3d87b]'
          }`}>
            INMOBILIARIA
          </span>
          <div className="h-[1.5px] w-6 bg-gradient-to-r from-amber-400/80 to-transparent" />
        </div>

        {/* Nuevas Raíces Title in Rich Gold Serif */}
        <span className={`block text-xl font-bold tracking-tight font-serif-brand drop-shadow-xs ${
          isLight ? 'text-slate-900' : 'text-[#f6e08a]'
        }`}>
          Nuevas Raíces
        </span>

        {/* Official Slogan */}
        {showSlogan && !compact && (
          <span className={`block text-[10.5px] font-medium tracking-wide mt-0.5 italic ${
            isLight ? 'text-slate-600' : 'text-emerald-100/90'
          }`}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};
