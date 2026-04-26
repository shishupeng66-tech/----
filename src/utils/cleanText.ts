/**
 * 清理文本，用于 TTS 语音合成
 * 移除不适合朗读的内容：图片标记、括号内的注释、表情符号等
 * @param text 原始文本
 * @returns 清理后的文本
 */
export function cleanTextForSpeech(text: string): string {
  return text
    // 移除图片标记 [IMAGE: ...]
    .replace(/\[IMAGE:\s*.+?\]/gi, '')
    // 移除中文括号内容
    .replace(/（[^）]*）/g, '')
    // 移除英文括号内容
    .replace(/\([^)]*\)/g, '')
    // 移除中括号内容
    .replace(/\[[^\]]*\]/g, '')
    // 移除中文引号
    .replace(/[「」『』]/g, '')
    // 移除 emoji 表情
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
    .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '')
    // 移除多余空白字符
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 检查清理后的文本是否为空
 * @param text 原始文本
 * @returns 是否为空
 */
export function isEmptyAfterCleaning(text: string): boolean {
  const cleaned = cleanTextForSpeech(text);
  return cleaned.length === 0;
}
