import { motion } from 'framer-motion';
import { COLORS, teamLabel } from '../lib/layout';

const REASONS = {
  ENEMY_JETS_DESTROYED: 'All the required enemy jets were crossed out.',
  STALEMATE_MOST_JETS: 'Nobody can advance any more, so the team with more surviving jets wins.',
  STALEMATE_DRAW: 'Nobody can advance any more and both teams kept the same number of jets.',
};

/**
 * Winner banner. It sits at the bottom of the screen instead of covering the board, so the final
 * position stays visible. "Play Again" returns to the lobby; "Rematch" restarts with the same players.
 */
export default function WinnerModal({ game, session, busy, onPlayAgain, onRematch }) {
  const winner = game.winner;
  const online = session.mode === 'online';
  const votedForRematch = online && game.rematchVotes.includes(session.myTeam);

  let title = 'Draw!';
  if (winner) {
    title = `${teamLabel(winner)} wins!`;
    if (online) title += winner === session.myTeam ? ' You won 🎉' : ' Better luck next time';
  }

  return (
    <motion.div
      className="winner"
      role="dialog"
      aria-live="polite"
      style={{ borderColor: winner ? COLORS[winner] : '#555' }}
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <h2 style={{ color: winner ? COLORS[winner] : '#333' }}>{title}</h2>
      <p>{REASONS[game.endReason]}</p>
      <div className="winner-actions">
        <button className="btn" onClick={onPlayAgain}>Play Again</button>
        <button className="btn btn-primary" disabled={busy || votedForRematch} onClick={onRematch}>
          {votedForRematch ? 'Waiting for opponent…' : 'Rematch'}
        </button>
      </div>
      {online && !votedForRematch && game.rematchVotes.length > 0 && (
        <p className="winner-note">Your opponent wants a rematch!</p>
      )}
    </motion.div>
  );
}
