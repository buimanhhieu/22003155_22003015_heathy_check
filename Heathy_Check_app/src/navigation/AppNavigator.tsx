// src/navigation/AppNavigator.tsx

import React, { useState, useEffect, useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { AuthContext } from "../context/AuthContext";
import { AuthStackParamList, AppTabParamList } from "./types";

// Import all your screens
import OnboardingScreen from "../screens/OnboardingScreen";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import LoadingScreen from "../screens/LoadingScreen";

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<AppTabParamList>();

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

const AppNavigator: React.FC = () => {
  const { isLoading: isAuthLoading, userToken } = useContext(AuthContext);
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  useEffect(() => {
    // This effect runs once when the navigator is mounted
    AsyncStorage.getItem("hasLaunched").then((value) => {
      if (value === null) {
        // If 'hasLaunched' is not set, it's the first launch
        AsyncStorage.setItem("hasLaunched", "true"); // Set the flag for future launches
        setIsFirstLaunch(true);
      } else {
        // If the flag exists, it's not the first launch
        setIsFirstLaunch(false);
      }
    });
    // The duplicated block has been removed from here
  }, []);

  // Show a loading screen while checking auth status OR first launch status
  if (isAuthLoading || isFirstLaunch === null) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {userToken !== null ? (
        <AppFlow />
      ) : (
        // Pass the first launch status to the AuthFlow
        <AuthFlow isFirstLaunch={isFirstLaunch} />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
