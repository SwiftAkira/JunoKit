'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { JunokitHero } from '@/components/blocks/junokit-hero';
import { IntegrationsNetwork } from '@/components/blocks/integrations-diagram';
import { ProductionStatus } from '@/components/ProductionStatus';
import { 
  MoonIcon,
  SunIcon,
} from '@heroicons/react/24/outline';

export default function HomePage() {
  const { isAuthenticated, user, userProfile, signOut } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const router = useRouter();

  return (
    <div className="min-h-screen">
      {/* Enhanced Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Image
                src="/JunoKitColorNoBGNoTEXT.png"
                alt="Junokit Logo"
                width={32}
                height={32}
                className="transition-transform hover:scale-110"
              />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Junokit
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              
              {/* Enhanced Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
              </button>
              
              {/* Enhanced Auth Section */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {userProfile?.firstName || user?.username}
                    </span>
                  </div>
                  <button
                    onClick={signOut}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => router.push('/login')}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-purple-700 transition-all hover:shadow-lg transform hover:scale-105"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Modern Hero Section */}
      <main className="pt-16">
        <JunokitHero />
        <IntegrationsNetwork />
        
        {/* Development Tools Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                🚀 Phase 5: Real-time Features
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
                WebSocket infrastructure is now deployed to production! 
                Test the real-time communication features live on AWS.
              </p>
              
              <ProductionStatus />
            </div>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => router.push('/websocket-demo')}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transform transition hover:scale-105"
              >
                <span className="mr-2">⚡</span>
                Test WebSocket Connection
              </button>
              
              <button
                onClick={() => router.push('/realtime-chat-test')}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transform transition hover:scale-105"
              >
                <span className="mr-2">💬</span>
                Test Real-time Chat
              </button>
            </div>
          </div>
        </section>
      </main>



      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Image
                src="/JunoKitColorNoBGNoTEXT.png"
                alt="Junokit Logo"
                width={32}
                height={32}
              />
              <span className="text-xl font-bold">Junokit</span>
            </div>
            <p className="text-gray-400">
              © 2025 Junokit. Your Intelligent AI Assistant.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
