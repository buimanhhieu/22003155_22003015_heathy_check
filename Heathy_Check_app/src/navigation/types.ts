import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// �?nh nghia c�c m�n h�nh trong lu?ng x�c th?c (chua dang nh?p)
export type AuthStackParamList = {
  Onboarding: undefined; // <-- THÊM DÒNG NÀY
  Login: undefined;
  Signup: undefined;
};
export type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
// �?nh nghia c�c m�n h�nh trong lu?ng ch�nh c?a ?ng d?ng (d� dang nh?p)
export type AppTabParamList = {
  Dashboard: undefined;
  Home: undefined;
  Profile: undefined;
};

export type PostLoginStackParamList = {
  UserProfile: undefined;
  UserGoal: undefined;
};

export type DashboardStackParamList = {
  DashboardMain: undefined;
  AllHealthData: undefined;
  Settings: undefined;
  StepsChart: undefined;
  Nutrition: undefined;
  AddMeal: {
    mealLog?: any;
  };
  CycleTracking: undefined;
  Sleep: undefined;
  ArticleDetail: {
    articleId: number;
    title: string;
    image?: string;
  };
  PrivacyPolicy: undefined;
  Help: undefined;
  About: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  PrivacyPolicy: undefined;
  Help: undefined;
  About: undefined;
  CycleTracking: undefined;
  ArticleDetail: {
    articleId: number;
    title: string;
    image?: string;
  };
};

export type HomeStackParamList = {
  HomeMain: undefined;
  ArticleDetail: {
    articleId: number;
    title: string;
    image?: string;
  };
  AllArticles: {
    categoryId?: number;
    sortBy?: string;
  };
};

export type PostLoginOnboardingNavigationProp = NativeStackNavigationProp<PostLoginStackParamList>;
