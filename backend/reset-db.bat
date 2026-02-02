@echo off
chcp 65001 >nul
echo ========================================
echo 数据库重置脚本
echo ========================================
echo.

REM 设置 MySQL 密码
set MYSQL_PASSWORD=20021122

REM 尝试找到 MySQL 路径
set MYSQL_PATH=
if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" (
    set MYSQL_PATH=C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe
)
if exist "C:\Program Files\MySQL\MySQL Server 8.1\bin\mysql.exe" (
    set MYSQL_PATH=C:\Program Files\MySQL\MySQL Server 8.1\bin\mysql.exe
)
if exist "C:\xampp\mysql\bin\mysql.exe" (
    set MYSQL_PATH=C:\xampp\mysql\bin\mysql.exe
)

if "%MYSQL_PATH%"=="" (
    echo 错误: 找不到 MySQL 安装路径
    echo 请手动执行以下 SQL 命令:
    echo DROP DATABASE IF EXISTS eprint_db;
    echo CREATE DATABASE eprint_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    echo.
    goto :mongo
)

echo 步骤 1: 删除并重建 MySQL 数据库
echo ========================================
echo 正在删除并重建 eprint_db 数据库...

"%MYSQL_PATH%" -u root -p%MYSQL_PASSWORD% -e "DROP DATABASE IF EXISTS E_Bench; CREATE DATABASE E_Bench CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

if %ERRORLEVEL% EQU 0 (
    echo ✓ MySQL 数据库已重置
) else (
    echo ✗ MySQL 数据库重置失败，请检查密码和连接
    echo 尝试手动执行:
    echo mysql -u root -p20021122 -e "DROP DATABASE IF EXISTS E_Bench; CREATE DATABASE E_Bench CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
)
echo.

:mongo
echo 步骤 2: 删除 MongoDB 数据库
echo ========================================
echo 正在删除 eprint_db 数据库...

where mongosh >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    mongosh --eval "use E_Bench_Logs; db.dropDatabase()" --quiet
    echo ✓ MongoDB 数据库已删除
) else (
    where mongo >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo "use E_Bench_Logs; db.dropDatabase()" | mongo --quiet
        echo ✓ MongoDB 数据库已删除
    ) else (
        echo 警告: 找不到 mongosh 或 mongo 命令
        echo 请手动执行: mongosh
        echo 然后执行: use E_Bench_Logs
        echo 然后执行: db.dropDatabase()
    )
)
echo.

echo 步骤 3: 重新生成 Prisma Client
echo ========================================
call npm run db:generate
if %ERRORLEVEL% EQU 0 (
    echo ✓ Prisma Client 生成成功
) else (
    echo ✗ Prisma Client 生成失败
    exit /b 1
)
echo.

echo 步骤 4: 推送数据库结构
echo ========================================
echo 正在推送 MySQL 结构...
call npm run db:push:mysql
echo.

echo 正在推送 MongoDB 结构...
call npm run db:push:mongo
echo.

echo ========================================
echo 数据库重置完成！
echo ========================================
echo.
echo 现在可以运行: npm run dev
pause
