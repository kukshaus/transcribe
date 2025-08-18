# Complete Setup Guide

## Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)
- Google Cloud Console account
- OpenAI API account

## 1. Environment Variables Setup

1. **Create your environment file:**
   ```bash
   # Copy the example file
   cp env.example .env.local
   ```

2. **Edit `.env.local` with your values:**
   ```env
   # Required - Get from MongoDB Atlas or use local MongoDB
   MONGODB_URI=mongodb://localhost:27017/transcriber
   
   # Required - NextAuth configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-random-secret-here
   
   # Required - Google OAuth (see Google Setup section below)
   GOOGLE_CLIENT_ID=your-google-client-id-here
   GOOGLE_CLIENT_SECRET=your-google-client-secret-here
   
   # Required - Get from https://platform.openai.com/api-keys
   OPENAI_API_KEY=sk-your-actual-api-key-here
   
   # Optional - Customize PRD generation
   PRD_MODEL=gpt-3.5-turbo
   PRD_MAX_TOKENS=4000
   PRD_TEMPERATURE=0.7
   ```

3. **Install dependencies and start:**
   ```bash
   npm install
   npm run dev
   ```

## 2. Google OAuth Setup

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/
   - Create a new project or select existing one

2. **Enable Google+ API:**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it

3. **Create OAuth 2.0 Credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Application type: "Web application"
   - Name: "Transcriber App"

4. **Configure URLs:**
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`

5. **Copy Credentials:**
   - Copy the Client ID and Client Secret
   - Add them to your `.env.local` file

6. **Generate NextAuth Secret:**
   ```bash
   # Generate a random secret
   openssl rand -base64 32
   ```
   - Add this to `NEXTAUTH_SECRET` in `.env.local`

## Environment Variable Details

### Required Variables

- **`MONGODB_URI`**: Your MongoDB connection string
  - Local: `mongodb://localhost:27017/transcriber`
  - Atlas: `mongodb+srv://username:password@cluster.mongodb.net/transcriber`

- **`OPENAI_API_KEY`**: Your OpenAI API key
  - Get it from: https://platform.openai.com/api-keys
  - Format: `sk-...` (starts with 'sk-')

### Optional PRD Variables

- **`PRD_MODEL`**: Choose AI model for PRD generation
  - `gpt-3.5-turbo` (default) - Fast and cost-effective
  - `gpt-4` - Higher quality, more expensive
  - `gpt-4-turbo-preview` - Latest capabilities

- **`PRD_MAX_TOKENS`**: Control PRD length
  - `4000` (default) - Comprehensive documents
  - `2000` - Shorter PRDs
  - `6000` - Very detailed PRDs

- **`PRD_TEMPERATURE`**: Adjust creativity (0.0-1.0)
  - `0.3` - Very focused and consistent
  - `0.7` (default) - Balanced
  - `1.0` - More creative

## 3. Quick Test

After setup, test the app:

1. Open http://localhost:3000
2. Click "Sign In" and authenticate with Google
3. Paste a YouTube URL
4. Wait for transcription and notes
5. Click "Generate PRD" to test the new feature
6. Only your own transcriptions will be visible

## 4. User Authentication Features

The app now includes:

- **Google OAuth Sign-in**: Secure authentication with Google
- **User-specific content**: Each user only sees their own transcriptions
- **Protected routes**: All transcription APIs require authentication
- **Session management**: Persistent login state across browser sessions
- **User profile display**: Shows user name and avatar in header

## 5. Production Deployment

For production deployment:

1. **Update environment variables:**
   ```env
   NEXTAUTH_URL=https://your-domain.com
   NEXT_PUBLIC_BASE_URL=https://your-domain.com
   ```

2. **Update Google OAuth settings:**
   - Add production domain to authorized origins
   - Add production callback URL: `https://your-domain.com/api/auth/callback/google`

3. **Database setup:**
   - Use MongoDB Atlas for production
   - Update `MONGODB_URI` with Atlas connection string

## 6. Troubleshooting

### Authentication Issues
- **Google OAuth errors**: Check client ID/secret and authorized URLs
- **Session issues**: Verify `NEXTAUTH_SECRET` is set and unique
- **Redirect errors**: Ensure callback URLs match exactly

### General Issues
- **OpenAI errors**: Check your API key and billing
- **MongoDB errors**: Verify connection string
- **PRD generation slow**: Try a lower `PRD_MAX_TOKENS` value
- **Empty PRDs**: Increase `PRD_MAX_TOKENS` or check your notes quality

### Common Error Messages
- `Authentication required`: User needs to sign in
- `Transcription not found`: User trying to access another user's content
- `Invalid OAuth configuration`: Check Google Cloud Console settings
