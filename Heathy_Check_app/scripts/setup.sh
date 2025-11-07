#!/bin/bash

# Script setup project
echo "🚀 Đang setup project..."

# Kiểm tra Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js chưa được cài đặt. Vui lòng cài đặt Node.js trước."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Kiểm tra npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm chưa được cài đặt."
    exit 1
fi

echo "✅ npm version: $(npm -v)"

# Cài đặt dependencies
echo "📦 Đang cài đặt dependencies..."
npm install

# Kiểm tra Expo CLI
if ! command -v expo &> /dev/null; then
    echo "📦 Đang cài đặt Expo CLI globally..."
    npm install -g expo-cli
fi

echo "✅ Expo CLI version: $(expo --version)"

# Clear cache
echo "🧹 Đang xóa cache..."
npm start -- --reset-cache

echo "✅ Setup hoàn tất!"
echo "📝 Chạy 'npm start' để khởi động project"

