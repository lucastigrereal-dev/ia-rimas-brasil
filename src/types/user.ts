/**
 * @fileoverview Tipos relacionados ao usuário do IA Rimas Brasil
 * @module types/user
 */

/**
 * Interface principal do usuário do sistema
 */
export interface User {
  /** Identificador único do usuário */
  id: string;

  /** Email do usuário */
  email: string;

  /** Nome de exibição do usuário */
  displayName: string;

  /** URL da foto de perfil */
  photoURL: string | null;

  /** Nível atual do usuário (começa em 1) */
  level: number;

  /** Pontos de experiência acumulados */
  xp: number;

  /** Dias consecutivos de treino atual */
  streak: number;

  /** Maior sequência de dias consecutivos já alcançada */
  streakBest: number;

  /** Quantidade de drills completados */
  drillsCompleted: number;

  /** Pontuação total acumulada em todos os drills */
  totalScore: number;

  /** Lista de badges conquistados pelo usuário */
  badges: string[];

  /** Data de criação da conta */
  createdAt: Date;

  /** Data do último acesso/atividade */
  lastActive: Date;
}

/**
 * Dados para criação de um novo usuário
 */
export type CreateUserDTO = Pick<User, 'email' | 'displayName'> & {
  photoURL?: string | null;
};

/**
 * Dados para atualização parcial do usuário
 */
export type UpdateUserDTO = Partial<Omit<User, 'id' | 'createdAt'>>;
