import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, MD2Colors } from 'react-native-paper';

const LoadingScreen: React.FC = () => (
  <View style={styles.container}>
    <ActivityIndicator animating={true} color={MD2Colors.blue800} size="large" />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default LoadingScreen;
