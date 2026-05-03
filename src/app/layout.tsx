import type { Metadata } from 'next';
import './globals.css';
import { ChatProvider } from '@/context/ChatContext';
import { AuthProvider } from '@/context/AuthContext';
import { HomePage } from '@/components/HomePage';

export const metadata: Metadata = {
  title: {
    default: '纸片人男友',
    template: '%s | 纸片人男友',
  },
  description: 'AI虚拟恋爱聊天产品，选择一位心动对象，开启甜蜜聊天体验',
  keywords: ['AI', '虚拟恋爱', '聊天', '角色扮演', '纸片人'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <AuthProvider>
          <ChatProvider>
            {children}
          </ChatProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
