import React from 'react';
import { Sparkles, DollarSign, Receipt, TrendingDown } from 'lucide-react';

interface SuggestedPromptsProps {
  onSelectPrompt: (prompt: string) => void;
}

export const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({ onSelectPrompt }) => {
  const prompts = [
    {
      icon: DollarSign,
      text: 'How much have I spent on Dining out this month compared to Groceries?',
    },
    {
      icon: Receipt,
      text: 'Find my receipt from Whole Foods and list the itemized line items.',
    },
    {
      icon: TrendingDown,
      text: 'What are my top 3 recurring subscriptions and how can I reduce them?',
    },
    {
      icon: Sparkles,
      text: 'Am I on track with the 50/30/20 budget framework this month?',
    },
  ];

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Suggested AI Inquiries:</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {prompts.map((p, idx) => {
          const Icon = p.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(p.text)}
              className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-900/60 hover:bg-gray-800/80 border border-gray-800 hover:border-indigo-500/40 text-left text-xs text-gray-300 hover:text-white transition-all group"
            >
              <Icon className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="leading-relaxed">{p.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
