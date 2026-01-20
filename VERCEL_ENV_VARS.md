# Vercel Environment Variables Configuration

This document lists all environment variables required for deploying the Navis Copilot application to Vercel.

## Required Environment Variables

### Supabase Configuration

These are **required** for the application to function properly:

- **`REACT_APP_SUPABASE_URL`**
  - Description: Your Supabase project URL
  - Example: `https://fjdurojwqtqoydmqjvmk.supabase.co`
  - Where to find: Supabase Dashboard > Project Settings > API > Project URL

- **`REACT_APP_SUPABASE_ANON_KEY`**
  - Description: Your Supabase anonymous/public API key
  - Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
  - Where to find: Supabase Dashboard > Project Settings > API > Project API keys > `anon` `public`
  - Note: This is safe to expose in client-side code as it's the public key

## Optional Environment Variables

### Groq API Configuration

These are optional and only needed if using the transcription features:

- **`REACT_APP_GROQ_API_KEY`**
  - Description: API key for Groq speech-to-text service
  - Required for: Real-time transcription features
  - Where to get: [Groq Console](https://console.groq.com/)

- **`REACT_APP_DEFAULT_LANGUAGE`**
  - Description: Default language code for transcription
  - Default: `en`
  - Example values: `en`, `es`, `fr`, `de`, etc.

## How to Configure in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Add each variable:
   - **Key**: The variable name (e.g., `REACT_APP_SUPABASE_URL`)
   - **Value**: The variable value
   - **Environment**: Select which environments to apply to:
     - Production (for production deployments)
     - Preview (for pull request previews)
     - Development (for local development with Vercel CLI)

4. Click **Save** after adding each variable

## Important Notes

- All React environment variables **must** be prefixed with `REACT_APP_` to be accessible in the browser
- After adding/updating environment variables, you need to **redeploy** your application for changes to take effect
- Environment variables are injected at build time, not runtime
- Never commit sensitive keys to version control - always use environment variables

## Verification

After configuring environment variables in Vercel:

1. Trigger a new deployment
2. Check the build logs to ensure variables are being read (values are masked for security)
3. Test your application to verify Supabase connections work correctly

## Troubleshooting

If environment variables aren't working:

1. Verify the variable names match exactly (case-sensitive)
2. Ensure variables are set for the correct environment (Production/Preview/Development)
3. Redeploy after adding new variables
4. Check Vercel build logs for any errors related to missing variables
5. Verify the `REACT_APP_` prefix is present for all client-side variables
