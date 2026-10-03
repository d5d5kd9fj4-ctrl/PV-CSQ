/**
 * Constante unique pour le nom de l'application.
 * Modifier cette seule valeur met à jour toute l'interface.
 */
export const APP_NAME = 'POUVOIR & CONSÉQUENCE';

export const PSEUDO_STORAGE_KEY = 'pc_arcade_pseudo_v1';

export const VALIDATION_RULES = {
  PSEUDO_MIN: 2,
  PSEUDO_MAX: 20,
  POWER_MIN: 10,
  POWER_MAX: 200,
  CONSEQUENCE_MIN: 5,
  CONSEQUENCE_MAX: 160,
  ID_PATTERN: /^[a-zA-Z0-9_-]+$/,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 30,
} as const;

export type RouteHash = '#/accueil' | '#/repondre' | '#/creer' | '#/voter';

export interface NavItemConfig {
  hash: RouteHash;
  label: string;
  shortLabel: string;
  ariaLabel: string;
}

export const NAV_ITEMS: NavItemConfig[] = [
  {
    hash: '#/accueil',
    label: 'Accueil',
    shortLabel: 'Accueil',
    ariaLabel: 'Aller à l’accueil — Top des duos',
  },
  {
    hash: '#/repondre',
    label: 'Répondre',
    shortLabel: 'Répondre',
    ariaLabel: 'Aller à la page Répondre — Proposer une conséquence',
  },
  {
    hash: '#/creer',
    label: 'Créer',
    shortLabel: 'Créer',
    ariaLabel: 'Aller à la page Créer — Inventer un pouvoir',
  },
  {
    hash: '#/voter',
    label: 'Voter',
    shortLabel: 'Voter',
    ariaLabel: 'Aller à la page Voter — Voter pour les meilleurs duos',
  },
];
