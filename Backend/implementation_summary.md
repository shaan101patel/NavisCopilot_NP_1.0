"# Navis Copilot Backend Implementation Summary

This document summarizes the Supabase backend setup for Navis Copilot, based on the plan and requirements. It includes details on the database schema, Edge Functions, real-time features, and guidance for next steps.

## Supabase Project Details
- **Project ID**: fjdurojwqtqoydmqjvmk
- **Project URL**: https://fjdurojwqtqoydmqjvmk.supabase.co
- **Access Token**: (Provided separately; store in .env or Supabase secrets)
- **API Keys**: Gemini API Key, Twilio Account SID, Auth Token, Phone Number, and API Key SID (provided separately; add to environment variables securely)

**Important**: Never commit sensitive keys to version control. Use environment variables or Supabase's secret management.

## Phase 1: Database Schema & Authentication
- Tables: `profiles`, `calls`, `tickets`, `analytics`, `documents`, `feedback` with specified columns, enums (e.g., role_enum), JSONB for transcripts/ai_suggestions, foreign keys, indexes, and audit triggers.
- RLS: Enabled with policies for agent-owned data and admin access.
- Auth: Trigger auto-creates profiles on signup with default 'agent' role.
- Vector Support: pgvector extension enabled for RAG in `documents.embedding`.
- Types: Generated in `Backend/supabase/types.ts`.

## Phase 2: Core Edge Functions
Deployed functions (accessible at `/functions/v1/<name>`):
- `onboard-user`: Update user role.
- `create-ticket`: Insert ticket with AI insights via OpenAI/Gemini.
- `process-call-stream`: Transcribe audio, append to transcript, RAG query, generate suggestions, broadcast.
- `generate-analytics`: Analyze call for scores/metrics.
- `handle-incoming-call`: Twilio webhook to start calls.

Each uses TypeScript, error handling, and env vars for keys.

## Phase 3: Real-Time Features
- Realtime enabled for tables.
- Broadcast channels (e.g., `call:${call_id}`) for suggestions/transcripts.
- WebSocket integration via Supabase client in frontend.

## Verification Instructions
To confirm the Supabase changes work:
1. **Dashboard Check**:
   - Log in to https://app.supabase.com/project/fjdurojwqtqoydmqjvmk.
   - Go to Table Editor: Verify tables (e.g., `profiles`, `calls`) exist with correct columns/enums.
   - Check SQL Editor: Run `SELECT * FROM pg_tables WHERE schemaname = 'public';` to list tables.
   - View Authentication > Users: Sign up a test user and check if a `profiles` entry is created.
   - Check RLS: As an agent user, query own data; as admin, query all.

2. **CLI Verification** (Install Supabase CLI if not done):
   - Run `supabase login` with your access token.
   - `supabase link --project-ref fjdurojwqtqoydmqjvmk`.
   - `supabase db remote-commit` to check schema.
   - `supabase functions list` to see deployed functions.
   - Test a function: `curl -X POST 'https://fjdurojwqtqoydmqjvmk.supabase.co/functions/v1/create-ticket' -H 'Authorization: Bearer [ANON_KEY]' -H 'Content-Type: application/json' -d '{\"call_id\": \"test\", \"notes\": \"Sample note\"}'`.

3. **Local Emulator**:
   - In `Backend/`, run `supabase start`.
   - Use local URL to test queries/functions.

4. **Logs & Advisors**:
   - In dashboard, check Logs for any errors.
   - Run security/performance advisors to ensure no issues (e.g., missing RLS).

If issues, check console errors or use `supabase db diff` for schema mismatches.

## Next Steps: Adding Mock/Sample Data
Since user rules prohibit mocking in dev/prod code, we'll add sample data directly to the database for testing (not stubs/fakes in code). Use real-ish data to simulate without affecting prod logic.

1. **Prepare Environment**:
   - Create `.env` in project root (or `app/`) if not exists: Add `SUPABASE_URL=https://fjdurojwqtqoydmqjvmk.supabase.co`, `SUPABASE_ANON_KEY=[get from dashboard]`, Gemini/Twilio keys.
   - Confirm: Shall I edit .env to add these? (No overwrite without yes.)

2. **Insert Sample Data via Dashboard or SQL**:
   - In Supabase dashboard > SQL Editor, run inserts:
     - Profiles: `INSERT INTO profiles (id, role, full_name, phone_number) VALUES ('uuid-here', 'agent', 'Test Agent', '+1234567890');`
     - Calls: `INSERT INTO calls (user_id, status, start_time, transcript) VALUES ('profile-id', 'active', NOW(), '[{"speaker": "agent", "text": "Hello", "timestamp": "now"}]');`
     - Tickets/Analytics/Documents/Feedback: Similar inserts with sample JSON.
   - For vector: Upload a doc to Storage, insert to `documents` with embedding (generate via OpenAI/Gemini API call in a test script).

3. **Script for Bulk Data** (Optional, keep under 200 lines):
   - Create `Backend/scripts/add_sample_data.ts`: Use Supabase client to insert 5-10 records.
   - Run with `deno run --allow-env --allow-net Backend/scripts/add_sample_data.ts`.

4. **Test Data**:
   - Query to verify: `SELECT * FROM calls LIMIT 1;`.

## Next Steps: Integrating into the Application
Integrate Supabase into the frontend (`app/src/services/`) for data access, using existing Redux/ hooks structure.

1. **Install Supabase Client**:
   - In `app/`, run `npm install @supabase/supabase-js`.

2. **Setup Supabase Service**:
   - Create `src/services/supabase.ts`:
     ```
     import { createClient } from '@supabase/supabase-js';
     const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY);
     export default supabase;
     ```
   - Add to .env: `REACT_APP_SUPABASE_URL=https://fjdurojwqtqoydmqjvmk.supabase.co`, etc. (Confirm edit?)

3. **Integrate Features**:
   - **Auth**: In `Login.tsx`, use `supabase.auth.signInWithPassword({ email, password })`. Store session in Redux (`userSlice`).
   - **Live Calls**: In `useLiveCallState.ts`, subscribe: `supabase.channel('call:' + callId).on('broadcast', { event: 'new_suggestion' }, payload => updateState(payload)).subscribe();`.
   - **Tickets**: In `ticketsSlice.ts`, fetch/insert via `supabase.from('tickets').select('*')` or call `/functions/v1/create-ticket`.
   - **Analytics**: Query `analytics` table in `analyticsSlice.ts`.
   - **Twilio Integration**: In `CallControls.tsx`, setup Twilio client with provided SID/Token/Number; point webhooks to `/functions/v1/handle-incoming-call`.
   - **AI**: Update functions to use Gemini if preferred (replace OpenAI with Google Generative AI SDK).

4. **Update Redux/Hooks**:
   - Dispatch actions on realtime events (e.g., update transcript in `useTranscript.ts`).

5. **Test Integration**:
   - Start app, login, create ticket, simulate call.
   - Check console/network for errors.

Follow coding preferences: TypeScript, reusable components, no duplication. If needed, I can edit specific files." 