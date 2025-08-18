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

export async function getVideoMetadata(url: string): Promise<{ title?: string, duration?: number }> {
  try {
    // Get video metadata using yt-dlp
    const command = `yt-dlp --print title --print duration "${url}"`
    const { stdout } = await execAsync(command, { timeout: 30000 })
    
    const lines = stdout.trim().split('\n')
    const title = lines[0] || undefined
    const duration = lines[1] ? parseFloat(lines[1]) : undefined
    
    return { title, duration }
  } catch (error) {
    console.warn('Could not get video metadata:', error)
    return {}
  }
}

export async function downloadAudio(url: string): Promise<string> {
  const outputDir = path.join(process.cwd(), 'temp')
  const filename = `audio_${Date.now()}`
  const isWindows = process.platform === 'win32'

  try {
    // Create temp directory if it doesn't exist
    const mkdirCommand = isWindows ? `if not exist "${outputDir}" mkdir "${outputDir}"` : `mkdir -p "${outputDir}"`
    await execAsync(mkdirCommand)
    
    // Download with optimized settings for Whisper API (25MB limit)
    // Use lower quality and shorter duration to stay under the limit
    const optimizedOutputPath = path.join(outputDir, `${filename}.mp3`)
    
    try {
      // First try: Download with audio compression for Whisper API
      let command = `yt-dlp -x --audio-format mp3 --audio-quality 5 --postprocessor-args "-ac 1 -ar 16000" --output "${optimizedOutputPath}" "${url}"`
      
      try {
        await execAsync(command, { timeout: 300000 }) // 5 minute timeout
        return optimizedOutputPath
      } catch (ffmpegError) {
        console.log('FFmpeg compression failed, trying direct download...')
        
        // Fallback: Direct download without conversion
        const directOutputPath = path.join(outputDir, `${filename}.%(ext)s`)
        command = `yt-dlp --format "bestaudio[filesize<?25M]/bestaudio" --output "${directOutputPath}" "${url}"`
        
        await execAsync(command, { timeout: 300000 })
        
        // Find the downloaded file
        const listCommand = isWindows ? `dir /b "${outputDir}"` : `ls "${outputDir}"`
        const { stdout } = await execAsync(listCommand)
        const files = stdout.trim().split('\n').filter(file => file.includes(filename.toString()))
        
        if (files.length === 0) {
          throw new Error('Downloaded file not found')
        }
        
        return path.join(outputDir, files[0])
      }
    } catch (error) {
      throw new Error(`Audio download failed: ${error}`)
    }
  } catch (error) {
    throw new Error(`Failed to download audio: ${error}`)
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
    await execAsync(command, { timeout: 180000 }) // 3 minute timeout
    
    return compressedPath
  } catch (error) {
    throw new Error(`Audio compression failed: ${error}`)
  }
}

async function getAudioDuration(inputPath: string): Promise<number> {
  try {
    const command = `ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${inputPath}"`
    const { stdout } = await execAsync(command, { timeout: 30000 })
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
      await execAsync(command, { timeout: 180000 })
      
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
    
    // Check if file exists
    if (!fs.existsSync(audioPath)) {
      throw new Error(`Audio file not found: ${audioPath}`)
    }

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
          content: 'You are a helpful assistant that creates concise, well-structured notes from transcriptions. Format the notes with clear headings, bullet points, and key takeaways.'
        },
        {
          role: 'user',
          content: `Please create structured notes from this transcription:\n\n${transcription}`
        }
      ],
      max_tokens: 2000,
      temperature: 0.3,
    })

    return completion.choices[0]?.message?.content || 'No notes generated'
  } catch (error) {
    throw new Error(`Failed to generate notes: ${error}`)
  }
}

export async function cleanupTempFile(filePath: string): Promise<void> {
  try {
    await unlink(filePath)
  } catch (error) {
    console.warn(`Failed to cleanup temp file: ${filePath}`)
  }
}
