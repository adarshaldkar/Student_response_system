import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Shield, Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

import { toast } from 'sonner';

import Footer from './Footer';


const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const handleGoogleRegister = async (credentialResponse) => {
    setLoading(true);
    setError('');
    
    try {
      const result = await login(null, null, credentialResponse.credential);
      
      if (result.success) {
        toast.success('Account created with Google', {
          description: 'Welcome! Redirecting to admin dashboard...',
          duration: 2500,
        });
        navigate('/admin');
      } else {
        setError(result.error);
        toast.error('Google registration failed', { description: result.error, duration: 4000 });
      }
    } catch (err) {
      console.error('Google registration error:', err);
      setError('Failed to register with Google');
      toast.error('Registration failed', { description: 'Failed to register with Google', duration: 4000 });
    }
    
    setLoading(false);
  };

  const handleGoogleRegisterError = () => {
    setError('Google registration failed');
    toast.error('Registration failed', { description: 'Google registration was cancelled or failed', duration: 4000 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      const msg = 'Passwords do not match';
      setError(msg);
      toast.error('Registration error', { description: msg, duration: 4000 });
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      const msg = 'Password must be at least 6 characters long';
      setError(msg);
      toast.error('Registration error', { description: msg, duration: 4000 });
      setLoading(false);
      return;
    }

    const result = await register(username, email, password, 'admin');
    
    if (result.success) {
      toast.success('Account created', {
        description: 'Welcome! Redirecting to admin dashboard...',
        duration: 2500,
      });
      navigate('/admin');
    } else {
      setError(result.error);
      toast.error('Registration failed', { description: result.error, duration: 4000 });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              Admin Registration
            </CardTitle>
            <p className="text-sm text-gray-600 text-center">
              Create an admin account to manage feedback forms
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password (min 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Admin Account
              </Button>
            </form>
            
            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>
            
            {/* Google Registration */}
            <div className="w-full">
              {process.env.REACT_APP_GOOGLE_CLIENT_ID && process.env.REACT_APP_GOOGLE_CLIENT_ID !== 'YOUR_ACTUAL_GOOGLE_CLIENT_ID_HERE' ? (
                <GoogleLogin
                  onSuccess={handleGoogleRegister}
                  onError={handleGoogleRegisterError}
                  width="100%"
                  text="signup_with"
                  shape="rectangular"
                  theme="outline"
                  size="large"
                  disabled={loading}
                />
              ) : (
                <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-center text-sm text-gray-500">
                  Google OAuth not configured yet. Please set up Google Client ID.
                </div>
              )}
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/admin-login" className="text-blue-600 hover:text-blue-800 font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Register;