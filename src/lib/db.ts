import {
  onAuthStateChanged,
  signInAnonymously,
  type User,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDocFromServer,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  startAfter,
  where,
  writeBatch,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { VALIDATION_RULES } from '../constants';
import { auth, db } from './firebase';

export { auth, db };

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid ?? null,
      email: auth.currentUser?.email ?? null,
      emailVerified: auth.currentUser?.emailVerified ?? null,
      isAnonymous: auth.currentUser?.isAnonymous ?? null,
      tenantId: auth.currentUser?.tenantId ?? null,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export type AppErrorKind = 'offline' | 'quota' | 'auth-disabled' | 'network';

export interface AppErrorState {
  kind: AppErrorKind;
  title: string;
  message: string;
  raw?: string;
}

export function classifyAppError(error: unknown): AppErrorState {
  const rawMessage = error instanceof Error ? error.message : String(error);
  const lower = rawMessage.toLowerCase();

  if (
    (typeof navigator !== 'undefined' && !navigator.onLine) ||
    lower.includes('client is offline') ||
    lower.includes('network-request-failed') ||
    lower.includes('unavailable')
  ) {
    return {
      kind: 'offline',
      title: 'Mode hors-ligne détecté',
      message:
        'Ta connexion semble coupée. Rebranche les câbles mystiques et réessaie.',
      raw: rawMessage,
    };
  }

  if (
    lower.includes('quota exceeded') ||
    lower.includes('resource-exhausted')
  ) {
    return {
      kind: 'quota',
      title: 'Pause mystique',
      message: 'Le jeu fait une pause, reviens plus tard.',
      raw: rawMessage,
    };
  }

  if (
    lower.includes('auth/admin-restricted-operation') ||
    lower.includes('auth/operation-not-allowed')
  ) {
    return {
      kind: 'auth-disabled',
      title: 'Authentification anonyme à activer',
      message:
        'Active le fournisseur « Anonyme » dans la console Firebase (Authentication > Sign-in method) pour permettre aux joueurs de rejoindre la partie sans compte.',
      raw: rawMessage,
    };
  }

  return {
    kind: 'network',
    title: 'Interférence dans l’arcade',
    message:
      'Impossible de synchroniser les données avec le serveur pour le moment.',
    raw: rawMessage,
  };
}

// Validation de la connexion au démarrage
async function testConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'powers', 'connection_check'));
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('the client is offline')
    ) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
void testConnection();

// Modèles de documents Firestore
export interface PowerDoc {
  id: string;
  text: string;
  authorUid: string;
  authorName: string;
  createdAt: Timestamp | null;
  consequenceCount: number;
  bestConsequenceId: string | null;
  bestConsequenceVotes: number;
}

export interface ConsequenceDoc {
  id: string;
  powerId: string;
  powerText: string;
  text: string;
  authorUid: string;
  authorName: string;
  createdAt: Timestamp | null;
  votes: number;
  duoVotes: number;
}

export interface ConsequenceVoteDoc {
  id: string;
  uid: string;
  powerId: string;
  consequenceId: string;
  createdAt: Timestamp | null;
}

export interface DuoVoteDoc {
  id: string;
  uid: string;
  powerId: string;
  consequenceId: string;
  createdAt: Timestamp | null;
}

export interface PaginatedResult<T> {
  items: T[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

// Validation défensive côté client (synchronisée avec firebase-blueprint.json & firestore.rules)
function sanitizeAndValidateText(
  value: string,
  min: number,
  max: number,
  fieldLabel: string
): string {
  const cleaned = value.trim().replace(/\s+/g, ' ');
  if (cleaned.length < min || cleaned.length > max) {
    throw new Error(
      `Le champ ${fieldLabel} doit contenir entre ${min} et ${max} caractères.`
    );
  }
  return cleaned;
}

function validateId(id: string, label: string): string {
  if (
    !id ||
    id.length > 128 ||
    !VALIDATION_RULES.ID_PATTERN.test(id)
  ) {
    throw new Error(`Identifiant ${label} invalide.`);
  }
  return id;
}

function clampPageSize(requested?: number): number {
  if (!requested || requested < 1) return VALIDATION_RULES.DEFAULT_LIMIT;
  return Math.min(requested, VALIDATION_RULES.MAX_LIMIT);
}

// Authentification anonyme uniquement
export async function ensureAnonymousAuth(): Promise<User> {
  if (auth.currentUser) {
    return auth.currentUser;
  }
  const credential = await signInAnonymously(auth);
  return credential.user;
}

export function subscribeToAnonymousAuth(
  onReady: (user: User) => void,
  onError: (err: AppErrorState) => void
): Unsubscribe {
  return onAuthStateChanged(
    auth,
    async (currentUser) => {
      if (currentUser) {
        onReady(currentUser);
        return;
      }
      try {
        const signedInUser = await ensureAnonymousAuth();
        onReady(signedInUser);
      } catch (err) {
        onError(classifyAppError(err));
      }
    },
    (err) => {
      onError(classifyAppError(err));
    }
  );
}

/**
 * 1. Crée un nouveau POUVOIR dans la collection `powers`.
 */
export async function createPower(
  text: string,
  authorName: string
): Promise<string> {
  const user = await ensureAnonymousAuth();
  const validText = sanitizeAndValidateText(
    text,
    VALIDATION_RULES.POWER_MIN,
    VALIDATION_RULES.POWER_MAX,
    'pouvoir'
  );
  const validAuthor = sanitizeAndValidateText(
    authorName,
    VALIDATION_RULES.PSEUDO_MIN,
    VALIDATION_RULES.PSEUDO_MAX,
    'pseudo'
  );

  const powerRef = doc(collection(db, 'powers'));
  const batch = writeBatch(db);

  batch.set(powerRef, {
    text: validText,
    authorUid: user.uid,
    authorName: validAuthor,
    createdAt: serverTimestamp(),
    consequenceCount: 0,
    bestConsequenceId: null,
    bestConsequenceVotes: 0,
  });

  try {
    await batch.commit();
    return powerRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `powers/${powerRef.id}`);
  }
}

/**
 * 2. Crée une nouvelle CONSÉQUENCE et incrémente `consequenceCount` (+1)
 *    sur le pouvoir parent dans le MÊME batch atomique.
 */
export async function createConsequence(
  powerId: string,
  powerText: string,
  text: string,
  authorName: string
): Promise<string> {
  const user = await ensureAnonymousAuth();
  const validPowerId = validateId(powerId, 'powerId');
  const validPowerText = sanitizeAndValidateText(
    powerText,
    VALIDATION_RULES.POWER_MIN,
    VALIDATION_RULES.POWER_MAX,
    'texte du pouvoir'
  );
  const validText = sanitizeAndValidateText(
    text,
    VALIDATION_RULES.CONSEQUENCE_MIN,
    VALIDATION_RULES.CONSEQUENCE_MAX,
    'conséquence'
  );
  const validAuthor = sanitizeAndValidateText(
    authorName,
    VALIDATION_RULES.PSEUDO_MIN,
    VALIDATION_RULES.PSEUDO_MAX,
    'pseudo'
  );

  const consequenceRef = doc(collection(db, 'consequences'));
  const powerRef = doc(db, 'powers', validPowerId);
  const batch = writeBatch(db);

  batch.set(consequenceRef, {
    powerId: validPowerId,
    powerText: validPowerText,
    text: validText,
    authorUid: user.uid,
    authorName: validAuthor,
    createdAt: serverTimestamp(),
    votes: 0,
    duoVotes: 0,
  });

  batch.update(powerRef, {
    consequenceCount: increment(1),
  });

  try {
    await batch.commit();
    return consequenceRef.id;
  } catch (error) {
    handleFirestoreError(
      error,
      OperationType.WRITE,
      `consequences/${consequenceRef.id}`
    );
  }
}

/**
 * 3. Vote pour la MEILLEURE CONSÉQUENCE d'un pouvoir :
 *    - Crée `consequenceVotes/${uid}_${powerId}` (unicité garantie par joueur & pouvoir)
 *    - Incrémente `votes` (+1) sur `consequences/${consequenceId}`
 *    - Met à jour `bestConsequenceId` et `bestConsequenceVotes` sur `powers/${powerId}`
 *      si ce vote établit le nouveau record, dans la MÊME transaction.
 */
export async function voteBestConsequence(
  powerId: string,
  consequenceId: string
): Promise<void> {
  const user = await ensureAnonymousAuth();
  const validPowerId = validateId(powerId, 'powerId');
  const validConsequenceId = validateId(consequenceId, 'consequenceId');

  const voteDocId = `${user.uid}_${validPowerId}`;
  const voteRef = doc(db, 'consequenceVotes', voteDocId);
  const consequenceRef = doc(db, 'consequences', validConsequenceId);
  const powerRef = doc(db, 'powers', validPowerId);

  try {
    await runTransaction(db, async (transaction) => {
      const [voteSnap, consequenceSnap, powerSnap] = await Promise.all([
        transaction.get(voteRef),
        transaction.get(consequenceRef),
        transaction.get(powerRef),
      ]);

      if (voteSnap.exists()) {
        throw new Error('Tu as déjà voté pour ce pouvoir.');
      }
      if (!consequenceSnap.exists() || !powerSnap.exists()) {
        throw new Error('Pouvoir ou conséquence introuvable.');
      }

      const currentVotes = Number(consequenceSnap.data().votes ?? 0);
      const newVotes = currentVotes + 1;
      const currentBestVotes = Number(
        powerSnap.data().bestConsequenceVotes ?? 0
      );

      transaction.set(voteRef, {
        uid: user.uid,
        powerId: validPowerId,
        consequenceId: validConsequenceId,
        createdAt: serverTimestamp(),
      });

      transaction.update(consequenceRef, {
        votes: newVotes,
      });

      if (newVotes === currentBestVotes + 1) {
        transaction.update(powerRef, {
          bestConsequenceId: validConsequenceId,
          bestConsequenceVotes: newVotes,
        });
      }
    });
  } catch (error) {
    handleFirestoreError(
      error,
      OperationType.WRITE,
      `consequenceVotes/${voteDocId}`
    );
  }
}

/**
 * 4. Vote pour un DUO (pouvoir + conséquence) :
 *    - Crée `duoVotes/${uid}_${consequenceId}` (unicité garantie par joueur & duo)
 *    - Incrémente `duoVotes` (+1) sur `consequences/${consequenceId}`
 *    dans le MÊME batch atomique.
 */
export async function voteDuo(
  powerId: string,
  consequenceId: string
): Promise<void> {
  const user = await ensureAnonymousAuth();
  const validPowerId = validateId(powerId, 'powerId');
  const validConsequenceId = validateId(consequenceId, 'consequenceId');

  const voteDocId = `${user.uid}_${validConsequenceId}`;
  const voteRef = doc(db, 'duoVotes', voteDocId);
  const consequenceRef = doc(db, 'consequences', validConsequenceId);

  const batch = writeBatch(db);
  batch.set(voteRef, {
    uid: user.uid,
    powerId: validPowerId,
    consequenceId: validConsequenceId,
    createdAt: serverTimestamp(),
  });
  batch.update(consequenceRef, {
    duoVotes: increment(1),
  });

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `duoVotes/${voteDocId}`);
  }
}

/**
 * 5. Écoute en temps réel la liste des POUVOIRS (avec limit(20) ou limit(30) et pagination).
 */
export function listenPowers(options: {
  pageSize?: number;
  afterDoc?: QueryDocumentSnapshot<DocumentData> | null;
  onData: (result: PaginatedResult<PowerDoc>) => void;
  onError?: (error: AppErrorState) => void;
}): Unsubscribe {
  const size = clampPageSize(options.pageSize ?? VALIDATION_RULES.DEFAULT_LIMIT);
  const constraints = [
    orderBy('createdAt', 'desc'),
    ...(options.afterDoc ? [startAfter(options.afterDoc)] : []),
    limit(size),
  ];

  const q = query(collection(db, 'powers'), ...constraints);

  return onSnapshot(
    q,
    (snapshot) => {
      const items: PowerDoc[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          text: String(data.text ?? ''),
          authorUid: String(data.authorUid ?? ''),
          authorName: String(data.authorName ?? 'Anonyme'),
          createdAt: (data.createdAt as Timestamp) ?? null,
          consequenceCount: Number(data.consequenceCount ?? 0),
          bestConsequenceId:
            typeof data.bestConsequenceId === 'string'
              ? data.bestConsequenceId
              : null,
          bestConsequenceVotes: Number(data.bestConsequenceVotes ?? 0),
        };
      });
      const lastDoc =
        snapshot.docs.length > 0
          ? snapshot.docs[snapshot.docs.length - 1]
          : null;
      options.onData({
        items,
        lastDoc,
        hasMore: snapshot.docs.length === size,
      });
    },
    (error) => {
      const classified = classifyAppError(error);
      if (options.onError) {
        options.onError(classified);
      }
      try {
        handleFirestoreError(error, OperationType.LIST, 'powers');
      } catch {
        // L'erreur structurée a déjà été journalisée par handleFirestoreError
      }
    }
  );
}

/**
 * 6. Écoute en temps réel les CONSÉQUENCES d'un pouvoir donné (avec limit(20) ou limit(30)).
 */
export function listenConsequences(
  powerId: string,
  options: {
    pageSize?: number;
    afterDoc?: QueryDocumentSnapshot<DocumentData> | null;
    onData: (result: PaginatedResult<ConsequenceDoc>) => void;
    onError?: (error: AppErrorState) => void;
  }
): Unsubscribe {
  const validPowerId = validateId(powerId, 'powerId');
  const size = clampPageSize(options.pageSize ?? VALIDATION_RULES.DEFAULT_LIMIT);
  const constraints = [
    where('powerId', '==', validPowerId),
    orderBy('votes', 'desc'),
    ...(options.afterDoc ? [startAfter(options.afterDoc)] : []),
    limit(size),
  ];

  const q = query(collection(db, 'consequences'), ...constraints);

  return onSnapshot(
    q,
    (snapshot) => {
      const items: ConsequenceDoc[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          powerId: String(data.powerId ?? ''),
          powerText: String(data.powerText ?? ''),
          text: String(data.text ?? ''),
          authorUid: String(data.authorUid ?? ''),
          authorName: String(data.authorName ?? 'Anonyme'),
          createdAt: (data.createdAt as Timestamp) ?? null,
          votes: Number(data.votes ?? 0),
          duoVotes: Number(data.duoVotes ?? 0),
        };
      });
      const lastDoc =
        snapshot.docs.length > 0
          ? snapshot.docs[snapshot.docs.length - 1]
          : null;
      options.onData({
        items,
        lastDoc,
        hasMore: snapshot.docs.length === size,
      });
    },
    (error) => {
      const classified = classifyAppError(error);
      if (options.onError) {
        options.onError(classified);
      }
      try {
        handleFirestoreError(error, OperationType.LIST, 'consequences');
      } catch {
        // Journalisé
      }
    }
  );
}

/**
 * 7. Écoute en temps réel le classement TOP DES DUOS (consequences triées par duoVotes décroissant, limit 20).
 */
export function listenTopDuos(options: {
  pageSize?: number;
  afterDoc?: QueryDocumentSnapshot<DocumentData> | null;
  onData: (result: PaginatedResult<ConsequenceDoc>) => void;
  onError?: (error: AppErrorState) => void;
}): Unsubscribe {
  const size = clampPageSize(options.pageSize ?? VALIDATION_RULES.DEFAULT_LIMIT);
  const constraints = [
    orderBy('duoVotes', 'desc'),
    ...(options.afterDoc ? [startAfter(options.afterDoc)] : []),
    limit(size),
  ];

  const q = query(collection(db, 'consequences'), ...constraints);

  return onSnapshot(
    q,
    (snapshot) => {
      const items: ConsequenceDoc[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          powerId: String(data.powerId ?? ''),
          powerText: String(data.powerText ?? ''),
          text: String(data.text ?? ''),
          authorUid: String(data.authorUid ?? ''),
          authorName: String(data.authorName ?? 'Anonyme'),
          createdAt: (data.createdAt as Timestamp) ?? null,
          votes: Number(data.votes ?? 0),
          duoVotes: Number(data.duoVotes ?? 0),
        };
      });
      const lastDoc =
        snapshot.docs.length > 0
          ? snapshot.docs[snapshot.docs.length - 1]
          : null;
      options.onData({
        items,
        lastDoc,
        hasMore: snapshot.docs.length === size,
      });
    },
    (error) => {
      const classified = classifyAppError(error);
      if (options.onError) {
        options.onError(classified);
      }
      try {
        handleFirestoreError(error, OperationType.LIST, 'consequences');
      } catch {
        // Journalisé
      }
    }
  );
}
