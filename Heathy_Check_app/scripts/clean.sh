#!/bin/bash

# Script clean project

echo "🧹 Đang dọn dẹp project..."

# Xóa node_modules
if [ -d "node_modules" ]; then
    echo "📦 Xóa node_modules..."
    rm -rf node_modules
fi

# Xóa package-lock.json
if [ -f "package-lock.json" ]; then
    echo "📄 Xóa package-lock.json..."
    rm package-lock.json
fi

# Xóa cache Expo
if [ -d ".expo" ]; then
    echo "🗑️  Xóa .expo cache..."
    rm -rf .expo
fi

# Xóa cache Metro
if [ -d ".metro" ]; then
    echo "🗑️  Xóa .metro cache..."
    rm -rf .metro
fi

# Xóa build Android
if [ -d "android/app/build" ]; then
    echo "🤖 Xóa Android build..."
    rm -rf android/app/build
fi

# Xóa build iOS
if [ -d "ios/build" ]; then
    echo "🍎 Xóa iOS build..."
    rm -rf ios/build
fi

echo "✅ Dọn dẹp hoàn tất!"
echo "📝 Chạy 'npm install' để cài đặt lại dependencies"

