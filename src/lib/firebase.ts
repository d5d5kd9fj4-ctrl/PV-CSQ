import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseAppletConfig from '../../firebase-applet-config.json';

/**
 * Configuration publique Firebase versionnable pour le build statique (GitHub Pages).
 * Conserve strictement l'identifiant de base Firestore généré par AI Studio.
 */
export const FIREBASE_CONFIG = {
  projectId: firebaseAppletConfig.projectId,
  appId: firebaseAppletConfig.appId,
  apiKey: firebaseAppletConfig.apiKey,
  authDomain: firebaseAppletConfig.authDomain,
  firestoreDatabaseId: firebaseAppletConfig.firestoreDatabaseId,
  storageBucket: firebaseAppletConfig.storageBucket,
  messagingSenderId: firebaseAppletConfig.messagingSenderId,
} as const;

export const app = initializeApp(FIREBASE_CONFIG);

// Utilisation explicite de l'identifiant de base Firestore non par défaut :
// "ai-studio-dc2e0a43-b525-40d6-8532-0995248c2671"
export const db = getFirestore(app, FIREBASE_CONFIG.firestoreDatabaseId);
export const auth = getAuth(app);
