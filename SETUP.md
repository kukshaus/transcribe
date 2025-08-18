# Quick Setup Guide

## Environment Variables Setup

1. **Create your environment file:**
   ```bash
   # Copy the example file
   cp env.example .env.local
   ```

2. **Edit `.env.local` with your values:**
   ```env
   # Required - Get from MongoDB Atlas or use local MongoDB
   MONGODB_URI=mongodb://localhost:27017/transcriber
   
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

## Quick Test

After setup, test the app:

1. Open http://localhost:3000
2. Paste a YouTube URL
3. Wait for transcription and notes
4. Click "Generate PRD" to test the new feature

## Troubleshooting

- **OpenAI errors**: Check your API key and billing
- **MongoDB errors**: Verify connection string
- **PRD generation slow**: Try a lower `PRD_MAX_TOKENS` value
- **Empty PRDs**: Increase `PRD_MAX_TOKENS` or check your notes quality
