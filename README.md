# TranscribeAI

A modern web application that transcribes audio content from YouTube, SoundCloud, and other platforms using AI, and generates structured notes from the transcriptions. Features a custom Bison Bucks payment system for premium AI features.

🔗 **Repository**: [https://github.com/kukshaus/transcribe.git](https://github.com/kukshaus/transcribe.git)

## Features

- 🎵 **Multi-platform Support**: YouTube, SoundCloud, and more
- 🤖 **AI Transcription**: Powered by OpenAI Whisper for accurate speech-to-text
- 📝 **Smart Notes**: AI-generated structured notes from transcriptions
- 📄 **PRD Generation**: Transform notes into comprehensive Product Requirements Documents
- 💾 **Download Options**: Export transcriptions, notes, and PRDs as text files
- 📋 **Notion Export**: Download notes formatted for easy Notion import
- 🔐 **Google OAuth**: Secure authentication with Google accounts
- 💰 **Bison Bucks System**: Custom currency for premium AI features
- 💳 **Stripe Integration**: Secure payment processing for Bison Bucks purchases
- 🎨 **Modern UI**: Clean, responsive design with real-time updates
- ⚡ **Background Processing**: Non-blocking transcription workflow
- 📊 **Status Tracking**: Real-time progress monitoring
- 👤 **User Profiles**: Track usage history and Bison Bucks balance

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Authentication**: NextAuth.js with Google OAuth
- **Payments**: Stripe for Bison Bucks purchases
- **AI Services**: OpenAI (Whisper + GPT-3.5)
- **Audio Processing**: yt-dlp for audio extraction

## Prerequisites

Before running the application, make sure you have:

1. **Node.js** (v18 or later)
2. **MongoDB** (local installation or MongoDB Atlas)
3. **OpenAI API Key** (for transcription and note generation)
4. **Google OAuth Credentials** (for user authentication)
5. **Stripe Account** (for payment processing)
6. **yt-dlp** (for audio downloading)

### Installing yt-dlp

```bash
# On macOS (using Homebrew)
brew install yt-dlp

# On Ubuntu/Debian
sudo apt install yt-dlp

# On Windows (using pip)
pip install yt-dlp

# Alternative: Download binary from https://github.com/yt-dlp/yt-dlp/releases
```

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kukshaus/transcribe.git
   cd transcriber
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # MongoDB connection string
   MONGODB_URI=mongodb://localhost:27017/transcriber
   
   # OpenAI API key (required for transcription, notes, and PRD generation)
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Google OAuth (required for authentication)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   
   # Stripe (required for Bison Bucks payments)
   STRIPE_SECRET_KEY=your_stripe_secret_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   
   # PRD Generation Settings (Optional)
   PRD_MODEL=gpt-3.5-turbo
   PRD_MAX_TOKENS=4000
   PRD_TEMPERATURE=0.7
   ```

4. **Start MongoDB**
   
   If using local MongoDB:
   ```bash
   mongod
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### For Anonymous Users
1. **Paste a URL**: Enter a URL from YouTube, SoundCloud, or other supported platforms
2. **Start Transcription**: Click "Get Video Transcript" to begin processing
3. **Monitor Progress**: Watch real-time status updates (Pending → Processing → Completed)
4. **View Results**: View the transcription text
5. **Download**: Export transcriptions as text files

### For Authenticated Users
1. **Sign In**: Use Google OAuth to create an account
2. **Get Free Bison Bucks**: Receive 1 free Bison Buck upon signup
3. **Paste a URL**: Enter a URL from YouTube, SoundCloud, or other supported platforms
4. **Start Transcription**: Click "Get Video Transcript" to begin processing (costs 1 Bison Buck)
5. **Generate AI Notes**: Create structured notes from transcriptions (costs 1 Bison Buck)
6. **Generate PRD**: Transform notes into Product Requirements Documents (costs 2 Bison Bucks)
7. **Download**: Export transcriptions, notes, or PRDs as text files
8. **Export to Notion**: Download notes formatted for easy import into Notion
9. **Purchase More Bison Bucks**: Buy additional Bison Bucks through Stripe integration

## Supported Platforms

- ✅ **YouTube** (youtube.com, youtu.be) - Fully supported
- ✅ **SoundCloud** (soundcloud.com) - Supported

- 🔄 **Other platforms** - May work if supported by yt-dlp

## Bison Bucks System

TranscribeAI uses a custom currency called "Bison Bucks" for premium AI features:

### Pricing
- **1 Bison Buck** = 1 transcription
- **1 Bison Buck** = 1 AI notes generation  
- **2 Bison Bucks** = 1 PRD generation

### Packages
- **Starter Pack**: 10 Bison Bucks for $5.00 ($0.50 per Bison Buck)
- **Professional Pack**: 25 Bison Bucks for $10.00 ($0.40 per Bison Buck) - Most Popular
- **Enterprise Pack**: 50 Bison Bucks for $18.00 ($0.36 per Bison Buck)

### Features
- **No Expiration**: Bison Bucks never expire
- **Pay Once, Use Anytime**: No subscriptions required
- **Secure Payments**: Processed through Stripe
- **Free Starter**: Get 1 free Bison Buck upon signup
- **Usage Tracking**: Monitor your Bison Bucks balance and spending history

## API Endpoints

### Core Features
- `POST /api/transcriptions` - Create a new transcription job
- `GET /api/transcriptions` - List all transcriptions
- `GET /api/transcriptions/[id]` - Get a specific transcription
- `GET /api/download` - Download transcription, notes, Notion-formatted files, or PRDs
- `POST /api/generate-notes` - Generate AI notes from transcription
- `POST /api/generate-prd` - Generate Product Requirements Document from notes

### Authentication & User Management
- `GET /api/auth/[...nextauth]` - NextAuth.js authentication endpoints
- `GET /api/user/tokens` - Get user's Bison Bucks balance
- `GET /api/user/spending-history` - Get user's Bison Bucks transaction history

### Payment System
- `POST /api/stripe/checkout` - Create Stripe checkout session for Bison Bucks purchase
- `POST /api/stripe/webhook` - Handle Stripe payment webhooks
- `GET /api/payment/success` - Payment success page
- `GET /api/payment/cancel` - Payment cancellation page

## Development

### Project Structure

```
transcriber/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── UrlInput.tsx       # URL input form
│   └── TranscriptionCard.tsx # Transcription display
├── lib/                   # Utility libraries
│   ├── mongodb.ts         # Database connection
│   ├── transcription.ts   # Audio processing logic
│   └── models/            # Data models
└── public/               # Static assets
```

### Key Components

- **UrlInput**: Modern form component for URL submission
- **TranscriptionCard**: Displays transcription status, content, and download options
- **MongoDB Integration**: Handles data persistence and retrieval
- **Background Processing**: Async transcription workflow

## Configuration

### MongoDB

The app automatically creates the necessary collections. No manual database setup required.

### OpenAI

Make sure your OpenAI API key has access to:
- Whisper API (for transcription)
- GPT-3.5 Turbo (for note generation)

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MONGODB_URI` | MongoDB connection string | Yes | - |
| `OPENAI_API_KEY` | OpenAI API key for transcription, notes, and PRD generation | Yes | - |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes | - |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes | - |
| `NEXTAUTH_URL` | Base URL for NextAuth.js | Yes | - |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js JWT signing | Yes | - |
| `STRIPE_SECRET_KEY` | Stripe secret key for payments | Yes | - |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Yes | - |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Yes | - |
| `NEXT_PUBLIC_BASE_URL` | Base URL for the application | Yes | - |
| `PRD_MODEL` | OpenAI model for PRD generation | No | gpt-3.5-turbo |
| `PRD_MAX_TOKENS` | Maximum tokens for PRD generation | No | 4000 |
| `PRD_TEMPERATURE` | Creativity level for PRD generation (0.0-1.0) | No | 0.7 |

## Notion Import

To import notes into Notion:

1. **Complete a transcription** with AI-generated notes
2. **Click "Download for Notion"** on any completed transcription
3. **Import the file** into Notion:
   - Open Notion and navigate to your desired page or database
   - Click "Import" or drag and drop the downloaded `.md` file
   - Notion will automatically format the markdown content

The exported file includes:
- **Formatted title** with the original video/audio title
- **Source link** to the original content
- **Creation date** for reference
- **Structured notes** with proper markdown formatting (headings, lists, etc.)
- **Export timestamp** for tracking

This approach is simple, doesn't require API setup, and gives you full control over where and how to organize your notes in Notion.

## PRD Generation

Transform your AI-generated notes into comprehensive Product Requirements Documents (PRDs):

1. **Complete a transcription** with AI-generated notes
2. **Click "Generate PRD"** on any completed transcription with notes
3. **Wait for processing** - The AI will analyze your notes and create a structured PRD
4. **Download the PRD** - Once generated, click "Download PRD" to get your document

### PRD Features

The generated PRD includes:
- **Introduction & Overview** - Product description and context
- **Goals & Objectives** - SMART goals and success criteria  
- **Target Audience** - User personas and characteristics
- **User Stories** - Key user journeys and use cases
- **Functional Requirements** - Core features and capabilities
- **Non-Functional Requirements** - Performance, security, usability standards
- **Design Considerations** - UI/UX and technical architecture notes
- **Success Metrics** - KPIs and measurable outcomes
- **Open Questions** - Areas needing clarification and future considerations

### Use Cases

Perfect for:
- **Product Managers** - Converting meeting notes or brainstorming sessions into structured requirements
- **Entrepreneurs** - Transforming idea discussions into actionable product plans
- **Development Teams** - Creating formal documentation from informal discussions
- **Consultants** - Structuring client requirements from discovery sessions

The PRD generator uses your exact prompt template to ensure consistent, professional output that follows industry best practices.

### PRD Configuration

You can customize PRD generation behavior using environment variables:

- **`PRD_MODEL`** - Choose the OpenAI model:
  - `gpt-3.5-turbo` (default) - Fast and cost-effective
  - `gpt-4` - Higher quality but slower and more expensive
  - `gpt-4-turbo-preview` - Latest model with improved capabilities

- **`PRD_MAX_TOKENS`** - Control output length:
  - `4000` (default) - Comprehensive PRDs
  - `2000` - Shorter, more concise documents
  - `6000` - Very detailed PRDs (requires compatible model)

- **`PRD_TEMPERATURE`** - Adjust creativity level:
  - `0.3` - Very focused and consistent
  - `0.7` (default) - Balanced creativity and structure  
  - `1.0` - More creative and varied output

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `MONGODB_URI` - Your MongoDB connection string
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `GOOGLE_CLIENT_ID` - Your Google OAuth client ID
   - `GOOGLE_CLIENT_SECRET` - Your Google OAuth client secret
   - `NEXTAUTH_URL` - Your production URL (e.g., https://your-app.vercel.app)
   - `NEXTAUTH_SECRET` - A random secret for JWT signing
   - `STRIPE_SECRET_KEY` - Your Stripe secret key
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key
   - `STRIPE_WEBHOOK_SECRET` - Your Stripe webhook secret
   - `NEXT_PUBLIC_BASE_URL` - Your production URL
   - `PRD_MODEL` (optional) - OpenAI model for PRD generation
   - `PRD_MAX_TOKENS` (optional) - Token limit for PRDs
   - `PRD_TEMPERATURE` (optional) - Creativity level for PRDs
4. Deploy

### Manual Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Troubleshooting

### Common Issues

1. **yt-dlp not found**: Make sure yt-dlp is installed and available in PATH
2. **MongoDB connection failed**: Check your MONGODB_URI and ensure MongoDB is running
3. **OpenAI API errors**: Verify your API key and check usage limits
4. **Audio download fails**: Some platforms may have restrictions; try a different URL
5. **Google OAuth errors**: Verify your Google OAuth credentials and redirect URIs
6. **Stripe payment failures**: Check your Stripe keys and webhook configuration
7. **Authentication issues**: Ensure NEXTAUTH_SECRET is set and NEXTAUTH_URL matches your domain

### Logs

Check the console and server logs for detailed error messages during transcription processing.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Setup Guides

For detailed setup instructions, see these guides:

- **[Authentication Setup Guide](AUTHENTICATION_GUIDE.md)** - Complete Google OAuth configuration
- **[Stripe Setup Guide](STRIPE_SETUP.md)** - Payment system configuration
- **[Production Migration Guide](PRODUCTION_MIGRATION_GUIDE.md)** - Deploying to production
- **[Performance Optimization Guide](PERFORMANCE_OPTIMIZATION.md)** - Optimizing for scale

## Acknowledgments

- OpenAI for Whisper and GPT APIs
- yt-dlp community for audio extraction capabilities
- Next.js and React teams for the excellent framework
- Stripe for payment processing infrastructure
- NextAuth.js for authentication solutions
