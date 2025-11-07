import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { articleApi, Article, Category } from '../api/articleApi';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../navigation/types';

const { width } = Dimensions.get('window');

type ExploreScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

const HomeScreen: React.FC = () => {
  const { userInfo } = useAuth();
  const navigation = useNavigation<ExploreScreenNavigationProp>();
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'votes'>('newest');

  const loadArticles = useCallback(async () => {
    if (!userInfo?.token) {
      setLoading(false);
      setError('Vui lòng đăng nhập để xem bài viết');
      return;
    }

    try {
      setError(null);
      const params = {
        categoryId: selectedCategory || undefined,
        sortBy: sortBy,
      };
      const data = await articleApi.getAllArticles(userInfo.token, params);
      setArticles(data);
      setFilteredArticles(data);
    } catch (error: any) {
      console.error('Error loading articles:', error);
      if (error.response?.status === 401) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else if (error.response?.status === 404) {
        setError('Không tìm thấy endpoint. Vui lòng kiểm tra lại backend.');
      } else {
        setError('Không thể tải dữ liệu bài viết từ server');
      }
      setArticles([]);
      setFilteredArticles([]);
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

  // Tìm kiếm articles
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredArticles(articles);
      return;
    }

    const filtered = articles.filter(article => 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredArticles(filtered);
  }, [searchQuery, articles]);

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
        return 'snowboarding';
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Search and Avatar */}
        <View style={styles.header}>
          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search topic"
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.avatarContainer}>
            {userInfo?.profile?.avatar ? (
              <View style={styles.avatarWrapper}>
                <Avatar.Image 
                  size={40} 
                  source={{ uri: userInfo.profile.avatar }} 
                  style={styles.avatar}
                />
                <View style={styles.onlineIndicator} />
              </View>
            ) : (
              <View style={styles.avatarWrapper}>
                <Avatar.Text 
                  size={40} 
                  label={userInfo?.fullName?.charAt(0)?.toUpperCase() || 'U'} 
                  style={styles.avatar}
                />
                <View style={styles.onlineIndicator} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* For you Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>For you</Text>
            <View style={styles.dotsContainer}>
              <View style={styles.dot} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScrollView}
            contentContainerStyle={styles.categoriesContent}
          >
            <TouchableOpacity 
              style={[
                styles.categoryCard,
                selectedCategory === null && styles.categoryCardActive
              ]}
              onPress={() => handleCategoryPress(null)}
            >
              <View style={[styles.categoryIconContainer, { backgroundColor: '#E3F2FD' }]}>
                <MaterialIcons name="apps" size={32} color="#2196F3" />
              </View>
              <Text style={styles.categoryName}>Tất cả</Text>
            </TouchableOpacity>
            {categories.map((category) => {
              const categoryColor = getCategoryColor(category.name);
              const categoryIcon = getCategoryIcon(category.name);
              return (
                <TouchableOpacity 
                  key={category.id} 
                  style={[
                    styles.categoryCard,
                    selectedCategory === category.id && styles.categoryCardActive
                  ]}
                  onPress={() => handleCategoryPress(category.id)}
                >
                  <View style={[styles.categoryIconContainer, { backgroundColor: categoryColor + '20' }]}>
                    <MaterialIcons 
                      name={categoryIcon as any} 
                      size={32} 
                      color={categoryColor} 
                    />
                  </View>
                  <Text style={styles.categoryName}>{category.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Newest blogs Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Newest blogs</Text>
            <TouchableOpacity 
              style={styles.viewMoreButton}
              onPress={() => navigation.navigate('AllArticles', { sortBy: 'newest' })}
            >
              <Text style={styles.viewMoreText}>View more</Text>
              <MaterialIcons name="arrow-forward" size={16} color="#666" />
            </TouchableOpacity>
          </View>
          
          {loading ? (
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
              <MaterialIcons name="article" size={48} color="#ccc" />
              <Text style={styles.emptyText}>
                {searchQuery ? 'Không tìm thấy bài viết nào' : 'Chưa có bài viết nào'}
              </Text>
              <Text style={styles.emptySubText}>
                {searchQuery 
                  ? 'Thử tìm kiếm với từ khóa khác' 
                  : 'Hãy thêm bài viết vào database để xem tại đây'}
              </Text>
            </View>
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.blogsScrollView}
              contentContainerStyle={styles.blogsContent}
            >
              {filteredArticles.map((article) => {
                const categoryColor = getCategoryColor(article.categoryName);
                const categoryIcon = getCategoryIcon(article.categoryName);
                
                return (
                  <TouchableOpacity
                    key={article.id}
                    style={styles.blogCard}
                    onPress={() => handleArticlePress(article)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.blogImageContainer, { backgroundColor: categoryColor }]}>
                      <View style={styles.blogImagePlaceholder}>
                        <MaterialIcons name={categoryIcon as any} size={40} color="white" />
                      </View>
                    </View>
                    <View style={styles.blogContent}>
                      <Text style={styles.blogCategory}>{article.categoryName}</Text>
                      <Text style={styles.blogTitle} numberOfLines={2}>
                        {article.title}
                      </Text>
                      <View style={styles.blogFooter}>
                        <TouchableOpacity
                          style={styles.blogVotes}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleVote(article);
                          }}
                        >
                          <MaterialIcons 
                            name={article.isVoted ? "thumb-up" : "thumb-up-outline"} 
                            size={16} 
                            color={article.isVoted ? categoryColor : "#666"} 
                          />
                          <Text style={styles.blogVotesText}>{article.voteCount} votes</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.tellMeMoreButton}
                          onPress={() => handleArticlePress(article)}
                        >
                          <Text style={styles.tellMeMoreText}>Tell me more</Text>
                          <MaterialIcons name="arrow-forward" size={16} color="#2196F3" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* Collection Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Collection</Text>
            <TouchableOpacity style={styles.viewMoreButton}>
              <Text style={styles.viewMoreText}>View more</Text>
              <MaterialIcons name="arrow-forward" size={16} color="#666" />
            </TouchableOpacity>
          </View>
          {/* Collection content can be added here */}
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
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginRight: 12,
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
  avatarContainer: {
    position: 'relative',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    backgroundColor: '#00BCD4',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#999',
    marginLeft: 4,
  },
  categoriesScrollView: {
    marginTop: 8,
  },
  categoriesContent: {
    paddingRight: 20,
  },
  categoryCard: {
    width: 100,
    marginRight: 12,
    alignItems: 'center',
  },
  categoryCardActive: {
    opacity: 0.8,
  },
  categoryIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewMoreText: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  blogsScrollView: {
    marginTop: 8,
  },
  blogsContent: {
    paddingRight: 20,
  },
  blogCard: {
    width: 280,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  blogImageContainer: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blogImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  blogContent: {
    padding: 16,
  },
  blogCategory: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
    marginBottom: 8,
  },
  blogTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    lineHeight: 22,
  },
  blogFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  blogVotes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  blogVotesText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  tellMeMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  tellMeMoreText: {
    color: '#2196F3',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#F44336',
    marginTop: 8,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default HomeScreen;
