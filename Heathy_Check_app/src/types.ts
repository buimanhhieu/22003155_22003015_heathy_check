// File này d?nh nghia các ki?u d? li?u dùng chung trong ?ng d?ng, d?c bi?t là cho API responses/requests.

// DTO cho response khi dang nh?p thành công
export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
}

// DTO ch?a thông tin user co b?n
export interface UserInfo {
  id: number;
  username: string;
  email: string;
}
