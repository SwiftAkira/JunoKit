'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createWebSocket, getWebSocket, WebSocketResponse } from '@/lib/websocket';
import { Button } from '@/components/ui/button';

interface LogEntry {
  timestamp: string;
  type: 'info' | 'error' | 'sent' | 'received';
  message: string;
}

export function WebSocketDemo() {
  const [connectionState, setConnectionState] = useState<string>('disconnected');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const wsRef = useRef(createWebSocket());
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ws = wsRef.current;

    // Set up event listeners
    ws.on('connected', (data) => {
      setConnectionState('connected');
      addLog('info', 'WebSocket connected successfully');
    });

    ws.on('disconnected', (data) => {
      setConnectionState('disconnected');
      addLog('info', `WebSocket disconnected: ${data.reason || 'Unknown reason'}`);
    });

    ws.on('error', (data) => {
      addLog('error', `WebSocket error: ${data.message || 'Unknown error'}`);
    });

    ws.on('message', (data) => {
      addLog('received', JSON.stringify(data, null, 2));
    });

    ws.on('pong', (data) => {
      addLog('received', `Pong received: ${data.timestamp}`);
    });

    ws.on('reconnect_failed', (data) => {
      addLog('error', 'Failed to reconnect after maximum attempts');
    });

    // Update connection state periodically
    const stateInterval = setInterval(() => {
      setConnectionState(ws.connectionState);
    }, 1000);

    return () => {
      clearInterval(stateInterval);
      // Note: We don't disconnect here to maintain connection across component unmounts
    };
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom of logs
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (type: LogEntry['type'], message: string) => {
    setLogs(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      type,
      message
    }]);
  };

  const handleConnect = async () => {
    try {
      addLog('info', 'Attempting to connect...');
      await wsRef.current.connect();
    } catch (error) {
      addLog('error', `Connection failed: ${error}`);
    }
  };

  const handleDisconnect = () => {
    wsRef.current.disconnect();
    addLog('info', 'Disconnected by user');
  };

  const handlePing = async () => {
    try {
      await wsRef.current.ping();
      addLog('sent', 'Ping sent');
    } catch (error) {
      addLog('error', `Ping failed: ${error}`);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;

    try {
      const message = { action: 'test', data: { message: messageInput } };
      await wsRef.current.send(message);
      addLog('sent', JSON.stringify(message, null, 2));
      setMessageInput('');
    } catch (error) {
      addLog('error', `Send failed: ${error}`);
    }
  };

  const handleUpdateStatus = async (status: 'online' | 'away' | 'busy' | 'offline') => {
    try {
      await wsRef.current.updateUserStatus(status);
      addLog('sent', `Status update: ${status}`);
    } catch (error) {
      addLog('error', `Status update failed: ${error}`);
    }
  };

  const handleSubscribeNotifications = async () => {
    try {
      await wsRef.current.subscribeToNotifications(['chat', 'system', 'ai_response']);
      addLog('sent', 'Subscribed to notifications: chat, system, ai_response');
    } catch (error) {
      addLog('error', `Subscription failed: ${error}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const getStatusColor = (state: string) => {
    switch (state) {
      case 'connected': return 'text-green-600';
      case 'connecting': return 'text-yellow-600';
      case 'disconnected': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'info': return 'text-blue-600';
      case 'error': return 'text-red-600';
      case 'sent': return 'text-green-600';
      case 'received': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">WebSocket Demo</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Status:</span>
          <span className={`text-sm font-semibold ${getStatusColor(connectionState)}`}>
            {connectionState.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Connection Controls */}
      <div className="flex flex-wrap gap-2">
        <Button 
          onClick={handleConnect} 
          disabled={connectionState === 'connected' || connectionState === 'connecting'}
          className="bg-green-600 hover:bg-green-700"
        >
          Connect
        </Button>
        <Button 
          onClick={handleDisconnect} 
          disabled={connectionState === 'disconnected'}
          variant="outline"
        >
          Disconnect
        </Button>
        <Button 
          onClick={handlePing} 
          disabled={connectionState !== 'connected'}
          variant="outline"
        >
          Ping
        </Button>
      </div>

      {/* Message Controls */}
      <div className="space-y-2">
        <div className="flex space-x-2">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Enter a test message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={connectionState !== 'connected'}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={connectionState !== 'connected' || !messageInput.trim()}
          >
            Send
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={() => handleUpdateStatus('online')}
            disabled={connectionState !== 'connected'}
            variant="outline"
            size="sm"
          >
            Set Online
          </Button>
          <Button 
            onClick={() => handleUpdateStatus('away')}
            disabled={connectionState !== 'connected'}
            variant="outline"
            size="sm"
          >
            Set Away
          </Button>
          <Button 
            onClick={() => handleUpdateStatus('busy')}
            disabled={connectionState !== 'connected'}
            variant="outline"
            size="sm"
          >
            Set Busy
          </Button>
          <Button 
            onClick={handleSubscribeNotifications}
            disabled={connectionState !== 'connected'}
            variant="outline"
            size="sm"
          >
            Subscribe Notifications
          </Button>
        </div>
      </div>

      {/* Logs */}
      <div className="border border-gray-300 rounded-lg">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-300">
          <h3 className="text-lg font-semibold">Connection Logs</h3>
          <Button onClick={clearLogs} size="sm" variant="outline">
            Clear
          </Button>
        </div>
        <div className="h-96 overflow-y-auto p-4 bg-gray-900 text-white font-mono text-sm">
          {logs.length === 0 ? (
            <div className="text-gray-400">No logs yet...</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1">
                <span className="text-gray-400">[{log.timestamp}]</span>
                <span className={`ml-2 ${getLogColor(log.type)}`}>
                  [{log.type.toUpperCase()}]
                </span>
                <span className="ml-2 text-gray-200">{log.message}</span>
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">How to test:</h4>
        <ol className="list-decimal list-inside space-y-1 text-blue-800 text-sm">
          <li>First deploy the infrastructure: <code className="bg-blue-100 px-1 rounded">cd infrastructure/aws-cdk && npm run deploy</code></li>
          <li>Update the WebSocket URL in your environment variables</li>
          <li>Click "Connect" to establish WebSocket connection</li>
          <li>Try sending test messages and changing user status</li>
          <li>Watch the logs for real-time communication</li>
        </ol>
      </div>
    </div>
  );
} 