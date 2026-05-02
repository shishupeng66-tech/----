import 'dotenv/config';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { Pool } from 'pg';

async function initMigrations() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const client = await pool.connect();

  try {
    // 创建迁移表（如果不存在）
    await client.query(`
      CREATE TABLE IF NOT EXISTS __drizzle_migrations (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint NOT NULL
      );
    `);
    console.log('✅ __drizzle_migrations 表已就绪');

    // 检查是否已存在初始迁移记录
    const checkRes = await client.query(
      'SELECT id FROM __drizzle_migrations WHERE hash = $1',
      ['0000_init']
    );

    if (checkRes.rows.length === 0) {
      await client.query(
        'INSERT INTO __drizzle_migrations (hash, created_at) VALUES ($1, $2)',
        ['0000_init', Date.now()]
      );
      console.log('✅ 初始迁移记录已插入');
    } else {
      console.log('✅ 初始迁移记录已存在');
    }

    // 显示现有迁移
    const listRes = await client.query(
      'SELECT id, hash, created_at FROM __drizzle_migrations ORDER BY id'
    );
    console.log('\n📋 现有迁移记录:');
    listRes.rows.forEach(row => {
      console.log(`  ${row.id}: ${row.hash} (${new Date(row.created_at).toISOString()})`);
    });
  } catch (err: any) {
    console.error('❌ 初始化失败:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

initMigrations();
