import React, { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import type { RouteHash } from '../constants';
import { listenPowers, type AppErrorState } from '../lib/db';
import { EmptySabotageIllustration } from '../components/MysticIcons';
import {
  ArcadeEmptyStage,
  ArcadeErrorState,
  ArcadeLoadingSkeleton,
  OfflineStatusBanner,
} from '../components/StateViews';

interface RepondrePageProps {
  isOffline: boolean;
  globalError: AppErrorState | null;
  onRetryGlobal: () => void;
  onNavigate: (hash: RouteHash) => void;
}

export function RepondrePage({
  isOffline,
  globalError,
  onRetryGlobal,
  onNavigate,
}: RepondrePageProps) {
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
    <section aria-labelledby="page-repondre-title" className="space-y-6 animate-arcade-enter">
      {/* En-tête de la page */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#F4F2FF]/10 pb-5">
        <div>
          <p className="mb-1.5 inline-flex items-center gap-2 text-xs font-semibold text-[#FF4D6D]">
            <Zap className="h-4 w-4" aria-hidden="true" />
            <span>LABORATOIRE DU CHAOS · BIENTÔT</span>
          </p>
          <h1
            id="page-repondre-title"
            className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-gradient-mystic"
          >
            Répondre à un pouvoir
          </h1>
        </div>
        <p className="text-sm text-[#A6A1C8] max-w-sm">
          Un pouvoir t’est présenté : à toi d’inventer la conséquence qui gâche tout avec panache.
        </p>
      </div>

      {isOffline && <OfflineStatusBanner onRetry={handleRetry} />}

      {isLoading ? (
        <ArcadeLoadingSkeleton label="Recherche de pouvoirs à saboter…" />
      ) : activeError ? (
        <ArcadeErrorState error={activeError} onRetry={handleRetry} />
      ) : (
        <ArcadeEmptyStage
          illustration={<EmptySabotageIllustration />}
          comingSoonLabel="INTERFACE DE RÉPONSE BIENTÔT"
          title="Aucun pouvoir à saboter dans l’immédiat"
          description="Cette salle permettra bientôt d’attacher tes conséquences les plus sournoises aux pouvoirs des autres joueurs. Commence par préparer le terrain !"
          actionLabel="Créer un pouvoir à piéger"
          actionTarget="#/creer"
          onNavigate={onNavigate}
        />
      )}
    </section>
  );
}
