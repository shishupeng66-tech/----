'use client';

import { useChat } from '@/context/ChatContext';
import { CharacterSelect } from './CharacterSelect';
import { ChatScreen } from './ChatScreen';
import { characterList } from '@/data/characters';
import LoginButton from './LoginButton';

export function HomePage() {
  const { chatState } = useChat();

  return (
    <div className="relative min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-end items-center px-6 py-3 pointer-events-none">
        <div className="pointer-events-auto">
          <LoginButton />
        </div>
      </header>
      {chatState.character ? <ChatScreen /> : <CharacterSelect characters={characterList} />}
    </div>
  );
}
