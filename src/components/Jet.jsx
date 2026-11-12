import { useRef } from 'react';
import { motion } from 'framer-motion';
import { COLORS, jetNumber } from '../lib/layout';

const BURST_ANGLES = Array.from({ length: 10 }, (_, i) => (i * Math.PI * 2) / 10);

/**
 * A top-down jet drawn in unit coordinates (nose at +y, wingspan 2). Blue is drawn as is, Red is
 * rotated 180 degrees so both noses point at the enemy.
 *
 * When a jet goes from alive to destroyed it gets a sketchy burst, is greyed out and gets a
 * hand-drawn X in the attacker's colour, all after `destroyDelay` seconds so the attacking line
 * finishes drawing first. Jets that were already dead on load just show the finished X.
 */
export default function Jet({ jet, layout, selectable, onSelect, destroyDelay = 0 }) {
  const wasAlive = useRef(jet.alive);
  const diedNow = useRef(false);
  if (wasAlive.current && !jet.alive) diedNow.current = true;
  if (jet.alive) diedNow.current = false;
  wasAlive.current = jet.alive;

  const dead = !jet.alive;
  const team = COLORS[jet.team];
  const attacker = COLORS[jet.destroyedBy ?? (jet.team === 'RED' ? 'BLUE' : 'RED')];
  const fade = diedNow.current ? { transition: `fill 0.3s ${destroyDelay}s, stroke 0.3s ${destroyDelay}s` } : undefined;

  const body = dead ? '#cfcfcf' : '#f7f7f3';
  const outline = dead ? '#8d8d8d' : '#2b2b2b';
  const accent = dead ? '#9a9a9a' : team;
  const labelY = layout.dir === 1 ? -1.07 : 1.5;

  const activate = (event) => {
    if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    onSelect(jet.id);
  };

  return (
    <g transform={`translate(${layout.x} ${layout.y})`}>
      {selectable && (
        <motion.circle
          r={1.35}
          fill={team}
          fillOpacity={0.1}
          stroke={team}
          strokeWidth={0.08}
          strokeDasharray="0.28 0.2"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
        />
      )}

      <g transform={`rotate(${layout.angle})`} strokeLinejoin="round" strokeWidth={0.05} stroke={outline}>
        {/* wings */}
        <path d="M0.17 0.4 L1 -0.45 L1 -0.62 L0.15 -0.15Z" fill={body} style={fade} />
        <path d="M-0.17 0.4 L-1 -0.45 L-1 -0.62 L-0.15 -0.15Z" fill={body} style={fade} />
        {/* tail fins */}
        <path d="M0.13 -0.55 L0.48 -0.92 L0.48 -1 L0.12 -0.85Z" fill={body} style={fade} />
        <path d="M-0.13 -0.55 L-0.48 -0.92 L-0.48 -1 L-0.12 -0.85Z" fill={body} style={fade} />
        {/* fuselage */}
        <path d="M0 1 C0.2 0.65 0.22 0.1 0.17 -0.45 L0.13 -0.9 L-0.13 -0.9 L-0.17 -0.45 C-0.22 0.1 -0.2 0.65 0 1Z" fill={body} style={fade} />
        {/* cockpit and accent dots in the team colour */}
        <ellipse cx={0} cy={0.35} rx={0.09} ry={0.22} fill={accent} stroke="none" style={fade} />
        <circle cx={0.6} cy={-0.2} r={0.07} fill={accent} stroke="none" style={fade} />
        <circle cx={-0.6} cy={-0.2} r={0.07} fill={accent} stroke="none" style={fade} />
      </g>

      <text
        x={0}
        y={labelY}
        textAnchor="middle"
        fontSize={0.5}
        fontWeight="bold"
        fill={dead ? '#999' : team}
        style={{ fontFamily: 'inherit', userSelect: 'none' }}
      >
        {jetNumber(jet.id)}
      </text>

      {dead && diedNow.current &&
        BURST_ANGLES.map((a, i) => (
          <motion.line
            key={i}
            x1={Math.cos(a) * 0.3}
            y1={Math.sin(a) * 0.3}
            stroke={attacker}
            strokeWidth={0.07}
            strokeLinecap="round"
            initial={{ x2: Math.cos(a) * 0.4, y2: Math.sin(a) * 0.4, opacity: 0 }}
            animate={{ x2: Math.cos(a) * 1.6, y2: Math.sin(a) * 1.6, opacity: [0, 1, 0] }}
            transition={{ delay: destroyDelay, duration: 0.6, times: [0, 0.2, 1] }}
          />
        ))}

      {dead && (
        <g stroke={attacker} strokeWidth={0.15} strokeLinecap="round" fill="none">
          <motion.path
            d="M-0.9 -0.85 Q0.1 0 0.85 0.9"
            initial={diedNow.current ? { pathLength: 0 } : false}
            animate={{ pathLength: 1 }}
            transition={{ delay: destroyDelay + 0.1, duration: 0.25 }}
          />
          <motion.path
            d="M0.85 -0.9 Q-0.05 0 -0.9 0.8"
            initial={diedNow.current ? { pathLength: 0 } : false}
            animate={{ pathLength: 1 }}
            transition={{ delay: destroyDelay + 0.35, duration: 0.25 }}
          />
        </g>
      )}

      {selectable && (
        <circle
          r={1.3}
          fill="transparent"
          style={{ cursor: 'pointer', outline: 'none' }}
          role="button"
          tabIndex={0}
          aria-label={`Advance ${jet.team.toLowerCase()} jet ${jetNumber(jet.id)}`}
          onClick={activate}
          onKeyDown={activate}
        />
      )}
    </g>
  );
}
