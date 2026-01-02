// app/(tabs)/add-case.tsx - Updated with proper dropdowns
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { ArrowLeft, Save } from "lucide-react-native";
import React, { useState } from "react";
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
  View,
} from "react-native";
import { casesAPI } from "../../services/api";
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
  Shadows,
} from "../../constants/theme";

export default function AddCaseScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    courtName: "",
    type: "",
    caseNo: "",
    caseYear: new Date().getFullYear().toString(),
    onBehalfOf: "",
    partyName: "",
    contactNumber: "",
    respondent: "",
    lawyer: "",
    advocateContactNumber: "",
    adversePartyAdvocateName: "",
    description: "",
    nextHearing: new Date().toISOString().split("T")[0],
    status: "pending",
  });

  const caseTypes = [
    "Criminal",
    "Civil",
    "Family",
    "Property",
    "Corporate",
    "Labor",
    "Tax",
    "Constitutional",
  ];

  const onBehalfOfOptions = [
    "Petitioner",
    "Respondent",
    "Complainant",
    "Accused",
    "Plaintiff",
    "DHR",
    "JDR",
    "Appellant",
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const required = [
      "title",
      "courtName",
      "type",
      "caseNo",
      "caseYear",
      "onBehalfOf",
      "partyName",
      "contactNumber",
      "respondent",
      "lawyer",
      "nextHearing",
    ];

    for (const field of required) {
      if (!formData[field as keyof typeof formData]) {
        Alert.alert(
          "Validation Error",
          `Please fill in ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`
        );
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
        Alert.alert("Success", "Case added successfully", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to add case");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={Colors.text.primary} />
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
              onChangeText={(value) => handleInputChange("title", value)}
              placeholder="Enter case title"
              placeholderTextColor={Colors.text.tertiary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Court Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.courtName}
              onChangeText={(value) => handleInputChange("courtName", value)}
              placeholder="Enter court name"
              placeholderTextColor={Colors.text.tertiary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Case Type *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.type}
                onValueChange={(value) => handleInputChange("type", value)}
                style={styles.picker}
                mode={Platform.OS === "android" ? "dropdown" : "dialog"}
                dropdownIconColor="#000"
              >
                <Picker.Item
                  label="Select Case Type"
                  value=""
                  color={Colors.text.tertiary}
                />
                {caseTypes.map((type) => (
                  <Picker.Item
                    key={type}
                    label={type}
                    value={type}
                    color="#000"
                  />
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
                onChangeText={(value) => handleInputChange("caseNo", value)}
                placeholder="e.g., 123/2024"
                placeholderTextColor={Colors.text.tertiary}
              />
            </View>

            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Year *</Text>
              <TextInput
                style={styles.input}
                value={formData.caseYear}
                onChangeText={(value) => handleInputChange("caseYear", value)}
                keyboardType="numeric"
                maxLength={4}
                placeholder="2024"
                placeholderTextColor={Colors.text.tertiary}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>On Behalf Of *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.onBehalfOf}
                onValueChange={(value) =>
                  handleInputChange("onBehalfOf", value)
                }
                style={styles.picker}
                mode={Platform.OS === "android" ? "dropdown" : "dialog"}
                dropdownIconColor="#000"
              >
                <Picker.Item
                  label="Select Option"
                  value=""
                  color={Colors.text.tertiary}
                />
                {onBehalfOfOptions.map((option) => (
                  <Picker.Item
                    key={option}
                    label={option}
                    value={option}
                    color="#000"
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Next Hearing Date *</Text>
            <TextInput
              style={styles.input}
              value={formData.nextHearing}
              onChangeText={(value) => handleInputChange("nextHearing", value)}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={Colors.text.tertiary}
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
              onChangeText={(value) => handleInputChange("partyName", value)}
              placeholder="Enter party name"
              placeholderTextColor={Colors.text.tertiary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contact Number *</Text>
            <TextInput
              style={styles.input}
              value={formData.contactNumber}
              onChangeText={(value) =>
                handleInputChange("contactNumber", value)
              }
              placeholder="Enter contact number"
              keyboardType="phone-pad"
              placeholderTextColor={Colors.text.tertiary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Respondent Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.respondent}
              onChangeText={(value) => handleInputChange("respondent", value)}
              placeholder="Enter respondent name"
              placeholderTextColor={Colors.text.tertiary}
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
              onChangeText={(value) => handleInputChange("lawyer", value)}
              placeholder="Enter lawyer name"
              placeholderTextColor={Colors.text.tertiary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Advocate Contact Number</Text>
            <TextInput
              style={styles.input}
              value={formData.advocateContactNumber}
              onChangeText={(value) =>
                handleInputChange("advocateContactNumber", value)
              }
              placeholder="Enter advocate contact"
              keyboardType="phone-pad"
              placeholderTextColor={Colors.text.tertiary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Adverse Party Advocate</Text>
            <TextInput
              style={styles.input}
              value={formData.adversePartyAdvocateName}
              onChangeText={(value) =>
                handleInputChange("adversePartyAdvocateName", value)
              }
              placeholder="Enter adverse party advocate"
              placeholderTextColor={Colors.text.tertiary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Case Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(value) => handleInputChange("description", value)}
              placeholder="Enter case description"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor={Colors.text.tertiary}
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
    backgroundColor: Colors.background.secondary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxxl + 20,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  backBtn: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: 40,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.fontSize.md,
    color: "#000",
    ...Shadows.sm,
  },
  textArea: {
    minHeight: 100,
  },
  pickerContainer: {
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: BorderRadius.md,
    ...Shadows.sm,
  },
  picker: {
    height: 50,
    width: "100%",
    color: "#000",
  },
  row: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  flex1: {
    flex: 1,
  },
  submitBtn: {
    backgroundColor: Colors.primary[500],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
    marginTop: Spacing.lg,
    ...Shadows.md,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: "#fff",
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
});
