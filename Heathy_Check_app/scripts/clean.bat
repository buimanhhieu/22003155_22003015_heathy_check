@echo off
REM Script clean project cho Windows

echo 🧹 Đang dọn dẹp project...

REM Xóa node_modules
if exist "node_modules" (
    echo 📦 Xóa node_modules...
    rmdir /s /q node_modules
)

REM Xóa package-lock.json
if exist "package-lock.json" (
    echo 📄 Xóa package-lock.json...
    del /q package-lock.json
)

REM Xóa cache Expo
if exist ".expo" (
    echo 🗑️  Xóa .expo cache...
    rmdir /s /q .expo
)

REM Xóa cache Metro
if exist ".metro" (
    echo 🗑️  Xóa .metro cache...
    rmdir /s /q .metro
)

REM Xóa build Android
if exist "android\app\build" (
    echo 🤖 Xóa Android build...
    rmdir /s /q android\app\build
)

REM Xóa build iOS
if exist "ios\build" (
    echo 🍎 Xóa iOS build...
    rmdir /s /q ios\build
)

echo ✅ Dọn dẹp hoàn tất!
echo 📝 Chạy 'npm install' để cài đặt lại dependencies

pause

