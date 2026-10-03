import React, { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import type { RouteHash } from '../constants';
import { listenTopDuos, type AppErrorState } from '../lib/db';
import { EmptyDuoIllustration } from '../components/MysticIcons';
import {
  ArcadeEmptyStage,
  ArcadeErrorState,
  ArcadeLoadingSkeleton,
  OfflineStatusBanner,
} from '../components/StateViews';

interface AccueilPageProps {
  isOffline: boolean;
  globalError: AppErrorState | null;
  onRetryGlobal: () => void;
  onNavigate: (hash: RouteHash) => void;
}

export function AccueilPage({
  isOffline,
  globalError,
  onRetryGlobal,
  onNavigate,
}: AccueilPageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<AppErrorState | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setIsLoading(true);
    setPageError(null);

    const unsubscribe = listenTopDuos({
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
    <section aria-labelledby="page-accueil-title" className="space-y-6 animate-arcade-enter">
      {/* En-tête de la page */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#F4F2FF]/10 pb-5">
        <div>
          <p className="mb-1.5 inline-flex items-center gap-2 text-xs font-semibold text-[#FFB020]">
            <Trophy className="h-4 w-4" aria-hidden="true" />
            <span>CLASSEMENT COMMUNAUTAIRE · BIENTÔT</span>
          </p>
          <h1
            id="page-accueil-title"
            className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-gradient-mystic"
          >
            Top des duos
          </h1>
        </div>
        <p className="text-sm text-[#A6A1C8] max-w-sm">
          Les associations Pouvoir + Conséquence les plus plébiscitées par les joueurs en temps réel.
        </p>
      </div>

      {isOffline && <OfflineStatusBanner onRetry={handleRetry} />}

      {isLoading ? (
        <ArcadeLoadingSkeleton label="Consultation du panthéon des duos…" />
      ) : activeError ? (
        <ArcadeErrorState error={activeError} onRetry={handleRetry} />
      ) : (
        <ArcadeEmptyStage
          illustration={<EmptyDuoIllustration />}
          comingSoonLabel="CLASSEMENT EN DIRECT BIENTÔT"
          title="Aucun duo au sommet… pour l’instant !"
          description="L’arène est vierge. Dès que les premiers pouvoirs seront forgés et sabotés par une conséquence, les duos les plus votés s’afficheront ici en direct."
          actionLabel="Forger le premier pouvoir"
          actionTarget="#/creer"
          onNavigate={onNavigate}
        />
      )}
    </section>
  );
}
