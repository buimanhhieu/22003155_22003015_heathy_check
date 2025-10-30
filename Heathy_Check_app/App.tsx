import React, { useEffect } from 'react';
import { LogBox } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

// Suppress warnings from third-party libraries (react-native-chart-kit)
LogBox.ignoreLogs([
  'Invalid DOM property transform-origin',
  'Unknown event handler property',
  'TouchableMixin is deprecated',
]);

// B?n c?n c�i d?t icon: npx expo install react-native-vector-icons
// v� c?u h�nh n� trong babel.config.js n?u c?n thi?t cho react-native-paper
// https://callstack.github.io/react-native-paper/docs/guides/icons/

export default function App() {
  return (
    <PaperProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </PaperProvider>
  );
}
