import { useEffect, useRef } from 'react';
import Board from './Board';
import TurnBanner from './TurnBanner';
import MoveLog from './MoveLog';
import WinnerModal from './WinnerModal';
import { actingTeam, useGameStore } from '../store/useGameStore';
import { connectToGame } from '../api/socket';
import { useAI } from '../hooks/useAI';
import { playDice, playHit, playScribble } from '../audio/sound';
import { lineAnimSeconds } from '../lib/layout';

/** Plays the dice / scribble / hit sounds when new rolls and moves arrive (not on first load). */
function useSoundEffects(game) {
  const previous = useRef(null);
  useEffect(() => {
    if (!game) return undefined;
    const before = previous.current;
    previous.current = { id: game.id, rolls: game.rollCount, moves: game.moves.length };
    if (!before || before.id !== game.id) return undefined;

    const timers = [];
    if (game.rollCount > before.rolls) playDice();
    for (const move of game.moves.slice(before.moves)) {
      if (move.type !== 'ADVANCE') continue;
      const seconds = lineAnimSeconds(move.advanced);
      playScribble(seconds);
      if (move.hit) timers.push(setTimeout(playHit, (seconds + 0.15) * 1000));
    }
    return () => timers.forEach(clearTimeout);
  }, [game]);
}

function ActiveGame({ session, game }) {
  const connected = useGameStore((s) => s.connected);
  const busy = useGameStore((s) => s.busy);
  const muted = useGameStore((s) => s.muted);
  const { applyState, setConnected, refresh, roll, selectJet, rematch, leave, toggleMute } = useGameStore.getState();

  const online = session.mode === 'online';

  // Live updates over STOMP. Only online games need them; local games use the REST responses.
  useEffect(() => {
    if (!online) return undefined;
    return connectToGame(session.gameId, {
      onState: applyState,
      onConnect: () => {
        setConnected(true);
        refresh(); // catch up on anything missed while disconnected
      },
      onDisconnect: () => setConnected(false),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.gameId, online]);

  useSoundEffects(game);
  useAI();

  const acting = actingTeam(session, game);
  const canAct = game.status === 'IN_PROGRESS' && game.currentTurn === acting;
  const canSelect = canAct && game.pendingRoll != null && !busy;

  const modeLabel = { online: `Online · you are ${session.myTeam}`, hotseat: 'Hot-seat', ai: 'Vs Computer · you are RED' }[session.mode];

  return (
    <div className="game">
      <header className="topbar">
        <h1>✈️ Paper Dogfight</h1>
        <div className="topbar-info">
          <span>{modeLabel}</span>
          <span>Code <strong className="code">{game.id}</strong></span>
          {online && (
            <span className={connected ? 'pill pill-ok' : 'pill pill-warn'}>{connected ? 'Live' : 'Reconnecting…'}</span>
          )}
          <button className="btn btn-small" onClick={toggleMute} aria-pressed={muted}>{muted ? '🔇 Muted' : '🔊 Sound'}</button>
          <button className="btn btn-small" onClick={leave}>Leave</button>
        </div>
      </header>

      <TurnBanner game={game} canAct={canAct} busy={busy} onRoll={() => roll()} />

      <div className="game-layout">
        <Board game={game} canSelect={canSelect} onSelectJet={(jetId) => selectJet(jetId)} />
        <MoveLog moves={game.moves} />
      </div>

      {game.status === 'FINISHED' && (
        <WinnerModal game={game} session={session} busy={busy} onPlayAgain={leave} onRematch={rematch} />
      )}
    </div>
  );
}

/** Renders nothing while the session or game is being cleared (e.g. right after "Leave"). */
export default function GameScreen() {
  const session = useGameStore((s) => s.session);
  const game = useGameStore((s) => s.game);
  if (!session || !game) return null;
  return <ActiveGame session={session} game={game} />;
}
