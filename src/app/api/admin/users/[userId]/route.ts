import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin } from '@/lib/auth/admin.middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  return withAdmin(request, async () => {
    try {
      const { userId } = await params;
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
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
          // 关联信息
          sessions: {
            select: {
              id: true,
              character: { select: { name: true } },
              messageCount: true,
              lastMessageAt: true,
              createdAt: true,
            },
            orderBy: { lastMessageAt: 'desc' },
            take: 5,
          },
          orders: {
            select: {
              id: true,
              orderNo: true,
              amount: true,
              status: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      });

      if (!user) {
        return NextResponse.json({ error: '用户不存在' }, { status: 404 });
      }

      return NextResponse.json({ user });
    } catch (error: any) {
      console.error('获取用户详情失败:', error);
      return NextResponse.json(
        { error: '获取用户详情失败，请稍后再试' },
        { status: 500 }
      );
    }
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  return withAdmin(request, async () => {
    try {
      const { userId } = await params;
      const body = await request.json();
      
      // 只允许更新特定字段
      const allowedFields = ['status', 'isAdmin'];
      const updateData: any = {};
      
      for (const field of allowedFields) {
        if (field in body) {
          updateData[field] = body[field];
        }
      }
      
      // 如果没有可更新的字段，返回错误
      if (Object.keys(updateData).length === 0) {
        return NextResponse.json(
          { error: '没有提供可更新的字段' },
          { status: 400 }
        );
      }
      
      // 更新用户
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          nickname: true,
          status: true,
          isAdmin: true,
          updatedAt: true,
        },
      });
      
      return NextResponse.json({
        message: '用户更新成功',
        user: updatedUser,
      });
    } catch (error: any) {
      console.error('更新用户失败:', error);
      
      // Prisma 错误处理
      if (error.code === 'P2025') {
        return NextResponse.json({ error: '用户不存在' }, { status: 404 });
      }
      
      return NextResponse.json(
        { error: '更新用户失败，请稍后再试' },
        { status: 500 }
      );
    }
  });
}