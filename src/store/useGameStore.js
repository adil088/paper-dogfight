import { create } from 'zustand';
import * as api from '../api/client';
import { setMuted } from '../audio/sound';

const SESSION_KEY = 'paperDogfight.session';
const MUTE_KEY = 'paperDogfight.muted';

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

function saveSession(session) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(SESSION_KEY);
}

const initialMuted = localStorage.getItem(MUTE_KEY) === '1';
setMuted(initialMuted);

/**
 * Which team the local user controls right now.
 *  - online : the team they joined as
 *  - ai     : always Red (the computer plays Blue)
 *  - hotseat: whoever's turn it is, since both players share the screen
 */
export function actingTeam(session, game) {
  if (!session || !game) return null;
  if (session.mode === 'hotseat') return game.currentTurn;
  return session.myTeam;
}

export const useGameStore = create((set, get) => ({
  session: loadSession(), // { mode, gameId, tokens: {RED?, BLUE?}, myTeam }
  game: null,
  connected: false,
  busy: false,
  error: null,
  muted: initialMuted,

  setConnected: (connected) => set({ connected }),
  clearError: () => set({ error: null }),
  fail: (err) => set({ error: err.message ?? String(err) }),

  toggleMute: () => {
    const muted = !get().muted;
    setMuted(muted);
    localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
    set({ muted });
  },

  /** Accepts a state from REST or WebSocket, ignoring anything older than what we already show. */
  applyState: (state) => {
    const current = get().game;
    if (current && current.id === state.id && state.version < current.version) return;
    set({ game: state });
  },

  startSession: (session, state) => {
    saveSession(session);
    set({ session, game: state, error: null });
  },

  createOnline: async () => {
    set({ busy: true });
    try {
      const res = await api.createGame();
      get().startSession(
        { mode: 'online', gameId: res.gameId, tokens: { [res.team]: res.token }, myTeam: res.team },
        res.state,
      );
    } catch (e) {
      get().fail(e);
    } finally {
      set({ busy: false });
    }
  },

  joinOnline: async (code) => {
    set({ busy: true });
    try {
      const res = await api.joinGame(code);
      get().startSession(
        { mode: 'online', gameId: res.gameId, tokens: { [res.team]: res.token }, myTeam: res.team },
        res.state,
      );
    } catch (e) {
      get().fail(e);
    } finally {
      set({ busy: false });
    }
  },

  /** Hot-seat and vs-computer games: this browser creates the game and joins it as the second player. */
  startLocal: async (mode) => {
    set({ busy: true });
    try {
      const created = await api.createGame();
      const joined = await api.joinGame(created.gameId);
      get().startSession(
        {
          mode,
          gameId: created.gameId,
          tokens: { RED: created.token, BLUE: joined.token },
          myTeam: mode === 'ai' ? 'RED' : null,
        },
        joined.state,
      );
    } catch (e) {
      get().fail(e);
    } finally {
      set({ busy: false });
    }
  },

  /** Reloads the game from the server (after a page refresh or a WebSocket reconnect). */
  refresh: async () => {
    const { session } = get();
    if (!session) return;
    try {
      get().applyState(await api.getGame(session.gameId));
    } catch (e) {
      if (e.status === 404) {
        get().leave();
        set({ error: 'That game no longer exists (the server may have restarted).' });
      }
    }
  },

  leave: () => {
    saveSession(null);
    set({ session: null, game: null, connected: false });
  },

  roll: async (as) => {
    const { session, game, busy } = get();
    if (!session || !game || busy) return;
    const team = as ?? actingTeam(session, game);
    set({ busy: true });
    try {
      get().applyState(await api.rollDie(session.gameId, session.tokens[team]));
    } catch (e) {
      get().fail(e);
    } finally {
      set({ busy: false });
    }
  },

  selectJet: async (jetId, as) => {
    const { session, game, busy } = get();
    if (!session || !game || busy) return;
    const team = as ?? actingTeam(session, game);
    set({ busy: true });
    try {
      get().applyState(await api.moveJet(session.gameId, session.tokens[team], jetId));
    } catch (e) {
      get().fail(e);
    } finally {
      set({ busy: false });
    }
  },

  /** Online: asks for a rematch. Local modes hold both tokens, so both sides agree at once. */
  rematch: async () => {
    const { session } = get();
    if (!session) return;
    set({ busy: true });
    try {
      for (const token of Object.values(session.tokens)) {
        get().applyState(await api.requestRematch(session.gameId, token));
      }
    } catch (e) {
      get().fail(e);
    } finally {
      set({ busy: false });
    }
  },
}));
