'use client';

import { useState } from 'react';
import type { Message } from '@/types/chat';
import { VoicePlayer } from './VoicePlayer';
import { ImageViewer } from './ImageViewer';
import { cn } from '@/lib/utils';
import { useChat } from '@/context/ChatContext';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const [viewerOpen, setViewerOpen] = useState(false);
  const { chatState } = useChat();
  const character = chatState.character;

  return (
    <>
      <div className={cn('flex gap-2 mb-4', isUser ? 'flex-row-reverse' : 'flex-row')}>
        {/* 头像 */}
        {isUser ? (
          <div className="w-10 h-10 rounded-full flex-shrink-0 bg-green-500 text-white flex items-center justify-center text-sm font-medium">
            我
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden">
            <img
              src={character?.avatar}
              alt={character?.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* 消息内容 */}
        <div className={cn('max-w-[70%]', isUser ? 'items-end' : 'items-start')}>
          {/* 文字消息 */}
          {message.content && (
            <div
              className={cn(
                'px-4 py-2 rounded-2xl text-sm leading-relaxed break-words',
                isUser
                  ? 'bg-[#95EC69] text-gray-900 rounded-br-sm'
                  : 'bg-white text-gray-900 rounded-bl-sm shadow-sm'
              )}
            >
              {message.content}
            </div>
          )}

          {/* 语音消息 */}
          {message.type === 'voice' && message.audioUri && (
            <div
              className={cn(
                'px-4 py-3 rounded-2xl min-w-[120px]',
                isUser
                  ? 'bg-[#95EC69] text-gray-900 rounded-br-sm'
                  : 'bg-white text-gray-900 rounded-bl-sm shadow-sm'
              )}
            >
              <VoicePlayer audioUrl={message.audioUri} />
            </div>
          )}

          {/* 图片消息 */}
          {message.type === 'image' && message.imageUri && (
            <div
              className={cn(
                'rounded-2xl overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]',
                isUser ? 'rounded-br-sm' : 'rounded-bl-sm'
              )}
              onClick={() => setViewerOpen(true)}
            >
              <div className="relative">
                <img
                  src={message.imageUri}
                  alt="发送的图片"
                  className="max-w-[240px] rounded-2xl object-cover"
                  loading="lazy"
                />
                {message.content && (
                  <div
                    className={cn(
                      'px-3 py-1.5 text-sm rounded-b-xl',
                      isUser ? 'bg-[#95EC69]/90 text-gray-900' : 'bg-white/90 text-gray-900'
                    )}
                  >
                    {message.content}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 图片查看器 */}
      {message.imageUri && (
        <ImageViewer
          open={viewerOpen}
          onClose={() => setViewerOpen(false)}
          src={message.imageUri}
          alt="图片预览"
        />
      )}
    </>
  );
}
