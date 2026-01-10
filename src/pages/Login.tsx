/**
 * @fileoverview Tela de Login
 * @module pages/Login
 */

import React, { useState } from 'react';
import { AuthLayout } from '../components/Layout';
import { useAuthContext } from '../contexts/AuthContext';

interface LoginProps {
  /** Navega para cadastro */
  onGoToSignup: () => void;
  /** Navega para recuperar senha */
  onGoToForgotPassword: () => void;
  /** Callback de sucesso */
  onSuccess?: () => void;
}

/**
 * Tela de Login
 */
export function Login({
  onGoToSignup,
  onGoToForgotPassword,
  onSuccess,
}: LoginProps) {
  const { signIn, signInGoogle, loading, error, clearError } = useAuthContext();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  /**
   * Valida o formulário
   */
  const validate = (): boolean => {
    if (!email.trim()) {
      setLocalError('Digite seu email');
      return false;
    }
    if (!email.includes('@')) {
      setLocalError('Email inválido');
      return false;
    }
    if (!password) {
      setLocalError('Digite sua senha');
      return false;
    }
    if (password.length < 6) {
      setLocalError('Senha deve ter pelo menos 6 caracteres');
      return false;
    }
    return true;
  };

  /**
   * Submit do formulário
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!validate()) return;

    try {
      await signIn(email, password);
      onSuccess?.();
    } catch (err) {
      // Erro já tratado pelo context
    }
  };

  /**
   * Login com Google
   */
  const handleGoogleLogin = async () => {
    setLocalError(null);
    clearError();

    try {
      await signInGoogle();
      onSuccess?.();
    } catch (err) {
      // Erro já tratado pelo context
    }
  };

  const displayError = localError || error?.message;

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
        {/* Erro */}
        {displayError && (
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
            {displayError}
          </div>
        )}

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm text-gray-400 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            autoComplete="email"
            disabled={loading}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
          />
        </div>

        {/* Senha */}
        <div>
          <label htmlFor="password" className="block text-sm text-gray-400 mb-1">
            Senha
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={loading}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
          />
        </div>

        {/* Link esqueci senha */}
        <button
          type="button"
          onClick={onGoToForgotPassword}
          className="text-right text-sm text-purple-400 hover:text-purple-300"
        >
          Esqueci minha senha
        </button>

        {/* Botão entrar */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        {/* Divisor */}
        <div className="flex items-center gap-4 my-2">
          <div className="flex-1 h-px bg-gray-700" />
          <span className="text-gray-500 text-sm">ou</span>
          <div className="flex-1 h-px bg-gray-700" />
        </div>

        {/* Login com Google */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3 bg-white hover:bg-gray-100 text-gray-900 font-medium rounded-lg transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Entrar com Google
        </button>

        {/* Link criar conta */}
        <p className="text-center text-gray-500 mt-4">
          Não tem conta?{' '}
          <button
            type="button"
            onClick={onGoToSignup}
            className="text-purple-400 hover:text-purple-300 font-medium"
          >
            Criar conta
          </button>
        </p>
      </form>
    </AuthLayout>
  );
}

export default Login;
