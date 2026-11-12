import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { LEAD, lineAnimSeconds } from '../lib/layout';

const STEP = 0.25; // sample spacing of the hand-drawn path, in squares

/** A slightly wobbly path from just under the jet's nose out to `length` squares. */
function markerPath(layout, length, seed) {
  const total = length + LEAD;
  const startY = layout.noseY - layout.dir * LEAD;
  const wobble = (u) => 0.045 * Math.sin(u * 3.1 + seed) + 0.03 * Math.sin(u * 7.3 + seed * 2);
  const points = [];
  for (let u = 0; u < total; u += STEP) {
    points.push([layout.lineX + wobble(u), startY + layout.dir * u]);
  }
  points.push([layout.lineX + wobble(total), startY + layout.dir * total]);

  // Smooth the polyline with quadratic curves through the midpoints.
  let d = `M${points[0][0].toFixed(3)} ${points[0][1].toFixed(3)}`;
  for (let i = 1; i < points.length - 1; i++) {
    const [x, y] = points[i];
    const [nx, ny] = points[i + 1];
    d += ` Q${x.toFixed(3)} ${y.toFixed(3)} ${((x + nx) / 2).toFixed(3)} ${((y + ny) / 2).toFixed(3)}`;
  }
  const last = points[points.length - 1];
  d += ` L${last[0].toFixed(3)} ${last[1].toFixed(3)}`;
  return d;
}

/**
 * One jet's missile line, drawn like a marker stroke. When the length grows, only the new part is
 * animated (the path is stretched from the old tip to the new one). On first render nothing animates.
 */
export default function MissileLine({ jetId, length, layout }) {
  const previous = useRef(length);
  const from = previous.current;
  useEffect(() => {
    previous.current = length;
  }, [length]);

  if (length <= 0) return null;

  const total = length + LEAD;
  const delta = length - from;
  const animate = delta > 0;
  const seed = jetId.charCodeAt(0) + Number(jetId.slice(1)) * 1.7;
  const d = markerPath(layout, length, seed);
  const initial = { pathLength: animate ? (from + LEAD) / total : 1 };
  const transition = { duration: animate ? lineAnimSeconds(delta) : 0, ease: 'easeInOut' };

  return (
    <g>
      {/* Main marker stroke */}
      <motion.path
        key={`main-${length}`}
        d={d}
        fill="none"
        stroke={layout.color}
        strokeWidth={0.17}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.92}
        initial={initial}
        animate={{ pathLength: 1 }}
        transition={transition}
      />
      {/* Thin, lighter pass on top for a felt-tip texture */}
      <motion.path
        key={`tex-${length}`}
        d={d}
        fill="none"
        stroke="#fff"
        strokeWidth={0.035}
        strokeLinecap="round"
        opacity={0.35}
        transform="translate(0.03 0)"
        initial={initial}
        animate={{ pathLength: 1 }}
        transition={transition}
      />
    </g>
  );
}
