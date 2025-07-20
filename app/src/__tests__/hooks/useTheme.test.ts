import { renderHook, act } from '@testing-library/react';
import { useTheme } from '../../hooks/useTheme';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

// Only mock window if it exists (for Node environment compatibility)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  });
}

describe('useTheme Hook', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it('should initialize with system theme by default', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('system');
    expect(result.current.resolvedTheme).toBe('light');
  });

  it('should initialize with theme from localStorage if available', () => {
    localStorageMock.getItem.mockReturnValue('dark');

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('dark');
    expect(result.current.resolvedTheme).toBe('dark');
  });

  it('should toggle theme correctly', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('system');

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('light');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('navis-theme', 'light');

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('dark');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('navis-theme', 'dark');
  });

  it('should set theme directly', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme('dark');
    });

    expect(result.current.theme).toBe('dark');
    expect(result.current.resolvedTheme).toBe('dark');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('navis-theme', 'dark');
  });

  it('should handle invalid theme values gracefully', () => {
    localStorageMock.getItem.mockReturnValue('invalid-theme');

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('system');
    expect(result.current.resolvedTheme).toBe('light');
  });

  it('should persist theme changes to localStorage', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme('dark');
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith('navis-theme', 'dark');

    act(() => {
      result.current.setTheme('light');
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith('navis-theme', 'light');
  });

  it('should handle localStorage errors gracefully', () => {
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });

    const { result } = renderHook(() => useTheme());

    // Should not throw error when setting theme
    expect(() => {
      act(() => {
        result.current.setTheme('dark');
      });
    }).not.toThrow();
  });
}); 