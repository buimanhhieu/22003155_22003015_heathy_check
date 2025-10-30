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
  
  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const closeMenu = () => {
    setMenuVisible(false);
  };
  
  const handleLogout = () => {
    closeMenu();
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

  const renderAvatar = () => (
    <View style={styles.avatarWrapper}>
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
      <View style={styles.profileIconBadge}>
        <MaterialIcons name="person" size={14} color="#fff" />
      </View>
    </View>
  );

  return (
    <Menu
      visible={menuVisible}
      onDismiss={closeMenu}
      anchor={
        <TouchableOpacity onPress={toggleMenu} style={styles.touchableContainer}>
          {renderAvatar()}
        </TouchableOpacity>
      }
    >
      {onProfile && (
        <Menu.Item 
          onPress={() => { 
            closeMenu();
            setTimeout(() => onProfile(), 100);
          }} 
          title="Hồ sơ cá nhân" 
          leadingIcon="account"
        />
      )}
      {onSettings && (
        <Menu.Item 
          onPress={() => { 
            closeMenu();
            setTimeout(() => onSettings(), 100);
          }} 
          title="Cài đặt"
          leadingIcon="cog"
        />
      )}
      {(onProfile || onSettings) && <Divider />}
      <Menu.Item 
        onPress={handleLogout} 
        title="Đăng xuất"
        leadingIcon="logout"
      />
    </Menu>
  );
};

const styles = StyleSheet.create({
  touchableContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
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
  profileIconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#00BCD4',
    borderWidth: 2,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});

export default AvatarDropdown;
