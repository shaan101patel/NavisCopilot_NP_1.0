import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store';
import { setUser as setReduxUser, logout as logoutUser, setLoading } from '../store/userSlice';
import { authAPI, LoginRequest, LoginResponse } from '../services/supabase';

// Update app/src/contexts/AuthContext.tsx
interface User {
  id: string;
  email: string;      // Now stored in profiles
  name: string;       // Renamed from full_name
  role: 'agent' | 'supervisor' | 'admin';  // Updated enum
  phone_number?: string;     // Renamed from phone_number (to match Redux type)
  avatar?: string;    // New field
  bio?: string;       // New field
  department?: string; // New field
  status?: string;    // New field
  preferences?: object; // New field
}

interface SignUpRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: 'agent' | 'supervisor' | 'admin';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (credentials: LoginRequest) => Promise<void>;
  signUp: (userData: SignUpRequest) => Promise<{ error?: { message: string } }>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (accessToken: string, refreshToken: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const TOKEN_KEY = 'navis-auth-tokens';
const USER_KEY = 'navis-user';

export function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoadingState] = useState(true);

  // Sync user state with Redux
  const setUser = (userData: User | null) => {
    console.log('🔐 AuthContext: Setting user state:', userData);
    setUserState(userData);
    if (userData) {
      // Convert user data to match Redux User interface
      const reduxUser = {
        id: userData.id,
        name: userData.name,
        phone_number: userData.phone_number || '',
        email: userData.email,
        role: userData.role === 'supervisor' ? 'admin' : userData.role as 'agent' | 'admin', // Map supervisor to admin for Redux
        avatar: userData.avatar,
      };
      console.log('🔐 AuthContext: Dispatching Redux user:', reduxUser);
      dispatch(setReduxUser(reduxUser));
    } else {
      console.log('🔐 AuthContext: Logging out user from Redux');
      dispatch(logoutUser());
    }
  };

  const setIsLoading = (loading: boolean) => {
    setIsLoadingState(loading);
    dispatch(setLoading(loading));
  };

  // Load user from localStorage on app start
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedTokens = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (storedTokens && storedUser) {
          const tokens = JSON.parse(storedTokens);
          const userData = JSON.parse(storedUser);

          // Check if token is expired
          const now = Math.floor(Date.now() / 1000);
          if (tokens.expires_at && tokens.expires_at > now) {
            setUser(userData);
          } else if (tokens.refresh_token) {
            // Try to refresh the token
            try {
              const refreshedAuth = await authAPI.refreshToken(tokens.refresh_token);
              setUser(refreshedAuth.user);
              
              // Store updated tokens
              localStorage.setItem(TOKEN_KEY, JSON.stringify(refreshedAuth.session));
              localStorage.setItem(USER_KEY, JSON.stringify(refreshedAuth.user));
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
              // Clear invalid tokens
              localStorage.removeItem(TOKEN_KEY);
              localStorage.removeItem(USER_KEY);
            }
          } else {
            // No valid tokens, clear storage
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
          }
        }
      } catch (error) {
        console.error('Error loading stored auth:', error);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  const signIn = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      
      const authResponse = await authAPI.login(credentials);
      
      if (authResponse.success) {
        setUser(authResponse.user);
        
        // Store tokens and user data
        localStorage.setItem(TOKEN_KEY, JSON.stringify(authResponse.session));
        localStorage.setItem(USER_KEY, JSON.stringify(authResponse.user));
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (userData: SignUpRequest) => {
    try {
      setIsLoading(true);
      
      // Use the new dedicated signup method
      const authResponse = await authAPI.signUp({
        email: userData.email,
        password: userData.password,
        fullName: userData.fullName,
        phone: userData.phone,
        role: userData.role
      });
      
      if (authResponse.success) {
        setUser(authResponse.user);
        
        // Store tokens and user data
        localStorage.setItem(TOKEN_KEY, JSON.stringify(authResponse.session));
        localStorage.setItem(USER_KEY, JSON.stringify(authResponse.user));
        
        return {}; // Success
      } else {
        return { error: { message: 'Account creation failed' } };
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { error: { message: error.message || 'Account creation failed' } };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      
      // Get current access token for logout
      const storedTokens = localStorage.getItem(TOKEN_KEY);
      if (storedTokens) {
        const tokens = JSON.parse(storedTokens);
        
        try {
          await authAPI.logout(tokens.access_token);
        } catch (logoutError) {
          console.error('Logout API call failed:', logoutError);
          // Continue with local logout even if API call fails
        }
      }
      
      // Clear local state and storage
      setUser(null);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Sign out error:', error);
      // Still clear local state even if logout fails
      setUser(null);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await authAPI.forgotPassword(email);
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  };

  const resetPassword = async (accessToken: string, refreshToken: string, newPassword: string) => {
    try {
      await authAPI.resetPassword(accessToken, refreshToken, newPassword);
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signIn,
    signUp,
    signOut,
    forgotPassword,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
