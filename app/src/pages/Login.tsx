import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { signIn, isLoading, forgotPassword } = useAuth();
  
  // Form state management
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  // UI state management
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');

  // Input validation
  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
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

    setIsSubmitting(true);
    setErrors({});

    try {
      await signIn({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe
      });
      
      // Redirect to dashboard on successful login
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setErrors({
        general: error instanceof Error ? error.message : 'Login failed. Please check your credentials and try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle forgot password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!forgotPasswordEmail) {
      setErrors({ email: 'Email is required' });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotPasswordEmail)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    try {
      await forgotPassword(forgotPasswordEmail);
      setForgotPasswordMessage('If an account with that email exists, a password reset link has been sent.');
      setErrors({});
    } catch (error) {
      console.error('Forgot password error:', error);
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to send reset email. Please try again.'
      });
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear errors when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Reset Password</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {forgotPasswordMessage && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-green-700 dark:text-green-300 text-sm">
                {forgotPasswordMessage}
              </p>
            </div>
          )}

          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
              <AlertCircle size={16} className="text-red-500" />
              <p className="text-red-700 dark:text-red-300 text-sm">
                {errors.general}
              </p>
            </div>
          )}

          <form onSubmit={handleForgotPassword} className="space-y-6">
            <div>
              <label htmlFor="forgotEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  id="forgotEmail"
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  className={`pl-10 ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div className="space-y-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotPasswordEmail('');
                  setForgotPasswordMessage('');
                  setErrors({});
                }}
              >
                Back to Login
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome to Navis</h1>
          <p className="text-gray-600 dark:text-gray-400">
            AI-powered customer service platform
          </p>
        </div>

        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
            <AlertCircle size={16} className="text-red-500" />
            <p className="text-red-700 dark:text-red-300 text-sm">
              {errors.general}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`pl-10 ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                placeholder="Enter your email"
                disabled={isSubmitting || isLoading}
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleInputChange}
                className={`pl-10 pr-10 ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                placeholder="Enter your password"
                disabled={isSubmitting || isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isSubmitting || isLoading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isSubmitting || isLoading}
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Remember me
              </label>
            </div>
            
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              disabled={isSubmitting || isLoading}
            >
              Forgot password?
            </button>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/create-account')}
              className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
            >
              Create one here
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
}
