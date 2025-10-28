import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
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

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);

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
                onValueChange={setNotificationsEnabled}
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
                onValueChange={setDarkModeEnabled}
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
                onValueChange={setAutoSyncEnabled}
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

            <TouchableOpacity style={styles.settingRow}>
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

            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons name="shield-check" size={24} color="#00BCD4" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Quyền riêng tư</Text>
                  <Text style={styles.settingSubtitle}>Quản lý quyền riêng tư</Text>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
            </TouchableOpacity>

            <Divider style={styles.divider} />

            <TouchableOpacity 
              style={styles.settingRow}
              onPress={() => {
                Alert.alert(
                  'Xóa dữ liệu',
                  'Bạn có chắc chắn muốn xóa tất cả dữ liệu? Hành động này không thể hoàn tác.',
                  [
                    { text: 'Hủy', style: 'cancel' },
                    { text: 'Xóa', style: 'destructive' }
                  ]
                );
              }}
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

            <TouchableOpacity style={styles.settingRow}>
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

            <TouchableOpacity style={styles.settingRow}>
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

            <TouchableOpacity style={styles.settingRow}>
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


