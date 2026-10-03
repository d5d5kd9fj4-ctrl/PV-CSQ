/**
 * Firestore Security Rules Test Specification (Dirty Dozen Verification)
 * Verifies that all 12 adversarial payloads described in security_spec.md
 * are rejected with PERMISSION_DENIED.
 */

export interface SecurityTestPayload {
  id: number;
  name: string;
  collection: string;
  docId: string;
  operation: 'create' | 'update' | 'delete';
  authUid: string | null;
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_TESTS: SecurityTestPayload[] = [
  {
    id: 1,
    name: 'Unauthenticated Power Creation',
    collection: 'powers',
    docId: 'power_1',
    operation: 'create',
    authUid: null,
    payload: {
      text: 'Tu peux voler mais seulement à 10 cm du sol',
      authorUid: 'anon_1',
      authorName: 'MageNoir',
      consequenceCount: 0,
      bestConsequenceId: null,
      bestConsequenceVotes: 0,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Identity Spoofing on Power Creation',
    collection: 'powers',
    docId: 'power_2',
    operation: 'create',
    authUid: 'user_A',
    payload: {
      text: 'Tu peux parler aux plantes vertes du salon',
      authorUid: 'user_B',
      authorName: 'Usurpateur',
      consequenceCount: 0,
      bestConsequenceId: null,
      bestConsequenceVotes: 0,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Short Text Bypass on Power (< 10 chars)',
    collection: 'powers',
    docId: 'power_3',
    operation: 'create',
    authUid: 'user_A',
    payload: {
      text: 'Court',
      authorUid: 'user_A',
      authorName: 'MageNoir',
      consequenceCount: 0,
      bestConsequenceId: null,
      bestConsequenceVotes: 0,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Oversized Text Resource Exhaustion (> 200 chars)',
    collection: 'powers',
    docId: 'power_4',
    operation: 'create',
    authUid: 'user_A',
    payload: {
      text: 'A'.repeat(250),
      authorUid: 'user_A',
      authorName: 'MageNoir',
      consequenceCount: 0,
      bestConsequenceId: null,
      bestConsequenceVotes: 0,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Pre-Seeded Votes on Power Creation',
    collection: 'powers',
    docId: 'power_5',
    operation: 'create',
    authUid: 'user_A',
    payload: {
      text: 'Tu peux devenir invisible quand tu fermes les yeux',
      authorUid: 'user_A',
      authorName: 'MageNoir',
      consequenceCount: 42,
      bestConsequenceId: null,
      bestConsequenceVotes: 99,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Shadow Field Injection on Consequence',
    collection: 'consequences',
    docId: 'cons_1',
    operation: 'create',
    authUid: 'user_A',
    payload: {
      powerId: 'power_1',
      powerText: 'Tu peux voler mais seulement à 10 cm du sol',
      text: 'Mais tu dois chanter du Céline Dion en continu',
      authorUid: 'user_A',
      authorName: 'MageNoir',
      votes: 0,
      duoVotes: 0,
      isFeatured: true,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Post-Creation Text Mutation',
    collection: 'powers',
    docId: 'power_1',
    operation: 'update',
    authUid: 'user_A',
    payload: {
      text: 'Texte modifié après création ce qui est interdit',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Counter Jump Attack (+10 Votes)',
    collection: 'consequences',
    docId: 'cons_1',
    operation: 'update',
    authUid: 'user_A',
    payload: {
      votes: 10,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Unbacked Counter Increment (Without Batch Vote Document)',
    collection: 'consequences',
    docId: 'cons_1',
    operation: 'update',
    authUid: 'user_A',
    payload: {
      duoVotes: 1,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Forged Vote ID Mismatch',
    collection: 'consequenceVotes',
    docId: 'forged_vote_id',
    operation: 'create',
    authUid: 'user_A',
    payload: {
      uid: 'user_A',
      powerId: 'power_1',
      consequenceId: 'cons_1',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Vote Modification Attempt',
    collection: 'duoVotes',
    docId: 'user_A_cons_1',
    operation: 'update',
    authUid: 'user_A',
    payload: {
      consequenceId: 'cons_2',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Document Deletion Attempt',
    collection: 'powers',
    docId: 'power_1',
    operation: 'delete',
    authUid: 'user_A',
    expectedResult: 'PERMISSION_DENIED',
  },
];
