import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { TextInput, Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { AuthNavigationProp } from "../navigation/types";

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const { login } = useAuth();
  const navigation = useNavigation<AuthNavigationProp>();

  const handleLogin = async () => {
    setEmailError("");
    setPasswordError("");

    if (!email.trim()) {
      setEmailError("Vui lòng nhập địa chỉ email.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setEmailError("Vui lòng nhập địa chỉ email hợp lệ.");
      return;
    }

    if (!password) {
      setPasswordError("Vui lòng nhập mật khẩu.");
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (e: any) {
      // Hiển thị lỗi trực tiếp cho người dùng
      setPasswordError(e.message || "Đăng nhập thất bại, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            <View style={styles.content}>
              <View style={styles.header}>
                <Text style={styles.title}>Chào mừng trở lại! 👋</Text>
                <Text style={styles.subtitle}>Đăng nhập để tiếp tục sử dụng ứng dụng</Text>
              </View>

              <View style={styles.form}>
                {passwordError ? (
                  <Text style={[styles.fieldError, { textAlign: "center", marginBottom: 12 }]}>
                    {passwordError}
                  </Text>
                ) : null}

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    value={email}
                    onChangeText={text => {
                      setEmail(text);
                      if (emailError) setEmailError("");
                    }}
                    style={styles.input}
                    placeholder="Nhập địa chỉ email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    mode="outlined"
                    outlineColor="transparent"
                    activeOutlineColor="#00BCD4"
                    theme={{ roundness: 12 }}
                  />
                  {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Mật khẩu</Text>
                  <TextInput
                    value={password}
                    onChangeText={text => {
                      setPassword(text);
                      if (passwordError) setPasswordError("");
                    }}
                    style={styles.input}
                    placeholder="Nhập mật khẩu"
                    secureTextEntry={isPasswordVisible}
                    autoCapitalize="none"
                    mode="outlined"
                    outlineColor="transparent"
                    activeOutlineColor="#00BCD4"
                    theme={{ roundness: 12 }}
                    right={
                      <TextInput.Icon
                        icon={isPasswordVisible ? "eye-off" : "eye"}
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                      />
                    }
                  />
                </View>

                <Button
                  mode="contained"
                  onPress={handleLogin}
                  style={styles.button}
                  labelStyle={styles.buttonText}
                  loading={loading}
                  disabled={loading}
                >
                  Đăng nhập
                </Button>
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Chưa có tài khoản? </Text>
                <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
                  <Text style={[styles.footerText, styles.link]}>Đăng ký</Text>
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
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContainer: { flexGrow: 1 },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: "center" },
  header: { marginBottom: 40, alignItems: "center" },
  title: { fontSize: 32, fontWeight: "bold", color: "#1E232C", marginBottom: 8, textAlign: "center" },
  subtitle: { fontSize: 16, color: "#6A707C", textAlign: "center", lineHeight: 22 },
  form: { marginBottom: 32 },
  inputContainer: { marginBottom: 20 },
  fieldError: { color: "#FF3B30", fontSize: 14, marginTop: 4, marginLeft: 4 },
  label: { fontSize: 16, color: "#1E232C", marginBottom: 8, fontWeight: "600" },
  input: { backgroundColor: "#F7F8F9", borderColor: "#E8ECF4", borderWidth: 1 },
  button: { backgroundColor: "#00BCD4", borderRadius: 12, paddingVertical: 12, marginTop: 8 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  footer: { flexDirection: "row", justifyContent: "center", alignItems: "center", paddingBottom: 20 },
  footerText: { fontSize: 14, color: "#6A707C" },
  link: { color: "#00BCD4", fontWeight: "bold" },
});

export default LoginScreen;
