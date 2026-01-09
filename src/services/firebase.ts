/**
 * @fileoverview Configuração e inicialização do Firebase
 * @module services/firebase
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAnalytics, type Analytics, isSupported } from 'firebase/analytics';
import type { FirebaseConfig } from '../types/firebase';

/**
 * Configuração do Firebase via variáveis de ambiente
 */
const firebaseConfig: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

/**
 * Instância do Firebase App (singleton)
 */
let app: FirebaseApp;

/**
 * Inicializa o Firebase App
 */
function initializeFirebaseApp(): FirebaseApp {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  return app;
}

// Inicializa imediatamente
app = initializeFirebaseApp();

/**
 * Instância do Firebase Auth
 */
export const auth: Auth = getAuth(app);

/**
 * Instância do Firestore
 */
export const db: Firestore = getFirestore(app);

/**
 * Instância do Analytics (inicializada assincronamente)
 */
let analytics: Analytics | null = null;

/**
 * Inicializa o Analytics se suportado
 */
export async function initializeAnalytics(): Promise<Analytics | null> {
  if (analytics) return analytics;

  try {
    const supported = await isSupported();
    if (supported) {
      analytics = getAnalytics(app);
    }
  } catch (error) {
    console.warn('Analytics não suportado:', error);
  }

  return analytics;
}

/**
 * Retorna a instância do Analytics
 */
export function getAnalyticsInstance(): Analytics | null {
  return analytics;
}

/**
 * Retorna a instância do Firebase App
 */
export function getFirebaseApp(): FirebaseApp {
  return app;
}

/**
 * Verifica se o Firebase está configurado
 */
export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId
  );
}

// Inicializa analytics em background
if (typeof window !== 'undefined') {
  initializeAnalytics();
}

export default app;
