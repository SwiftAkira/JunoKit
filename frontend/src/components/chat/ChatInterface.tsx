import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  PaperAirplaneIcon,
  PhotoIcon,
  PaperClipIcon,
  FaceSmileIcon,
  StopIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  status: 'sending' | 'sent' | 'error';
  type: 'text' | 'image' | 'file';
}

// Mock messages for demo
const mockMessages: Message[] = [
  {
    id: '1',
    content: `Hello! I'm your AI assistant. I'm here to help you with development, operations, and any technical challenges you're facing. What can I help you with today?`,
    sender: 'ai',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    status: 'sent',
    type: 'text'
  },
  {
    id: '2',
    content: 'Hi! I need help deploying a Lambda function to AWS. Can you guide me through the process?',
    sender: 'user',
    timestamp: new Date(Date.now() - 1000 * 60 * 4),
    status: 'sent',
    type: 'text'
  },
  {
    id: '3',
    content: `Absolutely! I'd be happy to help you deploy a Lambda function. Let me walk you through the process step by step:

1. **Prepare your code**: Make sure your function is properly structured
2. **Create deployment package**: Zip your code and dependencies
3. **Configure IAM roles**: Set up proper permissions
4. **Deploy using AWS CLI or Console**: Choose your preferred method

Which deployment method would you prefer to use? AWS CLI, AWS Console, or perhaps AWS CDK/CloudFormation for infrastructure as code?`,
    sender: 'ai',
    timestamp: new Date(Date.now() - 1000 * 60 * 3),
    status: 'sent',
    type: 'text'
  }
];

const RetroGrid = () => {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-30 dark:opacity-20 pointer-events-none">
      <div className="absolute inset-0 [transform:rotateX(35deg)]">
        <div className="animate-grid [background-image:linear-gradient(to_right,rgba(99,102,241,0.3)_1px,transparent_0),linear-gradient(to_bottom,rgba(99,102,241,0.3)_1px,transparent_0)] [background-repeat:repeat] [background-size:60px_60px] [height:300vh] [inset:0%_0px] [margin-left:-200%] [transform-origin:100%_0_0] [width:600vw]" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent dark:from-gray-900" />
    </div>
  );
};

export function ChatInterface() {
  // Mock user data for testing
  const mockUser = { firstName: 'Demo', username: 'demo-user' };
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isGenerating) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date(),
      status: 'sent',
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsGenerating(true);
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      setIsTyping(false);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I understand you're asking about "${userMessage.content}". I'm here to help! This is a demo response - in the real implementation, this would connect to OpenRouter for actual AI responses.`,
        sender: 'ai',
        timestamp: new Date(),
        status: 'sent',
        type: 'text'
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsGenerating(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const stopGeneration = () => {
    setIsGenerating(false);
    setIsTyping(false);
  };

  return (
    <div className="h-full flex flex-col relative bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Background Grid */}
      <RetroGrid />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10">
        {/* Welcome Message */}
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
                <span className="text-xs">🤖</span>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              AI Assistant
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your intelligent AI companion for any task or question
            </p>
          </div>
        </div>

        {/* Messages */}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
              {/* Avatar */}
              <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden">
                {message.sender === 'ai' ? (
                  <Image
                    src="/JunoKitColorNoBGNoTEXT.png"
                    alt="AI"
                    width={32}
                    height={32}
                    className="w-full h-full object-contain bg-white rounded-full p-1"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium">
                    {mockUser.firstName[0].toUpperCase()}
                  </div>
                )}
              </div>

              {/* Message Bubble */}
              <div className={`
                relative px-4 py-3 rounded-2xl max-w-full
                ${message.sender === 'user' 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white ml-2' 
                  : 'bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 text-gray-900 dark:text-white mr-2'
                }
              `}>
                <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                  {message.content}
                </div>
                <div className={`text-xs mt-2 ${message.sender === 'user' ? 'text-purple-100' : 'text-gray-500 dark:text-gray-400'}`}>
                  {formatTimestamp(message.timestamp)}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-end space-x-2 max-w-[80%]">
              <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden">
                <Image
                  src="/JunoKitColorNoBGNoTEXT.png"
                  alt="AI"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain bg-white rounded-full p-1"
                />
              </div>
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl px-4 py-3 mr-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-3">
            {/* Attachment buttons */}
            <div className="flex space-x-1">
              <button
                className="p-2 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Attach file"
              >
                <PaperClipIcon className="h-5 w-5" />
              </button>
              <button
                className="p-2 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Attach image"
              >
                <PhotoIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Input field */}
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask your AI assistant anything..."
                className="w-full resize-none rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 pr-12 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all max-h-32 min-h-[48px]"
                rows={1}
                disabled={isGenerating}
              />
              <button
                className="absolute right-2 bottom-2 p-1 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                aria-label="Add emoji"
              >
                <FaceSmileIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Send/Stop button */}
            {isGenerating ? (
              <button
                onClick={stopGeneration}
                className="flex-shrink-0 bg-red-500 hover:bg-red-600 text-white p-3 rounded-xl transition-colors focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                aria-label="Stop generation"
              >
                <StopIcon className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="flex-shrink-0 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-400 text-white p-3 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                aria-label="Send message"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Helper text */}
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </div>
    </div>
  );
} 