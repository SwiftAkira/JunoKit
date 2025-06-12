interface WebSocketMessage {
  action: string;
  data?: any;
}

interface WebSocketResponse {
  type: string;
  message?: string;
  [key: string]: any;
}

type EventHandler = (data: WebSocketResponse) => void;

class JunokitWebSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private token: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private eventHandlers: Map<string, EventHandler[]> = new Map();
  private isConnecting = false;
  private shouldReconnect = true;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(url: string, token?: string) {
    this.url = url;
    this.token = token || null;
  }

  public setToken(token: string) {
    this.token = token;
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        // Already connecting, wait for it
        this.once('connected', () => resolve());
        this.once('error', (error) => reject(error));
        return;
      }

      this.isConnecting = true;
      
      try {
        // Build WebSocket URL with auth token
        const wsUrl = this.token 
          ? `${this.url}?token=${encodeURIComponent(this.token)}`
          : this.url;

        console.log('Connecting to WebSocket:', wsUrl.replace(/token=[^&]+/, 'token=***'));
        
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected successfully');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.reconnectDelay = 1000;
          
          // Start heartbeat
          this.startHeartbeat();
          
          this.emit('connected', { type: 'connected' });
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketResponse = JSON.parse(event.data);
            console.log('WebSocket message received:', message);
            
            // Emit specific event type
            this.emit(message.type, message);
            
            // Also emit generic 'message' event
            this.emit('message', message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket connection closed:', event.code, event.reason);
          this.isConnecting = false;
          this.stopHeartbeat();
          
          this.emit('disconnected', { 
            type: 'disconnected', 
            code: event.code, 
            reason: event.reason 
          });

          // Attempt to reconnect if appropriate
          if (this.shouldReconnect && event.code !== 1000) {
            this.attemptReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          this.emit('error', { type: 'error', message: 'Connection error' });
          reject(error);
        };

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  public disconnect() {
    this.shouldReconnect = false;
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
  }

  public send(message: WebSocketMessage): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket is not connected'));
        return;
      }

      try {
        this.ws.send(JSON.stringify(message));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Convenience methods for common actions
  public async ping() {
    return this.send({ action: 'ping' });
  }

  public async sendTypingIndicator(conversationId: string, isTyping: boolean) {
    return this.send({
      action: 'chat_typing',
      data: { conversationId, isTyping }
    });
  }

  public async sendChatMessage(conversationId: string, message: string) {
    return this.send({
      action: 'chat_message',
      data: { conversationId, message }
    });
  }

  public async updateUserStatus(status: 'online' | 'away' | 'busy' | 'offline') {
    return this.send({
      action: 'user_status',
      data: { status }
    });
  }

  public async subscribeToNotifications(notificationTypes: string[]) {
    return this.send({
      action: 'subscribe_notifications',
      data: { notificationTypes }
    });
  }

  // Event handling
  public on(event: string, handler: EventHandler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  public off(event: string, handler: EventHandler) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  public once(event: string, handler: EventHandler) {
    const onceHandler = (data: WebSocketResponse) => {
      handler(data);
      this.off(event, onceHandler);
    };
    this.on(event, onceHandler);
  }

  private emit(event: string, data: WebSocketResponse) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error('Error in WebSocket event handler:', error);
        }
      });
    }
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    
    // Send ping every 30 seconds to keep connection alive
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ping().catch(error => {
          console.error('Heartbeat ping failed:', error);
        });
      }
    }, 30000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      this.emit('reconnect_failed', { 
        type: 'reconnect_failed', 
        message: 'Maximum reconnection attempts exceeded' 
      });
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    setTimeout(() => {
      this.connect().catch(error => {
        console.error('Reconnection failed:', error);
        // Exponential backoff
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
        this.attemptReconnect();
      });
    }, this.reconnectDelay);
  }

  public get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  public get connectionState(): string {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'connected';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'disconnected';
      default: return 'unknown';
    }
  }
}

// Singleton instance
let webSocketInstance: JunokitWebSocket | null = null;

export function createWebSocket(token?: string): JunokitWebSocket {
  // Get WebSocket URL from environment or use production URL
  const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'wss://jxog5mi321.execute-api.eu-north-1.amazonaws.com/v1';
  
  if (webSocketInstance) {
    if (token) {
      webSocketInstance.setToken(token);
    }
    return webSocketInstance;
  }
  
  webSocketInstance = new JunokitWebSocket(wsUrl, token);
  return webSocketInstance;
}

export function getWebSocket(): JunokitWebSocket | null {
  return webSocketInstance;
}

export function destroyWebSocket() {
  if (webSocketInstance) {
    webSocketInstance.disconnect();
    webSocketInstance = null;
  }
}

export type { WebSocketMessage, WebSocketResponse, EventHandler };
export { JunokitWebSocket }; 