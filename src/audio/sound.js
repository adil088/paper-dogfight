// Tiny synthesised sound effects (no audio files needed) built on the Web Audio API.
let ctx = null;
let muted = false;

export function setMuted(value) {
  muted = value;
}

function audio() {
  if (!ctx) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function noise(c, seconds) {
  const buffer = c.createBuffer(1, Math.max(1, Math.floor(c.sampleRate * seconds)), c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const source = c.createBufferSource();
  source.buffer = buffer;
  return source;
}

function safely(fn) {
  if (muted) return;
  try {
    const c = audio();
    if (c) fn(c);
  } catch {
    /* sound is optional; never break the game because of it */
  }
}

/** Dice rattling on a table: a handful of short clicks. */
export function playDice() {
  safely((c) => {
    for (let i = 0; i < 7; i++) {
      const t = c.currentTime + i * 0.11 + Math.random() * 0.04;
      const src = noise(c, 0.04);
      const filter = c.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1800 + Math.random() * 1800;
      const gain = c.createGain();
      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      src.connect(filter).connect(gain).connect(c.destination);
      src.start(t);
    }
  });
}

/** Marker scribbling on paper: filtered noise with a wobbling volume. */
export function playScribble(seconds = 0.8) {
  safely((c) => {
    const t = c.currentTime;
    const src = noise(c, seconds);
    const filter = c.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, t);
    filter.frequency.linearRampToValueAtTime(3200, t + seconds);
    const gain = c.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    for (let i = 1; i <= 8; i++) {
      gain.gain.linearRampToValueAtTime(i % 2 ? 0.22 : 0.08, t + (seconds * i) / 9);
    }
    gain.gain.linearRampToValueAtTime(0.0001, t + seconds);
    src.connect(filter).connect(gain).connect(c.destination);
    src.start(t);
  });
}

/** A short, low explosion thump. */
export function playHit() {
  safely((c) => {
    const t = c.currentTime;
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.5);
    const og = c.createGain();
    og.gain.setValueAtTime(0.7, t);
    og.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
    osc.connect(og).connect(c.destination);
    osc.start(t);
    osc.stop(t + 0.6);

    const src = noise(c, 0.4);
    const filter = c.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 900;
    const ng = c.createGain();
    ng.gain.setValueAtTime(0.5, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    src.connect(filter).connect(ng).connect(c.destination);
    src.start(t);
  });
}
