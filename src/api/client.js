// Thin wrapper around the REST API.
// Empty = same origin; the Vite dev server proxies /api to the backend.
const BASE = import.meta.env.VITE_API_URL ?? '';

async function request(path, { method = 'GET', token, body } = {}) {
  let res;
  try {
    res = await fetch(`${BASE}/api/games${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'X-Player-Token': token } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    const err = new Error('Cannot reach the game server. Is the backend running (mvn spring-boot:run, port 8080)?');
    err.status = 0;
    throw err;
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(data?.message ?? `Request failed (${res.status})`);
    err.status = res.status;
    err.code = data?.code;
    throw err;
  }
  return data;
}

export const createGame = () => request('', { method: 'POST' });
export const joinGame = (code) => request(`/${encodeURIComponent(code.trim().toUpperCase())}/join`, { method: 'POST' });
export const getGame = (id) => request(`/${id}`);
export const rollDie = (id, token) => request(`/${id}/roll`, { method: 'POST', token });
export const moveJet = (id, token, jetId) => request(`/${id}/move`, { method: 'POST', token, body: { jetId } });
export const requestRematch = (id, token) => request(`/${id}/rematch`, { method: 'POST', token });
