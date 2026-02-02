#!/bin/bash

# 数据库重置脚本 (Linux/macOS)
# 此脚本将删除并重新创建 MySQL 和 MongoDB 数据库

echo "========================================"
echo "数据库重置脚本"
echo "========================================"
echo ""

# 检查 .env 文件
if [ ! -f .env ]; then
    echo "错误: 找不到 .env 文件"
    echo "请先创建 .env 文件并配置数据库连接"
    exit 1
fi

# 读取 .env 文件
source .env

if [ -z "$MYSQL_URL" ]; then
    echo "错误: 在 .env 文件中找不到 MYSQL_URL"
    exit 1
fi

if [ -z "$MONGODB_URL" ]; then
    echo "错误: 在 .env 文件中找不到 MONGODB_URL"
    exit 1
fi

echo "检测到数据库配置:"
echo "MySQL: $MYSQL_URL"
echo "MongoDB: $MONGODB_URL"
echo ""

# 解析 MySQL 连接信息
if [[ $MYSQL_URL =~ mysql://([^:]+):([^@]+)@([^:]+):([0-9]+)/(.+) ]]; then
    MYSQL_USER="${BASH_REMATCH[1]}"
    MYSQL_PASS="${BASH_REMATCH[2]}"
    MYSQL_HOST="${BASH_REMATCH[3]}"
    MYSQL_PORT="${BASH_REMATCH[4]}"
    MYSQL_DB="${BASH_REMATCH[5]}"
else
    echo "错误: 无法解析 MySQL URL"
    exit 1
fi

echo "========================================"
echo "步骤 1: 删除 MySQL 数据库"
echo "========================================"

echo "正在删除 MySQL 数据库: $MYSQL_DB"

mysql -u "$MYSQL_USER" -p"$MYSQL_PASS" -h "$MYSQL_HOST" -P "$MYSQL_PORT" <<EOF
DROP DATABASE IF EXISTS \`$MYSQL_DB\`;
CREATE DATABASE \`$MYSQL_DB\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EOF

if [ $? -eq 0 ]; then
    echo "✓ MySQL 数据库已删除并重新创建"
else
    echo "✗ MySQL 数据库删除失败，请检查连接信息"
    exit 1
fi

echo ""

# MongoDB 删除
echo "========================================"
echo "步骤 2: 删除 MongoDB 数据库"
echo "========================================"

# 解析 MongoDB 连接信息
if [[ $MONGODB_URL =~ mongodb://([^:]+):([0-9]+)/(.+) ]]; then
    MONGO_HOST="${BASH_REMATCH[1]}"
    MONGO_PORT="${BASH_REMATCH[2]}"
    MONGO_DB="${BASH_REMATCH[3]}"
elif [[ $MONGODB_URL =~ mongodb://([^/]+)/(.+) ]]; then
    MONGO_HOST="${BASH_REMATCH[1]}"
    MONGO_PORT="27017"
    MONGO_DB="${BASH_REMATCH[2]}"
else
    echo "警告: 无法解析 MongoDB URL，跳过 MongoDB 删除"
    MONGO_DB=""
fi

if [ -n "$MONGO_DB" ]; then
    echo "正在删除 MongoDB 数据库: $MONGO_DB"
    
    mongosh "$MONGODB_URL" --eval "db.dropDatabase()" --quiet
    
    if [ $? -eq 0 ]; then
        echo "✓ MongoDB 数据库已删除"
    else
        echo "警告: MongoDB 删除可能失败，请手动执行:"
        echo "mongosh"
        echo "use $MONGO_DB"
        echo "db.dropDatabase()"
    fi
else
    echo "跳过 MongoDB 删除（无法解析数据库名）"
fi

echo ""

# 重新生成 Prisma Client
echo "========================================"
echo "步骤 3: 重新生成 Prisma Client"
echo "========================================"

echo "正在生成 Prisma Client..."
npm run db:generate

if [ $? -eq 0 ]; then
    echo "✓ Prisma Client 生成成功"
else
    echo "✗ Prisma Client 生成失败"
    exit 1
fi

echo ""

# 推送数据库结构
echo "========================================"
echo "步骤 4: 推送数据库结构"
echo "========================================"

echo "正在推送 MySQL 数据库结构..."
npm run db:push:mysql

if [ $? -eq 0 ]; then
    echo "✓ MySQL 数据库结构推送成功"
else
    echo "✗ MySQL 数据库结构推送失败"
fi

echo ""
echo "正在推送 MongoDB 数据库结构..."
npm run db:push:mongo

if [ $? -eq 0 ]; then
    echo "✓ MongoDB 数据库结构推送成功"
else
    echo "✗ MongoDB 数据库结构推送失败"
fi

echo ""
echo "========================================"
echo "数据库重置完成！"
echo "========================================"
echo ""
echo "现在可以运行: npm run dev"
