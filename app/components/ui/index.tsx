// components/ui/index.tsx - Reusable UI Components
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  ViewStyle,
  TextStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
  Shadows,
} from "../../../constants/theme";

// ====================
// BUTTON COMPONENT
// ====================
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "small" | "medium" | "large";
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export const Button = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  loading = false,
  disabled = false,
  icon,
  style,
}: ButtonProps) => {
  const getButtonStyle = () => {
    const baseStyle = [buttonStyles.button, buttonStyles[size]];

    if (variant === "primary") {
      return [...baseStyle, style];
    } else if (variant === "outline") {
      return [...baseStyle, buttonStyles.outline, style];
    } else if (variant === "ghost") {
      return [...baseStyle, buttonStyles.ghost, style];
    }
    return [...baseStyle, buttonStyles.secondary, style];
  };

  const getTextStyle = () => {
    const baseStyle = [buttonStyles.buttonText, buttonStyles[`${size}Text`]];

    if (variant === "outline" || variant === "ghost") {
      return [...baseStyle, buttonStyles.outlineText];
    }
    return baseStyle;
  };

  if (variant === "primary") {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[
          buttonStyles.button,
          buttonStyles[size],
          style,
          disabled && buttonStyles.disabled,
        ]}
      >
        <LinearGradient
          colors={
            disabled
              ? [Colors.neutral[300], Colors.neutral[400]]
              : [Colors.primary[500], Colors.primary[600]]
          }
          style={buttonStyles.gradient}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              {icon}
              <Text style={getTextStyle()}>{title}</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[...getButtonStyle(), disabled && buttonStyles.disabled]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" ? Colors.primary[500] : "#fff"}
          size="small"
        />
      ) : (
        <>
          {icon}
          <Text style={getTextStyle()}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const buttonStyles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: Spacing.xs,
  },
  gradient: {
    width: "100%",
    height: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.xs,
  },
  small: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  medium: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  large: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  secondary: {
    backgroundColor: Colors.neutral[700],
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: Colors.primary[500],
  },
  ghost: {
    backgroundColor: "transparent",
  },
  disabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: Typography.fontWeight.semibold,
  },
  smallText: {
    fontSize: Typography.fontSize.sm,
  },
  mediumText: {
    fontSize: Typography.fontSize.md,
  },
  largeText: {
    fontSize: Typography.fontSize.lg,
  },
  outlineText: {
    color: Colors.primary[500],
  },
});

// ====================
// INPUT COMPONENT
// ====================
interface InputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  error?: string;
  label?: string;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  style?: ViewStyle;
}

export const Input = ({
  placeholder,
  value,
  onChangeText,
  icon,
  rightIcon,
  secureTextEntry,
  keyboardType = "default",
  error,
  label,
  disabled,
  multiline,
  numberOfLines,
  style,
}: InputProps) => {
  return (
    <View style={[inputStyles.container, style]}>
      {label && <Text style={inputStyles.label}>{label}</Text>}
      <View
        style={[
          inputStyles.inputWrapper,
          error && inputStyles.inputError,
          disabled && inputStyles.disabled,
        ]}
      >
        {icon && <View style={inputStyles.iconContainer}>{icon}</View>}
        <TextInput
          style={[inputStyles.input, multiline && inputStyles.multiline]}
          placeholder={placeholder}
          placeholderTextColor={Colors.text.tertiary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? "top" : "center"}
        />
        {rightIcon && (
          <View style={inputStyles.rightIconContainer}>{rightIcon}</View>
        )}
      </View>
      {error && <Text style={inputStyles.errorText}>{error}</Text>}
    </View>
  );
};

const inputStyles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  inputError: {
    borderColor: Colors.error.main,
  },
  disabled: {
    opacity: 0.6,
  },
  iconContainer: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSize.md,
    color: Colors.text.primary,
  },
  multiline: {
    minHeight: 100,
    paddingTop: Spacing.md,
  },
  rightIconContainer: {
    marginLeft: Spacing.sm,
  },
  errorText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.error.main,
    marginTop: Spacing.xs,
  },
});

// ====================
// CARD COMPONENT
// ====================
interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: "elevated" | "outlined" | "flat";
}

export const Card = ({
  children,
  style,
  onPress,
  variant = "elevated",
}: CardProps) => {
  const getCardStyle = () => {
    const baseStyle = [cardStyles.card, style];

    if (variant === "elevated") {
      return [...baseStyle, cardStyles.elevated];
    } else if (variant === "outlined") {
      return [...baseStyle, cardStyles.outlined];
    }
    return baseStyle;
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={getCardStyle()}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={getCardStyle()}>{children}</View>;
};

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  elevated: {
    ...Shadows.md,
  },
  outlined: {
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
});

// ====================
// BADGE COMPONENT
// ====================
interface BadgeProps {
  text: string;
  variant?: "success" | "warning" | "error" | "info" | "default";
  size?: "small" | "medium";
  style?: ViewStyle;
}

export const Badge = ({
  text,
  variant = "default",
  size = "medium",
  style,
}: BadgeProps) => {
  const getBadgeColor = () => {
    switch (variant) {
      case "success":
        return { bg: Colors.success.light, text: Colors.success.dark };
      case "warning":
        return { bg: Colors.warning.light, text: Colors.warning.dark };
      case "error":
        return { bg: Colors.error.light, text: Colors.error.dark };
      case "info":
        return { bg: Colors.info.light, text: Colors.info.dark };
      default:
        return { bg: Colors.neutral[200], text: Colors.neutral[700] };
    }
  };

  const colors = getBadgeColor();

  return (
    <View
      style={[
        badgeStyles.badge,
        badgeStyles[size],
        { backgroundColor: colors.bg },
        style,
      ]}
    >
      <Text
        style={[
          badgeStyles.badgeText,
          badgeStyles[`${size}Text`],
          { color: colors.text },
        ]}
      >
        {text}
      </Text>
    </View>
  );
};

const badgeStyles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    alignSelf: "flex-start",
  },
  small: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
  },
  medium: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  badgeText: {
    fontWeight: Typography.fontWeight.semibold,
    textTransform: "uppercase",
  },
  smallText: {
    fontSize: Typography.fontSize.xs - 2,
  },
  mediumText: {
    fontSize: Typography.fontSize.xs,
  },
});

// ====================
// LOADING COMPONENT
// ====================
interface LoadingProps {
  text?: string;
  size?: "small" | "large";
}

export const Loading = ({
  text = "Loading...",
  size = "large",
}: LoadingProps) => {
  return (
    <View style={loadingStyles.container}>
      <ActivityIndicator size={size} color={Colors.primary[500]} />
      {text && <Text style={loadingStyles.text}>{text}</Text>}
    </View>
  );
};

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  text: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
  },
});

// ====================
// EMPTY STATE COMPONENT
// ====================
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export const EmptyState = ({
  icon,
  title,
  subtitle,
  action,
}: EmptyStateProps) => {
  return (
    <View style={emptyStyles.container}>
      <View style={emptyStyles.iconContainer}>{icon}</View>
      <Text style={emptyStyles.title}>{title}</Text>
      {subtitle && <Text style={emptyStyles.subtitle}>{subtitle}</Text>}
      {action && (
        <Button
          title={action.label}
          onPress={action.onPress}
          variant="primary"
          style={emptyStyles.button}
        />
      )}
    </View>
  );
};

const emptyStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  iconContainer: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    textAlign: "center",
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  button: {
    marginTop: Spacing.md,
  },
});

// ====================
// DIVIDER COMPONENT
// ====================
interface DividerProps {
  text?: string;
  style?: ViewStyle;
}

export const Divider = ({ text, style }: DividerProps) => {
  if (text) {
    return (
      <View style={[dividerStyles.container, style]}>
        <View style={dividerStyles.line} />
        <Text style={dividerStyles.text}>{text}</Text>
        <View style={dividerStyles.line} />
      </View>
    );
  }

  return <View style={[dividerStyles.simpleDivider, style]} />;
};

const dividerStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Spacing.md,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.neutral[200],
  },
  text: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    marginHorizontal: Spacing.md,
  },
  simpleDivider: {
    height: 1,
    backgroundColor: Colors.neutral[200],
    marginVertical: Spacing.md,
  },
});
// Add this at the end of components/ui/index.tsx
export default {
  Button,
  Input,
  Card,
  Badge,
  Loading,
  EmptyState,
  Divider,
};