import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { articleApi, Article, Category } from '../api/articleApi';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../navigation/types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with padding

type AllArticlesScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

const AllArticlesScreen: React.FC = () => {
  const { userInfo } = useAuth();
  const navigation = useNavigation<AllArticlesScreenNavigationProp>();
  const route = useRoute();
  const params = route.params as { categoryId?: number; sortBy?: string };

  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(params?.categoryId || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'votes'>(
    (params?.sortBy as any) || 'newest'
  );

  const loadArticles = useCallback(async () => {
    if (!userInfo?.token) {
      setLoading(false);
      setError('Vui lòng đăng nhập để xem bài viết');
      return;
    }

    try {
      setError(null);
      const articleParams = {
        categoryId: selectedCategory || undefined,
        sortBy: sortBy,
      };
      const data = await articleApi.getAllArticles(userInfo.token, articleParams);
      setArticles(data);
    } catch (error: any) {
      console.error('Error loading articles:', error);
      setError('Không thể tải dữ liệu bài viết từ server');
      setArticles([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userInfo?.token, selectedCategory, sortBy]);

  const loadCategories = useCallback(async () => {
    if (!userInfo?.token) return;

    try {
      const data = await articleApi.getCategories(userInfo.token);
      setCategories(data);
    } catch (error: any) {
      console.error('Error loading categories:', error);
    }
  }, [userInfo?.token]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const onRefresh = () => {
    setRefreshing(true);
    loadArticles();
    loadCategories();
  };

  const handleArticlePress = (article: Article) => {
    navigation.navigate('ArticleDetail', {
      articleId: article.id,
      title: article.title,
    });
  };

  const handleCategoryPress = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
  };

  const handleVote = async (article: Article) => {
    if (!userInfo?.token) return;

    try {
      if (article.isVoted) {
        await articleApi.unvoteArticle(article.id, userInfo.token);
      } else {
        await articleApi.voteArticle(article.id, userInfo.token);
      }
      loadArticles();
    } catch (error: any) {
      console.error('Error voting article:', error);
    }
  };

  const getCategoryColor = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case 'nutrition':
        return '#FF9800';
      case 'sports':
        return '#2196F3';
      case 'running':
        return '#4CAF50';
      case 'lifestyle':
        return '#009688';
      default:
        return '#9E9E9E';
    }
  };

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case 'nutrition':
        return 'restaurant';
      case 'sports':
        return 'sports';
      case 'running':
        return 'directions-run';
      case 'lifestyle':
        return 'favorite';
      default:
        return 'article';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const filteredArticles = searchQuery.trim()
    ? articles.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : articles;

  const renderArticle = ({ item, index }: { item: Article; index: number }) => {
    const categoryColor = getCategoryColor(item.categoryName);
    const categoryIcon = getCategoryIcon(item.categoryName);
    const isEven = index % 2 === 0;

    return (
      <TouchableOpacity
        style={[
          styles.articleCard,
          { marginLeft: isEven ? 0 : 8, marginRight: isEven ? 8 : 0 }
        ]}
        onPress={() => handleArticlePress(item)}
        activeOpacity={0.8}
      >
        <View style={[styles.articleImageContainer, { backgroundColor: categoryColor }]}>
          <MaterialIcons name={categoryIcon as any} size={32} color="white" />
        </View>
        <View style={styles.articleContent}>
          <Text style={styles.articleCategory}>{item.categoryName}</Text>
          <Text style={styles.articleTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.articleFooter}>
            <TouchableOpacity
              style={styles.voteButton}
              onPress={(e) => {
                e.stopPropagation();
                handleVote(item);
              }}
            >
              <MaterialIcons
                name={item.isVoted ? "thumb-up" : "thumb-up-outline"}
                size={14}
                color={item.isVoted ? categoryColor : "#666"}
              />
              <Text style={[
                styles.voteText,
                { color: item.isVoted ? categoryColor : "#666" }
              ]}>
                {item.voteCount}
              </Text>
            </TouchableOpacity>
            <Text style={styles.articleDate}>{formatDate(item.publishedAt)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tất cả bài viết</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm bài viết..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialIcons name="close" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Section */}
      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScrollView}
          contentContainerStyle={styles.categoriesContent}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedCategory === null && styles.filterChipActive
            ]}
            onPress={() => handleCategoryPress(null)}
          >
            <Text style={[
              styles.filterChipText,
              selectedCategory === null && styles.filterChipTextActive
            ]}>
              Tất cả
            </Text>
          </TouchableOpacity>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.filterChip,
                selectedCategory === category.id && styles.filterChipActive
              ]}
              onPress={() => handleCategoryPress(category.id)}
            >
              <Text style={[
                styles.filterChipText,
                selectedCategory === category.id && styles.filterChipTextActive
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sortContainer}>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'newest' && styles.sortButtonActive]}
            onPress={() => setSortBy('newest')}
          >
            <Text style={[styles.sortText, sortBy === 'newest' && styles.sortTextActive]}>
              Mới nhất
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'popular' && styles.sortButtonActive]}
            onPress={() => setSortBy('popular')}
          >
            <Text style={[styles.sortText, sortBy === 'popular' && styles.sortTextActive]}>
              Phổ biến
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Articles Grid */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00BCD4" />
          <Text style={styles.loadingText}>Đang tải bài viết...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color="#F44336" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadArticles}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : filteredArticles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="article" size={64} color="#ccc" />
          <Text style={styles.emptyText}>
            {searchQuery ? 'Không tìm thấy bài viết nào' : 'Chưa có bài viết nào'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredArticles}
          renderItem={renderArticle}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
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
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 32,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginHorizontal: 20,
    marginVertical: 16,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  filterSection: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoriesScrollView: {
    marginBottom: 12,
  },
  categoriesContent: {
    paddingRight: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#00BCD4',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
  },
  sortButtonActive: {
    backgroundColor: '#00BCD4',
  },
  sortText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  sortTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
  },
  articleCard: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  articleImageContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  articleContent: {
    padding: 12,
  },
  articleCategory: {
    fontSize: 10,
    color: '#2196F3',
    fontWeight: '500',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  articleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  articleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  voteText: {
    fontSize: 12,
    fontWeight: '500',
  },
  articleDate: {
    fontSize: 10,
    color: '#999',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 14,
    color: '#F44336',
    marginTop: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#00BCD4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
});

export default AllArticlesScreen;

