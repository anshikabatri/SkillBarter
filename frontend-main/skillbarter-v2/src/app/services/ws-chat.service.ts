import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

type MessageHandler = (data: any) => void;

@Injectable({ providedIn: 'root' })
export class WsChatService {
  private socket: WebSocket | null = null;
  private handlers: Map<number, Set<MessageHandler>> = new Map();
  private reconnectMs = 2000;
  private shouldReconnect = true;

  connect() {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) return;
    try {
      this.socket = new WebSocket(environment.wsUrl);
      this.socket.onopen = () => { console.log('[WS] Connected to', environment.wsUrl); };
      this.socket.onmessage = (ev) => this.handleMessage(ev.data);
      this.socket.onclose = () => { console.warn('[WS] Connection closed'); if (this.shouldReconnect) setTimeout(() => this.connect(), this.reconnectMs); };
      this.socket.onerror = (err) => { console.error('[WS] Error:', err); };
    } catch (e) {
      console.error('[WS] Connection failed:', e);
    }
  }

  disconnect() {
    this.shouldReconnect = false;
    try { this.socket?.close(); } catch { }
    this.socket = null;
    this.handlers.clear();
  }

  subscribeToSession(sessionId: number, onEvent: () => void): () => void {
    let handlers = this.handlers.get(sessionId);
    if (!handlers) {
      handlers = new Set<MessageHandler>();
      this.handlers.set(sessionId, handlers);
    }
    handlers.add(onEvent);
    // send subscribe frame
    this.send({ type: 'subscribe', sessionId });
    return () => {
      const set = this.handlers.get(sessionId);
      if (set) set.delete(onEvent);
      this.send({ type: 'unsubscribe', sessionId });
    };
  }

  private handleMessage(raw: any) {
    try {
      const msg = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (msg?.type === 'message' && msg?.sessionId) {
        const set = this.handlers.get(Number(msg.sessionId));
        if (set) set.forEach(h => { try { h(msg.message); } catch {} });
      }
    } catch (e) { }
  }

  private send(obj: any) {
    try {
      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
      this.socket.send(JSON.stringify(obj));
    } catch { }
  }
}
