import React, { useState } from 'react';
import { Bot, User, FileText, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { ChatSourceCitation } from '../../types';

interface MessageBubbleProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: string | null;
  timestamp?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  role,
  content,
  sources,
}) => {
  const isAssistant = role === 'assistant';
  const [showSources, setShowSources] = useState(false);

  let parsedSources: ChatSourceCitation[] = [];
  if (sources) {
    try {
      parsedSources = typeof sources === 'string' ? JSON.parse(sources) : sources;
    } catch {}
  }

  return (
    <div className={clsx('flex gap-3.5 max-w-3xl', isAssistant ? 'self-start' : 'self-end flex-row-reverse')}>
      {/* Avatar */}
      <div
        className={clsx(
          'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md',
          isAssistant
            ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white'
            : 'bg-emerald-600 text-white'
        )}
      >
        {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
      </div>

      {/* Bubble Container */}
      <div className="space-y-2 max-w-[88%]">
        <div
          className={clsx(
            'p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap',
            isAssistant
              ? 'bg-[#111827] border border-gray-800 text-gray-200 shadow-md'
              : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
          )}
        >
          {content}
        </div>

        {/* RAG Source Citations Pill & Accordion */}
        {isAssistant && parsedSources.length > 0 && (
          <div className="pt-1">
            <button
              onClick={() => setShowSources(!showSources)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-xs font-medium transition-colors"
            >
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>Cited from {parsedSources.length} Receipt / Doc{parsedSources.length > 1 ? 's' : ''}</span>
              {showSources ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
            </button>

            {showSources && (
              <div className="mt-2 space-y-2 p-3 rounded-xl bg-gray-900/80 border border-gray-800 text-xs">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                  Retrieved Vector Chunks (RAG):
                </p>
                {parsedSources.map((src, i) => (
                  <div key={i} className="p-2 bg-gray-950/60 rounded-lg border border-gray-800/80">
                    <div className="flex items-center justify-between text-indigo-400 font-medium mb-1">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {src.merchant || src.filename}
                      </span>
                      <span className="text-[10px] bg-indigo-500/20 px-1.5 py-0.2 rounded text-indigo-300">
                        {src.score}% Relevance
                      </span>
                    </div>
                    <p className="text-gray-400 text-[11px] font-mono leading-relaxed line-clamp-2">
                      {src.textSnippet}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
