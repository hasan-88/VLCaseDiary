// contexts/AuthContext.tsx - FINAL WORKING VERSION
import React, { createContext, useState, useContext, useEffect } from "react";
import { useRouter, useSegments, usePathname } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { authAPI } from "../services/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();
  const pathname = usePathname();

  // Check if user is logged in on app start
  useEffect(() => {
    loadUser();
  }, []);

  // Handle navigation based on auth state
  useEffect(() => {
    if (loading) return;

    const inTabsGroup = segments[0] === "(tabs)";

    // Only protect dashboard routes
    if (!user && inTabsGroup) {
      console.log("✅ Auth: Redirecting logged out user to landing page");
      router.replace("/");
    }
  }, [user, loading, segments]);

  const loadUser = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");

      if (token) {
        const response = await authAPI.getProfile();
        if (response.success) {
          setUser(response.user);
        } else {
          await SecureStore.deleteItemAsync("token");
        }
      }
    } catch (error) {
      console.log("Load user error:", error);
      await SecureStore.deleteItemAsync("token");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);

      if (response.success && response.token) {
        await SecureStore.setItemAsync("token", response.token);
        setUser(response.user);

        // Navigate to dashboard after small delay
        setTimeout(() => {
          router.replace("/(tabs)");
        }, 100);
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(
        error.response?.data?.message || error.message || "Login failed"
      );
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await authAPI.register(name, email, password);

      if (response.success && response.token) {
        await SecureStore.setItemAsync("token", response.token);
        setUser(response.user);

        // Navigate to dashboard after small delay
        setTimeout(() => {
          router.replace("/(tabs)");
        }, 100);
      } else {
        throw new Error(response.message || "Registration failed");
      }
    } catch (error: any) {
      console.error("Register error:", error);
      throw new Error(
        error.response?.data?.message || error.message || "Registration failed"
      );
    }
  };

  const logout = async () => {
    try {
      console.log("🔴 Starting logout...");

      // Step 1: Clear token from secure storage
      await SecureStore.deleteItemAsync("token");
      console.log("🔴 Token cleared from storage");

      // Step 2: Clear user state
      setUser(null);
      console.log("🔴 User state cleared");

      // Step 3: Wait a bit for state to update, then navigate
      setTimeout(() => {
        console.log("🔴 Navigating to landing page");
        router.replace("/");
      }, 100);

      console.log("🔴 Logout complete!");
    } catch (error) {
      console.error("🔴 Logout error:", error);
      // Force logout anyway
      setUser(null);
      router.replace("/");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
