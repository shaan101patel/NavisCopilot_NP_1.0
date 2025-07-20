import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from '../../components/ThemeToggle';

// Mock the useTheme hook
jest.mock('../../hooks/useTheme', () => ({
  useTheme: jest.fn(),
}));

const mockUseTheme = require('../../hooks/useTheme').useTheme;

describe('ThemeToggle Component', () => {
  const mockToggleTheme = jest.fn();
  const mockSetTheme = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with light theme', () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      resolvedTheme: 'light',
      toggleTheme: mockToggleTheme,
      setTheme: mockSetTheme,
      systemTheme: 'light',
    });

    render(<ThemeToggle />);

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByLabelText(/toggle theme/i)).toBeInTheDocument();
  });

  it('should render with dark theme', () => {
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      resolvedTheme: 'dark',
      toggleTheme: mockToggleTheme,
      setTheme: mockSetTheme,
      systemTheme: 'light',
    });

    render(<ThemeToggle />);

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByLabelText(/toggle theme/i)).toBeInTheDocument();
  });

  it('should call toggleTheme when button is clicked', () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      resolvedTheme: 'light',
      toggleTheme: mockToggleTheme,
      setTheme: mockSetTheme,
      systemTheme: 'light',
    });

    render(<ThemeToggle />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });

  it('should render with system theme', () => {
    mockUseTheme.mockReturnValue({
      theme: 'system',
      resolvedTheme: 'light',
      toggleTheme: mockToggleTheme,
      setTheme: mockSetTheme,
      systemTheme: 'light',
    });

    render(<ThemeToggle />);

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByLabelText(/toggle theme/i)).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      resolvedTheme: 'light',
      toggleTheme: mockToggleTheme,
      setTheme: mockSetTheme,
      systemTheme: 'light',
    });

    render(<ThemeToggle />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('should handle keyboard interactions', () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      resolvedTheme: 'light',
      toggleTheme: mockToggleTheme,
      setTheme: mockSetTheme,
      systemTheme: 'light',
    });

    render(<ThemeToggle />);

    const button = screen.getByRole('button');
    
    // Test Enter key
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);

    // Test Space key
    fireEvent.keyDown(button, { key: ' ', code: 'Space' });
    expect(mockToggleTheme).toHaveBeenCalledTimes(2);
  });
}); 