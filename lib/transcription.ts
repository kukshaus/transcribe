import { exec } from 'child_process'
import { promisify } from 'util'
import { writeFile, unlink } from 'fs/promises'
import path from 'path'
import OpenAI from 'openai'

const execAsync = promisify(exec)

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OpenAI API key is required')
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function getVideoMetadata(url: string): Promise<{ title?: string, duration?: number, thumbnail?: string }> {
  try {
    // Get video metadata using yt-dlp including thumbnail with proper encoding
    const command = `yt-dlp --encoding utf-8 --print title --print duration --print thumbnail "${url}"`
    const { stdout } = await execAsync(command, { 
      timeout: 30000,
      encoding: 'utf8'  // Ensure UTF-8 encoding for proper character handling
    })
    
    const lines = stdout.trim().split('\n')
    let title = lines[0] || undefined
    const duration = lines[1] ? parseFloat(lines[1]) : undefined
    const thumbnail = lines[2] || undefined
    
    // Additional cleanup for title to ensure proper UTF-8 handling
    if (title) {
      // Remove any null bytes or control characters that might cause encoding issues
      title = title.replace(/\0/g, '').replace(/[\x00-\x1F\x7F]/g, '').trim()
      
      // Ensure title is not empty after cleanup
      if (!title) {
        title = undefined
      }
    }
    
    return { title, duration, thumbnail }
  } catch (error) {
    console.warn('Could not get video metadata:', error)
    return {}
  }
}

async function ensureYtDlpUpdated(): Promise<void> {
  try {
    console.log('Checking yt-dlp version...')
    // Try to update yt-dlp to latest version to handle YouTube changes
    await execAsync('yt-dlp --update', { timeout: 30000 })
    console.log('yt-dlp updated successfully')
  } catch (error) {
    console.log('yt-dlp update failed or not needed:', error instanceof Error ? error.message : error)
    // Continue anyway - maybe it's already up to date or update is not available
  }
}

function detectPlatform(url: string): string {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.toLowerCase().replace('www.', '')
    
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      return 'youtube'
    } else if (hostname.includes('soundcloud.com')) {
      return 'soundcloud'
    }
    return 'unknown'
  } catch {
    return 'unknown'
  }
}

export async function downloadAudio(url: string): Promise<string> {
  const outputDir = path.join(process.cwd(), 'temp')
  const filename = `audio_${Date.now()}`
  const isWindows = process.platform === 'win32'
  const platform = detectPlatform(url)

  try {
    // Ensure yt-dlp is updated for better platform compatibility
    await ensureYtDlpUpdated()
    
    // Create temp directory if it doesn't exist
    const mkdirCommand = isWindows ? `if not exist "${outputDir}" mkdir "${outputDir}"` : `mkdir -p "${outputDir}"`
    await execAsync(mkdirCommand, { encoding: 'utf8' })
    
    // Download with optimized settings for Whisper API (25MB limit)
    // Use lower quality and shorter duration to stay under the limit
    const optimizedOutputPath = path.join(outputDir, `${filename}.mp3`)
    
    try {
      // Strategy 1: Try MP3 conversion with enhanced format selection  
      const userAgent = '--user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36" --referer "https://www.youtube.com/"'
      let command = `yt-dlp --encoding utf-8 -x --audio-format mp3 --audio-quality 5 --postprocessor-args "-ac 1 -ar 16000" --format "bestaudio[ext=webm]/bestaudio[ext=m4a]/bestaudio" ${userAgent} --output "${optimizedOutputPath}" "${url}"`
      
      try {
        await execAsync(command, { 
          timeout: 300000, // 5 minute timeout
          encoding: 'utf8'  // Ensure UTF-8 encoding
        })
        console.log(`MP3 conversion successful: ${optimizedOutputPath}`)
        return optimizedOutputPath
      } catch (ffmpegError) {
        console.log('FFmpeg compression failed, trying direct download with multiple fallbacks...')
        
        // Strategy 2: Multiple format fallbacks
        const directOutputPath = path.join(outputDir, `${filename}.%(ext)s`)
        const formatOptions = [
          "bestaudio[filesize<?25M][ext=webm]/bestaudio[ext=webm]",
          "bestaudio[filesize<?25M][ext=m4a]/bestaudio[ext=m4a]", 
          "bestaudio[filesize<?25M]/bestaudio",
          "best[filesize<?25M]/best"
        ]
        
        // Add user agent and other options to bypass YouTube restrictions
        const extraOptions = '--user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36" --referer "https://www.youtube.com/"'
        
        let lastError: any
        for (let i = 0; i < formatOptions.length; i++) {
          const format = formatOptions[i]
          command = `yt-dlp --encoding utf-8 --format "${format}" ${extraOptions} --output "${directOutputPath}" "${url}"`
          console.log(`Trying download format ${i + 1}/${formatOptions.length}: ${format}`)
          
          try {
            await execAsync(command, { 
              timeout: 300000,
              encoding: 'utf8'
            })
            break // Success, exit the loop
          } catch (error) {
            console.log(`Format ${i + 1} failed:`, error instanceof Error ? error.message : error)
            lastError = error
            if (i === formatOptions.length - 1) {
              throw lastError // If all formats failed, throw the last error
            }
          }
        }
        
        // Find the downloaded file
        console.log(`Searching for downloaded file with pattern: ${filename}`)
        const listCommand = isWindows ? `dir /b "${outputDir}"` : `ls "${outputDir}"`
        const { stdout } = await execAsync(listCommand, { encoding: 'utf8' })
        // Clean up Windows line endings and filter empty entries
        const allFiles = stdout.trim().split('\n').map(file => file.replace(/\r/g, '').trim()).filter(file => file.length > 0)
        console.log(`All files in temp directory:`, allFiles)
        
        const files = allFiles.filter(file => file.includes(filename.toString()))
        console.log(`Matching files found:`, files)
        
        if (files.length === 0) {
          throw new Error(`Downloaded file not found. Expected pattern: ${filename}, Available files: ${allFiles.join(', ')}`)
        }
        
        const selectedFile = path.join(outputDir, files[0])
        console.log(`Direct download successful: ${selectedFile}`)
        return selectedFile
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      // Platform-specific error messages
      if (platform === 'youtube' || errorMessage.includes('youtube')) {
        if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
          throw new Error(`YouTube access restricted. The video may be private, geo-blocked, or have download restrictions. Try a different video.`)
        } else if (errorMessage.includes('Requested format is not available')) {
          throw new Error(`YouTube video format not available for download. This video may have restricted access or be a live stream.`)
        } else if (errorMessage.includes('fragment not found')) {
          throw new Error(`YouTube video download interrupted. This may be due to network issues or YouTube restrictions.`)
        } else {
          throw new Error(`YouTube audio download failed: ${errorMessage}`)
        }
      } else if (platform === 'soundcloud') {
        throw new Error(`SoundCloud audio download failed. This track may be private or have download restrictions: ${errorMessage}`)
      } else {
        // Generic error for unknown platforms
        if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
          throw new Error(`Access restricted. The content may be private, geo-blocked, or have download restrictions. Try a different URL.`)
        } else {
          throw new Error(`Audio download failed: ${errorMessage}`)
        }
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to download audio: ${errorMessage}`)
  }
}

async function checkFFmpegAvailable(): Promise<boolean> {
  try {
    await execAsync('ffmpeg -version', { timeout: 5000 })
    return true
  } catch (error) {
    console.log('FFmpeg not available in Node process')
    return false
  }
}

async function compressAudio(inputPath: string): Promise<string> {
  const outputDir = path.dirname(inputPath)
  const compressedPath = path.join(outputDir, `compressed_${Date.now()}.mp3`)
  
  // Check if FFmpeg is available
  const ffmpegAvailable = await checkFFmpegAvailable()
  if (!ffmpegAvailable) {
    throw new Error('FFmpeg not available - restart the development server')
  }
  
  try {
    // Compress audio to reduce file size: mono, 16kHz, low bitrate
    const command = `ffmpeg -i "${inputPath}" -ac 1 -ar 16000 -ab 64k -y "${compressedPath}"`
    await execAsync(command, { 
      timeout: 180000, // 3 minute timeout
      encoding: 'utf8'
    })
    
    return compressedPath
  } catch (error) {
    throw new Error(`Audio compression failed: ${error}`)
  }
}

async function getAudioDuration(inputPath: string): Promise<number> {
  try {
    const command = `ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${inputPath}"`
    const { stdout } = await execAsync(command, { 
      timeout: 30000,
      encoding: 'utf8'
    })
    return parseFloat(stdout.trim())
  } catch (error) {
    console.warn('Could not get audio duration, assuming 600 seconds')
    return 600 // Default to 10 minutes if we can't determine duration
  }
}

async function splitAudio(inputPath: string, maxSizeMB: number = 20): Promise<string[]> {
  // Check if FFmpeg is available first
  const ffmpegAvailable = await checkFFmpegAvailable()
  if (!ffmpegAvailable) {
    throw new Error('FFmpeg not available - restart the development server')
  }

  const outputDir = path.dirname(inputPath)
  const baseFilename = `chunk_${Date.now()}`
  const chunks: string[] = []
  
  try {
    // Get audio duration
    const duration = await getAudioDuration(inputPath)
    console.log(`Audio duration: ${Math.round(duration)} seconds`)
    
    // Calculate chunk duration (start with 10-minute chunks, adjust based on file size)
    const fs = await import('fs')
    const stats = fs.statSync(inputPath)
    const fileSizeMB = stats.size / (1024 * 1024)
    
    // Estimate chunk duration to keep under maxSizeMB
    const estimatedChunkDuration = Math.min(600, (duration * maxSizeMB) / fileSizeMB) // Max 10 minutes per chunk
    const chunkDuration = Math.max(300, estimatedChunkDuration) // Min 5 minutes per chunk
    
    console.log(`Splitting into chunks of ${Math.round(chunkDuration)} seconds each`)
    
    const numChunks = Math.ceil(duration / chunkDuration)
    
    for (let i = 0; i < numChunks; i++) {
      const startTime = i * chunkDuration
      const chunkPath = path.join(outputDir, `${baseFilename}_${i + 1}.mp3`)
      
      // Split audio with compression
      const command = `ffmpeg -i "${inputPath}" -ss ${startTime} -t ${chunkDuration} -ac 1 -ar 16000 -ab 64k -y "${chunkPath}"`
      await execAsync(command, { 
        timeout: 180000,
        encoding: 'utf8'
      })
      
      // Check if chunk was created and has content
      if (fs.existsSync(chunkPath)) {
        const chunkStats = fs.statSync(chunkPath)
        if (chunkStats.size > 1000) { // At least 1KB
          chunks.push(chunkPath)
          console.log(`Created chunk ${i + 1}/${numChunks}: ${Math.round(chunkStats.size / 1024 / 1024 * 100) / 100} MB`)
        } else {
          // Remove empty chunk
          fs.unlinkSync(chunkPath)
        }
      }
    }
    
    if (chunks.length === 0) {
      throw new Error('No valid chunks were created')
    }
    
    return chunks
  } catch (error) {
    // Cleanup any created chunks on error
    for (const chunk of chunks) {
      try {
        await cleanupTempFile(chunk)
      } catch (cleanupError) {
        console.warn(`Failed to cleanup chunk: ${chunk}`)
      }
    }
    throw new Error(`Audio splitting failed: ${error}`)
  }
}

async function transcribeChunk(chunkPath: string): Promise<string> {
  const fs = await import('fs')
  
  console.log(`Transcribing chunk: ${path.basename(chunkPath)}`)
  
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(chunkPath),
    model: 'whisper-1',
    response_format: 'text',
  })
  
  return transcription as string
}

export async function transcribeAudio(audioPath: string, progressCallback?: (current: number, total: number) => void): Promise<string> {
  try {
    // Import fs module properly
    const fs = await import('fs')
    
    console.log(`🎤 STARTING TRANSCRIPTION: Checking file ${audioPath}`)
    
    // Check if file exists
    if (!fs.existsSync(audioPath)) {
      // Try to find similar files in the directory for debugging
      const path = await import('path')
      const dir = path.dirname(audioPath)
      const expectedFilename = path.basename(audioPath)
      
      try {
        const { promisify } = await import('util')
        const { exec } = await import('child_process')
        const execAsync = promisify(exec)
        const isWindows = process.platform === 'win32'
        const listCommand = isWindows ? `dir /b "${dir}"` : `ls "${dir}"`
        const { stdout } = await execAsync(listCommand, { encoding: 'utf8' })
        const availableFiles = stdout.trim().split('\n').map(file => file.replace(/\r/g, '').trim()).filter(file => file.length > 0)
        
        console.log(`❌ TRANSCRIPTION ERROR: File not found`)
        console.log(`Expected: ${expectedFilename}`)
        console.log(`Available files in ${dir}:`, availableFiles)
        
        throw new Error(`Audio file not found: ${audioPath}. Available files: ${availableFiles.join(', ')}`)
      } catch (listError) {
        throw new Error(`Audio file not found: ${audioPath}`)
      }
    }
    
    console.log(`✅ TRANSCRIPTION: File found, proceeding with transcription`)

    // Get file stats to ensure it's not empty
    let stats = fs.statSync(audioPath)
    if (stats.size === 0) {
      throw new Error('Audio file is empty')
    }

    const fileSizeMB = Math.round(stats.size / 1024 / 1024 * 100) / 100
    console.log(`Audio file size: ${fileSizeMB} MB`)

    // OpenAI Whisper API has a 25MB limit
    const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB in bytes

    // Strategy 1: Try compression first for moderately large files
    if (stats.size > MAX_FILE_SIZE && stats.size < MAX_FILE_SIZE * 3) {
      console.log('File moderately large, attempting compression...')
      
      try {
        const compressedPath = await compressAudio(audioPath)
        const compressedStats = fs.statSync(compressedPath)
        const newSizeMB = Math.round(compressedStats.size / 1024 / 1024 * 100) / 100
        console.log(`Compressed to: ${newSizeMB} MB`)
        
        if (compressedStats.size <= MAX_FILE_SIZE) {
          console.log(`Transcribing compressed file: ${newSizeMB} MB`)
          const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(compressedPath),
            model: 'whisper-1',
            response_format: 'text',
          })
          
          await cleanupTempFile(compressedPath)
          return transcription as string
        } else {
          console.log('Compressed file still too large, will use chunking...')
          await cleanupTempFile(compressedPath)
        }
      } catch (compressionError) {
        console.log('Compression failed, will use chunking...')
      }
    }

    // Strategy 2: Use chunking for large files or when compression fails
    if (stats.size > MAX_FILE_SIZE) {
      console.log('Using chunking strategy for large file...')
      
      const chunks = await splitAudio(audioPath, 20) // 20MB chunks
      console.log(`Created ${chunks.length} chunks for processing`)
      
      const transcriptions: string[] = []
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i]
        console.log(`Processing chunk ${i + 1}/${chunks.length}`)
        
        // Update progress if callback provided
        if (progressCallback) {
          progressCallback(i, chunks.length)
        }
        
        try {
          const chunkTranscription = await transcribeChunk(chunk)
          transcriptions.push(chunkTranscription)
          console.log(`Chunk ${i + 1} completed: ${chunkTranscription.length} characters`)
        } catch (chunkError) {
          console.error(`Error transcribing chunk ${i + 1}:`, chunkError)
          transcriptions.push(`[Error transcribing chunk ${i + 1}]`)
        }
      }
      
      // Cleanup chunks
      for (const chunk of chunks) {
        await cleanupTempFile(chunk)
      }
      
      // Combine all transcriptions
      const combinedTranscription = transcriptions
        .filter(t => !t.includes('[Error'))
        .join(' ')
      
      if (combinedTranscription.length === 0) {
        throw new Error('All chunks failed to transcribe')
      }
      
      console.log(`Combined transcription: ${combinedTranscription.length} characters`)
      return combinedTranscription
    }

    // Strategy 3: Direct transcription for small files
    console.log(`Transcribing audio file directly: ${fileSizeMB} MB`)

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      model: 'whisper-1',
      response_format: 'text',
    })

    return transcription as string
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    
    if (errorMessage.includes('413') || errorMessage.includes('Maximum content size limit')) {
      throw new Error('Audio file is too large for transcription. Please ensure FFmpeg is installed for chunking support.')
    }
    
    throw new Error(`Failed to transcribe audio: ${errorMessage}`)
  }
}

export async function generateNotes(transcription: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an expert note-taker that creates comprehensive video/audio summaries. Your notes should be:

1. **Well-structured** with clear sections and headings
2. **Comprehensive** - capture the full essence of the content
3. **Actionable** - highlight key takeaways, insights, and important points
4. **Easy to scan** - use bullet points, numbered lists, and formatting

Format your response with:
- **Executive Summary** (2-3 sentences overview)
- **Key Points** (main topics/arguments presented)
- **Important Details** (specific facts, numbers, examples)
- **Action Items/Takeaways** (what viewers should remember or do)
- **Notable Quotes** (if any particularly impactful statements)

Use markdown formatting for better readability.`
        },
        {
          role: 'user',
          content: `Please create comprehensive structured notes from this video/audio transcription. Focus on the main content, key insights, and important takeaways:

${transcription}`
        }
      ],
      max_tokens: 3000,
      temperature: 0.2,
    })

    return completion.choices[0]?.message?.content || 'No notes generated'
  } catch (error) {
    throw new Error(`Failed to generate notes: ${error}`)
  }
}

export async function saveAudioFileToDatabase(transcriptionId: string, audioPath: string): Promise<void> {
  try {
    const fs = await import('fs')
    const path = await import('path')
    const { getDatabase } = await import('./mongodb')
    
    // Check if file exists
    if (!fs.existsSync(audioPath)) {
      console.warn(`Audio file not found for saving: ${audioPath}`)
      return
    }
    
    const stats = fs.statSync(audioPath)
    const filename = path.basename(audioPath)
    const fileSizeMB = stats.size / (1024 * 1024)
    
    // Determine MIME type based on file extension
    const ext = path.extname(filename).toLowerCase()
    let mimeType = 'audio/mpeg' // default
    switch (ext) {
      case '.mp3':
        mimeType = 'audio/mpeg'
        break
      case '.wav':
        mimeType = 'audio/wav'
        break
      case '.webm':
        mimeType = 'audio/webm'
        break
      case '.m4a':
        mimeType = 'audio/mp4'
        break
      case '.ogg':
        mimeType = 'audio/ogg'
        break
      default:
        mimeType = 'audio/mpeg'
    }
    
    const db = await getDatabase()
    
    // Always use GridFS for audio files to prevent performance issues
    // Document storage causes slow queries when fetching multiple transcriptions
    // Even small audio files can cause issues when there are many transcriptions
    console.log(`Using GridFS for audio file: ${filename} (${fileSizeMB.toFixed(2)} MB)`)
    await saveAudioFileWithGridFS(db, transcriptionId, audioPath, filename, mimeType, stats.size)
    
  } catch (error) {
    console.error(`Failed to save audio file to database:`, error)
  }
}

async function saveAudioFileAsDocument(db: any, transcriptionId: string, audioPath: string, filename: string, mimeType: string, fileSize: number): Promise<void> {
  const fs = await import('fs')
  const { ObjectId } = await import('mongodb')
  
  // Read file data for small files
  const audioData = fs.readFileSync(audioPath)
  
  const transcriptionsCollection = db.collection('transcriptions')
  await transcriptionsCollection.updateOne(
    { _id: new ObjectId(transcriptionId) },
    {
      $set: {
        audioFile: {
          data: audioData,
          filename: filename,
          mimeType: mimeType,
          size: fileSize,
          storageType: 'document'
        },
        updatedAt: new Date()
      }
    }
  )
  
  console.log(`Saved audio file as document: ${filename} (${Math.round(fileSize / 1024)} KB)`)
}

async function saveAudioFileWithGridFS(db: any, transcriptionId: string, audioPath: string, filename: string, mimeType: string, fileSize: number): Promise<void> {
  const fs = await import('fs')
  const { GridFSBucket, ObjectId } = await import('mongodb')
  
  // Create GridFS bucket
  const bucket = new GridFSBucket(db, { bucketName: 'audioFiles' })
  
  // Create a unique filename with transcription ID
  const gridfsFilename = `${transcriptionId}_${filename}`
  
  // Upload file to GridFS
  const uploadStream = bucket.openUploadStream(gridfsFilename, {
    metadata: {
      transcriptionId: transcriptionId,
      originalFilename: filename,
      mimeType: mimeType,
      uploadDate: new Date()
    }
  })
  
  // Stream the file to GridFS
  const readStream = fs.createReadStream(audioPath)
  
  return new Promise((resolve, reject) => {
    readStream.pipe(uploadStream)
      .on('error', (error) => {
        console.error('Error uploading to GridFS:', error)
        reject(error)
      })
      .on('finish', async () => {
        try {
          // Update transcription document with GridFS file info
          const transcriptionsCollection = db.collection('transcriptions')
          await transcriptionsCollection.updateOne(
            { _id: new ObjectId(transcriptionId) },
            {
              $set: {
                audioFile: {
                  gridfsId: uploadStream.id,
                  filename: filename,
                  mimeType: mimeType,
                  size: fileSize,
                  storageType: 'gridfs'
                },
                updatedAt: new Date()
              }
            }
          )
          
          console.log(`Saved audio file to GridFS: ${filename} (${Math.round(fileSize / (1024 * 1024))} MB)`)
          resolve()
        } catch (error) {
          console.error('Error updating transcription with GridFS info:', error)
          reject(error)
        }
      })
  })
}

export async function cleanupTempFile(filePath: string): Promise<void> {
  try {
    await unlink(filePath)
  } catch (error) {
    console.warn(`Failed to cleanup temp file: ${filePath}`)
  }
}
