import React from 'react';
import {
  Flame,
  PlusCircle,
  Trophy,
  UserRound,
  Zap,
} from 'lucide-react';
import { APP_NAME, NAV_ITEMS, type RouteHash } from '../constants';
import { ArcadeCrestLogo } from './MysticIcons';

interface AppShellProps {
  currentRoute: RouteHash;
  pseudo: string;
  onNavigate: (hash: RouteHash) => void;
  onOpenPseudoModal: () => void;
  children: React.ReactNode;
}

function getNavIcon(hash: RouteHash, isActive: boolean) {
  const iconClass = `h-5 w-5 transition-transform duration-150 ${
    isActive ? 'scale-110' : ''
  }`;
  switch (hash) {
    case '#/accueil':
      return <Trophy className={iconClass} aria-hidden="true" />;
    case '#/repondre':
      return <Zap className={iconClass} aria-hidden="true" />;
    case '#/creer':
      return <PlusCircle className={iconClass} aria-hidden="true" />;
    case '#/voter':
      return <Flame className={iconClass} aria-hidden="true" />;
  }
}

export function AppShell({
  currentRoute,
  pseudo,
  onNavigate,
  onOpenPseudoModal,
  children,
}: AppShellProps) {
  return (
    <div className="min-h-dvh flex flex-col bg-[#0B0B14] text-[#F4F2FF]">
      {/* En-tête commun (Contrat 3 zones : Marque unique | Navigation Desktop | Action Profil) */}
      <header className="sticky top-0 z-30 h-14 sm:h-16 border-b border-[#F4F2FF]/10 bg-[#0B0B14]/90 backdrop-blur-md">
        <div className="mx-auto flex h-full w-full max-w-[960px] items-center justify-between px-4 sm:px-6 gap-2">
          {/* Zone 1 : Logo + APP_NAME */}
          <a
            href="#/accueil"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('#/accueil');
            }}
            className="inline-flex min-h-[44px] items-center gap-2.5 rounded-xl pr-2 font-display text-sm sm:text-lg font-extrabold tracking-tight text-[#F4F2FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C5CFF] truncate"
          >
            <ArcadeCrestLogo className="h-8 w-8 shrink-0" />
            <span className="text-gradient-mystic truncate">{APP_NAME}</span>
          </a>

          {/* Zone 2 : Barre de navigation en HAUT sur ordinateur */}
          <nav
            aria-label="Navigation principale sur ordinateur"
            className="hidden md:flex items-center gap-1"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = currentRoute === item.hash;
              return (
                <a
                  key={item.hash}
                  href={item.hash}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(item.hash);
                  }}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={item.ariaLabel}
                  className={`relative inline-flex min-h-[44px] items-center gap-2 px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C5CFF] ${
                    isActive
                      ? 'text-[#F4F2FF] bg-[#1C1C3A] shadow-[0_0_20px_-6px_rgba(124,92,255,0.6)]'
                      : 'text-[#A6A1C8] hover:text-[#F4F2FF] hover:bg-[#14142A]'
                  }`}
                >
                  <span
                    className={
                      isActive ? 'text-[#7C5CFF]' : 'text-[#A6A1C8]'
                    }
                  >
                    {getNavIcon(item.hash, isActive)}
                  </span>
                  <span>{item.label}</span>
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-1 left-4 right-4 h-0.5 rounded-full bg-gradient-to-r from-[#7C5CFF] to-[#FF4D6D]"
                    />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Zone 3 : Pseudo du joueur modifiable via icône de profil */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={onOpenPseudoModal}
              aria-label={
                pseudo
                  ? `Pseudo actuel : ${pseudo}. Cliquer pour modifier.`
                  : 'Choisir un pseudo de joueur'
              }
              title="Modifier mon pseudo"
              className="btn-mystic-secondary inline-flex min-h-[44px] max-w-[165px] sm:max-w-[200px] items-center gap-2 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-semibold text-[#F4F2FF] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C5CFF]"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#7C5CFF]/25 text-[#B8A5FF]">
                <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span className="truncate">
                {pseudo || 'Choisir pseudo'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Contenu principal centré (largeur max ~960px, marge basse sur mobile pour la barre d'onglets) */}
      <main className="mx-auto w-full max-w-[960px] flex-1 px-4 sm:px-6 pt-6 pb-24 md:pb-12">
        {children}
      </main>

      {/* Barre de navigation en BAS sur mobile (4 onglets avec icônes) */}
      <nav
        aria-label="Navigation principale sur mobile"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[#F4F2FF]/10 bg-[#0B0B14]/95 backdrop-blur-md"
      >
        <div className="mx-auto grid max-w-[960px] grid-cols-4 items-center px-2 py-1">
          {NAV_ITEMS.map((item) => {
            const isActive = currentRoute === item.hash;
            return (
              <a
                key={item.hash}
                href={item.hash}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(item.hash);
                }}
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.ariaLabel}
                className={`relative flex min-h-[48px] flex-col items-center justify-center rounded-xl py-1 px-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C5CFF] ${
                  isActive
                    ? 'text-[#F4F2FF] bg-[#1C1C3A]/90'
                    : 'text-[#A6A1C8] hover:text-[#F4F2FF]'
                }`}
              >
                <span
                  className={
                    isActive ? 'text-[#7C5CFF]' : 'text-[#A6A1C8]'
                  }
                >
                  {getNavIcon(item.hash, isActive)}
                </span>
                <span
                  className={`mt-0.5 text-[11px] font-semibold tracking-tight whitespace-nowrap truncate ${
                    isActive ? 'text-[#F4F2FF]' : 'text-[#A6A1C8]'
                  }`}
                >
                  {item.shortLabel}
                </span>
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute top-0.5 h-1 w-6 rounded-full bg-gradient-to-r from-[#7C5CFF] to-[#FF4D6D]"
                  />
                )}
              </a>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
