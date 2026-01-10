/**
 * @fileoverview Serviço de Compartilhamento
 * @module services/share
 */

import { appConfig, isDevelopment } from '../config/env';

/**
 * Dados para compartilhamento
 */
export interface ShareData {
  title: string;
  text: string;
  url?: string;
}

/**
 * Resultado de compartilhamento
 */
export interface ShareResult {
  success: boolean;
  method: 'native' | 'clipboard' | 'none';
  error?: string;
}

/**
 * Verifica se Web Share API está disponível
 */
export function canShare(): boolean {
  return typeof navigator !== 'undefined' && 'share' in navigator;
}

/**
 * Verifica se pode copiar para clipboard
 */
export function canCopyToClipboard(): boolean {
  return typeof navigator !== 'undefined' && 'clipboard' in navigator;
}

/**
 * Compartilha usando Web Share API ou fallback
 */
async function share(data: ShareData): Promise<ShareResult> {
  if (isDevelopment) {
    console.log('[Share] Attempting to share:', data);
  }

  // Tenta Web Share API primeiro
  if (canShare()) {
    try {
      await navigator.share({
        title: data.title,
        text: data.text,
        url: data.url,
      });

      if (isDevelopment) {
        console.log('[Share] Shared via native API');
      }

      return { success: true, method: 'native' };
    } catch (error) {
      // User cancelled ou erro
      if ((error as Error).name === 'AbortError') {
        return { success: false, method: 'native', error: 'Cancelled' };
      }

      console.warn('[Share] Native share failed:', error);
    }
  }

  // Fallback: Copia para clipboard
  if (canCopyToClipboard()) {
    try {
      const textToCopy = data.url
        ? `${data.text}\n\n${data.url}`
        : data.text;

      await navigator.clipboard.writeText(textToCopy);

      if (isDevelopment) {
        console.log('[Share] Copied to clipboard');
      }

      return { success: true, method: 'clipboard' };
    } catch (error) {
      console.warn('[Share] Clipboard copy failed:', error);
      return {
        success: false,
        method: 'clipboard',
        error: 'Failed to copy to clipboard',
      };
    }
  }

  return { success: false, method: 'none', error: 'Sharing not supported' };
}

/**
 * URL base do app
 */
function getAppUrl(): string {
  return appConfig.url || window.location.origin;
}

/**
 * Compartilha resultado de um drill
 */
export async function shareResult(
  drillId: string,
  score: number,
  stars: number,
  drillName?: string
): Promise<ShareResult> {
  const starsEmoji = '⭐'.repeat(stars);
  const title = 'Meu resultado no IA Rimas';
  const text = drillName
    ? `Completei "${drillName}" com ${score}% de acerto! ${starsEmoji}\n\nVem praticar freestyle comigo no IA Rimas!`
    : `Acertei ${score}% em um drill de rimas! ${starsEmoji}\n\nVem praticar freestyle comigo no IA Rimas!`;
  const url = `${getAppUrl()}/drill/${drillId}`;

  return share({ title, text, url });
}

/**
 * Compartilha perfil
 */
export async function shareProfile(
  userId: string,
  displayName: string,
  level: number,
  totalXP: number
): Promise<ShareResult> {
  const title = `${displayName} no IA Rimas`;
  const text = `Confira meu perfil no IA Rimas!\n\nNível ${level} | ${totalXP.toLocaleString()} XP\n\nVem treinar freestyle comigo!`;
  const url = `${getAppUrl()}/profile/${userId}`;

  return share({ title, text, url });
}

/**
 * Compartilha conquista/badge
 */
export async function shareBadge(
  badgeName: string,
  badgeDescription: string
): Promise<ShareResult> {
  const title = 'Nova conquista no IA Rimas!';
  const text = `Desbloqueei "${badgeName}"! 🏆\n\n${badgeDescription}\n\nVem conquistar badges no IA Rimas!`;
  const url = getAppUrl();

  return share({ title, text, url });
}

/**
 * Compartilha streak
 */
export async function shareStreak(days: number): Promise<ShareResult> {
  const fireEmoji = '🔥'.repeat(Math.min(days, 5));
  const title = 'Meu streak no IA Rimas';
  const text = `${days} dias de streak! ${fireEmoji}\n\nEstou praticando freestyle todo dia no IA Rimas!`;
  const url = getAppUrl();

  return share({ title, text, url });
}

/**
 * Compartilha level up
 */
export async function shareLevelUp(newLevel: number): Promise<ShareResult> {
  const title = 'Level Up no IA Rimas!';
  const text = `Alcancei o nível ${newLevel}! 🎉\n\nVem evoluir no freestyle comigo!`;
  const url = getAppUrl();

  return share({ title, text, url });
}

/**
 * Compartilha o app (convite)
 */
export async function shareApp(): Promise<ShareResult> {
  const title = 'IA Rimas - Treine Freestyle com IA';
  const text = 'Descobri esse app incrível para treinar freestyle! Pratique rimas e melhore suas skills no rap. Vem comigo!';
  const url = getAppUrl();

  return share({ title, text, url });
}

/**
 * Copia texto para clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!canCopyToClipboard()) return false;

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Gera link de compartilhamento para redes específicas
 */
export const socialShareLinks = {
  twitter: (text: string, url: string) =>
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,

  whatsapp: (text: string, url: string) =>
    `https://wa.me/?text=${encodeURIComponent(`${text}\n\n${url}`)}`,

  telegram: (text: string, url: string) =>
    `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,

  facebook: (url: string) =>
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
};

export default {
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
};
