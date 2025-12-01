import React from 'react';
import { Message } from '../types';
import { BotIcon } from './Icons';
import { FormattedText } from './FormattedText';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6 group animate-fade-in-up`}>
      <div className={`flex max-w-[90%] md:max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
        
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 
          ${isUser ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'} shadow-sm`}>
          {isUser ? (
            <span className="text-xs font-bold">ME</span>
          ) : (
            <BotIcon className="w-5 h-5" />
          )}
        </div>

        {/* Bubble */}
        <div className={`relative px-4 py-3 rounded-2xl shadow-sm border
          ${isUser 
            ? 'bg-indigo-600 text-white border-indigo-500 rounded-br-none' 
            : 'bg-white text-slate-800 border-slate-100 rounded-bl-none'}
        `}>
          {/* Optional Image in Message */}
          {message.image && (
            <div className="mb-3 rounded-lg overflow-hidden border border-white/20">
              <img 
                src={`data:image/jpeg;base64,${message.image}`} 
                alt="Room upload" 
                className="max-h-60 w-auto object-cover"
              />
            </div>
          )}

          {/* Text Content */}
          <div className={isUser ? "text-indigo-50" : ""}>
             {isUser ? <p className="whitespace-pre-wrap">{message.text}</p> : <FormattedText text={message.text} />}
          </div>
          
          {/* Timestamp */}
          <div className={`text-[10px] mt-1 opacity-60 ${isUser ? 'text-right' : 'text-left'}`}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};