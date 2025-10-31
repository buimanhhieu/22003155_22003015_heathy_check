import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

const AboutScreen: React.FC = () => {
  const navigation = useNavigation();

  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Error opening link:', err));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1E232C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Về ứng dụng</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* App Info Section */}
        <View style={styles.appInfoSection}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.appName}>Healthy Check</Text>
          <Text style={styles.version}>Phiên bản 1.0.0</Text>
          <Text style={styles.tagline}>
            Đồng hành cùng sức khỏe của bạn
          </Text>
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Giới thiệu</Text>
          <Text style={styles.paragraph}>
            Healthy Check là ứng dụng theo dõi sức khỏe toàn diện, giúp bạn quản lý 
            và cải thiện sức khỏe mỗi ngày. Với giao diện thân thiện và các tính năng 
            thông minh, chúng tôi cam kết mang đến trải nghiệm tốt nhất cho người dùng.
          </Text>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tính năng chính</Text>
          <View style={styles.featureItem}>
            <MaterialCommunityIcons name="shoe-print" size={24} color="#00BCD4" />
            <Text style={styles.featureText}>Theo dõi số bước đi hàng ngày</Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialCommunityIcons name="chart-line" size={24} color="#00BCD4" />
            <Text style={styles.featureText}>Phân tích chỉ số sức khỏe</Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialCommunityIcons name="target" size={24} color="#00BCD4" />
            <Text style={styles.featureText}>Thiết lập mục tiêu cá nhân</Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialCommunityIcons name="bell-ring" size={24} color="#00BCD4" />
            <Text style={styles.featureText}>Nhắc nhở và thông báo thông minh</Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialCommunityIcons name="cloud-sync" size={24} color="#00BCD4" />
            <Text style={styles.featureText}>Đồng bộ dữ liệu đa thiết bị</Text>
          </View>
        </View>

        {/* Team Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đội ngũ phát triển</Text>
          <Text style={styles.paragraph}>
            Healthy Check được phát triển bởi đội ngũ sinh viên Đại học Công nghiệp TP.HCM:
          </Text>
          <View style={styles.teamMember}>
            <MaterialCommunityIcons name="account-circle" size={20} color="#00BCD4" />
            <Text style={styles.memberText}>MSSV: 22003155</Text>
          </View>
          <View style={styles.teamMember}>
            <MaterialCommunityIcons name="account-circle" size={20} color="#00BCD4" />
            <Text style={styles.memberText}>MSSV: 22003015</Text>
          </View>
        </View>

        {/* Technology Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Công nghệ sử dụng</Text>
          <View style={styles.techItem}>
            <Text style={styles.techLabel}>Frontend:</Text>
            <Text style={styles.techValue}>React Native, TypeScript</Text>
          </View>
          <View style={styles.techItem}>
            <Text style={styles.techLabel}>Backend:</Text>
            <Text style={styles.techValue}>Java Spring Boot</Text>
          </View>
          <View style={styles.techItem}>
            <Text style={styles.techLabel}>Database:</Text>
            <Text style={styles.techValue}>MySQL</Text>
          </View>
        </View>

        {/* Contact & Social Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Liên hệ & Mạng xã hội</Text>
          
          <TouchableOpacity 
            style={styles.linkItem}
            onPress={() => openLink('mailto:support@healthycheck.com')}
          >
            <MaterialCommunityIcons name="email" size={24} color="#00BCD4" />
            <Text style={styles.linkText}>support@healthycheck.com</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.linkItem}
            onPress={() => openLink('https://www.facebook.com/healthycheck')}
          >
            <MaterialCommunityIcons name="facebook" size={24} color="#00BCD4" />
            <Text style={styles.linkText}>Facebook</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.linkItem}
            onPress={() => openLink('https://www.instagram.com/healthycheck')}
          >
            <MaterialCommunityIcons name="instagram" size={24} color="#00BCD4" />
            <Text style={styles.linkText}>Instagram</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.linkItem}
            onPress={() => openLink('https://healthycheck.com')}
          >
            <MaterialCommunityIcons name="web" size={24} color="#00BCD4" />
            <Text style={styles.linkText}>healthycheck.com</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECF4',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E232C',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  appInfoSection: {
    backgroundColor: '#fff',
    padding: 32,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECF4',
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 80,
    height: 80,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E232C',
    marginBottom: 4,
  },
  version: {
    fontSize: 16,
    color: '#6A707C',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 15,
    color: '#00BCD4',
    fontStyle: 'italic',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E232C',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    color: '#1E232C',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 15,
    color: '#1E232C',
    marginLeft: 12,
  },
  teamMember: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  memberText: {
    fontSize: 15,
    color: '#1E232C',
    marginLeft: 8,
  },
  techItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  techLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E232C',
    width: 80,
  },
  techValue: {
    fontSize: 15,
    color: '#6A707C',
    flex: 1,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECF4',
  },
  linkText: {
    fontSize: 15,
    color: '#00BCD4',
    marginLeft: 12,
  },
  bottomPadding: {
    height: 20,
  },
});

export default AboutScreen;

