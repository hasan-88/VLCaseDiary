// app/index.tsx - Landing Page (NO AUTO REDIRECT)
import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../contexts/AuthContext";
import {
  Scale,
  Shield,
  FileText,
  Users,
  ArrowRight,
  CheckCircle,
  Zap,
  Award,
} from "lucide-react-native";
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
  Shadows,
} from "../constants/theme";

const { width, height } = Dimensions.get("window");

export default function LandingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const features = [
    {
      icon: Scale,
      title: "Case Management",
      description: "Organize and track all your legal cases",
      color: Colors.primary[500],
    },
    {
      icon: FileText,
      title: "Document Storage",
      description: "Secure cloud storage for legal documents",
      color: Colors.info.main,
    },
    {
      icon: Users,
      title: "Client Portal",
      description: "Collaborate with clients seamlessly",
      color: Colors.success.main,
    },
    {
      icon: Shield,
      title: "Data Security",
      description: "Bank-level encryption for your data",
      color: Colors.warning.main,
    },
  ];

  const stats = [
    { number: "10K+", label: "Cases Managed" },
    { number: "500+", label: "Legal Professionals" },
    { number: "50+", label: "Cities Covered" },
    { number: "99%", label: "Client Satisfaction" },
  ];

  // Show loading state
  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={Colors.primary[500]} />
        <Text style={{ color: Colors.text.primary, marginTop: 10 }}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <LinearGradient
          colors={[Colors.primary[500], Colors.primary[600], "#1a1a1a"]}
          style={styles.heroSection}
        >
          <Animated.View
            style={[
              styles.heroContent,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              },
            ]}
          >
            {/* Logo */}
            <View style={styles.logoWrapper}>
              <View style={styles.logoCircle}>
                <Scale size={50} color="#fff" />
              </View>
              <View style={styles.logoGlow} />
            </View>

            <Text style={styles.heroTitle}>Voice Of Law</Text>
            <Text style={styles.heroSubtitle}>
              Pakistan's Premier Legal Management Platform
            </Text>

            {/* Feature Highlights */}
            <View style={styles.highlightsRow}>
              <View style={styles.highlight}>
                <CheckCircle size={16} color={Colors.success.light} />
                <Text style={styles.highlightText}>AI-Powered</Text>
              </View>
              <View style={styles.highlight}>
                <Zap size={16} color={Colors.warning.light} />
                <Text style={styles.highlightText}>Fast & Secure</Text>
              </View>
              <View style={styles.highlight}>
                <Award size={16} color={Colors.info.light} />
                <Text style={styles.highlightText}>Trusted</Text>
              </View>
            </View>

            {/* CTA Buttons - Different for logged in vs logged out */}
            <View style={styles.ctaContainer}>
              {user ? (
                // Show "Go to Dashboard" if user is logged in
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => router.push("/(tabs)")}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={["#ffffff", "#f8f9fa"]}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.primaryButtonText}>
                      Go to Dashboard
                    </Text>
                    <ArrowRight size={20} color={Colors.primary[500]} />
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                // Show "Get Started" and "Sign In" if user is logged out
                <>
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => router.push("/auth?mode=register")}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={["#ffffff", "#f8f9fa"]}
                      style={styles.buttonGradient}
                    >
                      <Text style={styles.primaryButtonText}>Get Started</Text>
                      <ArrowRight size={20} color={Colors.primary[500]} />
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => router.push("/auth?mode=login")}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.secondaryButtonText}>Sign In</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </Animated.View>

          {/* Floating Elements */}
          <View style={styles.floatingElements}>
            <View style={[styles.floatingCircle, styles.circle1]} />
            <View style={[styles.floatingCircle, styles.circle2]} />
            <View style={[styles.floatingCircle, styles.circle3]} />
          </View>
        </LinearGradient>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Trusted by Thousands</Text>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.statCard,
                  {
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateY: slideAnim.interpolate({
                          inputRange: [0, 50],
                          outputRange: [0, 50 + index * 10],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Text style={styles.statNumber}>{stat.number}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Why Choose Voice of Law?</Text>
          <Text style={styles.sectionSubtitle}>
            Powerful features designed for legal professionals
          </Text>

          <View style={styles.featuresGrid}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.featureCard,
                    {
                      opacity: fadeAnim,
                      transform: [{ scale: scaleAnim }],
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.featureIconContainer,
                      { backgroundColor: `${feature.color}20` },
                    ]}
                  >
                    <Icon size={28} color={feature.color} />
                  </View>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>
                    {feature.description}
                  </Text>
                </Animated.View>
              );
            })}
          </View>
        </View>

        {/* CTA Section */}
        <LinearGradient
          colors={[Colors.primary[500], Colors.primary[600]]}
          style={styles.ctaSection}
        >
          <Text style={styles.ctaTitle}>Ready to Get Started?</Text>
          <Text style={styles.ctaDescription}>
            Join thousands of legal professionals managing their cases
            efficiently
          </Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() =>
              user ? router.push("/(tabs)") : router.push("/auth?mode=register")
            }
            activeOpacity={0.8}
          >
            <Text style={styles.ctaButtonText}>
              {user ? "Go to Dashboard" : "Create Free Account"}
            </Text>
            <ArrowRight size={20} color={Colors.primary[500]} />
          </TouchableOpacity>
        </LinearGradient>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2024 Voice of Law. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroSection: {
    minHeight: height * 0.75,
    paddingTop: Spacing.xxxl + 40,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    position: "relative",
    overflow: "hidden",
  },
  heroContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  logoWrapper: {
    position: "relative",
    marginBottom: Spacing.xl,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.full,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  logoGlow: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: BorderRadius.full,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    top: -10,
    left: -10,
    zIndex: -1,
  },
  heroTitle: {
    fontSize: Typography.fontSize.display,
    fontWeight: Typography.fontWeight.extrabold,
    color: "#fff",
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  heroSubtitle: {
    fontSize: Typography.fontSize.lg,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  highlightsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  highlight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: BorderRadius.full,
  },
  highlightText: {
    fontSize: Typography.fontSize.sm,
    color: "#fff",
    fontWeight: Typography.fontWeight.medium,
  },
  ctaContainer: {
    gap: Spacing.md,
    width: "100%",
  },
  primaryButton: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    ...Shadows.lg,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  primaryButtonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary[500],
  },
  secondaryButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: "#fff",
  },
  floatingElements: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
  },
  floatingCircle: {
    position: "absolute",
    borderRadius: BorderRadius.full,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  circle1: {
    width: 200,
    height: 200,
    top: -50,
    right: -50,
  },
  circle2: {
    width: 150,
    height: 150,
    bottom: 100,
    left: -30,
  },
  circle3: {
    width: 100,
    height: 100,
    top: "50%",
    right: "10%",
  },
  statsSection: {
    padding: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  sectionSubtitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  statCard: {
    width: (width - Spacing.xl * 2 - Spacing.md) / 2,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: "center",
    ...Shadows.md,
  },
  statNumber: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.extrabold,
    color: Colors.primary[500],
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    textAlign: "center",
  },
  featuresSection: {
    padding: Spacing.xl,
    paddingTop: Spacing.xxl,
  },
  featuresGrid: {
    gap: Spacing.md,
  },
  featureCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.md,
  },
  featureIconContainer: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  featureTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  featureDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.sm,
  },
  ctaSection: {
    margin: Spacing.xl,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: "center",
  },
  ctaTitle: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: "#fff",
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  ctaDescription: {
    fontSize: Typography.fontSize.md,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: "#fff",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
  },
  ctaButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary[500],
  },
  footer: {
    padding: Spacing.xl,
    alignItems: "center",
  },
  footerText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
  },
});
