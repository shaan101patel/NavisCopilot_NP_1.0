import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '@/store/userSlice';

/**
 * Custom hook to initialize user data
 * In a real app, this would fetch user data from an API or check authentication status
 */
export function useInitializeUser() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Simulate checking for existing authentication
    // In a real app, you would check for stored tokens, make API calls, etc.
    const initializeUser = () => {
      // Mock user data for development
      const mockUser = {
        id: '1',
        name: 'John Smith',
        email: 'john.smith@navis.ai',
        role: 'agent' as const,
        // avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face' // Optional avatar
      };

      dispatch(setUser(mockUser));
    };

    // Simulate a small delay as if checking authentication
    const timer = setTimeout(initializeUser, 100);

    return () => clearTimeout(timer);
  }, [dispatch]);
}
