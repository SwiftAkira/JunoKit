'use client';

import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import Image from 'next/image';
import Link from 'next/link';
import { 
  MoonIcon,
  SunIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  EnvelopeIcon
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

export default function ForgotPasswordPage() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Mock password reset - replace with actual Cognito integration
    setTimeout(() => {
      if (email.includes('@')) {
        setSuccess(true);
      } else {
        setError('Please enter a valid email address');
      }
      setIsLoading(false);
    }, 1500);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 relative">
        <RetroGrid />
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
          <div className="w-full max-w-md">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <EnvelopeIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Check Your Email! 📧
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We've sent password reset instructions to <strong>{email}</strong>. 
                Please check your inbox and follow the link to reset your password.
              </p>
              <div className="space-y-3">
                <Link
                  href="/login"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  <span>Back to Login</span>
                </Link>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Didn't receive the email? Check your spam folder or try again in a few minutes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 relative">
      {/* Background Grid */}
      <RetroGrid />

      {/* Header */}
      <header className="relative z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
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
                Reset your password
              </p>
            </div>
          </Link>

          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-all hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8">
        <div className="w-full max-w-md">
          {/* Forgot Password Card */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">
            {/* Logo and Title */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 relative">
                <Image
                  src="/JunoKitColorNoBGNoTEXT.png"
                  alt="Junokit AI"
                  width={64}
                  height={64}
                  className="w-full h-full object-contain"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                  <span className="text-xs">🔑</span>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Forgot Password?
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                No worries! Enter your email and we'll send you reset instructions.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <div className="flex items-center space-x-2 text-red-800 dark:text-red-200">
                  <ExclamationTriangleIcon className="h-5 w-5" />
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}

            {/* Reset Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    placeholder="Enter your email address"
                    required
                  />
                  <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  We'll send reset instructions to this email address.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="font-medium">Send Reset Instructions</span>
                    <ArrowRightIcon className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Back to Login */}
            <div className="mt-8 text-center">
              <Link
                href="/login"
                className="inline-flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                <span>Back to Login</span>
              </Link>
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Still having trouble?</strong><br />
              Contact our support team and we'll help you get back into your account.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
} 