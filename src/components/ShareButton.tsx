/**
 * @fileoverview Botão e Modal de Compartilhamento
 * @module components/ShareButton
 */

import React, { useState, useCallback } from 'react';
import { useShare } from '../hooks/useShare';

interface ShareButtonProps {
  /** Tipo de conteúdo para compartilhar */
  type: 'result' | 'profile' | 'badge' | 'streak' | 'levelup' | 'app';
  /** Dados específicos por tipo */
  data?: {
    drillId?: string;
    drillName?: string;
    score?: number;
    stars?: number;
    userId?: string;
    displayName?: string;
    level?: number;
    totalXP?: number;
    badgeName?: string;
    badgeDescription?: string;
    streakDays?: number;
    newLevel?: number;
  };
  /** Variante do botão */
  variant?: 'icon' | 'button' | 'text';
  /** Tamanho */
  size?: 'sm' | 'md' | 'lg';
  /** Classes adicionais */
  className?: string;
  /** Callback após compartilhar */
  onShare?: (success: boolean) => void;
}

/**
 * Botão de compartilhamento
 */
export function ShareButton({
  type,
  data = {},
  variant = 'icon',
  size = 'md',
  className = '',
  onShare,
}: ShareButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const {
    canNativeShare,
    isSharing,
    shareResult,
    shareProfile,
    shareBadge,
    shareStreak,
    shareLevelUp,
    shareApp,
    copyToClipboard,
    socialLinks,
  } = useShare();

  const handleShare = useCallback(async () => {
    // Se tem Web Share API, usa direto
    if (canNativeShare) {
      let result;

      switch (type) {
        case 'result':
          result = await shareResult(
            data.drillId || '',
            data.score || 0,
            data.stars || 0,
            data.drillName
          );
          break;
        case 'profile':
          result = await shareProfile(
            data.userId || '',
            data.displayName || '',
            data.level || 1,
            data.totalXP || 0
          );
          break;
        case 'badge':
          result = await shareBadge(
            data.badgeName || '',
            data.badgeDescription || ''
          );
          break;
        case 'streak':
          result = await shareStreak(data.streakDays || 0);
          break;
        case 'levelup':
          result = await shareLevelUp(data.newLevel || 1);
          break;
        case 'app':
        default:
          result = await shareApp();
          break;
      }

      onShare?.(result.success);
    } else {
      // Mostra modal com opções
      setShowModal(true);
    }
  }, [
    canNativeShare,
    type,
    data,
    shareResult,
    shareProfile,
    shareBadge,
    shareStreak,
    shareLevelUp,
    shareApp,
    onShare,
  ]);

  const handleCopy = useCallback(async () => {
    const url = window.location.origin;
    let text = 'Confira o IA Rimas!';

    switch (type) {
      case 'result':
        text = `Acertei ${data.score}% no IA Rimas! Vem praticar freestyle comigo!\n\n${url}`;
        break;
      case 'profile':
        text = `Confira meu perfil no IA Rimas! Nível ${data.level} | ${data.totalXP} XP\n\n${url}`;
        break;
      case 'badge':
        text = `Desbloqueei "${data.badgeName}" no IA Rimas! 🏆\n\n${url}`;
        break;
      case 'streak':
        text = `${data.streakDays} dias de streak no IA Rimas! 🔥\n\n${url}`;
        break;
      case 'levelup':
        text = `Alcancei o nível ${data.newLevel} no IA Rimas! 🎉\n\n${url}`;
        break;
      default:
        text = `Treine freestyle com IA no IA Rimas!\n\n${url}`;
    }

    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    onShare?.(success);
  }, [type, data, copyToClipboard, onShare]);

  // Tamanhos
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  // Render botão
  const renderButton = () => {
    if (variant === 'icon') {
      return (
        <button
          onClick={handleShare}
          disabled={isSharing}
          className={`${sizes[size]} rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors disabled:opacity-50 ${className}`}
          aria-label="Compartilhar"
        >
          <ShareIcon className={`${iconSizes[size]} text-gray-300`} />
        </button>
      );
    }

    if (variant === 'button') {
      return (
        <button
          onClick={handleShare}
          disabled={isSharing}
          className={`flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-white font-medium transition-colors disabled:opacity-50 ${className}`}
        >
          <ShareIcon className={iconSizes[size]} />
          <span>{isSharing ? 'Compartilhando...' : 'Compartilhar'}</span>
        </button>
      );
    }

    // text
    return (
      <button
        onClick={handleShare}
        disabled={isSharing}
        className={`flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50 ${className}`}
      >
        <ShareIcon className={iconSizes[size]} />
        <span className="text-sm font-medium">
          {isSharing ? 'Compartilhando...' : 'Compartilhar'}
        </span>
      </button>
    );
  };

  return (
    <>
      {renderButton()}

      {/* Share Modal */}
      {showModal && (
        <ShareModal
          onClose={() => setShowModal(false)}
          onCopy={handleCopy}
          copied={copied}
          socialLinks={socialLinks}
          shareText={getShareText(type, data)}
          shareUrl={window.location.origin}
        />
      )}
    </>
  );
}

/**
 * Modal de compartilhamento
 */
interface ShareModalProps {
  onClose: () => void;
  onCopy: () => void;
  copied: boolean;
  socialLinks: typeof import('../services/share').socialShareLinks;
  shareText: string;
  shareUrl: string;
}

function ShareModal({
  onClose,
  onCopy,
  copied,
  socialLinks,
  shareText,
  shareUrl,
}: ShareModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-gray-900 rounded-t-2xl shadow-2xl border-t border-gray-800 animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 pb-4">
          <h3 className="text-lg font-semibold text-white text-center">
            Compartilhar
          </h3>
        </div>

        {/* Social Options */}
        <div className="px-6 pb-4">
          <div className="grid grid-cols-4 gap-4">
            <SocialButton
              name="WhatsApp"
              icon={<WhatsAppIcon />}
              color="bg-green-600"
              href={socialLinks.whatsapp(shareText, shareUrl)}
            />
            <SocialButton
              name="Twitter"
              icon={<TwitterIcon />}
              color="bg-blue-500"
              href={socialLinks.twitter(shareText, shareUrl)}
            />
            <SocialButton
              name="Telegram"
              icon={<TelegramIcon />}
              color="bg-blue-400"
              href={socialLinks.telegram(shareText, shareUrl)}
            />
            <SocialButton
              name="Facebook"
              icon={<FacebookIcon />}
              color="bg-blue-600"
              href={socialLinks.facebook(shareUrl)}
            />
          </div>
        </div>

        {/* Copy Link */}
        <div className="px-6 pb-6">
          <button
            onClick={onCopy}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-white font-medium transition-colors"
          >
            {copied ? (
              <>
                <CheckIcon className="w-5 h-5 text-green-400" />
                <span>Link copiado!</span>
              </>
            ) : (
              <>
                <CopyIcon className="w-5 h-5" />
                <span>Copiar link</span>
              </>
            )}
          </button>
        </div>

        {/* Cancel */}
        <div className="px-6 pb-8">
          <button
            onClick={onClose}
            className="w-full py-3 text-gray-400 font-medium hover:text-gray-300 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Botão de rede social
 */
function SocialButton({
  name,
  icon,
  color,
  href,
}: {
  name: string;
  icon: React.ReactNode;
  color: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col items-center gap-2"
    >
      <div
        className={`w-12 h-12 ${color} rounded-full flex items-center justify-center`}
      >
        {icon}
      </div>
      <span className="text-xs text-gray-400">{name}</span>
    </a>
  );
}

/**
 * Gera texto de compartilhamento por tipo
 */
function getShareText(
  type: ShareButtonProps['type'],
  data: ShareButtonProps['data']
): string {
  switch (type) {
    case 'result':
      return `Acertei ${data?.score || 0}% no IA Rimas! Vem praticar freestyle comigo!`;
    case 'profile':
      return `Confira meu perfil no IA Rimas! Nível ${data?.level || 1}`;
    case 'badge':
      return `Desbloqueei "${data?.badgeName || ''}" no IA Rimas! 🏆`;
    case 'streak':
      return `${data?.streakDays || 0} dias de streak no IA Rimas! 🔥`;
    case 'levelup':
      return `Alcancei o nível ${data?.newLevel || 1} no IA Rimas! 🎉`;
    default:
      return 'Treine freestyle com IA no IA Rimas!';
  }
}

// Icons
function ShareIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  );
}

function CopyIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function CheckIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export default ShareButton;
