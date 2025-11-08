import { apiClient } from './config';

interface SupportChatRequest {
    message: string;
    userId: number;
}

interface SupportChatResponse {
    response: string;
}

export const supportApi = {
    async sendMessage(payload: SupportChatRequest): Promise<SupportChatResponse> {
        const { data } = await apiClient.post<SupportChatResponse>('/support/chat', payload);
        return data;
    },
};

