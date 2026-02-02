/**
 * 数据库重置脚本
 * 用于删除并重建 MySQL 和 MongoDB 数据库
 */

import mysql from 'mysql2/promise';
import { MongoClient } from 'mongodb';

// 从环境变量读取配置
const MYSQL_HOST = process.env.MYSQL_HOST || 'localhost';
const MYSQL_PORT = parseInt(process.env.MYSQL_PORT || '3306');
const MYSQL_USER = process.env.MYSQL_USER || 'root';
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || '';
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || 'E_Bench';

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017';
const MONGODB_DATABASE = process.env.MONGODB_DATABASE || 'E_Bench';

async function resetMySQL() {
  console.log('🔄 正在重置 MySQL 数据库...');
  
  try {
    // 连接到 MySQL（不指定数据库）
    const connection = await mysql.createConnection({
      host: MYSQL_HOST,
      port: MYSQL_PORT,
      user: MYSQL_USER,
      password: MYSQL_PASSWORD,
    });

    // 删除数据库（如果存在）
    await connection.query(`DROP DATABASE IF EXISTS \`${MYSQL_DATABASE}\``);
    console.log(`  ✓ 删除数据库: ${MYSQL_DATABASE}`);

    // 创建数据库
    await connection.query(
      `CREATE DATABASE \`${MYSQL_DATABASE}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log(`  ✓ 创建数据库: ${MYSQL_DATABASE}`);

    await connection.end();
    console.log('✅ MySQL 数据库重置成功！\n');
    return true;
  } catch (error: any) {
    console.error('❌ MySQL 重置失败:', error.message);
    return false;
  }
}

async function resetMongoDB() {
  console.log('🔄 正在重置 MongoDB 数据库...');
  
  try {
    const client = new MongoClient(MONGODB_URL);
    await client.connect();

    // 删除数据库
    await client.db(MONGODB_DATABASE).dropDatabase();
    console.log(`  ✓ 删除数据库: ${MONGODB_DATABASE}`);

    await client.close();
    console.log('✅ MongoDB 数据库重置成功！\n');
    return true;
  } catch (error: any) {
    console.error('❌ MongoDB 重置失败:', error.message);
    return false;
  }
}

async function main() {
  console.log('\n========================================');
  console.log('     数据库重置工具');
  console.log('========================================\n');
  
  console.log('配置信息:');
  console.log(`  MySQL: ${MYSQL_USER}@${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DATABASE}`);
  console.log(`  MongoDB: ${MONGODB_URL}/${MONGODB_DATABASE}\n`);

  // 重置 MySQL
  const mysqlSuccess = await resetMySQL();

  // 重置 MongoDB
  const mongoSuccess = await resetMongoDB();

  console.log('========================================');
  if (mysqlSuccess && mongoSuccess) {
    console.log('✅ 所有数据库重置成功！');
    console.log('\n下一步：运行 npm run db:push 来创建表结构');
  } else {
    console.log('⚠️  部分数据库重置失败，请检查错误信息');
    process.exit(1);
  }
  console.log('========================================\n');
}

main().catch((error) => {
  console.error('💥 发生错误:', error);
  process.exit(1);
});
