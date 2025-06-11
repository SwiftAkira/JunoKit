'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';
import { 
  SparklesIcon, 
  RocketLaunchIcon, 
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  CogIcon,
  MoonIcon,
  SunIcon,
  BoltIcon,
  ShieldCheckIcon,
  CloudIcon,
  ChartBarIcon,
  BeakerIcon,
  LightBulbIcon,
  ArrowRightIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

export default function HomePage() {
  const { isAuthenticated, user, userProfile, signOut } = useAuth();
  const { currentTheme, themeConfig, availableThemes, setTheme, isDarkMode, toggleDarkMode } = useTheme();
  const [showLogin, setShowLogin] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);

  // Intersection Observer refs for animations
  const [heroRef, heroInView] = useInView({ threshold: 0.3, triggerOnce: true });
  const [featuresRef, featuresInView] = useInView({ threshold: 0.2, triggerOnce: true });
  const [statsRef, statsInView] = useInView({ threshold: 0.3, triggerOnce: true });

  // Rotating features
  const features = [
    { icon: BoltIcon, text: "Lightning Fast AI Responses" },
    { icon: ShieldCheckIcon, text: "Enterprise Security & Privacy" },
    { icon: CloudIcon, text: "Cloud-Native Architecture" },
    { icon: ChartBarIcon, text: "Advanced Analytics & Insights" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [features.length]);

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
    <div className="min-h-screen overflow-hidden">
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
                  className={`appearance-none bg-white dark:bg-gray-800 border-2 border-${themeConfig.primaryColor}-200 dark:border-${themeConfig.primaryColor}-700 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-white pr-8 focus:ring-2 focus:ring-${themeConfig.primaryColor}-500 focus:border-transparent transition-all`}
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
                className={`p-2 rounded-lg text-gray-500 hover:text-${themeConfig.primaryColor}-600 dark:text-gray-400 dark:hover:text-${themeConfig.primaryColor}-400 transition-all hover:bg-gray-100 dark:hover:bg-gray-800`}
              >
                {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
              </button>
              
              {/* Enhanced Auth Section */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 bg-${themeConfig.primaryColor}-500 rounded-full animate-pulse`}></div>
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
                  className={`bg-${themeConfig.primaryColor}-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-${themeConfig.primaryColor}-700 transition-all hover:shadow-lg transform hover:scale-105`}
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Hero Section */}
      <div 
        ref={heroRef}
        className={`relative pt-16 min-h-screen flex items-center bg-gradient-to-br from-${themeConfig.primaryColor}-50 via-white to-${themeConfig.secondaryColor}-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden`}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute -top-40 -right-40 w-80 h-80 bg-${themeConfig.primaryColor}-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse`}></div>
          <div className={`absolute -bottom-40 -left-40 w-80 h-80 bg-${themeConfig.secondaryColor}-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse`} style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className={`space-y-8 ${heroInView ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <div className={`px-3 py-1 bg-${themeConfig.primaryColor}-100 dark:bg-${themeConfig.primaryColor}-900/30 text-${themeConfig.primaryColor}-700 dark:text-${themeConfig.primaryColor}-300 rounded-full text-sm font-medium`}>
                    ✨ Now with Jupiter AI
                  </div>
                </div>
                
                <h1 className="text-5xl sm:text-7xl font-bold leading-tight">
                  <span className="text-gray-900 dark:text-white">Meet Your</span>
                  <br />
                  <span className={`text-transparent bg-clip-text bg-gradient-to-r from-${themeConfig.primaryColor}-600 to-${themeConfig.secondaryColor}-600`}>
                    AI Work Assistant
                  </span>
                </h1>
                
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-lg leading-relaxed">
                  Streamline your workflow with Jupiter-powered AI assistance. 
                  Personalized for <span className={`font-semibold text-${themeConfig.primaryColor}-600 dark:text-${themeConfig.primaryColor}-400`}>{themeConfig.name}</span> professionals.
                </p>
              </div>

                             {/* Rotating Feature Display */}
               <div className="flex items-center space-x-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm">
                 <div className={`p-2 bg-${themeConfig.primaryColor}-100 dark:bg-${themeConfig.primaryColor}-900/30 rounded-lg`}>
                   {React.createElement(features[currentFeature].icon, { 
                     className: `h-6 w-6 text-${themeConfig.primaryColor}-600 dark:text-${themeConfig.primaryColor}-400` 
                   })}
                 </div>
                 <span className="text-gray-700 dark:text-gray-300 font-medium">
                   {features[currentFeature].text}
                 </span>
               </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {isAuthenticated ? (
                  <button className={`group bg-${themeConfig.primaryColor}-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-${themeConfig.primaryColor}-700 transition-all hover:shadow-xl transform hover:scale-105 flex items-center space-x-2`}>
                    <ChatBubbleLeftRightIcon className="h-6 w-6" />
                    <span>Start Chatting</span>
                    <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <button 
                    onClick={() => setShowLogin(true)}
                    className={`group bg-${themeConfig.primaryColor}-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-${themeConfig.primaryColor}-700 transition-all hover:shadow-xl transform hover:scale-105 flex items-center space-x-2`}
                  >
                    <RocketLaunchIcon className="h-6 w-6" />
                    <span>Get Started Free</span>
                    <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
                
                <button className="group border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center space-x-2">
                  <PlayIcon className="h-5 w-5" />
                  <span>Watch Demo</span>
                </button>
              </div>
            </div>

            {/* Right Column - Logo & Visual */}
            <div className={`relative ${heroInView ? 'animate-fade-in-right' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
              <div className="relative">
                {/* Floating Logo */}
                <div className="relative mx-auto w-80 h-80 flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-600/20 rounded-full animate-pulse"></div>
                  <div className="absolute inset-4 bg-gradient-to-r from-cyan-400/20 to-blue-600/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                  
                  <Image
                    src="/JunoKitColorWithTEXT(with a bg).png"
                    alt="Junokit - Jupiter AI Assistant"
                    width={300}
                    height={300}
                    className="relative z-10 drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                    priority
                  />
                  
                  {/* Floating Elements */}
                  <div className={`absolute top-8 right-8 w-4 h-4 bg-${themeConfig.primaryColor}-400 rounded-full animate-bounce`}></div>
                  <div className={`absolute bottom-8 left-8 w-3 h-3 bg-${themeConfig.secondaryColor}-400 rounded-full animate-bounce`} style={{ animationDelay: '0.5s' }}></div>
                  <div className={`absolute top-20 left-4 w-2 h-2 bg-yellow-400 rounded-full animate-bounce`} style={{ animationDelay: '1s' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div 
        ref={statsRef}
        className={`py-16 bg-white dark:bg-gray-900 ${statsInView ? 'animate-fade-in-up' : 'opacity-0'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "99.9%", label: "Uptime", icon: ShieldCheckIcon },
              { number: "< 50ms", label: "Response Time", icon: BoltIcon },
              { number: "5", label: "Role Themes", icon: UserGroupIcon },
              { number: "24/7", label: "AI Support", icon: ChatBubbleLeftRightIcon },
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className={`inline-flex p-3 bg-${themeConfig.primaryColor}-100 dark:bg-${themeConfig.primaryColor}-900/30 rounded-lg mb-4 group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`h-6 w-6 text-${themeConfig.primaryColor}-600 dark:text-${themeConfig.primaryColor}-400`} />
                </div>
                <div className={`text-3xl font-bold text-${themeConfig.primaryColor}-600 dark:text-${themeConfig.primaryColor}-400 mb-2`}>
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Features Section */}
      <div 
        ref={featuresRef}
        className={`py-20 bg-gray-50 dark:bg-gray-800 ${featuresInView ? 'animate-fade-in-up' : 'opacity-0'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powered by Jupiter Intelligence
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Experience the next generation of AI assistance with role-based customization and enterprise-grade security
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: SparklesIcon,
                title: "Smart Automation",
                description: "Automate repetitive tasks and focus on what matters most with intelligent workflow optimization",
                color: themeConfig.primaryColor
              },
              {
                icon: UserGroupIcon,
                title: "Role-Based Themes",
                description: "Customized experience for developers, ops, QA, sales, and media teams with specialized tools",
                color: themeConfig.secondaryColor
              },
              {
                icon: CogIcon,
                title: "Seamless Integration",
                description: "Connect with your favorite tools and workflows through our comprehensive API ecosystem",
                color: themeConfig.primaryColor
              },
              {
                icon: BeakerIcon,
                title: "Advanced Analytics",
                description: "Gain insights into your productivity patterns with detailed analytics and reporting",
                color: themeConfig.secondaryColor
              },
              {
                icon: LightBulbIcon,
                title: "AI Learning",
                description: "Our AI learns from your preferences and becomes more helpful over time",
                color: themeConfig.primaryColor
              },
              {
                icon: CloudIcon,
                title: "Cloud Native",
                description: "Built on AWS with enterprise-grade security, scalability, and reliability",
                color: themeConfig.secondaryColor
              },
            ].map((feature, index) => (
              <div 
                key={index} 
                className="group bg-white dark:bg-gray-700 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 dark:border-gray-600"
              >
                <div className={`inline-flex p-4 bg-${feature.color}-100 dark:bg-${feature.color}-900/30 rounded-xl mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`h-8 w-8 text-${feature.color}-600 dark:text-${feature.color}-400`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Profile Section (if authenticated) */}
      {isAuthenticated && (
        <div className="py-12 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`bg-gradient-to-r from-${themeConfig.primaryColor}-500 to-${themeConfig.secondaryColor}-500 rounded-2xl shadow-xl overflow-hidden`}>
              <div className="px-8 py-12 text-white">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">
                      Welcome back, {userProfile?.firstName}! 👋
                    </h3>
                    <p className="text-blue-100">
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
                    <p className="text-sm text-blue-100 mb-1">Role</p>
                    <p className="font-semibold">{themeConfig.name}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <p className="text-sm text-blue-100 mb-1">Theme</p>
                    <p className="font-semibold">{themeConfig.description}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <p className="text-sm text-blue-100 mb-1">Status</p>
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

// Add custom animations to globals.css
const customAnimations = `
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-in-right {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out forwards;
}

.animate-fade-in-right {
  animation: fade-in-right 0.6s ease-out forwards;
}
`;
