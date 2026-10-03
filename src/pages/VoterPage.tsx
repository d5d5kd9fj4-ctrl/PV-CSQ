import React, { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';
import type { RouteHash } from '../constants';
import { listenPowers, type AppErrorState } from '../lib/db';
import { EmptyArenaIllustration } from '../components/MysticIcons';
import {
  ArcadeEmptyStage,
  ArcadeErrorState,
  ArcadeLoadingSkeleton,
  OfflineStatusBanner,
} from '../components/StateViews';

interface VoterPageProps {
  isOffline: boolean;
  globalError: AppErrorState | null;
  onRetryGlobal: () => void;
  onNavigate: (hash: RouteHash) => void;
}

export function VoterPage({
  isOffline,
  globalError,
  onRetryGlobal,
  onNavigate,
}: VoterPageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<AppErrorState | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setIsLoading(true);
    setPageError(null);

    const unsubscribe = listenPowers({
      pageSize: 20,
      onData: () => {
        setIsLoading(false);
      },
      onError: (err) => {
        setPageError(err);
        setIsLoading(false);
      },
    });

    return () => {
      unsubscribe();
    };
  }, [retryCount]);

  const activeError = pageError || globalError;

  const handleRetry = () => {
    setRetryCount((c) => c + 1);
    onRetryGlobal();
  };

  return (
    <section aria-labelledby="page-voter-title" className="space-y-6 animate-arcade-enter">
      {/* En-tête de la page */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#F4F2FF]/10 pb-5">
        <div>
          <p className="mb-1.5 inline-flex items-center gap-2 text-xs font-semibold text-[#FFB020]">
            <Flame className="h-4 w-4" aria-hidden="true" />
            <span>TRIBUNAL DES DUOS · BIENTÔT</span>
          </p>
          <h1
            id="page-voter-title"
            className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-gradient-mystic"
          >
            Voter pour les meilleurs
          </h1>
        </div>
        <p className="text-sm text-[#A6A1C8] max-w-sm">
          Élis la meilleure conséquence de chaque pouvoir et propulse tes duos favoris en tête du classement.
        </p>
      </div>

      {isOffline && <OfflineStatusBanner onRetry={handleRetry} />}

      {isLoading ? (
        <ArcadeLoadingSkeleton label="Ouverture des urnes mystiques…" />
      ) : activeError ? (
        <ArcadeErrorState error={activeError} onRetry={handleRetry} />
      ) : (
        <ArcadeEmptyStage
          illustration={<EmptyArenaIllustration />}
          comingSoonLabel="SYSTÈME DE VOTE BIENTÔT"
          title="Les urnes attendent leurs premiers candidats"
          description="Aucun vote factice ici : dès que des pouvoirs et leurs conséquences seront en lice, tu pourras voter une fois par pouvoir et par duo."
          actionLabel="Retourner au classement"
          actionTarget="#/accueil"
          onNavigate={onNavigate}
        />
      )}
    </section>
  );
}
