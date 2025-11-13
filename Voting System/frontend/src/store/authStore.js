import { create } from 'zustand';
import { toast } from 'react-hot-toast';
import api from '../services/apiService';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isCheckingAuth: true,
  error: null,
  isLoading: false,
  tempEmail: null,

  signup: async (fullname, email, password, role = 'USER') => {
    set({ error: null, isLoading: true });
    try {
      const response = await api.post('/auth/register', {
        fullname,
        email,
        password,
        role,
      });

      const { user } = response.data;
      
      // Store user data temporarily (needs email verification)
      set({ 
        tempEmail: email,
        user: {
          ...user,
          fullname: user.fullname || fullname,
          role: user.role || role,
        }
      });
      
      toast.success('Registration successful! Check your email for verification.');
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Signup failed';
      set({ error: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ error: null, isLoading: true });
    try {
      const response = await api.post('/auth/login', { email, password });
      
      const { user, token } = response.data;
      
      // Store token in localStorage
      if (token) {
        localStorage.setItem('authToken', token);
      }
      
      // Store user data
      const userData = {
        user_id: user.user_id,
        email: user.email,
        fullname: user.fullname,
        role: user.role,
        phone_number: user.phone_number,
        gender: user.gender,
        date_of_birth: user.date_of_birth,
        address: user.address,
        profile_photo: user.profile_photo,
        joined_at: user.joined_at,
        status: user.status,
        // Backend doesn't have isVerified, so we check status
        isVerified: user.status === 'ACTIVE',
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      
      set({
        user: userData,
        isAuthenticated: true,
        error: null,
      });

      toast.success(`Welcome back, ${user.fullname}!`);
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      set({ error: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  verifyEmail: async (code) => {
    const { tempEmail } = get();
    if (!tempEmail) {
      throw new Error('No pending email verification');
    }

    try {
      set({ error: null, isLoading: true });
      const response = await api.post('/auth/verify-otp', { 
        email: tempEmail, 
        code 
      });

      // Clear temp email and return true on success
      set({ tempEmail: null });
      toast.success('Email verified successfully!');
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Verification failed';
      set({ error: errorMessage });
      toast.error(errorMessage);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  resendOTP: async () => {
    const { tempEmail } = get();
    if (!tempEmail) {
      set({ error: 'No pending verification' });
      return false;
    }

    try {
      set({ isLoading: true });
      await api.post('/auth/resend-otp', { email: tempEmail });
      toast.success('Verification email resent!');
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to resend email';
      set({ error: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  checkAuth: async () => {
    try {
      set({ isCheckingAuth: true });
      
      const token = localStorage.getItem('authToken');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        const user = JSON.parse(savedUser);
        set({
          user,
          isAuthenticated: true,
          error: null,
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error('Auth check error:', error);
      set({
        user: null,
        isAuthenticated: false,
      });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      set({
        user: null,
        isAuthenticated: false,
        error: null,
        isLoading: false,
      });
      toast.success('Logged out successfully');
    }
  },

  clearError: () => set({ error: null }),
}));

export { useAuthStore };
