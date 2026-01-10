/**
 * @fileoverview Serviço de banco de dados Firestore (com modo mock)
 * @module services/firebaseDB
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { useMockAuth } from '../config/env';
import type {
  UserDocument,
  ProgressDocument,
  DrillDocument,
  LeaderboardEntry,
  LeaderboardPeriod,
  UserSettings,
} from '../types/firebase';

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK DATABASE (para desenvolvimento sem Firestore)
// ═══════════════════════════════════════════════════════════════════════════════

const mockUsers = new Map<string, UserDocument>();
const mockProgress = new Map<string, ProgressDocument[]>();
const mockDrills: DrillDocument[] = [];

/**
 * Cria usuário mock
 */
function createMockUserData(userId: string, data: Partial<UserDocument>): UserDocument {
  const defaultSettings: UserSettings = {
    notifications: true,
    sound: true,
    theme: 'dark',
    language: 'pt-BR',
  };

  return {
    id: userId,
    email: data.email || 'dev@iarimas.com.br',
    displayName: data.displayName || 'Dev User',
    photoURL: data.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=mock',
    level: 1,
    xp: 0,
    streak: 0,
    streakBest: 0,
    drillsCompleted: 0,
    totalScore: 0,
    badges: [],
    league: 'bronze',
    createdAt: new Date(),
    lastActive: new Date(),
    settings: defaultSettings,
    ...data,
  };
}

async function mockGetUser(userId: string): Promise<UserDocument | null> {
  console.log('[DB MOCK] 🎭 Buscando usuário:', userId);
  return mockUsers.get(userId) || null;
}

async function mockCreateUser(userId: string, data: Partial<UserDocument>): Promise<UserDocument> {
  console.log('[DB MOCK] 🎭 Criando usuário:', userId);
  const userData = createMockUserData(userId, data);
  mockUsers.set(userId, userData);
  return userData;
}

async function mockUpdateUser(userId: string, data: Partial<UserDocument>): Promise<void> {
  console.log('[DB MOCK] 🎭 Atualizando usuário:', userId);
  const existing = mockUsers.get(userId);
  if (existing) {
    mockUsers.set(userId, { ...existing, ...data });
  }
}

async function mockAddUserXP(userId: string, amount: number): Promise<void> {
  console.log('[DB MOCK] 🎭 Adicionando XP:', amount);
  const user = mockUsers.get(userId);
  if (user) {
    user.xp += amount;
    mockUsers.set(userId, user);
  }
}

async function mockUpdateUserStreak(userId: string): Promise<void> {
  console.log('[DB MOCK] 🎭 Atualizando streak');
  const user = mockUsers.get(userId);
  if (user) {
    user.streak += 1;
    user.streakBest = Math.max(user.streak, user.streakBest);
    mockUsers.set(userId, user);
  }
}

async function mockGetUserProgress(userId: string): Promise<ProgressDocument[]> {
  console.log('[DB MOCK] 🎭 Buscando progresso do usuário');
  return mockProgress.get(userId) || [];
}

async function mockSaveProgress(
  userId: string,
  drillId: string,
  data: Partial<ProgressDocument>
): Promise<void> {
  console.log('[DB MOCK] 🎭 Salvando progresso do drill:', drillId);
  const userProgress = mockProgress.get(userId) || [];
  const existing = userProgress.find((p) => p.drillId === drillId);

  if (existing) {
    Object.assign(existing, data);
  } else {
    userProgress.push({
      id: `${userId}_${drillId}`,
      userId,
      drillId,
      attempts: 1,
      bestScore: 0,
      stars: 0,
      completed: false,
      firstAttemptAt: new Date(),
      lastAttemptAt: new Date(),
      ...data,
    } as ProgressDocument);
  }

  mockProgress.set(userId, userProgress);
}

async function mockGetAllDrills(): Promise<DrillDocument[]> {
  console.log('[DB MOCK] 🎭 Buscando drills (retorna array vazio - sem dados mock)');
  return mockDrills;
}

async function mockGetLeaderboard(
  period: LeaderboardPeriod,
  limitCount: number
): Promise<LeaderboardEntry[]> {
  console.log('[DB MOCK] 🎭 Buscando leaderboard');
  return [];
}

// ═══════════════════════════════════════════════════════════════════════════════
// USERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Busca um usuário pelo ID
 */
export async function getUser(userId: string): Promise<UserDocument | null> {
  if (useMockAuth) {
    return mockGetUser(userId);
  }

  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() } as UserDocument;
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    throw error;
  }
}

/**
 * Cria um novo usuário
 */
export async function createUser(
  userId: string,
  data: Partial<UserDocument>
): Promise<UserDocument> {
  if (useMockAuth) {
    return mockCreateUser(userId, data);
  }

  try {
    const defaultSettings: UserSettings = {
      notifications: true,
      sound: true,
      theme: 'dark',
      language: 'pt-BR',
    };

    const userData: Omit<UserDocument, 'id'> = {
      email: data.email || '',
      displayName: data.displayName || '',
      photoURL: data.photoURL || null,
      level: 1,
      xp: 0,
      streak: 0,
      streakBest: 0,
      drillsCompleted: 0,
      totalScore: 0,
      badges: [],
      league: 'bronze',
      createdAt: new Date(),
      lastActive: new Date(),
      settings: defaultSettings,
      ...data,
    };

    const docRef = doc(db, 'users', userId);
    await setDoc(docRef, {
      ...userData,
      createdAt: serverTimestamp(),
      lastActive: serverTimestamp(),
    });

    return { id: userId, ...userData };
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    throw error;
  }
}

/**
 * Atualiza dados do usuário
 */
export async function updateUser(
  userId: string,
  data: Partial<UserDocument>
): Promise<void> {
  if (useMockAuth) {
    return mockUpdateUser(userId, data);
  }

  try {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, {
      ...data,
      lastActive: serverTimestamp(),
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DRILLS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Busca um drill pelo ID
 */
export async function getDrill(drillId: string): Promise<DrillDocument | null> {
  try {
    const docRef = doc(db, 'drills', drillId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() } as DrillDocument;
  } catch (error) {
    console.error('Erro ao buscar drill:', error);
    throw error;
  }
}

/**
 * Busca todos os drills ativos
 */
export async function getAllDrills(): Promise<DrillDocument[]> {
  if (useMockAuth) {
    return mockGetAllDrills();
  }

  try {
    const q = query(
      collection(db, 'drills'),
      where('isActive', '==', true),
      orderBy('order', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as DrillDocument[];
  } catch (error) {
    console.error('Erro ao buscar drills:', error);
    throw error;
  }
}

/**
 * Busca drills por categoria
 */
export async function getDrillsByCategory(
  category: 'som' | 'ritmo' | 'sentido' | 'batalha'
): Promise<DrillDocument[]> {
  try {
    const q = query(
      collection(db, 'drills'),
      where('category', '==', category),
      where('isActive', '==', true),
      orderBy('order', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as DrillDocument[];
  } catch (error) {
    console.error('Erro ao buscar drills por categoria:', error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROGRESS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Salva progresso de um drill
 */
export async function saveProgress(
  userId: string,
  drillId: string,
  progress: Partial<ProgressDocument>
): Promise<void> {
  if (useMockAuth) {
    return mockSaveProgress(userId, drillId, progress);
  }

  try {
    const progressId = `${userId}_${drillId}`;
    const docRef = doc(db, 'progress', progressId);
    const existingDoc = await getDoc(docRef);

    if (existingDoc.exists()) {
      const existingData = existingDoc.data() as ProgressDocument;
      await updateDoc(docRef, {
        attempts: (existingData.attempts || 0) + 1,
        bestScore: Math.max(existingData.bestScore || 0, progress.bestScore || 0),
        stars: Math.max(existingData.stars || 0, progress.stars || 0),
        completed: progress.completed || existingData.completed,
        lastAttemptAt: serverTimestamp(),
      });
    } else {
      await setDoc(docRef, {
        userId: userId,
        drillId,
        attempts: 1,
        bestScore: progress.bestScore || 0,
        stars: progress.stars || 0,
        completed: progress.completed || false,
        firstAttemptAt: serverTimestamp(),
        lastAttemptAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Erro ao salvar progresso:', error);
    throw error;
  }
}

/**
 * Busca progresso de um drill específico
 */
export async function getProgress(
  userId: string,
  drillId: string
): Promise<ProgressDocument | null> {
  try {
    const progressId = `${userId}_${drillId}`;
    const docRef = doc(db, 'progress', progressId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() } as ProgressDocument;
  } catch (error) {
    console.error('Erro ao buscar progresso:', error);
    throw error;
  }
}

/**
 * Busca todo o progresso de um usuário
 */
export async function getUserProgress(userId: string): Promise<ProgressDocument[]> {
  if (useMockAuth) {
    return mockGetUserProgress(userId);
  }

  try {
    const q = query(collection(db, 'progress'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as ProgressDocument[];
  } catch (error) {
    console.error('Erro ao buscar progresso do usuário:', error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// LEADERBOARD
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Busca o leaderboard
 */
export async function getLeaderboard(
  period: LeaderboardPeriod = 'weekly',
  limitCount: number = 100
): Promise<LeaderboardEntry[]> {
  if (useMockAuth) {
    return mockGetLeaderboard(period, limitCount);
  }

  try {
    const collectionName = `leaderboard_${period}`;
    const q = query(
      collection(db, collectionName),
      orderBy('score', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((d, index) => ({
      ...d.data(),
      rank: index + 1,
    })) as LeaderboardEntry[];
  } catch (error) {
    console.error('Erro ao buscar leaderboard:', error);
    return [];
  }
}

/**
 * Atualiza entrada do leaderboard
 */
export async function updateLeaderboard(
  userId: string,
  data: Partial<LeaderboardEntry>,
  period: LeaderboardPeriod = 'weekly'
): Promise<void> {
  try {
    const collectionName = `leaderboard_${period}`;
    const docRef = doc(db, collectionName, userId);
    const existingDoc = await getDoc(docRef);

    if (existingDoc.exists()) {
      await updateDoc(docRef, data);
    } else {
      await setDoc(docRef, { userId, ...data });
    }
  } catch (error) {
    console.error('Erro ao atualizar leaderboard:', error);
    throw error;
  }
}

/**
 * Busca posição do usuário no leaderboard
 */
export async function getUserRank(
  userId: string,
  period: LeaderboardPeriod = 'weekly'
): Promise<number | null> {
  try {
    const leaderboard = await getLeaderboard(period, 1000);
    const userEntry = leaderboard.find((entry) => entry.userId === userId);
    return userEntry?.rank || null;
  } catch (error) {
    console.error('Erro ao buscar rank do usuário:', error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Adiciona XP ao usuário e atualiza nível se necessário
 */
export async function addUserXP(userId: string, xpAmount: number): Promise<void> {
  if (useMockAuth) {
    return mockAddUserXP(userId, xpAmount);
  }

  try {
    const user = await getUser(userId);
    if (!user) return;

    const newXP = user.xp + xpAmount;
    const newLevel = Math.floor(Math.pow(newXP / 100, 1 / 1.5)) + 1;

    await updateUser(userId, {
      xp: newXP,
      level: Math.max(user.level, newLevel),
    });
  } catch (error) {
    console.error('Erro ao adicionar XP:', error);
    throw error;
  }
}

/**
 * Atualiza streak do usuário
 */
export async function updateUserStreak(userId: string): Promise<void> {
  if (useMockAuth) {
    return mockUpdateUserStreak(userId);
  }

  try {
    const user = await getUser(userId);
    if (!user) return;

    const now = new Date();
    const lastActive =
      user.lastActive instanceof Date
        ? user.lastActive
        : new Date(user.lastActive);

    const diffDays = Math.floor(
      (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
    );

    let newStreak = user.streak;
    if (diffDays === 0) {
      // Mesmo dia, mantém
    } else if (diffDays === 1) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }

    await updateUser(userId, {
      streak: newStreak,
      streakBest: Math.max(user.streakBest, newStreak),
    });
  } catch (error) {
    console.error('Erro ao atualizar streak:', error);
    throw error;
  }
}
