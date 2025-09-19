import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Shield, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import Footer from './Footer';
import { API } from '../config/api';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post(`${API}/auth/forgot-password`, { email });
      
      setSuccess(true);
      toast.success('Reset email sent!', {
        description: 'Check your email for password reset instructions.',
        duration: 5000,
      });
      
    } catch (error) {
      console.error('Forgot password error:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to send reset email. Please try again.';
      setError(errorMessage);
      toast.error('Reset failed', {
        description: errorMessage,
        duration: 4000,
      });
    }
    
    setLoading(false);
  };

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
              Check Your Email
            </CardTitle>
            <p className="text-sm text-gray-600">
              We've sent password reset instructions to your email address
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Next Steps:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Check your email inbox (and spam folder)</li>
                <li>• Click the reset link in the email</li>
                <li>• Follow the instructions to set a new password</li>
                <li>• Return here to sign in with your new password</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link to="/admin-login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                  setError('');
                }}
              >
                Send Another Email
              </Button>
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
            Reset Password
          </CardTitle>
          <p className="text-sm text-gray-600 text-center">
            Enter your email address and we'll send you a reset link
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
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-gray-500">
                This should be the email address associated with your admin account
              </p>
            </div>
            
            <Button type="submit" className="w-full" disabled={loading || !email.trim()}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Reset Link
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

export default ForgotPassword;
