import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin } from '@/lib/auth/admin.middleware';

export async function GET(request: NextRequest) {
  return withAdmin(request, async () => {
    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');
      const search = searchParams.get('search') || '';
      const status = searchParams.get('status') || '';
      const skip = (page - 1) * limit;

      // 构建查询条件
      const where: any = {};

      // 搜索条件：邮箱或昵称包含搜索词
      if (search) {
        where.OR = [
          { email: { contains: search, mode: 'insensitive' } },
          { nickname: { contains: search, mode: 'insensitive' } },
          { username: { contains: search, mode: 'insensitive' } },
        ];
      }

      // 状态筛选
      if (status) {
        where.status = status;
      }

      // 获取总数和用户列表
      const [total, users] = await Promise.all([
        prisma.user.count({ where }),
        prisma.user.findMany({
          where,
          select: {
            id: true,
            email: true,
            nickname: true,
            username: true,
            avatarUrl: true,
            status: true,
            isAdmin: true,
            lastActiveAt: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
      ]);

      return NextResponse.json({
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      console.error('获取用户列表失败:', error);
      return NextResponse.json(
        { error: '获取用户列表失败，请稍后再试' },
        { status: 500 }
      );
    }
  });
}