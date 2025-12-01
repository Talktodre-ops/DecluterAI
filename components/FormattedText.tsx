import React from 'react';

// A simple component to render text with bolding and newlines
// Replaces **text** with <strong>text</strong>
export const FormattedText: React.FC<{ text: string }> = ({ text }) => {
  const processText = (input: string) => {
    const lines = input.split('\n');
    return lines.map((line, index) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <React.Fragment key={index}>
          <div className="min-h-[1.2em]">
             {parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={i} className="font-semibold text-slate-800">{part.slice(2, -2)}</strong>;
                }
                return <span key={i}>{part}</span>;
             })}
          </div>
        </React.Fragment>
      );
    });
  };

  return <div className="space-y-1 text-sm md:text-base leading-relaxed text-slate-700">{processText(text)}</div>;
};