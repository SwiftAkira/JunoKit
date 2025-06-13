'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createWebSocket, getWebSocket, WebSocketResponse } from '@/lib/websocket';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  status: 'sending' | 'sent' | 'error';
  type: 'text' | 'image' | 'file';
}

interface RealtimeChatState {
  isConnected: boolean;
  connectionState: string;
  isTyping: boolean;
  lastActivity: Date | null;
}

interface UseRealtimeChatReturn {
  // Connection state
  chatState: RealtimeChatState;
  
  // WebSocket functions
  sendMessage: (conversationId: string, message: string) => Promise<void>;
  sendTypingIndicator: (conversationId: string, isTyping: boolean) => Promise<void>;
  updateUserStatus: (status: 'online' | 'away' | 'busy' | 'offline') => Promise<void>;
  
  // Message handlers
  onNewMessage: (callback: (message: any) => void) => void;
  onTypingUpdate: (callback: (data: { conversationId: string; isTyping: boolean; userId: string }) => void) => void;
  onUserStatusUpdate: (callback: (data: { userId: string; status: string }) => void) => void;
  
  // Connection management
  connect: () => Promise<void>;
  disconnect: () => void;
}

export function useRealtimeChat(): UseRealtimeChatReturn {
  const { user } = useAuth();
  const [chatState, setChatState] = useState<RealtimeChatState>({
    isConnected: false,
    connectionState: 'disconnected',
    isTyping: false,
    lastActivity: null,
  });
  
  const wsRef = useRef(createWebSocket());
  const messageCallbacksRef = useRef<((message: any) => void)[]>([]);
  const typingCallbacksRef = useRef<((data: any) => void)[]>([]);
  const statusCallbacksRef = useRef<((data: any) => void)[]>([]);

  // Initialize WebSocket connection
  useEffect(() => {
    const initializeWebSocket = async () => {
      try {
        // Get auth token if user is authenticated
        let token = null;
        if (user?.token) {
          token = user.token;
        }

        // Set token if available
        if (token) {
          wsRef.current.setToken(token);
        }

        // Set up event listeners
        setupEventListeners();
        
        // Connect to WebSocket
        await wsRef.current.connect();
        
      } catch (error) {
        console.error('Failed to initialize WebSocket:', error);
      }
    };

    initializeWebSocket();

    // Cleanup on unmount
    return () => {
      wsRef.current.disconnect();
    };
  }, [user]);

  const setupEventListeners = () => {
    const ws = wsRef.current;

    // Connection events
    ws.on('connected', () => {
      setChatState(prev => ({
        ...prev,
        isConnected: true,
        connectionState: 'connected',
        lastActivity: new Date(),
      }));
      console.log('🔄 Real-time chat connected');
    });

    ws.on('disconnected', () => {
      setChatState(prev => ({
        ...prev,
        isConnected: false,
        connectionState: 'disconnected',
      }));
      console.log('🔄 Real-time chat disconnected');
    });

    ws.on('error', (data: WebSocketResponse) => {
      console.error('🔄 Real-time chat error:', data.message);
    });

    // Message events
    ws.on('message_received', (data: WebSocketResponse) => {
      messageCallbacksRef.current.forEach(callback => callback(data));
    });

    ws.on('ai_response', (data: WebSocketResponse) => {
      messageCallbacksRef.current.forEach(callback => callback(data));
    });

    // Typing events
    ws.on('typing_acknowledged', (data: WebSocketResponse) => {
      typingCallbacksRef.current.forEach(callback => callback(data));
    });

    ws.on('user_typing', (data: WebSocketResponse) => {
      typingCallbacksRef.current.forEach(callback => callback(data));
    });

    // Status events
    ws.on('status_updated', (data: WebSocketResponse) => {
      statusCallbacksRef.current.forEach(callback => callback(data));
    });

    ws.on('user_status_change', (data: WebSocketResponse) => {
      statusCallbacksRef.current.forEach(callback => callback(data));
    });

    // Heartbeat
    ws.on('pong', () => {
      setChatState(prev => ({
        ...prev,
        lastActivity: new Date(),
      }));
    });

    // Update connection state periodically
    const stateInterval = setInterval(() => {
      setChatState(prev => ({
        ...prev,
        connectionState: ws.connectionState,
        isConnected: ws.isConnected,
      }));
    }, 2000);

    return () => clearInterval(stateInterval);
  };

  // Send real-time message
  const sendMessage = async (conversationId: string, message: string): Promise<void> => {
    try {
      await wsRef.current.sendChatMessage(conversationId, message);
    } catch (error) {
      console.error('Failed to send real-time message:', error);
      throw error;
    }
  };

  // Send typing indicator
  const sendTypingIndicator = async (conversationId: string, isTyping: boolean): Promise<void> => {
    try {
      await wsRef.current.sendTypingIndicator(conversationId, isTyping);
      setChatState(prev => ({ ...prev, isTyping }));
    } catch (error) {
      console.error('Failed to send typing indicator:', error);
      // Don't throw - typing indicators are non-critical
    }
  };

  // Update user status
  const updateUserStatus = async (status: 'online' | 'away' | 'busy' | 'offline'): Promise<void> => {
    try {
      await wsRef.current.updateUserStatus(status);
    } catch (error) {
      console.error('Failed to update user status:', error);
      throw error;
    }
  };

  // Register message callback
  const onNewMessage = (callback: (message: any) => void) => {
    messageCallbacksRef.current.push(callback);
  };

  // Register typing callback
  const onTypingUpdate = (callback: (data: { conversationId: string; isTyping: boolean; userId: string }) => void) => {
    typingCallbacksRef.current.push(callback);
  };

  // Register status callback
  const onUserStatusUpdate = (callback: (data: { userId: string; status: string }) => void) => {
    statusCallbacksRef.current.push(callback);
  };

  // Manual connection control
  const connect = async (): Promise<void> => {
    try {
      await wsRef.current.connect();
    } catch (error) {
      console.error('Failed to connect to real-time chat:', error);
      throw error;
    }
  };

  const disconnect = (): void => {
    wsRef.current.disconnect();
  };

  return {
    chatState,
    sendMessage,
    sendTypingIndicator,
    updateUserStatus,
    onNewMessage,
    onTypingUpdate,
    onUserStatusUpdate,
    connect,
    disconnect,
  };
} 