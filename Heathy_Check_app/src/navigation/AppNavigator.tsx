// src/navigation/AppNavigator.tsx

import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useAuth } from "../context/AuthContext";
import {
  AuthStackParamList,
  AppTabParamList,
  PostLoginStackParamList,
  DashboardStackParamList,
  ProfileStackParamList,
} from "./types"; // Giả sử bạn có PostLoginStackParamList

// Import tất cả các màn hình
import OnboardingScreen from "../screens/OnboardingScreen";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import DashboardScreen from "../screens/DashboardScreen";
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import LoadingScreen from "../screens/LoadingScreen";
import UserProfileScreen from "../screens/UserProfileScreen";
import UserGoalScreen from "../screens/UserGoalScreen";
import AllHealthDataScreen from "../screens/AllHealthDataScreen";
import SettingsScreen from "../screens/SettingsScreen";
import StepsChartScreen from "../screens/StepsChartScreen";
import PrivacyPolicyScreen from "../screens/PrivacyPolicyScreen";
import HelpScreen from "../screens/HelpScreen";
import AboutScreen from "../screens/AboutScreen";
import CycleTrackingScreen from "../screens/CycleTrackingScreen";
import ArticleDetailScreen from "../screens/ArticleDetailScreen";
import NutritionScreen from "../screens/NutritionScreen";
import AddMealScreen from "../screens/AddMealScreen";

// Khởi tạo các Stack và Tab Navigator
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const PostLoginStack = createNativeStackNavigator<PostLoginStackParamList>();
const DashboardStack = createNativeStackNavigator<DashboardStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
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
        headerShown: false,
        tabBarActiveTintColor: "#00BCD4",
        tabBarInactiveTintColor: "#666",
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStackNavigator}
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" color={color} size={size} />
          ),
        }}
      />
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
        component={ProfileStackNavigator}
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
 * Dashboard Stack Navigator
 */
function DashboardStackNavigator() {
  return (
    <DashboardStack.Navigator screenOptions={{ headerShown: false }}>
      <DashboardStack.Screen name="DashboardMain" component={DashboardScreen} />
      <DashboardStack.Screen name="AllHealthData" component={AllHealthDataScreen} />
      <DashboardStack.Screen name="Settings" component={SettingsScreen} />
      <DashboardStack.Screen name="StepsChart" component={StepsChartScreen} />
      <DashboardStack.Screen name="Nutrition" component={NutritionScreen} />
      <DashboardStack.Screen name="AddMeal" component={AddMealScreen} />
      <DashboardStack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <DashboardStack.Screen name="Help" component={HelpScreen} />
      <DashboardStack.Screen name="About" component={AboutScreen} />
      <DashboardStack.Screen name="CycleTracking" component={CycleTrackingScreen} />
      <DashboardStack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
    </DashboardStack.Navigator>
  );
}

/**
 * Profile Stack Navigator
 */
function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <ProfileStack.Screen name="Help" component={HelpScreen} />
      <ProfileStack.Screen name="About" component={AboutScreen} />
    </ProfileStack.Navigator>
  );
}

/**
 * Component Navigator chính
 * Quyết định hiển thị luồng nào dựa trên trạng thái của người dùng.
 */
const AppNavigator: React.FC = () => {
  const { isLoading, isLoginInProgress, userToken, isProfileComplete } = useAuth();
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
  if (isLoading || isFirstLaunch === null) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {userToken !== null ? (
        // Nếu đã đăng nhập, kiểm tra xem profile đã hoàn thành chưa
        isProfileComplete === true ? (
          <AppFlow />
        ) : isProfileComplete === false ? (
          <PostLoginOnboardingFlow />
        ) : (
          <LoadingScreen />
        )
      ) : (
        // Nếu chưa đăng nhập, vào luồng xác thực
        // Không remount LoginScreen khi login thất bại
        <AuthFlow isFirstLaunch={isFirstLaunch} />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
