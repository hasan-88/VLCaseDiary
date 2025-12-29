// app/auth.tsx - Modern Professional Authentication Screen (FIXED)
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  CheckCircle,
} from "lucide-react-native";
import { Colors, Spacing, BorderRadius, Typography } from "../constants/theme";

const { width, height } = Dimensions.get("window");

export default function AuthScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { login, register } = useAuth();

  // Get mode from params, default to login
  const [isLogin, setIsLogin] = useState(params.mode !== "register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
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

  const handleSubmit = async () => {
    // Validation
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (!isLogin && !name) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email.trim().toLowerCase(), password);
      } else {
        await register(name.trim(), email.trim().toLowerCase(), password);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setName("");
    setEmail("");
    setPassword("");
  };

  const handleBackPress = () => {
    // Navigate to landing page
    router.push("/");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient
        colors={[Colors.primary[500], Colors.primary[600], "#1a1a1a"]}
        style={styles.gradient}
      >
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.contentContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Logo & Title Section */}
            <View style={styles.titleSection}>
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={["rgba(255,255,255,0.2)", "rgba(255,255,255,0.1)"]}
                  style={styles.logoCircle}
                >
                  <Text style={styles.logoEmoji}>âš–ï¸</Text>
                </LinearGradient>
              </View>

              <Text style={styles.title}>
                {isLogin ? "Welcome Back" : "Create Account"}
              </Text>
              <Text style={styles.subtitle}>
                {isLogin
                  ? "Sign in to continue managing your cases"
                  : "Join us to start managing your legal cases"}
              </Text>
            </View>

            {/* Form Section */}
            <View style={styles.formContainer}>
              {/* Name Input (Registration Only) */}
              {!isLogin && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIcon}>
                      <User size={20} color={Colors.primary[400]} />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your full name"
                      placeholderTextColor="rgba(255,255,255,0.5)"
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                    />
                  </View>
                </View>
              )}

              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIcon}>
                    <Mail size={20} color={Colors.primary[400]} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIcon}>
                    <Lock size={20} color={Colors.primary[400]} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color="rgba(255,255,255,0.6)" />
                    ) : (
                      <Eye size={20} color="rgba(255,255,255,0.6)" />
                    )}
                  </TouchableOpacity>
                </View>
                {!isLogin && (
                  <Text style={styles.passwordHint}>
                    Must be at least 6 characters
                  </Text>
                )}
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  loading && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    loading ? ["#cccccc", "#999999"] : ["#ffffff", "#f0f0f0"]
                  }
                  style={styles.submitGradient}
                >
                  {loading ? (
                    <ActivityIndicator
                      color={Colors.primary[500]}
                      size="small"
                    />
                  ) : (
                    <>
                      <Text style={styles.submitText}>
                        {isLogin ? "Sign In" : "Create Account"}
                      </Text>
                      <CheckCircle size={20} color={Colors.primary[500]} />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Switch Mode Button */}
              <TouchableOpacity
                style={styles.switchModeButton}
                onPress={toggleMode}
                activeOpacity={0.7}
              >
                <Text style={styles.switchModeText}>
                  {isLogin
                    ? "Don't have an account? "
                    : "Already have an account? "}
                  <Text style={styles.switchModeLink}>
                    {isLogin ? "Sign Up" : "Sign In"}
                  </Text>
                </Text>
              </TouchableOpacity>

              {/* Terms & Privacy */}
              {!isLogin && (
                <Text style={styles.termsText}>
                  By creating an account, you agree to our{"\n"}
                  <Text style={styles.termsLink}>Terms of Service</Text>
                  {" and "}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              )}
            </View>
          </Animated.View>
        </ScrollView>

        {/* Decorative Elements */}
        <View style={styles.decorativeElements}>
          <View style={[styles.circle, styles.circle1]} />
          <View style={[styles.circle, styles.circle2]} />
          <View style={[styles.circle, styles.circle3]} />
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingTop: Spacing.xxxl + 20,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
  },
  titleSection: {
    alignItems: "center",
    marginBottom: Spacing.xxxl,
  },
  logoContainer: {
    marginBottom: Spacing.lg,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  logoEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: Typography.fontSize.xxxl + 4,
    fontWeight: Typography.fontWeight.extrabold,
    color: "#fff",
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  subtitle: {
    fontSize: Typography.fontSize.md,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.md,
    paddingHorizontal: Spacing.lg,
  },
  formContainer: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: "#fff",
    marginBottom: Spacing.xs,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: Spacing.md,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSize.md,
    color: "#fff",
  },
  eyeButton: {
    padding: Spacing.xs,
  },
  passwordHint: {
    fontSize: Typography.fontSize.xs,
    color: "rgba(255,255,255,0.6)",
    marginTop: Spacing.xs,
  },
  submitButton: {
    marginTop: Spacing.md,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md + 2,
    gap: Spacing.sm,
  },
  submitText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary[500],
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  dividerText: {
    fontSize: Typography.fontSize.sm,
    color: "rgba(255,255,255,0.6)",
    marginHorizontal: Spacing.md,
    fontWeight: Typography.fontWeight.medium,
  },
  switchModeButton: {
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  switchModeText: {
    fontSize: Typography.fontSize.md,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
  switchModeLink: {
    color: "#fff",
    fontWeight: Typography.fontWeight.bold,
    textDecorationLine: "underline",
  },
  termsText: {
    fontSize: Typography.fontSize.xs,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    marginTop: Spacing.lg,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.xs,
  },
  termsLink: {
    color: "#fff",
    fontWeight: Typography.fontWeight.semibold,
  },
  decorativeElements: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    zIndex: -1,
  },
  circle: {
    position: "absolute",
    borderRadius: BorderRadius.full,
    backgroundColor: "rgba(255,255,255,0.05)",
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
    top: "40%",
    right: "5%",
  },
});
