import React, { useState } from 'react';
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

interface FAQItem {
  question: string;
  answer: string;
}

const HelpScreen: React.FC = () => {
  const navigation = useNavigation();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const faqData: FAQItem[] = [
    {
      question: 'Làm thế nào để bắt đầu sử dụng ứng dụng?',
      answer: 'Sau khi đăng ký tài khoản, bạn cần cập nhật thông tin cá nhân như chiều cao, cân nặng, ngày sinh. Sau đó, thiết lập mục tiêu sức khỏe của bạn để ứng dụng có thể đưa ra gợi ý phù hợp.',
    },
    {
      question: 'Ứng dụng có tính phí không?',
      answer: 'Ứng dụng Healthy Check hoàn toàn miễn phí cho các tính năng cơ bản. Chúng tôi có thể cung cấp các tính năng nâng cao trong tương lai với gói premium.',
    },
    {
      question: 'Làm sao để theo dõi số bước đi?',
      answer: 'Ứng dụng tự động đồng bộ với cảm biến bước đi trên điện thoại của bạn. Hãy đảm bảo bạn đã cấp quyền truy cập cảm biến vận động trong cài đặt.',
    },
    {
      question: 'Tôi có thể thay đổi mục tiêu sức khỏe không?',
      answer: 'Có, bạn có thể thay đổi mục tiêu bất kỳ lúc nào trong phần Cài đặt > Mục tiêu. Chúng tôi khuyến nghị bạn thiết lập mục tiêu thực tế và có thể đạt được.',
    },
    {
      question: 'Dữ liệu của tôi có được bảo mật không?',
      answer: 'Chúng tôi rất coi trọng quyền riêng tư của bạn. Tất cả dữ liệu được mã hóa và lưu trữ an toàn. Vui lòng xem Chính sách bảo mật để biết thêm chi tiết.',
    },
    {
      question: 'Làm sao để xuất dữ liệu sức khỏe?',
      answer: 'Vào Cài đặt > Dữ liệu & Bảo mật > Xuất dữ liệu. Bạn có thể tải xuống dữ liệu của mình ở định dạng CSV hoặc JSON.',
    },
    {
      question: 'Tôi quên mật khẩu, phải làm sao?',
      answer: 'Trên màn hình đăng nhập, nhấn "Quên mật khẩu?". Nhập email đã đăng ký và chúng tôi sẽ gửi link đặt lại mật khẩu cho bạn.',
    },
    {
      question: 'Ứng dụng có hỗ trợ đồng bộ nhiều thiết bị không?',
      answer: 'Có, dữ liệu của bạn được lưu trữ trên cloud và tự động đồng bộ giữa các thiết bị khi bạn đăng nhập cùng một tài khoản.',
    },
    {
      question: 'Làm thế nào để xóa tài khoản?',
      answer: 'Vào Cài đặt > Dữ liệu & Bảo mật > Xóa dữ liệu. Lưu ý rằng hành động này sẽ xóa vĩnh viễn tất cả dữ liệu và không thể khôi phục.',
    },
    {
      question: 'Tôi gặp lỗi, phải liên hệ ai?',
      answer: 'Bạn có thể liên hệ đội ngũ hỗ trợ qua:\n• Email: support@healthycheck.com\n• Điện thoại: 1900-xxxx\n• Hoặc gửi phản hồi trực tiếp trong mục Liên hệ.',
    },
  ];

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
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
        <Text style={styles.headerTitle}>Trợ giúp & FAQ</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.introSection}>
          <MaterialCommunityIcons 
            name="help-circle-outline" 
            size={64} 
            color="#00BCD4" 
            style={styles.iconCenter}
          />
          <Text style={styles.introTitle}>Chúng tôi có thể giúp gì cho bạn?</Text>
          <Text style={styles.introText}>
            Dưới đây là các câu hỏi thường gặp. Nếu bạn không tìm thấy câu trả lời, 
            vui lòng liên hệ với chúng tôi.
          </Text>
        </View>

        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Câu hỏi thường gặp</Text>
          
          {faqData.map((item, index) => (
            <View key={index} style={styles.faqItem}>
              <TouchableOpacity 
                style={styles.questionContainer}
                onPress={() => toggleExpand(index)}
              >
                <View style={styles.questionLeft}>
                  <MaterialCommunityIcons 
                    name="help-circle" 
                    size={20} 
                    color="#00BCD4" 
                  />
                  <Text style={styles.questionText}>{item.question}</Text>
                </View>
                <MaterialCommunityIcons 
                  name={expandedIndex === index ? "chevron-up" : "chevron-down"} 
                  size={24} 
                  color="#6A707C" 
                />
              </TouchableOpacity>
              
              {expandedIndex === index && (
                <View style={styles.answerContainer}>
                  <Text style={styles.answerText}>{item.answer}</Text>
                </View>
              )}
            </View>
          ))}
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
  introSection: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECF4',
  },
  iconCenter: {
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E232C',
    marginBottom: 8,
  },
  introText: {
    fontSize: 15,
    color: '#6A707C',
    textAlign: 'center',
    lineHeight: 22,
  },
  faqSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E232C',
    marginBottom: 16,
  },
  faqItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 1,
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  questionLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 8,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E232C',
    marginLeft: 12,
    flex: 1,
  },
  answerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingLeft: 48,
  },
  answerText: {
    fontSize: 15,
    color: '#6A707C',
    lineHeight: 22,
  },
  bottomPadding: {
    height: 20,
  },
});

export default HelpScreen;

