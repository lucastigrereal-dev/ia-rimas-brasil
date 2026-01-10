import { useRef, useCallback } from 'react';

interface ShareCardProps {
  /** Nome do usuário */
  userName: string;
  /** Nível atual */
  level: number;
  /** Dias de streak */
  streak: number;
  /** Score do dia */
  dailyScore: number;
  /** XP total (opcional) */
  totalXP?: number;
  /** Drills completados hoje (opcional) */
  drillsToday?: number;
  /** Callback ao salvar/copiar */
  onSave?: () => void;
  /** Classes adicionais */
  className?: string;
}

/**
 * Card visual para compartilhar no Instagram/TikTok
 *
 * Features:
 * - Dimensões 1080x1080 (quadrado) quando renderizado
 * - Fundo escuro com gradiente neon trap
 * - Logo do app
 * - Hashtag #RimaQueVicia
 * - Botão de salvar/copiar
 */
export function ShareCard({
  userName,
  level,
  streak,
  dailyScore,
  totalXP,
  drillsToday,
  onSave,
  className = '',
}: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Função para salvar como imagem (requer html2canvas)
  const handleSave = useCallback(async () => {
    if (!cardRef.current) return;

    try {
      // Tenta usar html2canvas se disponível
      const html2canvas = (window as unknown as { html2canvas?: (el: HTMLElement) => Promise<HTMLCanvasElement> }).html2canvas;
      if (html2canvas) {
        const canvas = await html2canvas(cardRef.current);
        const link = document.createElement('a');
        link.download = `rima-stats-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } else {
        // Fallback: copia o conteúdo para clipboard
        alert('Para salvar como imagem, instale html2canvas');
      }
      onSave?.();
    } catch (error) {
      console.error('Erro ao salvar imagem:', error);
    }
  }, [onSave]);

  // Função para copiar para clipboard
  const handleCopy = useCallback(async () => {
    const text = `🔥 Meu progresso no IA Rimas Brasil!\n\n` +
      `📊 Nível ${level}\n` +
      `🔥 ${streak} dias de streak\n` +
      `⭐ ${dailyScore} pontos hoje\n\n` +
      `#RimaQueVicia #IArimasBrasil`;

    try {
      await navigator.clipboard.writeText(text);
      alert('Texto copiado!');
      onSave?.();
    } catch {
      alert('Erro ao copiar');
    }
  }, [level, streak, dailyScore, onSave]);

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Card visual */}
      <div
        ref={cardRef}
        className="relative w-full aspect-square max-w-[400px] mx-auto overflow-hidden rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, #0f0f1a 0%, #1a0f2e 50%, #0f1a2e 100%)',
        }}
      >
        {/* Efeitos de fundo */}
        <div className="absolute inset-0">
          {/* Círculos neon */}
          <div
            className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full opacity-20"
            style={{
              background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
            }}
          />
          <div
            className="absolute bottom-[-30%] left-[-20%] w-[70%] h-[70%] rounded-full opacity-15"
            style={{
              background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)',
            }}
          />
          {/* Grid de fundo */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        {/* Conteúdo */}
        <div className="relative h-full flex flex-col items-center justify-between p-6 text-white">
          {/* Header com logo */}
          <div className="text-center">
            <div className="text-4xl mb-1">🎤</div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              IA Rimas Brasil
            </h2>
          </div>

          {/* Stats principais */}
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-4">
            {/* Nome do usuário */}
            <div className="text-2xl font-bold text-center">
              {userName}
            </div>

            {/* Grid de stats */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-[280px]">
              {/* Nível */}
              <div className="bg-black/30 rounded-xl p-3 text-center backdrop-blur-sm border border-purple-500/20">
                <div className="text-3xl font-bold text-purple-400">{level}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">Nível</div>
              </div>

              {/* Streak */}
              <div className="bg-black/30 rounded-xl p-3 text-center backdrop-blur-sm border border-orange-500/20">
                <div className="text-3xl font-bold text-orange-400 flex items-center justify-center gap-1">
                  {streak} <span className="text-xl">🔥</span>
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">Streak</div>
              </div>

              {/* Score do dia */}
              <div className="col-span-2 bg-black/30 rounded-xl p-3 text-center backdrop-blur-sm border border-green-500/20">
                <div className="text-4xl font-bold text-green-400">{dailyScore.toLocaleString()}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">Pontos Hoje</div>
              </div>
            </div>

            {/* Stats extras */}
            {(totalXP || drillsToday) && (
              <div className="flex gap-4 text-sm text-gray-400">
                {totalXP && <span>Total: {totalXP.toLocaleString()} XP</span>}
                {drillsToday && <span>{drillsToday} drills hoje</span>}
              </div>
            )}
          </div>

          {/* Footer com hashtag */}
          <div className="text-center">
            <div className="text-sm font-medium text-purple-400 tracking-wider">
              #RimaQueVicia
            </div>
            <div className="text-xs text-gray-500 mt-1">
              ia-rimas.brasil
            </div>
          </div>
        </div>
      </div>

      {/* Botões de ação */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-medium transition-all flex items-center gap-2"
        >
          <span>📷</span>
          <span>Salvar Imagem</span>
        </button>
        <button
          onClick={handleCopy}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all flex items-center gap-2"
        >
          <span>📋</span>
          <span>Copiar Texto</span>
        </button>
      </div>
    </div>
  );
}

export default ShareCard;
