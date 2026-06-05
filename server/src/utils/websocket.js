const clients = new Map();

export function setupWebSocket(wss) {
  wss.on('connection', (ws, req) => {
    const id = req.headers['sec-websocket-key'];
    clients.set(id, ws);

    ws.on('close', () => {
      clients.delete(id);
    });

    ws.on('error', () => {
      clients.delete(id);
    });
  });
}

export function broadcast(event, data) {
  const message = JSON.stringify({ event, data });
  for (const ws of clients.values()) {
    if (ws.readyState === 1) {
      ws.send(message);
    }
  }
}

export function sendTo(clientId, event, data) {
  const ws = clients.get(clientId);
  if (ws && ws.readyState === 1) {
    ws.send(JSON.stringify({ event, data }));
  }
}
