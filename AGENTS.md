# 纸片人男友 - 项目规范

## 项目概述

AI虚拟恋爱聊天产品：用户选择一个有人设的虚拟男友角色，通过文字聊天互动。他会回复文字、发语音消息、还会主动发"自拍照片"。

## 技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **样式**: Tailwind CSS 4
- **AI 集成**: coze-coding-dev-sdk (LLM、TTS、图像生成)

## 目录结构

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts         # 对话生成 API
│   │   ├── tts/route.ts          # 语音合成 API
│   │   └── image/route.ts        # 图像生成 API
│   ├── layout.tsx                # 全局布局
│   ├── page.tsx                  # 主页面
│   └── globals.css               # 全局样式
├── components/
│   ├── ui/                       # shadcn/ui 组件库
│   ├── CharacterSelect.tsx       # 角色选择界面
│   ├── ChatScreen.tsx            # 聊天主界面
│   ├── MessageBubble.tsx         # 消息气泡组件
│   ├── VoicePlayer.tsx          # 语音播放器
│   ├── ImageViewer.tsx           # 图片查看器
│   ├── TypingIndicator.tsx       # 正在输入动画
│   └── HomePage.tsx              # 首页组件
├── context/
│   └── ChatContext.tsx           # 聊天状态管理
├── data/
│   └── characters.ts             # 角色数据和系统提示词
├── types/
│   └── chat.ts                   # 类型定义
└── utils/
    ├── parseReply.ts             # 解析 LLM 回复（提取图片标记）
    └── cleanText.ts              # 文本清理（TTS用）
```

## 开发命令

```bash
# 安装依赖
pnpm install

# 开发环境
pnpm dev

# 生产构建
pnpm build

# 代码检查
pnpm lint

# 类型检查
pnpm ts-check
```

## 核心功能

### 1. 角色选择界面
- 展示4个预设角色卡片（林屿、顾冽、苏晨、沈默）
- 每个卡片包含：角色头像、名字、一句话介绍、性格标签
- 点击角色卡片进入聊天界面

### 2. 聊天主界面
- 微信私聊界面风格
- 支持文字消息、语音消息、图片消息
- 角色会主动发"自拍照片"
- 正在输入动画
- 图片点击可放大预览

### 3. 消息发送流程
1. 用户输入文字 → 发送按钮
2. 用户消息立刻显示在聊天界面右侧
3. 显示"正在输入..."动画
4. 调用 /api/chat（带完整对话历史）
5. 收到 LLM 回复，解析回复：提取文字 + [IMAGE: ...] 标记
6. 并行处理：文字显示 + TTS语音 + 图片生成

## API 接口

### /api/chat
- 角色扮演对话
- 请求：`{ characterId, systemPrompt, messages }`
- 响应：`{ reply }`

### /api/tts
- 语音合成
- 请求：`{ text, speaker, uid }`
- 响应：`{ audioUri, audioSize }`

### /api/image
- 图像生成
- 请求：`{ prompt, uid }`
- 响应：`{ imageUri }`

## 关键实现要点

### 图片标记解析
LLM 回复中使用 `[IMAGE: 描述]` 标记发送图片，前端解析提取图片描述后调用图像生成 API。

### 语音文本清理
TTS 调用前需清理文本，移除图片标记、括号内容、emoji 等。

### 角色发图规则
- **频率限制**：每5-6轮对话最多发1张图
- **触发条件**：
  - 用户明确要求："想看你"、"发张照片"、"发个自拍"、"你在干嘛"
  - 用户问"你在做什么"且正在做值得分享的事
- **禁止情况**：
  - 不要因为聊天内容提到了某个场景就发图
  - 不要连续两轮发图
  - 平时聊天不需要主动发图

## 注意事项

- 禁止在 JSX 渲染逻辑中直接使用 `typeof window`、`Date.now()`、`Math.random()` 等动态数据
- 使用 `'use client'` 并配合 `useEffect + useState` 确保动态内容仅在客户端挂载后渲染
- 所有 API 调用必须 try-catch 处理异常
