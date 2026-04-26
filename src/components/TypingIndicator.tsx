'use client';

import { useChat } from '@/context/ChatContext';

export function TypingIndicator() {
  const { chatState } = useChat();

  if (!chatState.isTyping) return null;

  const characterName = chatState.character?.name || '对方';

  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex gap-1">
        <span
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: '0ms' }}
        />
        <span
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: '150ms' }}
        />
        <span
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: '300ms' }}
        />
      </div>
      <span className="text-xs text-gray-500">{characterName}正在输入...</span>
    </div>
  );
}
