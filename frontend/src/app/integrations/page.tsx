'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import JiraIntegration from '@/components/integrations/JiraIntegration';
import SlackIntegration from '@/components/integrations/SlackIntegration';
import { 
  SiJira, 
  SiSlack,
  SiGithub,
  SiGooglecalendar,
  SiGmail
} from 'react-icons/si';
import { 
  CheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  status: 'available' | 'coming-soon' | 'in-progress';
  category: 'productivity' | 'communication' | 'development';
  features: string[];
  component?: React.ComponentType<any>;
}

const integrations: Integration[] = [
  {
    id: 'jira',
    name: 'Jira',
    description: 'Manage issues, projects, and track work progress directly from JunoKit.',
    icon: SiJira,
    status: 'available',
    category: 'productivity',
    features: [
      'View and manage issues',
      'Create new tickets',
      'Search across projects',
      'Track progress and status',
      'Project overview'
    ],
    component: JiraIntegration,
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Send messages, manage channels, and stay connected with your team.',
    icon: SiSlack,
    status: 'available',
    category: 'communication',
    features: [
      'Send messages to channels',
      'Direct messaging',
      'Channel management',
      'User directory',
      'Real-time notifications'
    ],
    component: SlackIntegration,
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Manage repositories, issues, and pull requests from one place.',
    icon: SiGithub,
    status: 'coming-soon',
    category: 'development',
    features: [
      'Repository management',
      'Issue tracking',
      'Pull request reviews',
      'Code search',
      'Project boards'
    ],
  },
  {
    id: 'calendar',
    name: 'Google Calendar',
    description: 'Schedule meetings, manage events, and sync your calendar.',
    icon: SiGooglecalendar,
    status: 'coming-soon',
    category: 'productivity',
    features: [
      'Event scheduling',
      'Meeting management',
      'Calendar sync',
      'Availability checking',
      'Reminder notifications'
    ],
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Send emails, manage inbox, and automate email workflows.',
    icon: SiGmail,
    status: 'coming-soon',
    category: 'communication',
    features: [
      'Email composition',
      'Inbox management',
      'Label organization',
      'Email templates',
      'Automated responses'
    ],
  },
  {
    id: 'outlook',
    name: 'Microsoft Outlook',
    description: 'Integrate with Outlook for email and calendar management.',
    icon: SiGmail, // Using Gmail icon as placeholder
    status: 'coming-soon',
    category: 'productivity',
    features: [
      'Email integration',
      'Calendar sync',
      'Contact management',
      'Task tracking',
      'Meeting scheduling'
    ],
  },
];

export default function IntegrationsPage() {
  const { user } = useAuth();
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredIntegrations = integrations.filter(integration => 
    selectedCategory === 'all' || integration.category === selectedCategory
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckIcon className="w-4 h-4 text-green-600" />;
      case 'in-progress':
        return <ClockIcon className="w-4 h-4 text-yellow-600" />;
      case 'coming-soon':
        return <SparklesIcon className="w-4 h-4 text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'in-progress':
        return 'In Progress';
      case 'coming-soon':
        return 'Coming Soon';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'coming-soon':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access integrations.</p>
        </div>
      </div>
    );
  }

  if (selectedIntegration) {
    const integration = integrations.find(i => i.id === selectedIntegration);
    const IntegrationComponent = integration?.component;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => setSelectedIntegration(null)}
            className="mb-6 flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to Integrations
          </button>

          {/* Integration Component */}
          {IntegrationComponent ? (
            <IntegrationComponent />
          ) : (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/60">
              <div className="text-center py-12">
                <ExclamationTriangleIcon className="w-16 h-16 text-yellow-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Integration Coming Soon</h3>
                <p className="text-gray-600">This integration is not yet available.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-blue-100 rounded-2xl">
              <RocketLaunchIcon className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Integrations
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect JunoKit with your favorite tools to streamline your workflow and boost productivity.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2 p-1 bg-white/70 backdrop-blur-sm rounded-lg border border-gray-200/60">
            {[
              { key: 'all', label: 'All' },
              { key: 'productivity', label: 'Productivity' },
              { key: 'communication', label: 'Communication' },
              { key: 'development', label: 'Development' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  selectedCategory === key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredIntegrations.map((integration) => {
            const IconComponent = integration.icon;
            return (
              <div
                key={integration.id}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 hover:border-gray-300/60 transition-all duration-300 hover:shadow-lg cursor-pointer group"
                onClick={() => setSelectedIntegration(integration.id)}
              >
                {/* Integration Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-100 transition-colors">
                      <IconComponent className="w-6 h-6 text-gray-700 group-hover:text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                      <span className="text-xs text-gray-500 capitalize">{integration.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(integration.status)}
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(integration.status)}`}>
                      {getStatusText(integration.status)}
                    </span>
                  </div>
                </div>

                {/* Integration Description */}
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {integration.description}
                </p>

                {/* Features */}
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-gray-900 uppercase tracking-wide">Features</h4>
                  <ul className="space-y-1">
                    {integration.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="text-xs text-gray-600 flex items-center">
                        <div className="w-1 h-1 bg-blue-600 rounded-full mr-2" />
                        {feature}
                      </li>
                    ))}
                    {integration.features.length > 3 && (
                      <li className="text-xs text-gray-500">
                        +{integration.features.length - 3} more features
                      </li>
                    )}
                  </ul>
                </div>

                {/* Action Button */}
                <div className="mt-6">
                  <button
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                      integration.status === 'available'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={integration.status !== 'available'}
                  >
                    {integration.status === 'available' ? 'Configure' : 'Coming Soon'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/60">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {integrations.filter(i => i.status === 'available').length}
              </div>
              <p className="text-gray-600">Available Now</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {integrations.filter(i => i.status === 'in-progress').length}
              </div>
              <p className="text-gray-600">In Development</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-600 mb-2">
                {integrations.filter(i => i.status === 'coming-soon').length}
              </div>
              <p className="text-gray-600">Coming Soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 