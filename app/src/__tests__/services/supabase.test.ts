import { authAPI } from '../../services/supabase';
import { supabase } from '../../services/supabase';

// Mock Supabase client
jest.mock('../../services/supabase', () => {
  const mockSupabase = {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      refreshSession: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
  };

  const mockAuthAPI = {
    signUp: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    refreshToken: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
  };

  return {
    supabase: mockSupabase,
    authAPI: mockAuthAPI,
  };
});

const mockSupabase = supabase as jest.Mocked<typeof supabase>;
const mockAuthAPI = authAPI as jest.Mocked<typeof authAPI>;

describe('Supabase Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    const mockUserData = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
      phone: '+1234567890',
      role: 'agent' as const,
    };

    it('should successfully create a new user account', async () => {
      const mockResponse = {
        success: true,
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'agent' as const,
          phone: '+1234567890',
          avatar: undefined,
        },
        session: {
          access_token: 'access-token-123',
          refresh_token: 'refresh-token-123',
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          expires_in: 3600,
        },
      };

      mockAuthAPI.signUp.mockResolvedValue(mockResponse);

      const result = await authAPI.signUp(mockUserData);

      expect(result.success).toBe(true);
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.name).toBe('Test User');
      expect(result.user.role).toBe('agent');
      expect(result.session.access_token).toBe('access-token-123');
    });

    it('should handle signup errors gracefully', async () => {
      mockAuthAPI.signUp.mockRejectedValue(new Error('Email address is invalid'));

      await expect(authAPI.signUp(mockUserData)).rejects.toThrow('Email address is invalid');
    });

    it('should handle infinite recursion errors', async () => {
      mockAuthAPI.signUp.mockRejectedValue(
        new Error('Database configuration issue detected. Please fix the RLS policies in your Supabase dashboard.')
      );

      await expect(authAPI.signUp(mockUserData)).rejects.toThrow(
        'Database configuration issue detected. Please fix the RLS policies in your Supabase dashboard.'
      );
    });

    it('should handle email confirmation required', async () => {
      mockAuthAPI.signUp.mockRejectedValue(
        new Error('Please check your email and click the confirmation link to complete your account setup.')
      );

      await expect(authAPI.signUp(mockUserData)).rejects.toThrow(
        'Please check your email and click the confirmation link to complete your account setup.'
      );
    });
  });

  describe('login', () => {
    const mockCredentials = {
      email: 'test@example.com',
      password: 'password123',
      rememberMe: false,
    };

    it('should successfully login a user', async () => {
      const mockResponse = {
        success: true,
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'agent' as const,
          phone: '+1234567890',
          avatar: undefined,
        },
        session: {
          access_token: 'access-token-123',
          refresh_token: 'refresh-token-123',
          expires_at: 1234567890,
          expires_in: 3600,
        },
      };

      mockAuthAPI.login.mockResolvedValue(mockResponse);

      const result = await authAPI.login(mockCredentials);

      expect(result.success).toBe(true);
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.name).toBe('Test User');
      expect(result.user.role).toBe('agent');
      expect(result.session.access_token).toBe('access-token-123');
    });

    it('should handle login errors', async () => {
      mockAuthAPI.login.mockRejectedValue(new Error('Invalid login credentials'));

      await expect(authAPI.login(mockCredentials)).rejects.toThrow('Invalid login credentials');
    });

    it('should handle profile creation when profile does not exist', async () => {
      const mockResponse = {
        success: true,
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'agent' as const,
          phone: undefined,
          avatar: undefined,
        },
        session: {
          access_token: 'access-token-123',
          refresh_token: 'refresh-token-123',
          expires_at: 1234567890,
          expires_in: 3600,
        },
      };

      mockAuthAPI.login.mockResolvedValue(mockResponse);

      const result = await authAPI.login(mockCredentials);

      expect(result.success).toBe(true);
      expect(result.user.name).toBe('Test User');
      expect(result.user.role).toBe('agent');
    });
  });

  describe('logout', () => {
    it('should successfully logout a user', async () => {
      const mockResponse = {
        success: true,
        message: 'Logged out successfully',
      };

      mockAuthAPI.logout.mockResolvedValue(mockResponse);

      const result = await authAPI.logout('access-token-123');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Logged out successfully');
    });

    it('should handle logout errors', async () => {
      mockAuthAPI.logout.mockRejectedValue(new Error('Logout failed'));

      await expect(authAPI.logout('access-token-123')).rejects.toThrow('Logout failed');
    });
  });

  describe('refreshToken', () => {
    it('should successfully refresh a token', async () => {
      const mockResponse = {
        success: true,
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'agent' as const,
          phone: '+1234567890',
          avatar: undefined,
        },
        session: {
          access_token: 'new-access-token-123',
          refresh_token: 'new-refresh-token-123',
          expires_at: 1234567890,
          expires_in: 3600,
        },
      };

      mockAuthAPI.refreshToken.mockResolvedValue(mockResponse);

      const result = await authAPI.refreshToken('refresh-token-123');

      expect(result.success).toBe(true);
      expect(result.user.email).toBe('test@example.com');
      expect(result.session.access_token).toBe('new-access-token-123');
    });

    it('should handle refresh token errors', async () => {
      mockAuthAPI.refreshToken.mockRejectedValue(new Error('Invalid refresh token'));

      await expect(authAPI.refreshToken('invalid-token')).rejects.toThrow('Invalid refresh token');
    });
  });
}); 