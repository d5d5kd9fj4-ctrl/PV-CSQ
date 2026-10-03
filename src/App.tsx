import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCw, ShieldAlert } from 'lucide-react';
import {
  APP_NAME,
  PSEUDO_STORAGE_KEY,
  VALIDATION_RULES,
  type RouteHash,
} from './constants';
import {
  ensureAnonymousAuth,
  subscribeToAnonymousAuth,
  classifyAppError,
  type AppErrorState,
} from './lib/db';
import { AppShell } from './components/AppShell';
import { PseudoModal } from './components/PseudoModal';
import { AccueilPage } from './pages/AccueilPage';
import { RepondrePage } from './pages/RepondrePage';
import { CreerPage } from './pages/CreerPage';
import { VoterPage } from './pages/VoterPage';

const VALID_HASHES: RouteHash[] = [
  '#/accueil',
  '#/repondre',
  '#/creer',
  '#/voter',
];

function parseCurrentHash(): RouteHash {
  if (typeof window === 'undefined') return '#/accueil';
  const raw = window.location.hash.toLowerCase() as RouteHash;
  if (VALID_HASHES.includes(raw)) {
    return raw;
  }
  return '#/accueil';
}

function readStoredPseudo(): string {
  if (typeof window === 'undefined') return '';
  try {
    const raw = window.localStorage.getItem(PSEUDO_STORAGE_KEY) ?? '';
    const cleaned = raw.trim().replace(/\s+/g, ' ');
    if (
      cleaned.length >= VALIDATION_RULES.PSEUDO_MIN &&
      cleaned.length <= VALIDATION_RULES.PSEUDO_MAX
    ) {
      return cleaned;
    }
    return '';
  } catch {
    return '';
  }
}

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<RouteHash>(parseCurrentHash);
  const [pseudo, setPseudo] = useState<string>(readStoredPseudo);
  const [isPseudoModalOpen, setIsPseudoModalOpen] = useState<boolean>(
    () => readStoredPseudo().length === 0
  );
  const [isOffline, setIsOffline] = useState<boolean>(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );
  const [authError, setAuthError] = useState<AppErrorState | null>(null);

  // Synchronisation du titre du document avec la constante unique APP_NAME
  useEffect(() => {
    document.title = `${APP_NAME} — Jeu social d'arcade mystique`;
  }, []);

  // Gestion de la navigation par hash (#/accueil, #/repondre, #/creer, #/voter)
  useEffect(() => {
    const currentHash = window.location.hash.toLowerCase() as RouteHash;
    if (!VALID_HASHES.includes(currentHash)) {
      window.location.hash = '#/accueil';
    } else {
      setCurrentRoute(currentHash);
    }

    const handleHashChange = () => {
      setCurrentRoute(parseCurrentHash());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Détection en temps réel de l'état réseau (en ligne / hors-ligne)
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Authentification anonyme Firebase au démarrage
  useEffect(() => {
    const unsubscribe = subscribeToAnonymousAuth(
      () => {
        setAuthError(null);
      },
      (err) => {
        setAuthError(err);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleRetryAuth = useCallback(async () => {
    try {
      setAuthError(null);
      await ensureAnonymousAuth();
    } catch (err) {
      setAuthError(classifyAppError(err));
    }
  }, []);

  const handleNavigate = useCallback((targetHash: RouteHash) => {
    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    } else {
      setCurrentRoute(targetHash);
    }
  }, []);

  const handleSavePseudo = useCallback((newPseudo: string) => {
    try {
      window.localStorage.setItem(PSEUDO_STORAGE_KEY, newPseudo);
    } catch {
      // Ignore les erreurs de quota localStorage éventuelles
    }
    setPseudo(newPseudo);
    setIsPseudoModalOpen(false);
  }, []);

  // Si l'erreur d'auth est uniquement l'activation manuelle d'Anonymous Auth dans la console,
  // on affiche une bannière discrète sans bloquer l'affichage des 4 pages squelettes.
  const blockingGlobalError =
    authError && authError.kind !== 'auth-disabled' ? authError : null;

  return (
    <AppShell
      currentRoute={currentRoute}
      pseudo={pseudo}
      onNavigate={handleNavigate}
      onOpenPseudoModal={() => setIsPseudoModalOpen(true)}
    >
      {authError?.kind === 'auth-disabled' && (
        <div
          role="status"
          className="mb-6 rounded-2xl border border-[#FFB020]/40 bg-[#14142A]/95 p-4 animate-arcade-enter"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFB020]/15 text-[#FFB020]">
                <ShieldAlert className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="text-xs sm:text-sm">
                <p className="font-semibold text-[#F4F2FF]">
                  Authentification anonyme en attente d’activation
                </p>
                <p className="text-[#A6A1C8]">
                  Active le mode « Anonyme » dans la console Firebase pour débloquer l’écriture en base lors des prochaines étapes.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRetryAuth}
              className="btn-mystic-secondary inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C5CFF]"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Vérifier</span>
            </button>
          </div>
        </div>
      )}

      {currentRoute === '#/accueil' && (
        <AccueilPage
          isOffline={isOffline}
          globalError={blockingGlobalError}
          onRetryGlobal={handleRetryAuth}
          onNavigate={handleNavigate}
        />
      )}

      {currentRoute === '#/repondre' && (
        <RepondrePage
          isOffline={isOffline}
          globalError={blockingGlobalError}
          onRetryGlobal={handleRetryAuth}
          onNavigate={handleNavigate}
        />
      )}

      {currentRoute === '#/creer' && (
        <CreerPage
          isOffline={isOffline}
          globalError={blockingGlobalError}
          onRetryGlobal={handleRetryAuth}
          onNavigate={handleNavigate}
        />
      )}

      {currentRoute === '#/voter' && (
        <VoterPage
          isOffline={isOffline}
          globalError={blockingGlobalError}
          onRetryGlobal={handleRetryAuth}
          onNavigate={handleNavigate}
        />
      )}

      <PseudoModal
        isOpen={isPseudoModalOpen}
        currentPseudo={pseudo}
        canClose={pseudo.length >= VALIDATION_RULES.PSEUDO_MIN}
        onSave={handleSavePseudo}
        onClose={() => {
          if (pseudo.length >= VALIDATION_RULES.PSEUDO_MIN) {
            setIsPseudoModalOpen(false);
          }
        }}
      />
    </AppShell>
  );
}
