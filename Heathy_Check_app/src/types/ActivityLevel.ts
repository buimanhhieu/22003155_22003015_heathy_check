/**
 * Activity Level enum - must match backend enum values exactly
 * Backend: com.iuh.heathy_app_backend.dto.ActivityLevel
 */
export enum ActivityLevel {
    SEDENTARY = 'SEDENTARY',           // Ít vận động
    LIGHTLY_ACTIVE = 'LIGHTLY_ACTIVE', // Vận động nhẹ
    MODERATELY_ACTIVE = 'MODERATELY_ACTIVE', // Vận động vừa
    VERY_ACTIVE = 'VERY_ACTIVE',       // Vận động nhiều
    EXTRA_ACTIVE = 'EXTRA_ACTIVE'      // Rất nặng
}

/**
 * Activity Level type for type checking
 */
export type ActivityLevelType = keyof typeof ActivityLevel;

/**
 * Activity Level descriptions for UI
 */
export const ACTIVITY_LEVEL_INFO = {
    [ActivityLevel.SEDENTARY]: {
        label: 'Ít vận động',
        description: 'Ít hoặc không tập thể dục',
        multiplier: 1.2,
        icon: '🛋️'
    },
    [ActivityLevel.LIGHTLY_ACTIVE]: {
        label: 'Vận động nhẹ',
        description: 'Tập thể dục nhẹ 1-3 ngày/tuần',
        multiplier: 1.375,
        icon: '🚶'
    },
    [ActivityLevel.MODERATELY_ACTIVE]: {
        label: 'Vận động vừa phải',
        description: 'Tập thể dục vừa phải 3-5 ngày/tuần',
        multiplier: 1.55,
        icon: '🏃'
    },
    [ActivityLevel.VERY_ACTIVE]: {
        label: 'Vận động nhiều',
        description: 'Tập thể dục mạnh 6-7 ngày/tuần',
        multiplier: 1.725,
        icon: '💪'
    },
    [ActivityLevel.EXTRA_ACTIVE]: {
        label: 'Vận động rất nhiều',
        description: 'Tập thể dục rất mạnh & công việc thể chất',
        multiplier: 1.9,
        icon: '🔥'
    }
} as const;

