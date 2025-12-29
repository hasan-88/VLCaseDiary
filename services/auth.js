// services/auth.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthService = {
  // Store user data after login
  storeUserData: async (token, userData) => {
    try {
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.log('Error storing user data:', error);
      return false;
    }
  },

  // Get stored user data
  getUserData: async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');
      
      if (token && userData) {
        return {
          token,
          user: JSON.parse(userData)
        };
      }
      return null;
    } catch (error) {
      console.log('Error getting user data:', error);
      return null;
    }
  },

  // Check if user is logged in
  isLoggedIn: async () => {
    const token = await AsyncStorage.getItem('userToken');
    return !!token;
  },

  // Clear all auth data
  clearAuthData: async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      return true;
    } catch (error) {
      console.log('Error clearing auth data:', error);
      return false;
    }
  }
};