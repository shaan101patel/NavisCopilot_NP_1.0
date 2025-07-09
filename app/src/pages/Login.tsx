import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

// IMPLEMENT LATER: Authentication integration with backend
// Expected backend integration:
// 1. POST /api/auth/login - User authentication endpoint
// 2. JWT token management and storage
// 3. User session handling and validation
// 4. Password reset functionality
// 5. Multi-factor authentication support
// 6. OAuth integration (Google, Microsoft, etc.)
// 
// Expected data structures:
// interface LoginRequest {
//   email: string;
//   password: string;
//   rememberMe?: boolean;
// }
// 
// interface LoginResponse {
//   success: boolean;
//   token: string;
//   user: {
//     id: string;
//     email: string;
//     name: string;
//     role: 'agent' | 'supervisor' | 'admin';
//     permissions: string[];
//   };
//   expiresAt: Date;
// }
// 
// Security considerations:
// - Password validation and strength requirements
// - Rate limiting for failed login attempts
// - Account lockout after multiple failed attempts
// - Secure token storage (httpOnly cookies or secure localStorage)
// - CSRF protection
// - Input sanitization and validation

export default function Login() {
  const navigate = useNavigate();
  
  // Form state management
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  // UI state management
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  // Handle form input changes
  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear specific field errors when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Basic form validation (client-side only)
  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      // IMPLEMENT LATER: Replace with actual authentication API call
      // Expected API call:
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     email: formData.email,
      //     password: formData.password,
      //     rememberMe: formData.rememberMe
      //   }),
      // });
      // 
      // const data = await response.json();
      // 
      // if (data.success) {
      //   // Store authentication token securely
      //   localStorage.setItem('authToken', data.token);
      //   // Update global auth state
      //   setAuthUser(data.user);
      //   // Redirect to dashboard
      //   navigate('/dashboard');
      // } else {
      //   setErrors({ general: data.message || 'Login failed' });
      // }
      
      // Mock authentication delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful login - redirect to dashboard
      console.log('Mock login successful with:', formData);
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Login error:', error);
      setErrors({
        general: 'An error occurred during login. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle demo login (for development/testing)
  const handleDemoLogin = () => {
    setFormData({
      email: 'agent@navis.com',
      password: 'demo123',
      rememberMe: false
    });
    setErrors({});
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <Card className="p-8 shadow-xl border-0">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="mb-4">
              {/* IMPLEMENT LATER: Add Navis logo here */}
              <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">N</span>
              </div>
            </div>
            <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
              Welcome to Navis
            </h1>
            <p className="text-muted-foreground">
              Sign in to access your customer service dashboard
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error Message */}
            {errors.general && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{errors.general}</p>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-foreground"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={16} className="text-muted-foreground" />
                </div>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email address"
                  className={`pl-10 ${errors.email ? 'border-destructive focus:border-destructive' : ''}`}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p id="email-error" className="text-sm text-destructive">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-foreground"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={16} className="text-muted-foreground" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter your password"
                  className={`pl-10 pr-10 ${errors.password ? 'border-destructive focus:border-destructive' : ''}`}
                  aria-describedby={errors.password ? "password-error" : undefined}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff size={16} className="text-muted-foreground hover:text-foreground" />
                  ) : (
                    <Eye size={16} className="text-muted-foreground hover:text-foreground" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="text-sm text-destructive">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                  disabled={isLoading}
                />
                <label htmlFor="remember-me" className="ml-2 text-sm text-muted-foreground">
                  Remember me
                </label>
              </div>
              
              {/* IMPLEMENT LATER: Add forgot password functionality */}
              <button
                type="button"
                className="text-sm text-primary hover:text-primary/80 focus:outline-none focus:underline"
                disabled={isLoading}
                onClick={() => {
                  // IMPLEMENT LATER: Navigate to forgot password page
                  console.log('Forgot password clicked');
                }}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              aria-label="Sign in to Navis dashboard"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </Button>

            {/* Demo Login Button (Development Only) */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleDemoLogin}
              disabled={isLoading}
              aria-label="Fill form with demo credentials"
            >
              Fill Demo Credentials
            </Button>
          </form>

          {/* Footer Section */}
          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground">
              © 2025 Navis. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Need help? Contact your system administrator.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
