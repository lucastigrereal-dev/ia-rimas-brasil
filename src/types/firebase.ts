/**
 * @fileoverview Tipos para integração com Firebase
 * @module types/firebase
 */

import type { User as FirebaseUser } from 'firebase/auth';

/**
 * Configuração do Firebase
 */
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

/**
 * Usuário do Firebase Auth
 */
export type AuthUser = FirebaseUser;

/**
 * Estado de autenticação
 */
export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Documento de usuário no Firestore
 */
export interface UserDocument {
  id: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  level: number;
  xp: number;
  streak: number;
  streakBest: number;
  drillsCompleted: number;
  totalScore: number;
  badges: string[];
  league: string;
  createdAt: Date;
  lastActive: Date;
  settings: UserSettings;
}

/**
 * Configurações do usuário
 */
export interface UserSettings {
  notifications: boolean;
  sound: boolean;
  theme: 'dark' | 'light';
  language: 'pt-BR';
}

/**
 * Documento de progresso no Firestore
 */
export interface ProgressDocument {
  id: string;
  userId: string;
  drillId: string;
  attempts: number;
  bestScore: number;
  stars: 0 | 1 | 2 | 3;
  completed: boolean;
  firstAttemptAt: Date;
  lastAttemptAt: Date;
}

/**
 * Documento de drill no Firestore
 */
export interface DrillDocument {
  id: string;
  title: string;
  description: string;
  category: 'som' | 'ritmo' | 'sentido' | 'batalha';
  difficulty: 1 | 2 | 3 | 4 | 5;
  xpReward: number;
  timeLimit?: number;
  prerequisites?: string[];
  isActive: boolean;
  order: number;
}

/**
 * Entrada do leaderboard
 */
export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  photoURL: string | null;
  score: number;
  rank: number;
  league: string;
}

/**
 * Período do leaderboard
 */
export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'allTime';
