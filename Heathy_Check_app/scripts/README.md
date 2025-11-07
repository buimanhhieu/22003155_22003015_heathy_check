# Scripts hữu ích cho project

## Các script có sẵn

### 1. Setup Script
Cài đặt dependencies và setup project ban đầu.

**Windows:**
```bash
scripts\setup.bat
```

**Linux/Mac:**
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### 2. Clean Script
Xóa các file cache và build không cần thiết.

**Windows:**
```bash
scripts\clean.bat
```

**Linux/Mac:**
```bash
chmod +x scripts/clean.sh
./scripts/clean.sh
```

**Hoặc dùng npm:**
```bash
npm run clean
```

### 3. Reset Cache Script
Reset cache của Metro bundler.

**Windows:**
```bash
scripts\reset-cache.bat
```

**Linux/Mac:**
```bash
chmod +x scripts/reset-cache.sh
./scripts/reset-cache.sh
```

**Hoặc dùng npm:**
```bash
npm run reset-cache
```

## Các lệnh npm scripts

### Development
- `npm start` - Khởi động Expo development server
- `npm run android` - Chạy trên Android
- `npm run ios` - Chạy trên iOS
- `npm run web` - Chạy trên web browser

### Build
- `npm run build:android` - Build APK cho Android
- `npm run build:ios` - Build cho iOS

### Utilities
- `npm run clean` - Dọn dẹp project
- `npm run reset-cache` - Reset cache
- `npm run setup` - Setup project
- `npm run type-check` - Kiểm tra TypeScript types

## Lưu ý

- Trên Linux/Mac, cần chmod +x để chạy các file .sh
- Các script .bat dành cho Windows
- Script clean.js là cross-platform, có thể chạy trên mọi OS

