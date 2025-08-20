# Audio Transcriber

A modern web application that transcribes audio content from YouTube, SoundCloud, and other platforms using AI, and generates structured notes from the transcriptions.

🔗 **Repository**: [https://github.com/kukshaus/transcribe.git](https://github.com/kukshaus/transcribe.git)

## Features

- 🎵 **Multi-platform Support**: YouTube, SoundCloud, and more
- 🤖 **AI Transcription**: Powered by OpenAI Whisper for accurate speech-to-text
- 📝 **Smart Notes**: AI-generated structured notes from transcriptions
- 💾 **Download Options**: Export transcriptions and notes as text files
- 📋 **Notion Export**: Download notes formatted for easy Notion import
- 📄 **PRD Generation**: Transform notes into comprehensive Product Requirements Documents
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
   
   # OpenAI API key (required for transcription, notes, and PRD generation)
   OPENAI_API_KEY=your_openai_api_key_here
   
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

1. **Paste a URL**: Enter a URL from YouTube, SoundCloud, or other supported platforms
2. **Start Transcription**: Click "Start Transcription" to begin processing
3. **Monitor Progress**: Watch real-time status updates (Pending → Processing → Completed)
4. **View Results**: Switch between transcription and AI-generated notes
5. **Download**: Export transcriptions or notes as text files
6. **Export to Notion** (optional): Download notes formatted for easy import into Notion
7. **Generate PRD** (optional): Transform notes into a comprehensive Product Requirements Document

## Supported Platforms

- ✅ **YouTube** (youtube.com, youtu.be) - Fully supported
- ✅ **SoundCloud** (soundcloud.com) - Supported

- 🔄 **Other platforms** - May work if supported by yt-dlp

## API Endpoints

- `POST /api/transcriptions` - Create a new transcription job
- `GET /api/transcriptions` - List all transcriptions
- `GET /api/transcriptions/[id]` - Get a specific transcription
- `GET /api/download` - Download transcription, notes, Notion-formatted files, or PRDs
- `POST /api/generate-prd` - Generate Product Requirements Document from notes

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
