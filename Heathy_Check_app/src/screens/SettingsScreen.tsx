import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Linking,
  Share,
} from 'react-native';
import {
  Text,
  Card,
  Divider,
  List,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DashboardStackParamList } from '../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

type SettingsScreenNavigationProp = NativeStackNavigationProp<DashboardStackParamList, 'Settings'>;

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { userInfo, logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);

  // Load settings from AsyncStorage
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const notifications = await AsyncStorage.getItem('settings_notifications');
      const darkMode = await AsyncStorage.getItem('settings_darkMode');
      const autoSync = await AsyncStorage.getItem('settings_autoSync');
      
      if (notifications !== null) setNotificationsEnabled(notifications === 'true');
      if (darkMode !== null) setDarkModeEnabled(darkMode === 'true');
      if (autoSync !== null) setAutoSyncEnabled(autoSync === 'true');
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleNotificationToggle = async (value: boolean) => {
    setNotificationsEnabled(value);
    await AsyncStorage.setItem('settings_notifications', value.toString());
    Alert.alert(
      'Thông báo',
      value ? 'Đã bật thông báo' : 'Đã tắt thông báo',
      [{ text: 'OK' }]
    );
  };

  const handleDarkModeToggle = async (value: boolean) => {
    setDarkModeEnabled(value);
    await AsyncStorage.setItem('settings_darkMode', value.toString());
    Alert.alert(
      'Chế độ tối',
      value 
        ? 'Chế độ tối sẽ được áp dụng trong phiên bản tương lai' 
        : 'Đã tắt chế độ tối',
      [{ text: 'OK' }]
    );
  };

  const handleAutoSyncToggle = async (value: boolean) => {
    setAutoSyncEnabled(value);
    await AsyncStorage.setItem('settings_autoSync', value.toString());
    Alert.alert(
      'Đồng bộ tự động',
      value ? 'Đã bật đồng bộ tự động' : 'Đã tắt đồng bộ tự động',
      [{ text: 'OK' }]
    );
  };

  const handleExportData = async () => {
    Alert.alert(
      'Xuất dữ liệu',
      'Bạn muốn xuất dữ liệu dưới định dạng nào?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'CSV', 
          onPress: () => exportDataAsCSV()
        },
        { 
          text: 'JSON', 
          onPress: () => exportDataAsJSON()
        },
      ]
    );
  };

  const exportDataAsCSV = () => {
    Alert.alert(
      'Xuất CSV',
      'Dữ liệu của bạn sẽ được xuất dưới dạng CSV và lưu vào Downloads',
      [{ text: 'OK' }]
    );
  };

  const exportDataAsJSON = () => {
    Alert.alert(
      'Xuất JSON',
      'Dữ liệu của bạn sẽ được xuất dưới dạng JSON và lưu vào Downloads',
      [{ text: 'OK' }]
    );
  };

  const handleDeleteData = () => {
    Alert.alert(
      'Xóa dữ liệu',
      'Bạn có chắc chắn muốn xóa tất cả dữ liệu sức khỏe? Hành động này không thể hoàn tác.',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: () => confirmDeleteData()
        }
      ]
    );
  };

  const confirmDeleteData = () => {
    Alert.alert(
      'Xác nhận lần cuối',
      'Tất cả dữ liệu sức khỏe của bạn sẽ bị xóa vĩnh viễn. Bạn chắc chắn chứ?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa hoàn toàn', 
          style: 'destructive',
          onPress: async () => {
            // TODO: Gọi API xóa dữ liệu
            Alert.alert('Thành công', 'Đã xóa tất cả dữ liệu sức khỏe');
          }
        }
      ]
    );
  };

  const handleContact = () => {
    Alert.alert(
      'Liên hệ',
      'Chọn phương thức liên hệ:',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Email',
          onPress: () => Linking.openURL('mailto:support@healthycheck.com?subject=Phản hồi từ Healthy Check App')
        },
        { 
          text: 'Điện thoại',
          onPress: () => Linking.openURL('tel:1900xxxx')
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1E232C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cài đặt</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* General Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Chung</Text>
            <Divider style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons name="bell-outline" size={24} color="#00BCD4" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Thông báo</Text>
                  <Text style={styles.settingSubtitle}>Nhận thông báo về sức khỏe</Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: '#E8ECF4', true: '#00BCD4' }}
                thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
              />
            </View>

            <Divider style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons name="theme-light-dark" size={24} color="#00BCD4" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Chế độ tối</Text>
                  <Text style={styles.settingSubtitle}>Bật chế độ giao diện tối</Text>
                </View>
              </View>
              <Switch
                value={darkModeEnabled}
                onValueChange={handleDarkModeToggle}
                trackColor={{ false: '#E8ECF4', true: '#00BCD4' }}
                thumbColor={darkModeEnabled ? '#fff' : '#f4f3f4'}
              />
            </View>

            <Divider style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons name="sync" size={24} color="#00BCD4" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Đồng bộ tự động</Text>
                  <Text style={styles.settingSubtitle}>Tự động đồng bộ dữ liệu</Text>
                </View>
              </View>
              <Switch
                value={autoSyncEnabled}
                onValueChange={handleAutoSyncToggle}
                trackColor={{ false: '#E8ECF4', true: '#00BCD4' }}
                thumbColor={autoSyncEnabled ? '#fff' : '#f4f3f4'}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Data & Privacy */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Dữ liệu & Bảo mật</Text>
            <Divider style={styles.divider} />

            <TouchableOpacity 
              style={styles.settingRow}
              onPress={handleExportData}
            >
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons name="database-export" size={24} color="#00BCD4" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Xuất dữ liệu</Text>
                  <Text style={styles.settingSubtitle}>Tải xuống dữ liệu của bạn</Text>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
            </TouchableOpacity>

            <Divider style={styles.divider} />

            <TouchableOpacity 
              style={styles.settingRow}
              onPress={() => navigation.navigate('PrivacyPolicy')}
            >
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons name="shield-check" size={24} color="#00BCD4" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Chính sách bảo mật</Text>
                  <Text style={styles.settingSubtitle}>Xem chính sách bảo mật</Text>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
            </TouchableOpacity>

            <Divider style={styles.divider} />

            <TouchableOpacity 
              style={styles.settingRow}
              onPress={handleDeleteData}
            >
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons name="delete-outline" size={24} color="#F44336" />
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingTitle, { color: '#F44336' }]}>Xóa dữ liệu</Text>
                  <Text style={styles.settingSubtitle}>Xóa toàn bộ dữ liệu sức khỏe</Text>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
            </TouchableOpacity>
          </Card.Content>
        </Card>

        {/* Support */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Hỗ trợ</Text>
            <Divider style={styles.divider} />

            <TouchableOpacity 
              style={styles.settingRow}
              onPress={() => navigation.navigate('Help')}
            >
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons name="help-circle-outline" size={24} color="#00BCD4" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Trợ giúp & FAQ</Text>
                  <Text style={styles.settingSubtitle}>Câu hỏi thường gặp</Text>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
            </TouchableOpacity>

            <Divider style={styles.divider} />

            <TouchableOpacity 
              style={styles.settingRow}
              onPress={handleContact}
            >
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons name="email-outline" size={24} color="#00BCD4" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Liên hệ</Text>
                  <Text style={styles.settingSubtitle}>Gửi phản hồi cho chúng tôi</Text>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
            </TouchableOpacity>

            <Divider style={styles.divider} />

            <TouchableOpacity 
              style={styles.settingRow}
              onPress={() => navigation.navigate('About')}
            >
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons name="information-outline" size={24} color="#00BCD4" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Về ứng dụng</Text>
                  <Text style={styles.settingSubtitle}>Phiên bản 1.0.0</Text>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
            </TouchableOpacity>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
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
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E232C',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E232C',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#6A707C',
  },
});

export default SettingsScreen;


