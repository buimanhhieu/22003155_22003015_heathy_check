import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Button, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

const HomeScreen: React.FC = () => {
  const { userInfo, logout } = useAuth();
  

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            {userInfo?.profile?.avatar ? (
              <Avatar.Image 
                size={60} 
                source={{ uri: userInfo.profile.avatar }} 
                style={styles.avatar}
              />
            ) : (
              <Avatar.Text 
                size={60} 
                label={userInfo?.fullName?.charAt(0)?.toUpperCase() || 'U'} 
                style={styles.avatar}
              />
            )}
            <View style={styles.userDetails}>
              <Text style={styles.welcomeText}>Chào mừng trở lại!</Text>
              <Text style={styles.userName}>{userInfo?.fullName}</Text>
              <Text style={styles.userEmail}>{userInfo?.email}</Text>
            </View>
          </View>
        </View>

        {/* Quick Stats Cards */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Bước hôm nay</Text>
            </Card.Content>
          </Card>
          
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Health Overview */}
        <Card style={styles.overviewCard}>
          <Card.Content>
            <Text style={styles.cardTitle}>Tổng quan sức khỏe</Text>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Mục tiêu bước chân:</Text>
              <Text style={styles.overviewValue}>10,000 bước</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Mục tiêu calories:</Text>
              <Text style={styles.overviewValue}>2,000 cal</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Giờ ngủ:</Text>
              <Text style={styles.overviewValue}>22:00 - 06:00</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Thêm bữa ăn</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Ghi nhận hoạt động</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <Button 
          mode="outlined" 
          onPress={logout} 
          style={styles.logoutButton}
          labelStyle={styles.logoutButtonText}
        >
          Đăng xuất
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#00BCD4',
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: '#6A707C',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E232C',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6A707C',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00BCD4',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6A707C',
    textAlign: 'center',
  },
  overviewCard: {
    marginBottom: 24,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E232C',
    marginBottom: 16,
  },
  overviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  overviewLabel: {
    fontSize: 14,
    color: '#6A707C',
  },
  overviewValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E232C',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#00BCD4',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    borderColor: '#E8ECF4',
    borderWidth: 1,
  },
  logoutButtonText: {
    color: '#6A707C',
  },
});

export default HomeScreen;