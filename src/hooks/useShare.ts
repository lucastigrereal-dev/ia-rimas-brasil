/**
 * @fileoverview Hook de Compartilhamento
 * @module hooks/useShare
 */

import { useState, useCallback } from 'react';
import {
  canShare,
  canCopyToClipboard,
  shareResult,
  shareProfile,
  shareBadge,
  shareStreak,
  shareLevelUp,
  shareApp,
  copyToClipboard,
  socialShareLinks,
  type ShareResult,
} from '../services/share';
import { trackShare } from '../services/analytics';

/**
 * Retorno do hook useShare
 */
interface UseShareReturn {
  /** Se Web Share API está disponível */
  canNativeShare: boolean;
  /** Se clipboard está disponível */
  canCopy: boolean;
  /** Se está compartilhando no momento */
  isSharing: boolean;
  /** Último resultado de compartilhamento */
  lastResult: ShareResult | null;
  /** Compartilha resultado de drill */
  shareResult: (drillId: string, score: number, stars: number, drillName?: string) => Promise<ShareResult>;
  /** Compartilha perfil */
  shareProfile: (userId: string, displayName: string, level: number, totalXP: number) => Promise<ShareResult>;
  /** Compartilha badge */
  shareBadge: (badgeName: string, badgeDescription: string) => Promise<ShareResult>;
  /** Compartilha streak */
  shareStreak: (days: number) => Promise<ShareResult>;
  /** Compartilha level up */
  shareLevelUp: (newLevel: number) => Promise<ShareResult>;
  /** Compartilha o app */
  shareApp: () => Promise<ShareResult>;
  /** Copia texto para clipboard */
  copyToClipboard: (text: string) => Promise<boolean>;
  /** Links para redes sociais */
  socialLinks: typeof socialShareLinks;
}

/**
 * Hook para gerenciar compartilhamento
 */
export function useShare(): UseShareReturn {
  const [isSharing, setIsSharing] = useState(false);
  const [lastResult, setLastResult] = useState<ShareResult | null>(null);

  const wrapShare = useCallback(
    async (
      shareFn: () => Promise<ShareResult>,
      contentType: 'result' | 'profile' | 'app'
    ): Promise<ShareResult> => {
      setIsSharing(true);

      try {
        const result = await shareFn();
        setLastResult(result);

        // Track analytics se sucesso
        if (result.success) {
          trackShare(contentType, result.method);
        }

        return result;
      } finally {
        setIsSharing(false);
      }
    },
    []
  );

  const handleShareResult = useCallback(
    (drillId: string, score: number, stars: number, drillName?: string) =>
      wrapShare(() => shareResult(drillId, score, stars, drillName), 'result'),
    [wrapShare]
  );

  const handleShareProfile = useCallback(
    (userId: string, displayName: string, level: number, totalXP: number) =>
      wrapShare(() => shareProfile(userId, displayName, level, totalXP), 'profile'),
    [wrapShare]
  );

  const handleShareBadge = useCallback(
    (badgeName: string, badgeDescription: string) =>
      wrapShare(() => shareBadge(badgeName, badgeDescription), 'result'),
    [wrapShare]
  );

  const handleShareStreak = useCallback(
    (days: number) => wrapShare(() => shareStreak(days), 'result'),
    [wrapShare]
  );

  const handleShareLevelUp = useCallback(
    (newLevel: number) => wrapShare(() => shareLevelUp(newLevel), 'result'),
    [wrapShare]
  );

  const handleShareApp = useCallback(
    () => wrapShare(() => shareApp(), 'app'),
    [wrapShare]
  );

  const handleCopyToClipboard = useCallback(async (text: string) => {
    const result = await copyToClipboard(text);
    if (result) {
      setLastResult({ success: true, method: 'clipboard' });
    }
    return result;
  }, []);

  return {
    canNativeShare: canShare(),
    canCopy: canCopyToClipboard(),
    isSharing,
    lastResult,
    shareResult: handleShareResult,
    shareProfile: handleShareProfile,
    shareBadge: handleShareBadge,
    shareStreak: handleShareStreak,
    shareLevelUp: handleShareLevelUp,
    shareApp: handleShareApp,
    copyToClipboard: handleCopyToClipboard,
    socialLinks: socialShareLinks,
  };
}

export default useShare;
