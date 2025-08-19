# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Version management system with automatic versioning
- Version display in footer
- Debug version page at `/debug-version`
- Version API endpoint at `/api/version`
- Version update scripts for development

## [0.1.0] - 2025-08-19

### Added
- Audio and video transcription functionality
- AI-generated notes and summaries
- Product Requirements Document (PRD) generation
- Token-based pricing system
- User authentication with NextAuth
- Anonymous user support with limited usage
- Stripe payment integration
- Audio file download capability
- Multiple export formats (text, markdown, Notion)
- Responsive design with dark theme
- File upload and URL input support
- Progress tracking for transcription jobs
- User spending history
- Footer with legal pages structure

### Features
- **Transcription Services**
  - Support for YouTube, Vimeo, and direct file uploads
  - Automatic audio extraction from video URLs
  - Chunked processing for large files
  - Real-time progress updates

- **AI Features**
  - OpenAI Whisper for transcription
  - GPT-powered note generation
  - PRD creation from transcriptions
  - Structured markdown output

- **User Management**
  - OAuth authentication (Google, GitHub, etc.)
  - Token purchasing system
  - Usage tracking and limits
  - Anonymous user fingerprinting

- **Technical Features**
  - Next.js 14 with App Router
  - MongoDB database integration
  - TypeScript throughout
  - Tailwind CSS for styling
  - GridFS for large file storage

### Security
- GDPR-compliant data handling
- Secure payment processing
- User data encryption
- Session management

### Performance
- Optimized image loading
- Lazy loading components
- Efficient database queries
- Background job processing

---

## Version Update Instructions

### For Developers

To update the version:

```bash
# For patch updates (bug fixes)
npm run version:patch

# For minor updates (new features)
npm run version:minor

# For major updates (breaking changes)
npm run version:major
```

### Manual Version Update

1. Update the version in `package.json`
2. Run `npm run version:update` to sync the version files
3. Update this CHANGELOG.md with the new changes
4. Commit the changes with a version tag

### Version Information

- Version format: `MAJOR.MINOR.PATCH`
- Build numbers are automatically generated based on timestamp
- Version information is displayed in the footer
- Debug version page available at `/debug-version`
- API endpoint for version info: `/api/version`
