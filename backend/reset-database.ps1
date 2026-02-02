# 数据库重置脚本
# 此脚本将删除并重新创建 MySQL 和 MongoDB 数据库

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "数据库重置脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 .env 文件
if (-not (Test-Path .env)) {
    Write-Host "错误: 找不到 .env 文件" -ForegroundColor Red
    Write-Host "请先创建 .env 文件并配置数据库连接" -ForegroundColor Yellow
    exit 1
}

# 读取 .env 文件
$envContent = Get-Content .env -Raw
$mysqlUrl = ""
$mongoUrl = ""

if ($envContent -match 'MYSQL_URL="([^"]+)"') {
    $mysqlUrl = $matches[1]
} elseif ($envContent -match "MYSQL_URL=([^\r\n]+)") {
    $mysqlUrl = $matches[1]
}

if ($envContent -match 'MONGODB_URL="([^"]+)"') {
    $mongoUrl = $matches[1]
} elseif ($envContent -match "MONGODB_URL=([^\r\n]+)") {
    $mongoUrl = $matches[1]
}

if (-not $mysqlUrl) {
    Write-Host "错误: 在 .env 文件中找不到 MYSQL_URL" -ForegroundColor Red
    exit 1
}

if (-not $mongoUrl) {
    Write-Host "错误: 在 .env 文件中找不到 MONGODB_URL" -ForegroundColor Red
    exit 1
}

Write-Host "检测到数据库配置:" -ForegroundColor Green
Write-Host "MySQL: $mysqlUrl" -ForegroundColor Gray
Write-Host "MongoDB: $mongoUrl" -ForegroundColor Gray
Write-Host ""

# 解析 MySQL 连接信息
if ($mysqlUrl -match 'mysql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)') {
    $mysqlUser = $matches[1]
    $mysqlPass = $matches[2]
    $mysqlHost = $matches[3]
    $mysqlPort = $matches[4]
    $mysqlDb = $matches[5]
} else {
    Write-Host "错误: 无法解析 MySQL URL" -ForegroundColor Red
    exit 1
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "步骤 1: 删除 MySQL 数据库" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

# 删除 MySQL 数据库
Write-Host "正在删除 MySQL 数据库: $mysqlDb" -ForegroundColor Yellow

$mysqlCmd = "DROP DATABASE IF EXISTS \`$mysqlDb\`; CREATE DATABASE \`$mysqlDb\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

try {
    # 尝试使用 mysql 命令
    $mysqlPath = "mysql"
    $mysqlExists = Get-Command mysql -ErrorAction SilentlyContinue
    
    if (-not $mysqlExists) {
        # 尝试常见路径
        $commonPaths = @(
            "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe",
            "C:\Program Files\MySQL\MySQL Server 8.1\bin\mysql.exe",
            "C:\xampp\mysql\bin\mysql.exe"
        )
        
        foreach ($path in $commonPaths) {
            if (Test-Path $path) {
                $mysqlPath = $path
                break
            }
        }
    }
    
    if (Test-Path $mysqlPath -ErrorAction SilentlyContinue) {
        $env:MYSQL_PWD = $mysqlPass
        $result = & $mysqlPath -u $mysqlUser -h $mysqlHost -P $mysqlPort -e $mysqlCmd 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ MySQL 数据库已删除并重新创建" -ForegroundColor Green
        } else {
            Write-Host "警告: MySQL 命令执行可能失败，请手动执行以下命令:" -ForegroundColor Yellow
            Write-Host "mysql -u $mysqlUser -p -e `"DROP DATABASE IF EXISTS $mysqlDb; CREATE DATABASE $mysqlDb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`"" -ForegroundColor Gray
        }
    } else {
        Write-Host "警告: 找不到 mysql 命令，请手动执行以下命令:" -ForegroundColor Yellow
        Write-Host "mysql -u $mysqlUser -p -e `"DROP DATABASE IF EXISTS $mysqlDb; CREATE DATABASE $mysqlDb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`"" -ForegroundColor Gray
        Write-Host ""
        Write-Host "或者使用 MySQL Workbench 或其他工具执行:" -ForegroundColor Yellow
        Write-Host "DROP DATABASE IF EXISTS $mysqlDb;" -ForegroundColor Gray
        Write-Host "CREATE DATABASE $mysqlDb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" -ForegroundColor Gray
    }
} catch {
    Write-Host "警告: 无法自动删除 MySQL 数据库: $_" -ForegroundColor Yellow
    Write-Host "请手动执行以下 SQL 命令:" -ForegroundColor Yellow
    Write-Host "DROP DATABASE IF EXISTS $mysqlDb;" -ForegroundColor Gray
    Write-Host "CREATE DATABASE $mysqlDb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" -ForegroundColor Gray
}

Write-Host ""

# MongoDB 删除
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "步骤 2: 删除 MongoDB 数据库" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

# 解析 MongoDB 连接信息
if ($mongoUrl -match 'mongodb://([^:]+):(\d+)/(.+)') {
    $mongoHost = $matches[1]
    $mongoPort = $matches[2]
    $mongoDb = $matches[3]
} elseif ($mongoUrl -match 'mongodb://([^/]+)/(.+)') {
    $mongoHost = $matches[1]
    $mongoPort = "27017"
    $mongoDb = $matches[2]
} else {
    Write-Host "警告: 无法解析 MongoDB URL，跳过 MongoDB 删除" -ForegroundColor Yellow
    $mongoDb = ""
}

if ($mongoDb) {
    Write-Host "正在删除 MongoDB 数据库: $mongoDb" -ForegroundColor Yellow
    
    try {
        $mongoPath = "mongosh"
        $mongoExists = Get-Command mongosh -ErrorAction SilentlyContinue
        
        if (-not $mongoExists) {
            $mongoPath = "mongo"
            $mongoExists = Get-Command mongo -ErrorAction SilentlyContinue
        }
        
        if ($mongoExists) {
            $mongoCmd = "use $mongoDb; db.dropDatabase();"
            $result = echo $mongoCmd | & $mongoPath --quiet 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ MongoDB 数据库已删除" -ForegroundColor Green
            } else {
                Write-Host "警告: MongoDB 删除可能失败，请手动执行:" -ForegroundColor Yellow
                Write-Host "mongosh" -ForegroundColor Gray
                Write-Host "use $mongoDb" -ForegroundColor Gray
                Write-Host "db.dropDatabase()" -ForegroundColor Gray
            }
        } else {
            Write-Host "警告: 找不到 mongosh 或 mongo 命令" -ForegroundColor Yellow
            Write-Host "请手动执行以下命令:" -ForegroundColor Yellow
            Write-Host "mongosh" -ForegroundColor Gray
            Write-Host "use $mongoDb" -ForegroundColor Gray
            Write-Host "db.dropDatabase()" -ForegroundColor Gray
        }
    } catch {
        Write-Host "警告: 无法自动删除 MongoDB 数据库: $_" -ForegroundColor Yellow
        Write-Host "请手动执行:" -ForegroundColor Yellow
        Write-Host "mongosh" -ForegroundColor Gray
        Write-Host "use $mongoDb" -ForegroundColor Gray
        Write-Host "db.dropDatabase()" -ForegroundColor Gray
    }
} else {
    Write-Host "跳过 MongoDB 删除（无法解析数据库名）" -ForegroundColor Gray
}

Write-Host ""

# 重新生成 Prisma Client
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "步骤 3: 重新生成 Prisma Client" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "正在生成 Prisma Client..." -ForegroundColor Yellow
npm run db:generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Prisma Client 生成成功" -ForegroundColor Green
} else {
    Write-Host "✗ Prisma Client 生成失败" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 推送数据库结构
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "步骤 4: 推送数据库结构" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "正在推送 MySQL 数据库结构..." -ForegroundColor Yellow
npm run db:push:mysql

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ MySQL 数据库结构推送成功" -ForegroundColor Green
} else {
    Write-Host "✗ MySQL 数据库结构推送失败" -ForegroundColor Red
}

Write-Host ""
Write-Host "正在推送 MongoDB 数据库结构..." -ForegroundColor Yellow
npm run db:push:mongo

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ MongoDB 数据库结构推送成功" -ForegroundColor Green
} else {
    Write-Host "✗ MongoDB 数据库结构推送失败" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "数据库重置完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "现在可以运行: npm run dev" -ForegroundColor Yellow
