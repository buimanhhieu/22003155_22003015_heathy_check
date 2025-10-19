// File n�y d?nh nghia c�c ki?u d? li?u d�ng chung trong ?ng d?ng, d?c bi?t l� cho API responses/requests.

// DTO cho response khi dang nh?p th�nh c�ng
export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  fullName: string;
  email: string;
}

// DTO ch?a th�ng tin user co b?n
export interface UserInfo {
  id: number;
  email: string;
  fullName: string;
  token: string; 
}
