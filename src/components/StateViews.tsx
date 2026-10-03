import React from 'react';
import {
  AlertTriangle,
  Clock,
  RefreshCw,
  ShieldAlert,
  WifiOff,
} from 'lucide-react';
import type { RouteHash } from '../constants';
import type { AppErrorState } from '../lib/db';

/**
 * Squelettes animés pendant le chargement initial ou réseau.
 */
export function ArcadeLoadingSkeleton({ label = 'Synchronisation du grimoire en temps réel…' }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full space-y-4 animate-arcade-enter"
    >
      <div className="flex items-center justify-between text-xs text-[#A6A1C8] px-1">
        <span>{label}</span>
        <span className="font-mono-num">TEMPS RÉEL</span>
      </div>

      <div className="arcade-surface p-6 space-y-5 animate-pulse">
        <div className="card-power p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 w-28 rounded-md bg-[#7C5CFF]/25" />
            <div className="h-4 w-14 rounded-md bg-[#1C1C3A]" />
          </div>
          <div className="h-5 w-4/5 rounded-md bg-[#F4F2FF]/15" />
          <div className="h-5 w-3/5 rounded-md bg-[#F4F2FF]/10" />
        </div>

        <div className="card-consequence p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 w-36 rounded-md bg-[#FF4D6D]/25" />
            <div className="h-4 w-16 rounded-md bg-[#1C1C3A]" />
          </div>
          <div className="h-5 w-3/4 rounded-md bg-[#F4F2FF]/15" />
          <div className="h-5 w-1/2 rounded-md bg-[#F4F2FF]/10" />
        </div>
      </div>
    </div>
  );
}

/**
 * Bandeau global lorsque le navigateur est hors-ligne.
 */
export function OfflineStatusBanner({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="mb-6 rounded-2xl border border-[#FF4D6D]/50 bg-[#1C1C3A]/95 p-4 shadow-lg animate-arcade-enter"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF4D6D]/20 text-[#FF4D6D]">
            <WifiOff className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="font-display text-base font-bold text-[#F4F2FF]">
              Tu es hors-ligne
            </p>
            <p className="text-sm text-[#A6A1C8]">
              Les ondes astrales sont coupées. Vérifie ta connexion Internet pour voir les actions des autres joueurs en direct.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="btn-mystic-secondary inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C5CFF]"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          <span>Réessayer</span>
        </button>
      </div>
    </div>
  );
}

/**
 * Affichage dédié aux erreurs : Quota atteint, Hors-ligne, Auth anonyme non activée ou Erreur réseau.
 */
export function ArcadeErrorState({
  error,
  onRetry,
}: {
  error: AppErrorState;
  onRetry: () => void;
}) {
  if (error.kind === 'quota') {
    return (
      <div
        role="alert"
        className="arcade-surface p-6 sm:p-8 text-center animate-arcade-enter border-[#FFB020]/40"
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFB020]/15 text-[#FFB020]">
          <Clock className="h-7 w-7" aria-hidden="true" />
        </div>
        <h2 className="font-display text-xl sm:text-2xl font-bold text-[#F4F2FF] mb-2">
          Le jeu fait une pause, reviens plus tard
        </h2>
        <p className="mx-auto max-w-md text-sm sm:text-base text-[#A6A1C8] mb-6">
          Le quota quotidien gratuit de la base partagée a été atteint après une séance intense. Les compteurs se réinitialisent automatiquement demain !
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="btn-mystic-secondary inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB020]"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          <span>Vérifier à nouveau</span>
        </button>
      </div>
    );
  }

  if (error.kind === 'auth-disabled') {
    return (
      <div
        role="alert"
        className="arcade-surface p-6 sm:p-8 text-center animate-arcade-enter border-[#FFB020]/50"
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFB020]/15 text-[#FFB020]">
          <ShieldAlert className="h-7 w-7" aria-hidden="true" />
        </div>
        <h2 className="font-display text-xl sm:text-2xl font-bold text-[#F4F2FF] mb-2">
          Activation requise dans la console Firebase
        </h2>
        <p className="mx-auto max-w-lg text-sm sm:text-base text-[#A6A1C8] mb-6">
          {error.message}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="btn-mystic-primary inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C5CFF]"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          <span>Réessayer la connexion</span>
        </button>
      </div>
    );
  }

  return (
    <div
      role="alert"
      className="arcade-surface p-6 sm:p-8 text-center animate-arcade-enter border-[#FF4D6D]/45"
    >
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF4D6D]/15 text-[#FF4D6D]">
        <AlertTriangle className="h-7 w-7" aria-hidden="true" />
      </div>
      <h2 className="font-display text-xl sm:text-2xl font-bold text-[#F4F2FF] mb-2">
        {error.title}
      </h2>
      <p className="mx-auto max-w-md text-sm sm:text-base text-[#A6A1C8] mb-6">
        {error.message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="btn-mystic-primary inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C5CFF]"
      >
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
        <span>Réessayer</span>
      </button>
    </div>
  );
}

/**
 * Carte d'état vide soignée et engageante pour les 4 écrans squelettes.
 */
export function ArcadeEmptyStage({
  illustration,
  title,
  description,
  comingSoonLabel,
  actionLabel,
  actionTarget,
  onNavigate,
}: {
  illustration: React.ReactNode;
  title: string;
  description: string;
  comingSoonLabel: string;
  actionLabel: string;
  actionTarget: RouteHash;
  onNavigate: (hash: RouteHash) => void;
}) {
  return (
    <div className="arcade-surface p-6 sm:p-10 text-center animate-arcade-enter">
      {/* Illustration CSS/SVG dédiée */}
      <div className="mb-6">{illustration}</div>

      {/* Indication "bientôt" en typographie épurée avec séparateur */}
      <p className="mb-3 text-xs font-semibold tracking-wider text-[#FFB020]">
        <span>ÉTAT VIDE</span>
        <span className="mx-2 text-[#A6A1C8]" aria-hidden="true">·</span>
        <span>{comingSoonLabel}</span>
      </p>

      <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F4F2FF] mb-3 max-w-xl mx-auto">
        {title}
      </h2>

      <p className="mx-auto max-w-lg text-base text-[#A6A1C8] leading-relaxed mb-8">
        {description}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => onNavigate(actionTarget)}
          className="btn-mystic-primary btn-vote-bounce inline-flex min-h-[48px] w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl px-6 py-3 text-base font-semibold whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C5CFF]"
        >
          <span>{actionLabel}</span>
        </button>
      </div>
    </div>
  );
}
