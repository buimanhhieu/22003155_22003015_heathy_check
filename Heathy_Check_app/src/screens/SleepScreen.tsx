import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DashboardStackParamList } from '../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width } = Dimensions.get('window');

type SleepScreenNavigationProp = NativeStackNavigationProp<DashboardStackParamList, 'Sleep'>;

// Dummy data
const dummySleepData = {
  averageSleep: {
    hours: 7,
    minutes: 31,
  },
  weeklyData: [
    { day: 'Mon', hours: 6.5, percentage: 70 },
    { day: 'Tue', hours: 4.0, percentage: 40 },
    { day: 'Wed', hours: 5.5, percentage: 55 },
    { day: 'Thu', hours: 7.5, percentage: 80 },
    { day: 'Fri', hours: 6.0, percentage: 60 },
    { day: 'Sat', hours: 8.5, percentage: 90 },
    { day: 'Sun', hours: 7.0, percentage: 75 },
  ],
  sleepRate: 82,
  deepSleep: {
    hours: 1,
    minutes: 3,
  },
  schedule: {
    bedtime: '22:00',
    wakeUp: '07:30',
  },
};

const SleepScreen: React.FC = () => {
  const navigation = useNavigation<SleepScreenNavigationProp>();
  const [selectedPeriod, setSelectedPeriod] = useState<'Today' | 'Weekly' | 'Monthly'>('Weekly');

  const formatTime = (hours: number, minutes: number) => {
    return `${hours}h ${minutes} min`;
  };

  const renderBarChart = () => {
    const maxHeight = 120;
    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartBars}>
          {dummySleepData.weeklyData.map((item, index) => (
            <View key={index} style={styles.barWrapper}>
              <View style={styles.barContainer}>
                <View style={[styles.barEmpty, { height: maxHeight }]} />
                <View
                  style={[
                    styles.barFilled,
                    {
                      height: (item.percentage / 100) * maxHeight,
                      backgroundColor: index === 5 ? '#00BCD4' : '#B2EBF2', // Sat is darker
                    },
                  ]}
                />
              </View>
              <Text style={styles.barLabel}>{item.day}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sleep</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Average Sleep Summary */}
        <View style={styles.averageSection}>
          <Text style={styles.averageText}>
            Your average time of sleep a day is
          </Text>
          <Text style={styles.averageValue}>
            {formatTime(dummySleepData.averageSleep.hours, dummySleepData.averageSleep.minutes)}
          </Text>
        </View>

        {/* Time Period Selector */}
        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[
              styles.periodButton,
              selectedPeriod === 'Today' && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod('Today')}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === 'Today' && styles.periodButtonTextActive,
              ]}
            >
              Today
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.periodButton,
              selectedPeriod === 'Weekly' && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod('Weekly')}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === 'Weekly' && styles.periodButtonTextActive,
              ]}
            >
              Weekly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.periodButton,
              selectedPeriod === 'Monthly' && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod('Monthly')}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === 'Monthly' && styles.periodButtonTextActive,
              ]}
            >
              Monthly
            </Text>
          </TouchableOpacity>
        </View>

        {/* Weekly Sleep Bar Chart */}
        {selectedPeriod === 'Weekly' && renderBarChart()}

        {/* Sleep Metric Summary Cards */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricCard}>
            <View style={styles.metricIconContainer}>
              <MaterialIcons name="star" size={24} color="#FFC107" />
            </View>
            <Text style={styles.metricLabel}>Sleep rate</Text>
            <Text style={styles.metricValue}>{dummySleepData.sleepRate}%</Text>
          </View>
          <View style={styles.metricCard}>
            <View style={styles.metricIconContainer}>
              <MaterialIcons name="bedtime" size={24} color="#FFC107" />
            </View>
            <Text style={styles.metricLabel}>Deepsleep</Text>
            <Text style={styles.metricValue}>
              {formatTime(dummySleepData.deepSleep.hours, dummySleepData.deepSleep.minutes)}
            </Text>
          </View>
        </View>

        {/* Sleep Schedule Section */}
        <View style={styles.scheduleSection}>
          <View style={styles.scheduleHeader}>
            <Text style={styles.scheduleTitle}>Set your schedule</Text>
            <TouchableOpacity>
              <Text style={styles.editButton}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.scheduleCards}>
            <View style={[styles.scheduleCard, styles.bedtimeCard]}>
              <View style={styles.scheduleCardContent}>
                <MaterialIcons name="bed" size={20} color="white" />
                <Text style={styles.scheduleCardLabel}>Bedtime</Text>
              </View>
              <Text style={styles.scheduleCardTime}>
                {dummySleepData.schedule.bedtime} pm
              </Text>
            </View>
            <View style={[styles.scheduleCard, styles.wakeUpCard]}>
              <View style={styles.scheduleCardContent}>
                <MaterialIcons name="notifications" size={20} color="white" />
                <Text style={styles.scheduleCardLabel}>Wake up</Text>
              </View>
              <Text style={styles.scheduleCardTime}>
                {dummySleepData.schedule.wakeUp} am
              </Text>
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
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
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
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  averageSection: {
    marginBottom: 24,
  },
  averageText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  averageValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00BCD4',
  },
  periodSelector: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#00BCD4',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  chartContainer: {
    marginBottom: 24,
    paddingVertical: 16,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    width: '80%',
    height: 120,
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
  },
  barEmpty: {
    position: 'absolute',
    width: '100%',
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    bottom: 0,
  },
  barFilled: {
    position: 'absolute',
    width: '100%',
    borderRadius: 8,
    bottom: 0,
  },
  barLabel: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  metricsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  metricIconContainer: {
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  scheduleSection: {
    marginBottom: 24,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    fontSize: 14,
    color: '#00BCD4',
    fontWeight: '600',
  },
  scheduleCards: {
    flexDirection: 'row',
    gap: 12,
  },
  scheduleCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    minHeight: 100,
  },
  bedtimeCard: {
    backgroundColor: '#F44336',
  },
  wakeUpCard: {
    backgroundColor: '#FF9800',
  },
  scheduleCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  scheduleCardLabel: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  scheduleCardTime: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default SleepScreen;

