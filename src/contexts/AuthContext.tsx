/**
 * @fileoverview Context de autenticação
 * @module contexts/AuthContext
 */

import React, { createContext, useContext, type ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { User } from 'firebase/auth';
import type { UserDocument } from '../types/firebase';

/**
 * Tipo do contexto de autenticação
 */
interface AuthContextType {
  /** Usuário do Firebase Auth */
  user: User | null;
  /** Dados do usuário no Firestore */
  userData: UserDocument | null;
  /** Se está carregando */
  loading: boolean;
  /** Erro se houver */
  error: Error | null;
  /** Se está autenticado */
  isAuthenticated: boolean;
  /** Login com email e senha */
  signIn: (email: string, password: string) => Promise<void>;
  /** Cadastro com email e senha */
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  /** Login com Google */
  signInGoogle: () => Promise<void>;
  /** Logout */
  signOut: () => Promise<void>;
  /** Recuperar senha */
  forgotPassword: (email: string) => Promise<void>;
  /** Limpa erro */
  clearError: () => void;
  /** Recarrega dados do usuário */
  refreshUserData: () => Promise<void>;
}

/**
 * Context de autenticação
 */
const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Props do AuthProvider
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Provider de autenticação
 *
 * Envolve a aplicação para fornecer contexto de auth
 *
 * @example
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para acessar o contexto de autenticação
 *
 * @returns Contexto de autenticação
 * @throws Se usado fora do AuthProvider
 *
 * @example
 * const { user, signIn, signOut } = useAuthContext();
 */
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthContext deve ser usado dentro de AuthProvider');
  }

  return context;
}

/**
 * Hook simplificado para verificar se está autenticado
 *
 * @returns true se autenticado
 */
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuthContext();
  return isAuthenticated;
}

/**
 * Hook para obter o usuário atual
 *
 * @returns Usuário ou null
 */
export function useCurrentUser(): User | null {
  const { user } = useAuthContext();
  return user;
}

/**
 * Hook para obter dados do usuário
 *
 * @returns Dados do usuário ou null
 */
export function useUserData(): UserDocument | null {
  const { userData } = useAuthContext();
  return userData;
}

export default AuthContext;
