'use client';

import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import Image from 'next/image';
import { 
  MoonIcon,
  SunIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';

export default function ChatPage() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string>('');

  // Mock user data for testing
  const mockUser = {
    firstName: 'Demo',
    username: 'demo-user'
  };

  const handleConversationSelect = (conversationId: string) => {
    setActiveConversationId(conversationId);
    setSidebarOpen(false); // Close sidebar on mobile when conversation is selected
  };

  const handleNewConversation = () => {
    setActiveConversationId('');
    setSidebarOpen(false); // Close sidebar on mobile when starting new conversation
  };

  const handleConversationCreated = (conversationId: string) => {
    setActiveConversationId(conversationId);
    // Optionally refresh the sidebar to show the new conversation
  };

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <ChatSidebar 
          onClose={() => setSidebarOpen(false)}
          onConversationSelect={handleConversationSelect}
          onNewConversation={handleNewConversation}
          activeConversationId={activeConversationId}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Open sidebar"
              >
                <Bars3Icon className="h-5 w-5" />
              </button>

              {/* Logo and title */}
              <div className="flex items-center space-x-3">
                <Image
                  src="/JunoKitColorNoBGNoTEXT.png"
                  alt="Junokit Logo"
                  width={32}
                  height={32}
                  className="transition-transform hover:scale-110"
                />
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Junokit AI
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activeConversationId ? 'Active Conversation' : 'New Conversation'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Dark mode toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-all hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
              </button>

              {/* User info */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" aria-hidden="true"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {mockUser.firstName}
                  </span>
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {mockUser.firstName[0]}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Chat interface */}
        <div className="flex-1 overflow-hidden">
          <ChatInterface 
            activeConversationId={activeConversationId}
            onConversationCreated={handleConversationCreated}
          />
        </div>
      </div>
    </div>
  );
} 