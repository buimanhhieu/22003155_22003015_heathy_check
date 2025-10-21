// File này định nghĩa các kiểu dữ liệu dùng chung trong ứng dụng, đặc biệt là cho API responses/requests.

// DTO cho response khi đăng nhập thành công
export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  fullName: string;
  email: string;
}

// DTO cho profile information
export interface UserProfile {
  userId: number;
  dateOfBirth: string;
  avatar?: string;
  heightCm: number;
  weightKg: number;
  gender: string;
}

// DTO chứa thông tin user cơ bản
export interface UserInfo {
  id: number;
  email: string;
  fullName: string;
  token: string;
  profile?: UserProfile;
}