import { useEffect } from 'react';
import Lobby from './components/Lobby';
import GameScreen from './components/GameScreen';
import { useGameStore } from './store/useGameStore';

export default function App() {
  const session = useGameStore((s) => s.session);
  const game = useGameStore((s) => s.game);
  const error = useGameStore((s) => s.error);
  const refresh = useGameStore((s) => s.refresh);
  const clearError = useGameStore((s) => s.clearError);

  // After a page refresh the session is restored from localStorage; keep trying to reload the
  // game from the server until it answers (or reports that the game no longer exists).
  useEffect(() => {
    if (!session || game) return undefined;
    refresh();
    const timer = setInterval(refresh, 2000);
    return () => clearInterval(timer);
  }, [session, game, refresh]);

  // Errors show as a toast that fades away on its own.
  useEffect(() => {
    if (!error) return undefined;
    const timer = setTimeout(clearError, 4500);
    return () => clearTimeout(timer);
  }, [error, clearError]);

  let screen;
  if (session && game) screen = <GameScreen />;
  else if (session) screen = <main className="lobby"><h1>✈️ Paper Dogfight</h1><p className="tagline">Reconnecting to your game…</p></main>;
  else screen = <Lobby />;

  return (
    <>
      {screen}
      {error && (
        <div className="toast" role="alert" onClick={clearError}>
          {error}
        </div>
      )}
    </>
  );
}
