# Authentication Guide

## Issue: Cannot Sign In with Different Google Account

### Problem
After signing out, users were unable to sign in with a different Google account. The app would either:
- Automatically sign them back in with the previous account
- Not show the Google account selection screen
- Use cached authentication data

### Root Cause
This happens because:
1. **NextAuth.js Cookies**: Session cookies weren't being cleared properly
2. **Google OAuth Caching**: Google's OAuth flow was remembering the previous account
3. **Browser Local Storage**: Cached authentication data persisted after sign-out
4. **Missing Account Selection Prompt**: Google wasn't being asked to show account selection

### Solution Implemented

#### 1. **Enhanced Google OAuth Configuration**
```typescript
GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  authorization: {
    params: {
      prompt: "consent",           // Always ask for permission
      access_type: "offline",      // Get refresh token
      response_type: "code",       // Use authorization code flow
      hd: undefined               // Allow any domain
    }
  }
})
```

#### 2. **Force Account Selection on Sign-In**
```typescript
// In sign-in buttons
signIn('google', { 
  callbackUrl: '/',
  prompt: 'select_account'  // Force Google to show account picker
})
```

#### 3. **Enhanced Sign-Out Process**
```typescript
// Custom SignOutButton component
const handleSignOut = async () => {
  // Clear local storage
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('transcribe-') || key.includes('auth')) {
      localStorage.removeItem(key)
    }
  })
  
  // Sign out with NextAuth
  await signOut({ callbackUrl: '/', redirect: true })
}
```

#### 4. **Improved Session Configuration**
```typescript
session: {
  strategy: 'jwt',
  maxAge: 30 * 24 * 60 * 60, // 30 days
},
cookies: {
  sessionToken: {
    name: 'next-auth.session-token',
    options: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    },
  },
}
```

### How to Test the Fix

1. **Sign in** with a Google account
2. **Sign out** using the sign-out button
3. **Try to sign in again** - Google should show account selection
4. **Choose a different Google account** - it should work properly

### Additional Troubleshooting

If you're still having issues:

1. **Clear Browser Data Manually**:
   - Go to Browser Settings → Privacy → Clear Browsing Data
   - Select "Cookies and other site data" and "Cached images and files"
   - Clear data for the last hour

2. **Use Incognito/Private Mode**:
   - Test sign-in with different accounts in private browsing mode

3. **Check Google Account Settings**:
   - Go to [Google Account Settings](https://myaccount.google.com/permissions)
   - Remove the app's permissions and try signing in again

4. **Restart the Development Server**:
   ```bash
   npm run dev
   ```

### Environment Variables Required

Make sure these are set in your `.env.local`:
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

The authentication flow should now properly allow users to switch between different Google accounts without any caching issues.
