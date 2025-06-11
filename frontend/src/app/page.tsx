'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { useState } from 'react';
import { 
  SparklesIcon, 
  RocketLaunchIcon, 
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  CogIcon,
  MoonIcon,
  SunIcon
} from '@heroicons/react/24/outline';

export default function HomePage() {
  const { isAuthenticated, user, userProfile, signOut } = useAuth();
  const { currentTheme, themeConfig, availableThemes, setTheme, isDarkMode, toggleDarkMode } = useTheme();
  const [showLogin, setShowLogin] = useState(false);

  if (showLogin && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome to Junokit
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
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
                <p className="mb-4">Welcome, {user?.username}!</p>
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
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
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
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🪐</div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Junokit
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Theme Selector */}
              <select
                value={currentTheme}
                onChange={(e) => setTheme(e.target.value as any)}
                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm text-gray-900 dark:text-white"
              >
                {availableThemes.map((theme) => (
                  <option key={theme.id} value={theme.id}>
                    {theme.name}
                  </option>
                ))}
              </select>
              
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
              </button>
              
              {/* Auth Section */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {userProfile?.firstName || user?.username}
                  </span>
                  <button
                    onClick={signOut}
                    className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {/* Jupiter Mascot */}
              <div className="text-8xl mb-8 animate-bounce">
                🪐
              </div>
              
              <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Meet Your AI Work
                <span className={`text-${themeConfig.primaryColor}-600 dark:text-${themeConfig.primaryColor}-400 block`}>
                  Assistant
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
                Streamline your workflow with Jupiter-powered AI assistance. 
                Personalized for your role: <span className="font-semibold">{themeConfig.name}</span>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {isAuthenticated ? (
                  <button className={`bg-${themeConfig.primaryColor}-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-${themeConfig.primaryColor}-700 transition-colors flex items-center space-x-2`}>
                    <ChatBubbleLeftRightIcon className="h-5 w-5" />
                    <span>Start Chatting</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => setShowLogin(true)}
                    className={`bg-${themeConfig.primaryColor}-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-${themeConfig.primaryColor}-700 transition-colors flex items-center space-x-2`}
                  >
                    <RocketLaunchIcon className="h-5 w-5" />
                    <span>Get Started</span>
                  </button>
                )}
                
                <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Powered by Jupiter Intelligence
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Experience the next generation of AI assistance
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-xl bg-gray-50 dark:bg-gray-700">
                <SparklesIcon className={`h-12 w-12 text-${themeConfig.primaryColor}-600 mx-auto mb-4`} />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Smart Automation
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Automate repetitive tasks and focus on what matters most
                </p>
              </div>
              
              <div className="text-center p-6 rounded-xl bg-gray-50 dark:bg-gray-700">
                <UserGroupIcon className={`h-12 w-12 text-${themeConfig.primaryColor}-600 mx-auto mb-4`} />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Role-Based Themes
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Customized experience for developers, ops, QA, sales, and media teams
                </p>
              </div>
              
              <div className="text-center p-6 rounded-xl bg-gray-50 dark:bg-gray-700">
                <CogIcon className={`h-12 w-12 text-${themeConfig.primaryColor}-600 mx-auto mb-4`} />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Seamless Integration
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Connect with your favorite tools and workflows
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Section */}
        {isAuthenticated && (
          <div className="py-8 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Your Profile
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {userProfile?.firstName} {userProfile?.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Role</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {userProfile?.role || 'Developer'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Theme</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {themeConfig.name} ({themeConfig.description})
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {userProfile?.email || user?.username}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
