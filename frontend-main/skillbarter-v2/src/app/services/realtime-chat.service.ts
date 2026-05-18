import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RealtimeChatService {
  private client: any = null;
  private connected = false;
  private pendingSubscriptions: Array<() => void> = [];

  connect() {
    if (this.client) return;

    const backendBase = environment.apiUrl.replace(/\/api\/?$/, '');

    void Promise.all([
      import('@stomp/stompjs'),
      import('sockjs-client')
    ]).then(([stompModule, sockJsModule]) => {
      try {
        const ClientCtor: any = (stompModule as any).Client;
        const SockJSCtor: any = (sockJsModule as any).default || sockJsModule;

        this.client = new ClientCtor({
          webSocketFactory: () => new SockJSCtor(`${backendBase}/ws`),
          reconnectDelay: 3000,
          heartbeatIncoming: 10000,
          heartbeatOutgoing: 10000,
          onConnect: () => {
            this.connected = true;
            const pending = [...this.pendingSubscriptions];
            this.pendingSubscriptions = [];
            pending.forEach(fn => fn());
          },
          onWebSocketClose: () => {
            this.connected = false;
          },
          onStompError: () => {
            this.connected = false;
          }
        });

        this.client.activate();
      } catch {
        this.client = null;
        this.connected = false;
        this.pendingSubscriptions = [];
      }
    }).catch(() => {
      this.client = null;
      this.connected = false;
      this.pendingSubscriptions = [];
    });
  }

  disconnect() {
    if (!this.client) return;
    this.client.deactivate();
    this.client = null;
    this.connected = false;
    this.pendingSubscriptions = [];
  }

  subscribeToSession(sessionId: number, onEvent: (payload: any) => void): () => void {
    if (!sessionId) return () => {};

    let subscription: any = null;
    const topic = `/topic/sessions/${sessionId}`;

    const subscribeAction = () => {
      if (!this.client) return;
      subscription = this.client.subscribe(topic, (message: any) => {
        try {
          const payload = message.body ? JSON.parse(message.body) : null;
          onEvent(payload);
        } catch {
          onEvent(null);
        }
      });
    };

    if (this.connected) {
      subscribeAction();
    } else {
      this.pendingSubscriptions.push(subscribeAction);
    }

    return () => subscription?.unsubscribe();
  }
}
