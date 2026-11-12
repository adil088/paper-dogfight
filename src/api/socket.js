import { Client } from '@stomp/stompjs';

// Same host as the page; the Vite dev server proxies /ws to the backend.
const WS_URL =
  import.meta.env.VITE_WS_URL ??
  `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws`;

/**
 * Subscribes to /topic/games/{id}. The client reconnects on its own; `onConnect` fires after every
 * (re)connection so the caller can reload the state it may have missed. Returns a cleanup function.
 */
export function connectToGame(gameId, { onState, onConnect, onDisconnect }) {
  const client = new Client({ brokerURL: WS_URL, reconnectDelay: 2000 });

  client.onConnect = () => {
    client.subscribe(`/topic/games/${gameId}`, (message) => onState(JSON.parse(message.body)));
    onConnect?.();
  };
  client.onWebSocketClose = () => onDisconnect?.();

  client.activate();
  return () => {
    client.deactivate();
  };
}
