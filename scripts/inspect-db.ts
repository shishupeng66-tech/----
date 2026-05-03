import 'dotenv/config';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

import { Pool } from 'pg';

async function inspectDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const client = await pool.connect();

  try {
    console.log('===== 1. 查询所有迁移相关表 =====');
    const tablesRes = await client.query(`
      SELECT 
          table_schema,
          table_name,
          table_type
      FROM information_schema.tables 
      WHERE table_name LIKE '%migration%' 
         OR table_name IN ('users', 'User')
         OR table_name LIKE '%drizzle%' 
         OR table_name LIKE '%prisma%'
      ORDER BY table_schema, table_name;
    `);

    if (tablesRes.rows.length === 0) {
      console.log('  无匹配表');
    } else {
      for (const row of tablesRes.rows) {
        console.log(`  Schema: ${row.table_schema} | Table: ${row.table_name} | Type: ${row.table_type}`);
      }
    }

    console.log('\n===== 2. 列出 public schema 中的所有表 =====');
    const allTablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    for (const row of allTablesRes.rows) {
      console.log(`  ${row.table_name}`);
    }

    console.log('\n===== 3. 列出所有 schema =====');
    const schemaRes = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
      ORDER BY schema_name;
    `);

    for (const row of schemaRes.rows) {
      console.log(`  ${row.schema_name}`);
    }

    console.log('\n===== 4. 检查 Neon 分支信息 =====');
    try {
      const branchRes = await client.query('SELECT current_database(), inet_server_addr(), inet_server_port()');
      console.log(`  Database: ${branchRes.rows[0].current_database}`);
      console.log(`  Server: ${branchRes.rows[0].inet_server_addr}:${branchRes.rows[0].inet_server_port}`);
    } catch {
      console.log('  无法获取服务器信息（权限不足）');
    }

    console.log('\n===== 5. 检查 _prisma_migrations 表内容 =====');
    try {
      const prismaMigRes = await client.query('SELECT migration_name, finished_at FROM _prisma_migrations ORDER BY started_at');
      console.log(`  记录数: ${prismaMigRes.rows.length}`);
      for (const row of prismaMigRes.rows) {
        console.log(`  ${row.migration_name} (finished: ${row.finished_at ? 'yes' : 'no'})`);
      }
    } catch {
      console.log('  _prisma_migrations 表不存在');
    }

    console.log('\n===== 6. 检查 __drizzle_migrations 表是否存在 =====');
    try {
      const drizzleMigRes = await client.query('SELECT * FROM __drizzle_migrations');
      console.log(`  ⚠️ __drizzle_migrations 表仍然存在！记录数: ${drizzleMigRes.rows.length}`);
    } catch {
      console.log('  ✅ __drizzle_migrations 表不存在（已清理）');
    }

  } catch (err: any) {
    console.error('❌ 查询失败:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

inspectDatabase();
