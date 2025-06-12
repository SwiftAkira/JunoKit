'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import Link from 'next/link';
import { 
  MoonIcon,
  SunIcon,
  ArrowLeftIcon,
  CheckIcon,
  ClockIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  Cog6ToothIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

// React Icons imports
import { 
  SiSlack, 
  SiGithub, 
  SiGmail, 
  SiGooglecalendar, 
  SiNotion, 
  SiJira, 
  SiFigma, 
  SiOpenai, 
  SiAnthropic, 
  SiDiscord, 
  SiLinear, 
  SiZoom,
  SiTrello,
  SiAsana,
  SiDropbox
} from 'react-icons/si';
import { FaRocket, FaCode, FaComments, FaBrain, FaUsers } from 'react-icons/fa';

// Integration status types
type IntegrationStatus = 'connected' | 'available' | 'coming-soon' | 'beta';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  status: IntegrationStatus;
  category: 'communication' | 'development' | 'productivity' | 'ai';
  features: string[];
  connectUrl?: string;
  documentation?: string;
  comingSoonDate?: string;
  color: string; // For gradient and theme colors
}

// Integration data with React Icons
const integrations: Integration[] = [
  {
    id: 'slack',
    name: 'Slack',
    description: 'Send messages, create channels, and get notifications directly in your workspace.',
    icon: SiSlack,
    status: 'available',
    category: 'communication',
    features: ['Send messages', 'Create channels', 'Real-time notifications', 'Bot commands'],
    connectUrl: '/api/integrations/slack/auth',
    color: '#4A154B'
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Manage repositories, track issues, and review pull requests with AI assistance.',
    icon: SiGithub,
    status: 'available',
    category: 'development',
    features: ['Repository access', 'Issue tracking', 'PR reviews', 'Code analysis'],
    connectUrl: '/api/integrations/github/auth',
    color: '#181717'
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Compose emails, manage your inbox, and automate email workflows with AI.',
    icon: SiGmail,
    status: 'available',
    category: 'communication',
    features: ['Smart compose', 'Email automation', 'Inbox management', 'Template generation'],
    connectUrl: '/api/integrations/gmail/auth',
    color: '#EA4335'
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Schedule meetings, set reminders, and manage your calendar through AI chat.',
    icon: SiGooglecalendar,
    status: 'coming-soon',
    category: 'productivity',
    features: ['Schedule meetings', 'Smart reminders', 'Calendar insights', 'Meeting prep'],
    comingSoonDate: 'January 2025',
    color: '#4285F4'
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Create pages, manage databases, and organize your workspace with AI.',
    icon: SiNotion,
    status: 'coming-soon',
    category: 'productivity',
    features: ['Create pages', 'Database queries', 'Content generation', 'Team collaboration'],
    comingSoonDate: 'February 2025',
    color: '#000000'
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Track issues, manage sprints, and automate project workflows.',
    icon: SiJira,
    status: 'coming-soon',
    category: 'development',
    features: ['Issue tracking', 'Sprint management', 'Workflow automation', 'Progress insights'],
    comingSoonDate: 'March 2025',
    color: '#0052CC'
  },
  {
    id: 'figma',
    name: 'Figma',
    description: 'Generate design ideas, export assets, and collaborate on creative projects.',
    icon: SiFigma,
    status: 'coming-soon',
    category: 'productivity',
    features: ['Design feedback', 'Asset export', 'Team collaboration', 'Design insights'],
    comingSoonDate: 'April 2025',
    color: '#F24E1E'
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'Enhanced AI capabilities with GPT-4, DALL-E, and advanced models.',
    icon: SiOpenai,
    status: 'beta',
    category: 'ai',
    features: ['GPT-4 access', 'Image generation', 'Code completion', 'Advanced reasoning'],
    connectUrl: '/api/integrations/openai/auth',
    color: '#412991'
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Claude AI models for enhanced reasoning and conversation capabilities.',
    icon: SiAnthropic,
    status: 'beta',
    category: 'ai',
    features: ['Claude models', 'Advanced reasoning', 'Safe AI', 'Long conversations'],
    connectUrl: '/api/integrations/anthropic/auth',
    color: '#D97706'
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'Manage servers, send messages, and coordinate with your gaming or work teams.',
    icon: SiDiscord,
    status: 'coming-soon',
    category: 'communication',
    features: ['Server management', 'Voice coordination', 'Bot commands', 'Community insights'],
    comingSoonDate: 'May 2025',
    color: '#5865F2'
  },
  {
    id: 'linear',
    name: 'Linear',
    description: 'Streamline issue tracking and project management with AI-powered insights.',
    icon: SiLinear,
    status: 'coming-soon',
    category: 'development',
    features: ['Issue management', 'Project insights', 'Workflow automation', 'Team coordination'],
    comingSoonDate: 'June 2025',
    color: '#5E6AD2'
  },
  {
    id: 'zoom',
    name: 'Zoom',
    description: 'Schedule meetings, generate summaries, and manage your video conferences.',
    icon: SiZoom,
    status: 'coming-soon',
    category: 'communication',
    features: ['Meeting scheduling', 'AI summaries', 'Recording management', 'Calendar sync'],
    comingSoonDate: 'July 2025',
    color: '#2D8CFF'
  },
  {
    id: 'microsoft-teams',
    name: 'Microsoft Teams',
    description: 'Collaborate with teams, schedule meetings, and share files seamlessly.',
    icon: FaUsers,
    status: 'coming-soon',
    category: 'communication',
    features: ['Team chat', 'Video calls', 'File sharing', 'Calendar integration'],
    comingSoonDate: 'August 2025',
    color: '#6264A7'
  },
  {
    id: 'trello',
    name: 'Trello',
    description: 'Organize projects with boards, lists, and cards powered by AI insights.',
    icon: SiTrello,
    status: 'coming-soon',
    category: 'productivity',
    features: ['Board management', 'Card automation', 'Progress tracking', 'Team coordination'],
    comingSoonDate: 'September 2025',
    color: '#0079BF'
  },
  {
    id: 'asana',
    name: 'Asana',
    description: 'Manage tasks, projects, and workflows with intelligent automation.',
    icon: SiAsana,
    status: 'coming-soon',
    category: 'productivity',
    features: ['Task management', 'Project tracking', 'Team collaboration', 'Goal setting'],
    comingSoonDate: 'October 2025',
    color: '#F06A6A'
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    description: 'Store, sync, and share files with AI-powered content organization.',
    icon: SiDropbox,
    status: 'coming-soon',
    category: 'productivity',
    features: ['File storage', 'Smart sync', 'Content search', 'Team sharing'],
    comingSoonDate: 'November 2025',
    color: '#0061FF'
  }
];

const categories = [
  { id: 'all', name: 'All Integrations', icon: SparklesIcon, color: 'purple' },
  { id: 'communication', name: 'Communication', icon: FaComments, color: 'blue' },
  { id: 'development', name: 'Development', icon: FaCode, color: 'green' },
  { id: 'productivity', name: 'Productivity', icon: FaRocket, color: 'orange' },
  { id: 'ai', name: 'AI & ML', icon: FaBrain, color: 'pink' }
];

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

const StatusBadge = ({ status }: { status: IntegrationStatus }) => {
  const statusConfig = {
    connected: { label: 'Connected', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckIcon },
    available: { label: 'Available', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: PlusIcon },
    'coming-soon': { label: 'Coming Soon', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: ClockIcon },
    beta: { label: 'Beta', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', icon: ExclamationTriangleIcon }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </span>
  );
};

const IntegrationCard = ({ integration }: { integration: Integration }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [animationDelay] = useState(Math.random() * 0.5);
  const Icon = integration.icon;

  return (
    <div 
      className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 dark:hover:shadow-purple-500/10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        animation: `fadeInUp 0.6s ease-out ${animationDelay}s both`
      }}
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/10 to-cyan-500/10 rounded-full blur-xl transform -translate-x-12 translate-y-12 group-hover:scale-125 transition-transform duration-700" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`relative w-12 h-12 transition-all duration-500 ${isHovered ? 'scale-110 rotate-6' : ''}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative w-full h-full bg-white/50 dark:bg-gray-700/50 rounded-xl flex items-center justify-center shadow-lg">
              <Icon 
                className="w-8 h-8 filter group-hover:brightness-110 transition-all duration-300" 
              />
            </div>
            {/* Floating orbs animation */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-300" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text transition-all duration-300">
              {integration.name}
            </h3>
            <div className="mt-1">
              <StatusBadge status={integration.status} />
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="relative z-10 text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
        {integration.description}
      </p>

      {/* Features */}
      <div className="relative z-10 mb-6">
        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
          Features
        </h4>
        <div className="grid grid-cols-2 gap-1">
          {integration.features.slice(0, 4).map((feature, index) => (
            <div key={index} className="flex items-center text-xs text-gray-600 dark:text-gray-400">
              <div className="w-1 h-1 bg-purple-500 rounded-full mr-2" />
              {feature}
            </div>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <div className="relative z-10 flex items-center justify-between">
        {integration.status === 'available' && (
          <button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800">
            Connect
          </button>
        )}
        {integration.status === 'connected' && (
          <button className="flex-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">
            <Cog6ToothIcon className="w-4 h-4 inline mr-2" />
            Configure
          </button>
        )}
        {integration.status === 'coming-soon' && (
          <div className="flex-1 text-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Coming {integration.comingSoonDate}
            </span>
          </div>
        )}
        {integration.status === 'beta' && (
          <button className="flex-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors">
            Join Beta
          </button>
        )}
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
};

export default function IntegrationsPage() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add CSS animations for the page
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      
      @keyframes shimmer {
        0% { background-position: -1000px 0; }
        100% { background-position: 1000px 0; }
      }
      
      .animate-float {
        animation: float 3s ease-in-out infinite;
      }
      
      .animate-shimmer {
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
        background-size: 1000px 100%;
        animation: shimmer 2s infinite;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const filteredIntegrations = integrations.filter(integration => {
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStatsForCategory = (category: string) => {
    const filtered = category === 'all' ? integrations : integrations.filter(i => i.category === category);
    return {
      total: filtered.length,
      connected: filtered.filter(i => i.status === 'connected').length,
      available: filtered.filter(i => i.status === 'available').length
    };
  };

  const stats = getStatsForCategory(selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 relative">
      {/* Background Grid */}
      <RetroGrid />

      {/* Header */}
      <header className="relative z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              href="/settings" 
              className="p-2 rounded-lg text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Integrations
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Connect your favorite tools and services
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8 custom-scrollbar">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  Total Integrations
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text group-hover:text-transparent transition-all duration-300">
                  {stats.total}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 animate-float">
                <SparklesIcon className="w-6 h-6 text-purple-600 dark:text-purple-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:border-green-300 dark:hover:border-green-600 transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                  Connected
                </p>
                <p className="text-3xl font-bold text-green-600 group-hover:scale-110 transition-transform duration-300">
                  {stats.connected}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <CheckIcon className="w-6 h-6 text-green-600 dark:text-green-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-600/5 to-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Available
                </p>
                <p className="text-3xl font-bold text-blue-600 group-hover:scale-110 transition-transform duration-300">
                  {stats.available}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <PlusIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/5 to-cyan-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category, index) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`relative px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                      selectedCategory === category.id
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 scale-105'
                        : 'bg-white/70 dark:bg-gray-800/70 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-lg'
                    }`}
                    style={{ 
                      animation: `fadeInUp 0.4s ease-out ${index * 0.1}s both`
                    }}
                  >
                    {selectedCategory === category.id && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 animate-pulse" />
                    )}
                    <span className="relative z-10 flex items-center space-x-2">
                      <Icon className="w-4 h-4" />
                      <span>{category.name}</span>
                    </span>
                    {selectedCategory !== category.id && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/10 to-pink-600/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search integrations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredIntegrations.map((integration) => (
            <IntegrationCard key={integration.id} integration={integration} />
          ))}
        </div>

        {/* Empty State */}
        {filteredIntegrations.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <SparklesIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No integrations found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
            >
              Clear Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
} 