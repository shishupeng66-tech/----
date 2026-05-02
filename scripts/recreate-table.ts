import 'dotenv/config';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { Pool } from 'pg';

async function recreateTable() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const client = await pool.connect();

  try {
    // 删除旧表
    await client.query('DROP TABLE IF EXISTS users CASCADE');
    console.log('✅ 旧 users 表已删除');

    // 创建新表
    await client.query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        nickname TEXT,
        avatar_url TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    console.log('✅ 新 users 表创建成功');

    // 验证表结构
    const res = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);

    console.log('\n📊 验证表结构:');
    res.rows.forEach(row => {
      console.log(`  ${row.column_name} (${row.data_type}, ${row.is_nullable === 'YES' ? 'nullable' : 'NOT NULL'})`);
    });
  } catch (err: any) {
    console.error('❌ 操作失败:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

recreateTable();
