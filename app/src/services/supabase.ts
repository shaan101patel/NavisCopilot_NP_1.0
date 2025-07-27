import { createClient } from '@supabase/supabase-js';
import { Settings } from 'node:http2';

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

// Add to authAPI object in supabase.ts
export const profileAPI = {
  // GET /api/users/{id} - Get user profile data
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  // PUT /api/users/{id} - Update user profile using Edge Function
  async updateProfile(updates: {
    full_name?: string;
    department?: string;
    title?: string;
    phone_number?: string;
    avatar?: string;
  }) {
    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/update-profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.data.session.access_token}`,
      },
      body: JSON.stringify(updates),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update profile');
    }

    return data;
  },

  // GET /api/users/{id}/settings - Get user preferences using Edge Function
  async getUserSettings() {
    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/update-user-settings`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.data.session.access_token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch settings');
    }

    return data.settings;
  },

  // PUT /api/users/{id}/settings - Update user settings using Edge Function
  async updateUserSettings(settings: {
    notifications?: {
      email?: boolean;
      push?: boolean;
      callReminders?: boolean;
      ticketUpdates?: boolean;
      systemAlerts?: boolean;
      messages?: boolean;
    };
    preferences?: {
      theme?: string;
      language?: string;
      timezone?: string;
      autoSave?: boolean;
      soundEffects?: boolean;
      keyboardShortcuts?: boolean;
    };
    security?: {
      sessionTimeout?: number;
      twoFactorEnabled?: boolean;
    };
    ui_preferences?: {
      notesViewMode?: string;
      defaultCallView?: string;
      sidebarCollapsed?: boolean;
    };
  }) {
    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/update-user-settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.data.session.access_token}`,
      },
      body: JSON.stringify(settings),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update settings');
    }

    return data;
  },

  // POST /api/users/upload-avatar - Upload avatar using Edge Function
  async uploadAvatar(file: File) {
    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      throw new Error('Not authenticated');
    }

    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(`${supabaseUrl}/functions/v1/upload-avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.data.session.access_token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to upload avatar');
    }

    return data;
  },

  // GET /api/inbound-numbers - Get agent inbound numbers
  async getInboundNumbers() {
    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/manage-inbound-numbers`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.data.session.access_token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch inbound numbers');
    }

    return data.agents;
  },

  // PUT /api/inbound-numbers - Update agent phone number
  async updateInboundNumber(agentId: string, phoneNumber: string | null) {
    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/manage-inbound-numbers`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.data.session.access_token}`,
      },
      body: JSON.stringify({
        agent_id: agentId,
        phone_number: phoneNumber,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update phone number');
    }

    return data;
  },
};

export default supabase;

// Call Session Management API functions
export const callAPI = {
  /**
   * Create a new call session
   * POST /api/calls/sessions/create
   */
  async createCallSession(sessionData: {
    agentId: string;
    sessionType: 'outbound' | 'inbound' | 'transfer';
    customerPhone?: string;
    customerName?: string;
    priority?: 'low' | 'medium' | 'high';
  }): Promise<{
    sessionId: string;
    tabId: string;
    callId: string;
    status: 'initializing' | 'ready';
  }> {
    console.log('📞 Creating new call session for agent:', sessionData.agentId);
    
    try {
      // Create call record in database
      const { data: callData, error: callError } = await supabase
        .from('calls')
        .insert({
          agent_id: sessionData.agentId,
          customer_phone: sessionData.customerPhone || null,
          customer_name: sessionData.customerName || null,
          direction: sessionData.sessionType === 'outbound' ? 'outbound' : 'inbound',
          status: 'active',
          start_time: new Date().toISOString(),
          transcript: [],
          ai_suggestions: []
        })
        .select()
        .single();

      if (callError) {
        console.error('❌ Call creation error:', callError);
        throw new Error(callError.message || 'Failed to create call session');
      }

      const sessionId = `session-${Date.now()}`;
      const tabId = `tab-${Date.now()}`;

      console.log('✅ Call session created:', {
        sessionId,
        tabId,
        callId: callData.id,
        status: 'ready'
      });

      return {
        sessionId,
        tabId,
        callId: callData.id,
        status: 'ready'
      };
    } catch (error: any) {
      console.error('❌ Call session creation failed:', error);
      throw error;
    }
  },

  /**
   * Get call session details
   * GET /api/calls/sessions/{id}
   */
  async getCallSession(callId: string): Promise<{
    callId: string;
    agentId: string;
    status: 'incoming' | 'active' | 'on-hold' | 'completed' | 'failed' | 'missed';
    startTime: string;
    endTime?: string;
    transcript: any[];
    aiSuggestions: any[];
    customerInfo?: {
      name?: string;
      phone?: string;
    };
  }> {
    console.log('📞 Fetching call session:', callId);
    
    try {
      const { data: callData, error: callError } = await supabase
        .from('calls')
        .select('*')
        .eq('id', callId)
        .single();

      if (callError) {
        console.error('❌ Call fetch error:', callError);
        throw new Error(callError.message || 'Call session not found');
      }

      if (!callData) {
        throw new Error('Call session not found');
      }

      console.log('✅ Call session fetched:', callData);

      return {
        callId: callData.id,
        agentId: callData.agent_id!,
        status: callData.status!,
        startTime: callData.start_time!,
        endTime: callData.end_time || undefined,
        transcript: callData.transcript || [],
        aiSuggestions: callData.ai_suggestions || [],
        customerInfo: {
          // This would come from a separate customer_info table or call metadata
          name: 'Customer',
          phone: '+1 (555) 123-4567'
        }
      };
    } catch (error: any) {
      console.error('❌ Call session fetch failed:', error);
      throw error;
    }
  },

  /**
   * Activate/switch to call session
   * PUT /api/calls/sessions/{id}/activate
   */
  async activateCallSession(callId: string): Promise<{
    success: boolean;
    callId: string;
    status: 'active';
  }> {
    console.log('📞 Activating call session:', callId);
    
    try {
      const { data: callData, error: callError } = await supabase
        .from('calls')
        .update({
          status: 'active',
          // Could add last_activated_at timestamp here
        })
        .eq('id', callId)
        .select()
        .single();

      if (callError) {
        console.error('❌ Call activation error:', callError);
        throw new Error(callError.message || 'Failed to activate call session');
      }

      console.log('✅ Call session activated:', callData);

      return {
        success: true,
        callId: callData.id,
        status: 'active'
      };
    } catch (error: any) {
      console.error('❌ Call session activation failed:', error);
      throw error;
    }
  },

  /**
   * End call session
   * DELETE /api/calls/sessions/{id}
   */
  async endCallSession(callId: string, endReason?: string): Promise<{
    success: boolean;
    callId: string;
    endedAt: string;
  }> {
    console.log('📞 Ending call session:', callId, 'Reason:', endReason);
    
    try {
      const { data: callData, error: callError } = await supabase
        .from('calls')
        .update({
          status: 'completed',
          end_time: new Date().toISOString()
        })
        .eq('id', callId)
        .select()
        .single();

      if (callError) {
        console.error('❌ Call end error:', callError);
        throw new Error(callError.message || 'Failed to end call session');
      }

      console.log('✅ Call session ended:', callData);

      return {
        success: true,
        callId: callData.id,
        endedAt: callData.end_time!
      };
    } catch (error: any) {
      console.error('❌ Call session end failed:', error);
      throw error;
    }
  },

  /**
   * Put call on hold
   * POST /api/calls/{id}/hold
   */
  async holdCall(callId: string, holdReason?: string): Promise<{
    success: boolean;
    callStatus: 'on-hold';
    holdStartTime: string;
  }> {
    console.log('📞 Putting call on hold:', callId, 'Reason:', holdReason);
    
    try {
      // Note: We need to extend the calls table to support 'on-hold' status
      // For now, we'll use a workaround by storing hold info in ai_suggestions
      const holdInfo = {
        type: 'hold',
        reason: holdReason || 'Agent requested hold',
        startTime: new Date().toISOString()
      };

      const { data: callData, error: callError } = await supabase
        .from('calls')
        .update({
          status: 'on-hold',
          ai_suggestions: [holdInfo]
        })
        .eq('id', callId)
        .select()
        .single();

      if (callError) {
        console.error('❌ Call hold error:', callError);
        throw new Error(callError.message || 'Failed to put call on hold');
      }

      console.log('✅ Call put on hold:', callData);

      return {
        success: true,
        callStatus: 'on-hold',
        holdStartTime: holdInfo.startTime
      };
    } catch (error: any) {
      console.error('❌ Call hold failed:', error);
      throw error;
    }
  },

  /**
   * Resume held call
   * POST /api/calls/{id}/resume
   */
  async resumeCall(callId: string): Promise<{
    success: boolean;
    callStatus: 'active';
    resumedAt: string;
  }> {
    console.log('📞 Resuming call:', callId);
    
    try {
      const { data: callData, error: callError } = await supabase
        .from('calls')
        .update({
          status: 'active'
          // Clear hold info from ai_suggestions if needed
        })
        .eq('id', callId)
        .select()
        .single();

      if (callError) {
        console.error('❌ Call resume error:', callError);
        throw new Error(callError.message || 'Failed to resume call');
      }

      console.log('✅ Call resumed:', callData);

      return {
        success: true,
        callStatus: 'active',
        resumedAt: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('❌ Call resume failed:', error);
      throw error;
    }
  },

  /**
   * End active call
   * POST /api/calls/{id}/end
   */
  async endCall(callId: string, endReason: string = 'agent_hangup', callSummary?: string): Promise<{
    success: boolean;
    callId: string;
    endedAt: string;
  }> {
    console.log('📞 Ending call:', callId, 'Reason:', endReason);
    
    try {
      const { data: callData, error: callError } = await supabase
        .from('calls')
        .update({
          status: 'completed',
          end_time: new Date().toISOString()
        })
        .eq('id', callId)
        .select()
        .single();

      if (callError) {
        console.error('❌ Call end error:', callError);
        throw new Error(callError.message || 'Failed to end call');
      }

      console.log('✅ Call ended:', callData);

      return {
        success: true,
        callId: callData.id,
        endedAt: callData.end_time!
      };
    } catch (error: any) {
      console.error('❌ Call end failed:', error);
      throw error;
    }
  },

  /**
   * Transfer call to another agent
   * POST /api/calls/{id}/transfer
   */
  async transferCall(callId: string, targetAgentId: string, transferReason?: string): Promise<{
    success: boolean;
    callId: string;
    transferredTo: string;
    transferredAt: string;
  }> {
    console.log('📞 Transferring call:', callId, 'to agent:', targetAgentId);
    
    try {
      // Get original call data to copy customer information
      const { data: originalCall, error: getError } = await supabase
        .from('calls')
        .select('customer_phone, customer_name, direction')
        .eq('id', callId)
        .single();

      if (getError) {
        console.error('❌ Error getting original call data:', getError);
        throw new Error(getError.message || 'Failed to get original call data');
      }

      // Create a new call record for the transfer
      const { data: newCallData, error: newCallError } = await supabase
        .from('calls')
        .insert({
          agent_id: targetAgentId,
          customer_phone: originalCall.customer_phone,
          customer_name: originalCall.customer_name,
          direction: originalCall.direction,
          status: 'active',
          start_time: new Date().toISOString(),
          transcript: [],
          ai_suggestions: []
        })
        .select()
        .single();

      if (newCallError) {
        console.error('❌ Transfer call creation error:', newCallError);
        throw new Error(newCallError.message || 'Failed to create transfer call');
      }

      // End the original call
      await this.endCall(callId, 'transferred', transferReason);

      console.log('✅ Call transferred:', {
        originalCallId: callId,
        newCallId: newCallData.id,
        targetAgentId
      });

      return {
        success: true,
        callId: newCallData.id,
        transferredTo: targetAgentId,
        transferredAt: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('❌ Call transfer failed:', error);
      throw error;
    }
  },

  /**
   * Add transcript segment to call
   * POST /api/calls/{id}/transcript
   */
  async addTranscriptSegment(callId: string, segment: {
    speaker: 'agent' | 'customer';
    text: string;
    timestamp: string;
  }): Promise<{
    success: boolean;
    segmentId: string;
  }> {
    console.log('📝 Adding transcript segment to call:', callId);
    
    try {
      // Get current transcript
      const { data: currentCall, error: fetchError } = await supabase
        .from('calls')
        .select('transcript')
        .eq('id', callId)
        .single();

      if (fetchError) {
        console.error('❌ Call fetch error:', fetchError);
        throw new Error(fetchError.message || 'Call not found');
      }

      // Add new segment
      const currentTranscript = currentCall.transcript || [];
      const newTranscript = [...currentTranscript, {
        id: `segment-${Date.now()}`,
        ...segment
      }];

      // Update call with new transcript
      const { data: updatedCall, error: updateError } = await supabase
        .from('calls')
        .update({
          transcript: newTranscript
        })
        .eq('id', callId)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Transcript update error:', updateError);
        throw new Error(updateError.message || 'Failed to update transcript');
      }

      console.log('✅ Transcript segment added:', segment);

      return {
        success: true,
        segmentId: `segment-${Date.now()}`
      };
    } catch (error: any) {
      console.error('❌ Transcript segment addition failed:', error);
      throw error;
    }
  },

  /**
   * Get complete call transcript from calls table
   * GET /api/calls/{id}/transcript
   */
  async getCallTranscriptFromCalls(callId: string): Promise<{
    callId: string;
    transcript: any[];
  }> {
    console.log('📝 Fetching call transcript from calls table:', callId);
    
    try {
      const { data: callData, error: callError } = await supabase
        .from('calls')
        .select('id, transcript')
        .eq('id', callId)
        .single();

      if (callError) {
        console.error('❌ Call fetch error:', callError);
        throw new Error(callError.message || 'Call not found');
      }

      console.log('✅ Call transcript fetched:', callData.transcript?.length || 0, 'segments');

      return {
        callId: callData.id,
        transcript: callData.transcript || []
      };
    } catch (error: any) {
      console.error('❌ Call transcript fetch failed:', error);
      throw error;
    }
  },

  /**
   * Send message to AI assistant
   * POST /api/ai/chat
   */
  async sendAiChatMessage(messageData: {
    callId: string;
    message: string;
    responseLevel: 'instant' | 'quick' | 'immediate';
    context?: {
      transcript?: any[];
      notes?: any[];
      customerInfo?: any;
    };
  }): Promise<{
    success: boolean;
    response: string;
    suggestions?: string[];
    confidence: number;
    responseId: string;
  }> {
    console.log('🤖 Sending AI chat message for call:', messageData.callId);
    
    try {
      // Store the agent's message in the database
      const { data: agentMessage, error: agentMessageError } = await supabase
        .from('ai_chat_messages')
        .insert({
          call_id: messageData.callId,
          content: messageData.message,
          sender: 'agent',
          ai_response_level: messageData.responseLevel,
        })
        .select()
        .single();

      if (agentMessageError) {
        console.error('❌ Agent message storage error:', agentMessageError);
        throw new Error(agentMessageError.message || 'Failed to store agent message');
      }

      // Simulate AI processing (In production, this would call an AI service)
      await new Promise(resolve => setTimeout(resolve, 800));

      // Generate AI response based on message content and level
      let aiResponse = '';
      let suggestions: string[] = [];
      let confidence = 0.85;

      const messageText = messageData.message.toLowerCase();
      
      // Context-aware responses based on message content
      if (messageText.includes('refund') || messageText.includes('return')) {
        if (messageData.responseLevel === 'instant') {
          aiResponse = "Check our refund policy: 30-day returns for most items.";
        } else if (messageData.responseLevel === 'quick') {
          aiResponse = "For refund requests, verify the purchase date and item condition. Our standard policy allows 30-day returns. Check if customer is within the window and item meets return criteria.";
          suggestions = [
            "Ask for order number",
            "Verify purchase date", 
            "Check return policy exceptions"
          ];
        } else {
          aiResponse = "REFUND REQUEST ANALYSIS:\n\n1. **Policy Check**: Standard 30-day return window\n2. **Verification**: Confirm order number and purchase date\n3. **Condition**: Item must be unused/original packaging\n4. **Exceptions**: Electronics have 14-day window\n5. **Next Steps**: If eligible, initiate return label\n\nRECOMMENDED APPROACH: Start with empathy, then verify eligibility before explaining process.";
          suggestions = [
            "Express understanding of frustration",
            "Request order details for verification",
            "Explain step-by-step return process",
            "Offer expedited processing if customer is VIP"
          ];
          confidence = 0.92;
        }
      } else if (messageText.includes('billing') || messageText.includes('charge')) {
        if (messageData.responseLevel === 'instant') {
          aiResponse = "Help customer understand their billing. Ask for account details.";
        } else if (messageData.responseLevel === 'quick') {
          aiResponse = "For billing inquiries, verify the customer's identity first, then review their recent charges. Look for any recurring subscriptions or recent purchases that might explain the charge.";
          suggestions = [
            "Verify account ownership",
            "Review recent transactions",
            "Check for recurring charges"
          ];
        } else {
          aiResponse = "BILLING INQUIRY WORKFLOW:\n\n1. **Identity Verification**: Confirm last 4 digits of payment method\n2. **Account Review**: Check recent transactions (last 3 months)\n3. **Charge Analysis**: Look for recurring subscriptions, trial conversions\n4. **Resolution Path**: Dispute if unauthorized, explain if legitimate\n\nCOMMON CAUSES:\n- Trial period ending\n- Annual subscription renewal\n- Family member purchases\n- Forgotten subscription";
          suggestions = [
            "Ask for specific charge amount and date",
            "Verify payment method on file",
            "Review subscription status",
            "Explain charge if legitimate, dispute if unauthorized"
          ];
          confidence = 0.89;
        }
      } else if (messageText.includes('technical') || messageText.includes('not working')) {
        if (messageData.responseLevel === 'instant') {
          aiResponse = "Start with basic troubleshooting steps.";
        } else {
          aiResponse = "TECHNICAL SUPPORT PROTOCOL:\n\n1. **Problem Identification**: Get specific error messages\n2. **Basic Troubleshooting**: Restart, update, check connections\n3. **Advanced Steps**: Clear cache, reinstall if needed\n4. **Escalation**: Technical team if hardware issue\n\nGather device info, OS version, and exact error messages.";
          suggestions = [
            "Ask for device model and OS version",
            "Request screenshot of error",
            "Guide through restart process",
            "Escalate to technical team if needed"
          ];
          confidence = 0.88;
        }
      } else {
        // Generic responses
        if (messageData.responseLevel === 'instant') {
          aiResponse = "I'm here to help. What specific issue is the customer experiencing?";
        } else if (messageData.responseLevel === 'quick') {
          aiResponse = "For general inquiries, start by understanding the customer's main concern. Use active listening and ask clarifying questions to provide the most relevant assistance.";
          suggestions = [
            "Ask clarifying questions",
            "Listen actively to customer needs",
            "Offer specific solutions"
          ];
        } else {
          aiResponse = "GENERAL CUSTOMER SERVICE APPROACH:\n\n1. **Active Listening**: Let customer fully explain their situation\n2. **Empathy**: Acknowledge their frustration or concern\n3. **Clarification**: Ask specific questions to understand the issue\n4. **Solution-Focused**: Offer concrete next steps\n5. **Follow-up**: Ensure customer satisfaction\n\nRemember to maintain a positive, helpful tone throughout the interaction.";
          suggestions = [
            "Show empathy and understanding",
            "Ask specific clarifying questions",
            "Provide clear next steps",
            "Confirm customer satisfaction"
          ];
          confidence = 0.82;
        }
      }

      // Store AI response in database
      const { data: aiResponseMessage, error: aiResponseError } = await supabase
        .from('ai_chat_messages')
        .insert({
          call_id: messageData.callId,
          content: aiResponse,
          sender: 'ai',
          ai_response_level: messageData.responseLevel,
        })
        .select()
        .single();

      if (aiResponseError) {
        console.error('❌ AI response storage error:', aiResponseError);
        // Continue despite storage error - return response anyway
      }

      console.log('✅ AI chat message processed successfully');

      return {
        success: true,
        response: aiResponse,
        suggestions,
        confidence,
        responseId: aiResponseMessage?.id || `ai-response-${Date.now()}`
      };
    } catch (error: any) {
      console.error('❌ AI chat message failed:', error);
      throw error;
    }
  },

  /**
   * Generate AI call summary
   * POST /api/ai/generate-summary
   */
  async generateAiSummary(summaryData: {
    callId: string;
    transcript: any[];
    notes?: any[];
    customerInfo?: any;
    summaryType?: 'brief' | 'detailed' | 'action_items';
  }): Promise<{
    success: boolean;
    summary: string;
    keyPoints: string[];
    actionItems: string[];
    sentiment: 'positive' | 'neutral' | 'negative';
    summaryId: string;
  }> {
    console.log('📝 Generating AI summary for call:', summaryData.callId);
    
    try {
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 1200));

      const summaryType = summaryData.summaryType || 'detailed';
      const transcript = summaryData.transcript || [];
      const notes = summaryData.notes || [];

      // Analyze transcript for key themes and sentiment
      const transcriptText = transcript.map(t => t.text || t.content || '').join(' ').toLowerCase();
      
      // Determine sentiment based on transcript content
      let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
      const positiveWords = ['thank', 'great', 'perfect', 'excellent', 'helpful', 'appreciate', 'satisfied'];
      const negativeWords = ['problem', 'issue', 'frustrated', 'angry', 'terrible', 'awful', 'disappointed'];
      
      const positiveCount = positiveWords.filter(word => transcriptText.includes(word)).length;
      const negativeCount = negativeWords.filter(word => transcriptText.includes(word)).length;
      
      if (positiveCount > negativeCount && positiveCount > 1) {
        sentiment = 'positive';
      } else if (negativeCount > positiveCount && negativeCount > 1) {
        sentiment = 'negative';
      }

      // Generate summary based on type and content
      let summary = '';
      let keyPoints: string[] = [];
      let actionItems: string[] = [];

      if (summaryType === 'brief') {
        if (transcriptText.includes('refund') || transcriptText.includes('return')) {
          summary = 'Customer contacted regarding a refund request. Issue was resolved by following standard return policy procedures.';
          keyPoints = ['Refund request', 'Policy review', 'Resolution provided'];
          actionItems = ['Process return if eligible', 'Send return label'];
        } else if (transcriptText.includes('billing') || transcriptText.includes('charge')) {
          summary = 'Customer inquiry about billing charges. Account was reviewed and charges were explained.';
          keyPoints = ['Billing inquiry', 'Account review', 'Charges explained'];
          actionItems = ['Follow up on any disputed charges'];
        } else {
          summary = 'Customer service call completed. Customer issue was addressed and resolved.';
          keyPoints = ['Customer contacted support', 'Issue addressed', 'Resolution provided'];
          actionItems = ['Follow up if needed'];
        }
      } else if (summaryType === 'action_items') {
        summary = 'Action items identified from customer call:';
        if (transcriptText.includes('refund')) {
          actionItems = [
            'Verify return eligibility (30-day window)',
            'Process return authorization',
            'Send prepaid return label',
            'Initiate refund once item received'
          ];
        } else if (transcriptText.includes('technical')) {
          actionItems = [
            'Escalate to technical support team',
            'Schedule follow-up call in 24 hours',
            'Send troubleshooting guide via email'
          ];
        } else {
          actionItems = [
            'Follow up with customer within 24 hours',
            'Document resolution in customer record',
            'Update internal knowledge base if needed'
          ];
        }
        keyPoints = ['Call completed', 'Next steps identified'];
      } else {
        // Detailed summary
        if (transcriptText.includes('refund') || transcriptText.includes('return')) {
          summary = `CALL SUMMARY - REFUND REQUEST

**Customer Issue**: Customer requested a refund for a recent purchase due to [specific reason would be extracted from transcript].

**Resolution Process**:
1. Verified customer identity and order details
2. Reviewed return policy and eligibility (30-day window)
3. Confirmed item condition and return criteria
4. Initiated return process with prepaid label

**Outcome**: Customer satisfied with resolution. Return label sent via email. Refund will be processed upon item receipt (3-5 business days).

**Customer Sentiment**: ${sentiment === 'positive' ? 'Customer was understanding and appreciative of the quick resolution' : sentiment === 'negative' ? 'Customer was initially frustrated but became more satisfied as issue was resolved' : 'Customer remained neutral throughout the interaction'}`;

          keyPoints = [
            'Refund request for recent purchase',
            'Eligibility confirmed within policy',
            'Return process initiated successfully',
            'Customer provided with clear next steps'
          ];
          
          actionItems = [
            'Process return authorization in system',
            'Email return shipping label to customer',
            'Monitor return shipment tracking',
            'Process refund upon item receipt',
            'Send confirmation email when refund completed'
          ];
        } else if (transcriptText.includes('billing') || transcriptText.includes('charge')) {
          summary = `CALL SUMMARY - BILLING INQUIRY

**Customer Issue**: Customer contacted regarding unexpected charges on their account.

**Investigation Results**:
1. Verified customer identity and account access
2. Reviewed recent billing history and transactions
3. Identified charge source (subscription renewal/trial conversion)
4. Explained billing cycle and charge details

**Resolution**: Customer understood the charges after explanation. No dispute necessary.

**Customer Sentiment**: ${sentiment === 'positive' ? 'Customer was satisfied with the explanation' : sentiment === 'negative' ? 'Customer was initially concerned but understood after clarification' : 'Customer accepted the explanation'}`;

          keyPoints = [
            'Billing inquiry about recent charges',
            'Account review completed',
            'Charges explained and justified',
            'Customer understanding achieved'
          ];
          
          actionItems = [
            'Update customer communication preferences',
            'Send detailed billing summary via email',
            'Schedule reminder for next billing cycle'
          ];
        } else {
          summary = `CALL SUMMARY - GENERAL CUSTOMER SERVICE

**Customer Issue**: Customer contacted support with a general inquiry/concern.

**Service Provided**:
1. Listened to customer's concerns and questions
2. Provided relevant information and guidance
3. Offered appropriate solutions and next steps
4. Ensured customer satisfaction before call completion

**Outcome**: Customer's questions were answered and issue was resolved to their satisfaction.

**Customer Sentiment**: ${sentiment === 'positive' ? 'Customer was pleased with the service' : sentiment === 'negative' ? 'Customer had concerns but they were addressed' : 'Customer was neutral throughout the interaction'}`;

          keyPoints = [
            'Customer inquiry addressed',
            'Information provided',
            'Appropriate solutions offered',
            'Customer satisfaction confirmed'
          ];
          
          actionItems = [
            'Document interaction in customer record',
            'Follow up if additional questions arise',
            'Update FAQ if common question identified'
          ];
        }
      }

      // Store summary in database (using ai_insights table or calls table)
      const { data: callData, error: updateError } = await supabase
        .from('calls')
        .update({
          notes: summary, // Store summary in notes field
          // Could also store in ai_suggestions field as structured data
          ai_suggestions: {
            summary,
            keyPoints,
            actionItems,
            sentiment,
            summaryType,
            generatedAt: new Date().toISOString()
          }
        })
        .eq('id', summaryData.callId)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Summary storage error:', updateError);
        // Continue despite storage error
      }

      console.log('✅ AI summary generated successfully');

      return {
        success: true,
        summary,
        keyPoints,
        actionItems,
        sentiment,
        summaryId: `summary-${summaryData.callId}-${Date.now()}`
      };
    } catch (error: any) {
      console.error('❌ AI summary generation failed:', error);
      throw error;
    }
  },

  // ===== CALL-SPECIFIC STATE MANAGEMENT =====
  
  /**
   * Get all notes for a specific call
   */
  async getCallNotes(callId: string): Promise<{
    success: boolean;
    notes: any[];
    documentNotes: string;
  }> {
    try {
      console.log('📝 Getting notes for call:', callId);
      
      // Get sticky notes
      const { data: stickyNotes, error: stickyError } = await supabase
        .from('call_notes')
        .select('*')
        .eq('call_id', callId)
        .eq('note_type', 'sticky')
        .order('created_at', { ascending: false });

      if (stickyError) {
        throw new Error(`Failed to get sticky notes: ${stickyError.message}`);
      }

      // Get document notes
      const { data: docNotes, error: docError } = await supabase
        .from('call_notes')
        .select('*')
        .eq('call_id', callId)
        .eq('note_type', 'document')
        .maybeSingle();

      if (docError) {
        throw new Error(`Failed to get document notes: ${docError.message}`);
      }

      const formattedNotes = (stickyNotes || []).map(note => ({
        id: note.id,
        content: note.content,
        color: note.color || 'yellow',
        createdAt: new Date(note.created_at),
        updatedAt: note.updated_at ? new Date(note.updated_at) : undefined,
        position: note.position || { x: 0, y: 0 }
      }));

      return {
        success: true,
        notes: formattedNotes,
        documentNotes: docNotes?.content || ''
      };
    } catch (error: any) {
      console.error('❌ Failed to get call notes:', error);
      throw error;
    }
  },

  /**
   * Create a new note for a specific call
   */
  async createCallNote(callId: string, noteData: {
    content: string;
    noteType: 'sticky' | 'document';
    color?: string;
    position?: { x: number; y: number };
  }): Promise<{ success: boolean; note: any }> {
    try {
      console.log('📝 Creating note for call:', callId);
      
      // Get current user from auth
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data: note, error } = await supabase
        .from('call_notes')
        .insert({
          call_id: callId,
          user_id: user.id,
          note_type: noteData.noteType,
          content: noteData.content,
          color: noteData.color || 'yellow',
          position: noteData.position || { x: 0, y: 0 }
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create note: ${error.message}`);
      }

      return {
        success: true,
        note: {
          id: note.id,
          content: note.content,
          color: note.color,
          createdAt: new Date(note.created_at),
          position: note.position
        }
      };
    } catch (error: any) {
      console.error('❌ Failed to create call note:', error);
      throw error;
    }
  },

  /**
   * Update a note for a specific call
   */
  async updateCallNote(noteId: string, updates: {
    content?: string;
    color?: string;
    position?: { x: number; y: number };
  }): Promise<{ success: boolean; note: any }> {
    try {
      console.log('📝 Updating note:', noteId);
      
      const { data: note, error } = await supabase
        .from('call_notes')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', noteId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update note: ${error.message}`);
      }

      return {
        success: true,
        note: {
          id: note.id,
          content: note.content,
          color: note.color,
          createdAt: new Date(note.created_at),
          updatedAt: new Date(note.updated_at),
          position: note.position
        }
      };
    } catch (error: any) {
      console.error('❌ Failed to update call note:', error);
      throw error;
    }
  },

  /**
   * Delete a note for a specific call
   */
  async deleteCallNote(noteId: string): Promise<{ success: boolean }> {
    try {
      console.log('📝 Deleting note:', noteId);
      
      const { error } = await supabase
        .from('call_notes')
        .delete()
        .eq('id', noteId);

      if (error) {
        throw new Error(`Failed to delete note: ${error.message}`);
      }

      return { success: true };
    } catch (error: any) {
      console.error('❌ Failed to delete call note:', error);
      throw error;
    }
  },

  /**
   * Get AI chat messages for a specific call
   */
  async getCallAiChatMessages(callId: string): Promise<{
    success: boolean;
    messages: any[];
  }> {
    try {
      console.log('🤖 Getting AI chat messages for call:', callId);
      
      const { data: messages, error } = await supabase
        .from('ai_chat_messages')
        .select('*')
        .eq('call_id', callId)
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(`Failed to get AI chat messages: ${error.message}`);
      }

      const formattedMessages = (messages || []).map(msg => ({
        id: msg.id,
        content: msg.content,
        sender: msg.sender,
        timestamp: new Date(msg.timestamp || msg.created_at),
        aiResponseLevel: msg.ai_response_level,
        suggestions: msg.suggestions || [],
        confidence: msg.confidence
      }));

      return {
        success: true,
        messages: formattedMessages
      };
    } catch (error: any) {
      console.error('❌ Failed to get AI chat messages:', error);
      throw error;
    }
  },

  /**
   * Get transcript segments for a specific call
   */
  async getCallTranscript(callId: string): Promise<{
    success: boolean;
    transcript: any[];
  }> {
    try {
      console.log('📝 Getting transcript for call:', callId);
      
      const { data: segments, error } = await supabase
        .from('transcript_segments')
        .select('*')
        .eq('call_id', callId)
        .order('sequence_number', { ascending: true });

      if (error) {
        throw new Error(`Failed to get transcript: ${error.message}`);
      }

      const formattedTranscript = (segments || []).map(segment => ({
        id: segment.segment_id || segment.id,
        speaker: segment.speaker,
        text: segment.text,
        timestamp: new Date(segment.timestamp),
        confidence: segment.confidence,
        sentiment: segment.sentiment
      }));

      return {
        success: true,
        transcript: formattedTranscript
      };
    } catch (error: any) {
      console.error('❌ Failed to get call transcript:', error);
      throw error;
    }
  },

  /**
   * Add transcript segment for a specific call
   */
  async addCallTranscriptSegment(callId: string, segmentData: {
    speaker: 'agent' | 'customer';
    text: string;
    timestamp?: Date;
    confidence?: number;
    sentiment?: 'positive' | 'neutral' | 'negative';
  }): Promise<{ success: boolean; segment: any }> {
    try {
      console.log('📝 Adding transcript segment for call:', callId);
      
      // Get next sequence number
      const { data: existingSegments, error: countError } = await supabase
        .from('transcript_segments')
        .select('sequence_number')
        .eq('call_id', callId)
        .order('sequence_number', { ascending: false })
        .limit(1);

      if (countError) {
        throw new Error(`Failed to get sequence number: ${countError.message}`);
      }

      const nextSequence = existingSegments && existingSegments.length > 0 
        ? existingSegments[0].sequence_number + 1 
        : 1;

      const { data: segment, error } = await supabase
        .from('transcript_segments')
        .insert({
          call_id: callId,
          segment_id: `segment-${callId}-${nextSequence}`,
          sequence_number: nextSequence,
          speaker: segmentData.speaker,
          text: segmentData.text,
          timestamp: segmentData.timestamp || new Date(),
          confidence: segmentData.confidence || 0.95,
          sentiment: segmentData.sentiment || 'neutral'
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to add transcript segment: ${error.message}`);
      }

      return {
        success: true,
        segment: {
          id: segment.segment_id,
          speaker: segment.speaker,
          text: segment.text,
          timestamp: new Date(segment.timestamp),
          confidence: segment.confidence,
          sentiment: segment.sentiment
        }
      };
    } catch (error: any) {
      console.error('❌ Failed to add transcript segment:', error);
      throw error;
    }
  },
}; 