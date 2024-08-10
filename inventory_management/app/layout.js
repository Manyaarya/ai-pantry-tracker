// app/layout.js
'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#001845',
    },
    secondary: {
      main: '#33415c',
    },
  },
});

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <html lang="en">
          <body>{children}</body>
        </html>
      </ThemeProvider>
    </ClerkProvider>
  );
}
