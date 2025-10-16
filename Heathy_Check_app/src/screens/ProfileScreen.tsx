import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';


const ProfileScreen: React.FC = () => {
    const { userInfo } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Avatar.Text size={80} label={userInfo?.username.charAt(0).toUpperCase() || 'A'} style={styles.avatar} />
      <Text variant="headlineMedium" style={styles.title}>Trang cá nhân</Text>
      <Text variant="titleMedium">Tên tài kho?n: {userInfo?.username}</Text>
      <Text variant="titleMedium">Email: {userInfo?.email}</Text>
    </View>
  );
};
const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 20
    },
    avatar: {
        marginBottom: 20
    },
    title: {
        marginBottom: 16
    }
});
export default ProfileScreen;
