import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Divider,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { supabase } from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [lastEmailSent, setLastEmailSent] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const canSendEmail = () => {
    if (!lastEmailSent) return true;
    // 60 second cooldown
    const cooldownPeriod = 60 * 1000;
    const timeSinceLastEmail = Date.now() - lastEmailSent;
    return timeSinceLastEmail >= cooldownPeriod;
  };

  const getTimeRemaining = () => {
    if (!lastEmailSent) return 0;
    const cooldownPeriod = 60 * 1000;
    const timeSinceLastEmail = Date.now() - lastEmailSent;
    return Math.max(0, Math.ceil((cooldownPeriod - timeSinceLastEmail) / 1000));
  };

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    // Validate email format
    if (!validateEmail(email)) {
      setError('Please enter a valid email address (e.g., name@example.com)');
      setLoading(false);
      return;
    }

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please try again.');
        } else if (signInError.message.includes('Email not confirmed')) {
          setError('Please confirm your email first. Check your inbox for the confirmation link.');
        } else {
          throw signInError;
        }
        return;
      }

      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            email: email,
          }
        }
      });

      if (error) throw error;
      
      setSuccessMessage('Success! Please check your email for the confirmation link.');
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Signup error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `https://risktool-one.com/reset-password`,
      });

      if (error) throw error;
      setSuccessMessage('Check your email for the password reset link.');
      setResetDialogOpen(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLinkLogin = async (e) => {
    e.preventDefault();
    
    if (!canSendEmail()) {
      const timeRemaining = getTimeRemaining();
      setError(`Please wait ${timeRemaining} seconds before requesting another magic link`);
      return;
    }

    // Validate email format
    if (!validateEmail(email)) {
      setError('Please enter a valid email address (e.g., name@example.com)');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      console.log('Attempting magic link login for:', email);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}`,
          shouldCreateUser: true,
          data: {
            email: email
          }
        }
      });

      if (error) {
        console.error('Magic link error details:', error);
        if (error.message.includes('rate limit')) {
          throw new Error('Too many login attempts. Please try again in a few minutes.');
        }
        throw new Error(`Unable to send magic link: ${error.message}`);
      }
      
      setLastEmailSent(Date.now());
      setSuccessMessage('Check your email for the magic link!');
    } catch (error) {
      console.error('Magic link error:', error);
      setError(error.message || 'An error occurred sending the magic link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Development only - direct login function
  const handleDevLogin = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'test123'
      });

      if (error) throw error;
      navigate('/dashboard');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Typography variant="h3" component="h1" align="center" gutterBottom>
          Risk Monitoring Tool
        </Typography>
      </Box>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Welcome Back
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please sign in to continue
          </Typography>
        </Box>

        {/* Main Form */}
        <form onSubmit={handleLogin}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{ mb: 2 }}
          />

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}

          {/* Primary Actions */}
          <Box sx={{ mb: 3 }}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ mb: 2 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Link
                component="button"
                variant="body2"
                onClick={(e) => {
                  e.preventDefault();
                  setResetDialogOpen(true);
                }}
              >
                Forgot Password?
              </Link>
              <Link
                component="button"
                variant="body2"
                onClick={(e) => {
                  e.preventDefault();
                  handleMagicLinkLogin(e);
                }}
                disabled={loading || !canSendEmail()}
              >
                Sign in with Magic Link
              </Link>
            </Box>
          </Box>

          {/* Sign Up Section */}
          <Box sx={{ textAlign: 'center', mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Don't have an account?
            </Typography>
            <Button
              onClick={() => navigate('/signup')}
              variant="outlined"
              fullWidth
              size="large"
              sx={{ mb: 2 }}
            >
              Create Account
            </Button>
          </Box>

          {/* Development Options */}
          {process.env.NODE_ENV === 'development' && (
            <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary" display="block" align="center" gutterBottom>
                Development Options
              </Typography>
              <Button
                variant="outlined"
                color="secondary"
                fullWidth
                onClick={handleDevLogin}
                disabled={loading}
                size="small"
              >
                Quick Dev Login (test@example.com)
              </Button>
            </Box>
          )}
        </form>
      </Paper>

      {/* Password Reset Dialog */}
      <Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)}>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleResetPassword} disabled={loading}>
            Send Reset Link
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Login; 