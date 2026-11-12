import { useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';

/**
 * Plays Blue in "vs Computer" mode: rolls, then picks a random living jet that can still advance.
 * It goes through the same REST calls (and server-side validation) as a human player.
 */
export function useAI() {
  const session = useGameStore((s) => s.session);
  const game = useGameStore((s) => s.game);
  const roll = useGameStore((s) => s.roll);
  const selectJet = useGameStore((s) => s.selectJet);

  useEffect(() => {
    if (!session || session.mode !== 'ai' || !game) return undefined;
    if (game.status !== 'IN_PROGRESS' || game.currentTurn !== 'BLUE') return undefined;

    let timer;
    if (game.pendingRoll == null) {
      timer = setTimeout(() => roll('BLUE'), 1200);
    } else if (game.selectableJetIds.length > 0) {
      const options = game.selectableJetIds;
      const pick = options[Math.floor(Math.random() * options.length)];
      timer = setTimeout(() => selectJet(pick, 'BLUE'), 1400);
    }
    return () => clearTimeout(timer);
    // game.version changes on every server-side change, which is exactly when the AI should re-think.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, game?.version]);
}
