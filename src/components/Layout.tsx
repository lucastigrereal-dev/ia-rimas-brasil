/**
 * @fileoverview Layout principal do app
 * @module components/Layout
 */

import React, { type ReactNode } from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

type NavItem = 'home' | 'drills' | 'ranking' | 'profile';

interface LayoutProps {
  /** Conteúdo da página */
  children: ReactNode;
  /** Item ativo na navegação */
  activeNav?: NavItem;
  /** Callback ao mudar navegação */
  onNavChange?: (item: NavItem) => void;
  /** Mostrar header */
  showHeader?: boolean;
  /** Mostrar navegação inferior */
  showNav?: boolean;
  /** Props do header */
  headerProps?: {
    showXP?: boolean;
    showStreak?: boolean;
    title?: string;
    showBack?: boolean;
    onBack?: () => void;
  };
  /** Classes adicionais para o container */
  className?: string;
}

/**
 * Layout principal com header e navegação
 *
 * @example
 * <Layout activeNav="home" onNavChange={setPage}>
 *   <HomePage />
 * </Layout>
 */
export function Layout({
  children,
  activeNav = 'home',
  onNavChange,
  showHeader = true,
  showNav = true,
  headerProps = {},
  className = '',
}: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      {showHeader && <Header {...headerProps} />}

      {/* Main content */}
      <main
        className={`
          max-w-lg mx-auto px-4
          ${showHeader ? 'pt-4' : 'pt-safe'}
          ${showNav ? 'pb-20' : 'pb-safe'}
          ${className}
        `}
      >
        {children}
      </main>

      {/* Bottom navigation */}
      {showNav && onNavChange && (
        <BottomNav active={activeNav} onChange={onNavChange} />
      )}
    </div>
  );
}

/**
 * Layout para telas de autenticação (sem nav)
 */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Logo area */}
      <div className="flex-shrink-0 pt-safe px-6 py-8 text-center">
        <div className="flex items-center justify-center gap-3">
          <span className="text-4xl">🎤</span>
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            IA Rimas Brasil
          </span>
        </div>
        <p className="text-gray-500 mt-2">Treine seu freestyle</p>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-6 pb-safe">
        {children}
      </div>
    </div>
  );
}

/**
 * Layout para telas de drill (header minimalista)
 */
export function DrillLayout({
  children,
  title,
  onBack,
}: {
  children: ReactNode;
  title: string;
  onBack: () => void;
}) {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header
        title={title}
        showXP={false}
        showStreak={false}
        showBack
        onBack={onBack}
      />
      <main className="max-w-lg mx-auto px-4 py-4 pb-safe">
        {children}
      </main>
    </div>
  );
}

export default Layout;
