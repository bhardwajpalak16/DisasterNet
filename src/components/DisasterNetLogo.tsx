import React from 'react';
import { useTheme } from '../context/ThemeContext';

export interface DisasterNetLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'icon' | 'horizontal' | 'full';
  showPulse?: boolean;
  className?: string;
  mode?: 'auto' | 'light' | 'dark';
}

export const DisasterNetLogo: React.FC<DisasterNetLogoProps> = ({
  size = 'md',
  variant = 'icon',
  showPulse = false,
  className = '',
  mode = 'auto',
}) => {
  const { isDark: contextIsDark } = useTheme();
  const isDark = mode === 'dark' ? true : mode === 'light' ? false : contextIsDark;

  // Icon dimension maps
  const iconSizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
    '2xl': 'w-28 h-28',
  };

  const textScaleMap = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
    '2xl': 'text-5xl',
  };

  const taglineScaleMap = {
    xs: 'text-[9px]',
    sm: 'text-[11px]',
    md: 'text-xs',
    lg: 'text-sm',
    xl: 'text-base',
    '2xl': 'text-lg',
  };

  const mottoScaleMap = {
    xs: 'text-[8px]',
    sm: 'text-[9px]',
    md: 'text-[11px]',
    lg: 'text-xs',
    xl: 'text-sm',
    '2xl': 'text-base',
  };

  // Color variables based on theme
  const leftShieldColor = isDark ? '#FFFFFF' : '#0F1D36';
  const rightShieldColor = '#EE2D42';
  const signalRed = '#EE2D42';
  const crossRed = '#EE2D42';
  const mountainColor = isDark ? '#6B8299' : '#4B637D';
  const handColor = isDark ? '#FFFFFF' : '#0F1D36';
  const peopleColor = isDark ? '#FFFFFF' : '#0F1D36';
  const disasterTextColor = isDark ? '#FFFFFF' : '#0F1D36';
  const netTextColor = '#EE2D42';
  const taglineColor = isDark ? '#E2E8F0' : '#1E293B';
  const mottoColor = isDark ? '#CBD5E1' : '#475569';
  const leftLineColor = '#EE2D42';
  const rightLineColor = isDark ? '#FFFFFF' : '#0F1D36';

  const renderShieldEmblem = (customClass = '') => (
    <div className={`relative inline-flex items-center justify-center flex-shrink-0 ${customClass || iconSizeMap[size]}`}>
      {showPulse && (
        <span className="absolute inset-0 rounded-2xl bg-rose-500/30 animate-ping opacity-40 pointer-events-none" />
      )}

      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 transition-transform duration-300 hover:scale-105 filter drop-shadow-sm select-none"
      >
        <defs>
          {/* Subtle glow filter for rescue beacon */}
          <filter id="dnLogoShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity={isDark ? "0.35" : "0.12"} />
          </filter>
        </defs>

        <g filter="url(#dnLogoShadow)">
          {/* LEFT SHIELD OUTLINE (Navy in Light, White in Dark) */}
          <path
            d="M 52 14 C 40 15 26 19 19 26 C 12 36 12 50 16 64 C 20 78 28 89 44 98"
            stroke={leftShieldColor}
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* RIGHT SHIELD OUTLINE (Crimson Red with stylish tapered bottom tail) */}
          <path
            d="M 58 14 C 70 15 84 19 92 26 C 100 36 102 52 98 68 C 93 84 81 96 58 103 C 48 106 38 105 32 103"
            stroke={rightShieldColor}
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* RED WI-FI / MESH BROADCAST RADIO WAVES (Top Left) */}
          {/* Dot */}
          <circle cx="29" cy="43" r="2.8" fill={signalRed} />

          {/* Inner wave arc */}
          <path
            d="M 23 35 C 27 30 33 30 37 35"
            stroke={signalRed}
            strokeWidth="3.2"
            strokeLinecap="round"
            fill="none"
          />

          {/* Outer wave arc */}
          <path
            d="M 18 29 C 25 22 35 22 43 29"
            stroke={signalRed}
            strokeWidth="3.2"
            strokeLinecap="round"
            fill="none"
          />

          {/* MOUNTAIN SILHOUETTES / PEAKS (Center/Upper Right) */}
          <path
            d="M 22 60 L 32 52 L 40 56 L 53 38 L 65 48 L 74 38 L 86 54 L 88 60"
            stroke={mountainColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Mountain inner ridge accents */}
          <path
            d="M 53 38 L 56 46 L 50 56"
            stroke={mountainColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity="0.85"
          />
          <path
            d="M 74 38 L 76 46 L 72 54"
            stroke={mountainColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity="0.85"
          />

          {/* RED MEDICAL EMERGENCY FIRST-AID CROSS (Right Middle) */}
          <g>
            {/* Horizontal bar */}
            <rect x="73" y="52" width="14" height="4.5" rx="1.5" fill={crossRed} />
            {/* Vertical bar */}
            <rect x="77.75" y="47.25" width="4.5" height="14" rx="1.5" fill={crossRed} />
          </g>

          {/* 3 PEOPLE SILHOUETTES (Protected Community inside Hand) */}
          <g fill={peopleColor}>
            {/* Center Person (Leader/Taller) */}
            <circle cx="53" cy="60" r="3.2" />
            <path d="M 47 74 C 47 67 59 67 59 74 Z" />

            {/* Left Person */}
            <circle cx="43" cy="63" r="2.7" />
            <path d="M 38 75 C 38 69 48 69 48 75 Z" />

            {/* Right Person */}
            <circle cx="63" cy="63" r="2.7" />
            <path d="M 58 75 C 58 69 68 69 68 75 Z" />
          </g>

          {/* CARING RESCUE HAND (Sheltering at Bottom) */}
          <path
            d="M 20 73 C 24 71 31 71 36 73 C 44 76 54 77 65 74 C 72 72 78 69 82 66 C 83 67 83 69 81 72 C 76 79 67 86 54 87 C 42 88 30 84 21 77 Z"
            fill={handColor}
          />
          {/* Thumb & palm gesture highlight */}
          <path
            d="M 21 73 C 25 76 34 81 48 82 C 60 83 71 78 78 72"
            stroke={isDark ? '#090D16' : '#FFFFFF'}
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
            opacity={isDark ? '0.7' : '0.9'}
          />
        </g>
      </svg>
    </div>
  );

  if (variant === 'icon') {
    return <div className={`inline-flex items-center justify-center ${className}`}>{renderShieldEmblem()}</div>;
  }

  if (variant === 'horizontal') {
    return (
      <div className={`inline-flex items-center gap-3.5 select-none ${className}`}>
        {renderShieldEmblem()}
        <div className="flex flex-col justify-center">
          <div className={`font-black tracking-tight flex items-center leading-none ${textScaleMap[size]}`}>
            <span style={{ color: disasterTextColor }}>Disaster</span>
            <span style={{ color: netTextColor }}>Net</span>
          </div>
          <div
            className={`font-semibold tracking-normal mt-1 leading-tight ${taglineScaleMap[size]}`}
            style={{ color: taglineColor }}
          >
            Stay Safe. Stay Connected.
          </div>
        </div>
      </div>
    );
  }

  // Full variant: Emblem + Title + Tagline + Footer Motto with lines
  return (
    <div className={`inline-flex flex-col items-center sm:items-start text-center sm:text-left gap-2 select-none ${className}`}>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {renderShieldEmblem(iconSizeMap[size])}
        <div className="flex flex-col">
          <div className={`font-black tracking-tight flex items-center leading-none justify-center sm:justify-start ${textScaleMap[size]}`}>
            <span style={{ color: disasterTextColor }}>Disaster</span>
            <span style={{ color: netTextColor }}>Net</span>
          </div>
          <div
            className={`font-bold tracking-tight mt-1.5 leading-snug ${taglineScaleMap[size]}`}
            style={{ color: taglineColor }}
          >
            Stay Safe. Stay Connected.
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
            <span className="h-[2px] w-6 sm:w-8 rounded-full" style={{ backgroundColor: leftLineColor }} />
            <span
              className={`font-semibold tracking-wide ${mottoScaleMap[size]}`}
              style={{ color: mottoColor }}
            >
              Offline First. Always There.
            </span>
            <span className="h-[2px] w-6 sm:w-8 rounded-full" style={{ backgroundColor: rightLineColor }} />
          </div>
        </div>
      </div>
    </div>
  );
};
