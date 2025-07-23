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

  // PUT /api/users/{id} - Update user profile
  async updateProfile(userId: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: updates.name,
        phone_number: updates.phone,
        updated_at: new Date().toISOString(),
        ...updates
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // GET /api/users/{id}/settings - Get user preferences
  async getUserSettings(userId: string) {
    // Add user_settings table or use JSONB in profiles
  },

  // PUT /api/users/{id}/settings - Update user settings
  async updateUserSettings(userId: string, settings: Settings) {
    // Save to user_settings table or profiles.preferences JSONB
  },

  // GET /api/users/{id}/inbound-numbers - Get agent's phone numbers
  async getInboundNumbers(userId: string) {
    // Query inbound_numbers table or similar
  }
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
   * Get complete call transcript
   * GET /api/calls/{id}/transcript
   */
  async getCallTranscript(callId: string): Promise<{
    callId: string;
    transcript: any[];
  }> {
    console.log('📝 Fetching call transcript:', callId);
    
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


}; 