'use client';

import { Heart, Sparkles } from 'lucide-react';
import type { Character } from '@/types/chat';
import { Badge } from '@/components/ui/badge';
import { useChat } from '@/context/ChatContext';

interface CharacterSelectProps {
  characters: Character[];
}

export function CharacterSelect({ characters }: CharacterSelectProps) {
  const { selectCharacter } = useChat();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <div className="pt-16 pb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Heart className="w-8 h-8 text-pink-500 fill-pink-500" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            纸片人男友
          </h1>
          <Sparkles className="w-6 h-6 text-purple-500" />
        </div>
        <p className="text-gray-600 max-w-md mx-auto px-4">
          选择一位心动对象，开启一段专属的甜蜜聊天体验
        </p>
      </div>

      {/* Character Grid */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {characters.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              onSelect={() => selectCharacter(character)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface CharacterCardProps {
  character: Character;
  onSelect: () => void;
}

function CharacterCard({ character, onSelect }: CharacterCardProps) {
  // 根据角色ID生成不同的渐变色
  const gradientMap: Record<string, string> = {
    'warm-boy': 'from-amber-100 to-orange-100 hover:from-amber-200 hover:to-orange-200',
    'cool-guy': 'from-slate-100 to-gray-200 hover:from-slate-200 hover:to-gray-300',
    'sunshine': 'from-yellow-100 to-amber-100 hover:from-yellow-200 hover:to-amber-200',
    'artsy': 'from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200',
  };

  const avatarGradientMap: Record<string, string> = {
    'warm-boy': 'from-amber-400 to-orange-400',
    'cool-guy': 'from-slate-500 to-gray-600',
    'sunshine': 'from-yellow-400 to-amber-400',
    'artsy': 'from-purple-400 to-pink-400',
  };

  return (
    <button
      onClick={onSelect}
      className={`
        relative overflow-hidden rounded-3xl p-6 text-left
        bg-gradient-to-br ${gradientMap[character.id]}
        transition-all duration-300 ease-out
        hover:scale-[1.02] hover:shadow-xl
        group
      `}
    >
      {/* 装饰元素 */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10 flex items-start gap-4">
        {/* 头像 */}
        <div
          className={`
            w-20 h-20 rounded-full 
            overflow-hidden
            shadow-lg ring-4 ring-white/50
            group-hover:ring-white/80 transition-all
          `}
        >
          <img
            src={character.avatar}
            alt={character.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* 信息 */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-gray-900">
            {character.name}
          </h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {character.tagline}
          </p>

          {/* 标签 */}
          <div className="flex flex-wrap gap-1.5">
            {character.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs px-2 py-0.5 bg-white/60 backdrop-blur-sm"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* 点击提示 */}
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
          <Heart className="w-4 h-4 text-pink-500" />
          开始聊天
        </span>
      </div>
    </button>
  );
}
