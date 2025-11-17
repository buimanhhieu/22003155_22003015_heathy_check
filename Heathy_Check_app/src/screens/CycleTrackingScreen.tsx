import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Modal,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { Card, Button } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../context/AuthContext';
import { dashboardApi } from '../api/dashboardApi';

const { width } = Dimensions.get('window');

interface Article {
  id: number;
  title: string;
  image: string;
}

const CycleTrackingScreen: React.FC = () => {
  const navigation = useNavigation();
  const { userInfo } = useAuth();
  const [daysUntilPeriod, setDaysUntilPeriod] = useState(12);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Modal states
  const [showEditPeriodModal, setShowEditPeriodModal] = useState(false);
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  
  // Form states
  const [lastPeriodDate, setLastPeriodDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [symptoms, setSymptoms] = useState('');
  
  // Generate dates for the week
  const generateWeekDates = () => {
    const dates = [];
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = generateWeekDates();
  const dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  // Sample articles with images
  const articles: Article[] = [
    {
      id: 1,
      title: "Craving sweets on your period? Here's why & what to do about it",
      image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=250&fit=crop',
    },
    {
      id: 2,
      title: 'Is birth control good for your menstrual health?',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=250&fit=crop',
    },
  ];

  useEffect(() => {
    loadCycleData();
  }, []);

  const loadCycleData = async (forceRefresh: boolean = false) => {
    if (!userInfo?.id || !userInfo?.token) {
      console.log('⚠️ Cannot load cycle data: missing userInfo');
      return;
    }

    // Nếu forceRefresh, thêm delay nhỏ để đảm bảo backend cache đã được invalidate
    if (forceRefresh) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    try {
      console.log('🔄 Loading cycle data, forceRefresh:', forceRefresh);
      const data = await dashboardApi.getDashboard(userInfo.id, userInfo.token, forceRefresh);
      console.log('📊 Dashboard data received:', data?.highlights?.cycleTracking);
      
      if (data?.highlights?.cycleTracking) {
        // Cập nhật daysRemaining
        if (data.highlights.cycleTracking.daysRemaining !== undefined) {
          setDaysUntilPeriod(data.highlights.cycleTracking.daysRemaining);
          console.log('✅ Updated daysUntilPeriod:', data.highlights.cycleTracking.daysRemaining);
        }
        
        // Cập nhật lastPeriodDate từ lastCycleDate
        const lastCycleDate = data.highlights.cycleTracking.lastCycleDate;
        console.log('📅 lastCycleDate from dashboard:', lastCycleDate);
        
        if (lastCycleDate && lastCycleDate !== "Chưa có" && lastCycleDate !== "0001-01-03") {
          // Parse ngày từ format dd/MM/yyyy hoặc yyyy-MM-dd
          let parsedDate: Date;
          if (lastCycleDate.includes('/')) {
            // Format dd/MM/yyyy (ví dụ: 15/01/2024)
            const [day, month, year] = lastCycleDate.split('/');
            parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            console.log('📅 Parsing date from dd/MM/yyyy:', { day, month, year, parsedDate });
          } else if (lastCycleDate.includes('-')) {
            // Format yyyy-MM-dd (ISO)
            parsedDate = new Date(lastCycleDate + 'T00:00:00'); // Thêm time để tránh timezone issues
            console.log('📅 Parsing date from yyyy-MM-dd:', lastCycleDate, parsedDate);
          } else {
            // Fallback: try to parse as date
            parsedDate = new Date(lastCycleDate);
            console.log('📅 Parsing date as fallback:', lastCycleDate, parsedDate);
          }
          
          // Validate date
          if (!isNaN(parsedDate.getTime())) {
            setLastPeriodDate(parsedDate);
            console.log('✅ Updated lastPeriodDate state to:', parsedDate.toLocaleDateString('vi-VN'));
          } else {
            console.warn('⚠️ Invalid date parsed:', lastCycleDate, parsedDate);
          }
        } else {
          console.log('⚠️ lastCycleDate is empty or invalid:', lastCycleDate);
        }
      } else {
        console.warn('⚠️ No cycle tracking data in dashboard response');
      }
    } catch (error) {
      console.error('❌ Error loading cycle data:', error);
    }
  };

  const getPregnancyChance = () => {
    if (daysUntilPeriod > 14) return 'Low chance of getting pregnant';
    if (daysUntilPeriod > 7) return 'Medium chance of getting pregnant';
    return 'Higher chance of getting pregnant';
  };

  const handleSavePeriodDates = async () => {
    if (!userInfo?.id || !userInfo?.token) {
      Alert.alert('Lỗi', 'Thông tin người dùng không hợp lệ');
      return;
    }

    // Validate: không được chọn ngày tương lai
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    if (lastPeriodDate > today) {
      Alert.alert('Lỗi', 'Không thể chọn ngày trong tương lai');
      return;
    }

    try {
      const dateString = lastPeriodDate.toISOString().split('T')[0];
      console.log('📅 Saving cycle tracking with date:', dateString);
      
      // Sử dụng cycle length mặc định là 28
      await dashboardApi.updateCycleTracking(userInfo.id, userInfo.token, {
        lastCycleDate: dateString,
        cycleLength: 28,
      });
      
      console.log('✅ Cycle tracking updated successfully, date:', lastPeriodDate);
      
      // Đóng modal trước
      setShowEditPeriodModal(false);
      
      // Chờ một chút để đảm bảo backend đã invalidate cache
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Reload data với force refresh để bypass cache và sync với server
      await loadCycleData(true);
      
      Alert.alert('Thành công', 'Đã cập nhật ngày có kinh gần nhất');
    } catch (error: any) {
      console.error('❌ Error updating cycle:', error);
      console.error('Error response:', error.response?.data);
      Alert.alert('Lỗi', `Không thể cập nhật thông tin: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleSaveSymptoms = async (text?: string) => {
    const symptomsText = text || symptoms;
    if (!symptomsText || !symptomsText.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập các triệu chứng');
      return;
    }

    // TODO: Save symptoms to database
    Alert.alert('Thành công', 'Đã lưu thông tin triệu chứng');
    setSymptoms(symptomsText);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      // Giữ nguyên năm hiện tại, chỉ cập nhật ngày và tháng
      const currentYear = new Date().getFullYear();
      const month = selectedDate.getMonth();
      const day = selectedDate.getDate();
      
      // Kiểm tra ngày hợp lệ trong tháng
      const daysInMonth = new Date(currentYear, month + 1, 0).getDate();
      if (day > daysInMonth) {
        // Nếu ngày không hợp lệ (ví dụ: 30/02), set về ngày cuối tháng
        const validDate = new Date(currentYear, month, daysInMonth);
        setLastPeriodDate(validDate);
      } else {
        const updatedDate = new Date(currentYear, month, day);
        setLastPeriodDate(updatedDate);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1E232C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cycle tracking</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Date Picker */}
        <View style={styles.datePickerContainer}>
          <View style={styles.dayNamesRow}>
            {dayNames.map((day, index) => (
              <View key={index} style={styles.dayNameContainer}>
                <Text style={styles.dayName}>{day}</Text>
              </View>
            ))}
          </View>
          <View style={styles.datesRow}>
            {weekDates.map((date, index) => {
              const isSelected = date.getDate() === selectedDate.getDate() &&
                                 date.getMonth() === selectedDate.getMonth();
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dateButton,
                    isSelected && styles.dateButtonSelected,
                  ]}
                  onPress={() => setSelectedDate(date)}
                >
                  <Text
                    style={[
                      styles.dateText,
                      isSelected && styles.dateTextSelected,
                    ]}
                  >
                    {date.getDate()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Period Prediction Circle */}
        <View style={styles.periodContainer}>
          <View style={styles.periodCircle}>
            <Text style={styles.periodLabel}>Period in</Text>
            <Text style={styles.periodDays}>{daysUntilPeriod}</Text>
            <Text style={styles.periodDaysLabel}>days</Text>
            <Text style={styles.pregnancyChance}>{getPregnancyChance()}</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setShowEditPeriodModal(true)}
            >
              <Text style={styles.editButtonText}>Edit period dates</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* How are you feeling today? */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How are you feeling today?</Text>
          <View style={styles.feelingCardWrapper}>
              <TouchableOpacity
                onPress={() => {
                  // Show symptoms input
                  setSymptoms('');
                  Alert.prompt(
                    'Chia sẻ triệu chứng',
                    'Nhập các triệu chứng của bạn hôm nay',
                    [
                      { text: 'Hủy', style: 'cancel' },
                      {
                        text: 'Lưu',
                        onPress: (text) => {
                          if (text && text.trim()) {
                            setSymptoms(text);
                            handleSaveSymptoms();
                          }
                        },
                      },
                    ],
                    'plain-text',
                    symptoms,
                  );
                }}
                style={styles.feelingCardTouchable}
              >
                <Card style={styles.feelingCard}>
                  <Card.Content style={styles.feelingCardContent}>
                    <View style={[styles.feelingIcon, { backgroundColor: '#E0F2F1' }]}>
                      <MaterialCommunityIcons name="bookmark-plus" size={24} color="#00BCD4" />
                    </View>
                    <Text style={styles.feelingCardText} numberOfLines={2}>
                      Share your symptoms with us
                    </Text>
                  </Card.Content>
                </Card>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setShowInsightsModal(true)}
                style={styles.feelingCardTouchable}
              >
                <Card style={styles.feelingCard}>
                  <Card.Content style={styles.feelingCardContent}>
                    <View style={[styles.feelingIcon, { backgroundColor: '#F3E5F5' }]}>
                      <MaterialCommunityIcons name="chart-donut" size={24} color="#9C27B0" />
                    </View>
                    <Text style={styles.feelingCardText} numberOfLines={2}>
                      Here's your daily insights
                    </Text>
                  </Card.Content>
                </Card>
              </TouchableOpacity>
          </View>
        </View>

        {/* Menstrual health articles */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Menstrual health</Text>
            <TouchableOpacity>
              <Text style={styles.viewMoreText}>View more &gt;</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.articlesScrollView}
          >
            {articles.map((article) => (
              <TouchableOpacity
                key={article.id}
                onPress={() => {
                  navigation.navigate('ArticleDetail', {
                    articleId: article.id,
                    title: article.title,
                    image: article.image,
                  } as never);
                }}
              >
                <Card style={styles.articleCard}>
                  <Image
                    source={{ uri: article.image }}
                    style={styles.articleImage}
                    resizeMode="cover"
                  />
                  <Card.Content style={styles.articleContent}>
                    <Text style={styles.articleTitle} numberOfLines={3}>
                      {article.title}
                    </Text>
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Edit Period Dates Modal */}
      <Modal
        visible={showEditPeriodModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditPeriodModal(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidView}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Cập nhật ngày có kinh</Text>
                <TouchableOpacity onPress={() => setShowEditPeriodModal(false)}>
                  <MaterialCommunityIcons name="close" size={24} color="#1E232C" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Ngày có kinh gần nhất</Text>
                  <TouchableOpacity
                    style={styles.dateInput}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={styles.dateInputText}>
                      {lastPeriodDate.toLocaleDateString('vi-VN')}
                    </Text>
                    <MaterialCommunityIcons name="calendar" size={24} color="#00BCD4" />
                  </TouchableOpacity>
                  {showDatePicker && (
                    <View style={styles.datePickerWrapper}>
                      <DateTimePicker
                        value={lastPeriodDate}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={handleDateChange}
                        minimumDate={new Date(new Date().getFullYear(), 0, 1)} // Ngày đầu năm hiện tại
                        maximumDate={new Date()} // Không được quá hôm nay
                        textColor="#1E232C"
                        accentColor="#00BCD4"
                        themeVariant="light"
                      />
                    </View>
                  )}
                </View>

                <Button
                  mode="contained"
                  onPress={handleSavePeriodDates}
                  style={styles.saveButton}
                  buttonColor="#00BCD4"
                >
                  <Text style={styles.saveButtonText}>Cập nhật</Text>
                </Button>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Daily Insights Modal */}
      <Modal
        visible={showInsightsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowInsightsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Daily Insights</Text>
              <TouchableOpacity onPress={() => setShowInsightsModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#1E232C" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.insightsContainer}>
                <View style={styles.insightItem}>
                  <MaterialCommunityIcons name="water" size={24} color="#00BCD4" />
                  <View style={styles.insightContent}>
                    <Text style={styles.insightTitle}>Hydration</Text>
                    <Text style={styles.insightText}>
                      Uống đủ nước giúp giảm đau bụng kinh và cải thiện tâm trạng
                    </Text>
                  </View>
                </View>

                <View style={styles.insightItem}>
                  <MaterialCommunityIcons name="food-apple" size={24} color="#00BCD4" />
                  <View style={styles.insightContent}>
                    <Text style={styles.insightTitle}>Nutrition</Text>
                    <Text style={styles.insightText}>
                      Ăn thực phẩm giàu sắt như rau xanh và thịt đỏ để bù lại lượng máu mất
                    </Text>
                  </View>
                </View>

                <View style={styles.insightItem}>
                  <MaterialCommunityIcons name="sleep" size={24} color="#00BCD4" />
                  <View style={styles.insightContent}>
                    <Text style={styles.insightTitle}>Rest</Text>
                    <Text style={styles.insightText}>
                      Nghỉ ngơi đầy đủ giúp cơ thể phục hồi và giảm căng thẳng
                    </Text>
                  </View>
                </View>

                <View style={styles.insightItem}>
                  <MaterialCommunityIcons name="lightbulb" size={24} color="#00BCD4" />
                  <View style={styles.insightContent}>
                    <Text style={styles.insightTitle}>Tip</Text>
                    <Text style={styles.insightText}>
                      Tập thể dục nhẹ nhàng như yoga có thể giúp giảm đau bụng kinh
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECF4',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E232C',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  datePickerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  dayNamesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  dayNameContainer: {
    flex: 1,
    alignItems: 'center',
  },
  dayName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6A707C',
  },
  datesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  dateButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateButtonSelected: {
    backgroundColor: '#00BCD4',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E232C',
  },
  dateTextSelected: {
    color: '#FFFFFF',
  },
  periodContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  periodCircle: {
    width: width - 80,
    height: width - 80,
    borderRadius: (width - 80) / 2,
    backgroundColor: '#00BCD4',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  periodLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 8,
  },
  periodDays: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    lineHeight: 56,
  },
  periodDaysLabel: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 16,
  },
  pregnancyChance: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.9,
  },
  editButton: {
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00BCD4',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
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
    color: '#1E232C',
    marginBottom: 16,
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00BCD4',
  },
  feelingCardsContainer: {
    // Removed - using wrapper instead
  },
  feelingCardWrapper: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'stretch',
  },
  feelingCardTouchable: {
    flex: 1,
    minWidth: 0,
  },
  feelingCard: {
    borderRadius: 16,
    elevation: 2,
    height: 110, // Fixed height để 2 cards bằng nhau
  },
  feelingCardFull: {
    borderRadius: 16,
    elevation: 2,
    marginBottom: 16,
  },
  feelingCardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 6,
    minHeight: 105, // Min height để đảm bảo đủ chỗ
    height: '100%', // Chiếm full height của card
  },
  symptomsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  feelingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  feelingCardText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E232C',
    textAlign: 'center',
    lineHeight: 14,
    width: '100%',
    flexShrink: 1, // Cho phép text co lại nếu cần
  },
  datePickerWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 8,
    overflow: 'hidden',
    padding: Platform.OS === 'ios' ? 0 : 8,
  },
  insightsContainer: {
    gap: 16,
  },
  insightItem: {
    flexDirection: 'row',
    gap: 16,
    padding: 16,
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E232C',
    marginBottom: 4,
  },
  insightText: {
    fontSize: 14,
    color: '#6A707C',
    lineHeight: 20,
  },
  articlesScrollView: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  articleCard: {
    width: width * 0.75,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
  },
  articleImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#E8ECF4',
  },
  articleContent: {
    padding: 16,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E232C',
    lineHeight: 22,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  keyboardAvoidView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECF4',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E232C',
  },
  modalBody: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E232C',
    marginBottom: 8,
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8ECF4',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#F5F7FA',
  },
  dateInputText: {
    fontSize: 16,
    color: '#1E232C',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E8ECF4',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#F5F7FA',
    color: '#1E232C',
  },
  textArea: {
    height: 120,
    paddingTop: 16,
  },
  saveButton: {
    marginTop: 20,
    paddingVertical: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  insightsContainer: {
    gap: 16,
  },
  insightItem: {
    flexDirection: 'row',
    gap: 16,
    padding: 16,
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E232C',
    marginBottom: 4,
  },
  insightText: {
    fontSize: 14,
    color: '#6A707C',
    lineHeight: 20,
  },
});

export default CycleTrackingScreen;

