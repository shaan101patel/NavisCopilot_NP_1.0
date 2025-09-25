import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiKeyAPI, supabase } from '@/services/supabase';

type ApiKeyContextType = {
  apiKeyMasked: string;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  save: (apiKey: string) => Promise<void>;
  remove: () => Promise<void>;
  getRaw: () => Promise<string | undefined>;
};

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export const ApiKeyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apiKeyMasked, setApiKeyMasked] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiKeyAPI.get();
      setApiKeyMasked(data.apiKeyMasked || '');
    } catch (e: any) {
      // Swallow 404 (function not found) or unauth before login; show other errors
      const msg = e?.message || '';
      if (msg.includes('Not Found') || msg.toLowerCase().includes('unauth')) {
        setApiKeyMasked('');
      } else {
        setError(msg || 'Failed to load API key');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const save = useCallback(async (apiKey: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiKeyAPI.set(apiKey);
      await refresh();
    } catch (e: any) {
      setError(e.message || 'Failed to save API key');
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const remove = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await apiKeyAPI.remove();
      await refresh();
    } catch (e: any) {
      setError(e.message || 'Failed to delete API key');
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  useEffect(() => {
    let mounted = true;
    // Refresh only when authenticated
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && mounted) await refresh();
    };
    init();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) refresh(); else setApiKeyMasked('');
    });
    return () => { mounted = false; authListener.subscription.unsubscribe(); };
  }, [refresh]);

  const getRaw = useCallback(async () => {
    try {
      const res = await apiKeyAPI.getRaw();
      return res.apiKey;
    } catch (e) {
      return undefined;
    }
  }, []);

  const value = useMemo(() => ({ apiKeyMasked, loading, error, refresh, save, remove, getRaw }), [apiKeyMasked, loading, error, refresh, save, remove, getRaw]);
  return <ApiKeyContext.Provider value={value}>{children}</ApiKeyContext.Provider>;
};

export const useApiKey = () => {
  const ctx = useContext(ApiKeyContext);
  if (!ctx) throw new Error('useApiKey must be used within ApiKeyProvider');
  return ctx;
};
