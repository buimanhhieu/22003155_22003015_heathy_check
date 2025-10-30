import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { dashboardApi, DashboardData } from '../api/dashboardApi';
import { useNavigation } from '@react-navigation/native';

interface HealthMetric {
  id: string;
  title: string;
  value: string;
  icon: string;
  iconColor: string;
  showForGender?: 'male' | 'female' | 'all';
  onClick?: () => void;
}

const AllHealthDataScreen: React.FC = () => {
  const { userInfo } = useAuth();
  const navigation = useNavigation();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  // Cycle data sẽ được lấy từ dashboardData.highlights.cycleTracking
  const [showCycleModal, setShowCycleModal] = useState(false);
  const [newLastPeriod, setNewLastPeriod] = useState('');
  const [newCycleLength, setNewCycleLength] = useState('28');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    if (!userInfo?.id || !userInfo?.token) return;

    try {
      const data = await dashboardApi.getDashboard(userInfo.id, userInfo.token);
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };


  const getHealthMetrics = (): HealthMetric[] => {
    const metrics: HealthMetric[] = [
      {
        id: 'doubleSupport',
        title: 'Double Support Time',
        value: dashboardData?.healthScore?.score ? `${(dashboardData.healthScore.score * 0.3).toFixed(1)} %` : '0.0 %',
        icon: 'gps-fixed',
        iconColor: '#00BCD4',
        showForGender: 'all',
      },
      {
        id: 'steps',
        title: 'Steps',
        value: dashboardData?.highlights?.steps?.value ? `${dashboardData.highlights.steps.value.toLocaleString()} steps` : '0 steps',
        icon: 'directions-walk',
        iconColor: '#FF9800',
        showForGender: 'all',
        onClick: () => navigation.navigate('StepsChart'),
      },
      {
        id: 'cycleTracking',
        title: 'Cycle tracking',
        value: dashboardData?.highlights?.cycleTracking?.nextCycleDate 
          ? (() => {
              try {
                const dateStr = dashboardData.highlights.cycleTracking.nextCycleDate;
                let date;
                
                if (dateStr.includes('/')) {
                  // Format dd/MM/yyyy từ database
                  const [day, month, year] = dateStr.split('/');
                  date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                } else {
                  // Format ISO string
                  date = new Date(dateStr);
                }
                
                if (isNaN(date.getTime())) {
                  return 'Chưa có dữ liệu';
                }
                
                return date.toLocaleDateString('en-GB', { 
                  day: '2-digit', 
                  month: 'long' 
                });
              } catch (error) {
                console.log('Error parsing nextCycleDate in getHealthMetrics:', error);
                return 'Chưa có dữ liệu';
              }
            })()
          : 'Chưa có dữ liệu',
        icon: 'event',
        iconColor: '#9C27B0',
        showForGender: 'female',
      },
      {
        id: 'sleep',
        title: 'Sleep',
        value: dashboardData?.highlights?.sleep?.value || '0 hr 0 min',
        icon: 'hotel',
        iconColor: '#F44336',
        showForGender: 'all',
      },
      {
        id: 'heart',
        title: 'Heart',
        value: '68 BPM',
        icon: 'favorite',
        iconColor: '#F44336',
        showForGender: 'all',
      },
      {
        id: 'burnedCalories',
        title: 'Burned calories',
        value: '850 kcal',
        icon: 'local-fire-department',
        iconColor: '#2196F3',
        showForGender: 'all',
      },
      {
        id: 'bmi',
        title: 'Body mass index',
        value: '18.69 BMI',
        icon: 'accessibility',
        iconColor: '#00BCD4',
        showForGender: 'all',
      },
    ];

    // Filter based on user gender
    const userGender = userInfo?.profile?.gender?.toLowerCase();
    return metrics.filter(metric => {
      if (metric.showForGender === 'all') return true;
      if (metric.showForGender === 'female' && userGender === 'female') return true;
      if (metric.showForGender === 'male' && userGender === 'male') return true;
      return false;
    });
  };

  const handleCycleTrackingPress = () => {
    // Navigate to Cycle Tracking screen
    navigation.navigate('CycleTracking');
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      // Kiểm tra ngày hợp lệ - chỉ cho phép năm hiện tại
      const year = selectedDate.getFullYear();
      const currentYear = new Date().getFullYear();
      if (year !== currentYear) {
        Alert.alert('Lỗi', 'Vui lòng chọn ngày trong năm hiện tại');
        return;
      }
      
      setSelectedDate(selectedDate);
      setNewLastPeriod(selectedDate.toISOString().split('T')[0]);
      console.log('Selected date:', selectedDate.toISOString().split('T')[0]);
    }
  };

  const openDatePicker = () => {
    setShowDatePicker(true);
  };

  const handleSaveCycleData = async () => {
    if (!newLastPeriod) {
      Alert.alert('Lỗi', 'Vui lòng chọn ngày kinh nguyệt gần nhất');
      return;
    }

    // Kiểm tra ngày hợp lệ - chỉ cho phép năm hiện tại
    const selectedDate = new Date(newLastPeriod);
    const year = selectedDate.getFullYear();
    const currentYear = new Date().getFullYear();
    if (year !== currentYear) {
      Alert.alert('Lỗi', 'Vui lòng chọn ngày trong năm hiện tại');
      return;
    }

    // Kiểm tra ngày không được trong tương lai
    if (selectedDate > new Date()) {
      Alert.alert('Lỗi', 'Ngày kinh nguyệt không thể trong tương lai');
      return;
    }

    if (!userInfo?.id || !userInfo?.token) {
      Alert.alert('Lỗi', 'Không thể xác thực người dùng');
      return;
    }

    const cycleLength = parseInt(newCycleLength);
    if (isNaN(cycleLength) || cycleLength < 21 || cycleLength > 35) {
      Alert.alert('Lỗi', 'Chu kỳ kinh nguyệt phải từ 21-35 ngày');
      return;
    }

    try {
      console.log('=== CYCLE TRACKING DEBUG ===');
      console.log('User ID:', userInfo.id);
      console.log('Token exists:', !!userInfo.token);
      console.log('Token preview:', userInfo.token ? userInfo.token.substring(0, 20) + '...' : 'No token');
      console.log('Dashboard data cycle tracking:', dashboardData?.highlights?.cycleTracking);
      console.log('Has existing data:', !!dashboardData?.highlights?.cycleTracking?.lastCycleDate);
      console.log('Selected date:', newLastPeriod);
      console.log('Cycle length:', cycleLength);
      
      // Kiểm tra token có hợp lệ không bằng cách gọi một API đơn giản trước
      console.log('🔍 Testing token validity with dashboard API...');
      try {
        await dashboardApi.getDashboard(userInfo.id, userInfo.token);
        console.log('✅ Token is valid - dashboard API works');
      } catch (tokenError: any) {
        console.log('❌ Token is invalid - dashboard API failed:', tokenError.response?.status);
        if (tokenError.response?.status === 401) {
          Alert.alert('Lỗi xác thực', 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          return;
        }
      }

      // Thử test với profile endpoint để xem có hoạt động không
      console.log('🔍 Testing profile endpoint...');
      try {
        const { userApi } = require('../api/userApi');
        await userApi.get(`/${userInfo.id}/profile`);
        console.log('✅ Profile endpoint works');
      } catch (profileError: any) {
        console.log('❌ Profile endpoint failed:', profileError.response?.status);
      }

      // Kiểm tra xem user đã có dữ liệu cycle tracking chưa
      const cycleData = dashboardData?.highlights?.cycleTracking;
      const hasExistingData = cycleData && 
        cycleData.lastCycleDate && 
        cycleData.lastCycleDate !== "Chưa có" && 
        cycleData.lastCycleDate !== "0001-01-03";
      
      console.log('Cycle data check:', {
        cycleData: cycleData,
        lastCycleDate: cycleData?.lastCycleDate,
        isNotDefault: cycleData?.lastCycleDate !== "Chưa có",
        isNotInvalid: cycleData?.lastCycleDate !== "0001-01-03",
        hasExistingData: hasExistingData
      });
      
      // Lưu trữ trực tiếp vào database
      console.log('💾 Saving cycle tracking data to database...');
      try {
        if (hasExistingData) {
          console.log('🔄 Attempting to UPDATE existing cycle tracking data');
          await dashboardApi.updateCycleTracking(userInfo.id, userInfo.token, {
            lastCycleDate: newLastPeriod,
            cycleLength: cycleLength
          });
        } else {
          console.log('➕ Attempting to CREATE new cycle tracking data');
          await dashboardApi.createCycleTracking(userInfo.id, userInfo.token, {
            lastCycleDate: newLastPeriod,
            cycleLength: cycleLength
          });
        }
        console.log('✅ Cycle tracking data saved to database');
      } catch (serverError: any) {
        console.log('❌ Database save failed:', serverError.response?.status, serverError.message);
        throw serverError;
      }

      console.log('✅ Cycle tracking API call successful');
      
      // Reload dashboard data để cập nhật UI
      await loadDashboardData();
      
      setShowCycleModal(false);
      Alert.alert('Thành công', 'Đã cập nhật thông tin chu kỳ kinh nguyệt');
    } catch (error: any) {
      console.error('Error updating cycle data:', error);
      
      if (error.response?.status === 401) {
        Alert.alert('Lỗi xác thực', 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        // Có thể thêm logic logout ở đây
      } else if (error.response?.status === 404) {
        Alert.alert('Lỗi', 'API endpoint không tồn tại. Vui lòng kiểm tra lại cấu hình.');
      } else {
        Alert.alert('Lỗi', `Không thể cập nhật thông tin chu kỳ kinh nguyệt: ${error.message}`);
      }
    }
  };

  const renderHealthMetric = (metric: HealthMetric) => (
    <TouchableOpacity 
      key={metric.id} 
      style={styles.metricCard}
      onPress={metric.onClick || (metric.id === 'cycleTracking' ? handleCycleTrackingPress : undefined)}
    >
      <View style={styles.metricContent}>
        <View style={[styles.metricIcon, { backgroundColor: metric.iconColor }]}>
          <MaterialIcons name={metric.icon as any} size={24} color="white" />
        </View>
        <View style={styles.metricInfo}>
          <Text style={styles.metricTitle}>{metric.title}</Text>
          <Text style={styles.metricValue}>{metric.value}</Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color="#666" />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Health Data</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {getHealthMetrics().map(renderHealthMetric)}
      </ScrollView>

      {/* Cycle Tracking Modal */}
      <Modal
        visible={showCycleModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCycleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cập nhật chu kỳ kinh nguyệt</Text>
              <TouchableOpacity onPress={() => setShowCycleModal(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Ngày bắt đầu chu kỳ kinh nguyệt gần nhất</Text>
                <TouchableOpacity style={styles.dateInput} onPress={openDatePicker}>
                  <Text style={styles.dateInputText}>
                    {newLastPeriod || 'Chọn ngày'}
                  </Text>
                  <MaterialIcons name="calendar-today" size={20} color="#666" />
                </TouchableOpacity>
                <Text style={styles.inputHint}>Nhấn để chọn ngày trong năm hiện tại</Text>
              </View>

              {/* Date Picker inside modal */}
              {showDatePicker && (
                <View style={styles.datePickerContainer}>
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                    minimumDate={new Date(new Date().getFullYear(), 0, 1)} // Ngày đầu năm hiện tại
                    textColor="#333"
                    accentColor="#9C27B0"
                  />
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Dự đoán ngày kinh nguyệt tiếp theo</Text>
                <View style={styles.predictionContainer}>
                  <Text style={styles.predictionText}>
                    {dashboardData?.highlights?.cycleTracking?.nextCycleDate 
                      ? (() => {
                          try {
                            // Xử lý format date từ database (có thể là dd/MM/yyyy)
                            const dateStr = dashboardData.highlights.cycleTracking.nextCycleDate;
                            let date;
                            
                            if (dateStr.includes('/')) {
                              // Format dd/MM/yyyy từ database
                              const [day, month, year] = dateStr.split('/');
                              date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                            } else {
                              // Format ISO string
                              date = new Date(dateStr);
                            }
                            
                            if (isNaN(date.getTime())) {
                              return 'Chưa có dữ liệu';
                            }
                            
                            return date.toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit', 
                              year: 'numeric'
                            });
                          } catch (error) {
                            console.log('Error parsing nextCycleDate:', error);
                            return 'Chưa có dữ liệu';
                          }
                        })()
                      : 'Chưa có dữ liệu'
                    }
                  </Text>
                  <MaterialIcons name="event" size={20} color="#9C27B0" />
                </View>
                <Text style={styles.inputHint}>Tự động tính toán từ database - không cần nhập thủ công</Text>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowCycleModal(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSaveCycleData}
              >
                <Text style={styles.saveButtonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  metricCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  metricContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  metricInfo: {
    flex: 1,
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    color: '#666',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateInputText: {
    fontSize: 16,
    color: '#333',
  },
  predictionContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  predictionText: {
    fontSize: 16,
    color: '#9C27B0',
    fontWeight: '600',
  },
  datePickerContainer: {
    marginTop: 10,
    marginBottom: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  numberInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  inputHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    flex: 1,
    padding: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#9C27B0',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

export default AllHealthDataScreen;
