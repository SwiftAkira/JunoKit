'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SiJira } from 'react-icons/si';
import { 
  CheckIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  UserIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  XMarkIcon,
  LinkIcon
} from '@heroicons/react/24/outline';

interface JiraIntegration {
  connected: boolean;
  domain?: string;
  email?: string;
  displayName?: string;
  accountId?: string;
  connectedAt?: string;
}

interface JiraProject {
  id: string;
  key: string;
  name: string;
  projectTypeKey: string;
  description?: string;
  style: string;
}

interface JiraIssue {
  id: string;
  key: string;
  summary: string;
  description?: string;
  status: {
    name: string;
    id: string;
  };
  issueType: {
    name: string;
    id: string;
    iconUrl?: string;
  };
  priority: {
    name: string;
    id: string;
    iconUrl?: string;
  };
  assignee?: {
    displayName: string;
    accountId: string;
    avatarUrls?: any;
  };
  reporter: {
    displayName: string;
    accountId: string;
    avatarUrls?: any;
  };
  project: {
    key: string;
    name: string;
    id: string;
  };
  created: string;
  updated: string;
  resolved?: string;
}

interface ConnectFormData {
  domain: string;
  email: string;
  apiToken: string;
}

interface CreateIssueFormData {
  projectKey: string;
  summary: string;
  description: string;
  issueType: string;
  priority: string;
}

export default function JiraIntegration() {
  const { user } = useAuth();
  
  // Helper function to get auth headers
  const getAuthHeaders = (): Record<string, string> => {
    if (user?.token) {
      return {
        'Authorization': `Bearer ${user.token}`,
      };
    }
    return {};
  };

  // State management
  const [integration, setIntegration] = useState<JiraIntegration | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [projects, setProjects] = useState<JiraProject[]>([]);
  const [issues, setIssues] = useState<JiraIssue[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingIssues, setLoadingIssues] = useState(false);
  
  // UI state
  const [activeTab, setActiveTab] = useState<'issues' | 'projects' | 'search' | 'create'>('issues');
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set());
  
  // Form data
  const [connectForm, setConnectForm] = useState<ConnectFormData>({
    domain: '',
    email: '',
    apiToken: '',
  });
  
  const [createForm, setCreateForm] = useState<CreateIssueFormData>({
    projectKey: '',
    summary: '',
    description: '',
    issueType: 'Task',
    priority: 'Medium',
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<JiraIssue[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (user) {
      checkConnectionStatus();
    }
  }, [user]);

  const checkConnectionStatus = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/integrations/jira/status', {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        setIntegration(data);
        
        // If connected, load initial data
        if (data.connected) {
          loadProjects();
          loadIssues();
        }
      } else {
        console.error('Failed to check Jira status:', response.status);
        setIntegration({ connected: false });
      }
    } catch (error) {
      console.error('Failed to check Jira connection status:', error);
      setIntegration({ connected: false });
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    if (!integration?.connected) return;
    
    setLoadingProjects(true);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/integrations/jira/projects', {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Failed to load Jira projects:', error);
    } finally {
      setLoadingProjects(false);
    }
  };

  const loadIssues = async (filters: Record<string, string> = {}) => {
    if (!integration?.connected) return;
    
    setLoadingIssues(true);
    try {
      const headers = await getAuthHeaders();
      const params = new URLSearchParams({
        assignee: 'me',
        maxResults: '20',
        ...filters,
      });
      
      const response = await fetch(`/api/integrations/jira/issues?${params}`, {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        setIssues(data.issues || []);
      }
    } catch (error) {
      console.error('Failed to load Jira issues:', error);
    } finally {
      setLoadingIssues(false);
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setConnecting(true);
    
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/integrations/jira/connect', {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(connectForm),
      });

      if (response.ok) {
        const data = await response.json();
        setIntegration(data.integration);
        setShowConnectModal(false);
        setConnectForm({ domain: '', email: '', apiToken: '' });
        
        // Load initial data
        loadProjects();
        loadIssues();
        
        alert('Jira integration connected successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to connect to Jira: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to connect to Jira:', error);
      alert('Failed to connect to Jira. Please try again.');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your Jira integration?')) {
      return;
    }

    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/integrations/jira/disconnect', {
        method: 'DELETE',
        headers,
      });

      if (response.ok) {
        setIntegration({ connected: false });
        setProjects([]);
        setIssues([]);
        setSearchResults([]);
        alert('Jira integration disconnected successfully.');
      } else {
        throw new Error('Failed to disconnect Jira');
      }
    } catch (error) {
      console.error('Failed to disconnect Jira:', error);
      alert('Failed to disconnect Jira. Please try again.');
    }
  };

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/integrations/jira/issue', {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createForm),
      });

      if (response.ok) {
        const data = await response.json();
        setShowCreateModal(false);
        setCreateForm({
          projectKey: '',
          summary: '',
          description: '',
          issueType: 'Task',
          priority: 'Medium',
        });
        
        // Refresh issues
        loadIssues();
        
        alert(`Issue ${data.issue.key} created successfully!`);
      } else {
        const error = await response.json();
        alert(`Failed to create issue: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to create issue:', error);
      alert('Failed to create issue. Please try again.');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/integrations/jira/search?q=${encodeURIComponent(searchQuery)}&maxResults=10`, {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.issues || []);
      }
    } catch (error) {
      console.error('Failed to search Jira issues:', error);
    } finally {
      setSearching(false);
    }
  };

  const toggleIssueExpanded = (issueId: string) => {
    const newExpanded = new Set(expandedIssues);
    if (newExpanded.has(issueId)) {
      newExpanded.delete(issueId);
    } else {
      newExpanded.add(issueId);
    }
    setExpandedIssues(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('done') || lowerStatus.includes('resolved')) return 'bg-green-100 text-green-800';
    if (lowerStatus.includes('progress') || lowerStatus.includes('development')) return 'bg-blue-100 text-blue-800';
    if (lowerStatus.includes('todo') || lowerStatus.includes('open')) return 'bg-gray-100 text-gray-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getPriorityColor = (priority: string) => {
    const lowerPriority = priority.toLowerCase();
    if (lowerPriority.includes('high') || lowerPriority.includes('critical')) return 'text-red-600';
    if (lowerPriority.includes('medium')) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/60">
        <div className="flex items-center justify-center">
          <ArrowPathIcon className="w-6 h-6 animate-spin text-blue-600 mr-3" />
          <span className="text-gray-600">Loading Jira integration...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/60">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <SiJira className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Jira Integration</h2>
            <p className="text-gray-600">Manage your Jira projects and issues</p>
          </div>
        </div>
        
        {integration?.connected ? (
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="flex items-center text-green-600">
                <CheckIcon className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">Connected</span>
              </div>
              <p className="text-xs text-gray-500">{integration.email}@{integration.domain}</p>
            </div>
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition-colors"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowConnectModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Connect to Jira
          </button>
        )}
      </div>

      {!integration?.connected ? (
        <div className="text-center py-12">
          <SiJira className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Connect to Jira</h3>
          <p className="text-gray-600 mb-8">
            Connect your Jira workspace to manage issues and projects directly from JunoKit.
          </p>
          <button
            onClick={() => setShowConnectModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Get Started
          </button>
        </div>
      ) : (
        <>
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6 p-1 bg-gray-100 rounded-lg">
            {[
              { key: 'issues', label: 'My Issues', icon: DocumentTextIcon },
              { key: 'projects', label: 'Projects', icon: UserIcon },
              { key: 'search', label: 'Search', icon: MagnifyingGlassIcon },
              { key: 'create', label: 'Create Issue', icon: PlusIcon },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                  activeTab === key
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'issues' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">My Issues</h3>
                  <button
                    onClick={() => loadIssues()}
                    disabled={loadingIssues}
                    className="flex items-center px-3 py-1 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                  >
                    <ArrowPathIcon className={`w-4 h-4 mr-1 ${loadingIssues ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
                
                {loadingIssues ? (
                  <div className="text-center py-8">
                    <ArrowPathIcon className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
                    <p className="text-gray-600">Loading issues...</p>
                  </div>
                ) : issues.length === 0 ? (
                  <div className="text-center py-8">
                    <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-600">No issues found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {issues.map((issue) => (
                      <div key={issue.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-medium text-blue-600">{issue.key}</span>
                              <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(issue.status.name)}`}>
                                {issue.status.name}
                              </span>
                              <span className={`text-xs font-medium ${getPriorityColor(issue.priority.name)}`}>
                                {issue.priority.name}
                              </span>
                            </div>
                            <h4 className="font-medium text-gray-900 mb-1">{issue.summary}</h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>{issue.project.name}</span>
                              <span>{issue.issueType.name}</span>
                              <span>Updated {formatDate(issue.updated)}</span>
                              {issue.assignee && (
                                <span>Assigned to {issue.assignee.displayName}</span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => toggleIssueExpanded(issue.id)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            {expandedIssues.has(issue.id) ? (
                              <ChevronDownIcon className="w-4 h-4" />
                            ) : (
                              <ChevronRightIcon className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        
                        {expandedIssues.has(issue.id) && issue.description && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{issue.description}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'projects' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Projects</h3>
                  <button
                    onClick={loadProjects}
                    disabled={loadingProjects}
                    className="flex items-center px-3 py-1 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                  >
                    <ArrowPathIcon className={`w-4 h-4 mr-1 ${loadingProjects ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
                
                {loadingProjects ? (
                  <div className="text-center py-8">
                    <ArrowPathIcon className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
                    <p className="text-gray-600">Loading projects...</p>
                  </div>
                ) : projects.length === 0 ? (
                  <div className="text-center py-8">
                    <UserIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-600">No projects found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projects.map((project) => (
                      <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-sm">{project.key}</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{project.name}</h4>
                            <p className="text-sm text-gray-500">{project.projectTypeKey}</p>
                          </div>
                        </div>
                        {project.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                        )}
                        <button
                          onClick={() => loadIssues({ projectKey: project.key })}
                          className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          View Issues →
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'search' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Search Issues</h3>
                
                <div className="flex space-x-2 mb-6">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search issues by text..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <button
                    onClick={handleSearch}
                    disabled={searching || !searchQuery.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {searching ? (
                      <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    ) : (
                      <MagnifyingGlassIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
                
                {searchResults.length > 0 && (
                  <div className="space-y-3">
                    {searchResults.map((issue) => (
                      <div key={issue.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-blue-600">{issue.key}</span>
                          <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(issue.status.name)}`}>
                            {issue.status.name}
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">{issue.summary}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{issue.project.name}</span>
                          <span>{issue.issueType.name}</span>
                          <span>Updated {formatDate(issue.updated)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'create' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Issue</h3>
                
                {projects.length === 0 ? (
                  <div className="text-center py-8">
                    <ExclamationTriangleIcon className="w-12 h-12 text-yellow-300 mx-auto mb-2" />
                    <p className="text-gray-600">Load projects first to create issues</p>
                    <button
                      onClick={loadProjects}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Load Projects
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleCreateIssue} className="space-y-4 max-w-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project
                      </label>
                      <select
                        value={createForm.projectKey}
                        onChange={(e) => setCreateForm({ ...createForm, projectKey: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select a project</option>
                        {projects.map((project) => (
                          <option key={project.id} value={project.key}>
                            {project.key} - {project.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Summary
                      </label>
                      <input
                        type="text"
                        value={createForm.summary}
                        onChange={(e) => setCreateForm({ ...createForm, summary: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Brief description of the issue"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={createForm.description}
                        onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Detailed description of the issue"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Issue Type
                        </label>
                        <select
                          value={createForm.issueType}
                          onChange={(e) => setCreateForm({ ...createForm, issueType: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="Task">Task</option>
                          <option value="Bug">Bug</option>
                          <option value="Story">Story</option>
                          <option value="Epic">Epic</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Priority
                        </label>
                        <select
                          value={createForm.priority}
                          onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Critical">Critical</option>
                        </select>
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={!createForm.projectKey || !createForm.summary}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Create Issue
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Connect Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Connect to Jira</h3>
              <button
                onClick={() => setShowConnectModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleConnect} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jira Domain
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={connectForm.domain}
                    onChange={(e) => setConnectForm({ ...connectForm, domain: e.target.value })}
                    placeholder="your-company"
                    required
                    className="w-full px-3 py-2 pr-24 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                    .atlassian.net
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={connectForm.email}
                  onChange={(e) => setConnectForm({ ...connectForm, email: e.target.value })}
                  placeholder="your-email@company.com"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Token
                </label>
                <input
                  type="password"
                  value={connectForm.apiToken}
                  onChange={(e) => setConnectForm({ ...connectForm, apiToken: e.target.value })}
                  placeholder="Your Jira API token"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Create an API token here
                  </a>
                </p>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowConnectModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={connecting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {connecting ? (
                    <div className="flex items-center justify-center">
                      <ArrowPathIcon className="w-4 h-4 animate-spin mr-2" />
                      Connecting...
                    </div>
                  ) : (
                    'Connect'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
</rewritten_file>