import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { useAuth } from '../context/AuthContext';
import { getWeeklySteps, getTodaySteps } from '../services/StepsService';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { dashboardApi } from '../api/dashboardApi';

const { width } = Dimensions.get('window');

interface WeeklyStepData {
  date: string;
  steps: number;
  day: string;
}

type TimePeriod = 'today' | 'weekly' | 'monthly';

const StepsChartScreen: React.FC<any> = ({ navigation }) => {
  const { userInfo } = useAuth();
  const [weeklyData, setWeeklyData] = useState<WeeklyStepData[]>([]);
  const [todaySteps, setTodaySteps] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('weekly');
  const [goal, setGoal] = useState(18000); // Default goal

  useEffect(() => {
    loadStepsData();
  }, []);

  const loadStepsData = async () => {
    if (!userInfo?.id || !userInfo?.token) {
      console.warn('[StepsChart] Missing userInfo:', { id: userInfo?.id, hasToken: !!userInfo?.token });
      setLoading(false);
      return;
    }

    console.log('[StepsChart] Loading steps data for user:', userInfo.id);
    try {
      // Load steps data
      const weekly = await getWeeklySteps(userInfo.id, userInfo.token);
      console.log('[StepsChart] Weekly data received:', weekly);
      setWeeklyData(weekly);
      
      const today = await getTodaySteps(userInfo.id, userInfo.token);
      console.log('[StepsChart] Today steps received:', today);
      setTodaySteps(today);
      
      // Get goal from dashboard API
      try {
        const dashboardData = await dashboardApi.getDashboard(userInfo.id, userInfo.token);
        if (dashboardData?.highlights?.steps?.goal) {
          const stepsGoal = dashboardData.highlights.steps.goal;
          console.log('[StepsChart] Goal from dashboard:', stepsGoal);
          setGoal(stepsGoal);
        } else {
          console.warn('[StepsChart] No goal in dashboard data, using default 18000');
        }
      } catch (goalError) {
        console.warn('[StepsChart] Could not load goal, using default:', goalError);
        // Keep default 18000 if can't load
      }
    } catch (error: any) {
      console.error('[StepsChart] Error loading steps data:', error);
      console.error('[StepsChart] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate percentage - ensure it reaches 100% when goal is met or exceeded
  const percentage = goal > 0 
    ? Math.min(Math.max((todaySteps / goal) * 100, 0), 100) // Clamp between 0 and 100
    : 0;
  
  const radius = 80;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate offset - when percentage is 100%, offset should be 0 (full circle)
  // When percentage is 0%, offset should be circumference (empty circle)
  const offset = circumference - (percentage / 100) * circumference;
  
  console.log('[StepsChart] Progress:', { 
    todaySteps, 
    goal, 
    percentage: percentage.toFixed(2) + '%', 
    circumference: circumference.toFixed(2),
    offset: offset.toFixed(2)
  });

  // Calculate metrics
  // Calories: Using more accurate formula based on weight (if available)
  // Formula: Calories = MET × weight(kg) × time(hours)
  // For walking: MET = 3.5, average step = 0.65m, 1000 steps ≈ 0.65km ≈ 10-12 minutes
  // Simplified: ~0.035-0.04 kcal per step for average person (70kg)
  // More accurate: Steps × (Weight in kg × 0.00035) or use 0.04 as average
  const userWeight = userInfo?.profile?.weightKg || 70; // Default 70kg if not available
  const caloriesPerStep = (userWeight * 0.00035); // More accurate: ~0.0245 for 70kg person
  const caloriesBurned = Math.round(todaySteps * Math.max(caloriesPerStep, 0.035)); // Min 0.035 kcal/step
  const caloriesGoal = 1000; // Default calories goal
  const caloriesPercentage = Math.min((caloriesBurned / caloriesGoal) * 100, 100);
  const caloriesCircumference = 2 * Math.PI * 50;
  const caloriesOffset = caloriesCircumference - (caloriesPercentage / 100) * caloriesCircumference;

  // Distance: Average step length ~0.65-0.75m (adjust based on height if available)
  const userHeight = userInfo?.profile?.heightCm || 170; // Default 170cm
  // Step length formula: 0.415 × height (in cm)
  const stepLengthMeters = (userHeight * 0.415) / 100; // Convert to meters
  const distanceKm = ((todaySteps * stepLengthMeters) / 1000).toFixed(1);
  const distanceGoal = 8; // 8 km goal
  const distancePercentage = Math.min((parseFloat(distanceKm) / distanceGoal) * 100, 100);
  const distanceCircumference = 2 * Math.PI * 50;
  const distanceOffset = distanceCircumference - (distancePercentage / 100) * distanceCircumference;

  // Duration: Average walking pace
  // Normal pace: 100-120 steps/min, fast pace: 130-140 steps/min
  // Using average of 110 steps per minute for more accuracy
  const stepsPerMinute = 110; // Average walking pace (can adjust based on activity level)
  const durationMinutes = Math.round(todaySteps / stepsPerMinute);
  const durationGoal = 120; // 120 minutes (2 hours) goal
  const durationPercentage = Math.min((durationMinutes / durationGoal) * 100, 100);
  const durationCircumference = 2 * Math.PI * 50;
  const durationOffset = durationCircumference - (durationPercentage / 100) * durationCircumference;

  // Prepare chart data
  const chartLabels = weeklyData.length > 0 
    ? weeklyData.map(d => {
        // Convert Vietnamese day names to English abbreviations
        const dayMap: { [key: string]: string } = {
          'CN': 'Sun', 'T2': 'Mon', 'T3': 'Tue', 'T4': 'Wed',
          'T5': 'Thu', 'T6': 'Fri', 'T7': 'Sat'
        };
        return dayMap[d.day] || d.day;
      })
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        data: weeklyData.length > 0 
          ? weeklyData.map(d => d.steps)
          : [8000, 6500, 11000, 7500, 9500, 12000, 10000], // Sample data
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        strokeWidth: 3
      }
    ],
  };

  const chartConfig = {
    backgroundColor: '#00BCD4',
    backgroundGradientFrom: '#00BCD4',
    backgroundGradientTo: '#00BCD4',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#FFFFFF'
    },
    propsForBackgroundLines: {
      strokeDasharray: '', // No dashed lines
      stroke: 'rgba(255, 255, 255, 0.3)',
      strokeWidth: 1
    },
    propsForLabels: {
      fontSize: 10,
    }
  };

  // Generate hourly data for today (dummy data based on todaySteps)
  const generateHourlyData = () => {
    const hours = ['6AM', '9AM', '12PM', '3PM', '6PM', '9PM'];
    const distribution = [0.1, 0.15, 0.25, 0.2, 0.2, 0.1]; // Distribution pattern
    return hours.map((hour, index) => ({
      hour,
      steps: Math.round(todaySteps * distribution[index])
    }));
  };

  const hourlyData = generateHourlyData();
  const todayChartData = {
    labels: hourlyData.map(d => d.hour),
    datasets: [{
      data: hourlyData.map(d => d.steps),
    }]
  };

  // Generate monthly data (dummy data - 30 days)
  const generateMonthlyData = () => {
    const days = 30;
    const data = [];
    const avgSteps = weeklyData.length > 0 
      ? weeklyData.reduce((sum, d) => sum + d.steps, 0) / weeklyData.length 
      : 8000;
    
    for (let i = 1; i <= days; i++) {
      // Add some variation (±30%)
      const variation = 0.7 + Math.random() * 0.6;
      data.push({
        day: i,
        steps: Math.round(avgSteps * variation)
      });
    }
    return data;
  };

  const monthlyData = generateMonthlyData();
  const monthlyChartData = {
    labels: monthlyData.filter((_, i) => i % 5 === 0).map(d => d.day.toString()),
    datasets: [{
      data: monthlyData.map(d => d.steps),
      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      strokeWidth: 3
    }]
  };

  const CircularProgress = ({ 
    radius, 
    strokeWidth, 
    percentage, 
    color, 
    circumference,
    offset,
    showDotted = false
  }: { 
    radius: number; 
    strokeWidth: number; 
    percentage: number; 
    color: string;
    circumference: number;
    offset: number;
    showDotted?: boolean;
  }) => {
    const size = radius * 2 + strokeWidth;
    const center = size / 2;
    
    // Dotted line for main circle background (unfilled portion)
    const dashLength = showDotted ? 3 : 0;
    const gapLength = showDotted ? 4 : 0;
    
    return (
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          {/* Background circle - dotted for main circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#E0E0E0"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={showDotted ? `${dashLength} ${gapLength}` : undefined}
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
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Steps</Text>
          <Text style={styles.headerSubtitle}>of your goal today</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {/* Main Circular Progress */}
        <View style={styles.mainProgressContainer}>
          <CircularProgress
            radius={radius}
            strokeWidth={strokeWidth}
            percentage={percentage}
            color="#00BCD4"
            circumference={circumference}
            offset={offset}
            showDotted={true}
          />
          <View style={styles.progressContent}>
            <View style={styles.footprints}>
              <MaterialCommunityIcons name="walk" size={20} color="#00BCD4" />
              <MaterialCommunityIcons name="walk" size={20} color="#00BCD4" />
            </View>
            <Text style={styles.stepsCount}>{todaySteps.toLocaleString()}</Text>
            <Text style={styles.stepsLabel}>Steps out of {(goal / 1000).toFixed(0)}k</Text>
          </View>
        </View>

        {/* Three Small Metrics */}
        <View style={styles.metricsContainer}>
          {/* Calories */}
          <View style={styles.metricItem}>
            <View style={styles.metricProgressWrapper}>
              <CircularProgress
                radius={50}
                strokeWidth={8}
                percentage={caloriesPercentage}
                color="#FF9800"
                circumference={caloriesCircumference}
                offset={caloriesOffset}
              />
              <View style={styles.metricIcon}>
                <MaterialCommunityIcons name="fire" size={18} color="#FF9800" />
              </View>
            </View>
            <Text style={styles.metricValue}>{caloriesBurned} kcal</Text>
          </View>

          {/* Distance */}
          <View style={styles.metricItem}>
            <View style={styles.metricProgressWrapper}>
              <CircularProgress
                radius={50}
                strokeWidth={8}
                percentage={distancePercentage}
                color="#F44336"
                circumference={distanceCircumference}
                offset={distanceOffset}
              />
              <View style={styles.metricIcon}>
                <MaterialCommunityIcons name="map-marker" size={18} color="#F44336" />
              </View>
            </View>
            <Text style={styles.metricValue}>{distanceKm} km</Text>
          </View>

          {/* Duration */}
          <View style={styles.metricItem}>
            <View style={styles.metricProgressWrapper}>
              <CircularProgress
                radius={50}
                strokeWidth={8}
                percentage={durationPercentage}
                color="#00BCD4"
                circumference={durationCircumference}
                offset={durationOffset}
              />
              <View style={styles.metricIcon}>
                <MaterialCommunityIcons name="clock-outline" size={18} color="#00BCD4" />
              </View>
            </View>
            <Text style={styles.metricValue}>{durationMinutes} min</Text>
          </View>
        </View>

        {/* Weekly/Monthly Chart */}
        <View style={styles.chartContainer}>
          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, selectedPeriod === 'today' ? styles.tabActive : styles.tabInactive]}
              onPress={() => setSelectedPeriod('today')}
            >
              <Text style={[styles.tabText, selectedPeriod === 'today' ? styles.tabTextActive : styles.tabTextInactive]}>
                Today
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, selectedPeriod === 'weekly' ? styles.tabActive : styles.tabInactive]}
              onPress={() => setSelectedPeriod('weekly')}
            >
              <Text style={[styles.tabText, selectedPeriod === 'weekly' ? styles.tabTextActive : styles.tabTextInactive]}>
                Weekly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, selectedPeriod === 'monthly' ? styles.tabActive : styles.tabInactive]}
              onPress={() => setSelectedPeriod('monthly')}
            >
              <Text style={[styles.tabText, selectedPeriod === 'monthly' ? styles.tabTextActive : styles.tabTextInactive]}>
                Monthly
              </Text>
            </TouchableOpacity>
          </View>

          {/* Chart */}
          {selectedPeriod === 'today' ? (
            <View style={styles.chartWrapper}>
              <BarChart
                data={todayChartData}
                width={width - 60}
                height={220}
                yAxisLabel=""
                yAxisSuffix=""
                chartConfig={chartConfig}
                style={styles.chart}
                withInnerLines={true}
                withVerticalLines={false}
                withHorizontalLines={true}
                fromZero={true}
                showValuesOnTopOfBars={false}
                flatColor={true}
              />
            </View>
          ) : selectedPeriod === 'weekly' && weeklyData.length > 0 ? (
            <View style={styles.chartWrapper}>
              <LineChart
                data={chartData}
                width={width - 60}
                height={220}
                yAxisLabel=""
                yAxisSuffix=""
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                withInnerLines={true}
                withOuterLines={false}
                withVerticalLines={true}
                withHorizontalLines={true}
                fromZero={false}
                segments={4}
                yAxisInterval={1}
                verticalLabelRotation={0}
              />
            </View>
          ) : selectedPeriod === 'monthly' ? (
            <View style={styles.chartWrapper}>
              <LineChart
                data={monthlyChartData}
                width={width - 60}
                height={220}
                yAxisLabel=""
                yAxisSuffix=""
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                withInnerLines={true}
                withOuterLines={false}
                withVerticalLines={false}
                withHorizontalLines={true}
                fromZero={false}
                segments={4}
                yAxisInterval={1}
                verticalLabelRotation={0}
              />
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  headerTitleContainer: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E232C',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#1E232C',
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainProgressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 32,
    height: 200,
  },
  progressContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  footprints: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 12,
  },
  stepsCount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1E232C',
  },
  stepsLabel: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
    fontWeight: '400',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricProgressWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricIcon: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 100,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E232C',
    marginTop: 8,
  },
  chartContainer: {
    backgroundColor: '#00BCD4',
    borderRadius: 24,
    padding: 20,
    paddingBottom: 15,
    marginBottom: 20,
    marginTop: 8,
    overflow: 'hidden',
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 0,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0,
  },
  tabInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 0,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tabTextActive: {
    color: '#00BCD4',
    fontWeight: '700',
  },
  tabTextInactive: {
    color: '#FFFFFF',
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  chart: {
    borderRadius: 16,
    marginLeft: 0,
    marginRight: 0,
  },
  chartPlaceholder: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartPlaceholderText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
});

export default StepsChartScreen;
