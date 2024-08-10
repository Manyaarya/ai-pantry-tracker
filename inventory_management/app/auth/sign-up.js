// app/auth/sign-up.js
'use client';

import { SignUp } from '@clerk/nextjs';
import { Box } from '@mui/material';

const SignUpPage = () => {
  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <SignUp />
    </Box>
  );
};

export default SignUpPage;
