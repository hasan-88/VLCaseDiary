// app/(tabs)/cases.tsx - Updated with "disposed" status
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  TextInput,
  Alert,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { casesAPI } from "../../services/api";
import {
  Search,
  Plus,
  Clock,
  CheckCircle,
  Scale,
  Trash2,
  Eye,
  Filter,
  Calendar,
  User,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
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
  partyName: string;
  respondent: string;
  status: "pending" | "disposed" | "hearing";
  nextHearing: string;
  createdAt: string;
}

export default function CasesScreen() {
  const router = useRouter();
  const [cases, setCases] = useState<Case[]>([]);
  const [filteredCases, setFilteredCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchCases();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    filterCases();
  }, [searchQuery, filterStatus, cases]);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const response = await casesAPI.getAll();
      if (response.success) {
        setCases(response.data);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to fetch cases");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCases();
    setRefreshing(false);
  }, []);

  const filterCases = () => {
    let filtered = cases;

    if (filterStatus !== "all") {
      filtered = filtered.filter((c) => c.status === filterStatus);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.caseNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.partyName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredCases(filtered);
  };

  const handleDelete = async (id: string, title: string) => {
    Alert.alert("Delete Case", `Are you sure you want to delete "${title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await casesAPI.delete(id);
            Alert.alert("Success", "Case deleted successfully");
            fetchCases();
          } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to delete case");
          }
        },
      },
    ]);
  };

  const getStatusColor = (status: string) => {
    return (
      Colors.status[status as keyof typeof Colors.status] || Colors.neutral[500]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return Clock;
      case "disposed":
        return CheckCircle;
      case "hearing":
        return Scale;
      default:
        return Clock;
    }
  };

  const getStatCount = (status: string) => {
    return cases.filter((c) => c.status === status).length;
  };

  const renderCase = ({ item, index }: { item: Case; index: number }) => {
    const StatusIcon = getStatusIcon(item.status);
    const statusColor = getStatusColor(item.status);
    const animValue = new Animated.Value(0);

    Animated.timing(animValue, {
      toValue: 1,
      duration: 300,
      delay: index * 50,
      useNativeDriver: true,
    }).start();

    return (
      <Animated.View
        style={[
          styles.caseCard,
          {
            opacity: animValue,
            transform: [
              {
                translateY: animValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.push(`/cases/${item._id}`)}
          activeOpacity={0.7}
        >
          {/* Card Header */}
          <View style={styles.caseCardHeader}>
            <View style={styles.caseHeaderLeft}>
              <View
                style={[
                  styles.statusIndicator,
                  { backgroundColor: `${statusColor}20` },
                ]}
              >
                <StatusIcon size={16} color={statusColor} />
              </View>
              <View style={styles.caseTitleContainer}>
                <Text style={styles.caseTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.caseNo}>{item.caseNo}</Text>
              </View>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: `${statusColor}15` },
              ]}
            >
              <Text style={[styles.statusText, { color: statusColor }]}>
                {item.status}
              </Text>
            </View>
          </View>

          {/* Card Content */}
          <View style={styles.caseCardContent}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Scale size={14} color={Colors.text.tertiary} />
                <Text style={styles.infoLabel}>{item.type}</Text>
              </View>
              <View style={styles.infoItem}>
                <User size={14} color={Colors.text.tertiary} />
                <Text style={styles.infoLabel} numberOfLines={1}>
                  {item.partyName}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Calendar size={14} color={Colors.text.tertiary} />
                <Text style={styles.infoLabel}>
                  {new Date(item.nextHearing).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>

          {/* Card Footer */}
          <View style={styles.caseCardFooter}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push(`/cases/${item._id}`)}
            >
              <Eye size={16} color={Colors.primary[500]} />
              <Text style={styles.actionButtonText}>View Details</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item._id, item.title)}
            >
              <Trash2 size={16} color={Colors.error.main} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
        <Text style={styles.loadingText}>Loading cases...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Stats */}
      <LinearGradient
        colors={[Colors.primary[500], Colors.primary[600]]}
        style={styles.header}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.headerTitle}>My Cases</Text>
          <Text style={styles.headerSubtitle}>
            Manage and track all your legal cases
          </Text>

          {/* Stats Cards */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{cases.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{getStatCount("pending")}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{getStatCount("hearing")}</Text>
              <Text style={styles.statLabel}>Hearing</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{getStatCount("disposed")}</Text>
              <Text style={styles.statLabel}>Disposed</Text>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Search and Filter */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.text.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search cases..."
            placeholderTextColor={Colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.filterContainer}>
          <Filter size={16} color={Colors.text.secondary} />
          <Text style={styles.filterLabel}>Filter:</Text>
          <View style={styles.filterChips}>
            {["all", "pending", "hearing", "disposed"].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterChip,
                  filterStatus === status && styles.filterChipActive,
                ]}
                onPress={() => setFilterStatus(status)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterStatus === status && styles.filterChipTextActive,
                  ]}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Cases List */}
      <FlatList
        data={filteredCases}
        renderItem={renderCase}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary[500]]}
            tintColor={Colors.primary[500]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Scale size={80} color={Colors.neutral[300]} />
            <Text style={styles.emptyText}>No cases found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || filterStatus !== "all"
                ? "Try adjusting your filters"
                : "Add your first case to get started"}
            </Text>
          </View>
        }
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/add-case")}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[Colors.primary[500], Colors.primary[600]]}
          style={styles.fabGradient}
        >
          <Plus size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

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
  header: {
    paddingTop: Spacing.xxxl + 20,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: "#fff",
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: "center",
  },
  statNumber: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: "#fff",
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: "rgba(255, 255, 255, 0.9)",
  },
  searchSection: {
    padding: Spacing.lg,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingLeft: Spacing.sm,
    fontSize: Typography.fontSize.md,
    color: Colors.text.primary,
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  filterLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeight.medium,
  },
  filterChips: {
    flexDirection: "row",
    gap: Spacing.xs,
    flex: 1,
    flexWrap: "wrap",
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  filterChipActive: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  filterChipText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeight.medium,
  },
  filterChipTextActive: {
    color: "#fff",
  },
  listContainer: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  caseCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  caseCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  caseHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: Spacing.sm,
  },
  statusIndicator: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  caseTitleContainer: {
    flex: 1,
  },
  caseTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  caseNo: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: "uppercase",
  },
  caseCardContent: {
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    flex: 1,
  },
  infoLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    flex: 1,
  },
  caseCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    flex: 1,
  },
  actionButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.primary[500],
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.error.light,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: Spacing.xxxl,
  },
  emptyText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    right: Spacing.lg,
    bottom: Spacing.lg,
    borderRadius: BorderRadius.full,
    ...Shadows.xl,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
});
