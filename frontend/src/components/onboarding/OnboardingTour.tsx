import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import Image from 'next/image';
import { 
  XMarkIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  SparklesIcon,
  ChatBubbleLeftIcon,
  CogIcon,
  UserIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Junokit AI! 🎉',
    description: 'Let\'s take a quick tour to help you get started with your AI-powered productivity companion. This will only take a minute!',
    target: 'welcome-section',
    position: 'center'
  },
  {
    id: 'jupiter-mascot',
    title: 'Meet Jupiter! 🤖',
    description: 'This is Jupiter, your AI assistant mascot. Jupiter adapts to your role and provides specialized help. Notice the green indicator showing Jupiter is ready to assist you!',
    target: 'jupiter-mascot',
    position: 'left'
  },
  {
    id: 'theme-toggle',
    title: 'Dark Mode Toggle 🌙',
    description: 'Switch between light and dark themes anytime. Your preference will be saved automatically. Try clicking it!',
    target: 'theme-toggle',
    position: 'left',
    action: 'Try clicking the theme toggle!'
  },
  {
    id: 'user-profile',
    title: 'Your Profile 👤',
    description: 'This shows your current status and profile. The green dot indicates you\'re online and ready to chat with Jupiter.',
    target: 'user-profile',
    position: 'left'
  },
  {
    id: 'new-chat',
    title: 'Start Conversations 💬',
    description: 'Click here to start a new conversation with Jupiter. You can ask questions, get help with coding, operations, or any work-related tasks!',
    target: 'new-chat-button',
    position: 'top',
    action: 'Click to start your first chat!'
  },
  {
    id: 'settings',
    title: 'Customize Your Experience ⚙️',
    description: 'Access your settings to customize preferences, manage your account, and configure Jupiter to match your working style.',
    target: 'settings-button',
    position: 'top'
  },
  {
    id: 'recent-conversations',
    title: 'Conversation History 📚',
    description: 'All your past conversations with Jupiter are saved here. Click any conversation to continue where you left off.',
    target: 'recent-conversations',
    position: 'top'
  },
  {
    id: 'conversation-features',
    title: 'Conversation Features 🔍',
    description: 'Each conversation shows the title, last message, timestamp, and message count. You can easily pick up any conversation!',
    target: 'conversation-item',
    position: 'top'
  },
  {
    id: 'complete',
    title: 'You\'re All Set! 🚀',
    description: 'That\'s it! You\'re ready to start using Junokit AI. Remember, Jupiter is here to help with any questions or tasks. Enjoy your AI-powered productivity journey!',
    target: 'complete',
    position: 'center',
    action: 'Start chatting with Jupiter!'
  }
];

interface OnboardingTourProps {
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function OnboardingTour({ isVisible, onComplete, onSkip }: OnboardingTourProps) {
  const { isDarkMode } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const currentStepData = onboardingSteps[currentStep];
  const isLastStep = currentStep === onboardingSteps.length - 1;
  const isFirstStep = currentStep === 0;

  useEffect(() => {
    if (isVisible && currentStepData.target !== 'welcome' && currentStepData.target !== 'complete') {
      const element = document.getElementById(currentStepData.target);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Add highlight effect
        element.classList.add('onboarding-highlight');
        return () => element.classList.remove('onboarding-highlight');
      }
    }
  }, [currentStep, isVisible, currentStepData.target]);

  const nextStep = () => {
    if (isLastStep) {
      onComplete();
      return;
    }
    
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(prev => prev + 1);
      setIsAnimating(false);
    }, 200);
  };

  const prevStep = () => {
    if (isFirstStep) return;
    
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(prev => prev - 1);
      setIsAnimating(false);
    }, 200);
  };

  const getTooltipPosition = () => {
    if (currentStepData.position === 'center') {
      return 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
    }

    const element = document.getElementById(currentStepData.target);
    if (!element) return 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';

    const rect = element.getBoundingClientRect();
    const tooltipWidth = 320;
    const tooltipHeight = 200;

    switch (currentStepData.position) {
      case 'top':
        return `fixed left-1/2 transform -translate-x-1/2`;
      case 'bottom':
        return `fixed left-1/2 transform -translate-x-1/2`;
      case 'left':
        return `fixed top-1/2 transform -translate-y-1/2`;
      case 'right':
        return `fixed top-1/2 transform -translate-y-1/2`;
      default:
        return 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
    }
  };

  const getTooltipStyle = () => {
    if (currentStepData.position === 'center') {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const element = document.getElementById(currentStepData.target);
    if (!element) return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    };

    const rect = element.getBoundingClientRect();
    const tooltipWidth = 320;
    const tooltipHeight = 200;
    const offset = 20;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top, left, transform = '';

    switch (currentStepData.position) {
      case 'top':
        top = rect.top - tooltipHeight - offset;
        left = Math.max(20, Math.min(rect.left + rect.width / 2 - tooltipWidth / 2, viewportWidth - tooltipWidth - 20));
        break;
      case 'bottom':
        top = rect.bottom + offset;
        left = Math.max(20, Math.min(rect.left + rect.width / 2 - tooltipWidth / 2, viewportWidth - tooltipWidth - 20));
        break;
      case 'left':
        top = Math.max(20, Math.min(rect.top + rect.height / 2 - tooltipHeight / 2, viewportHeight - tooltipHeight - 20));
        left = Math.max(20, rect.left - tooltipWidth - offset);
        // If there's not enough space on the left, position it to the right instead
        if (left < 20) {
          left = rect.right + offset;
        }
        break;
      case 'right':
        top = Math.max(20, Math.min(rect.top + rect.height / 2 - tooltipHeight / 2, viewportHeight - tooltipHeight - 20));
        left = rect.right + offset;
        // If there's not enough space on the right, position it to the left instead
        if (left + tooltipWidth > viewportWidth - 20) {
          left = Math.max(20, rect.left - tooltipWidth - offset);
        }
        break;
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
    }

    return { top, left, transform };
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-[1px] z-50 transition-opacity duration-300">
        {/* Skip Button */}
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-60"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        {/* Progress Bar */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-60">
          <div className="bg-white/20 rounded-full h-2 w-64">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
            />
          </div>
          <p className="text-white text-sm text-center mt-2">
            Step {currentStep + 1} of {onboardingSteps.length}
          </p>
        </div>

        {/* Tooltip */}
        <div
          className={`absolute z-60 transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
          style={getTooltipStyle()}
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl border border-gray-200 dark:border-gray-700 max-w-sm">
            {/* Header */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <SparklesIcon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {currentStepData.title}
                </h3>
              </div>
            </div>

            {/* Content */}
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              {currentStepData.description}
            </p>

            {/* Action Hint */}
            {currentStepData.action && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                  💡 {currentStepData.action}
                </p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={prevStep}
                disabled={isFirstStep}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  isFirstStep 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <ArrowLeftIcon className="h-4 w-4" />
                <span>Back</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={onSkip}
                  className="px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  Skip Tour
                </button>
                <button
                  onClick={nextStep}
                  className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  <span>{isLastStep ? 'Get Started' : 'Next'}</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Arrow Pointer */}
          {currentStepData.position !== 'center' && (
            <div className={`absolute w-4 h-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transform rotate-45 ${
              currentStepData.position === 'top' ? '-bottom-2 left-1/2 -translate-x-1/2' :
              currentStepData.position === 'bottom' ? '-top-2 left-1/2 -translate-x-1/2' :
              currentStepData.position === 'left' ? '-right-2 top-1/2 -translate-y-1/2' :
              currentStepData.position === 'right' ? '-left-2 top-1/2 -translate-y-1/2' : ''
            }`} />
          )}
        </div>

        {/* Spotlight Effect */}
        {currentStepData.target !== 'welcome' && currentStepData.target !== 'complete' && (
          <div className="absolute inset-0 pointer-events-none">
            <div 
              className="absolute bg-white/10 rounded-lg border-2 border-purple-400 shadow-lg animate-pulse"
              style={{
                ...(() => {
                  const element = document.getElementById(currentStepData.target);
                  if (!element) return {};
                  const rect = element.getBoundingClientRect();
                  return {
                    top: rect.top - 8,
                    left: rect.left - 8,
                    width: rect.width + 16,
                    height: rect.height + 16,
                  };
                })()
              }}
            />
          </div>
        )}
      </div>

      {/* Custom CSS for highlight effect */}
      <style jsx global>{`
        .onboarding-highlight {
          position: relative;
          z-index: 51;
          box-shadow: 0 0 0 4px rgba(147, 51, 234, 0.3), 0 0 20px rgba(147, 51, 234, 0.2);
          border-radius: 8px;
          transition: all 0.3s ease;
        }
      `}</style>
    </>
  );
} 