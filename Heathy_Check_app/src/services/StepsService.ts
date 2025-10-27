import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import userApi from '../api/userApi';

const BACKGROUND_LOCATION_TASK = 'background-location-task';
let stepCount = 0;
let lastLocation: Location.LocationObject | null = null;

// Register background location task
TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
    if (error) {
        console.error('Error in background location task:', error);
        return;
    }

    if (data && 'locations' in data) {
        const { locations } = data as any;

        // Calculate steps based on movement
        for (let location of locations) {
            if (lastLocation) {
                const distance = calculateDistance(
                    lastLocation.coords.latitude,
                    lastLocation.coords.longitude,
                    location.coords.latitude,
                    location.coords.longitude
                );

                // Estimate steps based on distance (average step length ~0.7m)
                const estimatedSteps = Math.floor(distance / 0.7);
                stepCount += estimatedSteps;
            }
            lastLocation = location;
        }
    }

    // Save to database every 5 minutes
    const now = Date.now();
    const lastSave = await AsyncStorage.getItem('lastStepsSave');

    if (!lastSave || now - parseInt(lastSave) > 5 * 60 * 1000) {
        await saveStepsToDatabase();
        await AsyncStorage.setItem('lastStepsSave', now.toString());
    }
});

// Start tracking location
export const startStepsTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
    }

    // Request background location permission
    const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();

    if (bgStatus !== 'granted') {
        console.log('Permission to access background location was denied');
        return;
    }

    await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 30000, // 30 seconds
        distanceInterval: 10, // 10 meters
    });
};

// Stop tracking
export const stopStepsTracking = async () => {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
    if (isRegistered) {
        await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    }
};

// Save steps to database
export const saveStepsToDatabase = async () => {
    try {
        const userInfo = await getStoredUserInfo();
        if (!userInfo?.id || !userInfo?.token) {
            console.log('Cannot save steps: User not authenticated');
            return;
        }

        await userApi.post(`/${userInfo.id}/health-data`, {
            metricType: 'STEPS',
            value: stepCount,
            unit: 'steps',
            recordedAt: new Date().toISOString()
        }, {
            headers: {
                'Authorization': `Bearer ${userInfo.token}`
            }
        });

        console.log(`✅ Steps saved to database: ${stepCount}`);
        stepCount = 0; // Reset counter after saving
    } catch (error) {
        console.error('Error saving steps to database:', error);
    }
};

// Get steps for today
export const getTodaySteps = async (userId: number, token: string): Promise<number> => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const response = await userApi.get(`/${userId}/health-data`, {
            params: {
                date: today,
                metricType: 'STEPS'
            },
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        // Sum all steps entries for today
        const stepsData = response.data || [];
        return stepsData.reduce((total: number, entry: any) => total + (entry.value || 0), 0);
    } catch (error) {
        console.error('Error getting today steps:', error);
        // Return 0 if error (e.g., no data yet)
        return 0;
    }
};

// Get steps for last 7 days
export const getWeeklySteps = async (userId: number, token: string): Promise<any[]> => {
    try {
        const today = new Date();
        const weeklyData = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const response = await userApi.get(`/${userId}/health-data`, {
                params: {
                    date: dateStr,
                    metricType: 'STEPS'
                },
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const stepsData = response.data || [];
            const totalSteps = stepsData.reduce((total: number, entry: any) => total + (entry.value || 0), 0);

            weeklyData.push({
                date: dateStr,
                steps: totalSteps,
                day: getDayName(date)
            });
        }

        return weeklyData;
    } catch (error) {
        console.error('Error getting weekly steps:', error);
        return [];
    }
};

// Helper functions
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
};

const getDayName = (date: Date): string => {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return days[date.getDay()];
};

const getStoredUserInfo = async () => {
    try {
        const infoString = await AsyncStorage.getItem('userInfo');
        return infoString ? JSON.parse(infoString) : null;
    } catch (error) {
        return null;
    }
};

