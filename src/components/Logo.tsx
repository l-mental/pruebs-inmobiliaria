import React from 'react';

interface LogoProps {
  subtitle?: string;
  compact?: boolean;
  theme?: 'dark' | 'light';
}

export const Logo: React.FC<LogoProps> = ({ 
  subtitle = 'Tu hogar, nuestro compromiso',
  compact = false,
  theme = 'dark'
}) => {
  const isLight = theme === 'light';

  return (
    <div className="flex items-center gap-3 select-none">
      {/* House badge with golden roof and green leaf as in image.png */}
      <div className="relative flex-shrink-0 w-11 h-11 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
          <defs>
            <linearGradient id="roofGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="leafGradLogo" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#84cc16" />
              <stop offset="100%" stopColor="#4d7c0f" />
            </linearGradient>
          </defs>

          {/* House body in deep emerald green */}
          <path
            d="M 24 46 L 24 82 C 24 85, 26 87, 29 87 L 71 87 C 74 87, 76 85, 76 82 L 76 46 Z"
            fill="#15803d"
          />

          {/* Arched entrance doorway */}
          <path
            d="M 42 87 L 42 62 C 42 57, 58 57, 58 62 L 58 87 Z"
            fill={isLight ? "#f8fafc" : "#072a1b"}
          />

          {/* Gabled roof in warm golden yellow with overhang */}
          <path
            d="M 50 14 L 12 47 C 10 49, 12 52, 15 52 L 23 52 L 50 28 L 77 52 L 85 52 C 88 52, 90 49, 88 47 Z"
            fill="url(#roofGrad)"
          />

          {/* Small chimney on the left */}
          <path
            d="M 28 26 L 35 26 L 35 34 L 28 28 Z"
            fill="#b45309"
          />

          {/* Stylized leaf sprout on the right roof slope */}
          <path
            d="M 68 38 C 76 30, 92 34, 94 48 C 82 50, 72 44, 68 38 Z"
            fill="url(#leafGradLogo)"
          />
          <path
            d="M 70 39 Q 80 41 89 45"
            stroke="#fef08a"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>

      {/* Brand Text */}
      <div className="leading-tight">
        <span className={`block text-[9.5px] tracking-[0.22em] uppercase font-bold ${
          isLight ? 'text-emerald-800' : 'text-emerald-300'
        }`}>
          INMOBILIARIA
        </span>
        <span className={`block text-xl font-bold tracking-tight font-serif-brand ${
          isLight ? 'text-slate-900' : 'text-white'
        }`}>
          Nuevas Raíces
        </span>
        {!compact && (
          <span className={`block text-[10.5px] font-normal tracking-wide mt-0.5 ${
            isLight ? 'text-slate-600' : 'text-emerald-100/85'
          }`}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};

