import React, { useState } from 'react';
import { TouchableOpacity, View, Alert } from 'react-native';
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
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: onLogout,
        },
      ]
    );
  };

  return (
    <Menu
      visible={menuVisible}
      onDismiss={() => setMenuVisible(false)}
      anchor={
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
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
      {onProfile && <Menu.Item onPress={() => { setMenuVisible(false); onProfile(); }} title="Profile" />}
      {onSettings && <Menu.Item onPress={() => { setMenuVisible(false); onSettings(); }} title="Settings" />}
      {(onProfile || onSettings) && <Divider />}
      <Menu.Item onPress={handleLogout} title="Logout" />
    </Menu>
  );
};

const styles = {
  avatarContainer: {
    position: 'relative' as const,
  },
  avatar: {
    backgroundColor: '#00BCD4',
  },
  onlineIndicator: {
    position: 'absolute' as const,
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: 'white',
  },
};

export default AvatarDropdown;
