/**
 * @fileoverview Roteador principal do app
 * @module AppRouter
 */

import React, { useState, useEffect } from 'react';
import { useAuthContext } from './contexts/AuthContext';
import { useGameContext } from './contexts/GameContext';

// Pages
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';
import { Onboarding } from './pages/Onboarding';
import { SelectLevel } from './pages/SelectLevel';
import { Home } from './pages/Home';
import { Drills } from './pages/Drills';
import { DrillPlay } from './pages/DrillPlay';
import { DrillComplete } from './pages/DrillComplete';
import { Leaderboard } from './pages/Leaderboard';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { NotFound } from './pages/NotFound';
import { ErrorPage } from './pages/ErrorPage';

// Components
import { SplashLogo } from './components/Logo';
import { ErrorBoundary } from './components/ErrorBoundary';

type AuthScreen = 'login' | 'signup' | 'forgot-password';
type AppScreen = 'home' | 'drills' | 'ranking' | 'profile' | 'settings' | 'notfound';
type FlowScreen = 'onboarding' | 'select-level';
type DrillScreen = 'play' | 'complete';

// Valid paths for URL-based routing
const validPaths = ['/', '/home', '/drills', '/ranking', '/profile', '/settings', '/login', '/signup'];

interface DrillState {
  drillId: string;
  result?: {
    drillId: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    timeSpent: number;
    xpEarned: number;
    stars: 1 | 2 | 3;
  };
}

/**
 * Roteador principal do app
 */
export function AppRouter() {
  const { user, loading: authLoading } = useAuthContext();
  const { state: gameState } = useGameContext();

  // Screens state
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login');
  const [appScreen, setAppScreen] = useState<AppScreen>('home');
  const [flowScreen, setFlowScreen] = useState<FlowScreen | null>(null);
  const [drillScreen, setDrillScreen] = useState<DrillScreen | null>(null);
  const [drillState, setDrillState] = useState<DrillState | null>(null);

  // Check if user needs onboarding
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean>(() => {
    return localStorage.getItem('ia-rimas-onboarding') === 'true';
  });

  const [hasSelectedLevel, setHasSelectedLevel] = useState<boolean>(() => {
    return localStorage.getItem('ia-rimas-level-selected') === 'true';
  });

  // Check for invalid URL paths
  useEffect(() => {
    const currentPath = window.location.pathname;
    const isValidPath = validPaths.some(path =>
      currentPath === path || currentPath.startsWith('/drill/')
    );

    if (!isValidPath && currentPath !== '/') {
      setAppScreen('notfound');
    }
  }, []);

  // Handle first-time user flow
  useEffect(() => {
    if (user && !authLoading) {
      if (!hasSeenOnboarding) {
        setFlowScreen('onboarding');
      } else if (!hasSelectedLevel) {
        setFlowScreen('select-level');
      } else {
        setFlowScreen(null);
      }
    }
  }, [user, authLoading, hasSeenOnboarding, hasSelectedLevel]);

  /**
   * Complete onboarding
   */
  const handleOnboardingComplete = () => {
    localStorage.setItem('ia-rimas-onboarding', 'true');
    setHasSeenOnboarding(true);
    setFlowScreen('select-level');
  };

  /**
   * Select skill level
   */
  const handleLevelSelect = (level: 'beginner' | 'intermediate' | 'advanced') => {
    localStorage.setItem('ia-rimas-level-selected', 'true');
    localStorage.setItem('ia-rimas-skill-level', level);
    setHasSelectedLevel(true);
    setFlowScreen(null);
  };

  /**
   * Start a drill
   */
  const handleStartDrill = (drillId: string) => {
    setDrillState({ drillId });
    setDrillScreen('play');
  };

  /**
   * Complete a drill
   */
  const handleDrillComplete = (result: DrillState['result']) => {
    if (drillState) {
      setDrillState({ ...drillState, result });
      setDrillScreen('complete');
    }
  };

  /**
   * Exit drill flow
   */
  const handleExitDrill = () => {
    setDrillScreen(null);
    setDrillState(null);
  };

  /**
   * Play drill again
   */
  const handlePlayAgain = () => {
    if (drillState) {
      setDrillScreen('play');
      setDrillState({ drillId: drillState.drillId });
    }
  };

  // Show splash while loading auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <SplashLogo />
      </div>
    );
  }

  // Not authenticated - show auth screens
  if (!user) {
    switch (authScreen) {
      case 'signup':
        return (
          <Signup
            onGoToLogin={() => setAuthScreen('login')}
            onSuccess={() => {}}
          />
        );

      case 'forgot-password':
        return (
          <ForgotPassword
            onGoToLogin={() => setAuthScreen('login')}
          />
        );

      default:
        return (
          <Login
            onGoToSignup={() => setAuthScreen('signup')}
            onGoToForgotPassword={() => setAuthScreen('forgot-password')}
            onSuccess={() => {}}
          />
        );
    }
  }

  // First-time user flow
  if (flowScreen) {
    switch (flowScreen) {
      case 'onboarding':
        return (
          <Onboarding
            onComplete={handleOnboardingComplete}
            onSkip={handleOnboardingComplete}
          />
        );

      case 'select-level':
        return (
          <SelectLevel
            onSelect={handleLevelSelect}
          />
        );
    }
  }

  // Drill flow
  if (drillScreen && drillState) {
    switch (drillScreen) {
      case 'play':
        return (
          <DrillPlay
            drillId={drillState.drillId}
            onBack={handleExitDrill}
            onComplete={handleDrillComplete}
          />
        );

      case 'complete':
        return (
          <DrillComplete
            result={drillState.result!}
            drillTitle="Drill" // TODO: get actual title
            onBack={handleExitDrill}
            onPlayAgain={handlePlayAgain}
          />
        );
    }
  }

  // Main app screens
  switch (appScreen) {
    case 'drills':
      return (
        <Drills
          onNavigate={setAppScreen}
          onStartDrill={handleStartDrill}
        />
      );

    case 'ranking':
      return (
        <Leaderboard
          onNavigate={setAppScreen}
        />
      );

    case 'profile':
      return (
        <Profile
          onNavigate={setAppScreen}
          onOpenSettings={() => setAppScreen('settings')}
        />
      );

    case 'settings':
      return (
        <Settings
          onBack={() => setAppScreen('profile')}
        />
      );

    case 'notfound':
      return (
        <NotFound
          onGoHome={() => setAppScreen('home')}
          onGoDrills={() => setAppScreen('drills')}
        />
      );

    default:
      return (
        <Home
          onNavigate={(page) => {
            if (page === 'drill') {
              // handled by onStartDrill
            } else {
              setAppScreen(page as AppScreen);
            }
          }}
          onStartDrill={handleStartDrill}
        />
      );
  }
}

/**
 * App Router com Error Boundary
 */
export function AppRouterWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <AppRouter />
    </ErrorBoundary>
  );
}

export default AppRouter;
