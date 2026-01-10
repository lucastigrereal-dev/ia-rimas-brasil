/**
 * @fileoverview Hook de autenticação
 * @module hooks/useAuth
 */

import { useState, useEffect, useCallback } from 'react';
import type { User } from 'firebase/auth';
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signOut as authSignOut,
  onAuthStateChanged,
  resetPassword,
  getCurrentUser,
  isAuthenticated as checkIsAuthenticated,
} from '../services/auth';
import { getUser, createUser } from '../services/firebaseDB';
import type { UserDocument } from '../types/firebase';

/**
 * Estado do hook de autenticação
 */
interface UseAuthState {
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
}

/**
 * Retorno do hook de autenticação
 */
interface UseAuthReturn extends UseAuthState {
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
  /** Recuperar senha (alias) */
  resetPassword: (email: string) => Promise<void>;
  /** Limpa erro */
  clearError: () => void;
  /** Recarrega dados do usuário */
  refreshUserData: () => Promise<void>;
}

/**
 * Hook para gerenciar autenticação
 *
 * @returns Estado e funções de autenticação
 *
 * @example
 * const { user, loading, signIn, signOut } = useAuth();
 *
 * if (loading) return <Loading />;
 * if (!user) return <Login onSubmit={signIn} />;
 */
export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<UseAuthState>({
    user: getCurrentUser(),
    userData: null,
    loading: true,
    error: null,
    isAuthenticated: checkIsAuthenticated(),
  });

  /**
   * Carrega dados do usuário do Firestore
   */
  const loadUserData = useCallback(async (user: User) => {
    try {
      let userData = await getUser(user.uid);

      // Se não existe, cria o documento
      if (!userData) {
        userData = await createUser(user.uid, {
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL,
        });
      }

      setState((prev) => ({
        ...prev,
        userData,
        loading: false,
      }));
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error as Error,
      }));
    }
  }, []);

  /**
   * Observa mudanças no estado de autenticação
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged((user) => {
      setState((prev) => ({
        ...prev,
        user,
        isAuthenticated: user !== null,
        loading: user !== null,
        userData: user === null ? null : prev.userData,
      }));

      if (user) {
        loadUserData(user);
      }
    });

    return () => unsubscribe();
  }, [loadUserData]);

  /**
   * Login com email e senha
   */
  const signIn = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await signInWithEmail(email, password);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error as Error,
      }));
      throw error;
    }
  }, []);

  /**
   * Cadastro com email e senha
   */
  const signUp = useCallback(
    async (email: string, password: string, displayName: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const user = await signUpWithEmail(email, password, displayName);

        // Cria documento do usuário
        await createUser(user.uid, {
          email,
          displayName,
          photoURL: null,
        });
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error as Error,
        }));
        throw error;
      }
    },
    []
  );

  /**
   * Login com Google
   */
  const signInGoogle = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await signInWithGoogle();
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error as Error,
      }));
      throw error;
    }
  }, []);

  /**
   * Logout
   */
  const signOut = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await authSignOut();
      setState({
        user: null,
        userData: null,
        loading: false,
        error: null,
        isAuthenticated: false,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error as Error,
      }));
      throw error;
    }
  }, []);

  /**
   * Recuperar senha
   */
  const forgotPassword = useCallback(async (email: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await resetPassword(email);
      setState((prev) => ({ ...prev, loading: false }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error as Error,
      }));
      throw error;
    }
  }, []);

  /**
   * Limpa erro
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  /**
   * Recarrega dados do usuário
   */
  const refreshUserData = useCallback(async () => {
    if (state.user) {
      await loadUserData(state.user);
    }
  }, [state.user, loadUserData]);

  return {
    ...state,
    signIn,
    signUp,
    signInGoogle,
    signOut,
    forgotPassword,
    resetPassword: forgotPassword, // Alias
    clearError,
    refreshUserData,
  };
}

export default useAuth;
