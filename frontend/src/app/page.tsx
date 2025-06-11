'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { useState } from 'react';
import Image from 'next/image';
import { JunokitHero } from '@/components/blocks/junokit-hero';
import { IntegrationsNetwork } from '@/components/blocks/integrations-diagram';
import { 
  MoonIcon,
  SunIcon,
} from '@heroicons/react/24/outline';

export default function HomePage() {
  const { isAuthenticated, user, userProfile, signOut } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [showLogin, setShowLogin] = useState(false);

  if (showLogin && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="max-w-md w-full backdrop-blur-sm bg-white/10 rounded-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <Image
              src="/JunoKitColorNoBGNoTEXT.png"
              alt="Junokit Logo"
              width={80}
              height={80}
              className="mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome to Junokit
            </h1>
            <p className="text-blue-200">
              Sign in to access your AI work assistant
            </p>
          </div>
          
          <Authenticator
            variation="modal"
            hideSignUp={true}
            socialProviders={[]}
            formFields={{
              signIn: {
                username: {
                  placeholder: 'Enter your email',
                  isRequired: true,
                  label: 'Email',
                },
                password: {
                  placeholder: 'Enter your password',
                  isRequired: true,
                  label: 'Password',
                },
              },
            }}
          >
            {({ signOut, user }) => (
              <div className="text-center">
                <p className="mb-4 text-white">Welcome, {user?.username}!</p>
                <button 
                  onClick={signOut}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </Authenticator>
          
          <div className="mt-6 text-center">
            <button
              onClick={() => setShowLogin(false)}
              className="text-blue-300 hover:text-blue-100 transition-colors"
            >
              ← Back to homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

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
                  onClick={() => setShowLogin(true)}
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
