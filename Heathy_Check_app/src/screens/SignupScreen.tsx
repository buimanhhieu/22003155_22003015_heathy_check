import React, { useState, useContext } from "react";
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Keyboard,
  Text,
} from "react-native";
import { TextInput, Button, HelperText } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
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
  const [isPasswordVisible, setIsPasswordVisible] = useState(true);
  const [loading, setLoading] = useState<boolean>(false);

  // ✅ 1. Sử dụng một object để quản lý lỗi cho từng trường
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const { register } = useContext(AuthContext);
  const navigation = useNavigation<AuthNavigationProp>();

  const handleSignup = async () => {
    Keyboard.dismiss();

    // ✅ 2. Logic validation chi tiết
    const newErrors = { fullName: "", email: "", password: "" };
    let isValid = true;

    if (!fullName) {
      newErrors.fullName = "Full name cannot be empty.";
      isValid = false;
    }
    if (!email) {
      newErrors.email = "Email cannot be empty.";
      isValid = false;
    } else if (!isEmailValid(email)) {
      newErrors.email = "Please enter a valid email address.";
      isValid = false;
    }
    if (!password) {
      newErrors.password = "Password cannot be empty.";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long.";
      isValid = false;
    }

    setErrors(newErrors);

    // Nếu không hợp lệ, dừng lại không gọi API
    if (!isValid) {
      return;
    }

    setLoading(true);
    try {
      const result = await register(fullName, email, password);
      Alert.alert(
        "Registration Successful!",
        result.message || "Your account has been created. Please sign in.",
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
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      {/* --- Full Name Input --- */}
      <Text style={styles.label}>Full Name</Text>
      <TextInput
        value={fullName}
        onChangeText={setFullName}
        style={styles.input}
        mode="outlined"
        // ... các props khác
      />
      <HelperText type="error" visible={!!errors.fullName}>
        {errors.fullName}
      </HelperText>

      {/* --- Email Input --- */}
      <Text style={styles.label}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        mode="outlined"
        // ... các props khác
      />
      {/* ✅ 3. Hiển thị lỗi tương ứng cho Email */}
      <HelperText type="error" visible={!!errors.email}>
        {errors.email}
      </HelperText>

      {/* --- Password Input --- */}
      <Text style={styles.label}>Password</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry={isPasswordVisible}
        mode="outlined"
        right={
          <TextInput.Icon
            icon={isPasswordVisible ? "eye-off" : "eye"}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          />
        }
        // ... các props khác
      />
      {/* ✅ 4. Hiển thị lỗi tương ứng cho Password */}
      <HelperText type="error" visible={!!errors.password}>
        {errors.password}
      </HelperText>

      <Button
        mode="contained"
        onPress={handleSignup}
        style={styles.button}
        labelStyle={styles.buttonText}
        loading={loading}
        disabled={loading}
      >
        Sign Up
      </Button>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={[styles.footerText, styles.link]}>Sign in</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ... styles không đổi
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1E232C",
    marginBottom: 30, // Tăng khoảng cách
    textAlign: "left",
  },
  label: {
    fontSize: 16,
    color: "#1E232C",
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#F7F8F9",
    borderColor: "#E8ECF4",
    borderWidth: 1,
    // Bỏ margin bottom để HelperText nằm sát hơn
  },
  button: {
    backgroundColor: "#00BCD4",
    borderRadius: 8,
    paddingVertical: 8,
    marginTop: 20, // Tăng khoảng cách
    marginBottom: 24,
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
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
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
