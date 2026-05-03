import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin } from '@/lib/auth/admin.middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  return withAdmin(request, async () => {
    try {
      const { orderId } = await params;
      
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              nickname: true,
              avatarUrl: true,
              status: true,
              createdAt: true,
            },
          },
        },
      });

      if (!order) {
        return NextResponse.json({ error: '订单不存在' }, { status: 404 });
      }

      return NextResponse.json({ order });
    } catch (error: any) {
      console.error('获取订单详情失败:', error);
      return NextResponse.json(
        { error: '获取订单详情失败，请稍后再试' },
        { status: 500 }
      );
    }
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  return withAdmin(request, async () => {
    try {
      const { orderId } = await params;
      const body = await request.json();
      
      // 只允许更新特定字段
      const allowedFields = ['status', 'notes'];
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
      
      // 更新订单
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              nickname: true,
            },
          },
        },
      });
      
      return NextResponse.json({
        message: '订单更新成功',
        order: updatedOrder,
      });
    } catch (error: any) {
      console.error('更新订单失败:', error);
      
      // Prisma 错误处理
      if (error.code === 'P2025') {
        return NextResponse.json({ error: '订单不存在' }, { status: 404 });
      }
      
      return NextResponse.json(
        { error: '更新订单失败，请稍后再试' },
        { status: 500 }
      );
    }
  });
}