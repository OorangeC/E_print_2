@echo off
cd /d "%~dp0"
set PATH=C:\Program Files\nodejs;%PATH%
set PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION=yes
call npx prisma db push --schema=prisma/mysql.prisma --force-reset --accept-data-loss
