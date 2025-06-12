'use client';

import React from 'react';
import { useRealtimeChat } from '@/hooks/useRealtimeChat';

interface RealtimeChatStatusProps {
  className?: string;
}

export function RealtimeChatStatus({ className = '' }: RealtimeChatStatusProps) {
  const { chatState, connect, disconnect } = useRealtimeChat();

  const getStatusColor = (state: string) => {
    switch (state) {
      case 'connected': return 'text-green-600 dark:text-green-400';
      case 'connecting': return 'text-yellow-600 dark:text-yellow-400';
      case 'disconnected': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (state: string) => {
    switch (state) {
      case 'connected': return '🟢';
      case 'connecting': return '🟡';
      case 'disconnected': return '🔴';
      default: return '⚪';
    }
  };

  const getStatusText = (state: string) => {
    switch (state) {
      case 'connected': return 'Real-time';
      case 'connecting': return 'Connecting...';
      case 'disconnected': return 'Offline';
      default: return 'Unknown';
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="text-lg">
        {getStatusIcon(chatState.connectionState)}
      </span>
      <span className={`text-sm font-medium ${getStatusColor(chatState.connectionState)}`}>
        {getStatusText(chatState.connectionState)}
      </span>
      
      {chatState.isTyping && (
        <span className="text-xs text-blue-600 dark:text-blue-400 animate-pulse">
          typing...
        </span>
      )}
      
      {chatState.lastActivity && chatState.isConnected && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Last: {chatState.lastActivity.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </span>
      )}
    </div>
  );
}

// Compact version for header/toolbar
export function RealtimeChatStatusCompact({ className = '' }: RealtimeChatStatusProps) {
  const { chatState } = useRealtimeChat();

  const getStatusColor = (state: string) => {
    switch (state) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500 animate-pulse';
      case 'disconnected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`} title={`Real-time chat: ${chatState.connectionState}`}>
      <div className={`w-2 h-2 rounded-full ${getStatusColor(chatState.connectionState)}`} />
      {chatState.isTyping && (
        <span className="text-xs text-blue-600 dark:text-blue-400">
          ⌨️
        </span>
      )}
    </div>
  );
} 