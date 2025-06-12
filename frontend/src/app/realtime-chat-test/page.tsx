'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeChat } from '@/hooks/useRealtimeChat';
import { RealtimeChatStatus } from '@/components/chat/RealtimeChatStatus';
import { MarkdownRenderer } from '@/components/chat/MarkdownRenderer';
import { 
  PaperAirplaneIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface TestMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isRealtime?: boolean;
  source?: 'http' | 'websocket';
}

export default function RealtimeChatTestPage() {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<TestMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testConversationId, setTestConversationId] = useState<string>(`test_${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    chatState,
    sendMessage: sendRealtimeMessage,
    sendTypingIndicator,
    onNewMessage,
    connect,
    disconnect,
  } = useRealtimeChat();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Set up real-time message handlers
  useEffect(() => {
    onNewMessage((data: any) => {
      console.log('📨 Real-time message received:', data);
      
      if (data.action === 'ai_response') {
        const newMessage: TestMessage = {
          id: data.messageId || `rt_${Date.now()}`,
          content: data.content,
          sender: 'ai',
          timestamp: new Date(data.timestamp || Date.now()),
          isRealtime: true,
          source: 'websocket',
        };
        
        setMessages(prev => [...prev, newMessage]);
        setIsLoading(false);
      }
    });
  }, [onNewMessage]);

  // Test real-time message sending
  const handleRealtimeMessage = async () => {
    if (!inputValue.trim() || isLoading || !chatState.isConnected) return;

    const userMessage: TestMessage = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date(),
      isRealtime: true,
      source: 'websocket',
    };

    setMessages(prev => [...prev, userMessage]);
    const messageContent = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    try {
      await sendRealtimeMessage(testConversationId, messageContent);
      console.log('✅ Real-time message sent successfully');
    } catch (error) {
      console.error('❌ Failed to send real-time message:', error);
      setIsLoading(false);
      
      const errorMessage: TestMessage = {
        id: `error_${Date.now()}`,
        content: `Error: ${error instanceof Error ? error.message : 'Failed to send message'}`,
        sender: 'ai',
        timestamp: new Date(),
        isRealtime: false,
        source: 'websocket',
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // Test regular HTTP chat
  const handleHttpMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: TestMessage = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date(),
      isRealtime: false,
      source: 'http',
    };

    setMessages(prev => [...prev, userMessage]);
    const messageContent = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo-token',
        },
        body: JSON.stringify({
          message: messageContent,
          conversationId: testConversationId,
          model: 'default'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      const aiMessage: TestMessage = {
        id: data.aiMessage.messageId || `http_${Date.now()}`,
        content: data.aiMessage.content,
        sender: 'ai',
        timestamp: new Date(data.aiMessage.timestamp),
        isRealtime: false,
        source: 'http',
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
      
    } catch (error) {
      console.error('❌ HTTP chat failed:', error);
      setIsLoading(false);
      
      const errorMessage: TestMessage = {
        id: `http_error_${Date.now()}`,
        content: `HTTP Error: ${error instanceof Error ? error.message : 'Failed to send message'}`,
        sender: 'ai',
        timestamp: new Date(),
        isRealtime: false,
        source: 'http',
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const clearMessages = () => {
    setMessages([]);
    setTestConversationId(`test_${Date.now()}`);
  };

  const handleTypingTest = () => {
    if (chatState.isConnected) {
      sendTypingIndicator(testConversationId, true);
      setTimeout(() => {
        sendTypingIndicator(testConversationId, false);
      }, 2000);
    }
  };

  const getMessageStatusIcon = (message: TestMessage) => {
    if (message.source === 'websocket') {
      return message.isRealtime ? (
        <CheckCircleIcon className="h-4 w-4 text-green-500" title="Real-time WebSocket" />
      ) : (
        <ExclamationCircleIcon className="h-4 w-4 text-red-500" title="WebSocket Error" />
      );
    } else {
      return <ClockIcon className="h-4 w-4 text-blue-500" title="HTTP Request" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              🚀 Real-time Chat Integration Test
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Test WebSocket real-time chat vs traditional HTTP chat
            </p>
          </div>

          {/* Status and Controls */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <RealtimeChatStatus />
              <div className="flex space-x-2">
                <button
                  onClick={connect}
                  disabled={chatState.isConnected}
                  className="px-3 py-1 text-sm bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-md"
                >
                  Connect
                </button>
                <button
                  onClick={disconnect}
                  disabled={!chatState.isConnected}
                  className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-md"
                >
                  Disconnect
                </button>
                <button
                  onClick={handleTypingTest}
                  disabled={!chatState.isConnected}
                  className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-md"
                >
                  Test Typing
                </button>
                <button
                  onClick={clearMessages}
                  className="px-3 py-1 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-md"
                >
                  Clear
                </button>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <div>User: {isAuthenticated ? user?.username : 'Anonymous'}</div>
              <div>Conversation: {testConversationId}</div>
              <div>Messages: {messages.length}</div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 h-96 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 mt-16">
                  <p className="text-lg mb-2">🎯 Ready to test real-time chat!</p>
                  <p className="text-sm">
                    Use the buttons below to test WebSocket vs HTTP messaging
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} flex items-end space-x-2`}>
                      <div className={`
                        px-4 py-2 rounded-lg relative
                        ${message.sender === 'user' 
                          ? 'bg-blue-500 text-white ml-2' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white mr-2'
                        }
                      `}>
                        <div className="flex items-center space-x-2 mb-1">
                          {getMessageStatusIcon(message)}
                          <span className="text-xs opacity-75">
                            {message.source?.toUpperCase()} | {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-sm">
                          {message.sender === 'ai' ? (
                            <MarkdownRenderer content={message.content} />
                          ) : (
                            message.content
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2 mr-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (e.metaKey || e.ctrlKey) {
                        handleHttpMessage();
                      } else {
                        handleRealtimeMessage();
                      }
                    }
                  }}
                  placeholder="Type a message... (Enter = WebSocket, Cmd/Ctrl+Enter = HTTP)"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
                <button
                  onClick={handleRealtimeMessage}
                  disabled={!inputValue.trim() || isLoading || !chatState.isConnected}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-md flex items-center space-x-2"
                  title="Send via WebSocket (real-time)"
                >
                  <PaperAirplaneIcon className="h-4 w-4" />
                  <span>WebSocket</span>
                </button>
                <button
                  onClick={handleHttpMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-md flex items-center space-x-2"
                  title="Send via HTTP (traditional)"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  <span>HTTP</span>
                </button>
              </div>
              
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                🟢 WebSocket: Real-time, instant responses | 🔵 HTTP: Traditional request/response
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Test Status Icons:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                <span>WebSocket Success</span>
              </div>
              <div className="flex items-center space-x-2">
                <ClockIcon className="h-4 w-4 text-blue-500" />
                <span>HTTP Request</span>
              </div>
              <div className="flex items-center space-x-2">
                <ExclamationCircleIcon className="h-4 w-4 text-red-500" />
                <span>Error/Failed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 