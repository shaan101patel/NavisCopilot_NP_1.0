import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://fjdurojwqtqoydmqjvmk.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqZHVyb2p3cXRxb3lkbXFqdm1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MzU0NTQsImV4cCI6MjA2NzIxMTQ1NH0.jcz4nwvURFMqkicKBf-_oEk_rZFT2jdm365oWzn6CYQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for authentication
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'agent' | 'supervisor' | 'admin';
  phone?: string;
  avatar?: string;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  expires_in: number;
}

export interface LoginResponse {
  success: boolean;
  user: User;
  session: Session;
  rememberMe?: boolean;
}

export interface AuthError {
  error: string;
  details?: string;
}

// Authentication API functions using DIRECT Supabase Auth (for testing)
export const authAPI = {
  /**
   * Register a new user with profile creation
   */
  async signUp(userData: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    role: 'agent' | 'supervisor' | 'admin';
  }): Promise<LoginResponse> {
    console.log('🔑 Creating new account for:', userData.email);
    
    try {
      // Create the user account with Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.fullName,
            phone: userData.phone || '',
            role: userData.role
          }
        }
      });

      if (signUpError) {
        console.error('❌ Supabase signup error:', signUpError);
        
        // Handle specific error cases
        if (signUpError.message?.includes('infinite recursion') || 
            signUpError.message?.includes('Database error saving new user')) {
          throw new Error('Database configuration issue detected. Please fix the RLS policies in your Supabase dashboard.');
        }
        
        if (signUpError.message?.includes('Email address') && signUpError.message?.includes('invalid')) {
          throw new Error('Email format is not accepted. Please try a different email address.');
        }
        
        throw new Error(signUpError.message || 'Account creation failed');
      }

      if (!signUpData.user) {
        throw new Error('Account creation failed - no user data returned');
      }

      console.log('✅ Account created successfully:', signUpData.user.email);

      // For email confirmation disabled setups, we might get a session immediately
      if (signUpData.session) {
        console.log('✅ User logged in automatically');
        
        try {
          // Create profile in our profiles table with fallback handling
          const profileData = {
            id: signUpData.user.id,
            email: signUpData.user.email!,
            name: userData.fullName,
            role: userData.role,
            phone: userData.phone || null,
            avatar: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          const { error: profileError } = await supabase
            .from('profiles')
            .insert([profileData]);

          if (profileError) {
            console.warn('⚠️ Profile creation failed, using fallback:', profileError.message);
            // Don't fail the entire signup, just warn about profile creation
          } else {
            console.log('✅ Profile created successfully');
          }

          return {
            success: true,
            user: {
              id: signUpData.user.id,
              email: signUpData.user.email!,
              name: userData.fullName,
              role: userData.role,
              phone: userData.phone,
              avatar: signUpData.user.user_metadata?.avatar || null
            },
            session: {
              access_token: signUpData.session.access_token,
              refresh_token: signUpData.session.refresh_token,
              expires_at: Math.floor(Date.now() / 1000) + (signUpData.session.expires_in || 3600),
              expires_in: signUpData.session.expires_in || 3600
            }
          };
        } catch (profileError: any) {
          console.warn('⚠️ Profile creation error, continuing with signup:', profileError);
          
          // Still return success for the auth part
          return {
            success: true,
            user: {
              id: signUpData.user.id,
              email: signUpData.user.email!,
              name: userData.fullName,
              role: userData.role,
              phone: userData.phone,
              avatar: signUpData.user.user_metadata?.avatar || null
            },
            session: {
              access_token: signUpData.session.access_token,
              refresh_token: signUpData.session.refresh_token,
              expires_at: Math.floor(Date.now() / 1000) + (signUpData.session.expires_in || 3600),
              expires_in: signUpData.session.expires_in || 3600
            }
          };
        }
      } else {
        // Email confirmation required
        console.log('📧 Email confirmation required');
        throw new Error('Please check your email and click the confirmation link to complete your account setup.');
      }

    } catch (error: any) {
      console.error('❌ Signup process failed:', error);
      throw error;
    }
  },

  /**
   * Login user with email and password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    console.log('🔑 Attempting direct Supabase auth login for:', credentials.email);
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (authError) {
      console.error('❌ Auth error:', authError);
      throw new Error(authError.message || 'Login failed');
    }

    if (!authData.user || !authData.session) {
      throw new Error('Authentication failed');
    }

    console.log('✅ Auth successful for user:', authData.user.email);

    // Get or create user profile - WITH BETTER ERROR HANDLING
    let profile = null;
    try {
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role, full_name, phone_number, email')
        .eq('id', authData.user.id)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, try to create it
        console.log('📝 Creating profile for new user');
        
        try {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              email: authData.user.email!,
              full_name: authData.user.user_metadata?.full_name || 'Test User',
              role: 'agent',
              status: 'offline'
            })
            .select()
            .single();

          if (createError) {
            console.error('❌ Profile creation error:', createError);
            
            // Handle RLS infinite recursion error gracefully
            if (createError.message?.includes('infinite recursion')) {
              console.warn('⚠️ RLS policy issue detected - using fallback profile');
              profile = {
                id: authData.user.id,
                full_name: authData.user.user_metadata?.full_name || 'Test User',
                role: 'agent',
                phone_number: null,
                email: authData.user.email
              };
            } else {
              // For other errors, still proceed with fallback
              console.warn('⚠️ Profile creation failed, using fallback profile');
              profile = {
                id: authData.user.id,
                full_name: authData.user.user_metadata?.full_name || 'Test User',
                role: 'agent',
                phone_number: null,
                email: authData.user.email
              };
            }
          } else {
            profile = newProfile;
            console.log('✅ Profile created:', profile);
          }
        } catch (insertError) {
          console.error('❌ Profile insert failed:', insertError);
          // Use fallback profile
          profile = {
            id: authData.user.id,
            full_name: authData.user.user_metadata?.full_name || 'Test User',
            role: 'agent',
            phone_number: null,
            email: authData.user.email
          };
        }
      } else if (profileError) {
        console.error('❌ Profile fetch error:', profileError);
        
        // Handle RLS infinite recursion error
        if (profileError.message?.includes('infinite recursion')) {
          console.warn('⚠️ RLS policy issue detected - using fallback profile');
          profile = {
            id: authData.user.id,
            full_name: authData.user.user_metadata?.full_name || 'Test User',
            role: 'agent',
            phone_number: null,
            email: authData.user.email
          };
        } else {
          throw new Error(`Profile access failed: ${profileError.message}`);
        }
      } else {
        profile = existingProfile;
        console.log('✅ Profile found:', profile);
      }
    } catch (profileAccessError: any) {
      console.error('❌ Profile access error:', profileAccessError);
      
      // Use fallback profile for any profile-related errors
      console.warn('⚠️ Using fallback profile due to database issues');
      profile = {
        id: authData.user.id,
        full_name: authData.user.user_metadata?.full_name || 'Test User',
        role: 'agent',
        phone_number: null,
        email: authData.user.email
      };
    }

    // Return the response in the expected format
    const response: LoginResponse = {
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email!,
        name: profile?.full_name || authData.user.user_metadata?.full_name || 'User',
        role: (profile?.role as 'agent' | 'supervisor' | 'admin') || 'agent',
        phone: profile?.phone_number,
        avatar: authData.user.user_metadata?.avatar_url
      },
      session: {
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
        expires_at: authData.session.expires_at || 0,
        expires_in: authData.session.expires_in || 0
      },
      rememberMe: credentials.rememberMe
    };

    console.log('✅ Login response prepared:', response.user);
    return response;
  },

  /**
   * Logout user and clear session - DIRECT SUPABASE AUTH VERSION
   */
  async logout(accessToken: string): Promise<{ success: boolean; message: string }> {
    console.log('🚪 Attempting direct Supabase auth logout');
    
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('❌ Logout error:', error);
      throw new Error(error.message || 'Logout failed');
    }

    console.log('✅ Logout successful');
    return {
      success: true,
      message: 'Logged out successfully'
    };
  },

  /**
   * Refresh authentication token - DIRECT SUPABASE AUTH VERSION
   */
  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    console.log('🔄 Attempting direct Supabase token refresh');
    
    const { data: authData, error: authError } = await supabase.auth.refreshSession({
      refresh_token: refreshToken
    });

    if (authError) {
      console.error('❌ Token refresh error:', authError);
      throw new Error(authError.message || 'Token refresh failed');
    }

    if (!authData.session || !authData.user) {
      throw new Error('Invalid refresh token');
    }

    console.log('✅ Token refresh successful');

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role, full_name, phone_number')
      .eq('id', authData.user.id)
      .single();

    return {
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email!,
        name: profile?.full_name || authData.user.user_metadata?.full_name || 'User',
        role: (profile?.role as 'agent' | 'supervisor' | 'admin') || 'agent',
        phone: profile?.phone_number,
        avatar: authData.user.user_metadata?.avatar_url
      },
      session: {
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
        expires_at: authData.session.expires_at || 0,
        expires_in: authData.session.expires_in || 0
      }
    };
  },

  /**
   * Request password reset email
   */
  async forgotPassword(email: string, redirectTo?: string): Promise<{ success: boolean; message: string; email: string }> {
    const response = await fetch(`${supabaseUrl}/functions/v1/auth-forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({ email, redirectTo }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Password reset request failed');
    }

    return data;
  },

  /**
   * Reset password with tokens from email link
   */
  async resetPassword(accessToken: string, refreshToken: string, newPassword: string): Promise<{ success: boolean; message: string; user: any }> {
    const response = await fetch(`${supabaseUrl}/functions/v1/auth-reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({ 
        access_token: accessToken, 
        refresh_token: refreshToken, 
        new_password: newPassword 
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Password reset failed');
    }

    return data;
  },
};

export default supabase; 