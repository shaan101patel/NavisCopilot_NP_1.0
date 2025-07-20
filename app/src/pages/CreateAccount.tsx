import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Lock, Mail, User, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function CreateAccount() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  
  // Form state management
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'agent' as 'agent' | 'supervisor' | 'admin'
  });
  
  // UI state management
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  // Handle form input changes
  const handleInputChange = (field: keyof typeof formData, value: string) => {
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

  // Form validation
  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    } else if (formData.email.includes('@test.com') || formData.email.includes('@example.com')) {
      newErrors.email = 'Please use a real email address (test domains are not allowed)';
    }
    
    // Phone validation (optional but if provided, should be valid)
    if (formData.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      // Use the signUp method from AuthContext (we'll need to add this)
      const result = await signUp({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone,
        role: formData.role
      });
      
      if (result.error) {
        setErrors({
          general: result.error.message || 'Account creation failed. Please try again.'
        });
      } else {
        // Success - redirect to dashboard or show success message
        navigate('/dashboard');
      }
      
    } catch (error: any) {
      console.error('Account creation error:', error);
      setErrors({
        general: error.message || 'An error occurred during account creation. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 shadow-xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Account</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Join Navis to get started with AI-powered customer support
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* General Error */}
          {errors.general && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              {errors.general}
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-1">
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Enter your full name"
                className={`pl-10 ${errors.fullName ? 'border-red-500' : ''}`}
                disabled={isLoading}
              />
            </div>
            {errors.fullName && (
              <p className="text-sm text-red-600">{errors.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your work email"
                className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                disabled={isLoading}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
            <p className="text-xs text-gray-500">
              Use your company email address. Some email providers may be restricted.
            </p>
          </div>

          {/* Phone (Optional) */}
          <div className="space-y-1">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Phone Number <span className="text-gray-500">(optional)</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter your phone number"
                className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                disabled={isLoading}
              />
            </div>
            {errors.phone && (
              <p className="text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          {/* Role Selection */}
          <div className="space-y-1">
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Role
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              disabled={isLoading}
            >
              <option value="agent">Agent</option>
              <option value="supervisor">Supervisor</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Create a password"
                className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password}</p>
            )}
            <p className="text-xs text-gray-500">
              Must be at least 8 characters with uppercase, lowercase, and number
            </p>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="Confirm your password"
                className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating Account...</span>
              </div>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Sign in here
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
} 