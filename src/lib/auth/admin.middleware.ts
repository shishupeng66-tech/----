import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { prisma } from '@/lib/prisma';

/**
 * 管理员权限校验中间件
 * 1. 验证 JWT token
 * 2. 检查用户是否为管理员
 * 3. 如果未登录或非管理员，返回 403 错误
 */
export async function withAdmin(
  request: NextRequest,
  handler: (userId: string) => Promise<NextResponse>
) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: '登录已过期，请重新登录' }, { status: 401 });
  }

  // 检查用户是否为管理员
  if (!payload.isAdmin) {
    // 双重验证：从数据库确认管理员状态（防止 token 被篡改）
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { isAdmin: true },
    });

    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: '权限不足，需要管理员权限' }, { status: 403 });
    }
  }

  return handler(payload.userId);
}

/**
 * 组合中间件：先认证，后检查管理员权限
 * 用于需要同时验证登录状态和管理员权限的 API
 */
export async function withAuthAndAdmin(
  request: NextRequest,
  handler: (userId: string) => Promise<NextResponse>
) {
  return withAdmin(request, handler);
}