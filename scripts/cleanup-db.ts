import 'dotenv/config';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

import { Pool } from 'pg';

async function cleanupDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const client = await pool.connect();

  try {
    console.log('===== 清理 Drizzle 残留 =====');

    console.log('1. 删除 drizzle schema（包含 __drizzle_migrations 表）...');
    await client.query('DROP SCHEMA IF EXISTS drizzle CASCADE');
    console.log('   ✅ drizzle schema 已删除');

    console.log('\n===== 验证结果 =====');

    const schemaRes = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
      ORDER BY schema_name;
    `);
    console.log('剩余 schema:', schemaRes.rows.map(r => r.schema_name).join(', '));

    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    console.log('public schema 中的表:', tablesRes.rows.map(r => r.table_name).join(', '));

    const prismaMigRes = await client.query('SELECT migration_name FROM _prisma_migrations');
    console.log('Prisma 迁移记录:', prismaMigRes.rows.map(r => r.migration_name).join(', '));

    const userCount = await client.query('SELECT COUNT(*) as count FROM users');
    console.log(`用户数量: ${userCount.rows[0].count}`);

    console.log('\n🎉 数据库清理完成！现在只使用 Prisma 管理迁移。');

  } catch (err: any) {
    console.error('❌ 清理失败:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

cleanupDatabase();
