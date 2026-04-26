'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, MoreHorizontal, Send } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ChatScreen() {
  const { chatState, sendMessage, resetChat } = useChat();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const character = chatState.character;

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatState.messages, chatState.isTyping]);

  // 聚焦输入框
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = () => {
    if (!inputValue.trim() || chatState.isTyping) return;
    sendMessage(inputValue);
    setInputValue('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!character) return null;

  return (
    <div className="min-h-screen bg-[#EDEDED] flex flex-col">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={resetChat}
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          {/* 头像 */}
          <div
            className={`
              w-10 h-10 rounded-full 
              overflow-hidden
            `}
          >
            <img
              src={character.avatar}
              alt={character.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* 名称和状态 */}
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-gray-900 truncate">{character.name}</h1>
            <p className="text-xs text-green-500 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              在线
            </p>
          </div>

          <Button variant="ghost" size="icon" className="hover:bg-gray-100">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* 消息区域 */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-xl mx-auto py-4 px-3">
          {/* 欢迎消息 */}
          {chatState.messages.length === 0 && (
            <div className="text-center py-8">
              <div
                className={`
                  w-20 h-20 mx-auto rounded-full mb-4
                  overflow-hidden
                `}
              >
                <img
                  src={character.avatar}
                  alt={character.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {character.name}
              </h2>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">
                {character.tagline}
              </p>
              <p className="text-xs text-gray-400 mt-4">
                开始你们的第一段对话吧
              </p>
            </div>
          )}

          {/* 消息列表 */}
          {chatState.messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {/* 正在输入指示器 */}
          <TypingIndicator />

          {/* 图片生成中 */}
          {chatState.isGeneratingImage && (
            <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              正在生成图片...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* 输入区域 */}
      <footer className="bg-white border-t border-gray-200 sticky bottom-0">
        <div className="max-w-xl mx-auto px-3 py-3">
          <div className="flex items-center gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入消息..."
              disabled={chatState.isTyping}
              className="flex-1 bg-gray-100 border-none focus-visible:ring-1 focus-visible:ring-pink-300 rounded-full px-4"
            />
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || chatState.isTyping}
              className="rounded-full w-10 h-10 p-0 bg-pink-500 hover:bg-pink-600"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
