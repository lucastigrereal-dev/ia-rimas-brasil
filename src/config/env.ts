/**
 * @fileoverview Configuração de Environment Variables
 * @module config/env
 */

/**
 * Modo mock habilitado (desenvolvimento sem Firebase real)
 */
export const useMockAuth = import.meta.env.VITE_USE_FIREBASE_MOCK === 'true';

/**
 * Obtém uma variável de ambiente obrigatória
 * Em modo mock, retorna valor fake ao invés de erro
 */
function getRequiredEnv(key: string): string {
  const value = import.meta.env[key];
  if (!value) {
    // Em modo mock, permite continuar com valores fake
    if (useMockAuth) {
      console.warn(`[ENV] Mock mode: ${key} usando valor fake`);
      return 'MOCK_VALUE';
    }
    throw new Error(
      `Missing required environment variable: ${key}\n` +
      `Please check your .env file or environment configuration.`
    );
  }
  return value;
}

/**
 * Obtém uma variável de ambiente opcional
 */
function getOptionalEnv(key: string, defaultValue: string = ''): string {
  return import.meta.env[key] || defaultValue;
}

/**
 * Configuração do Firebase
 */
export const firebaseConfig = {
  apiKey: getRequiredEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getRequiredEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getRequiredEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getRequiredEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getRequiredEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getRequiredEnv('VITE_FIREBASE_APP_ID'),
  measurementId: getOptionalEnv('VITE_FIREBASE_MEASUREMENT_ID'),
} as const;

/**
 * Configuração do App
 */
export const appConfig = {
  name: getOptionalEnv('VITE_APP_NAME', 'IA Rimas Brasil'),
  url: getOptionalEnv('VITE_APP_URL', 'https://iarimas.com.br'),
  env: getOptionalEnv('VITE_APP_ENV', 'development'),
} as const;

/**
 * Ambiente atual
 */
export const isDevelopment = appConfig.env === 'development';
export const isProduction = appConfig.env === 'production';
export const isTest = appConfig.env === 'test';

/**
 * Configuração de analytics (opcional)
 */
export const analyticsConfig = {
  sentryDsn: getOptionalEnv('VITE_SENTRY_DSN'),
} as const;

/**
 * Valida todas as variáveis de ambiente necessárias
 * Chame esta função no início do app para detectar erros cedo
 */
export function validateEnv(): void {
  if (useMockAuth) {
    console.warn('[ENV] 🎭 MOCK MODE ATIVADO - Firebase simulado');
    console.warn('[ENV] Para usar Firebase real, remova VITE_USE_FIREBASE_MOCK do .env');
    return;
  }

  try {
    // Força a validação das variáveis obrigatórias
    void firebaseConfig;
    console.log('[ENV] Environment variables validated successfully');
  } catch (error) {
    console.error('[ENV] Environment validation failed:', error);
    throw error;
  }
}

/**
 * Log de debug das configurações (apenas em dev)
 */
export function debugEnv(): void {
  if (!isDevelopment) return;

  console.group('[ENV] Current Configuration');
  console.log('App Name:', appConfig.name);
  console.log('App URL:', appConfig.url);
  console.log('Environment:', appConfig.env);
  console.log('Firebase Project:', firebaseConfig.projectId);
  console.log('Firebase Auth Domain:', firebaseConfig.authDomain);
  console.groupEnd();
}

export default {
  firebase: firebaseConfig,
  app: appConfig,
  analytics: analyticsConfig,
  isDevelopment,
  isProduction,
  isTest,
  validateEnv,
  debugEnv,
};
