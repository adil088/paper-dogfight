import { useEffect, useRef } from 'react';
import { COLORS, jetNumber, teamLabel } from '../lib/layout';

const squares = (n) => `${n} square${n === 1 ? '' : 's'}`;

/** Sidebar listing every move, newest at the bottom. */
export default function MoveLog({ moves }) {
  const box = useRef(null);
  useEffect(() => {
    if (box.current) box.current.scrollTop = box.current.scrollHeight;
  }, [moves.length]);

  return (
    <section className="log" aria-label="Move log">
      <h2>Move log</h2>
      <ol ref={box}>
        {moves.length === 0 && <li className="log-empty">No moves yet.</li>}
        {moves.map((m, i) => (
          <li key={i}>
            {m.type === 'SKIP' ? (
              <span className="log-skip" style={{ color: COLORS[m.team] }}>
                {m.dieValue > 0
                  ? `${teamLabel(m.team)} rolled ${m.dieValue}, but no jet could use it. Turn passed.`
                  : `${teamLabel(m.team)} has no jet that can advance, turn skipped.`}
              </span>
            ) : (
              <>
                <span style={{ color: COLORS[m.team] }}>
                  {teamLabel(m.team)} rolled {m.dieValue}, jet {jetNumber(m.jetId)} advanced {squares(m.advanced)}
                </span>
                {m.hit && (
                  <div className="log-hit" style={{ color: COLORS[m.team] }}>
                    {teamLabel(m.team === 'RED' ? 'BLUE' : 'RED')} jet {jetNumber(m.destroyedJetId)} destroyed!
                  </div>
                )}
              </>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
