import 'dotenv/config';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

import { prisma } from '@/lib/prisma';

async function seedOrders() {
  try {
    console.log('正在创建示例订单...');
    
    // 获取所有用户
    const users = await prisma.user.findMany({
      take: 5,
    });
    
    if (users.length === 0) {
      console.log('没有找到用户，请先创建用户');
      return;
    }
    
    // 删除现有订单（可选）
    await prisma.order.deleteMany({});
    console.log('已清空现有订单');
    
    // 创建示例订单
    const orders = [];
    const statuses = ['pending', 'paid', 'cancelled', 'completed'];
    const products = ['虚拟礼物', '会员套餐', '定制服务', '道具卡', '表情包'];
    
    for (let i = 0; i < 20; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const amount = Math.floor(Math.random() * 9900 + 100) / 100; // 1.00 - 100.00
      const orderNo = `ORD${Date.now()}${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
      const product = products[Math.floor(Math.random() * products.length)];
      
      const order = await prisma.order.create({
        data: {
          orderNo,
          userId: user.id,
          amount,
          status,
          notes: Math.random() > 0.7 ? `购买${product}服务` : null,
        },
      });
      
      orders.push(order);
      console.log(`创建订单: ${order.orderNo} - ${amount.toFixed(2)}元 - ${status}`);
    }
    
    console.log(`✅ 已创建 ${orders.length} 个示例订单`);
    
  } catch (error: any) {
    console.error('创建示例订单失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedOrders();