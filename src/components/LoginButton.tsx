'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AuthDialog } from './AuthDialog';
import { LogIn, LogOut, User, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

export default function LoginButton() {
  const { user, isLoading, logout } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  if (isLoading) {
    return (
      <div className="px-4 py-2 rounded-[30px] text-sm font-medium backdrop-blur-md bg-white/70 dark:bg-[#1e1e23]/70 border border-black/5 dark:border-white/10 animate-pulse">
        ...
      </div>
    );
  }

  if (user) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="group flex items-center gap-1.5 px-4 py-2 rounded-[30px] text-sm font-medium backdrop-blur-md transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] bg-white/70 text-[#1c1c1e] border border-black/5 hover:bg-white/85 dark:bg-[#1e1e23]/70 dark:text-white dark:border-white/10 dark:hover:bg-[#1e1e23]/85"
        >
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="w-5 h-5 rounded-full object-cover" />
          ) : (
            <User size={16} strokeWidth={1.5} />
          )}
          <span>{user.nickname}</span>
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 top-full mt-2 z-50 min-w-[160px] rounded-xl backdrop-blur-xl bg-white/80 dark:bg-[#1e1e23]/80 border border-black/5 dark:border-white/10 shadow-lg py-1 overflow-hidden">
              {(user.isAdmin || user.nickname === '小赤佬') && (
                <Link
                  href="/admin"
                  onClick={() => setShowMenu(false)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#1c1c1e] dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <LayoutDashboard size={14} />
                  管理后台
                </Link>
              )}
              <button
                onClick={() => { logout(); setShowMenu(false); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors border-t border-black/5 dark:border-white/10"
              >
                <LogOut size={14} />
                退出登录
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setDialogOpen(true)}
        aria-label="登录账户"
        className="group flex items-center gap-1.5 px-4 py-2 rounded-[30px] text-sm font-medium backdrop-blur-md transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-[#007aff]/50 bg-white/70 text-[#1c1c1e] border border-black/5 hover:bg-white/85 hover:shadow-[0_2px_12px_rgba(0,0,0,0.08)] dark:bg-[#1e1e23]/70 dark:text-white dark:border-white/10 dark:hover:bg-[#1e1e23]/85 dark:hover:shadow-[0_2px_12px_rgba(0,0,0,0.4)]"
      >
        <LogIn size={16} strokeWidth={1.5} />
        <span>登录</span>
      </button>

      <AuthDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
