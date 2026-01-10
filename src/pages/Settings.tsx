/**
 * @fileoverview Página de Configurações
 * @module pages/Settings
 */

import React, { useState } from 'react';
import { DrillLayout } from '../components/Layout';
import { useAuthContext } from '../contexts/AuthContext';

interface SettingsProps {
  /** Voltar para página anterior */
  onBack: () => void;
  /** Callback de logout */
  onLogout?: () => void;
}

type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

interface SettingsState {
  notifications: {
    dailyReminder: boolean;
    streakAlert: boolean;
    newContent: boolean;
    leaderboardUpdates: boolean;
  };
  preferences: {
    skillLevel: SkillLevel;
    soundEffects: boolean;
    vibration: boolean;
    autoPlay: boolean;
  };
}

const defaultSettings: SettingsState = {
  notifications: {
    dailyReminder: true,
    streakAlert: true,
    newContent: false,
    leaderboardUpdates: false,
  },
  preferences: {
    skillLevel: 'intermediate',
    soundEffects: true,
    vibration: true,
    autoPlay: false,
  },
};

/**
 * Toggle switch component
 */
function Toggle({
  enabled,
  onChange,
  disabled = false,
}: {
  enabled: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`
        relative w-12 h-7 rounded-full transition-colors
        ${enabled ? 'bg-purple-600' : 'bg-gray-700'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <span
        className={`
          absolute top-1 w-5 h-5 rounded-full bg-white transition-all
          ${enabled ? 'left-6' : 'left-1'}
        `}
      />
    </button>
  );
}

/**
 * Settings section component
 */
function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
        {title}
      </h2>
      <div className="bg-gray-900 rounded-xl border border-gray-800 divide-y divide-gray-800">
        {children}
      </div>
    </div>
  );
}

/**
 * Settings row component
 */
function SettingsRow({
  icon,
  label,
  description,
  action,
}: {
  icon: string;
  label: string;
  description?: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <div>
          <p className="font-medium">{label}</p>
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

/**
 * Página de Configurações
 */
export function Settings({ onBack, onLogout }: SettingsProps) {
  const { user, signOut } = useAuthContext();
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  /**
   * Atualiza configuração de notificação
   */
  const updateNotification = (key: keyof SettingsState['notifications'], value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value },
    }));
  };

  /**
   * Atualiza preferência
   */
  const updatePreference = <K extends keyof SettingsState['preferences']>(
    key: K,
    value: SettingsState['preferences'][K]
  ) => {
    setSettings((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, [key]: value },
    }));
  };

  /**
   * Faz logout
   */
  const handleLogout = async () => {
    try {
      await signOut();
      onLogout?.();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const skillLevelLabels: Record<SkillLevel, string> = {
    beginner: 'Iniciante',
    intermediate: 'Intermediário',
    advanced: 'Avançado',
  };

  return (
    <DrillLayout title="Configurações" onBack={onBack}>
      {/* Account section */}
      <SettingsSection title="Conta">
        <SettingsRow
          icon="👤"
          label={user?.displayName || 'Usuário'}
          description={user?.email || ''}
          action={
            <button className="text-purple-400 text-sm hover:text-purple-300">
              Editar
            </button>
          }
        />
      </SettingsSection>

      {/* Notifications section */}
      <SettingsSection title="Notificações">
        <SettingsRow
          icon="🔔"
          label="Lembrete Diário"
          description="Receba lembretes para treinar"
          action={
            <Toggle
              enabled={settings.notifications.dailyReminder}
              onChange={(v) => updateNotification('dailyReminder', v)}
            />
          }
        />
        <SettingsRow
          icon="🔥"
          label="Alerta de Streak"
          description="Aviso quando streak está em risco"
          action={
            <Toggle
              enabled={settings.notifications.streakAlert}
              onChange={(v) => updateNotification('streakAlert', v)}
            />
          }
        />
        <SettingsRow
          icon="✨"
          label="Novos Conteúdos"
          description="Novos drills e recursos"
          action={
            <Toggle
              enabled={settings.notifications.newContent}
              onChange={(v) => updateNotification('newContent', v)}
            />
          }
        />
        <SettingsRow
          icon="🏆"
          label="Ranking"
          description="Atualizações de posição"
          action={
            <Toggle
              enabled={settings.notifications.leaderboardUpdates}
              onChange={(v) => updateNotification('leaderboardUpdates', v)}
            />
          }
        />
      </SettingsSection>

      {/* Preferences section */}
      <SettingsSection title="Preferências">
        <SettingsRow
          icon="🎯"
          label="Nível de Habilidade"
          description="Ajusta dificuldade dos drills"
          action={
            <select
              value={settings.preferences.skillLevel}
              onChange={(e) => updatePreference('skillLevel', e.target.value as SkillLevel)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-purple-500"
            >
              <option value="beginner">{skillLevelLabels.beginner}</option>
              <option value="intermediate">{skillLevelLabels.intermediate}</option>
              <option value="advanced">{skillLevelLabels.advanced}</option>
            </select>
          }
        />
        <SettingsRow
          icon="🔊"
          label="Efeitos Sonoros"
          action={
            <Toggle
              enabled={settings.preferences.soundEffects}
              onChange={(v) => updatePreference('soundEffects', v)}
            />
          }
        />
        <SettingsRow
          icon="📳"
          label="Vibração"
          action={
            <Toggle
              enabled={settings.preferences.vibration}
              onChange={(v) => updatePreference('vibration', v)}
            />
          }
        />
        <SettingsRow
          icon="▶️"
          label="Auto-play Beats"
          description="Tocar beats automaticamente"
          action={
            <Toggle
              enabled={settings.preferences.autoPlay}
              onChange={(v) => updatePreference('autoPlay', v)}
            />
          }
        />
      </SettingsSection>

      {/* About section */}
      <SettingsSection title="Sobre">
        <SettingsRow
          icon="📱"
          label="Versão"
          description="IA Rimas Brasil v2.0.0"
          action={<span className="text-gray-500 text-sm">Atualizado</span>}
        />
        <SettingsRow
          icon="📜"
          label="Termos de Uso"
          action={
            <button className="text-purple-400 text-sm hover:text-purple-300">
              Ver →
            </button>
          }
        />
        <SettingsRow
          icon="🔒"
          label="Política de Privacidade"
          action={
            <button className="text-purple-400 text-sm hover:text-purple-300">
              Ver →
            </button>
          }
        />
        <SettingsRow
          icon="💬"
          label="Feedback"
          description="Nos ajude a melhorar"
          action={
            <button className="text-purple-400 text-sm hover:text-purple-300">
              Enviar →
            </button>
          }
        />
      </SettingsSection>

      {/* Danger zone */}
      <SettingsSection title="Conta">
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full p-4 text-left text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-3"
        >
          <span className="text-xl">🚪</span>
          <span className="font-medium">Sair da conta</span>
        </button>
      </SettingsSection>

      {/* Logout confirmation modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm border border-gray-800">
            <h3 className="text-xl font-bold mb-2">Sair da conta?</h3>
            <p className="text-gray-400 mb-6">
              Você precisará fazer login novamente para acessar seu progresso.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 rounded-xl font-medium transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </DrillLayout>
  );
}

export default Settings;
