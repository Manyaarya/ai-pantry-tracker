// app/auth/sign-in.js
'use client';

import { SignIn } from '@clerk/nextjs';
import { Box } from '@mui/material';

const SignInPage = () => {
  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <SignIn />
    </Box>
  );
};

export default SignInPage;
