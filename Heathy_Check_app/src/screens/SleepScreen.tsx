import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DashboardStackParamList } from '../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../context/AuthContext';
import { dashboardApi, Sleep } from '../api/dashboardApi';
import { sleepNotificationService, SleepSchedule } from '../services/SleepNotificationService';
import userApi from '../api/userApi';
import { ActivityLevel } from '../types/ActivityLevel';
import { BarChart, LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

type SleepScreenNavigationProp = NativeStackNavigationProp<DashboardStackParamList, 'Sleep'>;

interface WeeklySleepData {
  day: string;
  hours: number;
  percentage: number;
}

interface SleepData {
  averageSleep: {
    hours: number;
    minutes: number;
  };
  weeklyData: WeeklySleepData[];
  sleepRate: number;
  deepSleep: {
    hours: number;
    minutes: number;
  };
  schedule: {
    bedtime: string;
    wakeUp: string;
  };
}

// Dummy data cho deep sleep (tạm thời)
const generateDummyDeepSleep = (actualSleepHours: number): { hours: number; minutes: number } => {
  // Deep sleep thường chiếm 15-20% tổng thời gian ngủ
  const deepSleepPercentage = 0.15 + Math.random() * 0.05; // 15-20%
  const deepSleepHours = actualSleepHours * deepSleepPercentage;
  return {
    hours: Math.floor(deepSleepHours),
    minutes: Math.round((deepSleepHours % 1) * 60),
  };
};

// Tính toán sleep rate dựa trên data thật và dummy data
const calculateSleepRate = (actualSleepHours: number, goalHours: number, weeklyData: WeeklySleepData[]): number => {
  // Tính tỷ lệ trung bình từ weekly data (kết hợp data thật và dummy)
  const avgWeeklyPercentage = weeklyData.reduce((sum, day) => sum + day.percentage, 0) / weeklyData.length;
  
  // Tính tỷ lệ từ data thật hôm nay
  const todayPercentage = goalHours > 0 ? (actualSleepHours / goalHours) * 100 : 0;
  
  // Kết hợp: 40% từ data thật, 60% từ weekly average
  const combinedRate = todayPercentage * 0.4 + avgWeeklyPercentage * 0.6;
  
  return Math.round(Math.max(0, Math.min(100, combinedRate)));
};

// Tính toán weekly data dựa trên schedule và data thật
const calculateWeeklyData = (actualSleepHours: number, goalHours: number): WeeklySleepData[] => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, ...
  const adjustedToday = today === 0 ? 6 : today - 1; // Convert to Monday = 0
  
  return days.map((day, index) => {
    // Nếu là ngày hôm nay, dùng data thật
    if (index === adjustedToday) {
      const percentage = goalHours > 0 ? (actualSleepHours / goalHours) * 100 : 0;
      return {
        day,
        hours: actualSleepHours,
        percentage: Math.max(0, Math.min(100, percentage)),
      };
    }
    
    // Các ngày khác: tạo dummy data dựa trên goal với biến động ±20%
    const variation = 0.8 + Math.random() * 0.4; // 0.8 - 1.2
    const dummyHours = goalHours * variation;
    const percentage = goalHours > 0 ? (dummyHours / goalHours) * 100 : 0;
    
    return {
      day,
      hours: Math.round(dummyHours * 10) / 10,
      percentage: Math.max(0, Math.min(100, percentage)),
    };
  });
};

const SleepScreen: React.FC = () => {
  const navigation = useNavigation<SleepScreenNavigationProp>();
  const { userInfo } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<'Today' | 'Weekly' | 'Monthly'>('Weekly');
  const [loading, setLoading] = useState(true);
  const [sleepData, setSleepData] = useState<SleepData | null>(null);
  const [sleepFromApi, setSleepFromApi] = useState<Sleep | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBedtimePicker, setShowBedtimePicker] = useState(false);
  const [showWakeupPicker, setShowWakeupPicker] = useState(false);
  const [tempBedtime, setTempBedtime] = useState<Date | null>(null);
  const [tempWakeup, setTempWakeup] = useState<Date | null>(null);
  const [notificationInitialized, setNotificationInitialized] = useState(false);

  useEffect(() => {
    loadSleepData();
    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    try {
      const initialized = await sleepNotificationService.initialize();
      setNotificationInitialized(initialized);
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  };

  const loadSleepData = async () => {
    if (!userInfo?.id || !userInfo?.token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Lấy dữ liệu sleep từ dashboard API
      const dashboardData = await dashboardApi.getDashboard(userInfo.id, userInfo.token);
      const sleep = dashboardData?.highlights?.sleep;
      setSleepFromApi(sleep || null);

      if (sleep) {
        const actualSleepHours = sleep.hours || 0;
        const goalHours = sleep.goal || 8.0;

        // Tính toán weekly data
        const weeklyData = calculateWeeklyData(actualSleepHours, goalHours);

        // Tính average sleep từ weekly data
        const avgHours = weeklyData.reduce((sum, day) => sum + day.hours, 0) / weeklyData.length;
        const averageSleep = {
          hours: Math.floor(avgHours),
          minutes: Math.round((avgHours % 1) * 60),
        };

        // Tính sleep rate
        const sleepRate = calculateSleepRate(actualSleepHours, goalHours, weeklyData);

        // Generate dummy deep sleep
        const deepSleep = generateDummyDeepSleep(actualSleepHours);

        // Lấy schedule từ user goal (từ dashboard hoặc default)
        // Tạm thời dùng default, sẽ cập nhật khi có API lấy user goal
        const schedule = await getScheduleFromGoal(userInfo.id, userInfo.token);

        const calculatedData: SleepData = {
          averageSleep,
          weeklyData,
          sleepRate,
          deepSleep,
          schedule,
        };

        setSleepData(calculatedData);

        // Cập nhật notification schedule (convert wakeUp -> wakeup)
        if (notificationInitialized) {
          const notificationSchedule: SleepSchedule = {
            bedtime: schedule.bedtime,
            wakeup: schedule.wakeUp, // Convert wakeUp thành wakeup cho SleepSchedule
          };
          await sleepNotificationService.updateSchedule(notificationSchedule);
        }
      }
    } catch (error: any) {
      console.error('Error loading sleep data:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu giấc ngủ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const getScheduleFromGoal = async (userId: number, token: string): Promise<{ bedtime: string; wakeUp: string }> => {
    try {
      // Thử lấy từ notification service (đã lưu trước đó)
      const savedSchedule = await sleepNotificationService.getCurrentSchedule();
      if (savedSchedule) {
        return {
          bedtime: savedSchedule.bedtime,
          wakeUp: savedSchedule.wakeup,
        };
      }

      // Nếu không có, tính từ sleep goal
      // Giả sử goal là số giờ, tính bedtime và wakeup
      // Default: 22:00 - 06:00 (8 giờ)
      const defaultBedtime = '22:00';
      const defaultWakeup = '06:00';

      // Có thể lấy từ dashboard sleep goal và tính toán
      // Tạm thời dùng default
      return {
        bedtime: defaultBedtime,
        wakeUp: defaultWakeup,
      };
    } catch (error) {
      console.error('Error getting schedule:', error);
      return {
        bedtime: '22:00',
        wakeUp: '06:00',
      };
    }
  };

  const formatTime = (hours: number, minutes: number) => {
    return `${hours}h ${minutes} min`;
  };

  const formatTimeString = (timeString: string): string => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'pm' : 'am';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleEditSchedule = () => {
    if (!sleepData) return;

    const [bedtimeHours, bedtimeMinutes] = sleepData.schedule.bedtime.split(':').map(Number);
    const [wakeupHours, wakeupMinutes] = sleepData.schedule.wakeUp.split(':').map(Number);

    const bedtimeDate = new Date();
    bedtimeDate.setHours(bedtimeHours, bedtimeMinutes, 0, 0);

    const wakeupDate = new Date();
    wakeupDate.setHours(wakeupHours, wakeupMinutes, 0, 0);

    setTempBedtime(bedtimeDate);
    setTempWakeup(wakeupDate);
    setShowEditModal(true);
  };

  const handleBedtimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      if (event.type === 'set' && selectedDate) {
        setTempBedtime(selectedDate);
      }
      setShowBedtimePicker(false);
    } else {
      // iOS
      if (event.type === 'set' && selectedDate) {
        setTempBedtime(selectedDate);
      }
    }
  };

  const handleWakeupChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      if (event.type === 'set' && selectedDate) {
        setTempWakeup(selectedDate);
      }
      setShowWakeupPicker(false);
    } else {
      // iOS
      if (event.type === 'set' && selectedDate) {
        setTempWakeup(selectedDate);
      }
    }
  };

  const handleSaveSchedule = async () => {
    if (!tempBedtime || !tempWakeup || !sleepData) {
      Alert.alert('Lỗi', 'Vui lòng chọn đầy đủ giờ đi ngủ và giờ thức dậy');
      return;
    }

    try {
      // Cập nhật schedule
      const bedtimeStr = `${tempBedtime.getHours().toString().padStart(2, '0')}:${tempBedtime.getMinutes().toString().padStart(2, '0')}`;
      const wakeupStr = `${tempWakeup.getHours().toString().padStart(2, '0')}:${tempWakeup.getMinutes().toString().padStart(2, '0')}`;

      // Convert để tương thích với SleepSchedule interface (wakeup, không phải wakeUp)
      const newSchedule: SleepSchedule = {
        bedtime: bedtimeStr,
        wakeup: wakeupStr, // SleepSchedule dùng 'wakeup'
      };

      // Cập nhật notification
      if (notificationInitialized) {
        const success = await sleepNotificationService.updateSchedule(newSchedule);
        if (!success) {
          console.warn('Failed to update notification schedule');
        }
      }

      // Cập nhật UI ngay lập tức (optimistic update)
      setSleepData({
        ...sleepData,
        schedule: {
          bedtime: bedtimeStr,
          wakeUp: wakeupStr,
        },
      });

      // Đóng modal và đóng các picker
      setShowEditModal(false);
      setShowBedtimePicker(false);
      setShowWakeupPicker(false);

      // Hiển thị thông báo thành công ngay
      Alert.alert(
        'Thành công', 
        `Đã cập nhật lịch trình ngủ:\n• Giờ đi ngủ: ${bedtimeStr}\n• Giờ thức dậy: ${wakeupStr}\n\nThông báo báo thức đã được lên lịch tự động.`
      );

      // Đồng bộ lên server (không block UI)
      if (userInfo?.id && userInfo?.token) {
        try {
          await userApi.put(`/${userInfo.id}/goals`, {
            bedtime: `${bedtimeStr}:00`,
            wakeup: `${wakeupStr}:00`,
            dailyStepsGoal: 10000,
            activityLevel: ActivityLevel.MODERATELY_ACTIVE,
          });
          console.log('[SleepScreen] Schedule synced to server successfully');
        } catch (syncError: any) {
          // Xử lý lỗi sync một cách graceful
          console.warn('[SleepScreen] Failed to sync schedule to server:', syncError?.response?.status || syncError?.message);
          
          // Không hiển thị lỗi cho user vì dữ liệu đã được lưu local
          // Chỉ log để debug
          if (syncError?.response?.status === 401) {
            console.warn('[SleepScreen] Token may be expired, but schedule was saved locally');
          } else if (syncError?.response?.status === 404) {
            console.warn('[SleepScreen] Goals endpoint not found on server');
          } else {
            console.warn('[SleepScreen] Network or server error, schedule saved locally only');
          }
        }
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật lịch trình. Vui lòng thử lại.');
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setShowBedtimePicker(false);
    setShowWakeupPicker(false);
  };

  // Generate hourly sleep data for Today (dummy data based on actual sleep)
  const todayChartData = useMemo(() => {
    if (!sleepData) {
      console.log('[SleepScreen] todayChartData: no sleepData yet');
      return { labels: [], data: [] };
    }
    
    const actualSleepHours = sleepData.averageSleep.hours + sleepData.averageSleep.minutes / 60;
    const hours = ['10PM', '12AM', '2AM', '4AM', '6AM'];
    
    // Simulate sleep depth throughout the night
    // Pattern: light → deep → light (realistic sleep cycle)
    const sleepDepth = [0.3, 0.8, 1.0, 0.7, 0.4]; // 0-1 scale
    
    const result = {
      labels: hours,
      data: sleepDepth.map(depth => depth * actualSleepHours)
    };
    
    console.log('[SleepScreen] todayChartData generated:', result);
    return result;
  }, [sleepData]);

  // Generate monthly sleep data (30 days)
  const monthlyChartData = useMemo(() => {
    if (!sleepData) {
      console.log('[SleepScreen] monthlyChartData: no sleepData yet');
      return { labels: [], data: [] };
    }
    
    const avgHours = sleepData.averageSleep.hours + sleepData.averageSleep.minutes / 60;
    const data = [];
    
    for (let i = 1; i <= 30; i++) {
      // Add variation ±1 hour
      const variation = 0.85 + Math.random() * 0.3; // 0.85 - 1.15
      data.push(avgHours * variation);
    }
    
    const result = {
      labels: data.filter((_, i) => i % 5 === 0).map((_, i) => (i * 5 + 1).toString()),
      data: data
    };
    
    console.log('[SleepScreen] monthlyChartData generated:', { labelCount: result.labels.length, dataCount: result.data.length });
    return result;
  }, [sleepData]);

  const chartConfig = {
    backgroundColor: '#00BCD4',
    backgroundGradientFrom: '#00BCD4',
    backgroundGradientTo: '#0097A7',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#FFFFFF'
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: 'rgba(255, 255, 255, 0.3)',
      strokeWidth: 1
    },
  };

  const renderBarChart = () => {
    if (!sleepData) return null;

    const maxHeight = 120;
    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartBars}>
          {sleepData.weeklyData.map((item, index) => (
            <View key={index} style={styles.barWrapper}>
              <View style={styles.barContainer}>
                <View style={[styles.barEmpty, { height: maxHeight }]} />
                <View
                  style={[
                    styles.barFilled,
                    {
                      height: (item.percentage / 100) * maxHeight,
                      backgroundColor: index === 5 ? '#00BCD4' : '#B2EBF2', // Sat is darker
                    },
                  ]}
                />
              </View>
              <Text style={styles.barLabel}>{item.day}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sleep</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00BCD4" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!sleepData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sleep</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Không có dữ liệu</Text>
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
        <Text style={styles.headerTitle}>Sleep</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Average Sleep Summary */}
        <View style={styles.averageSection}>
          <Text style={styles.averageText}>
            Thời gian ngủ trung bình mỗi ngày của bạn là
          </Text>
          <Text style={styles.averageValue}>
            {formatTime(sleepData.averageSleep.hours, sleepData.averageSleep.minutes)}
          </Text>
          {sleepFromApi && (
            <Text style={styles.lastUpdatedText}>
              Cập nhật: {sleepFromApi.lastUpdated}
            </Text>
          )}
        </View>

        {/* Time Period Selector */}
        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[
              styles.periodButton,
              selectedPeriod === 'Today' && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod('Today')}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === 'Today' && styles.periodButtonTextActive,
              ]}
            >
              Hôm nay
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.periodButton,
              selectedPeriod === 'Weekly' && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod('Weekly')}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === 'Weekly' && styles.periodButtonTextActive,
              ]}
            >
              Tuần
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.periodButton,
              selectedPeriod === 'Monthly' && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod('Monthly')}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === 'Monthly' && styles.periodButtonTextActive,
              ]}
            >
              Tháng
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sleep Charts */}
        {selectedPeriod === 'Today' ? (
          todayChartData.data.length > 0 ? (
            <View style={styles.chartWrapper}>
              <BarChart
                data={{
                  labels: todayChartData.labels,
                  datasets: [{ data: todayChartData.data }]
                }}
                width={width - 60}
                height={200}
                yAxisLabel=""
                yAxisSuffix="h"
                chartConfig={chartConfig}
                style={styles.modernChart}
                fromZero={true}
                showValuesOnTopOfBars={false}
              />
            </View>
          ) : (
            <View style={styles.chartContainer}>
              <Text style={{ textAlign: 'center', color: '#999' }}>Đang tải biểu đồ...</Text>
            </View>
          )
        ) : null}
        
        {selectedPeriod === 'Weekly' && renderBarChart()}
        
        {selectedPeriod === 'Monthly' ? (
          monthlyChartData.data.length > 0 ? (
            <View style={styles.chartWrapper}>
              <LineChart
                data={{
                  labels: monthlyChartData.labels,
                  datasets: [{ 
                    data: monthlyChartData.data,
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    strokeWidth: 3
                  }]
                }}
                width={width - 60}
                height={200}
                yAxisLabel=""
                yAxisSuffix="h"
                chartConfig={chartConfig}
                bezier
                style={styles.modernChart}
                withInnerLines={true}
                withOuterLines={false}
                withVerticalLines={false}
                withHorizontalLines={true}
                fromZero={false}
                segments={4}
              />
            </View>
          ) : (
            <View style={styles.chartContainer}>
              <Text style={{ textAlign: 'center', color: '#999' }}>Đang tải biểu đồ...</Text>
            </View>
          )
        ) : null}

        {/* Sleep Metric Summary Cards */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricCard}>
            <View style={styles.metricIconContainer}>
              <MaterialIcons name="star" size={24} color="#FFC107" />
            </View>
            <Text style={styles.metricLabel}>Sleep rate</Text>
            <Text style={styles.metricValue}>{sleepData.sleepRate}%</Text>
            <Text style={styles.metricSubtext}>
              {sleepData.sleepRate >= 80 ? 'Tuyệt vời' : sleepData.sleepRate >= 60 ? 'Tốt' : 'Cần cải thiện'}
            </Text>
          </View>
          <View style={styles.metricCard}>
            <View style={styles.metricIconContainer}>
              <MaterialIcons name="bedtime" size={24} color="#FFC107" />
            </View>
            <Text style={styles.metricLabel}>Deepsleep</Text>
            <Text style={styles.metricValue}>
              {formatTime(sleepData.deepSleep.hours, sleepData.deepSleep.minutes)}
            </Text>
            <Text style={styles.metricSubtext}>Dummy data</Text>
          </View>
        </View>

        {/* Sleep Schedule Section */}
        <View style={styles.scheduleSection}>
          <View style={styles.scheduleHeader}>
            <Text style={styles.scheduleTitle}>Lịch trình ngủ</Text>
            <TouchableOpacity onPress={handleEditSchedule}>
              <Text style={styles.editButton}>Chỉnh sửa</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.scheduleCards}>
            <View style={[styles.scheduleCard, styles.bedtimeCard]}>
              <View style={styles.scheduleCardContent}>
                <MaterialIcons name="bed" size={20} color="white" />
                <Text style={styles.scheduleCardLabel}>Giờ đi ngủ</Text>
              </View>
              <Text style={styles.scheduleCardTime}>
                {formatTimeString(sleepData.schedule.bedtime)}
              </Text>
              {notificationInitialized && (
                <Text style={styles.notificationStatus}>🔔 Đã bật thông báo</Text>
              )}
            </View>
            <View style={[styles.scheduleCard, styles.wakeUpCard]}>
              <View style={styles.scheduleCardContent}>
                <MaterialIcons name="notifications" size={20} color="white" />
                <Text style={styles.scheduleCardLabel}>Giờ thức dậy</Text>
              </View>
              <Text style={styles.scheduleCardTime}>
                {formatTimeString(sleepData.schedule.wakeUp)}
              </Text>
              {notificationInitialized && (
                <Text style={styles.notificationStatus}>🔔 Đã bật thông báo</Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>


      {/* Edit Schedule Modal */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancelEdit}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalOverlayTouchable}
            activeOpacity={1}
            onPress={handleCancelEdit}
          />
          <View style={styles.modalContentContainer}>
            <SafeAreaView style={styles.modalSafeArea}>
              <View style={styles.modalContentInner}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Chỉnh sửa lịch trình ngủ</Text>
                  <TouchableOpacity onPress={handleCancelEdit}>
                    <MaterialIcons name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>

                <ScrollView 
                  style={styles.modalBodyScroll}
                  contentContainerStyle={styles.modalBody}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
              {/* Bedtime Picker */}
              <View style={styles.timePickerSection}>
                <View style={styles.timePickerLabelContainer}>
                  <MaterialIcons name="bed" size={20} color="#F44336" />
                  <Text style={styles.timePickerLabel}>Giờ đi ngủ</Text>
                </View>
                {Platform.OS === 'ios' ? (
                  <View style={styles.timePickerContainer}>
                    <DateTimePicker
                      value={tempBedtime || new Date()}
                      mode="time"
                      is24Hour={true}
                      display="spinner"
                      onChange={handleBedtimeChange}
                      style={styles.timePicker}
                      textColor="#000"
                    />
                  </View>
                ) : (
                  <>
                    <TouchableOpacity
                      style={styles.timePickerButton}
                      onPress={() => setShowBedtimePicker(true)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.timePickerButtonText}>
                        {tempBedtime
                          ? `${tempBedtime.getHours().toString().padStart(2, '0')}:${tempBedtime.getMinutes().toString().padStart(2, '0')}`
                          : 'Chọn giờ'}
                      </Text>
                      <MaterialIcons name="access-time" size={20} color="#666" />
                    </TouchableOpacity>
                    {showBedtimePicker && tempBedtime && (
                      <DateTimePicker
                        value={tempBedtime}
                        mode="time"
                        is24Hour={true}
                        display="default"
                        onChange={handleBedtimeChange}
                      />
                    )}
                  </>
                )}
              </View>

              {/* Wakeup Picker */}
              <View style={styles.timePickerSection}>
                <View style={styles.timePickerLabelContainer}>
                  <MaterialIcons name="notifications" size={20} color="#FF9800" />
                  <Text style={styles.timePickerLabel}>Giờ thức dậy</Text>
                </View>
                {Platform.OS === 'ios' ? (
                  <View style={styles.timePickerContainer}>
                    <DateTimePicker
                      value={tempWakeup || new Date()}
                      mode="time"
                      is24Hour={true}
                      display="spinner"
                      onChange={handleWakeupChange}
                      style={styles.timePicker}
                      textColor="#000"
                    />
                  </View>
                ) : (
                  <>
                    <TouchableOpacity
                      style={styles.timePickerButton}
                      onPress={() => setShowWakeupPicker(true)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.timePickerButtonText}>
                        {tempWakeup
                          ? `${tempWakeup.getHours().toString().padStart(2, '0')}:${tempWakeup.getMinutes().toString().padStart(2, '0')}`
                          : 'Chọn giờ'}
                      </Text>
                      <MaterialIcons name="access-time" size={20} color="#666" />
                    </TouchableOpacity>
                    {showWakeupPicker && tempWakeup && (
                      <DateTimePicker
                        value={tempWakeup}
                        mode="time"
                        is24Hour={true}
                        display="default"
                        onChange={handleWakeupChange}
                      />
                    )}
                  </>
                )}
              </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={handleCancelEdit}
                >
                  <Text style={styles.cancelButtonText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.updateButton]}
                  onPress={handleSaveSchedule}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="check-circle" size={20} color="#fff" />
                  <Text style={styles.updateButtonText}>Cập nhật</Text>
                </TouchableOpacity>
              </View>
            </View>
            </SafeAreaView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#999',
  },
  averageSection: {
    marginBottom: 24,
  },
  averageText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  averageValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00BCD4',
  },
  lastUpdatedText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  periodSelector: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#00BCD4',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  chartContainer: {
    marginBottom: 24,
    paddingVertical: 16,
  },
  chartWrapper: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#00BCD4',
    padding: 16,
    alignItems: 'center',
  },
  modernChart: {
    borderRadius: 16,
    marginVertical: 0,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    width: '80%',
    height: 120,
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
  },
  barEmpty: {
    position: 'absolute',
    width: '100%',
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    bottom: 0,
  },
  barFilled: {
    position: 'absolute',
    width: '100%',
    borderRadius: 8,
    bottom: 0,
  },
  barLabel: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  metricsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  metricIconContainer: {
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  metricSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  scheduleSection: {
    marginBottom: 24,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    fontSize: 14,
    color: '#00BCD4',
    fontWeight: '600',
  },
  scheduleCards: {
    flexDirection: 'row',
    gap: 12,
  },
  scheduleCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    minHeight: 100,
  },
  bedtimeCard: {
    backgroundColor: '#F44336',
  },
  wakeUpCard: {
    backgroundColor: '#FF9800',
  },
  scheduleCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  scheduleCardLabel: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  scheduleCardTime: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  notificationStatus: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  pickerCancel: {
    fontSize: 16,
    color: '#999',
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  pickerConfirm: {
    fontSize: 16,
    color: '#00BCD4',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalOverlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  modalContentContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: Platform.OS === 'ios' ? '85%' : '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    width: '100%',
    position: 'relative',
    zIndex: 2,
  },
  modalSafeArea: {
    backgroundColor: '#fff',
    minHeight: 400,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalContentInner: {
    flexDirection: 'column',
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBodyScroll: {
    maxHeight: Platform.OS === 'ios' ? 400 : 350,
  },
  modalBody: {
    padding: 20,
    paddingBottom: 20,
  },
  timePickerSection: {
    marginBottom: 20,
  },
  timePickerLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  timePickerLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  timePickerContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    paddingVertical: 8,
    overflow: 'hidden',
  },
  timePicker: {
    width: '100%',
    height: Platform.OS === 'ios' ? 150 : 120,
  },
  timePickerButton: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  timePickerButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    letterSpacing: 1,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 20 : 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
    backgroundColor: '#fff',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00BCD4',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
    shadowColor: '#00BCD4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default SleepScreen;
