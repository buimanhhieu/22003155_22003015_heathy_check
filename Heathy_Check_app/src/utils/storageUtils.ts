import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Xóa toàn bộ storage của ứng dụng
 * Sử dụng khi cần reset hoàn toàn ứng dụng
 */
export const clearAllStorage = async (): Promise<void> => {
    try {
        // Lấy tất cả keys trước khi xóa
        const allKeys = await AsyncStorage.getAllKeys();

        if (allKeys.length > 0) {
            // Sử dụng multiRemove thay vì clear() để tránh lỗi trên iOS
            await AsyncStorage.multiRemove(allKeys);
            console.log(`✅ Storage đã được xóa thành công (${allKeys.length} keys)`);
        } else {
            console.log('✅ Storage đã trống, không cần xóa');
        }
    } catch (error) {
        console.error('❌ Lỗi khi xóa storage:', error);
        // Không throw error để tránh crash app, chỉ log lỗi
        console.warn('⚠️ Tiếp tục hoạt động mặc dù có lỗi xóa storage');
    }
};

/**
 * Xóa chỉ các key liên quan đến user
 * Giữ lại các setting khác của app
 */
export const clearUserStorage = async (): Promise<void> => {
    try {
        const keys = ['userToken', 'userInfo'];

        // Lấy tất cả keys để tìm các key onboarding
        const allKeys = await AsyncStorage.getAllKeys();
        const onboardingKeys = allKeys.filter(key => key.startsWith('onboardingShown:'));

        const keysToRemove = [...keys, ...onboardingKeys];

        if (keysToRemove.length > 0) {
            await AsyncStorage.multiRemove(keysToRemove);
            console.log(`✅ User storage đã được xóa thành công (${keysToRemove.length} keys)`);
        } else {
            console.log('✅ Không có user data để xóa');
        }
    } catch (error) {
        console.error('❌ Lỗi khi xóa user storage:', error);
        // Không throw error để tránh crash app
        console.warn('⚠️ Tiếp tục hoạt động mặc dù có lỗi xóa user storage');
    }
};

/**
 * Kiểm tra xem có dữ liệu user trong storage không
 */
export const hasUserData = async (): Promise<boolean> => {
    try {
        const userToken = await AsyncStorage.getItem('userToken');
        const userInfo = await AsyncStorage.getItem('userInfo');
        return !!(userToken && userInfo);
    } catch (error) {
        console.error('❌ Lỗi khi kiểm tra user data:', error);
        return false;
    }
};

