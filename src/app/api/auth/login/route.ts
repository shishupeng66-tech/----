import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: '邮箱和密码不能为空' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: '邮箱未注册' }, { status: 404 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: '密码错误' }, { status: 401 });
    }

    const token = await signToken({ userId: user.id, email: user.email, isAdmin: user.isAdmin });

    return NextResponse.json({
      token,
      user: { 
        id: user.id, 
        email: user.email, 
        nickname: user.nickname, 
        avatarUrl: user.avatarUrl,
        isAdmin: user.isAdmin,
        status: user.status,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: '登录失败，请稍后再试' }, { status: 500 });
  }
}
