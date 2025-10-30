import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

const PrivacyPolicyScreen: React.FC = () => {
  const navigation = useNavigation();

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
        <Text style={styles.headerTitle}>Chính sách bảo mật</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Thu thập thông tin</Text>
          <Text style={styles.paragraph}>
            Chúng tôi thu thập thông tin bạn cung cấp trực tiếp, bao gồm:
          </Text>
          <Text style={styles.bulletPoint}>• Thông tin cá nhân: Họ tên, email, ngày sinh</Text>
          <Text style={styles.bulletPoint}>• Thông tin sức khỏe: Chiều cao, cân nặng, chỉ số BMI</Text>
          <Text style={styles.bulletPoint}>• Dữ liệu hoạt động: Số bước đi, lượng calo tiêu thụ</Text>
          <Text style={styles.bulletPoint}>• Thông tin thiết bị: Loại thiết bị, hệ điều hành</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Sử dụng thông tin</Text>
          <Text style={styles.paragraph}>
            Chúng tôi sử dụng thông tin thu thập được để:
          </Text>
          <Text style={styles.bulletPoint}>• Cung cấp và cải thiện dịch vụ của chúng tôi</Text>
          <Text style={styles.bulletPoint}>• Cá nhân hóa trải nghiệm người dùng</Text>
          <Text style={styles.bulletPoint}>• Gửi thông báo về sức khỏe và hoạt động</Text>
          <Text style={styles.bulletPoint}>• Phân tích và nghiên cứu để cải thiện ứng dụng</Text>
          <Text style={styles.bulletPoint}>• Bảo vệ an ninh và ngăn chặn gian lận</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Bảo mật thông tin</Text>
          <Text style={styles.paragraph}>
            Chúng tôi cam kết bảo vệ thông tin của bạn thông qua:
          </Text>
          <Text style={styles.bulletPoint}>• Mã hóa dữ liệu khi truyền tải</Text>
          <Text style={styles.bulletPoint}>• Lưu trữ an toàn trên máy chủ được bảo mật</Text>
          <Text style={styles.bulletPoint}>• Kiểm soát truy cập nghiêm ngặt</Text>
          <Text style={styles.bulletPoint}>• Cập nhật biện pháp bảo mật thường xuyên</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Chia sẻ thông tin</Text>
          <Text style={styles.paragraph}>
            Chúng tôi không bán hoặc chia sẻ thông tin cá nhân của bạn với bên thứ ba, 
            ngoại trừ các trường hợp sau:
          </Text>
          <Text style={styles.bulletPoint}>• Khi có sự đồng ý của bạn</Text>
          <Text style={styles.bulletPoint}>• Để tuân thủ yêu cầu pháp lý</Text>
          <Text style={styles.bulletPoint}>• Để bảo vệ quyền lợi của chúng tôi và người dùng</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Quyền của người dùng</Text>
          <Text style={styles.paragraph}>
            Bạn có quyền:
          </Text>
          <Text style={styles.bulletPoint}>• Truy cập và xem thông tin cá nhân của bạn</Text>
          <Text style={styles.bulletPoint}>• Yêu cầu chỉnh sửa hoặc cập nhật thông tin</Text>
          <Text style={styles.bulletPoint}>• Yêu cầu xóa tài khoản và dữ liệu</Text>
          <Text style={styles.bulletPoint}>• Xuất dữ liệu của bạn</Text>
          <Text style={styles.bulletPoint}>• Từ chối nhận thông báo marketing</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Lưu trữ dữ liệu</Text>
          <Text style={styles.paragraph}>
            Chúng tôi lưu trữ thông tin của bạn trong thời gian cần thiết để cung cấp dịch vụ 
            hoặc theo yêu cầu pháp lý. Bạn có thể yêu cầu xóa dữ liệu bất kỳ lúc nào.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Cập nhật chính sách</Text>
          <Text style={styles.paragraph}>
            Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian. Chúng tôi sẽ 
            thông báo cho bạn về bất kỳ thay đổi quan trọng nào qua email hoặc thông báo 
            trong ứng dụng.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Liên hệ</Text>
          <Text style={styles.paragraph}>
            Nếu bạn có câu hỏi về chính sách bảo mật này, vui lòng liên hệ:
          </Text>
          <Text style={styles.bulletPoint}>• Email: support@healthycheck.com</Text>
          <Text style={styles.bulletPoint}>• Điện thoại: 1900-xxxx</Text>
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
    padding: 20,
  },
  section: {
    marginBottom: 24,
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
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 15,
    lineHeight: 24,
    color: '#1E232C',
    marginLeft: 8,
    marginBottom: 4,
  },
  bottomPadding: {
    height: 20,
  },
});

export default PrivacyPolicyScreen;

