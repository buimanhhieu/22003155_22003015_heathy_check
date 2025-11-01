import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';
import { dashboardApi } from '../api/dashboardApi';
import { mealLogApi, MealLogResponse } from '../api/userApi';

const { width } = Dimensions.get('window');

interface NutritionData {
  totalKcal: number;
  goal: number;
  fat: number; // grams
  protein: number; // grams
  carbs: number; // grams
  fatGoal: number;
  proteinGoal: number;
  carbsGoal: number;
}

const NutritionScreen: React.FC<any> = ({ navigation }) => {
  const { userInfo } = useAuth();
  const [loading, setLoading] = useState(true);
  const [meals, setMeals] = useState<MealLogResponse[]>([]);
  const [nutritionData, setNutritionData] = useState<NutritionData>({
    totalKcal: 0,
    goal: 2000,
    fat: 0,
    protein: 0,
    carbs: 0,
    fatGoal: 65, // Default: 30% of 2000 kcal = ~600 kcal / 9 = ~67g
    proteinGoal: 150, // Default: 30% of 2000 kcal = ~600 kcal / 4 = ~150g
    carbsGoal: 250, // Default: 40% of 2000 kcal = ~800 kcal / 4 = ~200g
  });

  useEffect(() => {
    loadNutritionData();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Reload data when screen comes into focus (e.g., after adding/editing meal)
      loadNutritionData();
    });
    return unsubscribe;
  }, [navigation]);

  const loadNutritionData = async () => {
    if (!userInfo?.id || !userInfo?.token) {
      console.log('[NutritionScreen] Missing userInfo or token');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Get dashboard data for goal
      const dashboardData = await dashboardApi.getDashboard(userInfo.id, userInfo.token);
      const goal = dashboardData?.highlights?.nutrition?.goal || 2000;
      
      // Get meal logs for today
      const today = new Date().toISOString().split('T')[0];
      const mealLogs = await mealLogApi.getMealLogs(userInfo.id, today);
      setMeals(mealLogs);

      // Calculate totals
      let totalKcal = 0;
      let totalFat = 0;
      let totalProtein = 0;
      let totalCarbs = 0;

      mealLogs.forEach((meal) => {
        totalKcal += meal.totalCalories || 0;
        totalFat += meal.fatGrams || 0;
        totalProtein += meal.proteinGrams || 0;
        totalCarbs += meal.carbsGrams || 0;
      });

      // Calculate macro goals based on calories goal
      // Default macros: Fat 30%, Protein 30%, Carbs 40%
      const fatGoal = Math.round((goal * 0.30) / 9); // 9 kcal per gram
      const proteinGoal = Math.round((goal * 0.30) / 4); // 4 kcal per gram
      const carbsGoal = Math.round((goal * 0.40) / 4); // 4 kcal per gram

      setNutritionData({
        totalKcal: Math.round(totalKcal),
        goal,
        fat: Math.round(totalFat),
        protein: Math.round(totalProtein),
        carbs: Math.round(totalCarbs),
        fatGoal,
        proteinGoal,
        carbsGoal,
      });
    } catch (error: any) {
      console.error('Error loading nutrition data:', error);
      if (error.response?.status === 401) {
        // Token expired or invalid - AuthContext will handle logout
        console.log('[NutritionScreen] 401 Unauthorized - token may be expired');
      }
    } finally {
      setLoading(false);
    }
  };

  const caloriesPercentage = nutritionData.goal > 0
    ? Math.min((nutritionData.totalKcal / nutritionData.goal) * 100, 100)
    : 0;

  const fatPercentage = nutritionData.fatGoal > 0
    ? Math.min((nutritionData.fat / nutritionData.fatGoal) * 100, 100)
    : 0;

  const proteinPercentage = nutritionData.proteinGoal > 0
    ? Math.min((nutritionData.protein / nutritionData.proteinGoal) * 100, 100)
    : 0;

  const carbsPercentage = nutritionData.carbsGoal > 0
    ? Math.min((nutritionData.carbs / nutritionData.carbsGoal) * 100, 100)
    : 0;

  // Circular progress calculations
  const radius = 120;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;
  const caloriesOffset = circumference - (caloriesPercentage / 100) * circumference;

  // Macro progress (smaller circles)
  const macroRadius = 20;
  const macroCircumference = 2 * Math.PI * macroRadius;
  const fatOffset = macroCircumference - (fatPercentage / 100) * macroCircumference;
  const proteinOffset = macroCircumference - (proteinPercentage / 100) * macroCircumference;
  const carbsOffset = macroCircumference - (carbsPercentage / 100) * macroCircumference;

  const CircularProgress = ({
    radius,
    strokeWidth,
    percentage,
    color,
    circumference,
    offset,
  }: {
    radius: number;
    strokeWidth: number;
    percentage: number;
    color: string;
    circumference: number;
    offset: number;
  }) => {
    const size = radius * 2 + strokeWidth;
    const center = size / 2;

    return (
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          {/* Background circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#E0E0E0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={Math.max(0, Math.min(offset, circumference))}
            strokeLinecap="round"
            strokeLinejoin="round"
            transform={`rotate(-90 ${center} ${center})`}
          />
        </Svg>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1E232C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nutrition</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Calorie Summary */}
        <View style={styles.calorieSummary}>
          <Text style={styles.calorieText}>
            You have consumed{' '}
            <Text style={styles.calorieHighlight}>{nutritionData.totalKcal} kcal</Text>
            {' '}today
          </Text>
        </View>

        {/* Main Circular Progress */}
        <View style={styles.progressContainer}>
          <CircularProgress
            radius={radius}
            strokeWidth={strokeWidth}
            percentage={caloriesPercentage}
            color="#00BCD4"
            circumference={circumference}
            offset={caloriesOffset}
          />
          <View style={styles.progressContent}>
            <Text style={styles.percentageText}>{Math.round(caloriesPercentage)}%</Text>
            <Text style={styles.goalText}>of {nutritionData.goal} kcal</Text>
          </View>
        </View>

        {/* Macronutrient Breakdown */}
        <View style={styles.macrosContainer}>
          {/* Fat */}
          <View style={styles.macroRow}>
            <View style={styles.macroLeft}>
              <View style={[styles.macroColorIndicator, { backgroundColor: '#FF9800' }]} />
              <Text style={styles.macroLabel}>Fat</Text>
            </View>
            <View style={styles.macroRight}>
              <Text style={styles.macroValue}>{nutritionData.fat}g</Text>
              <Text style={styles.macroPercentage}>{Math.round(fatPercentage)}%</Text>
            </View>
          </View>

          {/* Protein */}
          <View style={styles.macroRow}>
            <View style={styles.macroLeft}>
              <View style={[styles.macroColorIndicator, { backgroundColor: '#E91E63' }]} />
              <Text style={styles.macroLabel}>Protein</Text>
            </View>
            <View style={styles.macroRight}>
              <Text style={styles.macroValue}>{nutritionData.protein}g</Text>
              <Text style={styles.macroPercentage}>{Math.round(proteinPercentage)}%</Text>
            </View>
          </View>

          {/* Carbs */}
          <View style={styles.macroRow}>
            <View style={styles.macroLeft}>
              <View style={[styles.macroColorIndicator, { backgroundColor: '#00BCD4' }]} />
              <Text style={styles.macroLabel}>Carbs</Text>
            </View>
            <View style={styles.macroRight}>
              <Text style={styles.macroValue}>{nutritionData.carbs}g</Text>
              <Text style={styles.macroPercentage}>{Math.round(carbsPercentage)}%</Text>
            </View>
          </View>
        </View>

        {/* Meal List */}
        {meals.length > 0 && (
          <View style={styles.mealsSection}>
            <Text style={styles.mealsSectionTitle}>Today's Meals</Text>
            {meals.map((meal) => (
              <TouchableOpacity
                key={meal.id}
                style={styles.mealCard}
                onPress={() => navigation.navigate('AddMeal', {
                  mealLog: meal
                })}
              >
                <View style={styles.mealCardHeader}>
                  <View style={styles.mealCardLeft}>
                    {meal.mealType && (
                      <View style={[
                        styles.mealTypeBadge,
                        { backgroundColor: getMealTypeColor(meal.mealType) }
                      ]}>
                        <Text style={styles.mealTypeText}>{meal.mealType}</Text>
                      </View>
                    )}
                    <Text style={styles.mealName}>
                      {meal.mealName || 'Unnamed Meal'}
                    </Text>
                  </View>
                  <Text style={styles.mealCalories}>{Math.round(meal.totalCalories)} kcal</Text>
                </View>
                <View style={styles.mealCardMacros}>
                  <Text style={styles.macroText}>F: {Math.round(meal.fatGrams)}g</Text>
                  <Text style={styles.macroText}>P: {Math.round(meal.proteinGrams)}g</Text>
                  <Text style={styles.macroText}>C: {Math.round(meal.carbsGrams)}g</Text>
                </View>
                <Text style={styles.mealTime}>
                  {new Date(meal.loggedAt).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Add Meals Button */}
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => navigation.navigate('AddMeal')}
        >
          <MaterialCommunityIcons name="silverware-fork-knife" size={24} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add meals</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E232C',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  calorieSummary: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  calorieText: {
    fontSize: 18,
    color: '#1E232C',
    fontWeight: '500',
    textAlign: 'center',
  },
  calorieHighlight: {
    fontSize: 18,
    color: '#00BCD4',
    fontWeight: 'bold',
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    height: 300,
  },
  progressContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1E232C',
    marginBottom: 4,
  },
  goalText: {
    fontSize: 14,
    color: '#999',
  },
  macrosContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  macroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  macroColorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  macroLabel: {
    fontSize: 16,
    color: '#1E232C',
    fontWeight: '500',
  },
  macroRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E232C',
    minWidth: 50,
    textAlign: 'right',
  },
  macroPercentage: {
    fontSize: 16,
    color: '#666',
    minWidth: 45,
    textAlign: 'right',
  },
  addButton: {
    backgroundColor: '#00BCD4',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    gap: 12,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mealsSection: {
    marginBottom: 32,
  },
  mealsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E232C',
    marginBottom: 16,
  },
  mealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mealCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  mealTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  mealTypeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E232C',
    flex: 1,
  },
  mealCalories: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00BCD4',
  },
  mealCardMacros: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  macroText: {
    fontSize: 12,
    color: '#666',
  },
  mealTime: {
    fontSize: 12,
    color: '#999',
  },
});

// Helper function to get meal type color
const getMealTypeColor = (mealType: string): string => {
  switch (mealType) {
    case 'BREAKFAST':
      return '#FF9800';
    case 'LUNCH':
      return '#2196F3';
    case 'DINNER':
      return '#9C27B0';
    case 'SNACK':
      return '#4CAF50';
    default:
      return '#666';
  }
};

export default NutritionScreen;

