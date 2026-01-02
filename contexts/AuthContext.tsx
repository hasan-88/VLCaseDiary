// contexts/AuthContext.tsx - AGGRESSIVE LOGOUT FIX
import React, { createContext, useState, useContext, useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
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
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (loading) return;

    const inTabsGroup = segments[0] === "(tabs)";

    if (!user && inTabsGroup) {
      console.log("🔴 User logged out, forcing redirect to /");
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
        router.replace("/(tabs)");
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
        router.replace("/(tabs)");
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

  const logout = () => {
    console.log("🔴🔴🔴 LOGOUT CALLED 🔴🔴🔴");

    // IMMEDIATE synchronous clear
    setUser(null);
    console.log("🔴 User state set to null");

    // Clear token asynchronously but don't wait
    SecureStore.deleteItemAsync("token")
      .then(() => console.log("🔴 Token deleted"))
      .catch((e) => console.log("🔴 Token delete error:", e));

    // FORCE navigation immediately - try multiple methods
    console.log("🔴 Attempting navigation to /");

    // Method 1: Direct replace
    router.replace("/");

    // Method 2: Push as backup (in case replace doesn't work)
    setTimeout(() => {
      console.log("🔴 Backup navigation attempt");
      router.push("/");
    }, 50);

    // Method 3: Nuclear option - navigate to root
    setTimeout(() => {
      console.log("🔴 Nuclear navigation attempt");
      router.replace("/");
    }, 100);

    console.log("🔴🔴🔴 LOGOUT FUNCTION COMPLETED 🔴🔴🔴");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
