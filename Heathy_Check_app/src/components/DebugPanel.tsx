import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Card, Title, Paragraph, Text } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { startStepsTracking, stopStepsTracking, getTodaySteps, saveStepsToDatabase } from '../services/StepsService';
import * as Location from 'expo-location';

const DebugPanel = () => {
  const { clearAllStorage, clearUserStorage, userInfo } = useAuth();
  const [trackingStatus, setTrackingStatus] = useState<string>('Chưa kiểm tra');
  const [locationStatus, setLocationStatus] = useState<string>('Chưa kiểm tra');

  const handleClearAllStorage = async () => {
    try {
      await clearAllStorage();
      console.log('✅ All storage cleared successfully');
      Alert.alert('Thành công', 'Đã xóa toàn bộ storage');
    } catch (error) {
      console.error('❌ Error clearing all storage:', error);
      Alert.alert('Lỗi', 'Không thể xóa storage');
    }
  };

  const handleClearUserStorage = async () => {
    try {
      await clearUserStorage();
      console.log('✅ User storage cleared successfully');
      Alert.alert('Thành công', 'Đã xóa user storage');
    } catch (error) {
      console.error('❌ Error clearing user storage:', error);
      Alert.alert('Lỗi', 'Không thể xóa user storage');
    }
  };

  const handleCheckLocationPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      const { status: bgStatus } = await Location.getBackgroundPermissionsAsync();
      
      const fgText = status === 'granted' ? '✅ Đã cấp' : '❌ Chưa cấp';
      const bgText = bgStatus === 'granted' ? '✅ Đã cấp' : '❌ Chưa cấp';
      
      setLocationStatus(`Foreground: ${fgText}\nBackground: ${bgText}`);
      console.log('Location permissions - Foreground:', status, 'Background:', bgStatus);
    } catch (error) {
      console.error('Error checking permissions:', error);
      setLocationStatus('Lỗi khi kiểm tra');
    }
  };

  const handleStartStepsTracking = async () => {
    try {
      console.log('🚀 Starting steps tracking...');
      await startStepsTracking();
      setTrackingStatus('✅ Đã bật tracking');
      Alert.alert('Thành công', 'Đã bật theo dõi steps. Hãy đi bộ vài mét để test.');
    } catch (error: any) {
      console.error('Error starting tracking:', error);
      setTrackingStatus('❌ Lỗi: ' + error.message);
      Alert.alert('Lỗi', 'Không thể bật tracking: ' + error.message);
    }
  };

  const handleStopStepsTracking = async () => {
    try {
      await stopStepsTracking();
    setTrackingStatus('⏸️ Đã tắt tracking');
      Alert.alert('Thành công', 'Đã tắt theo dõi steps');
    } catch (error: any) {
      console.error('Error stopping tracking:', error);
      Alert.alert('Lỗi', 'Không thể tắt tracking');
    }
  };

  const handleGetTodaySteps = async () => {
    if (!userInfo?.id || !userInfo?.token) {
      Alert.alert('Lỗi', 'Chưa đăng nhập');
      return;
    }

    try {
      const steps = await getTodaySteps(userInfo.id, userInfo.token);
      Alert.alert('Steps hôm nay', `${steps.toLocaleString()} bước`);
      console.log('Today steps:', steps);
    } catch (error: any) {
      console.error('Error getting today steps:', error);
      Alert.alert('Lỗi', 'Không thể lấy dữ liệu: ' + error.message);
    }
  };

  const handleSaveStepsManually = async () => {
    try {
      await saveStepsToDatabase();
      Alert.alert('Thành công', 'Đã lưu steps vào database');
      console.log('✅ Steps saved manually');
    } catch (error: any) {
      console.error('Error saving steps:', error);
      Alert.alert('Lỗi', 'Không thể lưu: ' + error.message);
    }
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Title>Debug Panel</Title>
        <Paragraph>Chỉ hiển thị trong development mode</Paragraph>
        
        {/* Steps Testing Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧪 Test Steps Feature</Text>
          
          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Location Permission:</Text>
            <Text style={styles.statusValue}>{locationStatus}</Text>
          </View>

          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Tracking Status:</Text>
            <Text style={styles.statusValue}>{trackingStatus}</Text>
          </View>
          
          <View style={styles.buttonContainer}>
            <Button 
              mode="outlined" 
              onPress={handleCheckLocationPermission}
              style={styles.button}
              icon="map-marker"
            >
              Kiểm tra Location Permission
            </Button>
            
            <Button 
              mode="contained" 
              onPress={handleStartStepsTracking}
              style={styles.button}
              buttonColor="#4CAF50"
              icon="play-circle"
            >
              Bật Steps Tracking
            </Button>
            
            <Button 
              mode="outlined" 
              onPress={handleStopStepsTracking}
              style={styles.button}
              icon="stop-circle"
            >
              Tắt Steps Tracking
            </Button>
            
            <Button 
              mode="outlined" 
              onPress={handleGetTodaySteps}
              style={styles.button}
              icon="walk"
            >
              Lấy Steps Hôm Nay
            </Button>
            
            <Button 
              mode="outlined" 
              onPress={handleSaveStepsManually}
              style={styles.button}
              icon="content-save"
            >
              Lưu Steps Thủ Công
            </Button>
          </View>
        </View>

        {/* Storage Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🗄️ Storage Management</Text>
          <View style={styles.buttonContainer}>
            <Button 
              mode="contained" 
              onPress={handleClearAllStorage}
              style={styles.button}
              buttonColor="#f44336"
              icon="delete-sweep"
            >
              Xóa toàn bộ Storage
            </Button>
            
            <Button 
              mode="outlined" 
              onPress={handleClearUserStorage}
              style={styles.button}
              icon="account-remove"
            >
              Xóa User Storage
            </Button>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
    backgroundColor: '#fff3e0',
  },
  section: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  statusContainer: {
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 12,
    color: '#333',
  },
  buttonContainer: {
    marginTop: 8,
    gap: 8,
  },
  button: {
    marginVertical: 2,
  },
});

export default DebugPanel;








