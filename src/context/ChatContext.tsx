'use client';

import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import type { Character, Message, ChatState, ChatContextType } from '@/types/chat';
import { parseReply } from '@/utils/parseReply';
import { cleanTextForSpeech } from '@/utils/cleanText';

const initialState: ChatState = {
  character: null,
  messages: [],
  isTyping: false,
  isGeneratingImage: false,
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chatState, setChatState] = useState<ChatState>(initialState);
  const isGeneratingRef = useRef(false);
  const uidRef = useRef<string>('');

  // 生成用户唯一ID
  const getUid = useCallback(() => {
    if (!uidRef.current) {
      uidRef.current = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    return uidRef.current;
  }, []);

  // 选择角色
  const selectCharacter = useCallback((character: Character) => {
    setChatState({
      ...initialState,
      character,
    });
    uidRef.current = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // 重置聊天
  const resetChat = useCallback(() => {
    setChatState(initialState);
    uidRef.current = '';
  }, []);

  // 发送消息
  const sendMessage = useCallback(async (content: string) => {
    if (!chatState.character || isGeneratingRef.current) return;
    if (!content.trim()) return;

    isGeneratingRef.current = true;
    const uid = getUid();

    // 1. 添加用户消息
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      type: 'text',
      content: content.trim(),
      timestamp: Date.now(),
    };

    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isTyping: true,
    }));

    try {
      // 2. 构建对话历史
      const chatHistory = chatState.messages.map((msg) => ({
        role: msg.role === 'character' ? 'assistant' : 'user',
        content: msg.content,
      }));
      chatHistory.push({ role: 'user', content: content.trim() });

      // 3. 调用 LLM
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: chatState.character.id,
          systemPrompt: chatState.character.systemPrompt,
          messages: chatHistory,
        }),
      });

      if (!chatResponse.ok) {
        throw new Error('Chat API failed');
      }

      const { reply } = await chatResponse.json();

      // 4. 解析回复
      const { text, imagePrompt } = parseReply(reply);

      // 5. 添加角色文字消息
      const characterMessage: Message = {
        id: `char-${Date.now()}`,
        role: 'character',
        type: 'text',
        content: text,
        timestamp: Date.now(),
      };

      setChatState((prev) => ({
        ...prev,
        messages: [...prev.messages, characterMessage],
        isTyping: false,
      }));

// 统计最近发送的图片数量，用于限制发图频率
const IMAGE_COOLDOWN_MESSAGES = 10; // 约5轮对话（每轮2条消息）

      // 6. 并行生成语音和图片
      const cleanText = cleanTextForSpeech(text);

      // 语音生成
      if (cleanText) {
        generateVoice(cleanText, chatState.character.speaker, uid, characterMessage.id);
      }

      // 图片生成检查
      // 检查用户是否明确要求看照片
      const userMessage = content.toLowerCase();
      const isPhotoRequest = 
        userMessage.includes('想看你') ||
        userMessage.includes('发照片') ||
        userMessage.includes('发自拍') ||
        userMessage.includes('你在干嘛') ||
        userMessage.includes('发个') ||
        userMessage.includes('给我看');

      // 检查最近是否已经发过图
      const recentMessages = chatState.messages.slice(-IMAGE_COOLDOWN_MESSAGES);
      const recentImageCount = recentMessages.filter((m) => m.imageUri).length;
      const canSendImage = recentImageCount < 1; // 最近10条消息中最多1张图

      // 只有在用户明确要求或可以发图时才生成图片
      if (imagePrompt && (isPhotoRequest || canSendImage)) {
        generateImage(imagePrompt, chatState.character, uid, characterMessage.id);
      }
    } catch (error) {
      console.error('Send message error:', error);
      
      // 失败时显示默认回复
      const errorMessage: Message = {
        id: `char-${Date.now()}`,
        role: 'character',
        type: 'text',
        content: '网络不太好，等一下再试试～',
        timestamp: Date.now(),
      };

      setChatState((prev) => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
        isTyping: false,
      }));
    } finally {
      isGeneratingRef.current = false;
    }
  }, [chatState.character, chatState.messages, getUid]);

  // 生成语音
  const generateVoice = async (text: string, speaker: string, uid: string, messageId: string) => {
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, speaker, uid }),
      });

      if (!response.ok) return;

      const { audioUri } = await response.json();

      // 更新消息的音频URL
      setChatState((prev) => ({
        ...prev,
        messages: prev.messages.map((msg) =>
          msg.id === messageId ? { ...msg, type: 'voice', audioUri } : msg
        ),
      }));
    } catch (error) {
      console.error('TTS error:', error);
    }
  };

  // 生成图片
  const generateImage = async (
    prompt: string,
    character: Character,
    uid: string,
    messageId: string
  ) => {
    setChatState((prev) => ({ ...prev, isGeneratingImage: true }));

    try {
      // 增强 prompt，保持角色一致性
      const enhancedPrompt = `${prompt}。画风要求：动漫风格，高质量，精细，${character.appearance}。不要出现文字。`;

      const response = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: enhancedPrompt, uid }),
      });

      if (!response.ok) {
        throw new Error('Image API failed');
      }

      const { imageUri } = await response.json();

      // 更新消息的图片信息
      setChatState((prev) => ({
        ...prev,
        messages: prev.messages.map((msg) =>
          msg.id === messageId
            ? { ...msg, type: 'image', imageUri, imagePrompt: prompt }
            : msg
        ),
      }));
    } catch (error) {
      console.error('Image generation error:', error);
    } finally {
      setChatState((prev) => ({ ...prev, isGeneratingImage: false }));
    }
  };

  const value: ChatContextType = {
    chatState,
    selectCharacter,
    sendMessage,
    resetChat,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat(): ChatContextType {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
