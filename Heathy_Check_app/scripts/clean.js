#!/usr/bin/env node

/**
 * Script clean project - Cross-platform
 */

const fs = require('fs');
const path = require('path');

const dirsToRemove = [
  'node_modules',
  '.expo',
  '.metro',
  'android/app/build',
  'ios/build',
];

const filesToRemove = [
  'package-lock.json',
];

console.log('🧹 Đang dọn dẹp project...\n');

// Xóa thư mục
dirsToRemove.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (fs.existsSync(fullPath)) {
    console.log(`📦 Xóa ${dir}...`);
    fs.rmSync(fullPath, { recursive: true, force: true });
  }
});

// Xóa file
filesToRemove.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    console.log(`📄 Xóa ${file}...`);
    fs.unlinkSync(fullPath);
  }
});

console.log('\n✅ Dọn dẹp hoàn tất!');
console.log('📝 Chạy \'npm install\' để cài đặt lại dependencies');

