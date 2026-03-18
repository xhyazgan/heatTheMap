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
            content: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.',
          };
          setMessages((prev) => [...prev, errorMessage]);
        },
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-3xl flex flex-col shadow-2xl shadow-black/50 z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">AI Asistan</h3>
            <p className="text-xs text-gray-500">Mağaza verilerinizi sorun</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-white hover:bg-white/5 rounded-xl p-1.5 transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <p className="mb-3 text-sm">Merhaba! Analitik asistanınızım.</p>
            <p className="text-xs text-gray-600 mb-2">Şunları sorabilirsiniz:</p>
            <div className="space-y-1.5">
              <p className="text-xs text-gray-500 bg-white/5 rounded-lg px-3 py-1.5 inline-block">"Bugün nasıldı?"</p>
              <p className="text-xs text-gray-500 bg-white/5 rounded-lg px-3 py-1.5 inline-block">"En yoğun saatler?"</p>
              <p className="text-xs text-gray-500 bg-white/5 rounded-lg px-3 py-1.5 inline-block">"Geçen hafta ile karşılaştır"</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
            {isPending && (
              <div className="flex justify-start mb-4">
                <div className="bg-white/5 rounded-2xl px-4 py-3">
                  <div className="flex space-x-1.5">
                    <div className="w-1.5 h-1.5 bg-primary-400/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-primary-400/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-primary-400/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/5">
        {!selectedStore && (
          <p className="text-xs text-amber-400/80 mb-2">Lütfen önce bir mağaza seçin</p>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Mağazanız hakkında sorun..."
            className="input flex-1 text-sm"
            disabled={isPending || !selectedStore}
          />
          <button
            type="submit"
            disabled={isPending || !input.trim() || !selectedStore}
            className="btn-primary text-sm px-4 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};
