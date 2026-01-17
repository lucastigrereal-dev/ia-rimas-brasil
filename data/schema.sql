-- Gamification Schema - Run this to initialize gamification tables

CREATE TABLE IF NOT EXISTS user_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT DEFAULT 'local_user',
  xp_total INTEGER DEFAULT 0,
  nivel INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  last_activity_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS xp_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT DEFAULT 'local_user',
  amount INTEGER NOT NULL,
  source TEXT NOT NULL,
  multiplier REAL DEFAULT 1.0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_xp_history_user_date ON xp_history(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_xp_history_date ON xp_history(DATE(created_at));

CREATE TABLE IF NOT EXISTS daily_challenge_completions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT DEFAULT 'local_user',
  challenge_date TEXT NOT NULL,
  completed_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, challenge_date)
);

-- Initialize user_progress para 'local_user'
INSERT OR IGNORE INTO user_progress (user_id)
VALUES ('local_user');
