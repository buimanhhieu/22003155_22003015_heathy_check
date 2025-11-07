#!/bin/bash

# Script reset cache

echo "🔄 Đang reset cache..."

# Reset Metro bundler cache
echo "📦 Reset Metro bundler cache..."
npx expo start --clear

# Hoặc nếu muốn reset tất cả
# rm -rf node_modules/.cache
# rm -rf .expo
# rm -rf .metro

echo "✅ Reset cache hoàn tất!"

