import Constants from 'expo-constants';

const DEFAULT_API_BASE_URL = 'http://192.168.39.128:8080/api';

// Thử lấy từ expo-constants (app.json extra) trước
let ENV_API_BASE_URL: string | undefined;

// Thử từ expo-constants
if (Constants.expoConfig?.extra?.API_BASE_URL) {
    ENV_API_BASE_URL = Constants.expoConfig.extra.API_BASE_URL as string;
    console.log('[API Config] Loaded from expo-constants:', ENV_API_BASE_URL);
} else {
    // Fallback: thử từ @env (react-native-dotenv)
    try {
        const envModule = require('@env');
        ENV_API_BASE_URL = envModule.API_BASE_URL;
        console.log('[API Config] Loaded from @env:', ENV_API_BASE_URL);
    } catch (error) {
        console.warn('[API Config] Failed to load from @env:', error);
        ENV_API_BASE_URL = undefined;
    }
}

// Sử dụng biến môi trường hoặc default
const API_BASE_URL = ENV_API_BASE_URL || DEFAULT_API_BASE_URL;

console.log('[API Config] Final API_BASE_URL:', API_BASE_URL);
console.log('[API Config] Using default?', !ENV_API_BASE_URL);

export { API_BASE_URL };

