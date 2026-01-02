// app/(tabs)/index.tsx - Updated Dashboard with disposed status
import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import api from "../../services/api";
import {
  Bell,
  Search,
  Calendar,
  FileText,
  TrendingUp,
  Users,
  Clock,
  Scale,
  Plus,
  ArrowRight,
  AlertCircle,
  CheckCircle,
} from "lucide-react-native";
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
  Shadows,
} from "../../constants/theme";

const { width } = Dimensions.get("window");

interface DashboardStats {
  total: number;
  active: number;
  thisWeek: number;
  pending: number;
  hearing: number;
  disposed: number;
}

interface UpcomingHearing {
  _id: string;
  title: string;
  caseNo: string;
  courtName: string;
  nextHearing: string;
  type: string;
  status: string;
}

interface Activity {
  id: string;
  title: string;
  action: string;
  timestamp: string;
  type: string;
}

interface MonthlyMetrics {
  casesWon: number;
  hearings: number;
  pending: number;
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    active: 0,
    thisWeek: 0,
    pending: 0,
    hearing: 0,
    disposed: 0,
  });
  const [upcomingHearings, setUpcomingHearings] = useState<UpcomingHearing[]>(
    []
  );
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [monthlyMetrics, setMonthlyMetrics] = useState<MonthlyMetrics>({
    casesWon: 0,
    hearings: 0,
    pending: 0,
  });

  useEffect(() => {
    fetchDashboardData();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all dashboard data in parallel
      const [statsRes, hearingsRes, activityRes, metricsRes] =
        await Promise.all([
          api.get("/dashboard/stats"),
          api.get("/dashboard/hearings"),
          api.get("/dashboard/activity"),
          api.get("/dashboard/metrics"),
        ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      if (hearingsRes.data.success) {
        setUpcomingHearings(hearingsRes.data.data);
      }

      if (activityRes.data.success) {
        setRecentActivity(activityRes.data.data);
      }

      if (metricsRes.data.success) {
        setMonthlyMetrics(metricsRes.data.data);
      }
    } catch (error: any) {
      console.error("Dashboard data fetch error:", error);
      Alert.alert("Error", "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "disposed":
        return CheckCircle;
      case "hearing":
        return Scale;
      case "pending":
        return Clock;
      default:
        return FileText;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "disposed":
        return Colors.success.main;
      case "hearing":
        return Colors.info.main;
      case "pending":
        return Colors.warning.main;
      default:
        return Colors.primary[500];
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return past.toLocaleDateString();
  };

  const QuickAction = ({
    icon: Icon,
    title,
    subtitle,
    onPress,
    gradient,
  }: any) => (
    <TouchableOpacity
      style={styles.quickAction}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <LinearGradient colors={gradient} style={styles.quickActionGradient}>
        <Icon size={24} color="#fff" />
      </LinearGradient>
      <Text style={styles.quickActionTitle}>{title}</Text>
      <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );

  const ActivityItem = ({ item }: { item: Activity }) => {
    const Icon = getActivityIcon(item.type);
    const color = getActivityColor(item.type);

    return (
      <TouchableOpacity
        style={styles.activityItem}
        onPress={() => router.push(`/cases/${item.id}` as any)}
      >
        <View style={[styles.activityIcon, { backgroundColor: `${color}20` }]}>
          <Icon size={18} color={color} />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityTitle}>{item.action}</Text>
          <Text style={styles.activitySubtitle}>{item.title}</Text>
          <Text style={styles.activityTime}>
            {formatTimeAgo(item.timestamp)}
          </Text>
        </View>
        <ArrowRight size={18} color={Colors.text.tertiary} />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[Colors.primary[500]]}
          tintColor={Colors.primary[500]}
        />
      }
    >
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name || "User"}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerActionBtn}
              onPress={() => router.push("/cases" as any)}
            >
              <Search size={22} color={Colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerActionBtn}>
              <Bell size={22} color={Colors.text.primary} />
              {stats.hearing > 0 && <View style={styles.notificationBadge} />}
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Stats Overview */}
      <Animated.View
        style={[
          styles.statsContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={[Colors.primary[500], Colors.primary[600]]}
          style={styles.statsCard}
        >
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.active}</Text>
              <Text style={styles.statLabel}>Active Cases</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.thisWeek}</Text>
              <Text style={styles.statLabel}>This Week</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total Cases</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => router.push("/cases" as any)}
          >
            <Text style={styles.viewAllText}>View All Cases</Text>
            <ArrowRight size={16} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>

      {/* Upcoming Hearings */}
      {upcomingHearings.length > 0 && (
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Hearings</Text>
            <TouchableOpacity onPress={() => router.push("/cases" as any)}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {upcomingHearings.slice(0, 3).map((hearing) => {
            const hearingDate = new Date(hearing.nextHearing);
            const day = hearingDate.getDate();
            const month = hearingDate
              .toLocaleDateString("en-US", { month: "short" })
              .toUpperCase();
            const time = hearingDate.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            });

            return (
              <TouchableOpacity
                key={hearing._id}
                style={styles.hearingCard}
                onPress={() => router.push(`/cases/${hearing._id}` as any)}
              >
                <View style={styles.hearingHeader}>
                  <View style={styles.hearingDateBox}>
                    <Text style={styles.hearingDay}>{day}</Text>
                    <Text style={styles.hearingMonth}>{month}</Text>
                  </View>
                  <View style={styles.hearingInfo}>
                    <Text style={styles.hearingTitle} numberOfLines={1}>
                      {hearing.title}
                    </Text>
                    <View style={styles.hearingMeta}>
                      <Clock size={14} color={Colors.text.tertiary} />
                      <Text style={styles.hearingTime}>{time}</Text>
                    </View>
                  </View>
                  <View style={styles.urgentBadge}>
                    <AlertCircle size={14} color={Colors.warning.main} />
                  </View>
                </View>
                <View style={styles.hearingFooter}>
                  <View style={styles.hearingDetail}>
                    <Scale size={14} color={Colors.text.tertiary} />
                    <Text style={styles.hearingDetailText} numberOfLines={1}>
                      {hearing.courtName}
                    </Text>
                  </View>
                  <View style={styles.hearingDetail}>
                    <FileText size={14} color={Colors.text.tertiary} />
                    <Text style={styles.hearingDetailText}>{hearing.type}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      )}

      {/* Quick Actions */}
      <Animated.View
        style={[
          styles.section,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <QuickAction
            icon={Plus}
            title="New Case"
            subtitle="Add case"
            gradient={[Colors.primary[500], Colors.primary[600]]}
            onPress={() => router.push("/add-case")}
          />
          <QuickAction
            icon={Search}
            title="Search"
            subtitle="Find cases"
            gradient={[Colors.info.main, Colors.info.dark]}
            onPress={() => router.push("/cases" as any)}
          />
          <QuickAction
            icon={Calendar}
            title="Calendar"
            subtitle={`${stats.hearing} hearings`}
            gradient={[Colors.warning.main, Colors.warning.dark]}
            onPress={() => router.push("/calendar" as any)}
          />
          <QuickAction
            icon={FileText}
            title="Cases"
            subtitle={`${stats.total} total`}
            gradient={[Colors.success.main, Colors.success.dark]}
            onPress={() => router.push("/cases" as any)}
          />
        </View>
      </Animated.View>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => router.push("/cases" as any)}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.activityList}>
            {recentActivity.slice(0, 3).map((activity) => (
              <ActivityItem key={activity.id} item={activity} />
            ))}
          </View>
        </Animated.View>
      )}

      {/* Performance Metrics */}
      <Animated.View
        style={[
          styles.section,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <Text style={styles.sectionTitle}>This Month</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View
              style={[
                styles.metricIcon,
                { backgroundColor: Colors.success.light },
              ]}
            >
              <TrendingUp size={20} color={Colors.success.main} />
            </View>
            <Text style={styles.metricValue}>{monthlyMetrics.casesWon}</Text>
            <Text style={styles.metricLabel}>Cases Won</Text>
          </View>

          <View style={styles.metricCard}>
            <View
              style={[
                styles.metricIcon,
                { backgroundColor: Colors.info.light },
              ]}
            >
              <Calendar size={20} color={Colors.info.main} />
            </View>
            <Text style={styles.metricValue}>{monthlyMetrics.hearings}</Text>
            <Text style={styles.metricLabel}>Hearings</Text>
          </View>

          <View style={styles.metricCard}>
            <View
              style={[
                styles.metricIcon,
                { backgroundColor: Colors.warning.light },
              ]}
            >
              <Clock size={20} color={Colors.warning.main} />
            </View>
            <Text style={styles.metricValue}>{monthlyMetrics.pending}</Text>
            <Text style={styles.metricLabel}>Pending</Text>
          </View>
        </View>
      </Animated.View>

      {/* Empty State */}
      {stats.total === 0 && (
        <View style={styles.emptyState}>
          <Scale size={80} color={Colors.neutral[300]} />
          <Text style={styles.emptyTitle}>No Cases Yet</Text>
          <Text style={styles.emptySubtitle}>
            Start by adding your first case to get started
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => router.push("/add-case")}
          >
            <Plus size={20} color="#fff" />
            <Text style={styles.emptyButtonText}>Add First Case</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
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
    padding: Spacing.lg,
    paddingTop: Spacing.xxxl + 20,
    backgroundColor: Colors.background.primary,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  userName: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  headerActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  headerActionBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background.secondary,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error.main,
  },
  statsContainer: {
    padding: Spacing.lg,
  },
  statsCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.lg,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: "#fff",
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: BorderRadius.full,
    alignSelf: "center",
  },
  viewAllText: {
    fontSize: Typography.fontSize.sm,
    color: "#fff",
    fontWeight: Typography.fontWeight.semibold,
  },
  section: {
    padding: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  seeAllText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary[500],
    fontWeight: Typography.fontWeight.semibold,
  },
  hearingCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  hearingHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  hearingDateBox: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary[50],
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  hearingDay: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary[500],
  },
  hearingMonth: {
    fontSize: Typography.fontSize.xs,
    color: Colors.primary[500],
    fontWeight: Typography.fontWeight.semibold,
  },
  hearingInfo: {
    flex: 1,
  },
  hearingTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  hearingMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  hearingTime: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
  },
  urgentBadge: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.warning.light,
    justifyContent: "center",
    alignItems: "center",
  },
  hearingFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
    gap: Spacing.sm,
  },
  hearingDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    flex: 1,
  },
  hearingDetailText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    flex: 1,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  quickAction: {
    width: (width - Spacing.lg * 2 - Spacing.md) / 2,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: "center",
    ...Shadows.sm,
  },
  quickActionGradient: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  quickActionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  quickActionSubtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
    textAlign: "center",
  },
  activityList: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xs,
    ...Shadows.sm,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
  },
  metricsGrid: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: "center",
    ...Shadows.sm,
  },
  metricIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  metricValue: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  metricLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    textAlign: "center",
  },
  emptyState: {
    alignItems: "center",
    padding: Spacing.xxxl,
    marginTop: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: Colors.primary[500],
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
});
