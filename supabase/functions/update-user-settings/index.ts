import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

interface UserSettings {
  theme?: 'light' | 'dark';
  notifications?: boolean;
  language?: string;
  timezone?: string;
  [key: string]: any;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user from JWT token
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const userId = user.id;

    if (req.method === 'GET') {
      // Fetch user settings
      const { data: settings, error } = await supabaseClient
        .from('user_settings')
        .select('notifications, preferences, security, ui_preferences')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching settings:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch settings' }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // If no settings found, return default settings
      const userSettings = settings || {
        notifications: {
          push: true,
          email: true,
          messages: true,
          systemAlerts: true,
          callReminders: true,
          ticketUpdates: true
        },
        preferences: {
          theme: 'light',
          autoSave: true,
          language: 'en',
          timezone: 'UTC',
          soundEffects: true,
          keyboardShortcuts: true
        },
        security: {
          sessionTimeout: 480,
          twoFactorEnabled: false
        },
        ui_preferences: {
          notesViewMode: 'sticky',
          defaultCallView: 'transcript',
          sidebarCollapsed: false
        }
      };

      return new Response(
        JSON.stringify(userSettings),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (req.method === 'PUT') {
      // Update user settings
      const body = await req.json();
      
      // Prepare the update data based on what's provided
      const updateData: any = {
        user_id: userId,
        updated_at: new Date().toISOString()
      };

      if (body.notifications) {
        updateData.notifications = body.notifications;
      }
      if (body.preferences) {
        updateData.preferences = body.preferences;
      }
      if (body.security) {
        updateData.security = body.security;
      }
      if (body.ui_preferences) {
        updateData.ui_preferences = body.ui_preferences;
      }

      // Upsert user settings
      const { data, error } = await supabaseClient
        .from('user_settings')
        .upsert(updateData, {
          onConflict: 'user_id'
        })
        .select('notifications, preferences, security, ui_preferences')
        .single();

      if (error) {
        console.error('Error updating settings:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to update settings' }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      return new Response(
        JSON.stringify(data),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Method not allowed
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
