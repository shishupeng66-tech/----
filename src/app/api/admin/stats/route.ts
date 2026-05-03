import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin } from '@/lib/auth/admin.middleware';

export async function GET(request: NextRequest) {
  return withAdmin(request, async () => {
    try {
      // 并行获取所有统计信息
      const [
        totalUsers,
        recentUsers,
        totalOrders,
        recentOrders,
        totalRevenue,
        recentRevenue,
      ] = await Promise.all([
        // 用户总数
        prisma.user.count(),
        
        // 最近7天新增用户数
        prisma.user.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        }),
        
        // 订单总数
        prisma.order.count(),
        
        // 最近7天订单数
        prisma.order.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        }),
        
        // 总成交额（只计算已支付和已完成的订单）
        prisma.order.aggregate({
          where: {
            status: {
              in: ['paid', 'completed'],
            },
          },
          _sum: {
            amount: true,
          },
        }),
        
        // 最近7天成交额
        prisma.order.aggregate({
          where: {
            status: {
              in: ['paid', 'completed'],
            },
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
          _sum: {
            amount: true,
          },
        }),
      ]);

      return NextResponse.json({
        stats: {
          users: {
            total: totalUsers,
            recent: recentUsers,
          },
          orders: {
            total: totalOrders,
            recent: recentOrders,
          },
          revenue: {
            total: totalRevenue._sum.amount || 0,
            recent: recentRevenue._sum.amount || 0,
          },
          // 其他可能的统计指标
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      console.error('获取统计信息失败:', error);
      return NextResponse.json(
        { error: '获取统计信息失败，请稍后再试' },
        { status: 500 }
      );
    }
  });
}