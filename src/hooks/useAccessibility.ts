/**
 * @fileoverview Hooks de Acessibilidade
 * @module hooks/useAccessibility
 */

import { useEffect, useCallback, useRef, RefObject } from 'react';

/**
 * Hook para gerenciar focus trap em modais/dialogs
 * @param ref - Referência ao elemento container
 * @param isActive - Se o focus trap está ativo
 */
export function useFocusTrap<T extends HTMLElement>(
  ref: RefObject<T>,
  isActive: boolean = true
): void {
  useEffect(() => {
    if (!isActive || !ref.current) return;

    const container = ref.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element
    firstElement?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab: if on first element, go to last
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab: if on last element, go to first
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [ref, isActive]);
}

/**
 * Hook para gerenciar skip link (pular para conteúdo principal)
 */
export function useSkipLink(): {
  skipLinkRef: RefObject<HTMLAnchorElement>;
  mainContentRef: RefObject<HTMLElement>;
  handleSkip: () => void;
} {
  const skipLinkRef = useRef<HTMLAnchorElement>(null);
  const mainContentRef = useRef<HTMLElement>(null);

  const handleSkip = useCallback(() => {
    mainContentRef.current?.focus();
    mainContentRef.current?.scrollIntoView();
  }, []);

  return { skipLinkRef, mainContentRef, handleSkip };
}

/**
 * Hook para anúncios de screen reader (live regions)
 */
export function useAnnounce() {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    // Create or get live region
    let liveRegion = document.getElementById('sr-announcer');

    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'sr-announcer';
      liveRegion.setAttribute('aria-live', priority);
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      liveRegion.style.cssText =
        'position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;';
      document.body.appendChild(liveRegion);
    }

    // Update aria-live if needed
    liveRegion.setAttribute('aria-live', priority);

    // Clear and set message (forces announcement)
    liveRegion.textContent = '';
    setTimeout(() => {
      liveRegion!.textContent = message;
    }, 100);
  }, []);

  return { announce };
}

/**
 * Hook para detectar preferência de movimento reduzido
 */
export function usePrefersReducedMotion(): boolean {
  const ref = useRef<boolean>(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    ref.current = mediaQuery.matches;

    const handleChange = (e: MediaQueryListEvent) => {
      ref.current = e.matches;
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return ref.current;
}

/**
 * Hook para detectar preferência de alto contraste
 */
export function usePrefersHighContrast(): boolean {
  const ref = useRef<boolean>(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: more)');
    ref.current = mediaQuery.matches;

    const handleChange = (e: MediaQueryListEvent) => {
      ref.current = e.matches;
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return ref.current;
}

/**
 * Hook para gerenciar roving tabindex em grupos de elementos
 * Útil para menus, listas de tabs, etc.
 */
export function useRovingTabindex<T extends HTMLElement>(
  containerRef: RefObject<T>,
  itemSelector: string = '[role="menuitem"], [role="tab"], [role="option"]'
): {
  handleKeyDown: (e: React.KeyboardEvent) => void;
  focusFirst: () => void;
  focusLast: () => void;
} {
  const currentIndexRef = useRef(0);

  const getItems = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];
    return Array.from(containerRef.current.querySelectorAll<HTMLElement>(itemSelector));
  }, [containerRef, itemSelector]);

  const focusItem = useCallback((index: number) => {
    const items = getItems();
    if (items.length === 0) return;

    // Wrap around
    if (index < 0) index = items.length - 1;
    if (index >= items.length) index = 0;

    // Update tabindex
    items.forEach((item, i) => {
      item.setAttribute('tabindex', i === index ? '0' : '-1');
    });

    items[index]?.focus();
    currentIndexRef.current = index;
  }, [getItems]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const items = getItems();
    if (items.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        focusItem(currentIndexRef.current + 1);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        focusItem(currentIndexRef.current - 1);
        break;
      case 'Home':
        e.preventDefault();
        focusItem(0);
        break;
      case 'End':
        e.preventDefault();
        focusItem(items.length - 1);
        break;
    }
  }, [getItems, focusItem]);

  const focusFirst = useCallback(() => focusItem(0), [focusItem]);
  const focusLast = useCallback(() => focusItem(getItems().length - 1), [focusItem, getItems]);

  return { handleKeyDown, focusFirst, focusLast };
}

export default {
  useFocusTrap,
  useSkipLink,
  useAnnounce,
  usePrefersReducedMotion,
  usePrefersHighContrast,
  useRovingTabindex,
};
