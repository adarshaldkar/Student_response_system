import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Shield, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Footer from './Footer';
import { API } from '../config/api';
import axios from 'axios';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validToken, setValidToken] = useState(null);
  
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }

    // Verify token validity
    const verifyToken = async () => {
      try {
        await axios.get(`${API}/auth/verify-reset-token/${token}`);
        setValidToken(true);
      } catch (error) {
        console.error('Token verification error:', error);
        setValidToken(false);
        setError('This reset link has expired or is invalid. Please request a new one.');
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      const msg = 'Passwords do not match';
      setError(msg);
      toast.error('Validation error', { description: msg, duration: 4000 });
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      const msg = 'Password must be at least 6 characters long';
      setError(msg);
      toast.error('Validation error', { description: msg, duration: 4000 });
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${API}/auth/reset-password`, {
        token,
        password
      });
      
      setSuccess(true);
      toast.success('Password reset successful!', {
        description: 'You can now sign in with your new password.',
        duration: 5000,
      });
      
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to reset password. Please try again.';
      setError(errorMessage);
      toast.error('Reset failed', {
        description: errorMessage,
        duration: 4000,
      });
    }
    
    setLoading(false);
  };

  if (validToken === false || (!token && !loading)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-red-600">
              Invalid Reset Link
            </CardTitle>
            <p className="text-sm text-gray-600">
              This password reset link is invalid or has expired
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                {error || 'Please request a new password reset link.'}
              </AlertDescription>
            </Alert>
            
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link to="/forgot-password">
                  Request New Reset Link
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full">
                <Link to="/admin-login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              Password Reset Successful!
            </CardTitle>
            <p className="text-sm text-gray-600">
              Your password has been updated successfully
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                You can now sign in to your admin account with your new password.
              </p>
            </div>
            
            <Button asChild className="w-full">
              <Link to="/admin-login">
                Sign In Now
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (validToken === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
              <p className="mt-2 text-gray-600">Verifying reset link...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            Set New Password
          </CardTitle>
          <p className="text-sm text-gray-600 text-center">
            Enter your new password below
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
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password (min 6 characters)"
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
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
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
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !password.trim() || !confirmPassword.trim()}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Password
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Link 
              to="/admin-login" 
              className="text-sm text-gray-600 hover:text-gray-800 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
