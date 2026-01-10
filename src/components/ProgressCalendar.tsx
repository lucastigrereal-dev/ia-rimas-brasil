import { useState, useMemo } from 'react';
import type { DailyActivity } from '../types/progress';

interface ProgressCalendarProps {
  /** Dados de atividade por dia */
  activities: DailyActivity[];
  /** Mês inicial (default: atual) */
  initialMonth?: Date;
  /** Callback ao clicar em um dia */
  onDayClick?: (date: string, activity?: DailyActivity) => void;
  /** Classes adicionais */
  className?: string;
}

/**
 * Calendário de progresso estilo GitHub contribution graph
 *
 * Features:
 * - 7 colunas (dom-sab)
 * - Cores por intensidade de treino
 * - Tooltip com detalhes do dia
 * - Navegação por mês
 */
export function ProgressCalendar({
  activities,
  initialMonth = new Date(),
  onDayClick,
  className = '',
}: ProgressCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  // Cria mapa de atividades por data
  const activityMap = useMemo(() => {
    const map = new Map<string, DailyActivity>();
    activities.forEach((a) => map.set(a.date, a));
    return map;
  }, [activities]);

  // Dias da semana em português
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Nome do mês em português
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  // Calcula os dias do mês
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Primeiro dia do mês
    const firstDay = new Date(year, month, 1);
    // Último dia do mês
    const lastDay = new Date(year, month + 1, 0);

    // Dia da semana do primeiro dia (0 = domingo)
    const startDayOfWeek = firstDay.getDay();

    // Total de dias no mês
    const totalDays = lastDay.getDate();

    // Dias do mês anterior para preencher
    const prevMonthDays: { date: string; day: number; isCurrentMonth: boolean }[] = [];
    if (startDayOfWeek > 0) {
      const prevLastDay = new Date(year, month, 0).getDate();
      for (let i = startDayOfWeek - 1; i >= 0; i--) {
        const day = prevLastDay - i;
        const date = formatDate(new Date(year, month - 1, day));
        prevMonthDays.push({ date, day, isCurrentMonth: false });
      }
    }

    // Dias do mês atual
    const currentMonthDays = Array.from({ length: totalDays }, (_, i) => {
      const day = i + 1;
      const date = formatDate(new Date(year, month, day));
      return { date, day, isCurrentMonth: true };
    });

    // Dias do próximo mês para completar 6 semanas
    const allDays = [...prevMonthDays, ...currentMonthDays];
    const remainingDays = 42 - allDays.length; // 6 semanas * 7 dias
    const nextMonthDays = Array.from({ length: remainingDays }, (_, i) => {
      const day = i + 1;
      const date = formatDate(new Date(year, month + 1, day));
      return { date, day, isCurrentMonth: false };
    });

    return [...allDays, ...nextMonthDays];
  }, [currentMonth]);

  // Formata data como YYYY-MM-DD
  function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Retorna a cor baseada na intensidade
  function getIntensityColor(activity?: DailyActivity): string {
    if (!activity || activity.drillsCompleted === 0) {
      return 'bg-gray-800';
    }

    const drills = activity.drillsCompleted;
    if (drills >= 10) return 'bg-green-400'; // Verde escuro
    if (drills >= 5) return 'bg-green-500'; // Verde médio
    if (drills >= 2) return 'bg-green-600'; // Verde claro
    return 'bg-green-700'; // Verde bem claro
  }

  // Navega para mês anterior
  const goToPrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  // Navega para próximo mês
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Vai para mês atual
  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  return (
    <div className={`bg-gray-900 rounded-xl p-4 ${className}`}>
      {/* Header com navegação */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPrevMonth}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          aria-label="Mês anterior"
        >
          ←
        </button>

        <div className="flex items-center gap-2">
          <h3 className="font-bold text-white">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <button
            onClick={goToToday}
            className="text-xs text-purple-400 hover:text-purple-300 px-2 py-1 rounded"
          >
            Hoje
          </button>
        </div>

        <button
          onClick={goToNextMonth}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          aria-label="Próximo mês"
        >
          →
        </button>
      </div>

      {/* Dias da semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs text-gray-500 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Grid de dias */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map(({ date, day, isCurrentMonth }) => {
          const activity = activityMap.get(date);
          const isToday = date === formatDate(new Date());

          return (
            <div
              key={date}
              className="relative"
              onMouseEnter={() => setHoveredDay(date)}
              onMouseLeave={() => setHoveredDay(null)}
            >
              <button
                onClick={() => onDayClick?.(date, activity)}
                className={`
                  w-full aspect-square rounded-sm flex items-center justify-center text-xs
                  transition-all duration-200
                  ${isCurrentMonth ? '' : 'opacity-30'}
                  ${isToday ? 'ring-2 ring-purple-500' : ''}
                  ${getIntensityColor(activity)}
                  hover:ring-1 hover:ring-gray-500
                `}
              >
                <span className={isCurrentMonth ? 'text-white' : 'text-gray-600'}>
                  {day}
                </span>
              </button>

              {/* Tooltip */}
              {hoveredDay === date && activity && activity.drillsCompleted > 0 && (
                <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-800 border border-gray-700 rounded-lg p-2 min-w-[120px] shadow-xl">
                  <div className="text-xs text-gray-400">{date}</div>
                  <div className="text-sm font-bold text-white">
                    {activity.drillsCompleted} drills
                  </div>
                  <div className="text-xs text-green-400">
                    +{activity.xpEarned} XP
                  </div>
                  {activity.minutesTrained > 0 && (
                    <div className="text-xs text-gray-400">
                      {activity.minutesTrained} min
                    </div>
                  )}
                  {/* Seta */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-700" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legenda */}
      <div className="flex items-center justify-end gap-2 mt-4 text-xs text-gray-500">
        <span>Menos</span>
        <div className="flex gap-0.5">
          <div className="w-3 h-3 rounded-sm bg-gray-800" />
          <div className="w-3 h-3 rounded-sm bg-green-700" />
          <div className="w-3 h-3 rounded-sm bg-green-600" />
          <div className="w-3 h-3 rounded-sm bg-green-500" />
          <div className="w-3 h-3 rounded-sm bg-green-400" />
        </div>
        <span>Mais</span>
      </div>
    </div>
  );
}

export default ProgressCalendar;
