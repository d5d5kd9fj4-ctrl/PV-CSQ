import React, { useEffect, useId, useState } from 'react';
import { Check, Sparkles, UserCheck, X } from 'lucide-react';
import { APP_NAME, VALIDATION_RULES } from '../constants';
import { ArcadeCrestLogo } from './MysticIcons';

interface PseudoModalProps {
  isOpen: boolean;
  currentPseudo: string;
  canClose: boolean;
  onSave: (newPseudo: string) => void;
  onClose: () => void;
}

const SUGGESTED_PSEUDOS = [
  'MageDuChaos',
  'OracleAstral',
  'SaboteurCosmique',
  'SorcierMalicieux',
];

export function PseudoModal({
  isOpen,
  currentPseudo,
  canClose,
  onSave,
  onClose,
}: PseudoModalProps) {
  const [value, setValue] = useState(currentPseudo);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputId = useId();
  const errorId = useId();

  useEffect(() => {
    if (isOpen) {
      setValue(currentPseudo);
      setErrorMessage(null);
    }
  }, [isOpen, currentPseudo]);

  if (!isOpen) return null;

  const trimmed = value.trim().replace(/\s+/g, ' ');
  const length = trimmed.length;
  const isValid =
    length >= VALIDATION_RULES.PSEUDO_MIN &&
    length <= VALIDATION_RULES.PSEUDO_MAX;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      setErrorMessage(
        `Ton pseudo doit faire entre ${VALIDATION_RULES.PSEUDO_MIN} et ${VALIDATION_RULES.PSEUDO_MAX} caractères.`
      );
      return;
    }
    onSave(trimmed);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pseudo-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0B14]/85 backdrop-blur-md p-4"
    >
      <div className="arcade-surface relative w-full max-w-md p-6 sm:p-8 border-[#7C5CFF]/45 animate-arcade-enter">
        {canClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la fenêtre de profil"
            className="absolute right-4 top-4 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-[#A6A1C8] hover:bg-[#1C1C3A] hover:text-[#F4F2FF] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C5CFF]"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        )}

        <div className="mb-5 flex items-center gap-3">
          <ArcadeCrestLogo className="h-11 w-11 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-[#B8A5FF]">
              {APP_NAME}
            </p>
            <h2
              id="pseudo-modal-title"
              className="font-display text-xl sm:text-2xl font-bold text-[#F4F2FF]"
            >
              {canClose ? 'Modifier ton pseudo' : 'Entre dans l’arène'}
            </h2>
          </div>
        </div>

        <p className="mb-6 text-sm sm:text-base text-[#A6A1C8] leading-relaxed">
          Pas de compte ni de mot de passe : choisis simplement ton nom de scène pour signer tes pouvoirs et tes conséquences les plus tordues.
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor={inputId}
                className="text-sm font-semibold text-[#F4F2FF]"
              >
                Ton pseudo de joueur
              </label>
              <span
                className={`text-xs font-mono-num ${
                  length > 0 && !isValid ? 'text-[#FF4D6D]' : 'text-[#A6A1C8]'
                }`}
              >
                {length}/{VALIDATION_RULES.PSEUDO_MAX}
              </span>
            </div>

            <input
              id={inputId}
              type="text"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              maxLength={VALIDATION_RULES.PSEUDO_MAX}
              placeholder="Ex. : ArchitecteDuChaos"
              autoFocus
              aria-invalid={Boolean(errorMessage)}
              aria-describedby={errorMessage ? errorId : undefined}
              className="w-full min-h-[48px] rounded-xl border border-[#7C5CFF]/40 bg-[#0B0B14] px-4 py-3 text-base text-[#F4F2FF] placeholder-[#A6A1C8]/50 focus:border-[#7C5CFF] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C5CFF]"
            />

            {errorMessage ? (
              <p id={errorId} role="alert" className="mt-2 text-xs text-[#FF4D6D]">
                {errorMessage}
              </p>
            ) : (
              <p className="mt-2 text-xs text-[#A6A1C8]">
                Entre {VALIDATION_RULES.PSEUDO_MIN} et {VALIDATION_RULES.PSEUDO_MAX} caractères · Stocké sur cet appareil
              </p>
            )}
          </div>

          {/* Suggestions rapides en un clic */}
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-[#A6A1C8]">
              <Sparkles className="h-3.5 w-3.5 text-[#FFB020]" aria-hidden="true" />
              <span>En panne d’inspiration ?</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_PSEUDOS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    setValue(suggestion);
                    setErrorMessage(null);
                  }}
                  className="min-h-[38px] rounded-lg border border-[#F4F2FF]/10 bg-[#1C1C3A] px-3 py-1.5 text-xs font-medium text-[#F4F2FF] hover:border-[#7C5CFF]/60 hover:bg-[#7C5CFF]/15 cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-[#7C5CFF]"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            {canClose && (
              <button
                type="button"
                onClick={onClose}
                className="btn-mystic-secondary min-h-[48px] flex-1 rounded-xl px-4 py-3 text-base font-semibold cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C5CFF]"
              >
                Annuler
              </button>
            )}
            <button
              type="submit"
              disabled={!isValid}
              className="btn-mystic-primary min-h-[48px] flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-base font-semibold disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C5CFF]"
            >
              {canClose ? (
                <>
                  <Check className="h-5 w-5" aria-hidden="true" />
                  <span>Enregistrer</span>
                </>
              ) : (
                <>
                  <UserCheck className="h-5 w-5" aria-hidden="true" />
                  <span>Valider mon pseudo</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
