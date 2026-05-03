'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Users, ShoppingCart, TrendingUp, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { GlowingEffect } from '@/components/ui/glowing-effect';

interface StatsData {
  users: {
    total: number;
    recent: number;
  };
  orders: {
    total: number;
    recent: number;
  };
  revenue: {
    total: number;
    recent: number;
  };
  timestamp: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/stats', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('vr_auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('获取统计信息失败');
      }

      const data = await response.json();
      setStats(data.stats);
    } catch (error: any) {
      console.error('获取统计信息失败:', error);
      toast.error('获取统计信息失败，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('zh-CN').format(num);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
    }).format(amount);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">运营概览</h2>
          <p className="text-gray-500">
            最近7天的运营数据统计
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-32 mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : stats ? (
          <>
            {/* 统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="relative overflow-hidden">
                <GlowingEffect
                  blur={0}
                  spread={40}
                  glow={true}
                  disabled={false}
                  proximity={64}
                  inactiveZone={0.01}
                />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">用户总数</CardTitle>
                  <Users className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(stats.users.total)}</div>
                  <p className="text-xs text-gray-500">
                    最近7天新增 {formatNumber(stats.users.recent)} 人
                  </p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <GlowingEffect
                  blur={0}
                  spread={40}
                  glow={true}
                  disabled={false}
                  proximity={64}
                  inactiveZone={0.01}
                />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">订单总数</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(stats.orders.total)}</div>
                  <p className="text-xs text-gray-500">
                    最近7天新增 {formatNumber(stats.orders.recent)} 单
                  </p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <GlowingEffect
                  blur={0}
                  spread={40}
                  glow={true}
                  disabled={false}
                  proximity={64}
                  inactiveZone={0.01}
                />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">总成交额</CardTitle>
                  <DollarSign className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(stats.revenue.total)}</div>
                  <p className="text-xs text-gray-500">
                    已支付和已完成订单
                  </p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <GlowingEffect
                  blur={0}
                  spread={40}
                  glow={true}
                  disabled={false}
                  proximity={64}
                  inactiveZone={0.01}
                />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">最近成交额</CardTitle>
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(stats.revenue.recent)}</div>
                  <p className="text-xs text-gray-500">
                    最近7天成交额
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* 其他统计信息 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>用户活跃度</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">新增用户占比</span>
                      <span className="text-sm font-medium">
                        {stats.users.total > 0
                          ? ((stats.users.recent / stats.users.total) * 100).toFixed(1)
                          : 0}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">订单转化率</span>
                      <span className="text-sm font-medium">
                        {stats.users.total > 0
                          ? ((stats.orders.total / stats.users.total) * 100).toFixed(1)
                          : 0}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>订单状态分布</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">平均订单金额</span>
                      <span className="text-sm font-medium">
                        {stats.orders.total > 0
                          ? formatCurrency(stats.revenue.total / stats.orders.total)
                          : formatCurrency(0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">最近7天订单占比</span>
                      <span className="text-sm font-medium">
                        {stats.orders.total > 0
                          ? ((stats.orders.recent / stats.orders.total) * 100).toFixed(1)
                          : 0}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-sm text-gray-500 text-right">
              数据更新时间: {new Date(stats.timestamp).toLocaleString('zh-CN')}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">无法加载统计信息</p>
            <button
              onClick={fetchStats}
              className="mt-4 text-sm text-blue-600 hover:text-blue-800"
            >
              重试
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}