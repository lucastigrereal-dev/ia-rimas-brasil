/**
 * @fileoverview Skip Link para acessibilidade
 * @module components/SkipLink
 */

import React from 'react';

interface SkipLinkProps {
  /** ID do elemento de destino */
  targetId?: string;
  /** Texto do link */
  children?: React.ReactNode;
  /** Classes adicionais */
  className?: string;
}

/**
 * Skip Link - permite usuários de teclado pular direto para o conteúdo principal
 * Visível apenas quando focado
 */
export function SkipLink({
  targetId = 'main-content',
  children = 'Pular para o conteúdo principal',
  className = '',
}: SkipLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.tabIndex = -1;
      target.focus();
      target.scrollIntoView();
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className={`
        sr-only focus:not-sr-only
        fixed top-4 left-4 z-[100]
        px-4 py-2
        bg-purple-600 text-white
        font-semibold rounded-lg
        shadow-lg
        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-950
        transition-transform
        ${className}
      `}
    >
      {children}
    </a>
  );
}

/**
 * Wrapper para conteúdo principal
 * Usado junto com SkipLink
 */
export function MainContent({
  id = 'main-content',
  children,
  className = '',
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main
      id={id}
      tabIndex={-1}
      className={`outline-none ${className}`}
      role="main"
    >
      {children}
    </main>
  );
}

export default SkipLink;
