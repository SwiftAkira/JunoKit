import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  PlusIcon,
  ChatBubbleLeftIcon,
  XMarkIcon,
  EllipsisVerticalIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';

interface ChatSidebarProps {
  onClose: () => void;
}

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
}

// Mock data - will be replaced with real data from API
const mockConversations: Conversation[] = [
  {
    id: '1',
    title: 'Deploy AWS Lambda',
    lastMessage: 'Great! Your Lambda function is now deployed to eu-north-1.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    messageCount: 12
  },
  {
    id: '2', 
    title: 'Debug React Component',
    lastMessage: 'The issue is in the useEffect dependency array...',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    messageCount: 8
  },
  {
    id: '3',
    title: 'Database Schema Design',
    lastMessage: 'For your user table, I recommend adding an index on...',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    messageCount: 15
  }
];

export function ChatSidebar({ onClose }: ChatSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [activeConversation, setActiveConversation] = useState<string>('1');
  const [showMenu, setShowMenu] = useState<string | null>(null);

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
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'New Conversation',
      lastMessage: '',
      timestamp: new Date(),
      messageCount: 0
    };
    setConversations([newConversation, ...conversations]);
    setActiveConversation(newConversation.id);
  };

  const handleDeleteConversation = (id: string) => {
    setConversations(conversations.filter(conv => conv.id !== id));
    if (activeConversation === id) {
      setActiveConversation(conversations[0]?.id || '');
    }
    setShowMenu(null);
  };

  const handleRenameConversation = (id: string) => {
    const newTitle = prompt('Enter new conversation title:');
    if (newTitle) {
      setConversations(conversations.map(conv => 
        conv.id === id ? { ...conv, title: newTitle } : conv
      ));
    }
    setShowMenu(null);
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
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`
                relative group rounded-lg p-3 cursor-pointer transition-all duration-200
                ${activeConversation === conversation.id 
                  ? 'bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }
              `}
              onClick={() => setActiveConversation(conversation.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <ChatBubbleLeftIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {conversation.title}
                    </h3>
                  </div>
                  
                  {conversation.lastMessage && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                      {conversation.lastMessage}
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
          ))}
        </div>

        {/* Empty state */}
        {conversations.length === 0 && (
          <div className="p-8 text-center">
            <ChatBubbleLeftIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              No conversations yet
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Start a new conversation to begin chatting with your AI assistant.
            </p>
            <button
              onClick={handleNewChat}
              className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 text-sm font-medium"
            >
              Start your first chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 