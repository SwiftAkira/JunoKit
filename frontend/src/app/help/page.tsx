'use client';

import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import Image from 'next/image';
import Link from 'next/link';
import { 
  MoonIcon,
  SunIcon,
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  QuestionMarkCircleIcon,
  ChatBubbleLeftIcon,
  CogIcon,
  ShieldCheckIcon,
  SparklesIcon
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

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'getting-started' | 'features' | 'account' | 'troubleshooting';
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'What is Junokit AI?',
    answer: 'Junokit AI is your intelligent work assistant designed to help developers, operations teams, QA engineers, sales professionals, and media creators. Our AI companion adapts to your role and provides specialized assistance for your daily tasks.',
    category: 'getting-started'
  },
  {
    id: '2',
    question: 'How do I start a conversation?',
    answer: 'Simply click the "New Chat" button from your dashboard or navigate to the chat page. You can ask questions, request help with coding, get advice on operations, or discuss any work-related topics. Jupiter, our AI mascot, will adapt to your role and provide relevant assistance.',
    category: 'getting-started'
  },
  {
    id: '3',
    question: 'What makes Junokit different from other AI assistants?',
    answer: 'Junokit is specifically designed for work environments with role-based themes and specialized knowledge. Our Jupiter mascot changes appearance based on your role (Dev, Ops, QA, Sales, Media) and provides contextually relevant assistance tailored to your profession.',
    category: 'features'
  },
  {
    id: '4',
    question: 'How do I change my theme or role?',
    answer: 'You can change your theme and role preferences in the Settings page. Navigate to Settings > Preferences and select your primary role. Jupiter will automatically adapt to match your chosen theme with appropriate accessories and specialized knowledge.',
    category: 'features'
  },
  {
    id: '5',
    question: 'Is my data secure?',
    answer: 'Absolutely! We use enterprise-grade security with AWS infrastructure hosted in Stockholm for GDPR compliance. All conversations are encrypted, and we follow strict data protection protocols. Your privacy and security are our top priorities.',
    category: 'account'
  },
  {
    id: '6',
    question: 'Can I delete my conversation history?',
    answer: 'Yes, you have full control over your data. You can delete individual conversations from the sidebar menu, or clear all conversations at once from Settings > Danger Zone. Deleted conversations cannot be recovered.',
    category: 'account'
  },
  {
    id: '7',
    question: 'Why is the AI not responding?',
    answer: 'If the AI isn\'t responding, try refreshing the page or starting a new conversation. Check your internet connection and ensure you\'re logged in. If the problem persists, our AI service might be temporarily unavailable - please try again in a few minutes.',
    category: 'troubleshooting'
  },
  {
    id: '8',
    question: 'How do I reset my password?',
    answer: 'Click "Forgot password?" on the login page, enter your email address, and we\'ll send you reset instructions. Check your inbox (and spam folder) for the reset link. If you don\'t receive it, contact our support team.',
    category: 'troubleshooting'
  }
];

const categories = [
  { id: 'getting-started', name: 'Getting Started', icon: SparklesIcon, color: 'text-purple-600 dark:text-purple-400' },
  { id: 'features', name: 'Features', icon: ChatBubbleLeftIcon, color: 'text-blue-600 dark:text-blue-400' },
  { id: 'account', name: 'Account', icon: CogIcon, color: 'text-green-600 dark:text-green-400' },
  { id: 'troubleshooting', name: 'Troubleshooting', icon: ShieldCheckIcon, color: 'text-orange-600 dark:text-orange-400' }
];

export default function HelpPage() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [openItems, setOpenItems] = useState<string[]>(['1']); // First item open by default
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const filteredFAQs = selectedCategory === 'all' 
    ? faqData 
    : faqData.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 relative">
      {/* Background Grid */}
      <RetroGrid />

      {/* Header */}
      <header className="relative z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
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
                  Help Center
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Get answers to common questions
                </p>
              </div>
            </Link>
          </div>

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
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <Image
              src="/JunoKitColorNoBGNoTEXT.png"
              alt="Junokit AI"
              width={80}
              height={80}
              className="w-full h-full object-contain"
            />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
              <QuestionMarkCircleIcon className="h-4 w-4 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            How can we help you? 🤔
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Find answers to frequently asked questions about Junokit AI, or get in touch with our support team.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Browse by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`p-3 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-2 border-purple-300 dark:border-purple-600'
                    : 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                All Topics
              </button>
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`p-3 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                      selectedCategory === category.id
                        ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-2 border-purple-300 dark:border-purple-600'
                        : 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <IconComponent className={`h-4 w-4 ${category.color}`} />
                    <span className="hidden sm:inline">{category.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
            <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Frequently Asked Questions
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {selectedCategory === 'all' ? 'All questions' : categories.find(c => c.id === selectedCategory)?.name}
                {' '}({filteredFAQs.length} questions)
              </p>
            </div>
            
            <div className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
              {filteredFAQs.map((item) => (
                <div key={item.id} className="p-6">
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="w-full flex items-center justify-between text-left group"
                  >
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {item.question}
                    </h3>
                    {openItems.includes(item.id) ? (
                      <ChevronUpIcon className="h-5 w-5 text-gray-500 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors flex-shrink-0 ml-4" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-gray-500 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors flex-shrink-0 ml-4" />
                    )}
                  </button>
                  
                  {openItems.includes(item.id) && (
                    <div className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                      {item.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-8 border border-purple-200/50 dark:border-purple-800/50 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
            <ChatBubbleLeftIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Still need help?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Can't find what you're looking for? Our support team is here to help you get the most out of Junokit AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/chat"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              <ChatBubbleLeftIcon className="h-4 w-4" />
              <span>Ask Jupiter AI</span>
            </Link>
            <a
              href="mailto:support@junokit.com"
              className="inline-flex items-center space-x-2 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 transition-all duration-200 transform hover:scale-105"
            >
              <span>Email Support</span>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
} 