import React, { useState, useEffect, ReactNode } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Keyboard,
  ScrollView,
  TouchableWithoutFeedback,
  Platform,
  Modal,
  Image,
  Alert,
  KeyboardAvoidingView,
  StatusBar,
} from "react-native";
import { TextInput, Button, HelperText, Avatar } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
// Removed unused Reanimated imports to fix warnings
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from "../context/AuthContext";
import { PostLoginOnboardingNavigationProp } from "../navigation/types";
import userApi from "../api/userApi";

// Define the type for the props of AnimatedView
interface AnimatedViewProps {
  children: ReactNode;
  delay: number;
}

// Simplified AnimatedView without shared values to fix warnings
const AnimatedView: React.FC<AnimatedViewProps> = ({ children, delay }) => {
  return (
    <View>
      {children}
    </View>
  );
};

const UserProfileScreen = () => {
  const [dateOfBirth, setDateOfBirth] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [gender, setGender] = useState("MALE");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigation = useNavigation<PostLoginOnboardingNavigationProp>();
  const { userInfo, updateUserInfo } = useAuth();

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  const handleImagePicker = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert("Permission Required", "Permission to access camera roll is required!");
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.3, // Giảm quality xuống 30% để giảm kích thước file
        base64: true,
        exif: false, // Không lưu metadata để giảm kích thước
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        if (asset.base64) {
          const base64String = `data:image/jpeg;base64,${asset.base64}`;
          
          // Kiểm tra kích thước base64 (giới hạn ~200KB)
          if (base64String.length > 300000) {
            Alert.alert(
              "Ảnh quá lớn", 
              "Vui lòng chọn ảnh nhỏ hơn. Ảnh hiện tại quá lớn để tải lên."
            );
            return;
          }
          
          setAvatar(base64String);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const handleContinue = async () => {
    Keyboard.dismiss();
    if (!userInfo) {
      setError("Thông tin người dùng không tìm thấy.");
      return;
    }
    if (!heightCm || !weightKg) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    const height = parseFloat(heightCm);
    const weight = parseFloat(weightKg);

    if (isNaN(height) || height < 100 || height > 250) {
      setError("Chiều cao phải từ 100cm đến 250cm.");
      return;
    }

    if (isNaN(weight) || weight < 30 || weight > 300) {
      setError("Cân nặng phải từ 30kg đến 300kg.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await userApi.put(`/${userInfo.id}/profile`, {
        dateOfBirth: formatDate(dateOfBirth),
        avatar,
        gender,
        heightCm: height,
        weightKg: weight,
      });
      
      // Update userInfo with new profile data
      const updatedUserInfo = {
        ...userInfo,
        profile: {
          ...userInfo.profile,
          userId: userInfo.id,
          dateOfBirth: formatDate(dateOfBirth),
          avatar: avatar || undefined,
          gender,
          heightCm: height,
          weightKg: weight,
        }
      };
      
      // Update userInfo in context and AsyncStorage
      await updateUserInfo(updatedUserInfo);
      
      navigation.navigate("UserGoal");
    } catch (e) {
      setError("Cập nhật thông tin thất bại. Vui lòng thử lại.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
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
            <AnimatedView delay={100}>
              <View style={styles.header}>
                <Text style={styles.title}>Giới thiệu về bản thân</Text>
                <Text style={styles.subtitle}>
                  Thông tin này giúp chúng tôi tạo kế hoạch cá nhân hóa cho bạn.
                </Text>
              </View>
            </AnimatedView>

            <AnimatedView delay={200}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Ảnh đại diện</Text>
                <TouchableOpacity
                  style={styles.avatarContainer}
                  onPress={handleImagePicker}
                >
                  {avatar ? (
                    <Image source={{ uri: avatar }} style={styles.avatarImage} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarPlaceholderText}>📷</Text>
                      <Text style={styles.avatarPlaceholderLabel}>Chọn ảnh</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </AnimatedView>

            <AnimatedView delay={250}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Ngày sinh</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateText}>{formatDate(dateOfBirth)}</Text>
                  <Text style={styles.dateIcon}>📅</Text>
                </TouchableOpacity>
              </View>
            </AnimatedView>

            <AnimatedView delay={350}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Giới tính</Text>
                <View style={styles.genderContainer}>
                  <TouchableOpacity
                    style={[
                      styles.genderButton,
                      gender === "MALE" && styles.genderButtonActive,
                    ]}
                    onPress={() => setGender("MALE")}
                  >
                    <Text
                      style={[
                        styles.genderText,
                        gender === "MALE" && styles.genderTextActive,
                      ]}
                    >
                      Nam
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.genderButton,
                      gender === "FEMALE" && styles.genderButtonActive,
                    ]}
                    onPress={() => setGender("FEMALE")}
                  >
                    <Text
                      style={[
                        styles.genderText,
                        gender === "FEMALE" && styles.genderTextActive,
                      ]}
                    >
                      Nữ
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </AnimatedView>

            <AnimatedView delay={450}>
              <View style={styles.metricsContainer}>
                <View style={styles.metricInput}>
                  <Text style={styles.label}>Chiều cao (cm)</Text>
                  <TextInput
                    value={heightCm}
                    onChangeText={setHeightCm}
                    keyboardType="numeric"
                    style={styles.input}
                    mode="outlined"
                    placeholder="Nhập chiều cao"
                    placeholderTextColor="#8391A1"
                    outlineColor="transparent"
                    activeOutlineColor="#00BCD4"
                    theme={{ roundness: 12 }}
                  />
                </View>
                <View style={styles.metricInput}>
                  <Text style={styles.label}>Cân nặng (kg)</Text>
                  <TextInput
                    value={weightKg}
                    onChangeText={setWeightKg}
                    keyboardType="numeric"
                    style={styles.input}
                    mode="outlined"
                    placeholder="Nhập cân nặng"
                    placeholderTextColor="#8391A1"
                    outlineColor="transparent"
                    activeOutlineColor="#00BCD4"
                    theme={{ roundness: 12 }}
                  />
                </View>
              </View>
            </AnimatedView>

            <HelperText type="error" visible={!!error} style={styles.errorText}>
              {error}
            </HelperText>

            <AnimatedView delay={550}>
              <Button
                mode="contained"
                onPress={handleContinue}
                style={styles.button}
                labelStyle={styles.buttonText}
                loading={loading}
                disabled={loading}
              >
                Tiếp tục
              </Button>
            </AnimatedView>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Date Picker Modal for iOS */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.modalCancel}>Hủy</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Chọn ngày sinh</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.modalDone}>Xong</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={dateOfBirth}
                  mode="date"
                  display="spinner"
                  maximumDate={new Date()}
                  minimumDate={new Date(1900, 0, 1)}
                  textColor="#1E232C"
                  themeVariant="light"
                  style={styles.datePicker}
                  onChange={handleDateChange}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Date Picker for Android */}
      {Platform.OS === 'android' && showDatePicker && (
        <DateTimePicker
          value={dateOfBirth}
          mode="date"
          display="default"
          maximumDate={new Date()}
          minimumDate={new Date(1900, 0, 1)}
          onChange={handleDateChange}
        />
      )}
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
    paddingVertical: 20,
    justifyContent: "center",
  },
  header: {
    marginBottom: 32,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1E232C",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6A707C",
    textAlign: "center",
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: "#1E232C",
    marginBottom: 8,
    fontWeight: "600",
  },
  avatarContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#00BCD4",
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#E8ECF4",
    borderStyle: "dashed",
    backgroundColor: "#F7F8F9",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarPlaceholderText: {
    fontSize: 32,
    marginBottom: 8,
  },
  avatarPlaceholderLabel: {
    fontSize: 14,
    color: "#6A707C",
    fontWeight: "500",
  },
  dateButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F7F8F9",
    borderColor: "#E8ECF4",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  dateText: {
    fontSize: 16,
    color: "#1E232C",
  },
  dateIcon: {
    fontSize: 20,
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  genderButton: {
    flex: 1,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#E8ECF4",
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 8,
    backgroundColor: "#F7F8F9",
  },
  genderButtonActive: {
    borderColor: "#00BCD4",
    backgroundColor: "#E0F7FA",
  },
  genderText: {
    fontSize: 16,
    color: "#6A707C",
    fontWeight: "500",
  },
  genderTextActive: {
    color: "#00BCD4",
    fontWeight: "bold",
  },
  metricsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metricInput: {
    flex: 1,
    marginHorizontal: 8,
  },
  input: {
    backgroundColor: "#F7F8F9",
    borderColor: "#E8ECF4",
    borderWidth: 1,
  },
  errorText: {
    textAlign: "center",
    marginBottom: 16,
    fontSize: 14,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E8ECF4",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E232C",
  },
  modalCancel: {
    fontSize: 16,
    color: "#6A707C",
  },
  modalDone: {
    fontSize: 16,
    color: "#00BCD4",
    fontWeight: "600",
  },
  pickerContainer: {
    backgroundColor: "#fff",
    paddingVertical: 20,
  },
  datePicker: {
    backgroundColor: "#fff",
    color: "#1E232C",
    width: '100%',
    height: 200,
  },
});

export default UserProfileScreen;