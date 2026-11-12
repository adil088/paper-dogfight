import { useMemo, useRef } from 'react';
import Jet from './Jet';
import MissileLine from './MissileLine';
import Die from './Die';
import { jetLayout, lineAnimSeconds } from '../lib/layout';

/**
 * The sheet of grid paper on a wooden table. Everything is drawn in one SVG whose viewBox is
 * `cols x rows`, so one unit is one grid square. The die is an HTML overlay positioned in the
 * free space between the lanes.
 */
export default function Board({ game, canSelect, onSelectJet }) {
  const { cols, rows } = game.config;
  const layouts = useMemo(
    () => Object.fromEntries(game.jets.map((jet) => [jet.id, jetLayout(game.config, jet)])),
    [game.config, game.jets],
  );

  // Roll count at first render: a die that is already there on load must not tumble again.
  const initialRollCount = useRef(game.rollCount);
  const animateDie = game.rollCount !== initialRollCount.current;

  // Delay each destruction until the line that caused it has finished drawing.
  const destroyDelay = {};
  for (const move of game.moves) {
    if (move.destroyedJetId) destroyDelay[move.destroyedJetId] = lineAnimSeconds(move.advanced) + 0.15;
  }

  const verticals = Array.from({ length: cols - 1 }, (_, i) => i + 1);
  const horizontals = Array.from({ length: rows - 1 }, (_, i) => i + 1);
  const selectable = new Set(canSelect ? game.selectableJetIds : []);

  const middle = cols / 2;
  const dieX = game.lastRollTeam === 'BLUE' ? middle + 1.75 : middle - 1.75;
  const dieSize = 2.2;

  return (
    <div className="wood">
      <div
        className="sheet"
        style={{
          aspectRatio: `${cols} / ${rows}`,
          width: `min(100%, calc((100vh - 260px) * ${cols} / ${rows}))`,
        }}
      >
        <svg viewBox={`0 0 ${cols} ${rows}`} className="paper" role="img" aria-label="Paper dogfight board">
          <rect x={0} y={0} width={cols} height={rows} fill="#f7fbff" />
          <g stroke="#a9d4f2" strokeWidth={0.035}>
            {verticals.map((x) => (
              <line key={`v${x}`} x1={x} y1={0} x2={x} y2={rows} />
            ))}
            {horizontals.map((y) => (
              <line key={`h${y}`} x1={0} y1={y} x2={cols} y2={y} />
            ))}
          </g>

          {/* lines first, so jets sit on top of where the lines start */}
          <g>
            {game.jets.map((jet) => (
              <MissileLine
                key={jet.id}
                jetId={jet.id}
                length={jet.lineLengthInSquares}
                layout={layouts[jet.id]}
              />
            ))}
          </g>
          <g>
            {game.jets.map((jet) => (
              <Jet
                key={jet.id}
                jet={jet}
                layout={layouts[jet.id]}
                selectable={selectable.has(jet.id)}
                onSelect={onSelectJet}
                destroyDelay={destroyDelay[jet.id] ?? 0}
              />
            ))}
          </g>
        </svg>

        {game.lastRollValue != null && (
          <Die
            value={game.lastRollValue}
            rollId={game.rollCount}
            animate={animateDie}
            leftPct={(dieX / cols) * 100}
            widthPct={(dieSize / cols) * 100}
          />
        )}
      </div>
    </div>
  );
}
