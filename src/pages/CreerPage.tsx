import React from 'react';
import { PlusCircle } from 'lucide-react';
import type { RouteHash } from '../constants';
import type { AppErrorState } from '../lib/db';
import { EmptyForgeIllustration } from '../components/MysticIcons';
import {
  ArcadeEmptyStage,
  ArcadeErrorState,
  OfflineStatusBanner,
} from '../components/StateViews';

interface CreerPageProps {
  isOffline: boolean;
  globalError: AppErrorState | null;
  onRetryGlobal: () => void;
  onNavigate: (hash: RouteHash) => void;
}

export function CreerPage({
  isOffline,
  globalError,
  onRetryGlobal,
  onNavigate,
}: CreerPageProps) {
  return (
    <section aria-labelledby="page-creer-title" className="space-y-6 animate-arcade-enter">
      {/* En-tête de la page */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#F4F2FF]/10 pb-5">
        <div>
          <p className="mb-1.5 inline-flex items-center gap-2 text-xs font-semibold text-[#B8A5FF]">
            <PlusCircle className="h-4 w-4 text-[#7C5CFF]" aria-hidden="true" />
            <span>LA FORGE DES POUVOIRS · BIENTÔT</span>
          </p>
          <h1
            id="page-creer-title"
            className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-gradient-mystic"
          >
            Créer un pouvoir
          </h1>
        </div>
        <p className="text-sm text-[#A6A1C8] max-w-sm">
          Imagine une capacité extraordinaire (10 à 200 caractères) et défie la communauté de lui trouver une faille.
        </p>
      </div>

      {isOffline && <OfflineStatusBanner onRetry={onRetryGlobal} />}

      {globalError ? (
        <ArcadeErrorState error={globalError} onRetry={onRetryGlobal} />
      ) : (
        <ArcadeEmptyStage
          illustration={<EmptyForgeIllustration />}
          comingSoonLabel="FORMULAIRE D’INVOCATION BIENTÔT"
          title="La forge mystique chauffe ses cristaux"
          description="Aucun pouvoir prédéfini n’habite ce lieu. Le formulaire de création arrive très bientôt pour te permettre d’expédier tes idées en temps réel sur tous les écrans."
          actionLabel="Explorer l’arène des votes"
          actionTarget="#/voter"
          onNavigate={onNavigate}
        />
      )}
    </section>
  );
}
