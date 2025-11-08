# Hướng Dẫn Sử Dụng Chat AI Support

## Tổng Quan

Tính năng Chat AI Support sử dụng Spring AI với Google Gemini để cung cấp hỗ trợ thông minh cho người dùng. Chat box có khả năng:
- Đọc và trả lời câu hỏi dựa trên tài liệu hướng dẫn ứng dụng
- Truy cập và phân tích dữ liệu sức khỏe của người dùng để đưa ra tư vấn cá nhân hóa
- Trả lời bằng tiếng Việt một cách thân thiện và dễ hiểu

## Cấu Trúc

### Backend Components

1. **WebSocket Configuration** (`WebSocketConfig.java`)
   - Endpoint: `/ws/chat`
   - Hỗ trợ SockJS fallback
   - Message broker: `/topic` và `/queue`

2. **Chat Controller** (`ChatController.java`)
   - Xử lý WebSocket messages
   - Endpoints:
     - `/app/chat.sendMessage` - Gửi tin nhắn
     - `/app/chat.addUser` - Thêm user vào chat

3. **Chat AI Service** (`ChatAIService.java`)
   - Tích hợp với Google Gemini AI
   - Kết hợp documentation và user data để trả lời

4. **Document Service** (`DocumentService.java`)
   - Đọc file tài liệu từ `resources/docs/app_guide.txt`

5. **User Data Service** (`UserDataService.java`)
   - Lấy thông tin tổng hợp về user từ database
   - Bao gồm: profile, goals, health data, meal logs, menstrual cycle

6. **REST Endpoint** (`ChatRestController.java`)
   - `GET /api/chat/current-user` - Lấy thông tin user hiện tại

## Cấu Hình

### Application Properties

```properties
# Spring AI Gemini Configuration
spring.ai.google.gemini.api-key=AIzaSyBYUH5YokieiVTj8Hx0C7W_QxH9_wXZ7D4
spring.ai.google.gemini.chat.options.model=gemini-pro
```

### Dependencies (pom.xml)

```xml
<!-- Spring AI -->
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-google-gemini-spring-boot-starter</artifactId>
    <version>1.0.0-M4</version>
</dependency>
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-document-reader-text</artifactId>
    <version>1.0.0-M4</version>
</dependency>
```

## Cách Sử Dụng (Frontend)

### 1. Kết Nối WebSocket

```javascript
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const socket = new SockJS('http://localhost:8080/ws/chat');
const stompClient = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
});

stompClient.activate();
```

### 2. Lấy User ID

Trước khi gửi message, cần lấy userId từ REST API:

```javascript
// Lấy thông tin user hiện tại
const response = await fetch('http://localhost:8080/api/chat/current-user', {
    headers: {
        'Authorization': `Bearer ${token}`
    }
});
const userData = await response.json();
const userId = userData.userId;
```

### 3. Join Chat

```javascript
stompClient.onConnect = () => {
    // Join chat
    const joinMessage = {
        content: '',
        sender: userData.fullName,
        type: 'JOIN',
        userId: userId
    };
    stompClient.publish({
        destination: '/app/chat.addUser',
        body: JSON.stringify(joinMessage)
    });
    
    // Subscribe để nhận messages
    stompClient.subscribe('/topic/public', (message) => {
        const chatMessage = JSON.parse(message.body);
        // Hiển thị message
        displayMessage(chatMessage);
    });
};
```

### 4. Gửi Message

```javascript
function sendMessage(messageContent) {
    const chatMessage = {
        content: messageContent,
        sender: userData.fullName,
        type: 'CHAT',
        userId: userId
    };
    
    stompClient.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify(chatMessage)
    });
}
```

## Message Format

### ChatMessage DTO

```json
{
    "content": "Nội dung tin nhắn",
    "sender": "Tên người gửi",
    "type": "CHAT | JOIN | LEAVE",
    "userId": 123
}
```

## Tài Liệu Hướng Dẫn

File tài liệu được lưu tại: `src/main/resources/docs/app_guide.txt`

Tài liệu bao gồm:
- Hướng dẫn đăng ký và đăng nhập
- Thiết lập hồ sơ người dùng
- Theo dõi sức khỏe hàng ngày
- Quản lý dinh dưỡng
- Theo dõi giấc ngủ
- Theo dõi chu kỳ kinh nguyệt
- Đọc bài viết về sức khỏe
- Các tính năng khác

## Dữ Liệu Người Dùng

AI có thể truy cập các thông tin sau của người dùng:
- Thông tin cơ bản (email, họ tên)
- Hồ sơ (ngày sinh, giới tính, chiều cao, cân nặng)
- Mục tiêu (bước chân, calo, mức độ hoạt động, giờ ngủ/thức)
- Dữ liệu sức khỏe 7 ngày gần đây
- Bữa ăn hôm nay
- Chu kỳ kinh nguyệt (nếu có)

## Bảo Mật

- WebSocket endpoint (`/ws/**`) được cấu hình để cho phép truy cập
- User ID được gửi trong message để xác định người dùng
- Có thể thêm authentication interceptor cho WebSocket nếu cần bảo mật cao hơn

## Lưu Ý

1. **API Key**: Gemini API key được lưu trong `application.properties`. Trong production, nên sử dụng environment variables hoặc secret management.

2. **Error Handling**: Service xử lý lỗi và trả về message thân thiện cho người dùng.

3. **Performance**: AI response có thể mất vài giây, nên hiển thị loading indicator.

4. **Rate Limiting**: Có thể cần thêm rate limiting để tránh abuse.

## Troubleshooting

### WebSocket không kết nối được
- Kiểm tra CORS configuration
- Đảm bảo WebSocket endpoint được permit trong SecurityConfig
- Kiểm tra firewall/proxy settings

### AI không trả lời
- Kiểm tra Gemini API key
- Kiểm tra logs để xem lỗi
- Đảm bảo dependencies Spring AI đã được cài đặt đúng

### Không lấy được user data
- Kiểm tra userId có được gửi đúng trong message
- Kiểm tra user có tồn tại trong database
- Kiểm tra authentication token

## Tương Lai

Có thể mở rộng thêm:
- Lưu lịch sử chat vào database
- Hỗ trợ file upload (ảnh, document)
- Voice input/output
- Multi-language support
- Chat history và search

