export function CandleVisual({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <svg viewBox="0 0 80 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <radialGradient id="candle-light" cx="50%" cy="25%" r="55%">
            <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.5" />
            <stop offset="60%" stopColor="#FDE68A" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#FDE68A" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="candle-body-grad" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#FEF9C3" />
            <stop offset="100%" stopColor="#FDE68A" />
          </linearGradient>
          <linearGradient id="flame-outer-grad" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#FCD34D" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#EF4444" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* Ambient light glow */}
        <circle
          cx="40" cy="28" r="30"
          fill="url(#candle-light)"
          className="animate-candle-glow"
          style={{ transformOrigin: '40px 28px' }}
        />

        {/* Outer flame */}
        <g
          className="animate-flame-flicker"
          style={{ transformOrigin: '40px 48px', transformBox: 'fill-box' as never }}
        >
          <path
            d="M40,6 Q50,18 48,30 Q46,42 40,48 Q34,42 32,30 Q30,18 40,6 Z"
            fill="url(#flame-outer-grad)"
            opacity="0.9"
          />
        </g>

        {/* Inner flame core */}
        <g
          className="animate-flame-flicker-alt"
          style={{ transformOrigin: '40px 44px', transformBox: 'fill-box' as never }}
        >
          <path
            d="M40,18 Q46,26 44,34 Q43,40 40,44 Q37,40 36,34 Q34,26 40,18 Z"
            fill="#FEF3C7"
            opacity="0.95"
          />
        </g>

        {/* Wick */}
        <line x1="40" y1="44" x2="40" y2="55" stroke="#451A03" strokeWidth="1.5" strokeLinecap="round" />

        {/* Wax pool (melted top) */}
        <ellipse cx="40" cy="55" rx="12" ry="3" fill="#FEF9C3" stroke="#EAB308" strokeWidth="0.3" />

        {/* Candle body */}
        <rect x="28" y="55" width="24" height="78" rx="1.5" fill="url(#candle-body-grad)" stroke="#E5E7EB" strokeWidth="0.5" />

        {/* Wax drip left */}
        <path
          d="M28,62 Q26,68 27,76 Q28,78 28,75"
          fill="#FEF9C3" stroke="#EAB308" strokeWidth="0.3"
        />

        {/* Wax drip right */}
        <path
          d="M52,70 Q54,76 53,82 Q52,84 52,82"
          fill="#FEF9C3" stroke="#EAB308" strokeWidth="0.3"
          opacity="0.7"
        />

        {/* Candle holder plate */}
        <ellipse cx="40" cy="135" rx="22" ry="5" fill="#D1D5DB" />
        <rect x="26" y="131" width="28" height="6" rx="2" fill="#9CA3AF" />

        {/* Holder base */}
        <ellipse cx="40" cy="140" rx="18" ry="3" fill="#9CA3AF" opacity="0.5" />
      </svg>
    </div>
  );
}
