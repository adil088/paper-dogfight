import { useState } from 'react';
import { motion } from 'framer-motion';
import { COLORS, teamLabel } from '../lib/layout';

/** "Red's turn / Blue's turn" indicator, status line and the Roll Die button. */
export default function TurnBanner({ game, canAct, busy, onRoll }) {
  const [copied, setCopied] = useState(false);

  if (game.status === 'WAITING') {
    const copy = async () => {
      try {
        await navigator.clipboard.writeText(game.id);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch {
        /* clipboard may be unavailable; the code is visible anyway */
      }
    };
    return (
      <div className="banner banner-waiting">
        <div>
          <div className="banner-title">Waiting for a second player…</div>
          <div className="banner-sub">
            Share this code: <strong className="code">{game.id}</strong>
          </div>
        </div>
        <button className="btn" onClick={copy}>{copied ? 'Copied!' : 'Copy code'}</button>
      </div>
    );
  }

  if (game.status === 'FINISHED') {
    return (
      <div className="banner banner-waiting">
        <div className="banner-title">Game over</div>
      </div>
    );
  }

  const team = game.currentTurn;
  const rolled = game.pendingRoll != null;
  let sub;
  if (!rolled) sub = canAct ? 'Roll the die!' : `${teamLabel(team)} is about to roll…`;
  else sub = canAct ? `Rolled ${game.pendingRoll}. Pick one of your highlighted jets.` : `${teamLabel(team)} rolled ${game.pendingRoll}…`;

  return (
    <motion.div
      key={team}
      className="banner"
      style={{ borderColor: COLORS[team] }}
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div>
        <div className="banner-title" style={{ color: COLORS[team] }}>{teamLabel(team)}&apos;s turn</div>
        <div className="banner-sub">{sub}</div>
      </div>
      <button className="btn btn-roll" disabled={!canAct || rolled || busy} onClick={onRoll}>
        🎲 Roll Die
      </button>
    </motion.div>
  );
}
