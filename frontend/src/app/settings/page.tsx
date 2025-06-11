'use client';

import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import Image from 'next/image';
import Link from 'next/link';
import { 
  MoonIcon,
  SunIcon,
  ArrowLeftIcon,
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  TrashIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

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

export default function SettingsPage() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [showSaveMessage, setShowSaveMessage] = useState(false);

  // Mock user data
  const mockUser = {
    firstName: 'Demo',
    lastName: 'User',
    email: 'demo@example.com',
    username: 'demo-user'
  };

  const handleSave = () => {
    setShowSaveMessage(true);
    setTimeout(() => setShowSaveMessage(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 relative">
      {/* Background Grid */}
      <RetroGrid />

      {/* Header */}
      <header className="relative z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Back button */}
            <Link 
              href="/dashboard" 
              className="p-2 rounded-lg text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-all hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>

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
                  Settings
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Manage your preferences
                </p>
              </div>
            </Link>
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
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {mockUser.firstName[0]}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Save Success Message */}
        {showSaveMessage && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
            <div className="flex items-center space-x-2 text-green-800 dark:text-green-200">
              <CheckIcon className="h-5 w-5" />
              <span className="font-medium">Settings saved successfully!</span>
            </div>
          </div>
        )}

        {/* Profile Section */}
        <div className="mb-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center space-x-2 mb-6">
              <UserIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Profile</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  defaultValue={mockUser.firstName}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  defaultValue={mockUser.lastName}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  defaultValue={mockUser.email}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="mb-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center space-x-2 mb-6">
              <BellIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Preferences</h2>
            </div>
            
            <div className="space-y-6">
              {/* Theme Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Toggle between light and dark themes</p>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                    isDarkMode ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isDarkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Push Notifications</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications for important updates</p>
                </div>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                    notifications ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Email Updates */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Email Updates</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Receive product updates and tips via email</p>
                </div>
                <button
                  onClick={() => setEmailUpdates(!emailUpdates)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                    emailUpdates ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      emailUpdates ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Restart Onboarding */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Restart Onboarding</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Take the dashboard tour again</p>
                </div>
                <button
                  onClick={() => {
                    localStorage.removeItem('junokit-onboarding-completed');
                    window.location.href = '/dashboard';
                  }}
                  className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium"
                >
                  Start Tour
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="mb-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center space-x-2 mb-6">
              <ShieldCheckIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Security</h2>
            </div>
            
            <div className="space-y-4">
              <button className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Change Password</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Update your account password</p>
              </button>
              
              <button className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security to your account</p>
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mb-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-red-200/50 dark:border-red-800/50">
            <div className="flex items-center space-x-2 mb-6">
              <TrashIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
              <h2 className="text-xl font-semibold text-red-900 dark:text-red-100">Danger Zone</h2>
            </div>
            
            <div className="space-y-4">
              <button className="w-full text-left px-4 py-3 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors border border-red-200 dark:border-red-800">
                <h3 className="text-sm font-medium text-red-900 dark:text-red-100">Clear All Conversations</h3>
                <p className="text-sm text-red-600 dark:text-red-400">Permanently delete all your chat history</p>
              </button>
              
              <button className="w-full text-left px-4 py-3 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors border border-red-200 dark:border-red-800">
                <h3 className="text-sm font-medium text-red-900 dark:text-red-100">Delete Account</h3>
                <p className="text-sm text-red-600 dark:text-red-400">Permanently delete your account and all data</p>
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            Save Changes
          </button>
        </div>
      </main>
    </div>
  );
} 