/**
 * @fileoverview Tela de Recuperação de Senha
 * @module pages/ForgotPassword
 */

import React, { useState } from 'react';
import { AuthLayout } from '../components/Layout';
import { useAuthContext } from '../contexts/AuthContext';

interface ForgotPasswordProps {
  /** Navega para login */
  onGoToLogin: () => void;
}

/**
 * Tela de Recuperação de Senha
 */
export function ForgotPassword({ onGoToLogin }: ForgotPasswordProps) {
  const { resetPassword, loading, error, clearError } = useAuthContext();

  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
    return true;
  };

  /**
   * Submit do formulário
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();
    setSuccess(false);

    if (!validate()) return;

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err) {
      // Erro já tratado pelo context
    }
  };

  const displayError = localError || error?.message;

  return (
    <AuthLayout>
      <div className="mt-8">
        {/* Título */}
        <h2 className="text-xl font-bold text-white text-center mb-2">
          Recuperar senha
        </h2>
        <p className="text-gray-500 text-center text-sm mb-6">
          Digite seu email para receber o link de recuperação
        </p>

        {/* Sucesso */}
        {success ? (
          <div className="text-center">
            <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4 mb-6">
              <span className="text-4xl mb-3 block">📧</span>
              <p className="text-green-400 font-medium">
                Email enviado com sucesso!
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Verifique sua caixa de entrada e spam
              </p>
            </div>

            <button
              type="button"
              onClick={onGoToLogin}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-purple-500/30"
            >
              Voltar para Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

            {/* Botão enviar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Enviando...' : 'Enviar link de recuperação'}
            </button>

            {/* Link voltar para login */}
            <button
              type="button"
              onClick={onGoToLogin}
              className="text-center text-purple-400 hover:text-purple-300 font-medium mt-2"
            >
              ← Voltar para Login
            </button>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}

export default ForgotPassword;
