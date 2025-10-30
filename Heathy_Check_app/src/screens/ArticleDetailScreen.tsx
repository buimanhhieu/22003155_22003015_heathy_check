import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';

interface ArticleDetailProps {
  articleId: number;
  title: string;
  image?: string;
}

const ArticleDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { articleId, title, image } = (route.params || {}) as ArticleDetailProps;

  // Sample article data - thay bằng data thật từ API
  const articles: { [key: number]: { title: string; content: string; image?: string } } = {
    1: {
      title: "Craving sweets on your period? Here's why & what to do about it",
      content: `Việc thèm đồ ngọt trong chu kỳ kinh nguyệt là hiện tượng rất phổ biến. Hormone progesterone và estrogen dao động trong chu kỳ có thể ảnh hưởng đến mức đường huyết và cảm giác thèm ăn của bạn.

Nguyên nhân chính:
• Hormone progesterone tăng cao trước khi có kinh có thể làm tăng cảm giác thèm carbohydrate và đường
• Serotonin (hormone hạnh phúc) giảm trong kỳ kinh, cơ thể muốn bù đắp bằng đường
• Cơ thể cần thêm năng lượng để đối phó với các triệu chứng kinh nguyệt

Giải pháp:
• Chọn trái cây thay vì bánh kẹo để đáp ứng cơn thèm ngọt một cách lành mạnh
• Ăn các bữa nhỏ thường xuyên để duy trì đường huyết ổn định
• Bổ sung thực phẩm giàu magie như chuối, hạnh nhân
• Uống đủ nước và nghỉ ngơi đầy đủ

Hãy lắng nghe cơ thể của bạn nhưng cũng nên lựa chọn thực phẩm một cách thông minh để hỗ trợ sức khỏe trong chu kỳ kinh nguyệt.`,
      image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=250&fit=crop',
    },
    2: {
      title: 'Is birth control good for your menstrual health?',
      content: `Thuốc tránh thai có thể có nhiều tác động đến sức khỏe kinh nguyệt của phụ nữ. Việc hiểu rõ các lợi ích và rủi ro là rất quan trọng để đưa ra quyết định phù hợp.

Lợi ích:
• Điều hòa chu kỳ kinh nguyệt, giúp chu kỳ đều đặn hơn
• Giảm đau bụng kinh và các triệu chứng PMS
• Giảm lượng máu kinh, giúp giảm thiểu tình trạng thiếu máu
• Hỗ trợ điều trị một số vấn đề da như mụn trứng cá
• Giảm nguy cơ ung thư buồng trứng và ung thư nội mạc tử cung

Cân nhắc:
• Có thể gây ra một số tác dụng phụ như buồn nôn, đau đầu
• Cần tham khảo ý kiến bác sĩ trước khi sử dụng
• Không phù hợp với tất cả mọi người, đặc biệt là người có tiền sử bệnh tim mạch
• Cần uống đúng giờ hàng ngày để đạt hiệu quả tối đa

Quan trọng nhất là bạn nên trao đổi với bác sĩ phụ khoa để tìm ra phương pháp phù hợp nhất với tình trạng sức khỏe của mình.`,
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=250&fit=crop',
    },
  };

  const article = articles[articleId] || {
    title: title || 'Bài viết',
    content: 'Nội dung bài viết đang được cập nhật...',
    image: image,
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bài báo</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Article Image */}
        {article.image && (
          <Image
            source={{ uri: article.image }}
            style={styles.articleImage}
            resizeMode="cover"
          />
        )}

        {/* Article Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.articleTitle}>{article.title}</Text>
        </View>

        {/* Article Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.articleContent}>{article.content}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A2463', // Dark blue background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#0A2463',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  articleImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#1E3A8A',
  },
  titleContainer: {
    padding: 20,
    backgroundColor: '#0A2463',
  },
  articleTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    lineHeight: 32,
  },
  contentContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  articleContent: {
    fontSize: 16,
    color: '#1E232C',
    lineHeight: 24,
    marginBottom: 20,
  },
});

export default ArticleDetailScreen;



