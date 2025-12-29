// app/(tabs)/add-case.tsx
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { ArrowLeft, Save } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { casesAPI } from '../../services/api';

export default function AddCaseScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    courtName: '',
    type: '',
    caseNo: '',
    caseYear: new Date().getFullYear().toString(),
    onBehalfOf: '',
    partyName: '',
    contactNumber: '',
    respondent: '',
    lawyer: '',
    advocateContactNumber: '',
    adversePartyAdvocateName: '',
    description: '',
    nextHearing: new Date().toISOString().split('T')[0],
    status: 'pending',
  });

  const caseTypes = [
    'Criminal',
    'Civil',
    'Family',
    'Property',
    'Corporate',
    'Labor',
    'Tax',
    'Constitutional',
  ];

  const onBehalfOfOptions = [
    'Petitioner',
    'Respondent',
    'Complainant',
    'Accused',
    'Plaintiff',
    'DHR',
    'JDR',
    'Appellant',
  ];

  const handleInputChange = (field: string, value: string) => {
    console.log('handleInputChange', field, value);
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Android fallback modal selectors for reliable behavior in APKs
  const [showCaseTypeModal, setShowCaseTypeModal] = useState(false);
  const [showOnBehalfModal, setShowOnBehalfModal] = useState(false);

  const validateForm = () => {
    const required = [
      'title',
      'courtName',
      'type',
      'caseNo',
      'caseYear',
      'onBehalfOf',
      'partyName',
      'contactNumber',
      'respondent',
      'lawyer',
      'nextHearing',
    ];

    for (const field of required) {
      if (!formData[field as keyof typeof formData]) {
        Alert.alert('Validation Error', `Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await casesAPI.create(formData);
      
      if (response.success) {
        Alert.alert('Success', 'Case added successfully', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add case');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Case</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Case Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Case Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Case Title *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(value) => handleInputChange('title', value)}
              placeholder="Enter case title"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Court Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.courtName}
              onChangeText={(value) => handleInputChange('courtName', value)}
              placeholder="Enter court name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Case Type *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.type}
                        onValueChange={(value) => handleInputChange('type', value)}
                        style={styles.picker}
                        mode={Platform.OS === 'android' ? 'dropdown' : 'dialog'}
                        enabled={true}
              >
                <Picker.Item label="Select Case Type" value="" />
                {caseTypes.map((type) => (
                  <Picker.Item key={type} label={type} value={type} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Case Number *</Text>
              <TextInput
                style={styles.input}
                value={formData.caseNo}
                onChangeText={(value) => handleInputChange('caseNo', value)}
                placeholder="e.g., 123/2024"
              />
            </View>

            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Year *</Text>
              <TextInput
                style={styles.input}
                value={formData.caseYear}
                onChangeText={(value) => handleInputChange('caseYear', value)}
                keyboardType="numeric"
                maxLength={4}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>On Behalf Of *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.onBehalfOf}
                onValueChange={(value) => handleInputChange('onBehalfOf', value)}
                style={styles.picker}
                mode={Platform.OS === 'android' ? 'dropdown' : 'dialog'}
                enabled={true}
              >
                <Picker.Item label="Select Option" value="" />
                {onBehalfOfOptions.map((option) => (
                  <Picker.Item key={option} label={option} value={option} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Next Hearing Date *</Text>
            <TextInput
              style={styles.input}
              value={formData.nextHearing}
              onChangeText={(value) => handleInputChange('nextHearing', value)}
              placeholder="YYYY-MM-DD"
            />
          </View>
        </View>

        {/* Party Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Party Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Party Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.partyName}
              onChangeText={(value) => handleInputChange('partyName', value)}
              placeholder="Enter party name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contact Number *</Text>
            <TextInput
              style={styles.input}
              value={formData.contactNumber}
              onChangeText={(value) => handleInputChange('contactNumber', value)}
              placeholder="Enter contact number"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Respondent Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.respondent}
              onChangeText={(value) => handleInputChange('respondent', value)}
              placeholder="Enter respondent name"
            />
          </View>
        </View>

        {/* Advocate Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Advocate Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Lawyer Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.lawyer}
              onChangeText={(value) => handleInputChange('lawyer', value)}
              placeholder="Enter lawyer name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Advocate Contact Number</Text>
            <TextInput
              style={styles.input}
              value={formData.advocateContactNumber}
              onChangeText={(value) =>
                handleInputChange('advocateContactNumber', value)
              }
              placeholder="Enter advocate contact"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Adverse Party Advocate</Text>
            <TextInput
              style={styles.input}
              value={formData.adversePartyAdvocateName}
              onChangeText={(value) =>
                handleInputChange('adversePartyAdvocateName', value)
              }
              placeholder="Enter adverse party advocate"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Case Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              placeholder="Enter case description"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Save size={20} color="#fff" />
              <Text style={styles.submitBtnText}>Save Case</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    /* removed overflow: 'hidden' to avoid clipping Android dropdown menus */
  },
  picker: {
    height: 50,
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  submitBtn: {
    backgroundColor: '#8b7355',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 24,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});