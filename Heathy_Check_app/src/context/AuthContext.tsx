import React, { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import authApi from "../api/authApi";
import { AuthResponse, UserInfo } from "../types";

// ✅ 1. Cập nhật kiểu dữ liệu cho Context
interface AuthContextType {
  isLoading: boolean;
  userToken: string | null;
  userInfo: UserInfo | null;
  login: (email: string, password: string) => Promise<void>; // Đổi username -> email
  logout: () => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<any>; // Bỏ username, thêm fullName
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  /**
   * 🔧 2. Cập nhật hàm login
   * - Đổi tham số `username` thành `email` để code rõ ràng hơn.
   */
  const login = async (email: string, password: string) => {
    try {
      const { data } = await authApi.post<AuthResponse>("/signin", {
        email, // Gửi đi email
        password,
      });
      const { token, ...userData } = data;

      setUserToken(token);
      setUserInfo(userData);

      await AsyncStorage.setItem("userToken", token);
      await AsyncStorage.setItem("userInfo", JSON.stringify(userData));
    } catch (error: any) {
      console.error(
        "Login failed:",
        error.response?.data?.message || error.message
      );
      throw new Error(
        error.response?.data?.message || "Email hoặc mật khẩu không đúng."
      );
    }
  };

  /**
   * 🔧 3. Cập nhật hàm register
   * - Thay `username` bằng `fullName` để khớp với backend.
   */
  const register = async (
    fullName: string,
    email: string,
    password: string
  ) => {
    try {
      const { data } = await authApi.post("/signup", {
        fullName, // Gửi đi fullName
        email,
        password,
      });
      return data;
    } catch (error: any) {
      console.error(
        "Registration failed:",
        error.response?.data?.message || error.message
      );
      throw new Error(
        error.response?.data?.message || "Đăng ký thất bại, vui lòng thử lại."
      );
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setUserToken(null);
    setUserInfo(null);
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("userInfo");
    setIsLoading(false);
  };

  const isLoggedIn = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      const infoString = await AsyncStorage.getItem("userInfo");

      if (token && infoString) {
        setUserToken(token);
        setUserInfo(JSON.parse(infoString) as UserInfo);
      }
    } catch (e) {
      console.error(`isLoggedIn error: ${e}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  return (
    <AuthContext.Provider
      value={{ isLoading, userToken, userInfo, login, logout, register }}
    >
      {children}
    </AuthContext.Provider>
  );
};
