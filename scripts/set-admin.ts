import 'dotenv/config';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

import { prisma } from '@/lib/prisma';

async function setAdminUser() {
  try {
    console.log('正在设置管理员用户...');
    
    // 查找第一个用户
    const firstUser = await prisma.user.findFirst({
      orderBy: { createdAt: 'asc' },
    });
    
    if (!firstUser) {
      console.log('没有找到用户，请先创建用户');
      return;
    }
    
    // 更新为管理员
    const updatedUser = await prisma.user.update({
      where: { id: firstUser.id },
      data: { isAdmin: true, status: 'active' },
    });
    
    console.log(`✅ 已将用户设置为管理员:`);
    console.log(`   邮箱: ${updatedUser.email}`);
    console.log(`   昵称: ${updatedUser.nickname}`);
    console.log(`   管理员状态: ${updatedUser.isAdmin}`);
    console.log(`   用户状态: ${updatedUser.status}`);
    
  } catch (error: any) {
    console.error('设置管理员失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setAdminUser();