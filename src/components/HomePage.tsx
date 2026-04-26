'use client';

import { useChat } from '@/context/ChatContext';
import { CharacterSelect } from './CharacterSelect';
import { ChatScreen } from './ChatScreen';
import { characterList } from '@/data/characters';

export function HomePage() {
  const { chatState } = useChat();

  // 如果已选择角色，显示聊天界面
  if (chatState.character) {
    return <ChatScreen />;
  }

  // 否则显示角色选择界面
  return <CharacterSelect characters={characterList} />;
}
