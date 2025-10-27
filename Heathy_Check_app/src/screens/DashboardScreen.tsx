import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
  Modal,
  SafeAreaView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../context/AuthContext';
import { dashboardApi, DashboardData } from '../api/dashboardApi';
import { Card, ProgressBar, Chip, Button } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AvatarDropdown from '../components/AvatarDropdown';
import { useNavigation } from '@react-navigation/native';
import { DashboardStackParamList } from '../navigation/types';

const { width } = Dimensions.get('window');

type DashboardScreenNavigationProp = any;

const DashboardScreen: React.FC = () => {
  const { userInfo, logout } = useAuth();
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Cycle tracking modal states
  const [showCycleModal, setShowCycleModal] = useState(false);
  const [newLastPeriod, setNewLastPeriod] = useState('');
  const [newCycleLength, setNewCycleLength] = useState('28');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const loadDashboardData = async () => {
    if (!userInfo?.id || !userInfo?.token) {
      console.log('❌ Missing userInfo:', { id: userInfo?.id, hasToken: !!userInfo?.token });
      setLoading(false);
      return;
    }

    console.log('🔄 Loading dashboard data for user:', userInfo.id);
    try {
      const data = await dashboardApi.getDashboard(userInfo.id, userInfo.token);
      console.log('✅ Dashboard data loaded:', data);
      setDashboardData(data);
    } catch (error: any) {
      console.error('❌ Error loading dashboard:', error);
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      console.error('Message:', error.message);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  useEffect(() => {
    loadDashboardData();
  }, [userInfo]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleCycleTrackingPress = () => {
    // Mở modal để user cập nhật thông tin
    let lastPeriodDate;
    let lastPeriodString = '';
    
    if (dashboardData?.highlights?.cycleTracking?.lastCycleDate && 
        dashboardData.highlights.cycleTracking.lastCycleDate !== "Chưa có") {
      
      const dateStr = dashboardData.highlights.cycleTracking.lastCycleDate;
      
      try {
        if (dateStr.includes('/')) {
          // Format dd/MM/yyyy từ database
          const [day, month, year] = dateStr.split('/');
          lastPeriodDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          lastPeriodString = lastPeriodDate.toISOString().split('T')[0];
        } else {
          // Format ISO string
          lastPeriodDate = new Date(dateStr);
          lastPeriodString = lastPeriodDate.toISOString().split('T')[0];
        }
      } catch (error) {
        console.log('Error parsing lastCycleDate:', error);
        lastPeriodDate = new Date();
        lastPeriodString = lastPeriodDate.toISOString().split('T')[0];
      }
    } else {
      // Nếu chưa có dữ liệu, sử dụng ngày hiện tại
      lastPeriodDate = new Date();
      lastPeriodString = lastPeriodDate.toISOString().split('T')[0];
    }
    
    setSelectedDate(lastPeriodDate);
    setNewLastPeriod(lastPeriodString);
    setNewCycleLength('28'); // Default cycle length
    setShowCycleModal(true);
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
      console.log('Selected date:', newLastPeriod);
      console.log('Cycle length:', cycleLength);
      
      // Kiểm tra xem user đã có dữ liệu cycle tracking chưa
      const cycleData = dashboardData?.highlights?.cycleTracking;
      const hasExistingData = cycleData && 
        cycleData.lastCycleDate && 
        cycleData.lastCycleDate !== "Chưa có" && 
        cycleData.lastCycleDate !== "0001-01-03";
      
      console.log('Cycle data check:', {
        cycleData: cycleData,
        lastCycleDate: cycleData?.lastCycleDate,
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
      } else if (error.response?.status === 404) {
        Alert.alert('Lỗi', 'API endpoint không tồn tại. Vui lòng kiểm tra lại cấu hình.');
      } else {
        Alert.alert('Lỗi', `Không thể cập nhật thông tin chu kỳ kinh nguyệt: ${error.message}`);
      }
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    if (score >= 40) return '#FF5722';
    return '#F44336';
  };

  const getHealthScoreIcon = (status: string) => {
    switch (status) {
      case 'excellent': return 'sentiment-very-satisfied';
      case 'good': return 'sentiment-satisfied';
      case 'fair': return 'sentiment-neutral';
      default: return 'sentiment-dissatisfied';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  if (!dashboardData) {
    return (
      <View style={styles.errorContainer}>
        <Text>Không thể tải dữ liệu dashboard</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadDashboardData}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getCurrentDate = () => {
    const now = new Date();
    const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
    const months = ['tháng 1', 'tháng 2', 'tháng 3', 'tháng 4', 'tháng 5', 'tháng 6', 'tháng 7', 'tháng 8', 'tháng 9', 'tháng 10', 'tháng 11', 'tháng 12'];
    return `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  };

  const getHealthScoreComment = (score: number) => {
    if (score >= 90) {
      return "Xuất sắc! Bạn đang duy trì sức khỏe rất tốt.";
    } else if (score >= 80) {
      return "Tốt! Sức khỏe của bạn đang ở mức khá tốt.";
    } else if (score >= 70) {
      return "Khá tốt! Hãy tiếp tục duy trì thói quen lành mạnh.";
    } else if (score >= 60) {
      return "Trung bình. Có thể cải thiện thêm một chút.";
    } else if (score >= 50) {
      return "Cần cải thiện. Hãy chú ý hơn đến sức khỏe.";
    } else {
      return "Cần chú ý. Hãy thay đổi thói quen để cải thiện sức khỏe.";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <MaterialIcons name="keyboard-arrow-up" size={20} color="#666" />
          <Text style={styles.dateText}>{getCurrentDate()}</Text>
        </View>
        <View style={styles.headerMain}>
          <View style={styles.headerLeft}>
            <Text style={styles.overviewTitle}>Overview</Text>
            <TouchableOpacity 
              style={styles.allDataButton}
              onPress={() => navigation.navigate('AllHealthData')}
            >
              <MaterialIcons name="bar-chart" size={16} color="#00BCD4" />
              <Text style={styles.allDataButtonText}>All data</Text>
            </TouchableOpacity>
          </View>
          <AvatarDropdown
            avatarUri={userInfo?.profile?.avatar}
            onLogout={logout}
            onProfile={() => {}}
            onSettings={() => {}}
          />
        </View>
      </View>

      {/* Health Score Card */}
      <View style={styles.healthScoreSection}>
        <LinearGradient
          colors={['#00BCD4', '#0097A7']}
          style={styles.healthScoreCard}
        >
          <View style={styles.healthScoreContent}>
            <View style={styles.healthScoreLeft}>
              <Text style={styles.healthScoreTitle}>Health Score</Text>
              <Text style={styles.healthScoreDescription}>
                {getHealthScoreComment(dashboardData.healthScore.score)}
              </Text>
            </View>
            <View style={styles.healthScoreRight}>
              <View style={styles.shieldIcon}>
                <Text style={styles.shieldNumber}>{dashboardData.healthScore.score}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Highlights Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Highlights</Text>
          <TouchableOpacity style={styles.viewMoreButton}>
            <Text style={styles.viewMoreText}>View more</Text>
            <MaterialIcons name="arrow-forward" size={16} color="#666" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.highlightsGrid}>
          {/* Steps Card */}
          <TouchableOpacity 
            style={[styles.highlightCard, styles.stepsCard]}
            onPress={() => navigation.navigate('StepsChart')}
          >
            <View style={styles.highlightIcon}>
              <MaterialIcons name="directions-walk" size={24} color="white" />
            </View>
            <Text style={styles.highlightTitle}>Steps</Text>
            <Text style={styles.highlightValue}>{dashboardData.highlights.steps.value.toLocaleString()}</Text>
            <Text style={styles.highlightLastUpdated}>updated {dashboardData.highlights.steps.lastUpdated}</Text>
          </TouchableOpacity>

          {/* Cycle Tracking Card - Only show for females */}
          {userInfo?.profile?.gender?.toLowerCase() === 'female' && (
            <TouchableOpacity 
              style={[styles.highlightCard, styles.cycleCard]}
              onPress={handleCycleTrackingPress}
            >
              <View style={styles.highlightIcon}>
                <MaterialIcons name="event" size={24} color="white" />
              </View>
              <Text style={styles.highlightTitle}>Cycle tracking</Text>
              <Text style={styles.highlightValue}>
                {dashboardData.highlights.cycleTracking.daysRemaining} days before period
              </Text>
              <Text style={styles.highlightLastUpdated}>
                {dashboardData.highlights.cycleTracking.lastCycleDate && 
                 dashboardData.highlights.cycleTracking.lastCycleDate !== "Chưa có" 
                  ? `Ngày có kinh gần nhất: ${dashboardData.highlights.cycleTracking.lastCycleDate}`
                  : 'Chưa có dữ liệu - Nhấn để cập nhật'
                }
              </Text>
            </TouchableOpacity>
          )}

          {/* Sleep Card */}
          <View style={[styles.highlightCard, styles.sleepCard]}>
            <View style={styles.highlightIcon}>
              <MaterialIcons name="bedtime" size={24} color="white" />
            </View>
            <Text style={styles.highlightTitle}>Sleep</Text>
            <Text style={styles.highlightValue}>{dashboardData.highlights.sleep.formatted}</Text>
            <Text style={styles.highlightLastUpdated}>updated a day ago</Text>
          </View>

          {/* Nutrition Card */}
          <View style={[styles.highlightCard, styles.nutritionCard]}>
            <View style={styles.highlightIcon}>
              <MaterialIcons name="restaurant" size={24} color="white" />
            </View>
            <Text style={styles.highlightTitle}>Nutrition</Text>
            <Text style={styles.highlightValue}>{dashboardData.highlights.nutrition.totalKcal} kcal</Text>
            <Text style={styles.highlightLastUpdated}>updated 5 min ago</Text>
          </View>
        </View>
      </View>

      {/* Weekly Report Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>This week report</Text>
          <TouchableOpacity style={styles.viewMoreButton}>
            <Text style={styles.viewMoreText}>View more</Text>
            <MaterialIcons name="arrow-forward" size={16} color="#666" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.weeklyGrid}>
          <View style={styles.weeklyCard}>
            <MaterialIcons name="directions-walk" size={20} color="#F44336" />
            <Text style={styles.weeklyValue}>{dashboardData.weeklyReport.totalSteps.toLocaleString()}</Text>
          </View>
          <View style={styles.weeklyCard}>
            <MaterialIcons name="fitness-center" size={20} color="#FFC107" />
            <Text style={styles.weeklyValue}>{dashboardData.weeklyReport.formattedWorkoutDuration}</Text>
          </View>
          <View style={styles.weeklyCard}>
            <MaterialIcons name="water-drop" size={20} color="#2196F3" />
            <Text style={styles.weeklyValue}>{Math.round(dashboardData.weeklyReport.totalWater * 1000)} ml</Text>
          </View>
          <View style={styles.weeklyCard}>
            <MaterialIcons name="bedtime" size={20} color="#FFC107" />
            <Text style={styles.weeklyValue}>{dashboardData.weeklyReport.formattedSleepDuration}</Text>
          </View>
        </View>
      </View>

      {/* Blogs Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Blogs</Text>
          <TouchableOpacity style={styles.viewMoreButton}>
            <Text style={styles.viewMoreText}>View more</Text>
            <MaterialIcons name="arrow-forward" size={16} color="#666" />
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.blogsScrollView}
        >
          {dashboardData.blogs.map((blog, index) => (
            <View key={blog.id} style={styles.blogCard}>
              <LinearGradient
                colors={['#00BCD4', '#0097A7']}
                style={styles.blogImage}
              >
                <View style={styles.blogImagePlaceholder}>
                  <MaterialIcons name="article" size={40} color="white" />
                </View>
              </LinearGradient>
              <View style={styles.blogContent}>
                <Chip style={styles.blogCategory} textStyle={styles.blogCategoryText}>
                  {blog.categoryName}
                </Chip>
                <Text style={styles.blogTitle} numberOfLines={2}>
                  {blog.title}
                </Text>
                <View style={styles.blogFooter}>
                  <View style={styles.blogVotes}>
                    <MaterialIcons name="thumb-up" size={16} color="#666" />
                    <Text style={styles.blogVotesText}>{blog.voteCount} votes</Text>
                  </View>
                  <TouchableOpacity style={styles.tellMeMoreButton}>
                    <Text style={styles.tellMeMoreText}>Tell me more</Text>
                    <MaterialIcons name="arrow-forward" size={16} color="#2196F3" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
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
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  retryButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#2196F3',
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  
  // Header Styles
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    fontWeight: '500',
  },
  headerMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  overviewTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  allDataButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2F1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  allDataButtonText: {
    color: '#00BCD4',
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },

  // Health Score Styles
  healthScoreSection: {
    margin: 20,
    marginTop: 10,
  },
  healthScoreCard: {
    borderRadius: 16,
    padding: 20,
    minHeight: 120,
  },
  healthScoreContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  healthScoreLeft: {
    flex: 1,
    marginRight: 20,
  },
  healthScoreTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  healthScoreDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    marginBottom: 12,
  },
  tellMeMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(33, 150, 243, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  tellMeMoreText: {
    color: '#2196F3',
    fontSize: 12,
    marginRight: 4,
    fontWeight: '600',
  },
  healthScoreRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shieldNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },

  // Section Styles
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewMoreText: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },

  // Highlights Grid
  highlightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  highlightCard: {
    width: (width - 60) / 2,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    minHeight: 120,
  },
  stepsCard: {
    backgroundColor: '#00BCD4',
  },
  cycleCard: {
    backgroundColor: '#E91E63',
  },
  sleepCard: {
    backgroundColor: '#673AB7',
  },
  nutritionCard: {
    backgroundColor: '#FF9800',
  },
  highlightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  highlightTitle: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
    marginBottom: 8,
  },
  highlightValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  highlightLastUpdated: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },

  // Weekly Report Grid
  weeklyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  weeklyCard: {
    width: (width - 60) / 2,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  weeklyValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },

  // Blogs Section
  blogsScrollView: {
    marginTop: 8,
  },
  blogCard: {
    width: 280,
    backgroundColor: 'white',
    borderRadius: 16,
    marginRight: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  blogImage: {
    height: 120,
  },
  blogImagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blogContent: {
    padding: 16,
  },
  blogCategory: {
    backgroundColor: '#E3F2FD',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  blogCategoryText: {
    fontSize: 12,
    color: '#2196F3',
  },
  blogTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    lineHeight: 22,
  },
  blogFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  blogVotes: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  blogVotesText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
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

export default DashboardScreen;

