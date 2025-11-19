import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Text as RNText,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { supportApi } from '../api/supportApi';
import { useAuth } from '../context/AuthContext';

type MessageSender = 'user' | 'assistant';

interface ChatMessage {
  id: string;
  sender: MessageSender;
  content: string;
  timestamp: number;
}

const SupportChatScreen: React.FC = () => {
  const { userInfo } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'assistant',
      content:
        'Xin chào! 👋 Mình là trợ lý AI Healthy Check. Bạn có thể hỏi bất cứ điều gì về cách sử dụng ứng dụng hoặc về dữ liệu sức khỏe của bạn.',
      timestamp: Date.now(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList<ChatMessage>>(null);

  const canSend = useMemo(() => inputValue.trim().length > 0 && !isSending, [inputValue, isSending]);

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    });
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!canSend || !userInfo?.id || isSending) {
      return;
    }

    const trimmed = inputValue.trim();
    if (!trimmed) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: trimmed,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsSending(true);
    scrollToEnd();

    try {
      const { response } = await supportApi.sendMessage({
        message: trimmed,
        userId: userInfo.id,
      });

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        content: response,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      scrollToEnd();
    } catch (error: any) {
      console.error('[SupportChat] Error sending message:', error);
      
      // Check if it's a 401 error (unauthorized)
      if (error?.response?.status === 401) {
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          sender: 'assistant',
          content: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } else {
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          sender: 'assistant',
          content:
            error?.response?.data?.message ??
            error?.response?.data?.response ??
            'Xin lỗi, hiện không thể kết nối tới máy chủ. Bạn vui lòng thử lại sau nhé.',
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } finally {
      setIsSending(false);
    }
  }, [canSend, inputValue, scrollToEnd, userInfo?.id, isSending]);

  const renderMessage = useCallback(({ item }: { item: ChatMessage }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[styles.messageContainer, isUser ? styles.messageRight : styles.messageLeft]}>
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}>
            {item.content}
          </Text>
        </View>
        <RNText style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </RNText>
      </View>
    );
  }, []);

  if (!userInfo?.id) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <MaterialCommunityIcons name="account-alert-outline" size={64} color="#00BCD4" />
        <Text style={styles.centerTitle}>Bạn chưa đăng nhập</Text>
        <Text style={styles.centerSubtitle}>
          Vui lòng đăng nhập để sử dụng tính năng hỗ trợ AI.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <MaterialCommunityIcons name="robot-love" size={28} color="#00BCD4" />
            <Text style={styles.headerTitle}>Trợ lý AI Healthy Check</Text>
          </View>
        </View>

        <View style={styles.chatContainer}>
          <FlatList
            ref={flatListRef}
            contentContainerStyle={styles.listContent}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            onContentSizeChange={scrollToEnd}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nhập câu hỏi của bạn..."
            placeholderTextColor="#9EA3AE"
            value={inputValue}
            onChangeText={setInputValue}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!canSend}
          >
            {isSending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <MaterialCommunityIcons name="send" size={22} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E6ED',
    backgroundColor: '#fff',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E232C',
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  listContent: {
    paddingBottom: 16,
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '85%',
  },
  messageLeft: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageRight: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  bubble: {
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  assistantBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E6ED',
  },
  userBubble: {
    backgroundColor: '#00BCD4',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  assistantText: {
    color: '#1E232C',
  },
  userText: {
    color: '#fff',
  },
  timestamp: {
    marginTop: 4,
    fontSize: 11,
    color: '#9EA3AE',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E6ED',
    gap: 12,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderRadius: 20,
    backgroundColor: '#F0F2F5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1E232C',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00BCD4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#C2CCD6',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  centerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E232C',
  },
  centerSubtitle: {
    fontSize: 15,
    color: '#6A707C',
    textAlign: 'center',
  },
});

export default SupportChatScreen;

