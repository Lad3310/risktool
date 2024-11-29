import React from 'react';
import { Box, Typography, Paper, Grid, IconButton, Card, CardContent } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';

function Contact() {
  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', p: 2, mb: 10 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', boxShadow: 2 }}>
            <CardContent sx={{ p: 4, height: '100%' }}>
              <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Inter', fontWeight: 500, mb: 3 }}>
                Contact Us
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
                Get in touch with our support team for any questions or concerns about the Risk Monitor platform.
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mt: 'auto' }}>
                <IconButton href="https://github.com" target="_blank" sx={{ color: '#4ade80' }}>
                  <GitHubIcon />
                </IconButton>
                <IconButton href="https://twitter.com" target="_blank" sx={{ color: '#4ade80' }}>
                  <TwitterIcon />
                </IconButton>
                <IconButton href="https://linkedin.com" target="_blank" sx={{ color: '#4ade80' }}>
                  <LinkedInIcon />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', boxShadow: 2 }}>
            <CardContent sx={{ p: 4, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Box sx={{ 
                  bgcolor: '#4ade80',
                  borderRadius: '50%',
                  width: 56,
                  height: 56,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2,
                  color: 'white',
                  fontSize: '1.5rem',
                  fontWeight: 500
                }}>
                  S
                </Box>
                <Typography variant="h4" sx={{ fontFamily: 'Inter', fontWeight: 500 }}>
                  Support Team
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EmailIcon sx={{ color: '#4ade80', mr: 2, fontSize: 28 }} />
                  <Typography variant="h6">support@riskmonitor.com</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PhoneIcon sx={{ color: '#4ade80', mr: 2, fontSize: 28 }} />
                  <Typography variant="h6">+1 (555) 123-4567</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOnIcon sx={{ color: '#4ade80', mr: 2, fontSize: 28 }} />
                  <Typography variant="h6">New York, NY 10004</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Contact; 