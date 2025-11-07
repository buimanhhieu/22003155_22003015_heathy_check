import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.196:8080/api';
// const API_BASE_URL = 'http://192.168.39.112:8080/api';
// const API_BASE_URL = 'http://192.168.1.192:8080/api';
// const API_BASE_URL = 'http://172.20.10.8:8080/api';
// const API_BASE_URL = 'http://172.20.10.9:8080/api';

// const API_BASE_URL = 'http://172.20.10.9:8080/api';
// const API_BASE_URL = 'http://172.20.10.8:8080/api';
export interface HealthScore {
    score: number;
    status: string;
    message: string;
}

export interface Steps {
    value: number;
    lastUpdated: string;
    goal: number;
    percentage: number;
}

export interface CycleTracking {
    status: string;
    daysRemaining: number;
    nextCycleDate: string;
    lastCycleDate: string;
}

export interface Sleep {
    hours: number;
    formatted: string;
    lastUpdated: string;
    goal: number;
    percentage: number;
}

export interface Nutrition {
    totalKcal: number;
    lastUpdated: string;
    goal: number;
    percentage: number;
}

export interface Highlights {
    steps: Steps;
    cycleTracking: CycleTracking;
    sleep: Sleep;
    nutrition: Nutrition;
}

export interface WeeklyReport {
    totalSteps: number;
    totalWater: number;
    totalWorkoutDuration: number;
    totalSleepDuration: number;
    formattedWorkoutDuration: string;
    formattedSleepDuration: string;
}

export interface Blog {
    id: number;
    title: string;
    categoryName: string;
    voteCount: number;
    publishedAt: string;
}

export interface DashboardData {
    healthScore: HealthScore;
    highlights: Highlights;
    weeklyReport: WeeklyReport;
    blogs: Blog[];
}

export const dashboardApi = {
    getDashboard: async (userId: number, token: string): Promise<DashboardData> => {
        const response = await axios.get(`${API_BASE_URL}/users/${userId}/dashboard`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    },

    createCycleTracking: async (userId: number, token: string, cycleData: {
        lastCycleDate: string;
        cycleLength: number;
    }): Promise<any> => {
        // Tạo mới cycle tracking - thử endpoint goals trước (có thể backend chưa có menstrual-cycle endpoint)
        console.log('🔧 CREATE API - Attempting PUT to goals endpoint with cycle data');
        console.log('URL:', `${API_BASE_URL}/users/${userId}/goals`);
        console.log('Data:', {
            dailyStepsGoal: 10000, // Default value
            bedtime: "22:00:00",   // Default value  
            wakeup: "06:00:00",    // Default value
            activityLevel: "moderate", // Default value
            lastCycleDate: cycleData.lastCycleDate,
            cycleLength: cycleData.cycleLength
        });
        console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'No token');

        try {
            // Thử endpoint goals với cycle data
            const response = await axios.put(`${API_BASE_URL}/users/${userId}/goals`, {
                dailyStepsGoal: 10000,
                bedtime: "22:00:00",
                wakeup: "06:00:00",
                activityLevel: "moderate",
                lastCycleDate: cycleData.lastCycleDate,
                cycleLength: cycleData.cycleLength
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log('✅ CREATE API - PUT to goals successful');
            return response.data;
        } catch (error: any) {
            console.log('❌ CREATE API - PUT to goals failed:', error.response?.status, error.response?.data);

            // Nếu goals endpoint không hoạt động, thử menstrual-cycle endpoint
            try {
                console.log('🔄 CREATE API - Trying fallback to menstrual-cycle endpoint');
                // Tính toán endDate dựa trên startDate + 5 ngày (độ dài chu kỳ kinh nguyệt)
                const startDate = new Date(cycleData.lastCycleDate);
                const endDate = new Date(startDate.getTime() + 5 * 24 * 60 * 60 * 1000);

                const response = await axios.post(`${API_BASE_URL}/users/${userId}/menstrual-cycle`, {
                    startDate: cycleData.lastCycleDate,
                    endDate: endDate.toISOString().split('T')[0],
                    cycleLength: cycleData.cycleLength
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                console.log('✅ CREATE API - Fallback to menstrual-cycle successful');
                return response.data;
            } catch (fallbackError: any) {
                console.log('❌ CREATE API - Fallback to menstrual-cycle also failed:', fallbackError.response?.status, fallbackError.response?.data);
                throw fallbackError;
            }
        }
    },

    updateCycleTracking: async (userId: number, token: string, cycleData: {
        lastCycleDate: string;
        cycleLength: number;
    }): Promise<any> => {
        // Cập nhật cycle tracking - thử endpoint goals trước (có thể backend chưa có menstrual-cycle endpoint)
        console.log('🔧 UPDATE API - Attempting PUT to goals endpoint with cycle data');
        console.log('URL:', `${API_BASE_URL}/users/${userId}/goals`);
        console.log('Data:', {
            dailyStepsGoal: 10000, // Default value
            bedtime: "22:00:00",   // Default value  
            wakeup: "06:00:00",    // Default value
            activityLevel: "moderate", // Default value
            lastCycleDate: cycleData.lastCycleDate,
            cycleLength: cycleData.cycleLength
        });
        console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'No token');

        try {
            // Thử endpoint goals với cycle data
            const response = await axios.put(`${API_BASE_URL}/users/${userId}/goals`, {
                dailyStepsGoal: 10000,
                bedtime: "22:00:00",
                wakeup: "06:00:00",
                activityLevel: "moderate",
                lastCycleDate: cycleData.lastCycleDate,
                cycleLength: cycleData.cycleLength
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log('✅ UPDATE API - PUT to goals successful');
            return response.data;
        } catch (error: any) {
            console.log('❌ UPDATE API - PUT to goals failed:', error.response?.status, error.response?.data);

            // Nếu goals endpoint không hoạt động, thử menstrual-cycle endpoint
            try {
                console.log('🔄 UPDATE API - Trying fallback to menstrual-cycle endpoint');
                // Tính toán endDate dựa trên startDate + 5 ngày (độ dài chu kỳ kinh nguyệt)
                const startDate = new Date(cycleData.lastCycleDate);
                const endDate = new Date(startDate.getTime() + 5 * 24 * 60 * 60 * 1000);

                const response = await axios.put(`${API_BASE_URL}/users/${userId}/menstrual-cycle`, {
                    startDate: cycleData.lastCycleDate,
                    endDate: endDate.toISOString().split('T')[0],
                    cycleLength: cycleData.cycleLength
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                console.log('✅ UPDATE API - Fallback to menstrual-cycle successful');
                return response.data;
            } catch (fallbackError: any) {
                console.log('❌ UPDATE API - Fallback to menstrual-cycle also failed:', fallbackError.response?.status, fallbackError.response?.data);
                throw fallbackError;
            }
        }
    },
};

