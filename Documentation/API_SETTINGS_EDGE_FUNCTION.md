# Supabase Edge Function: api-settings

Endpoints:
- GET /api/settings/api-key -> { apiKeyMasked }
- GET /api/settings/api-key?raw=1 -> { apiKey, apiKeyMasked }
- POST /api/settings/api-key { apiKey }
- DELETE /api/settings/api-key
- POST /api/settings/api-key/validate { apiKey }

Behavior:
- Requires Authorization: Bearer <access_token>
- Encrypts API key using AES-GCM with ENCRYPTION_KEY (base64 32 bytes)
- Stores cipher text in `user_settings.api_key` and iv in `user_settings.iv`
- Writes audit rows to `api_key_audit`
- CORS enabled for browser calls

Deploy notes:
- Set env var ENCRYPTION_KEY for the function (base64 of 32 random bytes).
- Ensure schema tables and RLS exist.
- If calling via URL `${SUPABASE_URL}/functions/v1/api-settings/...`, the function trims any prefix before `/api/`.
