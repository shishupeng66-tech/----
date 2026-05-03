'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  Users,
  ShoppingCart,
  Menu,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  {
    title: '概览',
    href: '/admin',
    icon: BarChart3,
  },
  {
    title: '用户管理',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: '订单管理',
    href: '/admin/orders',
    icon: ShoppingCart,
  },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading: authLoading, logout } = useAuth();

  useEffect(() => {
    // 检查用户是否为管理员
    if (!authLoading) {
      if (!user) {
        // 未登录，重定向到首页
        toast.error('请先登录');
        router.push('/');
        return;
      }

      if (!user.isAdmin && user.nickname !== '小赤佬') {
        // 非管理员，显示无权限
        toast.error('权限不足，需要管理员权限');
        router.push('/');
        return;
      }

      setIsLoading(false);
    }
  }, [user, authLoading, router]);

  const handleLogout = () => {
    logout();
    toast.success('已退出登录');
    router.push('/');
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="lg:col-span-3">
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">权限不足</h1>
          <p className="text-gray-600 mb-8">您需要管理员权限才能访问此页面</p>
          <Button onClick={() => router.push('/')}>返回首页</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 移动端顶部栏 */}
      <div className="lg:hidden border-b bg-white">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex h-full flex-col">
                  <div className="p-6 border-b">
                    <h2 className="text-lg font-semibold">管理后台</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {user.email}
                    </p>
                  </div>
                  <nav className="flex-1 p-4">
                    {navigationItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors mb-1',
                          pathname === item.href
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.title}
                      </Link>
                    ))}
                  </nav>
                  <div className="border-t p-4">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-gray-600"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      退出登录
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <h1 className="text-lg font-semibold">管理后台</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 hidden sm:inline">
              {user.nickname || user.email}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="hidden sm:flex"
            >
              <LogOut className="h-4 w-4 mr-1" />
              退出
            </Button>
          </div>
        </div>
      </div>

      {/* 桌面端布局 */}
      <div className="hidden lg:flex">
        {/* 侧边栏 */}
        <div className="w-64 border-r bg-white min-h-screen">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">管理后台</h2>
            <p className="text-sm text-gray-500 mt-1">
              {user.email}
            </p>
          </div>
          <nav className="p-4">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors mb-1',
                  pathname === item.href
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </nav>
          <div className="absolute bottom-0 w-64 border-t p-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-600"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              退出登录
            </Button>
          </div>
        </div>

        {/* 主内容区 */}
        <div className="flex-1">
          {/* 桌面端顶部栏 */}
          <div className="border-b bg-white p-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                {navigationItems.find((item) => item.href === pathname)?.title || '管理后台'}
              </h1>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium">{user.nickname || user.email}</p>
                  <p className="text-xs text-gray-500">管理员</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  退出登录
                </Button>
              </div>
            </div>
          </div>

          {/* 页面内容 */}
          <div className="p-6">{children}</div>
        </div>
      </div>

      {/* 移动端内容区 */}
      <div className="lg:hidden">
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}