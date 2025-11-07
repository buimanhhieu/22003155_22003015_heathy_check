@echo off
REM Script setup project cho Windows

echo 🚀 Đang setup project...

REM Kiểm tra Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js chưa được cài đặt. Vui lòng cài đặt Node.js trước.
    exit /b 1
)

echo ✅ Node.js version:
node -v

REM Kiểm tra npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm chưa được cài đặt.
    exit /b 1
)

echo ✅ npm version:
npm -v

REM Cài đặt dependencies
echo 📦 Đang cài đặt dependencies...
call npm install

REM Kiểm tra Expo CLI
where expo >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 📦 Đang cài đặt Expo CLI globally...
    call npm install -g expo-cli
)

echo ✅ Expo CLI version:
expo --version

REM Clear cache
echo 🧹 Đang xóa cache...

echo ✅ Setup hoàn tất!
echo 📝 Chạy 'npm start' để khởi động project

pause

