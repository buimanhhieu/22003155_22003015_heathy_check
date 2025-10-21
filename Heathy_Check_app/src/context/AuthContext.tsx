import React, { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import authApi from "../api/authApi";
import userApi from "../api/userApi";
import { AuthResponse, UserInfo } from "../types";
import { clearAllStorage, hasUserData } from "../utils/storageUtils";

interface AuthContextType {
  isLoading: boolean;
  isLoginInProgress: boolean;
  userToken: string | null;
  userInfo: UserInfo | null;
  isProfileComplete: boolean | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<any>;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
  updateUserInfo: (updatedInfo: UserInfo) => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginInProgress, setIsLoginInProgress] = useState(false);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null);

  const checkProfileStatus = async (userId: number) => {
    try {
      const { data: profileData } = await userApi.get(`/${userId}/profile`);
      const complete = Boolean(profileData?.dateOfBirth && profileData?.gender && profileData?.heightCm && profileData?.weightKg);
      const onboardingKey = `onboardingShown:${userId}`;
      if (complete) await AsyncStorage.setItem(onboardingKey, "1");
      setIsProfileComplete(complete);
    } catch {
      setIsProfileComplete(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoginInProgress(true);
    try {
      const { data } = await authApi.post<AuthResponse>("/signin", { email, password });
      const { token, ...userData } = data;
      const fullUserInfo = { ...userData, token };

      // Chỉ set state khi login thành công
      setUserToken(token);
      setUserInfo(fullUserInfo);
      await AsyncStorage.setItem("userToken", token);
      await AsyncStorage.setItem("userInfo", JSON.stringify(fullUserInfo));

      // Load avatar từ server nếu có
      try {
        const { data: profileData } = await userApi.get(`/${userData.id}/profile`);
        if (profileData.avatar) {
          const updatedInfo = {
            ...fullUserInfo,
            profile: {
              userId: userData.id,
              dateOfBirth: profileData.dateOfBirth || '',
              avatar: profileData.avatar,
              gender: profileData.gender || '',
              heightCm: profileData.heightCm || 0,
              weightKg: profileData.weightKg || 0
            }
          };
          setUserInfo(updatedInfo);
          await AsyncStorage.setItem("userInfo", JSON.stringify(updatedInfo));
        }
      } catch (e) {
        // Avatar không có hoặc lỗi load, không ảnh hưởng đến login
      }

      // Kiểm tra onboarding
      const onboardingKey = `onboardingShown:${userData.id}`;
      const alreadyShown = await AsyncStorage.getItem(onboardingKey);
      if (!alreadyShown) await checkProfileStatus(userData.id);
      else setIsProfileComplete(true);

    } catch (error: any) {
      console.log("AuthContext login error:", error.response?.status, error.message);

      if (error.response?.status === 401) {
        throw new Error("Tài khoản hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.");
      } else {
        throw new Error(error.response?.data?.message || "Đăng nhập thất bại, vui lòng thử lại.");
      }
    } finally {
      setIsLoginInProgress(false);
    }
  };

  const register = async (fullName: string, email: string, password: string) => {
    try {
      const { data } = await authApi.post("/signup", { fullName, email, password });
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Đăng ký thất bại, vui lòng thử lại.");
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setUserToken(null);
    setUserInfo(null);
    setIsProfileComplete(null);
    try {
      await clearAllStorage();
    } catch {}
    setIsLoading(false);
  };

  const completeOnboarding = async () => {
    setIsProfileComplete(true);
    if (userInfo?.id) await AsyncStorage.setItem(`onboardingShown:${userInfo.id}`, "1");
  };

  const resetOnboarding = async () => {
    if (userInfo?.id) {
      await AsyncStorage.removeItem(`onboardingShown:${userInfo.id}`);
      setIsProfileComplete(false);
    }
  };

  const isLoggedIn = async () => {
    setIsLoading(true);
    try {
      const hasData = await hasUserData();
      if (hasData) {
        const token = await AsyncStorage.getItem("userToken");
        const infoString = await AsyncStorage.getItem("userInfo");
        if (token && infoString) {
          const info = JSON.parse(infoString) as UserInfo;
          setUserToken(token);
          setUserInfo(info);

          const onboardingKey = `onboardingShown:${info.id}`;
          const alreadyShown = await AsyncStorage.getItem(onboardingKey);
          if (alreadyShown === "1") setIsProfileComplete(true);
          else await checkProfileStatus(info.id);
        }
      }
    } catch {
      setIsProfileComplete(false);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserInfo = async (updatedInfo: UserInfo) => {
    try {
      setUserInfo(updatedInfo);
      await AsyncStorage.setItem("userInfo", JSON.stringify(updatedInfo));
    } catch (error) {
      console.error("Error updating user info:", error);
    }
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isLoginInProgress,
        userToken,
        userInfo,
        isProfileComplete,
        login,
        logout,
        register,
        completeOnboarding,
        resetOnboarding,
        updateUserInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
