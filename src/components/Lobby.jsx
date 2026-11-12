import { useState } from 'react';
import { useGameStore } from '../store/useGameStore';

/** Start screen: create or join an online game, or play on one screen. */
export default function Lobby() {
  const [code, setCode] = useState('');
  const busy = useGameStore((s) => s.busy);
  const createOnline = useGameStore((s) => s.createOnline);
  const joinOnline = useGameStore((s) => s.joinOnline);
  const startLocal = useGameStore((s) => s.startLocal);

  const join = (event) => {
    event.preventDefault();
    if (code.trim()) joinOnline(code);
  };

  return (
    <main className="lobby">
      <h1>✈️ Paper Dogfight</h1>
      <p className="tagline">Roll the die, draw your missile line, cross out the enemy jets.</p>

      <div className="lobby-grid">
        <section className="card">
          <h2>Play online</h2>
          <p>Two browsers, one game. Red goes first.</p>
          <button className="btn btn-primary" disabled={busy} onClick={createOnline}>Create game</button>
          <form onSubmit={join} className="join-form">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Game code"
              maxLength={8}
              aria-label="Game code"
            />
            <button className="btn" disabled={busy || !code.trim()} type="submit">Join</button>
          </form>
        </section>

        <section className="card">
          <h2>Play on this screen</h2>
          <p>Pass the device back and forth, or take on the computer.</p>
          <button className="btn" disabled={busy} onClick={() => startLocal('hotseat')}>Hot-seat (2 players)</button>
          <button className="btn" disabled={busy} onClick={() => startLocal('ai')}>Vs Computer</button>
        </section>
      </div>

      <details className="rules card">
        <summary>How to play</summary>
        <ol>
          <li>Red starts, then turns alternate.</li>
          <li>Roll the die, then pick one of your living jets.</li>
          <li>That jet&apos;s missile line grows toward the enemy by exactly the number you rolled.</li>
          <li>Reach the enemy jet in your lane to cross it out. You need the exact number: a jet 2 squares away is only destroyed by a 2 (a 1 creeps closer, a bigger roll can&apos;t be used on it). If no jet can use your roll, the turn passes.</li>
          <li>Destroyed jets can&apos;t move.</li>
          <li>Cross out all three enemy jets to win. If nobody can advance any more, the team with more jets left wins.</li>
        </ol>
      </details>
    </main>
  );
}
