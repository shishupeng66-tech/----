'use client';

import { useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type Variants,
} from "motion/react";
import {
  Github,
  Linkedin,
  Mail,
  MapPin,
  Sparkles,
  Twitter,
  Heart,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Character } from '@/types/chat';
import { useChat } from '@/context/ChatContext';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.6, 0.05, 0.01, 0.9],
    },
  },
};

interface CharacterCardProps {
  character: Character;
  onSelect: () => void;
}

function CharacterCard({ character, onSelect }: CharacterCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const shouldReduceMotion = useReducedMotion();

  // 根据角色ID生成不同的渐变色和装饰
  const configMap: Record<string, { gradient: string; location: string }> = {
    'warm-boy': { gradient: "from-amber-500/20 via-orange-500/10 to-transparent", location: "大学校园" },
    'cool-guy': { gradient: "from-slate-500/20 via-gray-500/10 to-transparent", location: "CBD 办公室" },
    'sunshine': { gradient: "from-yellow-500/20 via-amber-500/10 to-transparent", location: "邻里社区" },
    'artsy': { gradient: "from-purple-500/20 via-pink-500/10 to-transparent", location: "深夜工作室" },
  };

  const config = configMap[character.id] || { gradient: "from-white/10 via-white/5 to-transparent", location: "未知地点" };

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), {
    stiffness: 300,
    damping: 30,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const x = (e.clientX - rect.left - width / 2) / (width / 2);
    const y = (e.clientY - rect.top - height / 2) / (height / 2);
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div variants={itemVariants} className="perspective-1000">
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        className="group relative"
      >
        <Card 
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl transition-shadow duration-500 cursor-pointer"
          onClick={onSelect}
        >
          {/* Animated gradient overlay */}
          <motion.div
            className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
            animate={
              isHovered
                ? { opacity: 1 }
                : { opacity: shouldReduceMotion ? 0.05 : 0 }
            }
          />

          {/* Sparkle effect on hover */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={
              isHovered
                ? { opacity: 1, scale: 1 }
                : { opacity: 0, scale: shouldReduceMotion ? 1 : 0.6 }
            }
            className="absolute right-4 top-4 z-10"
          >
            <Sparkles className="h-5 w-5 text-pink-400" aria-hidden />
          </motion.div>

          <div className="relative z-10 p-6">
            {/* Avatar Section */}
            <div className="mb-4 flex justify-center">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <motion.div
                  className="absolute -inset-2 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background: `linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0))`,
                  }}
                  animate={
                    isHovered
                      ? {
                          rotate: shouldReduceMotion ? 0 : 360,
                          scale: shouldReduceMotion ? 1 : [1, 1.08, 1],
                        }
                      : { rotate: 0, scale: 1 }
                  }
                  transition={{
                    duration: shouldReduceMotion ? 0.6 : 3,
                    repeat: shouldReduceMotion ? 0 : Infinity,
                    ease: "linear",
                  }}
                />
                <div className="relative h-28 w-28 overflow-hidden rounded-full border border-white/20 bg-white/5 p-1 shadow-2xl">
                  <motion.img
                    src={character.avatar}
                    alt={character.name}
                    className="h-full w-full rounded-full object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>
            </div>

            {/* Info Section */}
            <div className="text-center">
              <motion.h3
                className="mb-1 text-xl font-bold tracking-tight text-white"
                animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {character.name}
              </motion.h3>
              <Badge
                variant="secondary"
                className="mb-2 bg-white/10 text-[10px] uppercase tracking-[0.2em] text-white/70 backdrop-blur border-none"
              >
                {character.tagline.split('，')[0]}
              </Badge>

              <motion.div
                className="mb-3 flex items-center justify-center gap-1 text-xs text-white/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <MapPin className="h-3 w-3" aria-hidden />
                <span>{config.location}</span>
              </motion.div>

              <p className="mb-4 text-xs text-white/60 line-clamp-2 h-8">
                {character.appearance.split('。')[0]}
              </p>

              {/* Skills */}
              <motion.div
                className="mb-4 flex flex-wrap justify-center gap-1.5"
                initial={{ opacity: 0, y: 10 }}
                animate={
                  isHovered ? { opacity: 1, y: 0 } : { opacity: 0.7, y: 0 }
                }
                transition={{ duration: 0.3 }}
              >
                {character.tags.map((tag, idx) => (
                  <motion.div
                    key={tag}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 * idx, type: "spring" }}
                  >
                    <Badge
                      variant="outline"
                      className="border-white/10 bg-white/5 text-[10px] text-white/70 transition-colors hover:bg-white/10"
                    >
                      {tag}
                    </Badge>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTA Section */}
              <motion.div
                className="flex justify-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full border border-white/10 bg-white/5 text-white/70 hover:bg-pink-500 hover:text-white transition-all gap-2 px-6"
                >
                  <Heart className="h-3 w-3" />
                  开始心动对话
                </Button>
              </motion.div>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}

interface CharacterSelectProps {
  characters: Character[];
}

export function CharacterSelect({ characters }: CharacterSelectProps) {
  const shouldReduceMotion = useReducedMotion();
  const { selectCharacter } = useChat();

  return (
    <section
      aria-labelledby="team-section-heading"
      className="relative min-h-screen w-full overflow-hidden px-4 py-20 sm:px-6 lg:px-10 bg-[#0a0a0c]"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          animate={{
            scale: shouldReduceMotion ? 1 : [1, 1.18, 1],
            rotate: shouldReduceMotion ? 0 : [0, 90, 0],
            opacity: [0.05, 0.15, 0.05],
          }}
          transition={{
            duration: shouldReduceMotion ? 0.6 : 18,
            repeat: shouldReduceMotion ? 0 : Infinity,
            ease: "linear",
          }}
          className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-pink-500/20 blur-[180px]"
        />
        <motion.div
          animate={{
            scale: shouldReduceMotion ? 1 : [1.1, 1, 1.1],
            rotate: shouldReduceMotion ? 0 : [0, -90, 0],
            opacity: [0.05, 0.15, 0.05],
          }}
          transition={{
            duration: shouldReduceMotion ? 0.6 : 16,
            repeat: shouldReduceMotion ? 0 : Infinity,
            ease: "linear",
          }}
          className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-purple-500/20 blur-[180px]"
        />
      </div>

      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.6, 0.05, 0.01, 0.9] }}
          className="mb-16 text-center"
        >
          <motion.div className="mb-6 inline-block">
            <Badge
              className="gap-2 bg-white/5 text-white/50 backdrop-blur border-white/10"
              variant="secondary"
            >
              <Sparkles className="h-3 w-3" aria-hidden />
              选择你的心动纸片人
            </Badge>
          </motion.div>

          <motion.h2
            id="team-section-heading"
            className="mb-6 bg-gradient-to-r from-white via-white/80 to-white/60 bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            开启一段专属的
            <br />
            <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              甜蜜聊天体验
            </span>
          </motion.h2>

          <motion.p
            className="mx-auto max-w-2xl text-base text-white/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            这里的每一位角色都有独特的人设和故事。选择你心仪的那位，
            <br className="hidden sm:block" />
            让他陪你度过每一个心动瞬间。
          </motion.p>
        </motion.div>

        {/* Team Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 max-w-4xl mx-auto"
        >
          {characters.map((character) => (
            <CharacterCard 
              key={character.id} 
              character={character} 
              onSelect={() => selectCharacter(character)}
            />
          ))}
        </motion.div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-white/20 italic">
            “所有的相遇，都是久别重逢。”
          </p>
        </motion.div>
      </div>
    </section>
  );
}