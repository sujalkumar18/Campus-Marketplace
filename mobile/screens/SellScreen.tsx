import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Picker,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '../lib/queryClient';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.coerce.number().min(1, 'Price must be at least 1'),
  category: z.string(),
  type: z.enum(['sell', 'rent']),
});

type FormData = z.infer<typeof formSchema>;

const CATEGORIES = ['Books', 'Notes', 'Calculators', 'Lab Equipment', 'Other Items'];

export default function SellScreen({ navigation }: any) {
  const [listingType, setListingType] = useState<'sell' | 'rent'>('sell');

  const { control, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: 'Books',
      type: 'sell',
      price: 0,
    },
  });

  const createListingMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest('/api/listings', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      Alert.alert('Success', 'Listing created successfully!');
      navigation.goBack();
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to create listing. Please try again.');
    },
  });

  const onSubmit = (data: FormData) => {
    const payload = {
      ...data,
      sellerId: 1, // MVP: hardcoded user ID
      type: listingType,
      status: 'available',
    };
    createListingMutation.mutate(payload);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>List Item</Text>

        {/* Type Toggle */}
        <View style={styles.typeToggle}>
          <TouchableOpacity
            style={[styles.typeButton, listingType === 'sell' && styles.typeButtonActive]}
            onPress={() => setListingType('sell')}
          >
            <Text
              style={[
                styles.typeButtonText,
                listingType === 'sell' && styles.typeButtonTextActive,
              ]}
            >
              Sell
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, listingType === 'rent' && styles.typeButtonActive]}
            onPress={() => setListingType('rent')}
          >
            <Text
              style={[
                styles.typeButtonText,
                listingType === 'rent' && styles.typeButtonTextActive,
              ]}
            >
              Rent
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, value } }) => (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Engineering Mathematics Vol 1"
                value={value}
                onChangeText={onChange}
                placeholderTextColor="#9CA3AF"
              />
              {errors.title && (
                <Text style={styles.error}>{errors.title.message}</Text>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                placeholder="Condition, edition, any defects..."
                value={value}
                onChangeText={onChange}
                multiline
                numberOfLines={4}
                placeholderTextColor="#9CA3AF"
              />
              {errors.description && (
                <Text style={styles.error}>{errors.description.message}</Text>
              )}
            </View>
          )}
        />

        <View style={styles.rowContainer}>
          <Controller
            control={control}
            name="price"
            render={({ field: { onChange, value } }) => (
              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={styles.label}>Price (₹)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="500"
                  value={value?.toString()}
                  onChangeText={(text) => onChange(text ? parseInt(text) : 0)}
                  keyboardType="numeric"
                  placeholderTextColor="#9CA3AF"
                />
                {errors.price && (
                  <Text style={styles.error}>{errors.price.message}</Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="category"
            render={({ field: { onChange, value } }) => (
              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={styles.label}>Category</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={value}
                    onValueChange={onChange}
                    style={styles.picker}
                  >
                    {CATEGORIES.map((cat) => (
                      <Picker.Item key={cat} label={cat} value={cat} />
                    ))}
                  </Picker>
                </View>
              </View>
            )}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            createListingMutation.isPending && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit(onSubmit)}
          disabled={createListingMutation.isPending}
        >
          {createListingMutation.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Post Listing</Text>
          )}
        </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
  },
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  typeButtonTextActive: {
    color: '#3B82F6',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1F2937',
    backgroundColor: 'white',
  },
  textarea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  picker: {
    height: 48,
  },
  error: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 4,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
