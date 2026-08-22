import React, { useEffect, useState, useRef } from 'react';
import { chatService } from '../services/chatService';
import { ChatMessage } from '../types';
import { MessageBubble } from '../components/assistant/MessageBubble';
import { SuggestedPrompts } from '../components/assistant/SuggestedPrompts';
import { Button } from '../components/common/Button';
import { Send, Bot, Sparkles, Trash2, Database, Loader2 } from 'lucide-react';

export const AssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [includeRag, setIncludeRag] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchHistory = async () => {
    try {
      const history = await chatService.getChatHistory(50);
      setMessages(history);
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const userMessage = (textToSend || input).trim();
    if (!userMessage || isLoading) return;

    setInput('');
    const tempUserMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setIsLoading(true);

    try {
      const res = await chatService.sendMessage(
        userMessage,
        messages.map((m) => ({ role: m.role, content: m.content })),
        includeRag
      );

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.reply,
        sources: res.sources && res.sources.length > 0 ? JSON.stringify(res.sources) : null,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I encountered an error analyzing your request. Please verify your connection or try again.',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    if (confirm('Clear entire conversation history?')) {
      try {
        await chatService.clearChatHistory();
        setMessages([]);
      } catch (err) {
        console.error('Failed to clear chat:', err);
      }
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col rounded-2xl bg-[#111827]/80 border border-gray-800/80 backdrop-blur-md overflow-hidden">
      {/* Top Header */}
      <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              Ledger AI Financial Assistant
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
                Online & Context-Aware
              </span>
            </h3>
            <p className="text-[11px] text-gray-400">
              Query transactions, budgets, receipt line items & tax categories
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="hidden sm:flex items-center gap-2 text-xs text-gray-300 cursor-pointer bg-gray-900/80 px-3 py-1.5 rounded-lg border border-gray-700">
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span>RAG Document Search</span>
            <input
              type="checkbox"
              checked={includeRag}
              onChange={(e) => setIncludeRag(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-indigo-600 bg-gray-800 border-gray-700 focus:ring-indigo-500"
            />
          </label>

          {messages.length > 0 && (
            <button
              onClick={handleClear}
              title="Clear chat history"
              className="p-2 text-gray-400 hover:text-rose-400 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center max-w-xl mx-auto text-center space-y-6 py-8">
            <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">How can I assist your financial goals today?</h4>
              <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                I have full contextual understanding of your recorded expenses, monthly budgets, and uploaded receipt line items via RAG vector search.
              </p>
            </div>
            <div className="w-full">
              <SuggestedPrompts onSelectPrompt={(p) => handleSend(p)} />
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                role={msg.role}
                content={msg.content}
                sources={msg.sources}
                timestamp={msg.createdAt}
              />
            ))}
            {isLoading && (
              <div className="flex gap-3.5 max-w-3xl self-start">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl bg-[#111827] border border-gray-800 text-xs text-indigo-400 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing transactions & querying RAG receipt vectors...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Box */}
      <div className="p-4 border-t border-gray-800 bg-gray-900/50">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-3"
        >
          <input
            type="text"
            placeholder="Ask about spending, compare categories, find receipts..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-xl bg-gray-950 border border-gray-700 text-white text-sm placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
          />
          <Button
            type="submit"
            variant="glow"
            size="md"
            disabled={!input.trim() || isLoading}
            isLoading={isLoading}
            leftIcon={<Send className="w-4 h-4" />}
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};
