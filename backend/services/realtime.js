// Realtime Server-Sent Events (SSE) Hub for Inspector & Government Live Sync
const EventEmitter = require("events");

class RealtimeHub extends EventEmitter {
  constructor() {
    super();
    // Map of connectionId -> { id, userId, role, region, res }
    this.clients = new Map();
    this.nextConnId = 1;

    // Periodic heartbeat to prevent timeout
    setInterval(() => {
      for (const client of this.clients.values()) {
        try {
          client.res.write(": heartbeat\n\n");
        } catch {
          this.clients.delete(client.id);
        }
      }
    }, 25000);
  }

  addClient(user, res) {
    const connId = this.nextConnId++;
    const client = {
      id: connId,
      userId: user.id,
      role: user.role,
      region: user.region,
      res,
    };

    this.clients.set(connId, client);

    // Initial handshake event
    res.write(`event: connected\ndata: ${JSON.stringify({ message: "Connected to YatraSetu Realtime Stream", userId: user.id })}\n\n`);

    return () => {
      this.clients.delete(connId);
    };
  }

  broadcast(eventData, targetInspectorId = null, targetRegion = null) {
    const payload = `data: ${JSON.stringify(eventData)}\n\n`;

    for (const [id, client] of this.clients.entries()) {
      try {
        const isGov = client.role === "government";
        const isTargetInspector = targetInspectorId && client.userId === targetInspectorId;
        const isTargetRegion = targetRegion && client.region === targetRegion;
        const isAmerMatch = (targetRegion === "Amer" && client.region === "Amer / Old City") ||
                            (targetRegion === "Amer / Old City" && client.region === "Amer");

        if (isGov || isTargetInspector || isTargetRegion || isAmerMatch || (!targetInspectorId && !targetRegion)) {
          client.res.write(payload);
        }
      } catch {
        this.clients.delete(id);
      }
    }
  }
}

const realtimeHub = new RealtimeHub();
module.exports = realtimeHub;
