import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../../components/AppIcon';
import BrandHeader from './components/BrandHeader';
import LoginForm from './components/LoginForm';
import FirebaseStatus from './components/FirebaseStatus';
import SecurityFeatures from './components/SecurityFeatures';
import SessionWarningModal from './components/SessionWarningModal';

const LoginAndAuthentication = () => {
  const navigate = useNavigate();
  const { signIn, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/executive-dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (isLocked && lockoutTimer > 0) {
      const timer = setInterval(() => {
        setLockoutTimer(prev => {
          if (prev <= 1) {
            setIsLocked(false);
            setFailedAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isLocked, lockoutTimer]);

  const handleLogin = async (formData) => {
    if (isLocked) {
      setError(`Account temporarily locked. Please try again in ${lockoutTimer} seconds.`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use actual Supabase authentication
      const { data, error: signInError } = await signIn(formData?.email, formData?.password);

      if (signInError) {
        const newFailedAttempts = failedAttempts + 1;
        setFailedAttempts(newFailedAttempts);

        if (newFailedAttempts >= 3) {
          setIsLocked(true);
          setLockoutTimer(300);
          setError('Too many failed attempts. Account locked for 5 minutes.');
        } else {
          // Format error message for better readability
          const errorMsg = signInError?.message || 'Invalid email or password';
          const attemptsRemaining = 3 - newFailedAttempts;
          setError(`${errorMsg}\n\n⚠️ ${attemptsRemaining} ${attemptsRemaining === 1 ? 'attempt' : 'attempts'} remaining before account lockout.`);
        }
      } else {
        // Store user info
        if (formData?.rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }
        
        setFailedAttempts(0);
        
        // Navigate to dashboard - AuthContext will handle session
        navigate('/executive-dashboard');
      }
    } catch (err) {
      setError(err?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtendSession = () => {
    localStorage.setItem('loginTime', new Date()?.toISOString());
    setShowSessionWarning(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    setShowSessionWarning(false);
    navigate('/login-and-authentication');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        <div className="hidden lg:block">
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Welcome Back to<br />InfluencerCRM Pro
              </h2>
              <p className="text-lg text-muted-foreground">
                Your centralized platform for managing creator relationships, campaigns, and payments with enterprise-grade security.
              </p>
            </div>

            <SecurityFeatures />

            <div className="p-6 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-start gap-3 mb-4">
                <Icon name="Sparkles" size={24} color="var(--color-primary)" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    What's New in v2.0
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Icon name="Check" size={16} color="var(--color-success)" className="flex-shrink-0 mt-0.5" />
                      <span>Advanced Instagram link bulk processing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="Check" size={16} color="var(--color-success)" className="flex-shrink-0 mt-0.5" />
                      <span>Real-time payment tracking with delay alerts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="Check" size={16} color="var(--color-success)" className="flex-shrink-0 mt-0.5" />
                      <span>Enhanced campaign performance analytics</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Icon name="Users" size={16} />
                <span>1,200+ Creators</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Megaphone" size={16} />
                <span>350+ Campaigns</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="TrendingUp" size={16} />
                <span>₹2.5Cr+ Processed</span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto">
          <div className="bg-card border border-border rounded-2xl shadow-lg-custom p-8">
            <BrandHeader />

            <div className="mb-6">
              <FirebaseStatus />
            </div>

            <LoginForm
              onSubmit={handleLogin}
              isLoading={isLoading}
              error={error}
            />

            <div className="mt-8 pt-6 border-t border-border">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-xs font-medium text-foreground mb-3 flex items-center gap-2">
                  <Icon name="Key" size={14} />
                  Demo Credentials for Testing
                </p>
                <div className="space-y-3 text-xs">
                  <div className="bg-card border border-border rounded p-3">
                    <div className="flex items-start gap-2 mb-2">
                      <Icon name="User" size={12} className="flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-foreground mb-1">Super Admin</p>
                        <div className="space-y-1 text-muted-foreground">
                          <p><span className="font-medium">Email:</span> admin@crm.com</p>
                          <p><span className="font-medium">Password:</span> Admin@123456</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-card border border-border rounded p-3">
                    <div className="flex items-start gap-2 mb-2">
                      <Icon name="User" size={12} className="flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-foreground mb-1">Manager</p>
                        <div className="space-y-1 text-muted-foreground">
                          <p><span className="font-medium">Email:</span> manager@crm.com</p>
                          <p><span className="font-medium">Password:</span> Manager@123456</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 p-2 bg-warning/10 border border-warning/30 rounded">
                  <p className="text-xs text-warning flex items-start gap-2">
                    <Icon name="AlertTriangle" size={12} className="flex-shrink-0 mt-0.5" />
                    <span><strong>Setup Required:</strong> Demo accounts must be manually created in Supabase Dashboard before login will work. See migration file <code className="px-1 py-0.5 bg-background rounded text-[10px]">20251225095026_fix_auth_integration.sql</code> for detailed setup instructions.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              © {new Date()?.getFullYear()} InfluencerCRM Pro. All rights reserved.
            </p>
            <div className="flex items-center justify-center gap-4 mt-2">
              <a href="#" className="text-xs text-primary hover:underline">Privacy Policy</a>
              <span className="text-xs text-muted-foreground">•</span>
              <a href="#" className="text-xs text-primary hover:underline">Terms of Service</a>
              <span className="text-xs text-muted-foreground">•</span>
              <a href="#" className="text-xs text-primary hover:underline">Support</a>
            </div>
          </div>
        </div>
      </div>
      <SessionWarningModal
        isOpen={showSessionWarning}
        onExtend={handleExtendSession}
        onLogout={handleLogout}
        remainingTime={300}
      />
    </div>
  );
};

export default LoginAndAuthentication;