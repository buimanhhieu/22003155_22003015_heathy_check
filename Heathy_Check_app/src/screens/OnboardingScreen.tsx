// src/screens/OnboardingScreen.js

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from "react-native";
import { Svg, Path } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import { AuthNavigationProp } from "../navigation/types";

const { width } = Dimensions.get("window");

const OnboardingScreen = () => {
  const navigation = useNavigation<AuthNavigationProp>();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#00BCD4" />

      {/* PHẦN 1: HÌNH ẢNH Ở TRÊN */}
      <View style={styles.topContainer}>
        <Image
          source={require("../../assets/bia.png")} // Đảm bảo đường dẫn này đúng
          style={styles.backgroundImage}
        />
      </View>

      {/* PHẦN 2: NỘI DUNG MÀU XANH BÊN DƯỚI */}
      <View style={styles.bottomContainer}>
        {/* SVG để vẽ đường cong */}
        <Svg
          height="100" // Chiều cao của vùng cong
          width={width}
          style={styles.svgCurve}
          viewBox={`0 0 ${width} 100`}
        >
          <Path
            // d là chuỗi lệnh vẽ đường cong lượn sóng
            d={`M0,30 Q${width / 2},100 ${width},30 L${width},100 L0,100 Z`}
            fill="#00BCD4"
          />
        </Svg>

        {/* Nội dung chính */}
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>▲</Text>
          </View>

          <Text style={styles.title}>
            Let's start your health journey today with us!
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  topContainer: {
    flex: 0.6, // Chiếm 60% chiều cao
    backgroundColor: "white",
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  bottomContainer: {
    flex: 0.4, // Chiếm 40% chiều cao
    backgroundColor: "#00BCD4",
  },
  svgCurve: {
    position: "absolute",
    top: -99, // Kéo SVG lên trên để tạo hiệu ứng cong chồng lên ảnh
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingBottom: 20, // Thêm khoảng đệm dưới
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    elevation: 8,
  },
  logoText: {
    fontSize: 24,
    color: "#00BCD4",
    transform: [{ rotate: "-45deg" }],
  },
  title: {
    fontSize: 34,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 30,
  },
  button: {
    width: "100%",
    backgroundColor: "white",
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: "center",
    elevation: 5,
  },
  buttonText: {
    fontSize: 16,
    color: "#333333",
    fontWeight: "600",
  },
});

export default OnboardingScreen;
