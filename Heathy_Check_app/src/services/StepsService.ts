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

    if (data && typeof data === 'object' && 'locations' in data) {
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
        console.log('[StepsService] Getting today steps for date:', today, 'userId:', userId);

        const response = await userApi.get(`/${userId}/health-data`, {
            params: {
                date: today,
                metricType: 'STEPS'
            },
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('[StepsService] Response status:', response.status);
        console.log('[StepsService] Response headers:', response.headers);
        console.log('[StepsService] Response data type:', typeof response.data);
        console.log('[StepsService] Response data:', JSON.stringify(response.data, null, 2));
        console.log('[StepsService] Full response:', JSON.stringify(response, null, 2));

        // Handle response - should be array directly now
        let stepsData: any[] = [];

        if (response?.data !== undefined && response?.data !== null) {
            if (Array.isArray(response.data)) {
                stepsData = response.data;
                console.log('[StepsService] ✅ Found array with', stepsData.length, 'entries');
            } else if (typeof response.data === 'object') {
                // Fallback: try to extract array from common properties
                stepsData = (response.data as any).data ||
                    (response.data as any).entries ||
                    (response.data as any).results ||
                    [];
                console.log('[StepsService] ⚠️ Extracted array from object, length:', stepsData.length);
            } else {
                console.warn('[StepsService] ⚠️ Response.data is not array or object:', typeof response.data);
            }
        } else {
            console.warn('[StepsService] ❌ No data in response (undefined or null)');
        }

        if (stepsData.length === 0) {
            console.log('[StepsService] No steps data found for today');
            return 0;
        }

        // Get the maximum value from all entries (total steps for today)
        // Since steps accumulate throughout the day, the latest/highest value is the total
        const values = stepsData
            .map((entry: any) => {
                const val = entry?.value ?? entry?.Value ?? 0;
                console.log('[StepsService] Entry:', { id: entry?.id, value: val, metricType: entry?.metricType });
                return typeof val === 'number' && !isNaN(val) ? val : 0;
            })
            .filter((val: number) => typeof val === 'number' && !isNaN(val) && val > 0);

        const result = values.length > 0 ? Math.max(...values) : 0;
        console.log('[StepsService] Today steps result:', result);
        return result;
    } catch (error: any) {
        console.error('[StepsService] Error getting today steps:', error);
        console.error('[StepsService] Error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
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

            try {
                const response = await userApi.get(`/${userId}/health-data`, {
                    params: {
                        date: dateStr,
                        metricType: 'STEPS'
                    },
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                // Handle different response structures
                let stepsData: any[] = [];

                if (response.data) {
                    if (Array.isArray(response.data)) {
                        stepsData = response.data;
                    } else if (typeof response.data === 'object') {
                        // If it's an object, try to extract array from common properties
                        stepsData = (response.data as any).data ||
                            (response.data as any).entries ||
                            (response.data as any).results ||
                            [];
                    }
                }

                // Get the maximum value from all entries (total steps for the day)
                let totalSteps = 0;
                if (stepsData.length > 0) {
                    const values = stepsData
                        .map((entry: any) => {
                            const val = entry?.value ?? entry?.Value ?? 0;
                            return typeof val === 'number' && !isNaN(val) ? val : 0;
                        })
                        .filter((val: number) => typeof val === 'number' && !isNaN(val) && val > 0);

                    totalSteps = values.length > 0 ? Math.max(...values) : 0;
                }

                console.log(`[StepsService] Date ${dateStr}: ${totalSteps} steps from ${stepsData.length} entries`);

                weeklyData.push({
                    date: dateStr,
                    steps: totalSteps,
                    day: getDayName(date)
                });
            } catch (dayError) {
                // If error for a specific day, use 0
                console.warn(`Error getting steps for ${dateStr}:`, dayError);
                weeklyData.push({
                    date: dateStr,
                    steps: 0,
                    day: getDayName(date)
                });
            }
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

