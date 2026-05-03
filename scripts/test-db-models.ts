import 'dotenv/config';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

import { prisma } from '@/lib/prisma';

async function testDatabaseModels() {
  console.log('=== 虚拟男友数据库模型测试 ===\n');

  try {
    // 1. 测试数据库连接
    console.log('1. 测试数据库连接...');
    await prisma.$connect();
    console.log('   ✅ 数据库连接成功\n');

    // 2. 检查所有表
    console.log('2. 检查数据库表结构...');
    
    // 使用原始查询检查表是否存在
    const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    console.log(`   发现 ${tables.length} 个表:`);
    tables.forEach(table => {
      console.log(`     - ${table.table_name}`);
    });
    console.log();

    // 3. 测试 User 模型
    console.log('3. 测试 User 模型...');
    const userCount = await prisma.user.count();
    console.log(`   现有用户数: ${userCount}`);
    
    // 4. 测试 Character 模型
    console.log('4. 测试 Character 模型...');
    const characterCount = await prisma.character.count();
    console.log(`   现有角色数: ${characterCount}`);
    
    // 如果没有角色，创建示例角色
    if (characterCount === 0) {
      console.log('   创建示例角色...');
      const sampleCharacters = [
        {
          name: '林屿',
          description: '温柔阳光的学长，喜欢摄影和音乐',
          tags: ['温柔', '阳光', '学长', '文艺'],
          avatarUrl: '/avatars/sunshine.jpeg',
          voiceType: '温柔男声',
          appearance: '身高180cm，黑色短发，笑容温暖，常穿白色衬衫',
          relationship: '学长兼摄影社社长',
          systemPrompt: '你是一个温柔阳光的学长，喜欢摄影和音乐，总是关心学弟学妹'
        },
        {
          name: '顾冽',
          description: '高冷禁欲系总裁，工作狂但内心温柔',
          tags: ['高冷', '总裁', '禁欲', '工作狂'],
          avatarUrl: '/avatars/cool-guy.jpeg',
          voiceType: '沉稳男声',
          appearance: '身高185cm，黑色西装，金丝眼镜，表情严肃',
          relationship: '公司CEO，你的上司',
          systemPrompt: '你是一个高冷禁欲系总裁，工作认真负责，外表冷漠但内心温柔'
        }
      ];
      
      for (const charData of sampleCharacters) {
        await prisma.character.create({
          data: charData
        });
      }
      console.log('   ✅ 创建了2个示例角色\n');
    } else {
      console.log('   使用现有角色\n');
    }

    // 5. 测试 ChatSession 模型
    console.log('5. 测试 ChatSession 模型...');
    const sessionCount = await prisma.chatSession.count();
    console.log(`   现有聊天会话数: ${sessionCount}\n`);

    // 6. 测试其他模型计数
    console.log('6. 其他模型统计:');
    const messageCount = await prisma.message.count();
    const mediaCount = await prisma.media.count();
    const memoryCount = await prisma.memory.count();
    const generationLogCount = await prisma.generationLog.count();
    const analyticsCount = await prisma.analytics.count();
    
    console.log(`   消息数: ${messageCount}`);
    console.log(`   媒体文件数: ${mediaCount}`);
    console.log(`   记忆条目数: ${memoryCount}`);
    console.log(`   生成日志数: ${generationLogCount}`);
    console.log(`   分析数据数: ${analyticsCount}\n`);

    // 7. 测试关系完整性
    console.log('7. 测试模型关系完整性...');
    
    // 获取第一个角色
    const firstCharacter = await prisma.character.findFirst();
    if (firstCharacter) {
      console.log(`   第一个角色: ${firstCharacter.name} (ID: ${firstCharacter.id})`);
      
      // 测试是否可以创建关联数据
      const testUser = await prisma.user.findFirst();
      if (testUser) {
        console.log(`   测试用户: ${testUser.email || testUser.username || '匿名用户'} (ID: ${testUser.id})`);
        
        // 尝试创建聊天会话
        const testSession = await prisma.chatSession.create({
          data: {
            userId: testUser.id,
            characterId: firstCharacter.id,
            status: 'active',
            messageCount: 0
          }
        });
        console.log(`   ✅ 创建测试聊天会话 (ID: ${testSession.id})`);
        
        // 创建测试消息
        const testMessage = await prisma.message.create({
          data: {
            sessionId: testSession.id,
            senderType: 'user',
            content: '你好，这是一个测试消息',
            sequence: 1
          }
        });
        console.log(`   ✅ 创建测试消息 (ID: ${testMessage.id})`);
        
        // 更新会话消息计数
        await prisma.chatSession.update({
          where: { id: testSession.id },
          data: { 
            messageCount: { increment: 1 },
            lastMessageAt: new Date()
          }
        });
        console.log('   ✅ 更新会话消息计数\n');
        
        // 清理测试数据
        console.log('8. 清理测试数据...');
        await prisma.message.deleteMany({ where: { sessionId: testSession.id } });
        await prisma.chatSession.delete({ where: { id: testSession.id } });
        console.log('   ✅ 测试数据已清理\n');
      } else {
        console.log('   ℹ️ 没有用户，跳过关系测试\n');
      }
    } else {
      console.log('   ℹ️ 没有角色，跳过关系测试\n');
    }

    console.log('=== 测试完成 ===');
    console.log('所有数据库模型配置正确，可以正常使用！');

  } catch (error: any) {
    console.error('❌ 测试失败:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// 运行测试
testDatabaseModels().catch(console.error);