'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { OnboardingTour } from '@/components/onboarding/OnboardingTour';
import Image from 'next/image';
import Link from 'next/link';
import { 
  MoonIcon,
  SunIcon,
  Bars3Icon,
  ChatBubbleLeftIcon,
  ClockIcon,
  CogIcon,
  SparklesIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

// Mock data for recent conversations
const recentConversations = [
  {
    id: '1',
    title: 'Deploy AWS Lambda',
    lastMessage: 'Great! Your Lambda function is now deployed to eu-north-1.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    messageCount: 12
  },
  {
    id: '2', 
    title: 'Debug React Component',
    lastMessage: 'The issue is in the useEffect dependency array...',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    messageCount: 8
  },
  {
    id: '3',
    title: 'Database Schema Design',
    lastMessage: 'For your user table, I recommend adding an index on...',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    messageCount: 15
  }
];

const RetroGrid = () => {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-20 dark:opacity-10 pointer-events-none">
      <div className="absolute inset-0 [transform:rotateX(35deg)]">
        <div className="animate-grid [background-image:linear-gradient(to_right,rgba(99,102,241,0.3)_1px,transparent_0),linear-gradient(to_bottom,rgba(99,102,241,0.3)_1px,transparent_0)] [background-repeat:repeat] [background-size:60px_60px] [height:300vh] [inset:0%_0px] [margin-left:-200%] [transform-origin:100%_0_0] [width:600vw]" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent dark:from-gray-900" />
    </div>
  );
};

export default function DashboardPage() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if user is new (in real app, this would come from user data)
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('junokit-onboarding-completed');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('junokit-onboarding-completed', 'true');
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    localStorage.setItem('junokit-onboarding-completed', 'true');
    setShowOnboarding(false);
  };

  // Mock user data
  const mockUser = {
    firstName: 'Demo',
    lastName: 'User',
    email: 'demo@example.com',
    username: 'demo-user'
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 relative">
      {/* Background Grid */}
      <RetroGrid />

      {/* Header */}
      <header className="relative z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Logo and title */}
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
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
                  Dashboard
                </p>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            {/* Dark mode toggle */}
            <button
              id="theme-toggle"
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-all hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>

            {/* User info */}
            <div id="user-profile" className="flex items-center space-x-2">
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

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div id="welcome-section" className="mb-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {mockUser.firstName[0]}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  Welcome back, {mockUser.firstName}! 👋
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Ready to continue your AI-powered productivity journey?
                </p>
              </div>
              <div className="hidden sm:block">
                <div id="jupiter-mascot" className="w-12 h-12 relative">
                  <Image
                    src="/JunoKitColorNoBGNoTEXT.png"
                    alt="Junokit AI"
                    width={48}
                    height={48}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                    <SparklesIcon className="w-2 h-2 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/chat" className="group">
              <div id="new-chat-button" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200 transform hover:scale-105">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                    <ChatBubbleLeftIcon className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">New Chat</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Start a new conversation with your AI assistant
                </p>
                <div className="flex items-center text-purple-600 dark:text-purple-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                  Start chatting <ArrowRightIcon className="w-4 h-4 ml-1" />
                </div>
              </div>
            </Link>

            <Link href="/settings" className="group">
              <div id="settings-button" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200 transform hover:scale-105">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                    <CogIcon className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Settings</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Customize your preferences and account settings
                </p>
                <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                  Manage settings <ArrowRightIcon className="w-4 h-4 ml-1" />
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Conversations */}
        <div id="recent-conversations">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Conversations</h3>
            <Link href="/chat" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium flex items-center">
              View all <ArrowRightIcon className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentConversations.map((conversation, index) => (
              <Link key={conversation.id} href={`/chat?id=${conversation.id}`} className="block group">
                <div id={index === 0 ? "conversation-item" : undefined} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <ChatBubbleLeftIcon className="h-4 w-4 text-purple-500 flex-shrink-0" />
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {conversation.title}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                        {conversation.lastMessage}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                        <span className="flex items-center">
                          <ClockIcon className="w-3 h-3 mr-1" />
                          {formatTimestamp(conversation.timestamp)}
                        </span>
                        <span>{conversation.messageCount} messages</span>
                      </div>
                    </div>
                    <ArrowRightIcon className="w-4 w-4 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all ml-3 flex-shrink-0" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Onboarding Tour */}
      <OnboardingTour
        isVisible={showOnboarding}
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
    </div>
  );
} 