import React, { useState, useContext } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Keyboard,
} from "react-native";
import { TextInput, Button, HelperText } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import { AuthNavigationProp } from "../navigation/types";

const LoginScreen: React.FC = () => {
  // Sửa lại state để dùng email
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const { login } = useContext(AuthContext);
  const navigation = useNavigation<AuthNavigationProp>();

  const handleLogin = async () => {
    Keyboard.dismiss(); // Ẩn bàn phím
    if (!email || !password) {
      setError("Email and password cannot be empty.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // Gọi hàm login với email và password
      await login(email, password);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back 👋</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        placeholder="Enter email"
        placeholderTextColor="#8391A1"
        keyboardType="email-address"
        autoCapitalize="none"
        mode="outlined"
        outlineColor="transparent"
        activeOutlineColor="#00BCD4"
        theme={{ roundness: 8 }}
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        placeholder="Enter password"
        placeholderTextColor="#8391A1"
        secureTextEntry={isPasswordVisible}
        autoCapitalize="none"
        mode="outlined"
        outlineColor="transparent"
        activeOutlineColor="#00BCD4"
        theme={{ roundness: 8 }}
        right={
          <TextInput.Icon
            icon={isPasswordVisible ? "eye-off" : "eye"}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          />
        }
      />

      <HelperText type="error" visible={!!error} style={styles.errorText}>
        {error}
      </HelperText>

      <Button
        mode="contained"
        onPress={handleLogin}
        style={styles.button}
        labelStyle={styles.buttonText}
        loading={loading}
        disabled={loading}
      >
        Sign In
      </Button>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
          <Text style={[styles.footerText, styles.link]}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Toàn bộ styles được viết lại để khớp với thiết kế
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
    marginBottom: 40,
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
    marginBottom: 16,
    borderColor: "#E8ECF4",
    borderWidth: 1,
  },
  forgotPassword: {
    fontSize: 14,
    color: "#6A707C",
    textAlign: "right",
    marginBottom: 20,
  },
  errorText: {
    textAlign: "center",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#00BCD4", // Màu xanh cyan
    borderRadius: 8,
    paddingVertical: 8,
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
    color: "#00BCD4", // Màu xanh cyan
    fontWeight: "bold",
  },
});

export default LoginScreen;
