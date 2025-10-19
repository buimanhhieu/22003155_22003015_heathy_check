// src/navigation/AppNavigator.tsx

import React, { useState, useEffect, useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { AuthContext } from "../context/AuthContext";
import {
  AuthStackParamList,
  AppTabParamList,
  PostLoginStackParamList,
} from "./types"; // Giả sử bạn có PostLoginStackParamList

// Import tất cả các màn hình
import OnboardingScreen from "../screens/OnboardingScreen";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import LoadingScreen from "../screens/LoadingScreen";
import UserProfileScreen from "../screens/UserProfileScreen";
import UserGoalScreen from "../screens/UserGoalScreen";

// Khởi tạo các Stack và Tab Navigator
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const PostLoginStack = createNativeStackNavigator<PostLoginStackParamList>();
const Tab = createBottomTabNavigator<AppTabParamList>();

/**
 * Luồng 1: Xác thực (Khi chưa đăng nhập)
 * Quyết định hiển thị Onboarding hay Login dựa trên isFirstLaunch.
 */
function AuthFlow({ isFirstLaunch }: { isFirstLaunch: boolean }) {
  return (
    <AuthStack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={isFirstLaunch ? "Onboarding" : "Login"}
    >
      <AuthStack.Screen name="Onboarding" component={OnboardingScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
}

/**
 * Luồng 2: Cập nhật thông tin sau khi đăng nhập lần đầu
 */
function PostLoginOnboardingFlow() {
  return (
    <PostLoginStack.Navigator screenOptions={{ headerShown: false }}>
      <PostLoginStack.Screen name="UserProfile" component={UserProfileScreen} />
      <PostLoginStack.Screen name="UserGoal" component={UserGoalScreen} />
    </PostLoginStack.Navigator>
  );
}

/**
 * Luồng 3: Ứng dụng chính (Sau khi đã đăng nhập và hoàn thành profile)
 */
function AppFlow() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#6200ee" },
        headerTintColor: "#fff",
        tabBarActiveTintColor: "#6200ee",
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Cá nhân",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

/**
 * Component Navigator chính
 * Quyết định hiển thị luồng nào dựa trên trạng thái của người dùng.
 */
const AppNavigator: React.FC = () => {
  const { isLoading, userToken, isProfileComplete } = useContext(AuthContext);
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  useEffect(() => {
    // Kiểm tra xem đây có phải là lần đầu mở app không
    AsyncStorage.getItem("hasLaunched").then((value) => {
      if (value === null) {
        AsyncStorage.setItem("hasLaunched", "true");
        setIsFirstLaunch(true);
      } else {
        setIsFirstLaunch(false);
      }
    });
  }, []);

  // Hiển thị màn hình chờ trong khi kiểm tra trạng thái
  if (isLoading || isFirstLaunch === null || isProfileComplete === null) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {userToken !== null ? (
        // Nếu đã đăng nhập, kiểm tra xem profile đã hoàn thành chưa
        isProfileComplete ? (
          <AppFlow />
        ) : (
          <PostLoginOnboardingFlow />
        )
      ) : (
        // Nếu chưa đăng nhập, vào luồng xác thực
        <AuthFlow isFirstLaunch={isFirstLaunch} />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
