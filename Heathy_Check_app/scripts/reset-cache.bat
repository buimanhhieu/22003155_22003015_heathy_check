@echo off
REM Script reset cache cho Windows

echo 🔄 Đang reset cache...

REM Reset Metro bundler cache
echo 📦 Reset Metro bundler cache...
call npx expo start --clear

echo ✅ Reset cache hoàn tất!

pause

