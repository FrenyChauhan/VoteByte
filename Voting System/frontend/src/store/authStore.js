import { create } from 'zustand';
import { toast } from 'react-hot-toast';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isCheckingAuth: true,
  error: null,
  tempUser: null,

  signup: async (userData) => {
    set({error: null})
    try {
      const { email, password, name, userType = 'user' } = userData;
      const users = JSON.parse(localStorage.getItem('users') || '[]');

      if (users.some((user) => user.email === email)) {
        set({ error: 'User already exists' });
        return false;
      }

      const tempUser = {
        id: Date.now().toString(),
        email,
        password,
        name,
        userType,
        createdAt: new Date().toISOString(),
        isVerified: false,
        otp: '123456', // demo OTP
      };

      set({ tempUser });
      return true;
    } catch (error) {
      set({ error: error.message });
      return false;
    }
  },

  verifyEmail: async (otp) => {
    set({error: null})
    try {
      const { tempUser } = get();

      if (!tempUser) {
        set({ error: 'No pending verification' });
        return false;
      }

      if (otp !== tempUser.otp) {
        set({ error: 'Invalid OTP' });
        return false;
      }

      const users = JSON.parse(localStorage.getItem('users') || '[]');

      const { otp: _, ...verifiedUser } = {
        ...tempUser,
        isVerified: true,
      };

      users.push(verifiedUser);
      localStorage.setItem('users', JSON.stringify(users));

      const { password: __, ...safeUser } = verifiedUser;
      localStorage.setItem('currentUser', JSON.stringify(safeUser));

      set({
        user: safeUser,
        isAuthenticated: true,
        tempUser: null,
        error: null,
      });

      return true;
    } catch (error) {
      set({ error: error.message });
      return false;
    }
  },

  login: async ({ email, password }) => {
    set({error: null})
    try {
      let users = JSON.parse(localStorage.getItem('users') || '[]');

      let user = users.find((u) => u.email === email && u.password === password);
     
      if (!user) {
        set({ error: 'Invalid credentials' });
        return false;
      }

      if (!user.isVerified) {
        set({ error: 'Please verify your email first' });
        return false;
      }

      const { password: _, ...safeUser } = user;
      localStorage.setItem('currentUser', JSON.stringify(safeUser));

      set({
        user: safeUser,
        isAuthenticated: true,
        error: null,
      });

      toast.success(`Welcome back, ${safeUser.name}!`);
      return true;
    } catch (error) {
      set({ error: error.message });
      return false;
    }
  },

  resendOTP: async () => {
    const { tempUser } = get();
    if (!tempUser) {
      set({ error: 'No pending verification' });
      return false;
    }

    toast.success(`OTP resent: 123456`);
    return true;
  },

  checkAuth: async () => {
    try {
      set({ isCheckingAuth: true });

      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        set({
          user,
          isAuthenticated: true,
          error: null,
        });
      }
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  logout: () => {
    localStorage.removeItem('currentUser');
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));

export { useAuthStore };
