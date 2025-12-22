import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '../lib/queryClient';

export default function ListingDetailScreen({ route, navigation }: any) {
  const { listingId } = route.params;

  const { data: listing, isLoading } = useQuery({
    queryKey: ['/api/listings', listingId],
    queryFn: () => apiRequest(`/api/listings/${listingId}`),
  });

  const createChatMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest('/api/chats', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (chat) => {
      queryClient.invalidateQueries({ queryKey: ['/api/chats'] });
      navigation.navigate('ChatDetail', { chatId: chat.id });
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </SafeAreaView>
    );
  }

  if (!listing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Listing not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleContactSeller = () => {
    createChatMutation.mutate({
      listingId: listing.id,
      buyerId: 1, // MVP: hardcoded user ID
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.imageContainer}>
          {listing.imageUrl ? (
            <View style={styles.image} />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]} />
          )}
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.title}>{listing.title}</Text>
          <Text style={styles.price}>₹{listing.price}</Text>
          <Text style={styles.category}>{listing.category}</Text>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Type:</Text>
            <Text style={styles.value}>
              {listing.type === 'rent' ? 'Rent' : 'Sell'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.value}>{listing.status}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{listing.description}</Text>
          </View>

          <View style={styles.sellerSection}>
            <Text style={styles.sectionTitle}>Seller</Text>
            <View style={styles.sellerInfo}>
              <View style={styles.sellerAvatar}>
                <Text style={styles.sellerAvatarText}>
                  {listing.seller?.username?.[0]?.toUpperCase() || 'U'}
                </Text>
              </View>
              <View style={styles.sellerDetails}>
                <Text style={styles.sellerName}>{listing.seller?.username}</Text>
                <Text style={styles.sellerCollege}>{listing.seller?.college}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.contactButton,
              createChatMutation.isPending && styles.contactButtonDisabled,
            ]}
            onPress={handleContactSeller}
            disabled={createChatMutation.isPending}
          >
            {createChatMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.contactButtonText}>Contact Seller</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    paddingBottom: 40,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#E5E7EB',
  },
  image: {
    flex: 1,
  },
  imagePlaceholder: {
    backgroundColor: '#E5E7EB',
  },
  detailsContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  sellerSection: {
    marginTop: 24,
    paddingHorizontal: 12,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  sellerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sellerAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  sellerDetails: {
    flex: 1,
  },
  sellerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  sellerCollege: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
  },
  contactButton: {
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 16,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    alignItems: 'center',
  },
  contactButtonDisabled: {
    opacity: 0.7,
  },
  contactButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
