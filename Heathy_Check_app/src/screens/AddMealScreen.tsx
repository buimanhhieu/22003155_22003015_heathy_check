import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../context/AuthContext';
import { mealLogApi, MealLogRequest } from '../api/userApi';

type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

interface AddMealScreenProps {
  navigation: any;
  route?: {
    params?: {
      mealLog?: any; // For editing
    };
  };
}

const AddMealScreen: React.FC<AddMealScreenProps> = ({ navigation, route }) => {
  const { userInfo } = useAuth();
  const existingMeal = route?.params?.mealLog;
  // Only edit if mealLog exists AND has an id (meaning it's already saved in database)
  const isEditing = existingMeal !== undefined && existingMeal?.id !== undefined;

  // Form state
  const [mealName, setMealName] = useState(existingMeal?.mealName || '');
  const [mealType, setMealType] = useState<MealType>(existingMeal?.mealType || 'SNACK');
  const [calories, setCalories] = useState(existingMeal?.totalCalories?.toString() || '');
  const [fat, setFat] = useState(existingMeal?.fatGrams?.toString() || '');
  const [protein, setProtein] = useState(existingMeal?.proteinGrams?.toString() || '');
  const [carbs, setCarbs] = useState(existingMeal?.carbsGrams?.toString() || '');
  
  // Time picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState(
    existingMeal?.loggedAt ? new Date(existingMeal.loggedAt) : new Date()
  );

  const [saving, setSaving] = useState(false);

  const mealTypes: { label: string; value: MealType; icon: string }[] = [
    { label: 'Breakfast', value: 'BREAKFAST', icon: 'weather-sunny' },
    { label: 'Lunch', value: 'LUNCH', icon: 'weather-sunset' },
    { label: 'Dinner', value: 'DINNER', icon: 'weather-night' },
    { label: 'Snack', value: 'SNACK', icon: 'cookie' },
  ];

  const handleSave = async () => {
    // Validation
    const caloriesNum = parseFloat(calories);
    if (!calories || isNaN(caloriesNum) || caloriesNum <= 0) {
      Alert.alert('Validation Error', 'Please enter calories (must be greater than 0)');
      return;
    }

    if (!userInfo?.id) {
      Alert.alert('Error', 'User information not available');
      return;
    }

    setSaving(true);

    try {
      const mealLogRequest: MealLogRequest = {
        mealName: mealName.trim() || undefined,
        mealType,
        totalCalories: caloriesNum,
        fatGrams: fat ? (isNaN(parseFloat(fat)) ? undefined : parseFloat(fat)) : undefined,
        proteinGrams: protein ? (isNaN(parseFloat(protein)) ? undefined : parseFloat(protein)) : undefined,
        carbsGrams: carbs ? (isNaN(parseFloat(carbs)) ? undefined : parseFloat(carbs)) : undefined,
        loggedAt: selectedDateTime.toISOString(),
      };

      if (isEditing) {
        // Update existing meal log (PUT)
        if (!existingMeal?.id) {
          throw new Error('Cannot update meal: meal ID is missing');
        }
        await mealLogApi.updateMealLog(userInfo.id, existingMeal.id, mealLogRequest);
        Alert.alert('Success', 'Meal updated successfully');
      } else {
        // Create new meal log (POST)
        await mealLogApi.createMealLog(userInfo.id, mealLogRequest);
        Alert.alert('Success', 'Meal added successfully');
      }

      // Navigate back - NutritionScreen will auto-refresh on focus
      navigation.goBack();
    } catch (error: any) {
      console.error('Error saving meal:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to save meal. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (date) {
      setSelectedDateTime(date);
    }
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1E232C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Edit Meal' : 'Add Meal'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Meal Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Meal Name (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Rice with chicken"
            value={mealName}
            onChangeText={setMealName}
            placeholderTextColor="#999"
          />
        </View>

        {/* Meal Type */}
        <View style={styles.section}>
          <Text style={styles.label}>Meal Type</Text>
          <View style={styles.mealTypeContainer}>
            {mealTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.mealTypeButton,
                  mealType === type.value && styles.mealTypeButtonActive,
                ]}
                onPress={() => setMealType(type.value)}
              >
                <MaterialCommunityIcons
                  name={type.icon as any}
                  size={20}
                  color={mealType === type.value ? '#FFFFFF' : '#666'}
                />
                <Text
                  style={[
                    styles.mealTypeText,
                    mealType === type.value && styles.mealTypeTextActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Calories - Required */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Calories (kcal) <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter calories"
            value={calories}
            onChangeText={setCalories}
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>

        {/* Macros - Optional */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Macronutrients (Optional)</Text>
          <Text style={styles.hint}>
            Leave empty to auto-calculate based on calories
          </Text>

          <View style={styles.macrosRow}>
            <View style={styles.macroInput}>
              <Text style={styles.macroLabel}>Fat (g)</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={fat}
                onChangeText={setFat}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.macroInput}>
              <Text style={styles.macroLabel}>Protein (g)</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={protein}
                onChangeText={setProtein}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.macroInput}>
              <Text style={styles.macroLabel}>Carbs (g)</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={carbs}
                onChangeText={setCarbs}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>
          </View>
        </View>

        {/* Time Picker */}
        <View style={styles.section}>
          <Text style={styles.label}>Meal Time</Text>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setShowDatePicker(true)}
          >
            <MaterialCommunityIcons name="clock-outline" size={20} color="#666" />
            <Text style={styles.timeText}>{formatDateTime(selectedDateTime)}</Text>
            <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDateTime}
            mode="datetime"
            is24Hour={false}
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : isEditing ? 'Update Meal' : 'Save Meal'}
          </Text>
        </TouchableOpacity>

        {/* Delete Button (only when editing) */}
        {isEditing && existingMeal?.id && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={async () => {
              Alert.alert(
                'Delete Meal',
                'Are you sure you want to delete this meal?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        if (userInfo?.id) {
                          await mealLogApi.deleteMealLog(userInfo.id, existingMeal.id);
                          Alert.alert('Success', 'Meal deleted successfully');
                          // Navigate back - NutritionScreen will auto-refresh on focus
                          navigation.goBack();
                        }
                      } catch (error: any) {
                        Alert.alert('Error', 'Failed to delete meal');
                      }
                    },
                  },
                ]
              );
            }}
          >
            <MaterialCommunityIcons name="delete-outline" size={20} color="#F44336" />
            <Text style={styles.deleteButtonText}>Delete Meal</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E232C',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E232C',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E232C',
    marginBottom: 8,
  },
  required: {
    color: '#F44336',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1E232C',
    backgroundColor: '#FAFAFA',
  },
  mealTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mealTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
    gap: 8,
    minWidth: 100,
  },
  mealTypeButtonActive: {
    backgroundColor: '#00BCD4',
    borderColor: '#00BCD4',
  },
  mealTypeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  mealTypeTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  macrosRow: {
    flexDirection: 'row',
    gap: 12,
  },
  macroInput: {
    flex: 1,
  },
  macroLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
    gap: 12,
  },
  timeText: {
    flex: 1,
    fontSize: 16,
    color: '#1E232C',
  },
  saveButton: {
    backgroundColor: '#00BCD4',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F44336',
    backgroundColor: '#FFFFFF',
    gap: 8,
    marginBottom: 40,
  },
  deleteButtonText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddMealScreen;

