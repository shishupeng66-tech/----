import type { ParsedReply } from '@/types/chat';

/**
 * 从 LLM 回复中解析出文字内容和图片标记
 * @param reply LLM 返回的原始回复
 * @returns 解析后的文字和图片描述
 */
export function parseReply(reply: string): ParsedReply {
  // 匹配 [IMAGE: ...] 标记，支持不同格式
  const imageMatch = reply.match(/\[IMAGE:\s*([^\]]+)\]/i);
  const imagePrompt = imageMatch ? imageMatch[1].trim() : null;
  
  // 移除图片标记，得到纯文字内容
  const textContent = reply
    .replace(/\[IMAGE:\s*[^\]]+\]/gi, '')
    .replace(/\[image:\s*[^\]]+\]/gi, '')
    .replace(/\(IMAGE:[^\)]+\)/gi, '')
    .trim();
  
  return {
    text: textContent,
    imagePrompt,
  };
}

/**
 * 检查最近的消息中是否已经发过图
 * @param messages 最近的消息列表
 * @param maxMessages 检查的最大消息数量（默认8条，约3-4轮对话）
 * @returns 是否应该发图
 */
export function shouldSendImage(
  messages: { imageUri?: string }[],
  maxMessages: number = 8
): boolean {
  const recentMessages = messages.slice(-maxMessages);
  const imageCount = recentMessages.filter((m) => m.imageUri).length;
  
  // 如果最近N条消息中已经有2张图了，就不要再发
  if (imageCount >= 2) {
    return false;
  }
  
  // 如果还没有发过图，有一定概率发（由LLM决定）
  // 这里只做兜底检查，不强制干预
  return true;
}
