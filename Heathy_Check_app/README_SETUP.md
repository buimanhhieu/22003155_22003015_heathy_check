# Hướng dẫn Setup Project

## 1. Cài đặt Dependencies

```bash
npm install
```

## 2. Cấu hình API Base URL

### Cách 1: Sử dụng file .env (Khuyến nghị)

1. Copy file `.env.example` thành `.env`:
   ```bash
   cp .env.example .env
   ```
   Hoặc trên Windows:
   ```bash
   copy .env.example .env
   ```

2. Mở file `.env` và thay đổi `API_BASE_URL` thành địa chỉ IP của máy chạy backend:
   ```
   API_BASE_URL=http://YOUR_IP:8080/api
   ```

3. Để tìm địa chỉ IP của máy:
   - **Windows**: Chạy `ipconfig` trong Command Prompt, tìm `IPv4 Address`
   - **Mac/Linux**: Chạy `ifconfig` hoặc `ip addr`, tìm địa chỉ IP của network interface

### Cách 2: Sửa trực tiếp trong code (Không khuyến nghị)

Mở file `src/config/api.ts` và thay đổi giá trị `DEFAULT_API_BASE_URL`:
```typescript
const DEFAULT_API_BASE_URL = 'http://YOUR_IP:8080/api';
```

**Lưu ý**: Cách này không khuyến nghị vì sẽ bị commit và ảnh hưởng đến người khác.

## 3. Chạy ứng dụng

```bash
# Start Expo development server
npm start

# Hoặc
npx expo start
```

## 4. Troubleshooting

### Lỗi kết nối API

- Kiểm tra backend server đã chạy chưa
- Kiểm tra địa chỉ IP trong `.env` hoặc `src/config/api.ts` có đúng không
- Kiểm tra firewall có chặn port 8080 không
- Đảm bảo điện thoại và máy tính cùng một mạng WiFi

### Lỗi 401 Unauthorized

- Token đã hết hạn, cần đăng nhập lại
- Kiểm tra backend server có đang chạy không

## 5. Cấu trúc API Configuration

- `src/config/api.ts`: File cấu hình API base URL
- `src/api/config.ts`: Base Axios instance với interceptors
- `.env`: File environment variables (không được commit)
- `.env.example`: Template cho file .env (được commit)





