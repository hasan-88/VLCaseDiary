import axios from "axios";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";

// API configuration - UPDATE THIS WITH YOUR SERVER IP
const API_URL = "http://192.168.100.201:5000/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error getting token:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || error.message;
      console.error("API Error:", message);
      return Promise.reject(new Error(message));
    } else if (error.request) {
      // Request made but no response
      console.error("Network Error:", error.message);
      return Promise.reject(
        new Error("Network error. Please check your connection.")
      );
    } else {
      // Something else happened
      console.error("Error:", error.message);
      return Promise.reject(error);
    }
  }
);

// ==================== AUTH API ====================
export const authAPI = {
  // Login
  login: async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  // Register
  register: async (name: string, email: string, password: string) => {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
    });
    return response.data;
  },

  // Get profile
  getProfile: async () => {
    const response = await api.get("/auth/profile");
    return response.data;
  },
};

// ==================== DASHBOARD API ====================
export const dashboardAPI = {
  // Get dashboard statistics
  getStats: async () => {
    const response = await api.get("/dashboard/stats");
    return response.data;
  },

  // Get upcoming hearings
  getUpcomingHearings: async () => {
    const response = await api.get("/dashboard/hearings");
    return response.data;
  },

  // Get recent activity
  getRecentActivity: async () => {
    const response = await api.get("/dashboard/activity");
    return response.data;
  },

  // Get monthly metrics
  getMonthlyMetrics: async () => {
    const response = await api.get("/dashboard/metrics");
    return response.data;
  },
};

// ==================== CASES API ====================
export const casesAPI = {
  // Get all cases
  getAll: async (page: number = 1, limit: number = 100) => {
    const response = await api.get(`/cases?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get case by ID
  get: async (caseId: string) => {
    const response = await api.get(`/cases/${caseId}`);
    return response.data;
  },

  // Create case
  create: async (caseData: any) => {
    const response = await api.post("/cases", caseData);
    return response.data;
  },

  // Update case
  update: async (caseId: string, caseData: any) => {
    const response = await api.put(`/cases/${caseId}`, caseData);
    return response.data;
  },

  // Delete case
  delete: async (caseId: string) => {
    const response = await api.delete(`/cases/${caseId}`);
    return response.data;
  },

  // Update case status
  updateStatus: async (caseId: string, status: string) => {
    const response = await api.patch(`/cases/${caseId}/status`, { status });
    return response.data;
  },

  // Search cases
  search: async (query: string) => {
    const response = await api.get(
      `/cases/search?query=${encodeURIComponent(query)}`
    );
    return response.data;
  },

  // Get case sections
  getSections: async (caseId: string, section?: string) => {
    const url = section
      ? `/cases/${caseId}/sections?section=${section}`
      : `/cases/${caseId}/sections`;
    const response = await api.get(url);
    return response.data;
  },

  // Upload files with camera/gallery support
  uploadFiles: async (caseId: string, files: any[], sectionType: string) => {
    const formData = new FormData();

    files.forEach((file, index) => {
      const fileToUpload: any = {
        uri: file.uri,
        type: file.mimeType || file.type || "image/jpeg",
        name: file.fileName || file.name || `file-${Date.now()}-${index}.jpg`,
      };

      formData.append("files", fileToUpload);
    });

    formData.append("sectionType", sectionType);

    const response = await api.post(`/cases/${caseId}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 60000, // Increased timeout for file uploads
    });

    return response.data;
  },

  // Delete file from case
  deleteFile: async (caseId: string, fileId: string) => {
    const response = await api.delete(`/cases/${caseId}/files/${fileId}`);
    return response.data;
  },

  // Create note in case section
  createNote: async (
    caseId: string,
    sectionType: string,
    title: string,
    content: string = ""
  ) => {
    const response = await api.post(`/cases/${caseId}/notes`, {
      sectionType,
      title,
      content,
    });
    return response.data;
  },
};

// ==================== NOTES API ====================
export const notesAPI = {
  // Get all notes
  getAll: async () => {
    const response = await api.get("/notes");
    return response.data;
  },

  // Get single note
  get: async (noteId: string) => {
    const response = await api.get(`/notes/${noteId}`);
    return response.data;
  },

  // Create note
  create: async (title: string, content: string) => {
    const response = await api.post("/notes", { title, content });
    return response.data;
  },

  // Update note
  update: async (noteId: string, title: string, content: string) => {
    const response = await api.put(`/notes/${noteId}`, { title, content });
    return response.data;
  },

  // Delete note
  delete: async (noteId: string) => {
    const response = await api.delete(`/notes/${noteId}`);
    return response.data;
  },
};

// ==================== IMAGE PICKER HELPER ====================
export const imagePickerHelper = {
  // Request camera permissions
  requestCameraPermission: async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === "granted";
  },

  // Request media library permissions
  requestMediaLibraryPermission: async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === "granted";
  },

  // Take photo with camera
  takePhoto: async () => {
    const hasPermission = await imagePickerHelper.requestCameraPermission();
    if (!hasPermission) {
      throw new Error("Camera permission denied");
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets[0]) {
      return result.assets[0];
    }
    return null;
  },

  // Pick image from gallery
  pickImage: async (multiple = false) => {
    const hasPermission =
      await imagePickerHelper.requestMediaLibraryPermission();
    if (!hasPermission) {
      throw new Error("Media library permission denied");
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsMultipleSelection: multiple,
    });

    if (!result.canceled) {
      return result.assets;
    }
    return null;
  },

  // Pick document (PDF, etc)
  pickDocument: async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/*"],
      multiple: false,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const asset = result.assets[0];
      return {
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType,
        size: asset.size,
      };
    }
    return null;
  },
};

// File helper to get full URL
export const getFileUrl = (relativePath: string) => {
  if (!relativePath) return "";
  if (relativePath.startsWith("http")) return relativePath;
  return `${API_URL.replace("/api", "")}${relativePath}`;
};

export default api;
