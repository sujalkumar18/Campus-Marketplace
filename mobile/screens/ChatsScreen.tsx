import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';

export default function ChatsScreen({ navigation }: any) {
  const { data: chats = [], isLoading } = useQuery({
    queryKey: ['/api/chats'],
    queryFn: () =>
      apiRequest('/api/chats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch(() => []),
  });

  const renderChatItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => navigation.navigate('ChatDetail', { chatId: item.id })}
    >
      <View style={styles.chatInfo}>
        <Text style={styles.chatTitle} numberOfLines={1}>
          {item.listing?.title || 'Chat'}
        </Text>
        <Text style={styles.chatPreview} numberOfLines={1}>
          {item.buyer?.username} & {item.seller?.username}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats</Text>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : chats.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No chats yet</Text>
          <Text style={styles.emptySubText}>Start by browsing listings</Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderChatItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  emptySubText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  listContent: {
    paddingVertical: 8,
  },
  chatItem: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  chatInfo: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  chatPreview: {
    fontSize: 13,
    color: '#6B7280',
  },
});
