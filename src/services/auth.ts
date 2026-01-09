/**
 * @fileoverview Serviço de autenticação Firebase
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
  return firebaseOnAuthStateChanged(auth, callback);
}

/**
 * Retorna o usuário atual
 *
 * @returns Usuário atual ou null se não autenticado
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

/**
 * Envia email de recuperação de senha
 *
 * @param email - Email do usuário
 * @throws AuthError se falhar
 */
export async function resetPassword(email: string): Promise<void> {
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
  return auth.currentUser !== null;
}
