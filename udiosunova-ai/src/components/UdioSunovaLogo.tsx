import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  showAiSuffix?: boolean;
}

export function VinylIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg 
      className={`${className} inline-block shrink-0 align-middle animate-[spin_8s_linear_infinite] hover:animate-[spin_2s_linear_infinite] transition-all duration-500`}
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 9 beautiful concentric glowing vinyl record grooves */}
      <circle cx="50" cy="50" r="46" stroke="url(#vinyl-grad-shared)" strokeWidth="1.2" opacity="0.9" />
      <circle cx="50" cy="50" r="41" stroke="url(#vinyl-grad-shared)" strokeWidth="0.8" opacity="0.8" />
      <circle cx="50" cy="50" r="36" stroke="url(#vinyl-grad-shared)" strokeWidth="0.8" opacity="0.75" />
      <circle cx="50" cy="50" r="31" stroke="url(#vinyl-grad-shared)" strokeWidth="0.8" opacity="0.7" />
      <circle cx="50" cy="50" r="26" stroke="url(#vinyl-grad-shared)" strokeWidth="0.8" opacity="0.65" />
      <circle cx="50" cy="50" r="21" stroke="url(#vinyl-grad-shared)" strokeWidth="1.0" opacity="0.8" />
      <circle cx="50" cy="50" r="16" stroke="url(#vinyl-grad-shared)" strokeWidth="1.0" opacity="0.85" />
      <circle cx="50" cy="50" r="11" stroke="url(#vinyl-grad-shared)" strokeWidth="1.2" opacity="0.9" />
      
      {/* Center vinyl label and spindle hole */}
      <circle cx="50" cy="50" r="6" fill="#030712" stroke="url(#vinyl-grad-shared)" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="2.5" fill="#38bdf8" />
      
      <defs>
        <linearGradient id="vinyl-grad-shared" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function UdioSunovaLogo({ className = "", size = "md", showAiSuffix = true }: LogoProps) {
  // Define sizes matching design specs
  const sizeClasses = {
    sm: "text-sm tracking-tighter",
    md: "text-base tracking-tighter md:text-lg",
    lg: "text-lg sm:text-2xl tracking-tighter md:text-3xl",
    xl: "text-2xl sm:text-4xl tracking-tighter md:text-5xl lg:text-6xl font-black",
    custom: ""
  };

  const vinylSizeClasses = {
    sm: "w-[1.1em] h-[1.1em] mx-[0.02em]",
    md: "w-[1.12em] h-[1.12em] mx-[0.03em]",
    lg: "w-[1.15em] h-[1.15em] mx-[0.03em]",
    xl: "w-[1.18em] h-[1.18em] mx-[0.04em]",
    custom: "w-[1.15em] h-[1.15em] mx-[0.03em]"
  };

  return (
    <div className={`flex items-center select-none font-sans font-black ${sizeClasses[size]} ${className}`}>
      {/* "UDI" Part */}
      <span className="bg-gradient-to-b from-[#38BDF8] to-[#2563EB] bg-clip-text text-transparent">
        UDI
      </span>

      {/* First "O" Vinyl icon */}
      <VinylIcon className={vinylSizeClasses[size]} />

      {/* "SUN" Part */}
      <span className="bg-gradient-to-b from-[#38BDF8] to-[#2563EB] bg-clip-text text-transparent">
        SUN
      </span>

      {/* Second "O" Vinyl icon */}
      <VinylIcon className={vinylSizeClasses[size]} />

      {/* "V" Part and Futuristic Caret "A" (using Greek Lambda) */}
      <span className="bg-gradient-to-b from-[#38BDF8] to-[#2563EB] bg-clip-text text-transparent">
        VΛ
      </span>

      {/* Optional AI / Studio Suffix */}
      {showAiSuffix && (
        <span className="ml-1.5 text-[0.55em] font-bold tracking-widest text-[#38BDF8]/90 border border-[#38BDF8]/20 px-1.5 py-0.5 rounded-md bg-[#2563EB]/5 uppercase self-center">
          AI
        </span>
      )}
    </div>
  );
}
