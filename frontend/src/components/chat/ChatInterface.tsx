'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MarkdownRenderer } from './MarkdownRenderer';
import { RealtimeChatStatus } from '@/components/chat/RealtimeChatStatus';
import Image from 'next/image';
import { 
  PaperAirplaneIcon,
  StopIcon,
  PaperClipIcon,
  PhotoIcon,
  FaceSmileIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  HeartIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ShareIcon,
  ClipboardIcon,
  ArrowPathIcon,
  CommandLineIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  MicrophoneIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartIconSolid,
  HandThumbUpIcon as HandThumbUpIconSolid,
  HandThumbDownIcon as HandThumbDownIconSolid 
} from '@heroicons/react/24/solid';

// Enhanced Message interface with reactions and metadata
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  status: 'sending' | 'sent' | 'error';
  type: 'text' | 'image' | 'file' | 'code';
  reactions: {
    like: number;
    love: number;
    dislike: number;
    userReaction: 'like' | 'love' | 'dislike' | null;
  };
  metadata?: {
    model?: string;
    tokens?: number;
    duration?: number;
  };
}

// Enhanced typing bar states
type TypingMode = 'normal' | 'code' | 'voice' | 'search';

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

interface ChatInterfaceProps {
  activeConversationId?: string;
  onConversationCreated?: (conversationId: string) => void;
}

export function ChatInterface({ activeConversationId, onConversationCreated }: ChatInterfaceProps) {
  const { user } = useAuth();
  
  // Core chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // Enhanced features state
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [typingMode, setTypingMode] = useState<TypingMode>('normal');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Mock user data for testing
  const mockUser = {
    firstName: 'Demo',
    username: 'demo-user'
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversation messages when activeConversationId changes
  useEffect(() => {
    if (activeConversationId) {
      loadConversationMessages(activeConversationId);
    } else {
      setMessages([]);
    }
  }, [activeConversationId]);

  // Filter messages based on search
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = messages.filter(msg => 
        msg.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMessages(filtered);
    } else {
      setFilteredMessages(messages);
    }
  }, [searchQuery, messages]);

  // Focus search input when search is opened
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  const loadConversationMessages = async (conversationId: string) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo-token', // Temporary auth for testing
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Check if we have a specific conversation ID
        if (conversationId) {
          // Filter and sort messages for this specific conversation
          const conversationMessages = data.conversations
            .filter((item: any) => 
              item.SK && 
              item.SK.startsWith('MSG#') && 
              item.conversationId === conversationId &&
              (item.role === 'user' || item.role === 'assistant')
            )
            .sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
            .map((item: any, index: number) => ({
              id: item.SK.replace('MSG#', ''),
              content: item.content,
              sender: item.role === 'user' ? 'user' : 'ai',
              timestamp: new Date(item.timestamp),
              status: 'sent' as const,
              type: 'text' as const,
              reactions: {
                like: Math.floor(Math.random() * 3),
                love: Math.floor(Math.random() * 2), 
                dislike: 0,
                userReaction: null
              },
              metadata: item.role === 'assistant' ? {
                model: item.model || 'Junokit AI',
                tokens: item.tokens || Math.floor(Math.random() * 500) + 100,
                duration: Math.floor(Math.random() * 3000) + 500
              } : undefined
            }));

          setMessages(conversationMessages);
        } else {
          // Clear messages for new conversation
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('Error loading conversation messages:', error);
      setMessages([]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    
    // Auto-resize textarea with better sizing
    const textarea = e.target;
    textarea.style.height = 'auto';
    
    // Set minimum height for comfortable typing (about 2 lines)
    const minHeight = 60;
    // Set maximum height to allow reading paragraphs but not take over screen (about 10 lines)
    const maxHeight = 300;
    
    const newHeight = Math.max(minHeight, Math.min(textarea.scrollHeight, maxHeight));
    textarea.style.height = `${newHeight}px`;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isGenerating) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
      type: typingMode === 'code' ? 'code' : 'text',
      reactions: { like: 0, love: 0, dislike: 0, userReaction: null }
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsGenerating(true);
    setIsTyping(true);
    
    // Reset input height to minimum
    if (inputRef.current) {
      inputRef.current.style.height = '60px';
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo-token', // Temporary auth for testing
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationId: activeConversationId,
          model: 'default'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Mark user message as sent
        setMessages(prev => prev.map(msg => 
          msg.id === userMessage.id ? { ...msg, status: 'sent' as const } : msg
        ));

        // Add AI response
        const aiMessage: Message = {
          id: data.aiMessage.messageId,
          content: data.aiMessage.content,
          sender: 'ai',
          timestamp: new Date(data.aiMessage.timestamp),
          status: 'sent',
          type: 'text',
          reactions: { like: 0, love: 0, dislike: 0, userReaction: null },
          metadata: {
            model: data.aiMessage.model || 'Junokit AI',
            tokens: data.aiMessage.tokens || 150,
            duration: 1200
          }
        };

        setMessages(prev => [...prev, aiMessage]);

        // Update active conversation if needed
        if (!activeConversationId && onConversationCreated) {
          onConversationCreated(data.conversationId);
        }
      } else {
        // Handle error
        setMessages(prev => prev.map(msg => 
          msg.id === userMessage.id ? { ...msg, status: 'error' as const } : msg
        ));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: 'error' as const } : msg
      ));
    } finally {
      setIsGenerating(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMessageReaction = (messageId: string, reaction: 'like' | 'love' | 'dislike') => {
    // Find the message to check if user can react
    const message = messages.find(m => m.id === messageId);
    if (!message || message.sender === 'user') {
      return; // Prevent users from reacting to their own messages
    }

    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const currentReaction = msg.reactions.userReaction;
        const reactions = { ...msg.reactions };
        
        // Remove previous reaction
        if (currentReaction) {
          reactions[currentReaction] = Math.max(0, reactions[currentReaction] - 1);
        }
        
        // Add new reaction if different
        if (currentReaction !== reaction) {
          reactions[reaction] = reactions[reaction] + 1;
          reactions.userReaction = reaction;
        } else {
          reactions.userReaction = null;
        }
        
        return { ...msg, reactions };
      }
      return msg;
    }));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add toast notification here
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const stopGeneration = () => {
    setIsGenerating(false);
    setIsTyping(false);
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    setSearchQuery('');
  };

  const getTypingModeIcon = (mode: TypingMode) => {
    switch (mode) {
      case 'code':
        return <CommandLineIcon className="h-4 w-4" />;
      case 'voice':
        return <MicrophoneIcon className="h-4 w-4" />;
      case 'search':
        return <MagnifyingGlassIcon className="h-4 w-4" />;
      default:
        return <ChatBubbleLeftRightIcon className="h-4 w-4" />;
    }
  };

  const getTypingModeBorder = (mode: TypingMode) => {
    switch (mode) {
      case 'code':
        return 'border-green-500 ring-green-500';
      case 'voice':
        return 'border-red-500 ring-red-500';
      case 'search':
        return 'border-blue-500 ring-blue-500';
      default:
        return 'border-purple-500 ring-purple-500';
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles((prev: File[]) => [...prev, ...files]);
    
    // Add file info to input
    const fileInfo = files.map(file => 
      `[File: ${file.name} (${(file.size / 1024).toFixed(1)}KB)]`
    ).join(' ');
    
    setInputValue((prev: string) => prev + (prev ? ' ' : '') + fileInfo);
    
    // Reset input value to allow selecting same file again
    event.target.value = '';
  };

  // Open template modal
  const openTemplateModal = () => {
    setShowTemplateModal(true);
  };

  // Handle template selection
  const selectTemplate = (template: string) => {
    setInputValue(template);
    setShowTemplateModal(false);
  };

  // Copy message content
  const copyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      console.log('Message copied to clipboard');
      // TODO: Show toast notification
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  // Regenerate message
  const regenerateMessage = async (messageId: string) => {
    console.log('Regenerating message:', messageId);
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex > 0) {
      const userMessage = messages[messageIndex - 1];
      if (userMessage.sender === 'user') {
        setInputValue(userMessage.content);
        // Remove messages from this point onwards
        setMessages(messages.slice(0, messageIndex - 1));
      }
    }
  };

  // Initialize speech recognition
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = 'en-US';
        
        recognitionInstance.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputValue(prev => prev + (prev ? ' ' : '') + transcript);
          setIsListening(false);
        };
        
        recognitionInstance.onerror = () => {
          setIsListening(false);
        };
        
        recognitionInstance.onend = () => {
          setIsListening(false);
        };
        
        setRecognition(recognitionInstance);
      }
    }
  }, []);

  // Voice input functions
  const startVoiceInput = () => {
    if (recognition && !isListening) {
      setIsListening(true);
      recognition.start();
    }
  };

  const stopVoiceInput = () => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  };

  // Toggle voice input
  const toggleVoiceInput = () => {
    if (isListening) {
      stopVoiceInput();
    } else {
      startVoiceInput();
    }
  };

  // Settings modal
  const openSettings = () => {
    setShowSettings(true);
  };

  return (
    <div className="h-full flex flex-col relative bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Background Grid */}
      <RetroGrid />

      {/* Enhanced Search Bar */}
      {showSearch && (
        <div className="border-b border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-4 relative z-20">
          <div className="max-w-4xl mx-auto flex items-center space-x-3">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={toggleSearch}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          {searchQuery && (
            <div className="max-w-4xl mx-auto mt-2 text-sm text-gray-600 dark:text-gray-400">
              Found {filteredMessages.length} message{filteredMessages.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10 custom-scrollbar">
        {/* Welcome Message - Only show when no messages */}
        {messages.length === 0 && (
          <div className="flex justify-center mb-8">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 max-w-md text-center">
              <div className="w-16 h-16 mx-auto mb-4 relative">
                <Image
                  src="/JunoKitColorNoBGNoTEXT.png"
                  alt="Junokit AI"
                  width={64}
                  height={64}
                  className="w-full h-full object-contain"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                  <SparklesIcon className="h-3 w-3 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Junokit AI Assistant
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Ready to help with coding, projects, and more
              </p>
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 dark:text-gray-500">
                <div className="flex items-center space-x-1">
                  <CommandLineIcon className="h-3 w-3" />
                  <span>Code mode</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MagnifyingGlassIcon className="h-3 w-3" />
                  <span>Search</span>
                </div>
                <div className="flex items-center space-x-1">
                  <HeartIcon className="h-3 w-3" />
                  <span>Reactions</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Messages with Reactions */}
        {(showSearch ? filteredMessages : messages).map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} group`}
          >
            <div className={`flex max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-2`}>
              {/* Avatar */}
              <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-visible mt-1 relative">
                {message.sender === 'ai' ? (
                  <div className="relative">
                    <div className="w-6 h-6 bg-white rounded-full absolute top-1 left-1 z-0"></div>
                    <Image
                      src="/JunoKitColorNoBGNoTEXT.png"
                      alt="AI"
                      width={32}
                      height={32}
                      className="w-8 h-8 object-contain relative z-10"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium">
                    {mockUser.firstName[0].toUpperCase()}
                  </div>
                )}
              </div>

              {/* Message Container */}
              <div className={`flex flex-col ${message.sender === 'user' ? 'items-end mr-2' : 'items-start ml-2'}`}>
                {/* Message Bubble */}
                <div className={`
                  relative px-4 py-3 rounded-2xl max-w-full group-hover:shadow-lg transition-all duration-200
                  ${message.sender === 'user' 
                    ? message.type === 'code'
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 text-gray-900 dark:text-white'
                  }
                  ${message.status === 'error' ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : ''}
                `}>
                  {/* Message Content */}
                  <div className="text-sm leading-relaxed">
                    {message.sender === 'ai' ? (
                      <MarkdownRenderer content={message.content} />
                    ) : (
                      <div className={`whitespace-pre-wrap break-words ${message.type === 'code' ? 'font-mono' : ''}`}>
                        {message.content}
                      </div>
                    )}
                  </div>
                  
                  {/* Message Status & Metadata */}
                  <div className="flex items-center justify-between mt-2">
                    <div className={`text-xs ${message.sender === 'user' ? 'text-purple-100' : 'text-gray-500 dark:text-gray-400'}`}>
                      {formatTimestamp(message.timestamp)}
                      {message.metadata && (
                        <span className="ml-2">
                          • {message.metadata.model} • {message.metadata.tokens} tokens
                        </span>
                      )}
                    </div>
                    
                    {message.status === 'sending' && (
                      <div className="flex space-x-1 ml-2">
                        <div className="w-1 h-1 bg-current rounded-full animate-bounce"></div>
                        <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Message Actions & Reactions */}
                <div className={`flex items-center mt-2 space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Reaction Buttons - Only for AI messages */}
                  {message.sender === 'ai' && (
                    <div className="flex items-center space-x-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-2 py-1 border border-gray-200/50 dark:border-gray-700/50">
                    <button
                      onClick={() => handleMessageReaction(message.id, 'like')}
                      className={`p-1 rounded-full transition-colors ${message.reactions.userReaction === 'like' ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'}`}
                                          >
                        {message.reactions.userReaction === 'like' ? (
                          <HandThumbUpIconSolid className="h-3 w-3" />
                        ) : (
                          <HandThumbUpIcon className="h-3 w-3" />
                        )}
                      </button>
                      {message.reactions.like > 0 && (
                        <span className="text-xs text-gray-600 dark:text-gray-400">{message.reactions.like}</span>
                      )}
                      
                      <button
                        onClick={() => handleMessageReaction(message.id, 'love')}
                        className={`p-1 rounded-full transition-colors ${message.reactions.userReaction === 'love' ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                      >
                        {message.reactions.userReaction === 'love' ? (
                          <HeartIconSolid className="h-3 w-3" />
                        ) : (
                          <HeartIcon className="h-3 w-3" />
                        )}
                      </button>
                      {message.reactions.love > 0 && (
                        <span className="text-xs text-gray-600 dark:text-gray-400">{message.reactions.love}</span>
                      )}
                      
                      <button
                        onClick={() => handleMessageReaction(message.id, 'dislike')}
                        className={`p-1 rounded-full transition-colors ${message.reactions.userReaction === 'dislike' ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                      >
                        {message.reactions.userReaction === 'dislike' ? (
                          <HandThumbDownIconSolid className="h-3 w-3" />
                        ) : (
                          <HandThumbDownIcon className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => copyMessage(message.content)}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Copy message"
                    >
                      <ClipboardIcon className="h-3 w-3" />
                    </button>
                    
                    {message.sender === 'ai' && (
                      <button
                        onClick={() => regenerateMessage(message.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Regenerate response"
                      >
                        <ArrowPathIcon className="h-3 w-3" />
                      </button>
                    )}
                    
                    <button
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="More actions"
                    >
                      <EllipsisHorizontalIcon className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Enhanced Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start group">
            <div className="flex items-start space-x-2 max-w-[80%]">
              <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-visible mt-1 relative">
                <div className="relative">
                  <div className="w-6 h-6 bg-white rounded-full absolute top-1 left-1 z-0"></div>
                  <Image
                    src="/JunoKitColorNoBGNoTEXT.png"
                    alt="AI"
                    width={32}
                    height={32}
                    className="w-8 h-8 object-contain relative z-10"
                  />
                </div>
              </div>
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl px-4 py-3 ml-2">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <SparklesIcon className="h-4 w-4 text-purple-400 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Completely Redesigned Enhanced Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md relative z-10">
        {/* Typing Mode Indicator */}
        {typingMode !== 'normal' && (
          <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm">
                {getTypingModeIcon(typingMode)}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {typingMode === 'code' && 'Code Mode'}
                  {typingMode === 'voice' && 'Voice Input'}
                  {typingMode === 'search' && 'Search Mode'}
                </span>
              </div>
              <button
                onClick={() => setTypingMode('normal')}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Main Input Container */}
        <div className="p-4">
          <div className="max-w-4xl mx-auto">
            {/* Input Field Container */}
            <div className={`
              relative bg-white dark:bg-gray-800 rounded-2xl border-2 transition-all duration-300 shadow-lg hover:shadow-xl
              ${inputFocused 
                ? `${getTypingModeBorder(typingMode)} shadow-lg` 
                : 'border-gray-200 dark:border-gray-600'
              }
              ${isGenerating ? 'opacity-75' : ''}
            `}>
              {/* Top Action Bar */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                {/* Left Actions */}
                <div className="flex items-center space-x-2">
                  {/* Mode Selector */}
                  <div className="flex items-center space-x-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => setTypingMode('normal')}
                      className={`p-2 rounded-md transition-all ${typingMode === 'normal' ? 'bg-white dark:bg-gray-600 shadow-sm text-purple-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                      title="Normal mode"
                    >
                      <ChatBubbleLeftRightIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setTypingMode('code')}
                      className={`p-2 rounded-md transition-all ${typingMode === 'code' ? 'bg-white dark:bg-gray-600 shadow-sm text-green-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                      title="Code mode"
                    >
                      <CommandLineIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={toggleVoiceInput}
                      className={`p-2 rounded-md transition-all ${isListening ? 'bg-red-100 dark:bg-red-900/20 text-red-600 animate-pulse' : 'text-gray-500 hover:text-red-600 dark:text-gray-400'}`}
                      title={isListening ? "Stop voice input" : "Start voice input"}
                    >
                      <MicrophoneIcon className={`h-4 w-4 ${isListening ? 'animate-pulse' : ''}`} />
                    </button>
                  </div>

                                     {/* Quick Actions */}
                   <div className="flex items-center space-x-1">
                     <input
                       type="file"
                       id="file-upload"
                       className="hidden"
                       multiple
                       accept="*/*"
                       onChange={handleFileUpload}
                     />
                     <button
                       onClick={() => document.getElementById('file-upload')?.click()}
                       className="p-2 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                       title="Upload files (images, documents, code, etc.)"
                     >
                       <PaperClipIcon className="h-4 w-4" />
                     </button>
                     <button
                       onClick={openTemplateModal}
                       className="p-2 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                       title="Message templates"
                     >
                       <DocumentTextIcon className="h-4 w-4" />
                     </button>
                   </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleSearch}
                    className={`p-2 rounded-lg transition-colors ${showSearch ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    title="Search messages"
                  >
                    <MagnifyingGlassIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={openSettings}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="Settings"
                  >
                    <Cog6ToothIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Input Field */}
              <div className="relative">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyPress}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  placeholder={
                    typingMode === 'code' 
                      ? "Write or paste your code here..." 
                      : typingMode === 'voice'
                      ? "Voice input is ready..."
                      : "Ask your AI assistant anything..."
                  }
                  className={`
                    w-full resize-none border-0 bg-transparent px-4 py-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-0 focus:outline-none transition-all custom-scrollbar-thin
                    ${typingMode === 'code' ? 'font-mono text-sm' : ''}
                  `}
                  rows={2}
                  disabled={isGenerating}
                />
                
                {/* Emoji Button */}
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="absolute right-4 bottom-4 p-1 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Add emoji"
                >
                  <FaceSmileIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Bottom Action Bar */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700">
                {/* Left Info */}
                <div className="flex items-center space-x-4">
                  <RealtimeChatStatus className="flex items-center space-x-2" />
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {typingMode === 'normal' && "Press Enter to send, Shift+Enter for new line"}
                    {typingMode === 'code' && "Code formatting enabled"}
                    {typingMode === 'voice' && "Click microphone to start recording"}
                  </div>
                </div>

                {/* Send Button */}
                <div className="flex items-center space-x-2">
                  {/* Character Count */}
                  {inputValue.length > 0 && (
                    <div className={`text-xs ${inputValue.length > 2000 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                      {inputValue.length}/4000
                    </div>
                  )}

                  {/* Voice Recording Button */}
                  {typingMode === 'voice' && (
                    <button
                      onClick={() => setIsRecording(!isRecording)}
                      className={`p-3 rounded-xl transition-all duration-200 transform hover:scale-105 focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                        isRecording
                          ? 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500 animate-pulse'
                          : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 focus:ring-gray-500'
                      }`}
                      title={isRecording ? "Stop recording" : "Start recording"}
                    >
                      <MicrophoneIcon className="h-5 w-5" />
                    </button>
                  )}

                  {/* Send/Stop Button */}
                  {isGenerating ? (
                    <button
                      onClick={stopGeneration}
                      className="flex-shrink-0 bg-red-500 hover:bg-red-600 text-white p-3 rounded-xl transition-all duration-200 transform hover:scale-105 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 shadow-lg"
                      title="Stop generation"
                    >
                      <StopIcon className="h-5 w-5" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim()}
                      className={`
                        flex-shrink-0 p-3 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 shadow-lg
                        ${typingMode === 'code'
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 text-white focus:ring-green-500'
                          : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-400 text-white focus:ring-purple-500'
                        }
                      `}
                      title="Send message"
                    >
                      <PaperAirplaneIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Message Templates</h3>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              {[
                {
                  title: "Code Review & Improvements",
                  content: "Please review this code and suggest improvements for performance, readability, and best practices. Here's my code:\n\n[Paste your code here]\n\nSpecifically, I'd like feedback on:\n- Performance optimizations\n- Code structure and organization\n- Best practices and conventions\n- Potential bugs or edge cases"
                },
                {
                  title: "Concept Explanation",
                  content: "Explain this concept in simple terms with practical examples and use cases:\n\n[Describe the concept you want explained]\n\nPlease include:\n- A clear, beginner-friendly explanation\n- Real-world examples\n- Common use cases\n- Any important gotchas or considerations"
                },
                {
                  title: "Debug Help",
                  content: "Help me debug this issue. Here's what I'm trying to do:\n[Describe your goal]\n\nHere's what's happening instead:\n[Describe the problem/error]\n\nHere's my code:\n[Paste your code]\n\nEnvironment details:\n[Operating system, language version, etc.]"
                },
                {
                  title: "Technology Comparison",
                  content: "What are the pros and cons of different approaches for implementing [specific feature]?\n\nI'm considering:\n- [Option 1]\n- [Option 2]\n- [Option 3]\n\nFor my use case: [describe your project/requirements]\n\nPlease compare them based on:\n- Performance\n- Learning curve\n- Community support\n- Long-term maintainability"
                },
                {
                  title: "Code Refactoring",
                  content: "Can you refactor this code to make it more maintainable, efficient, and follow modern best practices?\n\n[Paste your code here]\n\nPlease focus on:\n- Improving readability\n- Reducing complexity\n- Following design patterns\n- Optimizing performance\n- Adding proper error handling"
                },
                {
                  title: "Error Resolution",
                  content: "I'm getting this error:\n[Paste the exact error message]\n\nHere's my code:\n[Paste relevant code]\n\nHere's what I was trying to do:\n[Describe the intended behavior]\n\nEnvironment:\n- [Programming language and version]\n- [Framework/library versions]\n- [Operating system]"
                },
                {
                  title: "Implementation Guide",
                  content: "Create a step-by-step implementation guide for [specific feature] with code examples and explanations.\n\nRequirements:\n- [List your specific requirements]\n- [Target platform/technology]\n- [Any constraints or preferences]\n\nPlease include:\n- Detailed step-by-step instructions\n- Code examples for each step\n- Explanations of why each step is necessary\n- Common pitfalls to avoid"
                },
                {
                  title: "Architecture Advice",
                  content: "I'm designing [type of system/application] and need architecture advice.\n\nProject details:\n- [Describe your project]\n- [Expected scale/users]\n- [Key requirements]\n- [Technology constraints]\n\nPlease suggest:\n- Overall architecture approach\n- Technology stack recommendations\n- Design patterns to use\n- Scalability considerations\n- Security best practices"
                }
              ].map((template, index) => (
                <button
                  key={index}
                  onClick={() => selectTemplate(template.content)}
                  className="w-full text-left p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900 dark:text-white">{template.title}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Click to use</span>
                  </div>
                </button>
              ))}
            </div>
                     </div>
         </div>
       )}

       {/* Settings Modal */}
       {showSettings && (
         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
           <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Chat Settings</h3>
               <button
                 onClick={() => setShowSettings(false)}
                 className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
               >
                 <XMarkIcon className="h-5 w-5" />
               </button>
             </div>
             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                   Theme
                 </label>
                 <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                   <option>Auto</option>
                   <option>Light</option>
                   <option>Dark</option>
                 </select>
               </div>
                               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Default Model
                  </label>
                  <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option>Junokit AI</option>
                    <option disabled className="text-gray-400">GPT-4 (Coming Soon)</option>
                    <option disabled className="text-gray-400">Claude-3.5 Pro (Coming Soon)</option>
                    <option disabled className="text-gray-400">Gemini Pro (Coming Soon)</option>
                    <option disabled className="text-gray-400">LLaMA 3 (Coming Soon)</option>
                  </select>
                </div>
               <div className="flex items-center justify-between">
                 <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                   Auto-save conversations
                 </label>
                 <input type="checkbox" defaultChecked className="rounded" />
               </div>
               <div className="flex items-center justify-between">
                 <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                   Show typing indicators
                 </label>
                 <input type="checkbox" defaultChecked className="rounded" />
               </div>
             </div>
           </div>
         </div>
       )}


    </div>
  );
} 