import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// �?nh nghia c�c m�n h�nh trong lu?ng x�c th?c (chua dang nh?p)
export type AuthStackParamList = {
  Onboarding: undefined; // <-- THÊM DÒNG NÀY
  Login: undefined;
  Signup: undefined;
};

// �?nh nghia c�c m�n h�nh trong lu?ng ch�nh c?a ?ng d?ng (d� dang nh?p)
export type AppTabParamList = {
  Home: undefined;
  Profile: undefined;
};

// Type cho navigation prop d? s? d?ng v?i hook useNavigation trong c�c m�n h�nh Auth
export type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
