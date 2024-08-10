// app/middleware.js
import { withClerkMiddleware } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

const middleware = withClerkMiddleware((req) => {
  // Check if the user is authenticated
  const { userId } = req.auth;

  if (!userId) {
    // If not authenticated, redirect to the sign-in page
    return NextResponse.redirect(new URL('/auth/sign-in', req.url));
  }

  // If authenticated, allow the request to continue
  return NextResponse.next();
});

export default middleware;

export const config = {
  matcher: ['/((?!_next|favicon.ico|api|auth).*)'], // Exclude certain paths
};
