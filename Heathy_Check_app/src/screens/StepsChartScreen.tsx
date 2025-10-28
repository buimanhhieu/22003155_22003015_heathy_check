import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { useAuth } from '../context/AuthContext';
import { getWeeklySteps, getTodaySteps } from '../services/StepsService';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface WeeklyStepData {
  date: string;
  steps: number;
  day: string;
}

const StepsChartScreen: React.FC<any> = ({ navigation }) => {
  const { userInfo } = useAuth();
  const [weeklyData, setWeeklyData] = useState<WeeklyStepData[]>([]);
  const [todaySteps, setTodaySteps] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStepsData();
  }, []);

  const loadStepsData = async () => {
    if (!userInfo?.id || !userInfo?.token) {
      setLoading(false);
      return;
    }

    try {
      const weekly = await getWeeklySteps(userInfo.id, userInfo.token);
      setWeeklyData(weekly);
      
      const today = await getTodaySteps(userInfo.id, userInfo.token);
      setTodaySteps(today);
    } catch (error) {
      console.error('Error loading steps data:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: weeklyData.map(d => d.day),
    datasets: [
      {
        data: weeklyData.map(d => d.steps),
        color: (opacity = 1) => `rgba(0, 188, 212, ${opacity})`,
        strokeWidth: 2
      }
    ],
  };

  const chartConfig = {
    backgroundColor: '#fff',
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 188, 212, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#00BCD4'
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bước chân</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Today's Steps Card */}
        <View style={styles.todayCard}>
          <MaterialIcons name="directions-walk" size={40} color="#00BCD4" />
          <Text style={styles.todayLabel}>Hôm nay</Text>
          <Text style={styles.todaySteps}>{todaySteps.toLocaleString()}</Text>
          <Text style={styles.todayUnit}>bước</Text>
        </View>

        {/* Weekly Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Bước chân 7 ngày qua</Text>
          {weeklyData.length > 0 ? (
            <LineChart
              data={chartData}
              width={width - 40}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          ) : (
            <View style={styles.noDataContainer}>
              <MaterialIcons name="insert-chart" size={48} color="#ddd" />
              <Text style={styles.noDataText}>Chưa có dữ liệu</Text>
            </View>
          )}
        </View>

        {/* Daily Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Chi tiết hằng ngày</Text>
          {weeklyData.map((item, index) => (
            <View key={index} style={styles.detailRow}>
              <Text style={styles.detailDay}>{item.day}</Text>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { width: `${Math.min((item.steps / 10000) * 100, 100)}%` }
                  ]} 
                />
              </View>
              <Text style={styles.detailSteps}>{item.steps.toLocaleString()}</Text>
            </View>
          ))}
        </View>

        {/* Average Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <MaterialIcons name="trending-up" size={24} color="#4CAF50" />
            <View style={styles.statContent}>
              <Text style={styles.statValue}>
                {Math.round(weeklyData.reduce((sum, d) => sum + d.steps, 0) / 7).toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Trung bình/ngày</Text>
            </View>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <MaterialIcons name="straighten" size={24} color="#FF9800" />
            <View style={styles.statContent}>
              <Text style={styles.statValue}>
                {Math.max(...weeklyData.map(d => d.steps), 0).toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Cao nhất</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  todayLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
  },
  todaySteps: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#00BCD4',
    marginTop: 8,
  },
  todayUnit: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  chartCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
  },
  noDataContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
  },
  detailsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailDay: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: 40,
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginHorizontal: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#00BCD4',
    borderRadius: 4,
  },
  detailSteps: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    width: 70,
    textAlign: 'right',
  },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 12,
  },
  statContent: {
    marginLeft: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

export default StepsChartScreen;


