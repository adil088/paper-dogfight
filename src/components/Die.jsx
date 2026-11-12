import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Pip positions on a 4x4 face, as [column, row].
const PIPS = {
  1: [[2, 2]],
  2: [[1, 1], [3, 3]],
  3: [[1, 1], [2, 2], [3, 3]],
  4: [[1, 1], [3, 1], [1, 3], [3, 3]],
  5: [[1, 1], [3, 1], [2, 2], [1, 3], [3, 3]],
  6: [[1, 1], [1, 2], [1, 3], [3, 1], [3, 2], [3, 3]],
};

function Face({ value }) {
  return (
    <svg viewBox="0 0 4 4" style={{ display: 'block', width: '100%' }} aria-label={`Die showing ${value}`}>
      <defs>
        <linearGradient id="dieRed" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f0554d" />
          <stop offset="1" stopColor="#b01f1a" />
        </linearGradient>
      </defs>
      <rect x="0.1" y="0.1" width="3.8" height="3.8" rx="0.7" fill="url(#dieRed)" stroke="#7a1410" strokeWidth="0.1" />
      {PIPS[value].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="0.3" fill="#fff" />
      ))}
    </svg>
  );
}

/**
 * The red die. Every new roll (`rollId`) tumbles onto the board, flickers through random faces
 * and lands on the value the server rolled. With `animate` false (page reload) it just sits there.
 */
export default function Die({ value, rollId, animate, leftPct, widthPct }) {
  const [shown, setShown] = useState(value);

  useEffect(() => {
    if (!animate) {
      setShown(value);
      return undefined;
    }
    const flicker = setInterval(() => setShown(1 + Math.floor(Math.random() * 6)), 90);
    const land = setTimeout(() => {
      clearInterval(flicker);
      setShown(value);
    }, 900);
    return () => {
      clearInterval(flicker);
      clearTimeout(land);
    };
  }, [rollId, value, animate]);

  const tilt = ((rollId * 47) % 36) - 18; // deterministic "random" landing angle

  return (
    <div className="die-slot" style={{ left: `${leftPct}%`, width: `${widthPct}%` }}>
      <motion.div
        key={rollId}
        className="die"
        initial={animate ? { y: -380, x: leftPct < 50 ? -120 : 120, rotate: -720, scale: 1.5, opacity: 0 } : false}
        animate={{
          y: [-380, 0, -26, 0],
          x: [leftPct < 50 ? -120 : 120, 0, 0, 0],
          rotate: [-720, tilt, tilt + 6, tilt],
          scale: [1.5, 1, 1, 1],
          opacity: [0, 1, 1, 1],
        }}
        transition={animate ? { duration: 1, times: [0, 0.6, 0.8, 1], ease: 'easeOut' } : { duration: 0 }}
      >
        <Face value={shown} />
      </motion.div>
    </div>
  );
}
