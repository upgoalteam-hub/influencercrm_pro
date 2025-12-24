import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const LoginForm = ({ onSubmit, isLoading, error }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  const whitelistedDomains = ['influencercrm.com', 'marketing.influencercrm.com'];

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex?.test(email)) {
      return 'Please enter a valid email address';
    }
    
    const domain = email?.split('@')?.[1];
    if (!whitelistedDomains?.includes(domain)) {
      return 'Email domain not authorized. Please use your company email.';
    }
    
    return null;
  };

  const validatePassword = (password) => {
    if (password?.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    return null;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e?.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }));

    if (validationErrors?.[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    
    const errors = {};
    const emailError = validateEmail(formData?.email);
    const passwordError = validatePassword(formData?.password);
    
    if (emailError) errors.email = emailError;
    if (passwordError) errors.password = passwordError;
    
    if (Object.keys(errors)?.length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    onSubmit(formData);
  };

  const handleForgotPassword = () => {
    if (!formData?.email) {
      setValidationErrors({ email: 'Please enter your email address first' });
      return;
    }
    
    const emailError = validateEmail(formData?.email);
    if (emailError) {
      setValidationErrors({ email: emailError });
      return;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Input
          label="Email Address"
          type="email"
          name="email"
          id="email"
          placeholder="your.name@influencercrm.com"
          value={formData?.email}
          onChange={handleChange}
          error={validationErrors?.email}
          required
          disabled={isLoading}
          className="mb-4"
        />
      </div>
      <div className="relative">
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          name="password"
          id="password"
          placeholder="Enter your password"
          value={formData?.password}
          onChange={handleChange}
          error={validationErrors?.password}
          required
          disabled={isLoading}
          className="mb-2"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-colors duration-200"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          disabled={isLoading}
        >
          <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={18} />
        </button>
      </div>
      <div className="flex items-center justify-between">
        <Checkbox
          label="Remember me"
          name="rememberMe"
          checked={formData?.rememberMe}
          onChange={handleChange}
          disabled={isLoading}
        />
        
        <button
          type="button"
          onClick={handleForgotPassword}
          className="text-sm text-primary hover:underline transition-colors duration-200"
          disabled={isLoading}
        >
          Forgot password?
        </button>
      </div>
      {error && (
        <div className="flex items-start gap-2 p-3 bg-error/10 border border-error/20 rounded-md">
          <Icon name="AlertCircle" size={18} color="var(--color-error)" className="flex-shrink-0 mt-0.5" />
          <p className="text-sm text-error">{error}</p>
        </div>
      )}
      <Button
        type="submit"
        variant="default"
        fullWidth
        loading={isLoading}
        disabled={isLoading}
        iconName="LogIn"
        iconPosition="right"
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </Button>
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Authorized team members only. Contact your administrator for access.
        </p>
      </div>
    </form>
  );
};

export default LoginForm;