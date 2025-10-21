import React, { useState, useEffect, ReactNode } from "react";
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Modal, Platform, KeyboardAvoidingView, StatusBar } from "react-native";
import { Button, HelperText, TextInput } from "react-native-paper";
// Removed unused Reanimated imports to fix warnings
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from "../context/AuthContext";
import userApi from "../api/userApi";

// Component con có animation để tái sử dụng
interface AnimatedViewProps {
  children: ReactNode;
  delay: number;
}
const AnimatedView: React.FC<AnimatedViewProps> = ({ children, delay }) => {
  return (
    <View>
      {children}
    </View>
  );
};

// Định nghĩa các mức độ hoạt động
const activityLevels = [
  { 
    label: "Ít vận động", 
    description: "Ít hoặc không tập thể dục", 
    value: "SEDENTARY",
    icon: "🛋️"
  },
  { 
    label: "Vận động nhẹ", 
    description: "Tập thể dục nhẹ 1-3 ngày/tuần", 
    value: "LIGHTLY_ACTIVE",
    icon: "🚶"
  },
  { 
    label: "Vận động vừa phải", 
    description: "Tập thể dục vừa phải 3-5 ngày/tuần", 
    value: "MODERATELY_ACTIVE",
    icon: "🏃"
  },
  { 
    label: "Vận động nhiều", 
    description: "Tập thể dục mạnh 6-7 ngày/tuần", 
    value: "VERY_ACTIVE",
    icon: "💪"
  },
  { 
    label: "Vận động rất nhiều", 
    description: "Tập thể dục rất mạnh & công việc thể chất", 
    value: "EXTRA_ACTIVE",
    icon: "🔥"
  },
];

const UserGoalScreen = () => {
  const [selectedActivityLevel, setSelectedActivityLevel] = useState("LIGHTLY_ACTIVE");
  const [dailyStepsGoal, setDailyStepsGoal] = useState("10000");
  const [bedtime, setBedtime] = useState(() => {
    const date = new Date();
    date.setHours(22, 0, 0, 0); // 10:00 PM
    return date;
  });
  const [wakeup, setWakeup] = useState(() => {
    const date = new Date();
    date.setHours(6, 0, 0, 0); // 6:00 AM
    return date;
  });
  const [showBedtimePicker, setShowBedtimePicker] = useState(false);
  const [showWakeupPicker, setShowWakeupPicker] = useState(false);
  const [tempBedtime, setTempBedtime] = useState<Date | null>(null);
  const [tempWakeup, setTempWakeup] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { userInfo, completeOnboarding } = useAuth();

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleFinish = async () => {
    if (!userInfo) {
      setError("Thông tin người dùng không khả dụng.");
      return;
    }
    
    if (!dailyStepsGoal || isNaN(Number(dailyStepsGoal))) {
      setError("Vui lòng nhập mục tiêu bước chân hợp lệ.");
      return;
    }

    const steps = Number(dailyStepsGoal);
    if (steps < 1000 || steps > 50000) {
      setError("Mục tiêu bước chân phải từ 1,000 đến 50,000 bước.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const payload = {
        dailyStepsGoal: steps,
        bedtime: `${formatTime(bedtime)}:00`,
        wakeup: `${formatTime(wakeup)}:00`,
        activityLevel: selectedActivityLevel,
      };
      
      console.log('=== DEBUG PAYLOAD ===');
      console.log('Full payload:', JSON.stringify(payload, null, 2));
      console.log('===================');
      
      const response = await userApi.put(`/${userInfo.id}/goals`, payload);
      console.log('Response from server:', response.data);
      completeOnboarding();
    } catch (e) {
      setError("Cập nhật mục tiêu thất bại. Vui lòng thử lại.");
      console.error('Error updating goals:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f7fa" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.contentContainer}>
        <AnimatedView delay={100}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.title}>Thiết lập mục tiêu</Text>
              <Text style={styles.subtitle}>
                Hãy cho chúng tôi biết mục tiêu sức khỏe của bạn
              </Text>
            </View>
          </View>
        </AnimatedView>

        {/* Daily Steps Goal */}
        <AnimatedView delay={200}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mục tiêu bước chân hàng ngày</Text>
            <TextInput
              mode="outlined"
              label="Số bước mỗi ngày"
              value={dailyStepsGoal}
              onChangeText={setDailyStepsGoal}
              keyboardType="numeric"
              style={styles.input}
              outlineColor="transparent"
              activeOutlineColor="#00BCD4"
              theme={{ roundness: 12 }}
            />
          </View>
        </AnimatedView>

        {/* Sleep Schedule */}
        <AnimatedView delay={300}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lịch trình ngủ</Text>
            
            <View style={styles.timeRow}>
              <View style={styles.timeInput}>
                <Text style={styles.timeLabel}>Giờ ngủ</Text>
                <TouchableOpacity 
                  style={styles.timeButton}
                  onPress={() => {
                    setTempBedtime(bedtime);
                    setShowBedtimePicker(true);
                  }}
                >
                  <Text style={styles.timeText}>{formatTime(bedtime)}</Text>
                  <Text style={styles.timeIcon}>🛏️</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.timeInput}>
                <Text style={styles.timeLabel}>Giờ thức dậy</Text>
                <TouchableOpacity 
                  style={styles.timeButton}
                  onPress={() => {
                    setTempWakeup(wakeup);
                    setShowWakeupPicker(true);
                  }}
                >
                  <Text style={styles.timeText}>{formatTime(wakeup)}</Text>
                  <Text style={styles.timeIcon}>☀️</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </AnimatedView>

        {/* Activity Level */}
        <AnimatedView delay={400}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mức độ hoạt động</Text>
            <Text style={styles.sectionSubtitle}>
              Điều này giúp chúng tôi tính toán mục tiêu calo hàng ngày của bạn.
            </Text>
          </View>
        </AnimatedView>

        {activityLevels.map((level, index) => (
          <AnimatedView key={level.value} delay={500 + index * 50}>
            <TouchableOpacity
              style={[
                styles.activityButton,
                selectedActivityLevel === level.value && styles.activityButtonActive,
              ]}
              onPress={() => setSelectedActivityLevel(level.value)}
            >
              <View style={styles.activityContent}>
                <Text style={styles.activityIcon}>{level.icon}</Text>
                <View style={styles.activityTextContainer}>
                  <Text style={[
                    styles.activityLabel,
                    selectedActivityLevel === level.value && styles.activityLabelActive,
                  ]}>
                    {level.label}
                  </Text>
                  <Text style={[
                    styles.activityDescription,
                    selectedActivityLevel === level.value && styles.activityDescriptionActive,
                  ]}>
                    {level.description}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </AnimatedView>
        ))}

        <HelperText type="error" visible={!!error} style={styles.errorText}>
          {error}
        </HelperText>

        <AnimatedView delay={800}>
          <Button
            mode="contained"
            onPress={handleFinish}
            style={styles.button}
            labelStyle={styles.buttonText}
            loading={loading}
            disabled={loading}
          >
            Hoàn thành thiết lập
          </Button>
        </AnimatedView>
      </ScrollView>

      {/* Time Picker Modal for iOS */}
      {Platform.OS === 'ios' && (
        <>
          <Modal
            visible={showBedtimePicker}
            transparent={true}
            animationType="slide"
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => {
                    setTempBedtime(null);
                    setShowBedtimePicker(false);
                  }}>
                    <Text style={styles.modalCancel}>Hủy</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Giờ ngủ</Text>
                  <TouchableOpacity onPress={() => {
                    if (tempBedtime) {
                      setBedtime(tempBedtime);
                    }
                    setShowBedtimePicker(false);
                  }}>
                    <Text style={styles.modalDone}>Xong</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.pickerContainer}>
                  <DateTimePicker
                    value={tempBedtime || bedtime}
                    mode="time"
                    is24Hour={true}
                    display="spinner"
                    textColor="#1E232C"
                    themeVariant="light"
                    style={styles.timePicker}
                    onChange={(event, selectedTime) => {
                      if (selectedTime) {
                        setTempBedtime(selectedTime);
                      }
                    }}
                  />
                </View>
              </View>
            </View>
          </Modal>

          <Modal
            visible={showWakeupPicker}
            transparent={true}
            animationType="slide"
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => {
                    setTempWakeup(null);
                    setShowWakeupPicker(false);
                  }}>
                    <Text style={styles.modalCancel}>Hủy</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Giờ thức dậy</Text>
                  <TouchableOpacity onPress={() => {
                    if (tempWakeup) {
                      setWakeup(tempWakeup);
                    }
                    setShowWakeupPicker(false);
                  }}>
                    <Text style={styles.modalDone}>Xong</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.pickerContainer}>
                  <DateTimePicker
                    value={tempWakeup || wakeup}
                    mode="time"
                    is24Hour={true}
                    display="spinner"
                    textColor="#1E232C"
                    themeVariant="light"
                    style={styles.timePicker}
                    onChange={(event, selectedTime) => {
                      if (selectedTime) {
                        setTempWakeup(selectedTime);
                      }
                    }}
                  />
                </View>
              </View>
            </View>
          </Modal>
        </>
      )}

      {/* Time Picker for Android */}
      {Platform.OS === 'android' && (
        <>
          {showBedtimePicker && (
            <DateTimePicker
              value={bedtime}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={(event, selectedTime) => {
                if (event.type === 'set' && selectedTime) {
                  setBedtime(selectedTime);
                }
                setShowBedtimePicker(false);
              }}
            />
          )}

          {showWakeupPicker && (
            <DateTimePicker
              value={wakeup}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={(event, selectedTime) => {
                if (event.type === 'set' && selectedTime) {
                  setWakeup(selectedTime);
                }
                setShowWakeupPicker(false);
              }}
            />
          )}
        </>
      )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  header: {
    marginBottom: 24,
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerContent: {
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E232C',
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6A707C',
    textAlign: "center",
    lineHeight: 22,
  },
  section: {
    marginBottom: 20,
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E232C',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6A707C',
    marginBottom: 16,
    lineHeight: 20,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#F7F8F9',
    borderColor: '#E8ECF4',
    borderWidth: 1,
    borderRadius: 8,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeInput: {
    flex: 1,
    marginHorizontal: 8,
  },
  timeLabel: {
    fontSize: 14,
    color: "#6A707C",
    marginBottom: 8,
    fontWeight: "600",
  },
  timeButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8ECF4",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#F7F8F9",
  },
  timeText: {
    fontSize: 16,
    color: "#1E232C",
    fontWeight: "500",
  },
  timeIcon: {
    fontSize: 18,
  },
  activityButton: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: '#E8ECF4',
    borderRadius: 8,
    marginBottom: 8,
    marginHorizontal: 20,
    backgroundColor: '#F7F8F9',
    elevation: 2,
  },
  activityButtonActive: {
    borderColor: '#00BCD4',
    backgroundColor: '#E0F2F1',
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  activityTextContainer: {
    flex: 1,
  },
  activityLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E232C',
    marginBottom: 4,
  },
  activityLabelActive: {
    color: '#00BCD4',
  },
  activityDescription: {
    fontSize: 13,
    color: '#6A707C',
    lineHeight: 18,
  },
  activityDescriptionActive: {
    color: '#00838F',
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 16,
    marginTop: 8,
    fontSize: 14,
  },
  button: {
    backgroundColor: '#00BCD4',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 20,
    marginBottom: 20,
    marginHorizontal: 20,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECF4',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E232C',
  },
  modalCancel: {
    fontSize: 16,
    color: '#6A707C',
  },
  modalDone: {
    fontSize: 16,
    color: '#00BCD4',
    fontWeight: '600',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    paddingVertical: 20,
  },
  timePicker: {
    backgroundColor: '#fff',
    color: '#1E232C',
    width: '100%',
    height: 200,
  },
});

export default UserGoalScreen;