/**
 * @fileoverview Tela de Cadastro
 * @module pages/Signup
 */

import React, { useState } from 'react';
import { AuthLayout } from '../components/Layout';
import { useAuthContext } from '../contexts/AuthContext';

interface SignupProps {
  /** Navega para login */
  onGoToLogin: () => void;
  /** Callback de sucesso */
  onSuccess?: () => void;
}

/**
 * Tela de Cadastro
 */
export function Signup({ onGoToLogin, onSuccess }: SignupProps) {
  const { signUp, signInGoogle, loading, error, clearError } = useAuthContext();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  /**
   * Valida força da senha
   */
  const getPasswordStrength = (pass: string): { level: number; label: string; color: string } => {
    if (pass.length === 0) return { level: 0, label: '', color: '' };
    if (pass.length < 6) return { level: 1, label: 'Fraca', color: 'bg-red-500' };
    if (pass.length < 8) return { level: 2, label: 'Razoável', color: 'bg-yellow-500' };
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) {
      return { level: 4, label: 'Forte', color: 'bg-green-500' };
    }
    return { level: 3, label: 'Boa', color: 'bg-blue-500' };
  };

  const passwordStrength = getPasswordStrength(password);

  /**
   * Valida o formulário
   */
  const validate = (): boolean => {
    if (!name.trim()) {
      setLocalError('Digite seu nome');
      return false;
    }
    if (name.trim().length < 2) {
      setLocalError('Nome deve ter pelo menos 2 caracteres');
      return false;
    }
    if (!email.trim()) {
      setLocalError('Digite seu email');
      return false;
    }
    if (!email.includes('@')) {
      setLocalError('Email inválido');
      return false;
    }
    if (password.length < 6) {
      setLocalError('Senha deve ter pelo menos 6 caracteres');
      return false;
    }
    if (password !== confirmPassword) {
      setLocalError('Senhas não conferem');
      return false;
    }
    if (!acceptTerms) {
      setLocalError('Aceite os termos de uso para continuar');
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
      await signUp(email, password, name.trim());
      onSuccess?.();
    } catch (err) {
      // Erro já tratado pelo context
    }
  };

  /**
   * Login com Google
   */
  const handleGoogleSignup = async () => {
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
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
        {/* Erro */}
        {displayError && (
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
            {displayError}
          </div>
        )}

        {/* Nome */}
        <div>
          <label htmlFor="name" className="block text-sm text-gray-400 mb-1">
            Nome
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome artístico"
            autoComplete="name"
            disabled={loading}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
          />
        </div>

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
            placeholder="Mínimo 6 caracteres"
            autoComplete="new-password"
            disabled={loading}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
          />
          {/* Indicador de força */}
          {password.length > 0 && (
            <div className="mt-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full ${
                      level <= passwordStrength.level
                        ? passwordStrength.color
                        : 'bg-gray-700'
                    }`}
                  />
                ))}
              </div>
              <p className={`text-xs mt-1 ${
                passwordStrength.level <= 2 ? 'text-red-400' :
                passwordStrength.level === 3 ? 'text-blue-400' :
                'text-green-400'
              }`}>
                {passwordStrength.label}
              </p>
            </div>
          )}
        </div>

        {/* Confirmar Senha */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm text-gray-400 mb-1">
            Confirmar Senha
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Digite a senha novamente"
            autoComplete="new-password"
            disabled={loading}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
          />
          {confirmPassword && password !== confirmPassword && (
            <p className="text-xs text-red-400 mt-1">Senhas não conferem</p>
          )}
        </div>

        {/* Termos de uso */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            disabled={loading}
            className="w-5 h-5 mt-0.5 rounded bg-gray-800 border-gray-700 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
          />
          <span className="text-sm text-gray-400">
            Li e aceito os{' '}
            <a href="#" className="text-purple-400 hover:underline">
              Termos de Uso
            </a>{' '}
            e{' '}
            <a href="#" className="text-purple-400 hover:underline">
              Política de Privacidade
            </a>
          </span>
        </label>

        {/* Botão criar conta */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {loading ? 'Criando conta...' : 'Criar conta'}
        </button>

        {/* Divisor */}
        <div className="flex items-center gap-4 my-2">
          <div className="flex-1 h-px bg-gray-700" />
          <span className="text-gray-500 text-sm">ou</span>
          <div className="flex-1 h-px bg-gray-700" />
        </div>

        {/* Cadastro com Google */}
        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={loading}
          className="w-full py-3 bg-white hover:bg-gray-100 text-gray-900 font-medium rounded-lg transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Cadastrar com Google
        </button>

        {/* Link voltar para login */}
        <p className="text-center text-gray-500 mt-2">
          Já tem conta?{' '}
          <button
            type="button"
            onClick={onGoToLogin}
            className="text-purple-400 hover:text-purple-300 font-medium"
          >
            Entrar
          </button>
        </p>
      </form>
    </AuthLayout>
  );
}

export default Signup;
