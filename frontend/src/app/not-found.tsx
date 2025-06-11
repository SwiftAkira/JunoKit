'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import Image from 'next/image';
import Link from 'next/link';
import { 
  MoonIcon,
  SunIcon,
  HomeIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon
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

const funnyMessages = [
  "Oops! Jupiter got lost in space... again! 🚀",
  "404: Page not found, but Jupiter's sense of humor is intact! 😄",
  "This page went on vacation without telling us! 🏖️",
  "Jupiter checked everywhere, even behind the couch! 🛋️",
  "Error 404: Page is playing hide and seek (and winning) 🙈",
  "This page has been abducted by aliens! 👽",
  "Jupiter's GPS is broken - we can't find this page! 🗺️",
  "Page not found, but hey, at least you found this funny message! 🎉"
];

const funnySubtitles = [
  "Don't worry, Jupiter is on the case!",
  "Even AI assistants make wrong turns sometimes",
  "This is more lost than Jupiter on his first day",
  "404 errors happen to the best of us",
  "Jupiter suggests trying a different route",
  "This page is more elusive than a bug-free code",
  "Even Jupiter can't compute where this page went",
  "Plot twist: The page was inside us all along... just kidding!"
];

export default function NotFound() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [messageIndex, setMessageIndex] = useState(0);
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % funnyMessages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleJupiterClick = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

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
                Oops! Page not found
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
        <div className="text-center max-w-2xl mx-auto">
          {/* 404 Number */}
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
              404
            </h1>
          </div>

          {/* Jupiter Mascot */}
          <div className="mb-8">
            <div 
              className={`w-32 h-32 mx-auto mb-6 relative cursor-pointer transition-transform duration-300 ${
                isShaking ? 'animate-bounce' : 'hover:scale-110'
              }`}
              onClick={handleJupiterClick}
            >
              <Image
                src="/JunoKitColorNoBGNoTEXT.png"
                alt="Confused Jupiter"
                width={128}
                height={128}
                className="w-full h-full object-contain"
              />
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-orange-500 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center">
                <span className="text-2xl">😵‍💫</span>
              </div>
              {/* Floating question marks */}
              <div className="absolute -top-4 -left-4 text-2xl animate-bounce delay-100">❓</div>
              <div className="absolute -top-2 -right-6 text-xl animate-bounce delay-300">❓</div>
              <div className="absolute -bottom-4 -left-6 text-lg animate-bounce delay-500">❓</div>
            </div>
          </div>

          {/* Error Card */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 mb-8">
            {/* Animated Message */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 transition-all duration-500">
                {funnyMessages[messageIndex]}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 transition-all duration-500">
                {funnySubtitles[messageIndex]}
              </p>
            </div>

            {/* Fun Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">∞</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Pages Jupiter checked</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">0</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Pages found</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">100%</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Confusion level</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                <HomeIcon className="h-4 w-4" />
                <span>Take Me Home</span>
              </Link>
              
              <Link
                href="/dashboard"
                className="inline-flex items-center space-x-2 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 transition-all duration-200 transform hover:scale-105"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                <span>Go Back</span>
              </Link>

              <Link
                href="/help"
                className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-6 py-3 rounded-lg border border-blue-200 dark:border-blue-800 transition-all duration-200 transform hover:scale-105"
              >
                <MagnifyingGlassIcon className="h-4 w-4" />
                <span>Get Help</span>
              </Link>
            </div>
          </div>

          {/* Fun Fact */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-yellow-200/50 dark:border-yellow-800/50">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <span className="text-2xl">💡</span>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Fun Fact
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              The first 404 error was discovered at CERN in 1992. The room where the first web server was located was actually room 404! 
              <span className="italic"> (This may or may not be true, but Jupiter believes it!) 🤖</span>
            </p>
          </div>

          {/* Easter Egg */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              <span className="cursor-pointer hover:text-purple-500 transition-colors" onClick={handleJupiterClick}>
                Click Jupiter for moral support! 
              </span>
              • Error #{Math.floor(Math.random() * 9999) + 1000}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
} 