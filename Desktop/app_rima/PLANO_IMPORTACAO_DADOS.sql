-- ========================================
-- PLANO DE IMPORTAÇÃO: 7.200+ RIMAS
-- ========================================

-- PARTE 1: SEED INICIAL (executar depois de criar schema)

INSERT INTO rimas_temas (nome, descricao, icone_emoji, cor_hex) VALUES
('Confronto', 'Agressividade e ataque direto', '⚔️', '#FF6B6B'),
('Autoestima', 'Autoconfiança e amor próprio', '💪', '#4ECDC4'),
('Estratégia', 'Inteligência e tática', '♟️', '#FFE66D'),
('Caráter', 'Honra e princípios', '🏆', '#95E1D3')
ON CONFLICT DO NOTHING;

INSERT INTO achievements (key, name, description, icon_emoji, xp_reward, points_reward) VALUES
('first_duel', 'Primeiro Duelo', 'Complete seu primeiro duelo', '⚔️', 10, 5),
('first_win', 'Primeira Vitória', 'Ganhe seu primeiro duelo', '🏆', 20, 10),
('five_streak', 'Em Fogo', 'Mantenha 5 duelos ganhando em sequência', '🔥', 100, 25),
('level_10', 'Intermediário', 'Atinja nível 10', '⭐', 50, 20),
('rating_2500', 'Top 100', 'Alcance rating 2500', '🥈', 200, 50),
('rating_3000', 'Elite', 'Alcance rating 3000', '🥇', 500, 100)
ON CONFLICT DO NOTHING;

INSERT INTO badges (name, description, icon_url, rarity) VALUES
('Novato', 'Completou primeira lição', '/badges/novato.png', 'common'),
('Mestre de Rimas', 'Completou Pillar 1', '/badges/rima_master.png', 'rare'),
('Flow King', 'Completou Pillar 2', '/badges/flow_king.png', 'rare'),
('Criativo', 'Completou Pillar 3', '/badges/criativo.png', 'epic'),
('Battle Ready', 'Completou Pillar 4', '/badges/battle_ready.png', 'epic'),
('Lenda', 'Completou tudo com 90%+', '/badges/lenda.png', 'legendary')
ON CONFLICT DO NOTHING;

INSERT INTO daily_quests (key, title, description, quest_type, condition_type, condition_value, xp_reward, points_reward) VALUES
('morning_practice', 'Prática Matinal', 'Complete 1 lesson', 'daily', 'exercises_completed', 1, 50, 20),
('duel_challenge', 'Desafio de Batalha', 'Vença 1 duel', 'daily', 'duels_won', 1, 100, 30),
('consistent', 'Consistência', 'Complete 2 exercícios', 'daily', 'exercises_completed', 2, 75, 25),
('weekly_grind', 'Semana de Fogo', 'Complete 5 duels', 'weekly', 'duels_completed', 5, 200, 50)
ON CONFLICT DO NOTHING;

INSERT INTO exercises (pillar, lesson, exercise_num, type, title, description, instructions, difficulty, time_limit_seconds, base_xp, bonus_xp) VALUES
(1, 1, 1, 'listening', 'Identifique a Rima', 'Ouça dois sons e identifique se rimam', 'Toque no botão SIM se rimam, NÃO se não rimam', 'easy', 30, 10, 5),
(1, 1, 2, 'matching', 'Agrupe Rimas', 'Arraste as palavras para agrupar as que rimam', 'Drag and drop as palavras em grupos', 'easy', 60, 15, 10),
(1, 1, 3, 'fill_blank', 'Complete a Rima', 'Escolha a palavra que completa a rima', 'Selecione entre as 3 opções', 'easy', 45, 15, 10),
(1, 1, 4, 'production', 'Grava Sua Rima', 'Grava uma frase que rima com o exemplo', 'Aperte REC, fale seu verso, aperte STOP', 'easy', 120, 50, 30),
(1, 1, 5, 'speed', 'Speed Challenge Rimas', 'Identifique 10 rimas rápido', 'Toque RIMA ou NÃO RIMA', 'medium', 60, 40, 30),
(2, 1, 1, 'rhythm', 'Sync com Beat', 'Bata na tela sincronizado com o beat', 'Toque na tela a cada beat (4 vezes)', 'medium', 30, 20, 15),
(2, 1, 2, 'listening', 'Identifique BPM', 'Ouça o beat e escolha o BPM correto', '3 opções: 90, 110, ou 130 BPM', 'easy', 45, 15, 10),
(2, 1, 3, 'production', 'Rima no Beat', 'Grava verso sincronizado com o beat', 'Beat toca automaticamente, você rima on beat', 'medium', 60, 50, 40),
(2, 1, 4, 'comparison', 'Qual tem Melhor Flow?', 'Compare 2 versos e escolha qual flui melhor', 'Ouça ambos e escolha', 'medium', 45, 15, 10),
(2, 1, 5, 'speed', 'Speed: Multi-Beat Recognition', 'Identifique BPM de 5 beats rápido', '5 beats diferentes em 60s', 'hard', 60, 60, 50)
ON CONFLICT (pillar, lesson, exercise_num) DO NOTHING;

-- PARTE 2: IMPORTAR 7.200+ RIMAS
-- Para CSV, use: \COPY rimas_banco (verso, tema, familia_rima, dificuldade) FROM '/path/rimas.csv' WITH (FORMAT csv);
-- Para JSON, use script Python

-- PARTE 3: GENERATOR SQL (cria 1.800 rimas)
DO $$
DECLARE
  temas TEXT[] := ARRAY['Confronto', 'Autoestima', 'Estratégia', 'Caráter'];
  familias TEXT[] := ARRAY['-O', '-ÃO', '-ÊNCIA', '-AÇÃO', '-INHO', '-ADA', '-IDADE', '-ISMO'];
  dificuldades difficulty_level[] := ARRAY['easy', 'easy', 'medium', 'hard'];
  versos TEXT[] := ARRAY[
    'Seu flow é fraco, meu é de ouro',
    'Você é fake, eu sou verdadeiro',
    'Sua rima é ruim, a minha é ouro',
    'Eu sou o número um deste palco',
    'Meu talento é um símbolo',
    'Meu plano é estratégico',
    'Tenho nome e sobrenome limpo'
  ];
  contador INT := 0;
BEGIN
  FOR i IN 1..1800 LOOP
    INSERT INTO rimas_banco (verso, tema, familia_rima, dificuldade, ranking)
    VALUES (
      versos[(i % array_length(versos, 1)) + 1] || ' [' || i::text || ']',
      temas[(i % array_length(temas, 1)) + 1],
      familias[((i / 5) % array_length(familias, 1)) + 1],
      dificuldades[(i % 4) + 1],
      (5000 - i)
    );
    contador := contador + 1;
  END LOOP;
  RAISE NOTICE 'Inseridos % rimas', contador;
END $$;

-- PARTE 4: VERIFICAR INSERÇÃO
SELECT COUNT(*) as total_rimas FROM rimas_banco;
SELECT COUNT(*) as total_exercises FROM exercises;
SELECT COUNT(*) as total_achievements FROM achievements;
