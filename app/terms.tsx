// app/terms.tsx - Terms & Conditions Screen
import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
  Shadows,
} from "../constants/theme";

export default function TermsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.primary[500], Colors.primary[600]]}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.lastUpdated}>
            Last Updated: December 30, 2024
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
            <Text style={styles.paragraph}>
              By downloading, installing, or using the Voice of Law mobile
              application ("App"), you agree to be bound by these Terms and
              Conditions. If you do not agree with any part of these terms,
              please do not use the App.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Description of Service</Text>
            <Text style={styles.paragraph}>
              Voice of Law is a legal case management application designed to
              help lawyers, legal professionals, and individuals organize,
              track, and manage their legal cases. The App provides features
              including:
            </Text>
            <Text style={styles.bulletPoint}>
              • Case documentation and storage
            </Text>
            <Text style={styles.bulletPoint}>
              • Hearing date tracking and reminders
            </Text>
            <Text style={styles.bulletPoint}>
              • Document upload and management
            </Text>
            <Text style={styles.bulletPoint}>
              • Calendar integration for case schedules
            </Text>
            <Text style={styles.bulletPoint}>
              • Push notifications for important dates
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              3. User Account and Registration
            </Text>
            <Text style={styles.paragraph}>
              To use the App, you must create an account by providing accurate
              and complete information. You are responsible for:
            </Text>
            <Text style={styles.bulletPoint}>
              • Maintaining the confidentiality of your account credentials
            </Text>
            <Text style={styles.bulletPoint}>
              • All activities that occur under your account
            </Text>
            <Text style={styles.bulletPoint}>
              • Notifying us immediately of any unauthorized access
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              4. Permissions and Data Access
            </Text>
            <Text style={styles.paragraph}>
              The App requires certain permissions to function properly. By
              using the App, you grant us permission to access:
            </Text>
            <Text style={styles.bulletPoint}>
              <Text style={styles.bold}>• Camera:</Text> To capture photos of
              documents and evidence for case files
            </Text>
            <Text style={styles.bulletPoint}>
              <Text style={styles.bold}>• Storage:</Text> To save and retrieve
              case documents, images, and files on your device
            </Text>
            <Text style={styles.bulletPoint}>
              <Text style={styles.bold}>• Calendar:</Text> To display case
              hearing dates and sync with your device calendar
            </Text>
            <Text style={styles.bulletPoint}>
              <Text style={styles.bold}>• Notifications:</Text> To send
              reminders about upcoming hearings and case updates
            </Text>
            <Text style={styles.bulletPoint}>
              <Text style={styles.bold}>• Internet:</Text> To sync data with our
              servers and access case information
            </Text>
            <Text style={styles.paragraph}>
              You may revoke these permissions at any time through your device
              settings, though this may limit the functionality of the App.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              5. Data Privacy and Security
            </Text>
            <Text style={styles.paragraph}>
              We take the privacy and security of your data seriously:
            </Text>
            <Text style={styles.bulletPoint}>
              • All case data is stored securely and encrypted
            </Text>
            <Text style={styles.bulletPoint}>
              • We do not share your personal or case information with third
              parties without your consent
            </Text>
            <Text style={styles.bulletPoint}>
              • You retain ownership of all data you upload to the App
            </Text>
            <Text style={styles.bulletPoint}>
              • You may request deletion of your data at any time
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. User Responsibilities</Text>
            <Text style={styles.paragraph}>You agree to:</Text>
            <Text style={styles.bulletPoint}>
              • Use the App only for lawful purposes
            </Text>
            <Text style={styles.bulletPoint}>
              • Not upload any illegal, harmful, or offensive content
            </Text>
            <Text style={styles.bulletPoint}>
              • Not attempt to gain unauthorized access to the App or its
              systems
            </Text>
            <Text style={styles.bulletPoint}>
              • Maintain the confidentiality of sensitive legal information
            </Text>
            <Text style={styles.bulletPoint}>
              • Comply with all applicable laws and regulations
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Intellectual Property</Text>
            <Text style={styles.paragraph}>
              The App, including its design, features, and content, is owned by
              Voice of Law and protected by copyright and other intellectual
              property laws. You may not copy, modify, distribute, or reverse
              engineer any part of the App without our written permission.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Disclaimer of Warranties</Text>
            <Text style={styles.paragraph}>
              THE APP IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. We do
              not guarantee that:
            </Text>
            <Text style={styles.bulletPoint}>
              • The App will be error-free or uninterrupted
            </Text>
            <Text style={styles.bulletPoint}>
              • All features will function perfectly at all times
            </Text>
            <Text style={styles.bulletPoint}>
              • Your data will never be lost or corrupted
            </Text>
            <Text style={styles.paragraph}>
              The App is a case management tool and does not provide legal
              advice. You should consult with qualified legal professionals for
              legal matters.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. Limitation of Liability</Text>
            <Text style={styles.paragraph}>
              To the maximum extent permitted by law, Voice of Law shall not be
              liable for any indirect, incidental, special, consequential, or
              punitive damages resulting from your use of the App, including but
              not limited to loss of data, missed hearings, or any other losses.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              10. Notifications and Reminders
            </Text>
            <Text style={styles.paragraph}>
              The App provides automated notifications and reminders for case
              hearings and important dates. However:
            </Text>
            <Text style={styles.bulletPoint}>
              • We are not responsible if notifications fail to deliver
            </Text>
            <Text style={styles.bulletPoint}>
              • You remain solely responsible for tracking your case dates
            </Text>
            <Text style={styles.bulletPoint}>
              • The App is a supplementary tool and should not be your only
              method of tracking important dates
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>11. Backup and Data Loss</Text>
            <Text style={styles.paragraph}>
              While we implement security measures to protect your data, we
              strongly recommend:
            </Text>
            <Text style={styles.bulletPoint}>
              • Regularly backing up important case documents
            </Text>
            <Text style={styles.bulletPoint}>
              • Maintaining physical or separate digital copies of critical
              files
            </Text>
            <Text style={styles.bulletPoint}>
              • Not relying solely on the App for document storage
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              12. Updates and Modifications
            </Text>
            <Text style={styles.paragraph}>
              We may update the App and these Terms at any time. Continued use
              of the App after changes constitutes acceptance of the modified
              terms. We will notify you of significant changes through the App
              or email.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>13. Termination</Text>
            <Text style={styles.paragraph}>
              We reserve the right to suspend or terminate your account if you
              violate these Terms. You may also delete your account at any time
              through the App settings.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>14. Third-Party Services</Text>
            <Text style={styles.paragraph}>
              The App may integrate with third-party services (calendar,
              storage, etc.). Your use of these services is subject to their
              respective terms and privacy policies.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>15. Governing Law</Text>
            <Text style={styles.paragraph}>
              These Terms shall be governed by and construed in accordance with
              the laws of Pakistan, without regard to its conflict of law
              provisions.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>16. Contact Information</Text>
            <Text style={styles.paragraph}>
              For questions or concerns about these Terms, please contact us at:
            </Text>
            <Text style={styles.bulletPoint}>
              Email: support@voiceoflaw.com
            </Text>
            <Text style={styles.bulletPoint}>Website: www.voiceoflaw.com</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>17. Acknowledgment</Text>
            <Text style={styles.paragraph}>
              By using Voice of Law, you acknowledge that you have read,
              understood, and agree to be bound by these Terms and Conditions.
              You also acknowledge that you have been informed about the
              permissions required by the App and consent to their use as
              described above.
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © 2024 Voice of Law. All rights reserved.
            </Text>
          </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxxl + 20,
    paddingBottom: Spacing.lg,
  },
  backBtn: {
    padding: Spacing.xs,
    marginRight: Spacing.md,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: "#fff",
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
  },
  lastUpdated: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    fontStyle: "italic",
    marginBottom: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  paragraph: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    lineHeight: 24,
    marginBottom: Spacing.sm,
  },
  bulletPoint: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    lineHeight: 24,
    marginLeft: Spacing.md,
    marginBottom: Spacing.xs,
  },
  bold: {
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  footer: {
    paddingVertical: Spacing.xl,
    alignItems: "center",
  },
  footerText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    textAlign: "center",
  },
});
