export function LanternVisual({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-gentle-sway ${className}`}>
      <svg viewBox="0 0 120 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <radialGradient id="lantern-inner-glow" cx="50%" cy="45%" r="50%">
            <stop offset="0%" stopColor="#FCD34D" stopOpacity="0.95" />
            <stop offset="40%" stopColor="#F59E0B" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#D97706" stopOpacity="0.3" />
          </radialGradient>
          <linearGradient id="lantern-body-grad" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#D97706" stopOpacity="0.7" />
          </linearGradient>
          <filter id="lantern-blur">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        {/* Outer glow halo */}
        <ellipse
          cx="60" cy="82" rx="48" ry="52"
          fill="#FBBF24" opacity="0.2"
          filter="url(#lantern-blur)"
          className="animate-lantern-glow"
          style={{ transformOrigin: '60px 82px' }}
        />

        {/* Hanging cord */}
        <line x1="60" y1="6" x2="60" y2="32" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" />
        {/* Hook ring */}
        <circle cx="60" cy="6" r="3" fill="none" stroke="#78350F" strokeWidth="1.5" />

        {/* Top cap */}
        <path d="M42,30 L78,30 Q82,30 82,34 L82,38 Q82,40 78,40 L42,40 Q38,40 38,38 L38,34 Q38,30 42,30 Z"
          fill="#92400E" />

        {/* Lantern body */}
        <path
          d="M42,40 Q30,55 28,82 Q30,112 42,126 L78,126 Q90,112 92,82 Q90,55 78,40 Z"
          fill="url(#lantern-body-grad)"
          stroke="#B45309"
          strokeWidth="1"
        />

        {/* Inner glow */}
        <ellipse cx="60" cy="82" rx="24" ry="30" fill="url(#lantern-inner-glow)" />

        {/* Decorative ribs */}
        <path d="M50,40 Q44,82 50,126" stroke="#D97706" strokeWidth="0.7" fill="none" opacity="0.4" />
        <path d="M60,40 L60,126" stroke="#D97706" strokeWidth="0.7" fill="none" opacity="0.4" />
        <path d="M70,40 Q76,82 70,126" stroke="#D97706" strokeWidth="0.7" fill="none" opacity="0.4" />

        {/* Horizontal bands */}
        <ellipse cx="60" cy="60" rx="28" ry="2" fill="none" stroke="#B45309" strokeWidth="0.5" opacity="0.3" />
        <ellipse cx="60" cy="105" rx="26" ry="2" fill="none" stroke="#B45309" strokeWidth="0.5" opacity="0.3" />

        {/* Bottom cap */}
        <rect x="44" y="124" rx="3" width="32" height="8" fill="#92400E" />

        {/* Bottom tassels */}
        <line x1="52" y1="132" x2="50" y2="156" stroke="#D97706" strokeWidth="1" opacity="0.5" strokeLinecap="round" />
        <line x1="60" y1="132" x2="60" y2="162" stroke="#D97706" strokeWidth="1" opacity="0.5" strokeLinecap="round" />
        <line x1="68" y1="132" x2="70" y2="156" stroke="#D97706" strokeWidth="1" opacity="0.5" strokeLinecap="round" />

        {/* Tassel ends */}
        <circle cx="50" cy="157" r="1.5" fill="#B45309" opacity="0.5" />
        <circle cx="60" cy="163" r="1.5" fill="#B45309" opacity="0.5" />
        <circle cx="70" cy="157" r="1.5" fill="#B45309" opacity="0.5" />
      </svg>
    </div>
  );
}
