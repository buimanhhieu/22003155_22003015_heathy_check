import React, { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import authApi from "../api/authApi";
import userApi from "../api/userApi";
import { AuthResponse, UserInfo } from "../types";

interface AuthContextType {
  isLoading: boolean;
  userToken: string | null;
  userInfo: UserInfo | null;
  isProfileComplete: boolean | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<any>;
  completeOnboarding: () => void;
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
  const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(
    null
  );

  const checkProfileStatus = async (userId: number) => {
    try {
      console.log(`[DEBUG] Checking profile for user ID: ${userId}`);
      const profileResponse = await userApi.get(`/${userId}/profile`);
      console.log(
        "[DEBUG] Server response for /profile:",
        JSON.stringify(profileResponse.data, null, 2)
      );

      const onboardingKey = `onboardingShown:${userId}`;
      const alreadyShown = await AsyncStorage.getItem(onboardingKey);

      const hasProfileDob = Boolean(profileResponse.data?.dateOfBirth);

      if (hasProfileDob) {
        // Có DOB → xem như hoàn tất và đảm bảo lần sau không show
        await AsyncStorage.setItem(onboardingKey, "1");
        setIsProfileComplete(true);
        console.log("[DEBUG] Profile complete -> set onboardingShown.");
      } else {
        if (alreadyShown) {
          // Chưa có DOB nhưng đã từng show → không show lại nữa
          setIsProfileComplete(true);
          console.log(
            "[DEBUG] Onboarding was already shown -> skip showing again."
          );
        } else {
          // Chưa có DOB và chưa từng show → show lần đầu
          setIsProfileComplete(false);
          console.log(
            "[DEBUG] Profile incomplete and first time -> show onboarding."
          );
        }
      }
    } catch (error: any) {
      console.error(
        "[DEBUG] Error checking profile status:",
        error.response?.data || error.message
      );
      // Lỗi khi check → không chặn luồng, nhưng coi như không show lại nếu đã từng show
      const onboardingKey = `onboardingShown:${userId}`;
      const alreadyShown = await AsyncStorage.getItem(onboardingKey);
      setIsProfileComplete(!!alreadyShown || false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data } = await authApi.post<AuthResponse>("/signin", {
        email,
        password,
      });
      const { token, ...userData } = data;
      const fullUserInfo = { ...userData, token };

      setUserToken(token);
      setUserInfo(fullUserInfo);
      await AsyncStorage.setItem("userToken", token);
      await AsyncStorage.setItem("userInfo", JSON.stringify(fullUserInfo));

      await checkProfileStatus(userData.id);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    fullName: string,
    email: string,
    password: string
  ) => {
    try {
      const { data } = await authApi.post("/signup", {
        fullName,
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
    setIsProfileComplete(false);
    await AsyncStorage.multiRemove(["userToken", "userInfo"]);
    setIsLoading(false);
  };

  const completeOnboarding = async () => {
    console.log(
      "[DEBUG] Onboarding complete! Setting isProfileComplete to true."
    );
    setIsProfileComplete(true);
    try {
      if (userInfo?.id) {
        await AsyncStorage.setItem(`onboardingShown:${userInfo.id}`, "1");
      }
    } catch (e) {
      console.error("Error persisting onboarding flag:", e);
    }
  };

  const isLoggedIn = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      const infoString = await AsyncStorage.getItem("userInfo");
      if (token && infoString) {
        const info = JSON.parse(infoString) as UserInfo;
        setUserToken(token);
        setUserInfo(info);
        await checkProfileStatus(info.id);
      } else {
        setIsProfileComplete(false);
      }
    } catch (e) {
      setIsProfileComplete(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        userToken,
        userInfo,
        isProfileComplete,
        login,
        logout,
        register,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
