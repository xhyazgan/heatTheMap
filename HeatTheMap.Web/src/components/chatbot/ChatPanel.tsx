import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from './ChatMessage';
import { useChat } from '../../hooks/useChat';
import { useFilterStore } from '../../stores/useFilterStore';
import { ChatMessage as ChatMessageType } from '../../types';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { selectedStore } = useFilterStore();
  const { mutate: sendMessage, isPending } = useChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedStore || isPending) return;

    const userMessage: ChatMessageType = {
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    sendMessage(
      { query: input, storeId: selectedStore },
      {
        onSuccess: (response) => {
          const assistantMessage: ChatMessageType = {
            role: 'assistant',
            content: response.message,
          };
          setMessages((prev) => [...prev, assistantMessage]);
        },
        onError: () => {
          const errorMessage: ChatMessageType = {
            role: 'assistant',
            content: 'Sorry, I encountered an error. Please try again.',
          };
          setMessages((prev) => [...prev, errorMessage]);
        },
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] card flex flex-col shadow-2xl z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div>
          <h3 className="text-white font-semibold">Analytics Assistant</h3>
          <p className="text-xs text-gray-400">Ask me about your store data</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            <p className="mb-4">Hi! I'm your analytics assistant.</p>
            <p className="text-sm">Try asking:</p>
            <ul className="text-sm space-y-2 mt-2">
              <li>"How was today?"</li>
              <li>"What were the busiest hours?"</li>
              <li>"Compare to last week"</li>
            </ul>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
            {isPending && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-700 rounded-lg px-4 py-2">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
        {!selectedStore && (
          <p className="text-xs text-yellow-500 mb-2">Please select a store first</p>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your store..."
            className="input flex-1 text-sm"
            disabled={isPending || !selectedStore}
          />
          <button
            type="submit"
            disabled={isPending || !input.trim() || !selectedStore}
            className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};
