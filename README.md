# Audio Transcriber

A modern web application that transcribes audio content from YouTube, Spotify, and other platforms using AI, and generates structured notes from the transcriptions.

🔗 **Repository**: [https://github.com/kukshaus/transcribe.git](https://github.com/kukshaus/transcribe.git)

## Features

- 🎵 **Multi-platform Support**: YouTube, Spotify, SoundCloud, Vimeo, and more
- 🤖 **AI Transcription**: Powered by OpenAI Whisper for accurate speech-to-text
- 📝 **Smart Notes**: AI-generated structured notes from transcriptions
- 💾 **Download Options**: Export transcriptions and notes as text files
- 🎨 **Modern UI**: Clean, Stripe-inspired design with real-time updates
- ⚡ **Background Processing**: Non-blocking transcription workflow
- 📊 **Status Tracking**: Real-time progress monitoring

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **AI Services**: OpenAI (Whisper + GPT-3.5)
- **Audio Processing**: yt-dlp for audio extraction

## Prerequisites

Before running the application, make sure you have:

1. **Node.js** (v18 or later)
2. **MongoDB** (local installation or MongoDB Atlas)
3. **OpenAI API Key** (for transcription and note generation)
4. **yt-dlp** (for audio downloading)

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
   
   # OpenAI API key
   OPENAI_API_KEY=your_openai_api_key_here
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

1. **Paste a URL**: Enter a URL from YouTube, Spotify, or other supported platforms
2. **Start Transcription**: Click "Start Transcription" to begin processing
3. **Monitor Progress**: Watch real-time status updates (Pending → Processing → Completed)
4. **View Results**: Switch between transcription and AI-generated notes
5. **Download**: Export transcriptions or notes as text files

## Supported Platforms

- YouTube (youtube.com, youtu.be)
- Spotify (spotify.com)
- SoundCloud (soundcloud.com)
- Vimeo (vimeo.com)
- Any platform supported by yt-dlp

## API Endpoints

- `POST /api/transcriptions` - Create a new transcription job
- `GET /api/transcriptions` - List all transcriptions
- `GET /api/transcriptions/[id]` - Get a specific transcription
- `GET /api/download` - Download transcription or notes as text

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

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Yes |

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
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

## Acknowledgments

- OpenAI for Whisper and GPT APIs
- yt-dlp community for audio extraction capabilities
- Next.js and React teams for the excellent framework
