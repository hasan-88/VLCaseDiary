// app/components/FileUploadSection.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Camera, Upload, FileText, X, Eye, Trash2, Edit } from 'lucide-react-native';
import { casesAPI, imagePickerHelper, getFileUrl } from '../../services/api';

interface FileUploadSectionProps {
  caseId: string;
  sectionType: string;
  sectionTitle: string;
  files: any[];
  onRefresh: () => void;
}

export default function FileUploadSection({
  caseId,
  sectionType,
  sectionTitle,
  files,
  onRefresh,
}: FileUploadSectionProps) {
  const [uploading, setUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleUploadOptions = () => {
    Alert.alert(
      'Upload File',
      'Choose upload method',
      [
        {
          text: 'Take Photo',
          onPress: handleTakePhoto,
        },
        {
          text: 'Choose from Gallery',
          onPress: handlePickImage,
        },
        {
          text: 'Upload Document',
          onPress: handlePickDocument,
        },
        {
          text: 'Create Note',
          onPress: handleCreateNote,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handleTakePhoto = async () => {
    try {
      const photo = await imagePickerHelper.takePhoto();
      if (photo) {
        await uploadFiles([photo]);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to take photo');
    }
  };

  const handlePickImage = async () => {
    try {
      const images = await imagePickerHelper.pickImage(true);
      if (images && images.length > 0) {
        await uploadFiles(images);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to pick images');
    }
  };

  const handlePickDocument = async () => {
    try {
      const doc = await imagePickerHelper.pickDocument();
      if (doc) {
        await uploadFiles([doc]);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to pick document');
    }
  };

  const uploadFiles = async (filesList: any[]) => {
    try {
      setUploading(true);
      await casesAPI.uploadFiles(caseId, filesList, sectionType);
      Alert.alert('Success', 'Files uploaded successfully!');
      onRefresh();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateNote = () => {
    Alert.prompt(
      'Create Note',
      'Enter note title',
      async (title) => {
        if (title && title.trim()) {
          try {
            setUploading(true);
            await casesAPI.createNote(caseId, sectionType, title.trim());
            Alert.alert('Success', 'Note created successfully!');
            onRefresh();
          } catch (error: any) {
            Alert.alert('Error', 'Failed to create note');
          } finally {
            setUploading(false);
          }
        }
      }
    );
  };

  const handleDeleteFile = (item: any) => {
    Alert.alert(
      'Delete File',
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const fileId = item.type === 'file' ? item.fileId._id : item.noteId._id;
              await casesAPI.deleteFile(caseId, fileId);
              Alert.alert('Success', 'File deleted successfully!');
              onRefresh();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete file');
            }
          },
        },
      ]
    );
  };

  const handlePreview = (item: any) => {
    setPreviewFile(item);
    setShowPreview(true);
  };

  const renderFileIcon = (item: any) => {
    if (item.type === 'file' && item.fileId?.mimetype?.startsWith('image/')) {
      return (
        <Image
          source={{ uri: getFileUrl(item.fileId.url) }}
          style={styles.thumbnailImage}
        />
      );
    }
    if (item.type === 'note') {
      return <FileText size={40} color="#8b7355" />;
    }
    return <FileText size={40} color="#dc2626" />;
  };

  if (files.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Camera size={64} color="#ccc" />
        <Text style={styles.emptyText}>No files uploaded yet</Text>
        <Text style={styles.emptySubtext}>
          Take photos, upload documents, or create notes
        </Text>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handleUploadOptions}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Upload size={20} color="#fff" />
              <Text style={styles.uploadButtonText}>Upload Files</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {uploading && (
        <View style={styles.uploadingBanner}>
          <ActivityIndicator color="#8b7355" />
          <Text style={styles.uploadingText}>Uploading...</Text>
        </View>
      )}

      <ScrollView style={styles.filesList} showsVerticalScrollIndicator={false}>
        {files.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.fileItem}
            onPress={() => handlePreview(item)}
          >
            <View style={styles.fileThumbnail}>{renderFileIcon(item)}</View>
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
                <Eye size={20} color="#3b82f6" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDeleteFile(item)}
              >
                <Trash2 size={20} color="#dc2626" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={handleUploadOptions}
        disabled={uploading}
      >
        <Camera size={24} color="#fff" />
      </TouchableOpacity>

      {/* Preview Modal */}
      <Modal
        visible={showPreview}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPreview(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Preview</Text>
              <TouchableOpacity onPress={() => setShowPreview(false)}>
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>
            {previewFile && (
              <ScrollView style={styles.previewContainer}>
                {previewFile.type === 'file' &&
                previewFile.fileId?.mimetype?.startsWith('image/') ? (
                  <Image
                    source={{ uri: getFileUrl(previewFile.fileId.url) }}
                    style={styles.previewImage}
                    resizeMode="contain"
                  />
                ) : previewFile.type === 'note' ? (
                  <View style={styles.notePreview}>
                    <Text style={styles.noteTitle}>{previewFile.name}</Text>
                    <Text style={styles.noteContent}>
                      {previewFile.noteId?.content || 'No content'}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.pdfPreview}>
                    <FileText size={80} color="#dc2626" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#8b7355',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    marginBottom: 16,
  },
  uploadingText: {
    marginLeft: 8,
    color: '#1e40af',
    fontWeight: '500',
  },
  filesList: {
    flex: 1,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fileThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  fileDate: {
    fontSize: 12,
    color: '#666',
  },
  fileActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#8b7355',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  previewContainer: {
    padding: 16,
  },
  previewImage: {
    width: '100%',
    height: 400,
    borderRadius: 8,
  },
  notePreview: {
    padding: 16,
  },
  noteTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  noteContent: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  pdfPreview: {
    alignItems: 'center',
    padding: 40,
  },
  pdfText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
});