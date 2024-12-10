import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { Check, Close } from '@mui/icons-material';
import { supabase } from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showRequirements, setShowRequirements] = useState(true);
  const navigate = useNavigate();

  // Password requirements
  const requirements = [
    { text: 'At least 6 characters long', test: (p) => p.length >= 6 },
    { text: 'Contains a letter', test: (p) => /[a-zA-Z]/.test(p) },
    { text: 'Contains a number', test: (p) => /\d/.test(p) },
  ];

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    // Validate all requirements
    const failedRequirements = requirements.filter(req => !req.test(password));
    if (failedRequirements.length > 0) {
      setError('Please meet all password requirements');
      setLoading(false);
      return;
    }

    // Proceed with account creation
    handleCreateAccount();
  };

  const handleCreateAccount = async () => {
    // Validate password
    if (isPasswordValid(password)) {
      setShowRequirements(false); // Hide requirements if valid

      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `https://risktool-one.com/auth/callback`,
            data: {
              email: email,
            }
          }
        });

        if (error) {
          setError(`Signup failed: ${error.message}`);
          return;
        }

        if (data?.user) {
          setSuccessMessage('Success! Please check your email for the confirmation link.');
          setEmail('');
          setPassword('');
          
          // Create profile record
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                email: email,
                created_at: new Date().toISOString(),
              }
            ]);

          if (profileError) {
            console.error('Error creating profile:', profileError);
          }
        }
      } catch (error) {
        setError('Unable to complete signup. Please try again later.');
      } finally {
        setLoading(false);
      }
    } else {
      setShowRequirements(true); // Show requirements if invalid
    }
  };

  const isPasswordValid = (password) => {
    return password.length >= 6 && /[a-zA-Z]/.test(password) && /\d/.test(password);
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
            Create Your Account
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please fill in the details below
          </Typography>
        </Box>

        <form onSubmit={handleSignUp}>
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

          {showRequirements && (
            <Box sx={{ mb: 3, bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Password Requirements:
              </Typography>
              <List dense>
                {requirements.map((req, index) => (
                  <ListItem key={index} sx={{ py: 0 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {req.test(password) ? (
                        <Check color="success" fontSize="small" />
                      ) : (
                        <Close color="error" fontSize="small" />
                      )}
                    </ListItemIcon>
                    <ListItemText 
                      primary={req.text}
                      primaryTypographyProps={{
                        variant: 'body2',
                        color: req.test(password) ? 'success.main' : 'error.main'
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

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

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ mb: 2 }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link
                component="button"
                variant="body2"
                onClick={() => navigate('/login')}
              >
                Sign in
              </Link>
            </Typography>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default SignUp; 