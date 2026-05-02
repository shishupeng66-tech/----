'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, UserPlus, Loader2 } from 'lucide-react';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Tab = 'login' | 'register';

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setEmail('');
    setPassword('');
    setNickname('');
    setError('');
  };

  const switchTab = (t: Tab) => {
    setTab(t);
    reset();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (tab === 'login') {
        await login(email, password);
      } else {
        await register(email, password, nickname || undefined);
      }
      reset();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] backdrop-blur-xl bg-white/80 dark:bg-[#1e1e23]/80 border border-black/5 dark:border-white/10 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold">
            {tab === 'login' ? '欢迎回来' : '创建账号'}
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground">
            {tab === 'login' ? '登录后与你的他继续聊天' : '注册账号，开启甜蜜体验'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex rounded-xl bg-muted p-1">
          <button
            onClick={() => switchTab('login')}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
              tab === 'login'
                ? 'bg-white dark:bg-[#2c2c30] shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <LogIn size={14} className="inline mr-1.5 -mt-0.5" />
            登录
          </button>
          <button
            onClick={() => switchTab('register')}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
              tab === 'register'
                ? 'bg-white dark:bg-[#2c2c30] shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <UserPlus size={14} className="inline mr-1.5 -mt-0.5" />
            注册
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="nickname">昵称</Label>
              <Input
                id="nickname"
                placeholder="给他取个称呼"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              placeholder={tab === 'register' ? '至少6位' : '输入密码'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-xl bg-[#007aff] text-white text-sm font-medium
              hover:bg-[#0066d6] active:scale-[0.98] transition-all
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {tab === 'login' ? '登录' : '注册'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
