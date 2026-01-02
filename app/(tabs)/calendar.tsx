// app/(tabs)/calendar.tsx - Professional Calendar Screen with Real Case Data
import { LinearGradient } from "expo-linear-gradient";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Scale,
  X,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from "../../constants/theme";
import { casesAPI } from "../../services/api";

interface Case {
  _id: string;
  title: string;
  caseNo: string;
  type: string;
  courtName: string;
  nextHearing: string;
  status: string;
}

interface MarkedDates {
  [date: string]: {
    marked: boolean;
    dotColor: string;
    selected?: boolean;
    selectedColor?: string;
  };
}

export default function CalendarScreen() {
  const router = useRouter();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [selectedDateCases, setSelectedDateCases] = useState<Case[]>([]);
  const [showCasesModal, setShowCasesModal] = useState(false);

  useEffect(() => {
    fetchCases();
    requestNotificationPermissions();
  }, []);

  const requestNotificationPermissions = async () => {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Notification permissions not granted");
    }
  };

  const fetchCases = async () => {
    try {
      setLoading(true);
      const response = await casesAPI.getAll();
      if (response.success) {
        setCases(response.data);
        processMarkedDates(response.data);
        scheduleNotifications(response.data);
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

  const processMarkedDates = (casesData: Case[]) => {
    const marked: MarkedDates = {};

    casesData.forEach((caseItem) => {
      const date = new Date(caseItem.nextHearing).toISOString().split("T")[0];
      const color =
        caseItem.status === "hearing"
          ? Colors.warning.main
          : caseItem.status === "disposed"
          ? Colors.success.main
          : Colors.warning.main;

      if (!marked[date]) {
        marked[date] = {
          marked: true,
          dotColor: color,
        };
      }
    });

    setMarkedDates(marked);
  };

  const scheduleNotifications = async (casesData: Case[]) => {
    // Cancel all existing notifications first
    await Notifications.cancelAllScheduledNotificationsAsync();

    const now = new Date();

    casesData.forEach(async (caseItem) => {
      const hearingDate = new Date(caseItem.nextHearing);

      // Only schedule for future dates
      if (hearingDate > now) {
        // Schedule notification 1 day before
        const oneDayBefore = new Date(hearingDate);
        oneDayBefore.setDate(oneDayBefore.getDate() - 1);
        oneDayBefore.setHours(9, 0, 0, 0);

        if (oneDayBefore > now) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Case Hearing Tomorrow 📋",
              body: `${caseItem.title} - ${caseItem.courtName}`,
              data: { caseId: caseItem._id },
              sound: true,
            },
            trigger: {
              seconds: Math.floor(
                (oneDayBefore.getTime() - now.getTime()) / 1000
              ),
            },
          });
        }

        // Schedule notification on hearing day
        const hearingDay = new Date(hearingDate);
        hearingDay.setHours(7, 0, 0, 0);

        if (hearingDay > now) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Case Hearing Today! ⚖️",
              body: `${caseItem.title} at ${caseItem.courtName}`,
              data: { caseId: caseItem._id },
              sound: true,
            },
            trigger: {
              seconds: Math.floor(
                (hearingDay.getTime() - now.getTime()) / 1000
              ),
            },
          });
        }
      }
    });
  };

  const onDayPress = (day: any) => {
    const dateStr = day.dateString;
    setSelectedDate(dateStr);

    // Update marked dates to show selection
    const updatedMarked = { ...markedDates };
    Object.keys(updatedMarked).forEach((key) => {
      if (updatedMarked[key]) {
        updatedMarked[key].selected = key === dateStr;
        updatedMarked[key].selectedColor =
          key === dateStr ? Colors.primary[500] : undefined;
      }
    });

    if (!updatedMarked[dateStr]) {
      updatedMarked[dateStr] = {
        marked: false,
        dotColor: Colors.primary[500],
        selected: true,
        selectedColor: Colors.primary[500],
      };
    }

    setMarkedDates(updatedMarked);

    // Filter cases for selected date
    const casesOnDate = cases.filter((c) => {
      const caseDate = new Date(c.nextHearing).toISOString().split("T")[0];
      return caseDate === dateStr;
    });

    setSelectedDateCases(casesOnDate);

    if (casesOnDate.length > 0) {
      setShowCasesModal(true);
    } else {
      Alert.alert(
        "No Cases on This Date",
        "Would you like to add a case for this date?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Add Case",
            onPress: () => router.push("/add-case"),
          },
        ]
      );
    }
  };

  const getStatusColor = (status: string) => {
    if (status === "disposed") return Colors.success.main;
    if (status === "hearing") return Colors.warning.main;
    if (status === "pending") return Colors.warning.main;
    return Colors.neutral[500];
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
        <Text style={styles.loadingText}>Loading calendar...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.primary[500], Colors.primary[600]]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Calendar</Text>
        <Text style={styles.headerSubtitle}>
          Track your case hearings and schedule
        </Text>
      </LinearGradient>

      <ScrollView
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
        {/* Calendar */}
        <View style={styles.calendarContainer}>
          <Calendar
            markedDates={markedDates}
            onDayPress={onDayPress}
            theme={{
              calendarBackground: Colors.background.primary,
              textSectionTitleColor: Colors.text.secondary,
              selectedDayBackgroundColor: Colors.primary[500],
              selectedDayTextColor: "#ffffff",
              todayTextColor: Colors.primary[500],
              dayTextColor: Colors.text.primary,
              textDisabledColor: Colors.neutral[300],
              dotColor: Colors.primary[500],
              selectedDotColor: "#ffffff",
              arrowColor: Colors.primary[500],
              monthTextColor: Colors.text.primary,
              textDayFontFamily: "System",
              textMonthFontFamily: "System",
              textDayHeaderFontFamily: "System",
              textDayFontSize: 14,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 12,
            }}
            renderArrow={(direction) =>
              direction === "left" ? (
                <ChevronLeft size={24} color={Colors.primary[500]} />
              ) : (
                <ChevronRight size={24} color={Colors.primary[500]} />
              )
            }
          />
        </View>

        {/* Legend */}
        <View style={styles.legendContainer}>
          <Text style={styles.legendTitle}>Legend</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: Colors.warning.main },
                ]}
              />
              <Text style={styles.legendText}>Pending/Hearing</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: Colors.success.main },
                ]}
              />
              <Text style={styles.legendText}>Disposed</Text>
            </View>
          </View>
        </View>

        {/* Upcoming Hearings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Hearings</Text>
          {cases
            .filter((c) => new Date(c.nextHearing) >= new Date())
            .sort(
              (a, b) =>
                new Date(a.nextHearing).getTime() -
                new Date(b.nextHearing).getTime()
            )
            .slice(0, 5)
            .map((caseItem) => (
              <TouchableOpacity
                key={caseItem._id}
                style={styles.hearingCard}
                onPress={() => router.push(`/cases/${caseItem._id}` as any)}
              >
                <View style={styles.hearingHeader}>
                  <View
                    style={[
                      styles.statusIndicator,
                      {
                        backgroundColor: `${getStatusColor(caseItem.status)}20`,
                      },
                    ]}
                  >
                    <Scale size={16} color={getStatusColor(caseItem.status)} />
                  </View>
                  <View style={styles.hearingInfo}>
                    <Text style={styles.hearingTitle} numberOfLines={1}>
                      {caseItem.title}
                    </Text>
                    <Text style={styles.hearingCaseNo}>{caseItem.caseNo}</Text>
                  </View>
                </View>
                <View style={styles.hearingDetails}>
                  <View style={styles.hearingDetail}>
                    <Clock size={14} color={Colors.text.tertiary} />
                    <Text style={styles.hearingDetailText}>
                      {new Date(caseItem.nextHearing).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.hearingDetail}>
                    <Scale size={14} color={Colors.text.tertiary} />
                    <Text style={styles.hearingDetailText} numberOfLines={1}>
                      {caseItem.courtName}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
        </View>
      </ScrollView>

      {/* Cases Modal */}
      <Modal
        visible={showCasesModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCasesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cases on {selectedDate}</Text>
              <TouchableOpacity onPress={() => setShowCasesModal(false)}>
                <X size={24} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {selectedDateCases.map((caseItem) => (
                <TouchableOpacity
                  key={caseItem._id}
                  style={styles.modalCaseItem}
                  onPress={() => {
                    setShowCasesModal(false);
                    router.push(`/cases/${caseItem._id}` as any);
                  }}
                >
                  <View style={styles.modalCaseHeader}>
                    <Text style={styles.modalCaseTitle} numberOfLines={1}>
                      {caseItem.title}
                    </Text>
                    <View
                      style={[
                        styles.modalStatusBadge,
                        {
                          backgroundColor: `${getStatusColor(
                            caseItem.status
                          )}20`,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.modalStatusText,
                          { color: getStatusColor(caseItem.status) },
                        ]}
                      >
                        {caseItem.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.modalCaseNo}>{caseItem.caseNo}</Text>
                  <Text style={styles.modalCaseCourt} numberOfLines={1}>
                    {caseItem.courtName}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* FAB */}
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
  },
  calendarContainer: {
    margin: Spacing.lg,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    ...Shadows.md,
  },
  legendContainer: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  legendTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  legendItems: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  section: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  hearingCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  hearingHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  statusIndicator: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  hearingInfo: {
    flex: 1,
  },
  hearingTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  hearingCaseNo: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
  },
  hearingDetails: {
    flexDirection: "row",
    gap: Spacing.md,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.background.primary,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  modalTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  modalList: {
    padding: Spacing.lg,
  },
  modalCaseItem: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  modalCaseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  modalCaseTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  modalStatusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  modalStatusText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: "uppercase",
  },
  modalCaseNo: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  modalCaseCourt: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
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
