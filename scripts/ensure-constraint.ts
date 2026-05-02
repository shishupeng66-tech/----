import 'dotenv/config';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { Pool } from 'pg';

async function ensureConstraint() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const client = await pool.connect();

  try {
    // 检查是否已存在 users_email_unique 约束
    const checkRes = await client.query(`
      SELECT conname 
      FROM pg_constraint 
      WHERE conrelid = 'users'::regclass 
        AND contype = 'u' 
        AND conname = 'users_email_unique';
    `);

    if (checkRes.rows.length === 0) {
      console.log('🔧 添加 users_email_unique 唯一约束...');
      await client.query(`
        ALTER TABLE users 
        ADD CONSTRAINT users_email_unique UNIQUE (email);
      `);
      console.log('✅ 约束已添加');
    } else {
      console.log('✅ users_email_unique 约束已存在');
    }

    // 检查 password_hash 列是否存在
    const colRes = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
        AND column_name = 'password_hash';
    `);

    if (colRes.rows.length === 0) {
      console.log('❌ password_hash 列不存在 - 需要手动处理');
    } else {
      console.log('✅ password_hash 列已存在');
    }
  } catch (err: any) {
    console.error('❌ 操作失败:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

ensureConstraint();
