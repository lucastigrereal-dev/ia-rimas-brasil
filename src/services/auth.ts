/**
 * @fileoverview Serviço de autenticação Firebase (com modo mock)
 * @module services/auth
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  type User,
  type Unsubscribe,
} from 'firebase/auth';
import { auth } from './firebase';
import { useMockAuth } from '../config/env';

// ═══════════════════════════════════════════════════════════════════════════
// MOCK AUTH (para desenvolvimento sem Firebase)
// ═══════════════════════════════════════════════════════════════════════════

let mockUser: User | null = null;
let mockAuthStateListeners: Array<(user: User | null) => void> = [];

/**
 * Cria um usuário mock para desenvolvimento
 */
function createMockUser(): User {
  return {
    uid: 'mock-user-dev-123',
    email: 'dev@iarimas.com.br',
    emailVerified: true,
    displayName: 'Dev User (Mock)',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mock',
    phoneNumber: null,
    isAnonymous: false,
    metadata: {
      creationTime: new Date().toISOString(),
      lastSignInTime: new Date().toISOString(),
    },
    providerData: [],
    refreshToken: 'mock-refresh-token',
    tenantId: null,
    delete: async () => {},
    getIdToken: async () => 'mock-id-token',
    getIdTokenResult: async () => ({} as any),
    reload: async () => {},
    toJSON: () => ({}),
  } as User;
}

/**
 * Notifica listeners de mudança de estado
 */
function notifyAuthStateChange(user: User | null) {
  mockAuthStateListeners.forEach((listener) => listener(user));
}

// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES MOCK (usadas quando VITE_USE_FIREBASE_MOCK=true)
// ═══════════════════════════════════════════════════════════════════════════

async function mockSignInWithGoogle(): Promise<User> {
  console.log('[AUTH MOCK] 🎭 Login com Google (simulado)');
  mockUser = createMockUser();
  notifyAuthStateChange(mockUser);
  return mockUser;
}

async function mockSignInWithEmail(email: string, password: string): Promise<User> {
  console.log('[AUTH MOCK] 🎭 Login com email (simulado):', email);
  mockUser = createMockUser();
  mockUser.email = email;
  notifyAuthStateChange(mockUser);
  return mockUser;
}

async function mockSignUpWithEmail(email: string, password: string, displayName: string): Promise<User> {
  console.log('[AUTH MOCK] 🎭 Cadastro (simulado):', email);
  mockUser = createMockUser();
  mockUser.email = email;
  mockUser.displayName = displayName;
  notifyAuthStateChange(mockUser);
  return mockUser;
}

async function mockSignOut(): Promise<void> {
  console.log('[AUTH MOCK] 🎭 Logout (simulado)');
  mockUser = null;
  notifyAuthStateChange(null);
}

function mockOnAuthStateChanged(callback: (user: User | null) => void): Unsubscribe {
  mockAuthStateListeners.push(callback);
  // Chama imediatamente com estado atual
  setTimeout(() => callback(mockUser), 0);
  return () => {
    mockAuthStateListeners = mockAuthStateListeners.filter((l) => l !== callback);
  };
}

async function mockResetPassword(email: string): Promise<void> {
  console.log('[AUTH MOCK] 🎭 Reset de senha (simulado):', email);
}

function mockGetCurrentUser(): User | null {
  return mockUser;
}

function mockIsAuthenticated(): boolean {
  return mockUser !== null;
}

/**
 * Erro de autenticação customizado
 */
export class AuthError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}

/**
 * Mapeia códigos de erro do Firebase para mensagens amigáveis
 */
function getErrorMessage(code: string): string {
  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': 'Este email já está em uso',
    'auth/invalid-email': 'Email inválido',
    'auth/operation-not-allowed': 'Operação não permitida',
    'auth/weak-password': 'Senha muito fraca. Use pelo menos 6 caracteres',
    'auth/user-disabled': 'Esta conta foi desativada',
    'auth/user-not-found': 'Usuário não encontrado',
    'auth/wrong-password': 'Senha incorreta',
    'auth/invalid-credential': 'Credenciais inválidas',
    'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde',
    'auth/popup-closed-by-user': 'Login cancelado',
    'auth/network-request-failed': 'Erro de conexão. Verifique sua internet',
  };

  return errorMessages[code] || 'Erro de autenticação. Tente novamente';
}

/**
 * Login com email e senha
 *
 * @param email - Email do usuário
 * @param password - Senha do usuário
 * @returns Usuário autenticado
 * @throws AuthError se falhar
 */
export async function signInWithEmail(email: string, password: string): Promise<User> {
  if (useMockAuth) {
    return mockSignInWithEmail(email, password);
  }

  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string };
    throw new AuthError(
      getErrorMessage(firebaseError.code || 'unknown'),
      firebaseError.code || 'unknown'
    );
  }
}

/**
 * Cadastro com email e senha
 *
 * @param email - Email do usuário
 * @param password - Senha do usuário
 * @param displayName - Nome de exibição
 * @returns Usuário criado
 * @throws AuthError se falhar
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<User> {
  if (useMockAuth) {
    return mockSignUpWithEmail(email, password, displayName);
  }

  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);

    // Atualiza o displayName
    await updateProfile(result.user, { displayName });

    return result.user;
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string };
    throw new AuthError(
      getErrorMessage(firebaseError.code || 'unknown'),
      firebaseError.code || 'unknown'
    );
  }
}

/**
 * Login com Google
 *
 * @returns Usuário autenticado
 * @throws AuthError se falhar
 */
export async function signInWithGoogle(): Promise<User> {
  if (useMockAuth) {
    return mockSignInWithGoogle();
  }

  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account',
    });

    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string };
    throw new AuthError(
      getErrorMessage(firebaseError.code || 'unknown'),
      firebaseError.code || 'unknown'
    );
  }
}

/**
 * Logout
 */
export async function signOut(): Promise<void> {
  if (useMockAuth) {
    return mockSignOut();
  }

  try {
    await firebaseSignOut(auth);
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string };
    throw new AuthError(
      getErrorMessage(firebaseError.code || 'unknown'),
      firebaseError.code || 'unknown'
    );
  }
}

/**
 * Observa mudanças no estado de autenticação
 *
 * @param callback - Função chamada quando o estado muda
 * @returns Função para cancelar a observação
 */
export function onAuthStateChanged(
  callback: (user: User | null) => void
): Unsubscribe {
  if (useMockAuth) {
    return mockOnAuthStateChanged(callback);
  }

  return firebaseOnAuthStateChanged(auth, callback);
}

/**
 * Retorna o usuário atual
 *
 * @returns Usuário atual ou null se não autenticado
 */
export function getCurrentUser(): User | null {
  if (useMockAuth) {
    return mockGetCurrentUser();
  }

  return auth.currentUser;
}

/**
 * Envia email de recuperação de senha
 *
 * @param email - Email do usuário
 * @throws AuthError se falhar
 */
export async function resetPassword(email: string): Promise<void> {
  if (useMockAuth) {
    return mockResetPassword(email);
  }

  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string };
    throw new AuthError(
      getErrorMessage(firebaseError.code || 'unknown'),
      firebaseError.code || 'unknown'
    );
  }
}

/**
 * Atualiza o perfil do usuário
 *
 * @param displayName - Novo nome de exibição
 * @param photoURL - Nova URL da foto
 */
export async function updateUserProfile(
  displayName?: string,
  photoURL?: string
): Promise<void> {
  const user = getCurrentUser();
  if (!user) {
    throw new AuthError('Usuário não autenticado', 'auth/not-authenticated');
  }

  try {
    await updateProfile(user, {
      displayName: displayName ?? user.displayName,
      photoURL: photoURL ?? user.photoURL,
    });
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string };
    throw new AuthError(
      getErrorMessage(firebaseError.code || 'unknown'),
      firebaseError.code || 'unknown'
    );
  }
}

/**
 * Verifica se o usuário está autenticado
 */
export function isAuthenticated(): boolean {
  if (useMockAuth) {
    return mockIsAuthenticated();
  }

  return auth.currentUser !== null;
}
