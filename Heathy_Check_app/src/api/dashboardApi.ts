import { apiClient, API_BASE_URL } from './config';
import { ActivityLevel } from '../types/ActivityLevel';

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
    getDashboard: async (userId: number, token: string, forceRefresh: boolean = false): Promise<DashboardData> => {
        // Thêm cache busting parameter nếu forceRefresh = true
        const params = forceRefresh ? { _t: Date.now() } : {};
        const response = await apiClient.get(`/users/${userId}/dashboard`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                // Thêm header để bypass cache ở client side
                ...(forceRefresh && { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }),
            },
            params: params,
        });
        return response.data;
    },

    createCycleTracking: async (userId: number, token: string, cycleData: {
        lastCycleDate: string;
        cycleLength: number;
    }): Promise<any> => {
        // Tạo mới cycle tracking - gọi trực tiếp đến menstrual-cycle endpoint
        console.log('🔧 CREATE API - Calling menstrual-cycle endpoint');
        console.log('URL:', `${API_BASE_URL}/users/${userId}/menstrual-cycle`);
        console.log('Data:', {
            startDate: cycleData.lastCycleDate,
            cycleLength: cycleData.cycleLength
        });
        console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'No token');

        try {
            // Tính toán endDate dựa trên startDate + 5 ngày (độ dài chu kỳ kinh nguyệt)
            const startDate = new Date(cycleData.lastCycleDate);
            const endDate = new Date(startDate.getTime() + 5 * 24 * 60 * 60 * 1000);

            const response = await apiClient.post(`/users/${userId}/menstrual-cycle`, {
                startDate: cycleData.lastCycleDate,
                endDate: endDate.toISOString().split('T')[0],
                cycleLength: cycleData.cycleLength
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log('✅ CREATE API - menstrual-cycle endpoint successful');
            console.log('Response data:', response.data);
            return response.data;
        } catch (error: any) {
            console.log('❌ CREATE API - menstrual-cycle endpoint failed:', error.response?.status, error.response?.data);
            console.log('Error message:', error.message);
            throw error;
        }
    },

    updateCycleTracking: async (userId: number, token: string, cycleData: {
        lastCycleDate: string;
        cycleLength: number;
    }): Promise<any> => {
        // Cập nhật cycle tracking - gọi trực tiếp đến menstrual-cycle endpoint
        console.log('🔧 UPDATE API - Calling menstrual-cycle endpoint');
        console.log('URL:', `${API_BASE_URL}/users/${userId}/menstrual-cycle`);
        console.log('Data:', {
            startDate: cycleData.lastCycleDate,
            cycleLength: cycleData.cycleLength
        });
        console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'No token');

        try {
            // Tính toán endDate dựa trên startDate + 5 ngày (độ dài chu kỳ kinh nguyệt)
            const startDate = new Date(cycleData.lastCycleDate);
            const endDate = new Date(startDate.getTime() + 5 * 24 * 60 * 60 * 1000);

            const response = await apiClient.put(`/users/${userId}/menstrual-cycle`, {
                startDate: cycleData.lastCycleDate,
                endDate: endDate.toISOString().split('T')[0],
                cycleLength: cycleData.cycleLength
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log('✅ UPDATE API - menstrual-cycle endpoint successful');
            console.log('Response data:', response.data);
            return response.data;
        } catch (error: any) {
            console.log('❌ UPDATE API - menstrual-cycle endpoint failed:', error.response?.status, error.response?.data);
            console.log('Error message:', error.message);
            throw error;
        }
    },
};

