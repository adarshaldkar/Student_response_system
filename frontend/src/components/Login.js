import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, User, Shield, Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

import { toast } from 'sonner';

import Footer from './Footer';


const Login = ({ role = 'admin' }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(username, password);
    
    if (result.success) {
      toast.success('Signed in successfully', {
        description: result.role === 'admin' ? 'Redirecting to admin dashboard...' : 'Redirecting...',
        duration: 2500,
      });
      if (result.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      setError(result.error);
      toast.error('Sign in failed', {
        description: result.error,
        duration: 4000,
      });
    }
    
    setLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');

    try {
      const result = await login(null, null, credentialResponse.credential);
      
      if (result.success) {
        toast.success('Signed in with Google', {
          description: result.role === 'admin' ? 'Redirecting to admin dashboard...' : 'Redirecting...',
          duration: 2500,
        });
        if (result.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        setError(result.error);
        toast.error('Google sign in failed', {
          description: result.error,
          duration: 4000,
        });
      }
    } catch (error) {
      setError('Google sign in failed. Please try again.');
      toast.error('Google sign in failed', {
        description: 'Please try again or use email/password.',
        duration: 4000,
      });
    }
    
    setLoading(false);
  };

  const handleGoogleError = () => {
    toast.error('Google sign in failed', {
      description: 'Please try again or use email/password.',
      duration: 4000,
    });
  };

  const isAdminLogin = role === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            Admin Login
          </CardTitle>
          <p className="text-sm text-gray-600 text-center">
            Access the admin dashboard to manage feedback forms
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
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
                  placeholder="Enter your password"
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
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>
          
          {/* Divider */}
          <div className="mt-6 mb-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
          </div>
          
          {/* Google Login */}
          <div className="mb-4">
            {process.env.REACT_APP_GOOGLE_CLIENT_ID && process.env.REACT_APP_GOOGLE_CLIENT_ID !== 'YOUR_ACTUAL_GOOGLE_CLIENT_ID_HERE' ? (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                width="100%"
                text="signin_with"
                disabled={loading}
              />
            ) : (
              <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-center text-sm text-gray-500">
                Google OAuth not configured yet. Please set up Google Client ID.
              </div>
            )}
          </div>
          
          <div className="mt-6 space-y-3">
            <div className="text-center text-sm">
              <Link to="/forgot-password" className="text-blue-600 hover:text-blue-800 font-medium">
                Forgot your password?
              </Link>
            </div>
            <div className="text-center text-sm text-gray-600">
              Don't have an admin account?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                Register here
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;