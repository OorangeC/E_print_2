@echo off
cd /d "C:\Users\xic40\OneDrive\Desktop\E_print_2\backend"
set "PATH=C:\Program Files\nodejs;%PATH%"
set "PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION=yes"
echo Running prisma db push...
"C:\Program Files\nodejs\npx.cmd" prisma db push --schema=prisma/mysql.prisma --force-reset --accept-data-loss
echo Done with exit code: %ERRORLEVEL%
