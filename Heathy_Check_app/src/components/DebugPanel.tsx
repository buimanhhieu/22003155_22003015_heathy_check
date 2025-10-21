import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Card, Title, Paragraph } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';

const DebugPanel = () => {
  const { clearAllStorage, clearUserStorage } = useAuth();

  const handleClearAllStorage = async () => {
    try {
      await clearAllStorage();
      console.log('✅ All storage cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing all storage:', error);
    }
  };

  const handleClearUserStorage = async () => {
    try {
      await clearUserStorage();
      console.log('✅ User storage cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing user storage:', error);
    }
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Title>Debug Panel</Title>
        <Paragraph>Chỉ hiển thị trong development mode</Paragraph>
        
        <View style={styles.buttonContainer}>
          <Button 
            mode="contained" 
            onPress={handleClearAllStorage}
            style={styles.button}
            buttonColor="#f44336"
          >
            Xóa toàn bộ Storage
          </Button>
          
          <Button 
            mode="outlined" 
            onPress={handleClearUserStorage}
            style={styles.button}
          >
            Xóa User Storage
          </Button>
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
  buttonContainer: {
    marginTop: 16,
    gap: 8,
  },
  button: {
    marginVertical: 4,
  },
});

export default DebugPanel;



