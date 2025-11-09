import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  StatusBar,
  Platform,
  Modal as RNModal,
} from 'react-native';
import {
  Text,
  Avatar,
  Card,
  Button,
  IconButton,
  Divider,
  Portal,
  Modal,
  TextInput,
  HelperText,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../context/AuthContext';
import userApi from '../api/userApi';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../navigation/types';

type ProfileScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'ProfileMain'>;

const ProfileScreen: React.FC = () => {
  const { userInfo, logout, updateUserInfo } = useAuth();
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [fullName, setFullName] = useState(userInfo?.fullName || '');
  const [dateOfBirth, setDateOfBirth] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState(userInfo?.profile?.gender || 'MALE');
  const [heightCm, setHeightCm] = useState(userInfo?.profile?.heightCm?.toString() || '');
  const [weightKg, setWeightKg] = useState(userInfo?.profile?.weightKg?.toString() || '');
  const [avatar, setAvatar] = useState<string | null>(userInfo?.profile?.avatar || null);
  const [error, setError] = useState('');

  // Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (userInfo?.profile?.dateOfBirth) {
      setDateOfBirth(new Date(userInfo.profile.dateOfBirth));
    }
    // Chỉ cập nhật fullName khi userInfo thay đổi và modal không mở (tránh override khi đang chỉnh sửa)
    if (userInfo?.fullName && !editModalVisible) {
      setFullName(userInfo.fullName);
    }
  }, [userInfo, editModalVisible]);
  
  // Cập nhật form state khi mở modal (chỉ khi modal mới mở, không reset khi userInfo thay đổi)
  useEffect(() => {
    if (editModalVisible) {
      console.log('🔄 Modal opened, initializing form with userInfo:', {
        fullName: userInfo?.fullName,
        email: userInfo?.email
      });
      if (userInfo) {
        setFullName(userInfo.fullName || '');
        setAvatar(userInfo.profile?.avatar || null);
        setHeightCm(userInfo.profile?.heightCm?.toString() || '');
        setWeightKg(userInfo.profile?.weightKg?.toString() || '');
        setGender(userInfo.profile?.gender || 'MALE');
        if (userInfo.profile?.dateOfBirth) {
          setDateOfBirth(new Date(userInfo.profile.dateOfBirth));
        }
      }
    }
  }, [editModalVisible]); // Chỉ chạy khi editModalVisible thay đổi, không phụ thuộc userInfo
  
  // Debug: Log khi showDatePicker thay đổi
  useEffect(() => {
    console.log('📅 showDatePicker changed to:', showDatePicker);
  }, [showDatePicker]);
  
  // Debug: Log khi dateOfBirth thay đổi
  useEffect(() => {
    console.log('📅 dateOfBirth changed to:', dateOfBirth, 'formatted:', formatDate(dateOfBirth));
  }, [dateOfBirth]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (userInfo?.id) {
        const { data: profileData } = await userApi.get(`/${userInfo.id}/profile`);
        const updatedInfo = {
          ...userInfo,
          profile: profileData,
        };
        await updateUserInfo(updatedInfo);
        setAvatar(profileData.avatar || null);
        setHeightCm(profileData.heightCm?.toString() || '');
        setWeightKg(profileData.weightKg?.toString() || '');
        setGender(profileData.gender || 'MALE');
        if (profileData.dateOfBirth) {
          setDateOfBirth(new Date(profileData.dateOfBirth));
        }
      }
    } catch (e) {
      console.error('Error refreshing profile:', e);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const handleImagePicker = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Cần cấp quyền', 'Vui lòng cấp quyền truy cập thư viện ảnh!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.3,
        base64: true,
        exif: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        if (asset.base64) {
          const base64String = `data:image/jpeg;base64,${asset.base64}`;
          
          if (base64String.length > 300000) {
            Alert.alert(
              'Ảnh quá lớn',
              'Vui lòng chọn ảnh nhỏ hơn.'
            );
            return;
          }
          
          setAvatar(base64String);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
    }
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    console.log('📅 Date picker event:', event.type, 'selectedDate:', selectedDate);
    
    if (Platform.OS === 'android') {
      // Android: DateTimePicker tự đóng sau khi chọn hoặc hủy
      // Luôn đóng picker trước, sau đó mới cập nhật date nếu có
      setShowDatePicker(false);
      
      if (event.type === 'set' && selectedDate) {
        console.log('📅 Android: Date selected:', selectedDate);
        setDateOfBirth(selectedDate);
      } else if (event.type === 'dismissed') {
        console.log('📅 Android: Date picker dismissed');
      }
    } else if (Platform.OS === 'ios') {
      // iOS: DateTimePicker cập nhật liên tục khi scroll
      // Chỉ cập nhật khi có selectedDate (không phải dismissed)
      if (selectedDate && event.type !== 'dismissed') {
        console.log('📅 iOS: Date updated:', selectedDate);
        setDateOfBirth(selectedDate);
      }
    }
  };
  
  const handleDatePickerDone = () => {
    console.log('📅 Date picker done, final date:', dateOfBirth);
    setShowDatePicker(false);
  };

  const handleSaveProfile = async () => {
    if (!userInfo) {
      setError('Thông tin người dùng không tìm thấy.');
      return;
    }
    if (!fullName || fullName.trim() === '') {
      setError('Vui lòng nhập họ và tên.');
      return;
    }
    if (!heightCm || !weightKg) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    const height = parseFloat(heightCm);
    const weight = parseFloat(weightKg);

    if (isNaN(height) || height < 100 || height > 250) {
      setError('Chiều cao phải từ 100cm đến 250cm.');
      return;
    }

    if (isNaN(weight) || weight < 30 || weight > 300) {
      setError('Cân nặng phải từ 30kg đến 300kg.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      console.log('📤 Sending profile update:', {
        fullName,
        dateOfBirth: formatDate(dateOfBirth),
        avatar,
        gender,
        heightCm: height,
        weightKg: weight,
      });
      
      const response = await userApi.put(`/${userInfo.id}/profile`, {
        dateOfBirth: formatDate(dateOfBirth),
        fullName,
        avatar,
        gender,
        heightCm: height,
        weightKg: weight,
      });
      
      console.log('✅ Profile update response:', response.data);
      
      const updatedUserInfo = {
        ...userInfo,
        fullName: fullName, // Cập nhật fullName ở root level
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
      
      await updateUserInfo(updatedUserInfo);
      
      // Reload profile từ server để đảm bảo dữ liệu đồng bộ
      try {
        const { data: profileData } = await userApi.get(`/${userInfo.id}/profile`);
        const finalUpdatedInfo = {
          ...updatedUserInfo,
          fullName: profileData.fullName || updatedUserInfo.fullName,
        };
        await updateUserInfo(finalUpdatedInfo);
      } catch (e) {
        console.error('Error reloading profile:', e);
      }
      
      setEditModalVisible(false);
      Alert.alert('Thành công', 'Cập nhật thông tin thành công!');
    } catch (e: any) {
      console.error('❌ Error updating profile:', e);
      console.error('Error response:', e.response?.data);
      console.error('Error status:', e.response?.status);
      const errorMessage = e.response?.data?.message || e.message || 'Cập nhật thông tin thất bại. Vui lòng thử lại.';
      setError(errorMessage);
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu mới và xác nhận mật khẩu không khớp.');
      return;
    }

    setLoading(true);
    setPasswordError('');
    try {
      await userApi.put(`/${userInfo?.id}/change-password`, {
        currentPassword,
        newPassword,
      });
      
      setChangePasswordModalVisible(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Thành công', 'Đổi mật khẩu thành công!');
    } catch (e: any) {
      if (e.response?.status === 400) {
        setPasswordError('Mật khẩu hiện tại không đúng.');
      } else {
        setPasswordError('Đổi mật khẩu thất bại. Vui lòng thử lại.');
      }
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const calculateBMI = () => {
    if (userInfo?.profile?.heightCm && userInfo?.profile?.weightKg) {
      const heightM = userInfo.profile.heightCm / 100;
      const bmi = userInfo.profile.weightKg / (heightM * heightM);
      return bmi.toFixed(1);
    }
    return 'N/A';
  };

  const getBMIStatus = (bmi: string) => {
    const bmiValue = parseFloat(bmi);
    if (isNaN(bmiValue)) return { text: 'Chưa có dữ liệu', color: '#999' };
    if (bmiValue < 18.5) return { text: 'Thiếu cân', color: '#FF9800' };
    if (bmiValue < 25) return { text: 'Bình thường', color: '#4CAF50' };
    if (bmiValue < 30) return { text: 'Thừa cân', color: '#FF9800' };
    return { text: 'Béo phì', color: '#F44336' };
  };

  const bmi = calculateBMI();
  const bmiStatus = getBMIStatus(bmi);

  return (
    <>
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hồ Sơ Cá Nhân</Text>
        <IconButton
          icon="logout"
          iconColor="#F44336"
          size={24}
          onPress={handleLogout}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00BCD4']} />
        }
      >
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          {userInfo?.profile?.avatar ? (
            <Image source={{ uri: userInfo.profile.avatar }} style={styles.avatarImage} />
          ) : (
            <Avatar.Text
              size={100}
              label={(userInfo?.fullName || userInfo?.email || 'U').charAt(0).toUpperCase()}
              style={styles.avatarPlaceholder}
            />
          )}
          <Text style={styles.userName}>{userInfo?.fullName || userInfo?.email || 'User'}</Text>
          {/* <Text style={styles.userEmail}>{userInfo?.email}</Text> */}
        </View>

        {/* BMI Card */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.bmiContainer}>
              <View style={styles.bmiLeft}>
                <MaterialCommunityIcons name="heart-pulse" size={40} color="#00BCD4" />
              </View>
              <View style={styles.bmiRight}>
                <Text style={styles.bmiLabel}>Chỉ số BMI</Text>
                <Text style={styles.bmiValue}>{bmi}</Text>
                <Text style={[styles.bmiStatus, { color: bmiStatus.color }]}>
                  {bmiStatus.text}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Personal Info Card */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Thông tin cá nhân</Text>
              <IconButton
                icon="pencil"
                iconColor="#00BCD4"
                size={20}
                onPress={() => setEditModalVisible(true)}
              />
            </View>
            <Divider style={styles.divider} />
            
            <InfoRow
              icon="calendar"
              label="Ngày sinh"
              value={userInfo?.profile?.dateOfBirth ? formatDisplayDate(userInfo.profile.dateOfBirth) : 'Chưa cập nhật'}
            />
            <InfoRow
              icon="gender-male-female"
              label="Giới tính"
              value={userInfo?.profile?.gender === 'MALE' ? 'Nam' : userInfo?.profile?.gender === 'FEMALE' ? 'Nữ' : 'Chưa cập nhật'}
            />
            <InfoRow
              icon="human-male-height"
              label="Chiều cao"
              value={userInfo?.profile?.heightCm ? `${userInfo.profile.heightCm} cm` : 'Chưa cập nhật'}
            />
            <InfoRow
              icon="weight-kilogram"
              label="Cân nặng"
              value={userInfo?.profile?.weightKg ? `${userInfo.profile.weightKg} kg` : 'Chưa cập nhật'}
              isLast
            />
          </Card.Content>
        </Card>

        {/* Actions Card */}
        <Card style={styles.card}>
          <Card.Content>
            <TouchableOpacity 
              style={styles.actionRow}
              onPress={() => navigation.navigate('PrivacyPolicy')}
            >
              <MaterialCommunityIcons name="shield-check" size={24} color="#00BCD4" />
              <Text style={styles.actionText}>Chính sách bảo mật</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
            </TouchableOpacity>
            <Divider style={styles.divider} />
            <TouchableOpacity 
              style={styles.actionRow}
              onPress={() => navigation.navigate('Help')}
            >
              <MaterialCommunityIcons name="help-circle" size={24} color="#00BCD4" />
              <Text style={styles.actionText}>Trợ giúp</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
            </TouchableOpacity>
            <Divider style={styles.divider} />
            <TouchableOpacity 
              style={styles.actionRow}
              onPress={() => navigation.navigate('About')}
            >
              <MaterialCommunityIcons name="information" size={24} color="#00BCD4" />
              <Text style={styles.actionText}>Về ứng dụng</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
            </TouchableOpacity>
            <Divider style={styles.divider} />
            <TouchableOpacity 
              style={styles.actionRow}
              onPress={() => setChangePasswordModalVisible(true)}
            >
              <MaterialCommunityIcons name="lock-reset" size={24} color="#00BCD4" />
              <Text style={styles.actionText}>Đổi mật khẩu</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
            </TouchableOpacity>
          </Card.Content>
        </Card>

        {/* Logout Button */}
        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutButton}
          labelStyle={styles.logoutButtonText}
          icon="logout"
        >
          Đăng xuất
        </Button>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Portal>
        <Modal
          visible={editModalVisible}
          onDismiss={() => setEditModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <ScrollView>
            <Text style={styles.modalTitle}>Chỉnh sửa thông tin</Text>

            {/* Avatar Picker */}
            <TouchableOpacity
              style={styles.modalAvatarContainer}
              onPress={handleImagePicker}
            >
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.modalAvatarImage} />
              ) : (
                <View style={styles.modalAvatarPlaceholder}>
                  <MaterialCommunityIcons name="camera" size={32} color="#999" />
                  <Text style={styles.modalAvatarText}>Chọn ảnh đại diện</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Full Name */}
            <TextInput
              label="Họ và tên"
              value={fullName || ''}
              onChangeText={(text) => {
                console.log('📝 fullName changed:', text);
                setFullName(text);
              }}
              mode="outlined"
              style={styles.modalInput}
              activeOutlineColor="#00BCD4"
              editable={true}
              placeholder="Nhập họ và tên"
              keyboardType="default"
              autoCapitalize="words"
              returnKeyType="next"
            />

            {/* Date of Birth */}
            <View style={styles.modalInput}>
              <TouchableOpacity 
                onPress={() => {
                  console.log('📅 Opening date picker, current date:', dateOfBirth);
                  console.log('📅 showDatePicker will be set to:', true);
                  setShowDatePicker(true);
                }}
                activeOpacity={0.7}
                style={{ width: '100%' }}
              >
                <TextInput
                  label="Ngày sinh"
                  value={formatDate(dateOfBirth)}
                  mode="outlined"
                  style={{ backgroundColor: '#fff' }}
                  activeOutlineColor="#00BCD4"
                  editable={false}
                  right={<TextInput.Icon icon="calendar" />}
                  pointerEvents="none"
                />
              </TouchableOpacity>
            </View>

            {/* Gender */}
            <Text style={styles.modalLabel}>Giới tính</Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === 'MALE' && styles.genderButtonActive,
                ]}
                onPress={() => setGender('MALE')}
              >
                <Text
                  style={[
                    styles.genderText,
                    gender === 'MALE' && styles.genderTextActive,
                  ]}
                >
                  Nam
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === 'FEMALE' && styles.genderButtonActive,
                ]}
                onPress={() => setGender('FEMALE')}
              >
                <Text
                  style={[
                    styles.genderText,
                    gender === 'FEMALE' && styles.genderTextActive,
                  ]}
                >
                  Nữ
                </Text>
              </TouchableOpacity>
            </View>

            {/* Height and Weight */}
            <View style={styles.metricsContainer}>
              <TextInput
                label="Chiều cao (cm)"
                value={heightCm}
                onChangeText={setHeightCm}
                keyboardType="numeric"
                mode="outlined"
                style={[styles.modalInput, styles.metricInput]}
                activeOutlineColor="#00BCD4"
              />
              <TextInput
                label="Cân nặng (kg)"
                value={weightKg}
                onChangeText={setWeightKg}
                keyboardType="numeric"
                mode="outlined"
                style={[styles.modalInput, styles.metricInput]}
                activeOutlineColor="#00BCD4"
              />
            </View>

            <HelperText type="error" visible={!!error}>
              {error}
            </HelperText>

            {/* Buttons */}
            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => setEditModalVisible(false)}
                style={styles.modalButton}
              >
                Hủy
              </Button>
              <Button
                mode="contained"
                onPress={handleSaveProfile}
                style={[styles.modalButton, styles.saveButton]}
                loading={loading}
                disabled={loading}
              >
                Lưu
              </Button>
    </View>
          </ScrollView>
        </Modal>
      </Portal>

      {/* Change Password Modal */}
      <Portal>
        <Modal
          visible={changePasswordModalVisible}
          onDismiss={() => {
            setChangePasswordModalVisible(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setPasswordError('');
          }}
          contentContainerStyle={styles.passwordModalContainer}
        >
          <View>
            <Text style={styles.modalTitle}>Đổi mật khẩu</Text>
            <Text style={styles.modalSubtitle}>
              Vui lòng nhập mật khẩu hiện tại và mật khẩu mới
            </Text>

            {/* Current Password */}
            <TextInput
              label="Mật khẩu hiện tại"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              mode="outlined"
              style={styles.modalInput}
              activeOutlineColor="#00BCD4"
              secureTextEntry={!showCurrentPassword}
              right={
                <TextInput.Icon
                  icon={showCurrentPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                />
              }
            />

            {/* New Password */}
            <TextInput
              label="Mật khẩu mới"
              value={newPassword}
              onChangeText={setNewPassword}
              mode="outlined"
              style={styles.modalInput}
              activeOutlineColor="#00BCD4"
              secureTextEntry={!showNewPassword}
              right={
                <TextInput.Icon
                  icon={showNewPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                />
              }
            />

            {/* Confirm Password */}
            <TextInput
              label="Xác nhận mật khẩu mới"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              mode="outlined"
              style={styles.modalInput}
              activeOutlineColor="#00BCD4"
              secureTextEntry={!showConfirmPassword}
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              }
            />

            <HelperText type="error" visible={!!passwordError}>
              {passwordError}
            </HelperText>

            {/* Password Requirements */}
            <View style={styles.passwordRequirements}>
              <Text style={styles.requirementText}>• Mật khẩu phải có ít nhất 6 ký tự</Text>
              <Text style={styles.requirementText}>• Mật khẩu mới phải khác mật khẩu hiện tại</Text>
            </View>

            {/* Buttons */}
            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => {
                  setChangePasswordModalVisible(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setPasswordError('');
                }}
                style={styles.modalButton}
              >
                Hủy
              </Button>
              <Button
                mode="contained"
                onPress={handleChangePassword}
                style={[styles.modalButton, styles.saveButton]}
                loading={loading}
                disabled={loading}
              >
                Đổi mật khẩu
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>

      {/* Date Picker Modal for iOS - Đặt trong Portal để hiển thị trên Modal */}
      <Portal>
        {Platform.OS === 'ios' && showDatePicker && (
          <RNModal
            visible={showDatePicker}
            transparent={true}
            animationType="slide"
            onRequestClose={() => {
              console.log('📅 Date picker onRequestClose');
              setShowDatePicker(false);
            }}
          >
            <View style={styles.datePickerModalOverlay}>
              <View style={styles.datePickerModalContent}>
                <View style={styles.datePickerModalHeader}>
                  <TouchableOpacity onPress={() => {
                    console.log('📅 Date picker cancelled');
                    setShowDatePicker(false);
                  }}>
                    <Text style={styles.datePickerModalCancel}>Hủy</Text>
                  </TouchableOpacity>
                  <Text style={styles.datePickerModalTitle}>Chọn ngày sinh</Text>
                  <TouchableOpacity onPress={handleDatePickerDone}>
                    <Text style={styles.datePickerModalDone}>Xong</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.datePickerContainer}>
                  <DateTimePicker
                    value={dateOfBirth}
                    mode="date"
                    display="spinner"
                    maximumDate={new Date()}
                    minimumDate={new Date(1900, 0, 1)}
                    textColor="#1E232C"
                    themeVariant="light"
                    onChange={handleDateChange}
                  />
                </View>
              </View>
            </View>
          </RNModal>
        )}
      </Portal>

    </SafeAreaView>
    
    {/* Date Picker for Android - Render ở ngoài SafeAreaView để đảm bảo hiển thị trên Modal */}
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
    </>
  );
};

// Info Row Component
const InfoRow: React.FC<{
  icon: string;
  label: string;
  value: string;
  isLast?: boolean;
}> = ({ icon, label, value, isLast = false }) => (
  <>
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <MaterialCommunityIcons name={icon} size={24} color="#00BCD4" />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
    {!isLast && <Divider style={styles.divider} />}
  </>
);

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
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECF4',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E232C',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#00BCD4',
  },
  avatarPlaceholder: {
    backgroundColor: '#00BCD4',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E232C',
    marginTop: 12,
  },
  userEmail: {
    fontSize: 14,
    color: '#6A707C',
    marginTop: 4,
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E232C',
  },
  divider: {
    marginVertical: 12,
  },
  bmiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bmiLeft: {
    marginRight: 16,
  },
  bmiRight: {
    flex: 1,
  },
  bmiLabel: {
    fontSize: 14,
    color: '#6A707C',
  },
  bmiValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E232C',
  },
  bmiStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 16,
    color: '#1E232C',
    marginLeft: 12,
  },
  infoValue: {
    fontSize: 16,
    color: '#6A707C',
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: '#1E232C',
    marginLeft: 12,
  },
  logoutButton: {
    marginTop: 8,
    borderColor: '#F44336',
    borderWidth: 2,
    borderRadius: 12,
  },
  logoutButtonText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 24,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E232C',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6A707C',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalAvatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalAvatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#00BCD4',
  },
  modalAvatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#E8ECF4',
    borderStyle: 'dashed',
    backgroundColor: '#F7F8F9',
    alignItems: 'center',
        justifyContent: 'center', 
  },
  modalAvatarText: {
    fontSize: 12,
    color: '#6A707C',
    marginTop: 4,
  },
  modalInput: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  modalLabel: {
    fontSize: 14,
    color: '#1E232C',
    marginBottom: 8,
    fontWeight: '600',
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E8ECF4',
    borderRadius: 8,
        alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: '#F7F8F9',
  },
  genderButtonActive: {
    borderColor: '#00BCD4',
    backgroundColor: '#E0F7FA',
  },
  genderText: {
    fontSize: 16,
    color: '#6A707C',
    fontWeight: '500',
  },
  genderTextActive: {
    color: '#00BCD4',
    fontWeight: 'bold',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  saveButton: {
    backgroundColor: '#00BCD4',
  },
  passwordRequirements: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F7F8F9',
    borderRadius: 8,
  },
  requirementText: {
    fontSize: 12,
    color: '#6A707C',
    marginVertical: 2,
  },
  passwordModalContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 40,
    padding: 24,
    borderRadius: 16,
  },
  datePickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  datePickerModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
    maxHeight: '80%',
  },
  datePickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECF4',
  },
  datePickerModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E232C',
  },
  datePickerModalCancel: {
    fontSize: 16,
    color: '#6A707C',
  },
  datePickerModalDone: {
    fontSize: 16,
    color: '#00BCD4',
    fontWeight: '600',
  },
  datePickerContainer: {
    backgroundColor: '#fff',
    paddingVertical: 20,
  },
});

export default ProfileScreen;
