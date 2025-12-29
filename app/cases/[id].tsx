// app/cases/[id].tsx - Updated Case Details Screen matching old design
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  FileText,
  FolderOpen,
  Scale,
  Shield,
  Users,
  Calendar,
  Phone,
  Trash2,
  Eye,
  Upload,
  Camera,
  X,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Image,
} from "react-native";
import { casesAPI, imagePickerHelper, getFileUrl } from "../../services/api";
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
  Shadows,
} from "../../constants/theme";

interface Case {
  _id: string;
  title: string;
  caseNo: string;
  type: string;
  courtName: string;
  caseYear: number;
  onBehalfOf: string;
  partyName: string;
  contactNumber: string;
  respondent: string;
  lawyer: string;
  advocateContactNumber?: string;
  adversePartyAdvocateName?: string;
  description?: string;
  nextHearing: string;
  status: string;
  createdAt: string;
  drafts?: any[];
  opponentDrafts?: any[];
  courtOrders?: any[];
  evidence?: any[];
}

export default function CaseDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info");
  const [activeSectionTab, setActiveSectionTab] = useState("drafts");
  const [showFileModal, setShowFileModal] = useState(false);
  const [previewFile, setPreviewFile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCaseDetails();
    }
  }, [id]);

  const fetchCaseDetails = async () => {
    try {
      setLoading(true);
      const response = await casesAPI.get(id as string);
      if (response.success) {
        setCaseData(response.data);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to fetch case details");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    return (
      Colors.status[status as keyof typeof Colors.status] || Colors.neutral[500]
    );
  };

  const tabs = [
    { id: "info", label: "Information", icon: FileText },
    { id: "sections", label: "Sections", icon: FolderOpen },
  ];

  const sectionTabs = [
    { id: "drafts", label: "Drafts" },
    { id: "opponentDrafts", label: "Opponent Drafts" },
    { id: "courtOrders", label: "Court Orders" },
    { id: "evidence", label: "Evidence" },
  ];

  const handleUploadOptions = () => {
    Alert.alert("Upload File", "Choose upload method", [
      {
        text: "Take Photo",
        onPress: handleTakePhoto,
      },
      {
        text: "Choose from Gallery",
        onPress: handlePickImage,
      },
      {
        text: "Upload Document",
        onPress: handlePickDocument,
      },
      {
        text: "Create Note",
        onPress: handleCreateNote,
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  const handleTakePhoto = async () => {
    try {
      const photo = await imagePickerHelper.takePhoto();
      if (photo) {
        await uploadFiles([photo]);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to take photo");
    }
  };

  const handlePickImage = async () => {
    try {
      const images = await imagePickerHelper.pickImage(true);
      if (images && images.length > 0) {
        await uploadFiles(images);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to pick images");
    }
  };

  const handlePickDocument = async () => {
    try {
      const doc = await imagePickerHelper.pickDocument();
      if (doc) {
        await uploadFiles([doc]);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to pick document");
    }
  };

  const uploadFiles = async (filesList: any[]) => {
    try {
      setUploading(true);
      await casesAPI.uploadFiles(caseData!._id, filesList, activeSectionTab);
      Alert.alert("Success", "Files uploaded successfully!");
      fetchCaseDetails();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to upload files"
      );
    } finally {
      setUploading(false);
    }
  };

  const handleCreateNote = () => {
    Alert.prompt("Create Note", "Enter note title", async (title) => {
      if (title && title.trim()) {
        try {
          setUploading(true);
          await casesAPI.createNote(
            caseData!._id,
            activeSectionTab,
            title.trim()
          );
          Alert.alert("Success", "Note created successfully!");
          fetchCaseDetails();
        } catch (error: any) {
          Alert.alert("Error", "Failed to create note");
        } finally {
          setUploading(false);
        }
      }
    });
  };

  const handleDeleteFile = (item: any) => {
    Alert.alert(
      "Delete File",
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const fileId =
                item.type === "file" ? item.fileId._id : item.noteId._id;
              await casesAPI.deleteFile(caseData!._id, fileId);
              Alert.alert("Success", "File deleted successfully!");
              fetchCaseDetails();
            } catch (error) {
              Alert.alert("Error", "Failed to delete file");
            }
          },
        },
      ]
    );
  };

  const handlePreview = (item: any) => {
    setPreviewFile(item);
    setShowFileModal(true);
  };

  const renderFileIcon = (item: any) => {
    if (item.type === "file" && item.fileId?.mimetype?.startsWith("image/")) {
      return (
        <Image
          source={{ uri: getFileUrl(item.fileId.url) }}
          style={styles.thumbnailImage}
        />
      );
    }
    if (item.type === "note") {
      return <FileText size={40} color={Colors.primary[500]} />;
    }
    return <FileText size={40} color={Colors.error.main} />;
  };

  const getCurrentSectionFiles = () => {
    if (!caseData) return [];
    return (caseData[activeSectionTab as keyof Case] as any[]) || [];
  };

  const renderTabContent = () => {
    if (!caseData) return null;

    if (activeTab === "info") {
      return (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Case Information */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Case Information</Text>
            <View style={styles.infoCard}>
              <InfoRow label="Case Title" value={caseData.title} />
              <InfoRow label="Case Number" value={caseData.caseNo} />
              <InfoRow label="Case Type" value={caseData.type} />
              <InfoRow label="Court Name" value={caseData.courtName} />
              <InfoRow label="Case Year" value={caseData.caseYear.toString()} />
              <InfoRow label="On Behalf Of" value={caseData.onBehalfOf} />
              <InfoRow
                label="Next Hearing"
                value={new Date(caseData.nextHearing).toLocaleDateString()}
              />
            </View>
          </View>

          {/* Party Information */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Party Information</Text>
            <View style={styles.infoCard}>
              <InfoRow label="Party Name" value={caseData.partyName} />
              <InfoRow label="Contact Number" value={caseData.contactNumber} />
              <InfoRow label="Respondent" value={caseData.respondent} />
            </View>
          </View>

          {/* Advocate Information */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Advocate Information</Text>
            <View style={styles.infoCard}>
              <InfoRow label="Lawyer Name" value={caseData.lawyer} />
              {caseData.advocateContactNumber && (
                <InfoRow
                  label="Advocate Contact"
                  value={caseData.advocateContactNumber}
                />
              )}
              {caseData.adversePartyAdvocateName && (
                <InfoRow
                  label="Adverse Party Advocate"
                  value={caseData.adversePartyAdvocateName}
                />
              )}
            </View>
          </View>
        </ScrollView>
      );
    }

    // Sections Tab
    return (
      <View style={styles.sectionsContainer}>
        {/* Section Tabs */}
       
          <View style={styles.sectionTabs}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {sectionTabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.sectionTab,
                  activeSectionTab === tab.id && styles.sectionTabActive,
                ]}
                onPress={() => setActiveSectionTab(tab.id)}
              >
                <Text
                  style={[
                    styles.sectionTabText,
                    activeSectionTab === tab.id && styles.sectionTabTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
            </ScrollView>
          </View>
      

        {/* Section Content */}
        <View style={styles.sectionContent}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionContentTitle}>
              {sectionTabs.find((t) => t.id === activeSectionTab)?.label}
            </Text>
            <TouchableOpacity
              style={styles.uploadFab}
              onPress={handleUploadOptions}
              disabled={uploading}
            >
              <Upload size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {uploading && (
            <View style={styles.uploadingBanner}>
              <ActivityIndicator color={Colors.primary[500]} />
              <Text style={styles.uploadingText}>Uploading...</Text>
            </View>
          )}

          <ScrollView
            style={styles.filesList}
            showsVerticalScrollIndicator={false}
          >
            {getCurrentSectionFiles().length === 0 ? (
              <View style={styles.emptyFiles}>
                <Camera size={64} color={Colors.neutral[300]} />
                <Text style={styles.emptyFilesText}>No files uploaded yet</Text>
                <Text style={styles.emptyFilesSubtext}>
                  Tap the upload button to add files
                </Text>
              </View>
            ) : (
              getCurrentSectionFiles().map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.fileItem}
                  onPress={() => handlePreview(item)}
                >
                  <View style={styles.fileThumbnail}>
                    {renderFileIcon(item)}
                  </View>
                  <View style={styles.fileDetails}>
                    <Text style={styles.fileName} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text style={styles.fileDate}>
                      {new Date(item.addedAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.fileActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handlePreview(item)}
                    >
                      <Eye size={20} color={Colors.info.main} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDeleteFile(item)}
                    >
                      <Trash2 size={20} color={Colors.error.main} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
        <Text style={styles.loadingText}>Loading case details...</Text>
      </View>
    );
  }

  if (!caseData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Case not found</Text>
      </View>
    );
  }

  const statusColor = getStatusColor(caseData.status);

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.primary[500], Colors.primary[600]]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${statusColor}40` },
            ]}
          >
            <Text style={[styles.statusText, { color: statusColor }]}>
              {caseData.status.toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={styles.headerTitle} numberOfLines={2}>
          {caseData.title}
        </Text>
        <Text style={styles.headerSubtitle}>Case No: {caseData.caseNo}</Text>
      </LinearGradient>

      {/* Main Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Icon
                size={20}
                color={
                  activeTab === tab.id
                    ? Colors.primary[500]
                    : Colors.text.tertiary
                }
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.id && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content */}
      {renderTabContent()}

      {/* Preview Modal */}
      <Modal
        visible={showFileModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFileModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Preview</Text>
              <TouchableOpacity onPress={() => setShowFileModal(false)}>
                <X size={24} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>
            {previewFile && (
              <ScrollView style={styles.previewContainer}>
                {previewFile.type === "file" &&
                previewFile.fileId?.mimetype?.startsWith("image/") ? (
                  <Image
                    source={{ uri: getFileUrl(previewFile.fileId.url) }}
                    style={styles.previewImage}
                    resizeMode="contain"
                  />
                ) : previewFile.type === "note" ? (
                  <View style={styles.notePreview}>
                    <Text style={styles.noteTitle}>{previewFile.name}</Text>
                    <Text style={styles.noteContent}>
                      {previewFile.noteId?.content || "No content"}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.pdfPreview}>
                    <FileText size={80} color={Colors.error.main} />
                    <Text style={styles.pdfText}>{previewFile.name}</Text>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background.secondary,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
  },
  errorText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.error.main,
    fontWeight: Typography.fontWeight.semibold,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  backBtn: {
    padding: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: Colors.primary[500],
  },
  tabText: {
    fontSize: 14,
    color: Colors.text.tertiary,
    fontWeight: "500",
  },
  tabTextActive: {
    color: Colors.primary[500],
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  infoSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: 16,
    padding: 16,
    ...Shadows.sm,
  },
  infoRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: "600",
  },
  sectionsContainer: {
    flex: 1,
  },
  sectionTabsScroll: {
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  sectionTabs: {
    flexDirection: "row",
    paddingHorizontal: 4,
  },
  sectionTab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  sectionTabActive: {
    borderBottomColor: Colors.primary[500],
  },
  sectionTabText: {
    fontSize: 14,
    color: Colors.text.tertiary,
    fontWeight: "500",
  },
  sectionTabTextActive: {
    color: Colors.primary[500],
    fontWeight: "600",
  },
  sectionContent: {
    flex: 1,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionContentTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  uploadFab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary[500],
    justifyContent: "center",
    alignItems: "center",
    ...Shadows.md,
  },
  uploadingBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    backgroundColor: Colors.primary[50],
    borderRadius: 8,
    marginBottom: 16,
  },
  uploadingText: {
    marginLeft: 8,
    color: Colors.primary[500],
    fontWeight: "500",
  },
  filesList: {
    flex: 1,
  },
  emptyFiles: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyFilesText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.secondary,
    marginTop: 16,
  },
  emptyFilesSubtext: {
    fontSize: 14,
    color: Colors.text.tertiary,
    marginTop: 8,
  },
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: Colors.background.primary,
    borderRadius: 12,
    marginBottom: 12,
    ...Shadows.sm,
  },
  fileThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: Colors.neutral[100],
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  fileDate: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  fileActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: Colors.neutral[100],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: Colors.background.primary,
    borderRadius: 12,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  previewContainer: {
    padding: 16,
  },
  previewImage: {
    width: "100%",
    height: 400,
    borderRadius: 8,
  },
  notePreview: {
    padding: 16,
  },
  noteTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 16,
  },
  noteContent: {
    fontSize: 16,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  pdfPreview: {
    alignItems: "center",
    padding: 40,
  },
  pdfText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
    marginTop: 16,
    textAlign: "center",
  },
});
