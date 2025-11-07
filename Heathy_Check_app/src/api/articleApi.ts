import axios from 'axios';

// const API_BASE_URL = 'http://172.20.10.9:8080/api';

export interface Article {
    id: number;
    title: string;
    content: string;
    categoryName: string;
    categoryId?: number;
    voteCount: number;
    publishedAt: string;
    isVoted?: boolean; // Người dùng đã vote chưa
}

export interface ArticleSearchParams {
    keyword?: string;
    categoryId?: number;
    sortBy?: 'newest' | 'popular' | 'votes';
    page?: number;
    size?: number;
}

export interface Category {
    id: number;
    name: string;
}

export const articleApi = {
    // Lấy tất cả articles
    getAllArticles: async (token: string, params?: ArticleSearchParams): Promise<Article[]> => {
        try {
            const queryParams = new URLSearchParams();
            if (params?.keyword) queryParams.append('keyword', params.keyword);
            if (params?.categoryId) queryParams.append('categoryId', params.categoryId.toString());
            if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
            if (params?.page) queryParams.append('page', params.page.toString());
            if (params?.size) queryParams.append('size', params.size.toString());

            const url = `${API_BASE_URL}/articles${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        } catch (error: any) {
            console.error('Error fetching articles:', error);
            // Fallback: nếu endpoint chưa có, trả về mảng rỗng
            if (error.response?.status === 404) {
                return [];
            }
            throw error;
        }
    },

    // Lấy article theo ID
    getArticleById: async (articleId: number, token: string): Promise<Article> => {
        try {
            const response = await axios.get(`${API_BASE_URL}/articles/${articleId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        } catch (error: any) {
            console.error('Error fetching article:', error);
            throw error;
        }
    },

    // Lấy tất cả categories
    getCategories: async (token: string): Promise<Category[]> => {
        try {
            const response = await axios.get(`${API_BASE_URL}/categories`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        } catch (error: any) {
            console.error('Error fetching categories:', error);
            // Fallback: trả về categories mặc định
            if (error.response?.status === 404) {
                return [
                    { id: 1, name: 'Nutrition' },
                    { id: 2, name: 'Sports' },
                    { id: 3, name: 'Running' },
                    { id: 4, name: 'Lifestyle' },
                ];
            }
            throw error;
        }
    },

    // Vote/Unvote article
    voteArticle: async (articleId: number, token: string): Promise<void> => {
        try {
            await axios.post(`${API_BASE_URL}/articles/${articleId}/vote`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
        } catch (error: any) {
            console.error('Error voting article:', error);
            throw error;
        }
    },

    // Unvote article
    unvoteArticle: async (articleId: number, token: string): Promise<void> => {
        try {
            await axios.delete(`${API_BASE_URL}/articles/${articleId}/vote`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
        } catch (error: any) {
            console.error('Error unvoting article:', error);
            throw error;
        }
    },
};

