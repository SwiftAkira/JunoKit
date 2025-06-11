'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { useState } from 'react';
import Image from 'next/image';
import { JunokitHero } from '@/components/blocks/junokit-hero';
import { 
  MoonIcon,
  SunIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

export default function HomePage() {
  const { isAuthenticated, user, userProfile, signOut } = useAuth();
  const { currentTheme, themeConfig, availableThemes, setTheme, isDarkMode, toggleDarkMode } = useTheme();
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
              {/* Enhanced Theme Selector */}
              <div className="relative">
                <select
                  value={currentTheme}
                  onChange={(e) => setTheme(e.target.value as any)}
                  className={`appearance-none bg-white dark:bg-gray-800 border-2 border-purple-200 dark:border-purple-700 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-white pr-8 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                >
                  {availableThemes.map((theme) => (
                    <option key={theme.id} value={theme.id}>
                      {theme.name} {theme.mascotAccessory}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ChartBarIcon className="h-4 w-4 text-gray-400" />
                </div>
              </div>
              
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
      </main>

      {/* User Profile Section (if authenticated) */}
      {isAuthenticated && (
        <div className="py-12 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-xl overflow-hidden">
              <div className="px-8 py-12 text-white">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">
                      Welcome back, {userProfile?.firstName}! 👋
                    </h3>
                    <p className="text-purple-100">
                      Your {themeConfig.name} workspace is ready
                    </p>
                  </div>
                  <div className="text-6xl opacity-20">
                    {themeConfig.mascotAccessory === 'glasses' ? '👓' : 
                     themeConfig.mascotAccessory === 'headset' ? '🎧' :
                     themeConfig.mascotAccessory === 'clipboard' ? '📋' :
                     themeConfig.mascotAccessory === 'tie' ? '👔' : '📷'}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <p className="text-sm text-purple-100 mb-1">Role</p>
                    <p className="font-semibold">{themeConfig.name}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <p className="text-sm text-purple-100 mb-1">Theme</p>
                    <p className="font-semibold">{themeConfig.description}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <p className="text-sm text-purple-100 mb-1">Status</p>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="font-semibold">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
              © 2024 Junokit. Powered by Jupiter AI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
