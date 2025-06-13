'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SiSlack } from 'react-icons/si';
import { 
  CheckIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ChatBubbleLeftIcon,
  UserGroupIcon,
  HashtagIcon,
  LinkIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface SlackIntegration {
  connected: boolean;
  teamId?: string;
  teamName?: string;
  userName?: string;
  connectedAt?: string;
}

interface SlackChannel {
  id: string;
  name: string;
  is_channel: boolean;
  is_group: boolean;
  is_im: boolean;
  is_member: boolean;
}

interface SlackUser {
  id: string;
  name: string;
  real_name: string;
  display_name?: string;
  email?: string;
}

interface SlackMessageRequest {
  channel: string;
  text?: string;
  blocks?: any[];
  attachments?: any[];
  thread_ts?: string;
}

export default function SlackIntegration() {
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

  const [integration, setIntegration] = useState<SlackIntegration | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [channels, setChannels] = useState<SlackChannel[]>([]);
  const [users, setUsers] = useState<SlackUser[]>([]);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageForm, setMessageForm] = useState({
    channel: '',
    text: '',
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (user) {
      checkConnectionStatus();
    }
  }, [user]);

  const checkConnectionStatus = async () => {
    try {
      // Development mode fallback - show not connected state
      if (window.location.hostname === 'localhost') {
        console.log('Development mode: Showing not connected state for testing');
        setIntegration({ connected: false });
        setLoading(false);
        return;
      }

      const headers = getAuthHeaders();
      const response = await fetch('/api/integrations/slack/status', {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        setIntegration(data);
        
        // If connected, load channels and users
        if (data.connected) {
          loadChannelsAndUsers();
        }
      } else {
        console.error('Failed to check Slack status:', response.status);
        // Fallback to not connected state
        setIntegration({ connected: false });
      }
    } catch (error) {
      console.error('Failed to check Slack connection status:', error);
      // Fallback to not connected state
      setIntegration({ connected: false });
    } finally {
      setLoading(false);
    }
  };

  const loadChannelsAndUsers = async () => {
    try {
      const headers = getAuthHeaders();
      const [channelsResponse, usersResponse] = await Promise.all([
        fetch('/api/integrations/slack/channels', {
          headers,
        }),
        fetch('/api/integrations/slack/users', {
          headers,
        }),
      ]);

      if (channelsResponse.ok) {
        const channelsData = await channelsResponse.json();
        setChannels(channelsData.channels || []);
      }

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users || []);
      }
    } catch (error) {
      console.error('Failed to load Slack data:', error);
    }
  };

  const handleConnect = async () => {
    setConnecting(true);
    
    try {
      const headers = getAuthHeaders();
      const response = await fetch('/api/integrations/slack/auth', {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to Slack OAuth
        window.location.href = data.authUrl;
      } else {
        throw new Error('Failed to initiate Slack OAuth');
      }
    } catch (error) {
      console.error('Failed to connect to Slack:', error);
      alert('Failed to connect to Slack. Please try again.');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your Slack workspace?')) {
      return;
    }

    try {
      const headers = getAuthHeaders();
      const response = await fetch('/api/integrations/slack/disconnect', {
        method: 'DELETE',
        headers,
      });

      if (response.ok) {
        setIntegration({ connected: false });
        setChannels([]);
        setUsers([]);
        alert('Slack workspace disconnected successfully.');
      } else {
        throw new Error('Failed to disconnect Slack');
      }
    } catch (error) {
      console.error('Failed to disconnect Slack:', error);
      alert('Failed to disconnect Slack. Please try again.');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageForm.channel || !messageForm.text) {
      alert('Please select a channel and enter a message.');
      return;
    }

    setSending(true);
    
    try {
      const headers = getAuthHeaders();
      const messageRequest: SlackMessageRequest = {
        channel: messageForm.channel,
        text: messageForm.text,
      };

      const response = await fetch('/api/integrations/slack/send', {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageRequest),
      });

      if (response.ok) {
        alert('Message sent successfully!');
        setMessageForm({ channel: '', text: '' });
        setShowMessageModal(false);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send Slack message:', error);
      alert(`Failed to send message: ${error}`);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <ArrowPathIcon className="h-6 w-6 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading Slack integration...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <SiSlack className="h-8 w-8 text-[#4A154B]" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Slack Integration</h3>
            <p className="text-sm text-gray-500">
              Send messages and notifications to your Slack workspace
            </p>
          </div>
        </div>
        
        {integration?.connected ? (
          <div className="flex items-center space-x-2">
            <CheckIcon className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium text-green-700">Connected</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
            <span className="text-sm font-medium text-yellow-700">Not Connected</span>
          </div>
        )}
      </div>

      {integration?.connected ? (
        <div className="space-y-4">
          {/* Connection Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <CheckIcon className="h-5 w-5 text-green-500" />
              <span className="font-medium text-green-800">
                Connected to {integration.teamName}
              </span>
            </div>
            <p className="text-sm text-green-700">
              Connected as <strong>{integration.userName}</strong>
              {integration.connectedAt && (
                <span className="block text-xs mt-1">
                  Connected on {new Date(integration.connectedAt).toLocaleDateString()}
                </span>
              )}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <HashtagIcon className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Channels</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {channels.filter(c => c.is_member).length}
              </p>
              <p className="text-xs text-gray-500">Available to send to</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <UserGroupIcon className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Team Members</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {users.length}
              </p>
              <p className="text-xs text-gray-500">Active users</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={() => setShowMessageModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-[#4A154B] text-white rounded-lg hover:bg-[#3d1140] transition-colors"
            >
              <ChatBubbleLeftIcon className="h-4 w-4" />
              <span>Send Message</span>
            </button>
            
            <button
              onClick={loadChannelsAndUsers}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowPathIcon className="h-4 w-4" />
              <span>Refresh</span>
            </button>
            
            <button
              onClick={handleDisconnect}
              className="flex items-center space-x-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
            >
              <XMarkIcon className="h-4 w-4" />
              <span>Disconnect</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          {/* Development Mode Notice */}
          {window.location.hostname === 'localhost' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left max-w-md mx-auto">
              <div className="flex items-center space-x-2 mb-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                <span className="font-medium text-yellow-800">Development Mode</span>
              </div>
              <p className="text-sm text-yellow-700">
                Slack OAuth requires HTTPS. To test the integration:
              </p>
              <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                <li>• Visit: <strong>https://app.junokit.com/integrations/slack</strong></li>
                <li>• Or set up ngrok for local HTTPS testing</li>
              </ul>
            </div>
          )}

          <SiSlack className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            Connect your Slack workspace
          </h4>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Connect your Slack workspace to send messages, create channels, and get notifications 
            directly from JunoKit.
          </p>
          
          <button
            onClick={handleConnect}
            disabled={connecting || window.location.hostname === 'localhost'}
            className="flex items-center space-x-2 px-6 py-3 bg-[#4A154B] text-white rounded-lg hover:bg-[#3d1140] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
          >
            {connecting ? (
              <>
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
                <span>Connecting...</span>
              </>
            ) : window.location.hostname === 'localhost' ? (
              <>
                <LinkIcon className="h-5 w-5" />
                <span>Connect to Slack (HTTPS Required)</span>
              </>
            ) : (
              <>
                <LinkIcon className="h-5 w-5" />
                <span>Connect to Slack</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Send Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Send Slack Message</h3>
              <button
                onClick={() => setShowMessageModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Channel
                </label>
                <select
                  value={messageForm.channel}
                  onChange={(e) => setMessageForm({ ...messageForm, channel: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4A154B] focus:border-transparent"
                  required
                >
                  <option value="">Select a channel</option>
                  {channels.filter(c => c.is_member).map(channel => (
                    <option key={channel.id} value={channel.id}>
                      #{channel.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  value={messageForm.text}
                  onChange={(e) => setMessageForm({ ...messageForm, text: e.target.value })}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4A154B] focus:border-transparent"
                  placeholder="Enter your message..."
                  required
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={sending}
                  className="flex-1 bg-[#4A154B] text-white py-2 px-4 rounded-lg hover:bg-[#3d1140] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowMessageModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 