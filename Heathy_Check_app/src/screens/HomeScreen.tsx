import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';

const HomeScreen: React.FC = () => {
  const { userInfo, logout } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Ch�o m?ng tr? l?i!</Text>
      <Text variant="titleLarge" style={styles.text}>T�i kho?n: {userInfo?.fullName}</Text>
      <Text variant="bodyMedium" style={styles.text}>Email: {userInfo?.email}</Text>
      <Button mode="contained" onPress={logout} style={{ marginTop: 20 }}>
        �ang xu?t
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: 20,
        backgroundColor: '#f5f5f5'
    },
    title: {
        marginBottom: 16
    },
    text: { 
        marginTop: 10 
    }
});

export default HomeScreen;
