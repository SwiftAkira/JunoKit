import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  PlusIcon,
  ChatBubbleLeftIcon,
  XMarkIcon,
  EllipsisVerticalIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
}

interface ChatSidebarProps {
  onClose: () => void;
  onConversationSelect?: (conversationId: string) => void;
  onNewConversation?: () => void;
  activeConversationId?: string;
}

// Lightweight markdown renderer for sidebar text
const SidebarMarkdown = ({ text, className = '' }: { text: string; className?: string }) => {
  // Simple regex-based markdown parsing for basic formatting
  const renderMarkdown = (content: string) => {
    // Handle bold text **text**
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Handle italic text *text*
    content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Handle code `code`
    content = content.replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-700 px-1 rounded text-xs">$1</code>');
    // Handle superscript <sup>text</sup> (keep as is)
    // Handle subscript <sub>text</sub> (keep as is)
    
    return content;
  };

  return (
    <span 
      className={className}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(text) }}
    />
  );
};

export function ChatSidebar({ onClose, onConversationSelect, onNewConversation, activeConversationId }: ChatSidebarProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch conversations from API
  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      
      // Call API with temporary auth token for testing
      const response = await fetch('/api/chat', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo-token', // Temporary auth for testing
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Group messages by conversationId to create conversation summaries
        const conversationMap = new Map();
        
        // Process all messages and group by conversation
        data.conversations.forEach((item: any) => {
          // Only process actual messages
          if (item.SK && item.SK.startsWith('MSG#') && item.conversationId && (item.role === 'user' || item.role === 'assistant')) {
            const convId = item.conversationId;
            const messageTime = new Date(item.timestamp);
            
            if (!conversationMap.has(convId)) {
              // Create new conversation entry
              conversationMap.set(convId, {
                id: convId,
                title: '', // Will be set from first user message
                lastMessage: '',
                timestamp: messageTime,
                messageCount: 0,
                firstUserMessage: '',
                lastMessageTime: messageTime,
              });
            }
            
            const conv = conversationMap.get(convId);
            conv.messageCount += 1;
            
            // Update latest timestamp
            if (messageTime > conv.timestamp) {
              conv.timestamp = messageTime;
            }
            
            // Set title from first user message if not set
            if (!conv.title && item.role === 'user') {
              conv.title = item.content.substring(0, 50) + (item.content.length > 50 ? '...' : '');
            }
            
            // Update last message - use the most recent message
            if (messageTime >= conv.lastMessageTime) {
              conv.lastMessage = item.content.substring(0, 100) + (item.content.length > 100 ? '...' : '');
              conv.lastMessageTime = messageTime;
            }
          }
        });
        
        // Clean up temporary fields and convert to array
        const formattedConversations = Array.from(conversationMap.values())
          .map(conv => {
            const { lastMessageTime, firstUserMessage, ...cleanConv } = conv;
            return cleanConv;
          })
          .filter(conv => conv.title) // Only include conversations with titles (user messages)
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        
        setConversations(formattedConversations);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load conversations on component mount
  useEffect(() => {
    fetchConversations();
  }, []);

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  const handleNewChat = () => {
    // Clear active conversation and let parent handle new chat
    if (onNewConversation) {
      onNewConversation();
    }
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      const response = await fetch(`/api/chat/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo-token', // Temporary auth for testing
        },
      });

      if (response.ok) {
        // Remove from local state
        setConversations(conversations.filter(conv => conv.id !== id));
        
        // If this was the active conversation, clear it
        if (activeConversationId === id && onConversationSelect) {
          onConversationSelect('');
        }
      } else {
        console.error('Failed to delete conversation');
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
    setShowMenu(null);
  };

  const handleRenameConversation = async (id: string) => {
    const newTitle = prompt('Enter new conversation title:');
    if (newTitle) {
      try {
              const response = await fetch(`/api/chat/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo-token', // Temporary auth for testing
        },
        body: JSON.stringify({ title: newTitle }),
      });

        if (response.ok) {
          // Update local state
          setConversations(conversations.map(conv => 
            conv.id === id ? { ...conv, title: newTitle } : conv
          ));
        } else {
          console.error('Failed to rename conversation');
        }
      } catch (error) {
        console.error('Error renaming conversation:', error);
      }
    }
    setShowMenu(null);
  };

  const handleConversationClick = (conversationId: string) => {
    if (onConversationSelect) {
      onConversationSelect(conversationId);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Image
              src="/JunoKitColorNoBGNoTEXT.png"
              alt="Junokit"
              width={24}
              height={24}
            />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Conversations
            </h2>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close sidebar"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2.5 rounded-lg transition-all duration-200 transform hover:scale-105 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          <PlusIcon className="h-4 w-4" />
          <span className="font-medium">New Chat</span>
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-2 space-y-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 px-4">
              <ChatBubbleLeftIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">No conversations yet</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Start a new chat to begin</p>
            </div>
          ) : (
            conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`
                relative group rounded-lg p-3 cursor-pointer transition-all duration-200
                ${activeConversationId === conversation.id 
                  ? 'bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }
              `}
              onClick={() => handleConversationClick(conversation.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <ChatBubbleLeftIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      <SidebarMarkdown text={conversation.title} />
                    </h3>
                  </div>
                  
                  {conversation.lastMessage && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                      <SidebarMarkdown text={conversation.lastMessage} />
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{formatTimestamp(conversation.timestamp)}</span>
                    <span>{conversation.messageCount} messages</span>
                  </div>
                </div>

                {/* Menu Button */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(showMenu === conversation.id ? null : conversation.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                    aria-label="Conversation options"
                  >
                    <EllipsisVerticalIcon className="h-4 w-4 text-gray-500" />
                  </button>

                  {/* Dropdown Menu */}
                  {showMenu === conversation.id && (
                    <div className="absolute right-0 top-8 z-10 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-1">
                      <button
                        onClick={() => handleRenameConversation(conversation.id)}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        <PencilIcon className="h-4 w-4" />
                        <span>Rename</span>
                      </button>
                      <button
                        onClick={() => handleDeleteConversation(conversation.id)}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <TrashIcon className="h-4 w-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
          )}
        </div>
      </div>
    </div>
  );
} 