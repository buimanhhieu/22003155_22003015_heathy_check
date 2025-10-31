import React, { useState } from 'react';
import { TouchableOpacity, View, Alert, StyleSheet } from 'react-native';
import { Avatar, Menu, Divider } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

interface AvatarDropdownProps {
  avatarUri?: string;
  onLogout: () => void;
  onProfile?: () => void;
  onSettings?: () => void;
}

const AvatarDropdown: React.FC<AvatarDropdownProps> = ({
  avatarUri,
  onLogout,
  onProfile,
  onSettings,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const { userInfo } = useAuth();
  
  const handleLogout = () => {
    setMenuVisible(false);
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: onLogout,
        },
      ]
    );
  };

  const handleMenuPress = () => {
    // Prevent menu from dismissing immediately when clicking anchor
    // Use a small delay to ensure toggle works correctly
    if (menuVisible) {
      // Menu is open, close it
      setMenuVisible(false);
    } else {
      // Menu is closed, open it
      // Use setTimeout to prevent onDismiss from firing immediately
      setTimeout(() => {
        setMenuVisible(true);
      }, 50);
    }
  };

  return (
    <Menu
      visible={menuVisible}
      onDismiss={() => {
        // Only dismiss if menu was actually visible
        if (menuVisible) {
          setMenuVisible(false);
        }
      }}
      anchor={
        <TouchableOpacity 
          onPress={(e) => {
            e.stopPropagation();
            handleMenuPress();
          }} 
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View style={styles.avatarContainer}>
            {avatarUri && avatarUri.trim() !== '' ? (
              <Avatar.Image
                size={40}
                source={{ uri: avatarUri }}
                style={styles.avatar}
              />
            ) : (
              <Avatar.Text
                size={40}
                label={userInfo?.fullName?.charAt(0).toUpperCase() || 'U'}
                style={styles.avatar}
              />
            )}
            <View style={styles.onlineIndicator} />
          </View>
        </TouchableOpacity>
      }
    >
      {onProfile && (
        <Menu.Item 
          onPress={() => { 
            setMenuVisible(false); 
            onProfile(); 
          }} 
          title="Hồ sơ cá nhân" 
        />
      )}
      {onSettings && (
        <Menu.Item 
          onPress={() => { 
            setMenuVisible(false); 
            onSettings(); 
          }} 
          title="Cài đặt" 
        />
      )}
      {(onProfile || onSettings) && <Divider />}
      <Menu.Item onPress={handleLogout} title="Đăng xuất" />
    </Menu>
    );
  };
  
  const styles = StyleSheet.create({
    avatarContainer: {
      position: 'relative',
    },
    avatar: {
      backgroundColor: '#00BCD4',
    },
    onlineIndicator: {
      position: 'absolute',
      bottom: 2,
      right: 2,
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: '#4CAF50',
      borderWidth: 2,
      borderColor: 'white',
    },
  });
  
  export default AvatarDropdown;