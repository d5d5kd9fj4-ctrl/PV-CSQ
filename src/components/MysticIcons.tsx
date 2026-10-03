import React from 'react';

export function SparklePowerIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 2L14.6 8.8L21.5 11.5L14.6 14.2L12 21L9.4 14.2L2.5 11.5L9.4 8.8L12 2Z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="19" cy="5" r="1.2" fill="currentColor" />
      <circle cx="5" cy="18" r="1" fill="currentColor" />
    </svg>
  );
}

export function BrokenBoltConsequenceIcon({
  className = 'w-5 h-5',
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M13.5 2L5 13H11.5L9.5 22L19 10.5H12.5L13.5 2Z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 6L7 8M20 16L17 14"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ArcadeCrestLogo({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="2"
        y="2"
        width="32"
        height="32"
        rx="10"
        className="fill-[#1C1C3A] stroke-[#7C5CFF]/60"
        strokeWidth="1.5"
      />
      {/* Demi-étincelle Pouvoir (Violet) */}
      <path
        d="M14 7L16.2 13.2L22 15.5L16.2 17.8L14 24L11.8 17.8L6 15.5L11.8 13.2L14 7Z"
        className="fill-[#7C5CFF]/30 stroke-[#7C5CFF]"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* Éclair brisé Conséquence (Corail) */}
      <path
        d="M23.5 11L17.5 19.5H22L20.5 28L28 18.5H23L23.5 11Z"
        className="fill-[#FF4D6D]/35 stroke-[#FF4D6D]"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function EmptyDuoIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-[340px] py-2 select-none" aria-hidden="true">
      {/* Carte Pouvoir abstraite (sans aucun texte d'exemple) */}
      <div className="card-power p-4 mb-2 animate-arcade-float">
        <div className="flex items-center justify-between mb-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#B8A5FF]">
            <SparklePowerIcon className="w-4 h-4 text-[#7C5CFF]" />
            <span>Carte Pouvoir</span>
          </div>
          <span className="text-xs font-mono-num text-[#A6A1C8]">0 vote</span>
        </div>
        <div className="space-y-2">
          <div className="h-2.5 w-4/5 rounded-full bg-[#7C5CFF]/25" />
          <div className="h-2.5 w-3/5 rounded-full bg-[#7C5CFF]/15" />
        </div>
      </div>

      {/* Connecteur central du Duo */}
      <div className="relative z-10 -my-3 mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-[#1C1C3A] border border-[#FFB020]/50 text-[#FFB020] shadow-md">
        <span className="text-xs font-bold">+</span>
      </div>

      {/* Carte Conséquence abstraite (sans aucun texte d'exemple) */}
      <div className="card-consequence p-4 mt-2">
        <div className="flex items-center justify-between mb-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#FF8FA3]">
            <BrokenBoltConsequenceIcon className="w-4 h-4 text-[#FF4D6D]" />
            <span>Carte Conséquence</span>
          </div>
          <span className="text-xs font-mono-num text-[#A6A1C8]">Duo · 0</span>
        </div>
        <div className="space-y-2">
          <div className="h-2.5 w-3/4 rounded-full bg-[#FF4D6D]/25" />
          <div className="h-2.5 w-1/2 rounded-full bg-[#FF4D6D]/15" />
        </div>
      </div>
    </div>
  );
}

export function EmptySabotageIllustration() {
  return (
    <div className="mx-auto flex flex-col items-center justify-center py-2" aria-hidden="true">
      <svg viewBox="0 0 180 120" fill="none" className="w-44 h-28 animate-arcade-float">
        {/* Cercle mystique de fond */}
        <circle
          cx="90"
          cy="60"
          r="46"
          className="fill-[#1C1C3A] stroke-[#FF4D6D]/35"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        {/* Carte Pouvoir en attente */}
        <rect
          x="36"
          y="30"
          width="66"
          height="46"
          rx="10"
          className="fill-[#14142A] stroke-[#7C5CFF]"
          strokeWidth="1.8"
        />
        <line x1="48" y1="46" x2="86" y2="46" className="stroke-[#7C5CFF]/50" strokeWidth="3" strokeLinecap="round" />
        <line x1="48" y1="56" x2="74" y2="56" className="stroke-[#7C5CFF]/30" strokeWidth="3" strokeLinecap="round" />

        {/* Carte Conséquence qui vient percuter */}
        <rect
          x="78"
          y="46"
          width="66"
          height="46"
          rx="10"
          className="fill-[#1C1C3A] stroke-[#FF4D6D]"
          strokeWidth="1.8"
        />
        <path
          d="M114 54L106 66H113L110 78L120 64H113L114 54Z"
          className="fill-[#FF4D6D]/30 stroke-[#FF4D6D]"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export function EmptyForgeIllustration() {
  return (
    <div className="mx-auto flex flex-col items-center justify-center py-2" aria-hidden="true">
      <svg viewBox="0 0 180 120" fill="none" className="w-44 h-28 animate-arcade-float">
        <circle
          cx="90"
          cy="60"
          r="46"
          className="fill-[#1C1C3A] stroke-[#7C5CFF]/35"
          strokeWidth="1.5"
          strokeDasharray="5 5"
        />
        <rect
          x="52"
          y="22"
          width="76"
          height="76"
          rx="18"
          className="fill-[#14142A] stroke-[#7C5CFF]"
          strokeWidth="2"
        />
        <path
          d="M90 36L95.5 51.5L111 57L95.5 62.5L90 78L84.5 62.5L69 57L84.5 51.5L90 36Z"
          className="fill-[#7C5CFF]/25 stroke-[#7C5CFF]"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <circle cx="114" cy="36" r="3" className="fill-[#FFB020]" />
        <circle cx="68" cy="78" r="2.5" className="fill-[#3DDC97]" />
      </svg>
    </div>
  );
}

export function EmptyArenaIllustration() {
  return (
    <div className="mx-auto flex flex-col items-center justify-center py-2" aria-hidden="true">
      <svg viewBox="0 0 180 120" fill="none" className="w-44 h-28 animate-arcade-float">
        <circle
          cx="90"
          cy="60"
          r="46"
          className="fill-[#1C1C3A] stroke-[#FFB020]/35"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        {/* Carte gauche (Violet) */}
        <rect
          x="38"
          y="34"
          width="48"
          height="56"
          rx="10"
          className="fill-[#14142A] stroke-[#7C5CFF]"
          strokeWidth="1.8"
        />
        {/* Carte droite (Corail) */}
        <rect
          x="94"
          y="34"
          width="48"
          height="56"
          rx="10"
          className="fill-[#14142A] stroke-[#FF4D6D]"
          strokeWidth="1.8"
        />
        {/* Couronne / Étoile d'arbitrage au sommet */}
        <path
          d="M90 16L94 26L105 27L96.5 34L99 44L90 38.5L81 44L83.5 34L75 27L86 26L90 16Z"
          className="fill-[#FFB020]/30 stroke-[#FFB020]"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
