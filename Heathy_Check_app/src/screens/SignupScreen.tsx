import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Keyboard,
  Text,
  ScrollView,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { TextInput, Button, HelperText } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { AuthNavigationProp } from "../navigation/types";

// Hàm kiểm tra định dạng email bằng Regex
const isEmailValid = (email: string): boolean => {
  const emailRegex = /\S+@\S+\.\S+/;
  return emailRegex.test(email);
};

const SignupScreen: React.FC = () => {
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(true);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(true);
  const [loading, setLoading] = useState<boolean>(false);

  // Sử dụng một object để quản lý lỗi cho từng trường
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const { register } = useAuth();
  const navigation = useNavigation<AuthNavigationProp>();

  const handleSignup = async () => {
    Keyboard.dismiss();

    // Logic validation chi tiết
    const newErrors = { fullName: "", email: "", password: "", confirmPassword: "" };
    let isValid = true;

    if (!fullName.trim()) {
      newErrors.fullName = "Họ tên không được để trống.";
      isValid = false;
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = "Họ tên phải có ít nhất 2 ký tự.";
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = "Email không được để trống.";
      isValid = false;
    } else if (!isEmailValid(email)) {
      newErrors.email = "Vui lòng nhập địa chỉ email hợp lệ.";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Mật khẩu không được để trống.";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
      isValid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Xác nhận mật khẩu không được để trống.";
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";
      isValid = false;
    }

    setErrors(newErrors);

    // Nếu không hợp lệ, dừng lại không gọi API
    if (!isValid) {
      return;
    }

    setLoading(true);
    try {
      const result = await register(fullName.trim(), email.trim(), password);
      Alert.alert(
        "Đăng ký thành công!",
        result.message || "Tài khoản của bạn đã được tạo. Vui lòng đăng nhập.",
        [{ text: "OK", onPress: () => navigation.navigate("Login") }]
      );
    } catch (e: any) {
      // Hiển thị lỗi từ server nếu có
      setErrors((prev) => ({ ...prev, email: e.message }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Tạo tài khoản</Text>
              <Text style={styles.subtitle}>
                Điền thông tin để tạo tài khoản mới
              </Text>
            </View>

            <View style={styles.form}>
              {/* Full Name Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Họ và tên</Text>
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  style={styles.input}
                  mode="outlined"
                  placeholder="Nhập họ và tên của bạn"
                  placeholderTextColor="#8391A1"
                  outlineColor="transparent"
                  activeOutlineColor="#00BCD4"
                  theme={{ roundness: 12 }}
                />
                <HelperText type="error" visible={!!errors.fullName} style={styles.errorText}>
                  {errors.fullName}
                </HelperText>
              </View>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                  keyboardType="email-address"
                  mode="outlined"
                  placeholder="Nhập địa chỉ email"
                  placeholderTextColor="#8391A1"
                  autoCapitalize="none"
                  outlineColor="transparent"
                  activeOutlineColor="#00BCD4"
                  theme={{ roundness: 12 }}
                />
                <HelperText type="error" visible={!!errors.email} style={styles.errorText}>
                  {errors.email}
                </HelperText>
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Mật khẩu</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  style={styles.input}
                  secureTextEntry={isPasswordVisible}
                  mode="outlined"
                  placeholder="Nhập mật khẩu"
                  placeholderTextColor="#8391A1"
                  autoCapitalize="none"
                  outlineColor="transparent"
                  activeOutlineColor="#00BCD4"
                  theme={{ roundness: 12 }}
                  right={
                    <TextInput.Icon
                      icon={isPasswordVisible ? "eye-off" : "eye"}
                      onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                      iconColor="#6A707C"
                    />
                  }
                />
                <HelperText type="error" visible={!!errors.password} style={styles.errorText}>
                  {errors.password}
                </HelperText>
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Xác nhận mật khẩu</Text>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  style={styles.input}
                  secureTextEntry={isConfirmPasswordVisible}
                  mode="outlined"
                  placeholder="Nhập lại mật khẩu"
                  placeholderTextColor="#8391A1"
                  autoCapitalize="none"
                  outlineColor="transparent"
                  activeOutlineColor="#00BCD4"
                  theme={{ roundness: 12 }}
                  right={
                    <TextInput.Icon
                      icon={isConfirmPasswordVisible ? "eye-off" : "eye"}
                      onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                      iconColor="#6A707C"
                    />
                  }
                />
                <HelperText type="error" visible={!!errors.confirmPassword} style={styles.errorText}>
                  {errors.confirmPassword}
                </HelperText>
              </View>

              <Button
                mode="contained"
                onPress={handleSignup}
                style={styles.button}
                labelStyle={styles.buttonText}
                loading={loading}
                disabled={loading}
              >
                Tạo tài khoản
              </Button>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Đã có tài khoản? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={[styles.footerText, styles.link]}>Đăng nhập</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  header: {
    marginBottom: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1E232C",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6A707C",
    textAlign: "center",
    lineHeight: 22,
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#1E232C",
    marginBottom: 8,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#F7F8F9",
    borderColor: "#E8ECF4",
    borderWidth: 1,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
  },
  button: {
    backgroundColor: "#00BCD4",
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: "#6A707C",
  },
  link: {
    color: "#00BCD4",
    fontWeight: "bold",
  },
});

export default SignupScreen;