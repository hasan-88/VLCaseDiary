/**
 * Centralized design tokens / color system used across the app.
 */

import { Platform } from "react-native";

const tintColorLight = "#0a7ea4";
const tintColorDark = "#ffffff";

export const Colors = {
  light: {
    text: "#11181C",
    background: "#ffffff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
  },

  primary: {
    "50": "#eef6fb",
    "100": "#d7eef6",
    "200": "#bfe6f0",
    "300": "#99d9ea",
    "400": "#66c0e0",
    "500": tintColorLight,
    "600": "#06607f",
    "700": "#054d66",
    "800": "#03384d",
    "900": "#012633",
  },

  info: {
    light: "#dbeafe",
    main: "#3b82f6",
    dark: "#1e40af",
  },

  error: {
    light: "#fee2e2",
    main: "#ef4444",
    dark: "#991b1b",
  },

  success: {
    light: "#dcfce7",
    main: "#16a34a",
    dark: "#065f46",
  },

  warning: {
    light: "#fff7ed",
    main: "#f59e0b",
    dark: "#b45309",
  },

  status: {
    pending: "#f59e0b", // Yellow/Orange for pending
    hearing: "#f59e0b", // Same as pending for consistency
    disposed: "#16a34a", // Green for disposed/completed
    default: "#6b7280",
  },

  neutral: {
    100: "#f5f5f5",
    200: "#e6e6e6",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
  },

  text: {
    primary: "#11181C",
    secondary: "#6b7280",
    tertiary: "#9ca3af",
  },

  background: {
    primary: "#ffffff",
    secondary: "#f6f7fb",
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const BorderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const Typography = {
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 40,
  },

  // Line heights (absolute values + multipliers)
  lineHeight: {
    // Absolute values
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 36,
    xxxl: 44,
    display: 52,

    // Multipliers
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Font weights
  fontWeight: {
    thin: "100" as const,
    extralight: "200" as const,
    light: "300" as const,
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
    extrabold: "800" as const,
    black: "900" as const,
  },

  // Letter spacing
  letterSpacing: {
    tighter: -0.8,
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
    widest: 2,
  },
} as const;

export const Shadows = {
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// Export alias for Typography (shorthand)
export const t = Typography;
