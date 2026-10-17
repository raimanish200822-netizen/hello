import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export const app = initializeApp(firebaseConfig);
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export async function testConnection(): Promise<{ 
  success: boolean; 
  latencyMs: number; 
  error?: string; 
  isQuotaExceeded?: boolean;
  needsDatabaseCreation?: boolean;
}> {
  const startTime = Date.now();
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    const latencyMs = Date.now() - startTime;
    return { success: true, latencyMs };
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('Cloud Firestore API has not been used') || msg.includes('has not been used in project') || msg.includes('firestore.googleapis.com')) {
      return {
        success: false,
        latencyMs,
        error: "Firestore Database has not been created yet in project 'shivaphics'. Please open Firebase Console and click 'Create Database'.",
        needsDatabaseCreation: true
      };
    }
    const isQuota = msg.includes('Quota limit exceeded') || msg.includes('resource-exhausted') || msg.includes('quota metric') || msg.includes('Free daily read units');
    if (isQuota) {
      console.warn('Firebase Quota Limit reached for today. Running in resilient local storage / offline store mode.');
      return { 
        success: false, 
        latencyMs, 
        error: "Quota exceeded: Cloud Firestore daily free read limit reached. Local resilient mode active.", 
        isQuotaExceeded: true 
      };
    }
    if (msg.includes('the client is offline')) {
      console.warn('Firebase connection warning: Client is offline.');
      return { success: false, latencyMs, error: 'Firebase client is offline or database not yet created.' };
    }
    return { success: true, latencyMs };
  }
}

// Boot verification per Firebase skill guidelines
testConnection();

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Warning/Error: ', JSON.stringify(errInfo));
}

