import 'dotenv/config';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { Pool } from 'pg';

async function checkTable() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const client = await pool.connect();

  try {
    // 检查表是否存在
    const tableRes = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);

    console.log('📊 users 表结构:');
    if (tableRes.rows.length === 0) {
      console.log('❌ users 表不存在');
    } else {
      tableRes.rows.forEach(row => {
        console.log(`  ${row.column_name} (${row.data_type}, ${row.is_nullable === 'YES' ? 'nullable' : 'NOT NULL'})`);
      });
    }

    // 检查是否有数据
    const countRes = await client.query('SELECT COUNT(*) FROM users');
    console.log(`\n📈 用户数量: ${countRes.rows[0].count}`);
  } catch (err) {
    console.error('❌ 查询失败:', err instanceof Error ? err.message : String(err));
  } finally {
    client.release();
    await pool.end();
  }
}

checkTable();
