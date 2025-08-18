import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { Transcription } from '@/lib/models/Transcription'
import { ObjectId } from 'mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { consumeUserTokenWithHistory, checkUserTokens } from '@/lib/usage'
import OpenAI from 'openai'

// Initialize OpenAI client
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set')
  }

  return new OpenAI({
    apiKey: apiKey,
  })
}

const PRD_PROMPT_TEMPLATE = `ROLE:

You are an expert Product Manager assistant and requirements analyst. Act as a specialized agent focused solely on eliciting product requirements. Respond with the perspective of an expert in product requirements gathering.

GOAL:

Create a comprehensive draft Product Requirements Document (PRD) for a new product/feature based on the provided notes/content. Extract and structure the information to align with standard PRD practices.

PROCESS & KEY RULES:

1. Analyze the provided content step-by-step to extract product-related information
2. Structure the information according to the PRD format outlined below
3. Make reasonable assumptions where information is missing, but clearly mark them as assumptions
4. Focus on creating actionable, specific requirements
5. Use clear, professional language suitable for stakeholders
6. Include quantifiable metrics where possible
7. Highlight any areas that need further clarification or research

DESIRED PRD STRUCTURE:

1. **Introduction / Overview**
   - Brief product/feature description
   - Context and background

2. **Goals / Objectives**
   - Primary objectives (SMART goals if possible)
   - Success criteria

3. **Target Audience / User Personas**
   - Primary users
   - User characteristics and needs

4. **User Stories / Use Cases**
   - Key user journeys
   - Main use cases

5. **Functional Requirements**
   - Core features and capabilities
   - Specific functionality needed

6. **Non-Functional Requirements**
   - Performance requirements
   - Security considerations
   - Usability standards
   - Scalability needs

7. **Design Considerations**
   - UI/UX considerations
   - Technical architecture notes

8. **Success Metrics**
   - Key Performance Indicators (KPIs)
   - Measurable outcomes

9. **Open Questions / Future Considerations**
   - Areas needing clarification
   - Future enhancements
   - Risks and assumptions

TONE & CONSTRAINTS:

- Maintain a clear, professional, and structured tone
- Use simple, non-technical language where possible
- Make reasonable assumptions about technical implementation
- Focus on user value and business outcomes

YOUR TASK:

Based on the content provided below, create a comprehensive PRD following the structure above. Mark any assumptions clearly and highlight areas that need further research or clarification.

CONTENT TO ANALYZE:

--- CONTENT START ---
{NOTES_CONTENT}
--- CONTENT END ---

Please create a detailed PRD based on this content, following the structure outlined above.`

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { transcriptionId } = body

    if (!transcriptionId) {
      return NextResponse.json({ 
        error: 'Transcription ID is required' 
      }, { status: 400 })
    }

    if (!ObjectId.isValid(transcriptionId)) {
      return NextResponse.json({ 
        error: 'Invalid transcription ID' 
      }, { status: 400 })
    }

    // Get transcription from database first
    const db = await getDatabase()
    const transcriptionsCollection = db.collection<Transcription>('transcriptions')

    const transcription = await transcriptionsCollection.findOne({ 
      _id: new ObjectId(transcriptionId),
      userId: session.user.id
    })

    if (!transcription) {
      return NextResponse.json({ 
        error: 'Transcription not found' 
      }, { status: 404 })
    }

    if (transcription.status !== 'completed') {
      return NextResponse.json({ 
        error: 'Transcription not completed yet' 
      }, { status: 400 })
    }

    if (!transcription.notes) {
      return NextResponse.json({ 
        error: 'No notes available for this transcription. PRD generation requires notes.' 
      }, { status: 404 })
    }

    // Check if user has tokens (but don't consume yet)
    const { tokenCount } = await checkUserTokens(session.user.id)
    if (tokenCount < 2) {
      return NextResponse.json({ 
        error: 'Insufficient tokens. PRD generation requires 2 tokens. Please purchase more tokens to continue.',
        code: 'INSUFFICIENT_TOKENS'
      }, { status: 402 })
    }

    // Initialize OpenAI client
    const openai = getOpenAIClient()

    // Create the prompt with the notes content
    const prompt = PRD_PROMPT_TEMPLATE.replace('{NOTES_CONTENT}', transcription.notes)

    // Generate PRD using OpenAI with configurable settings
    const model = process.env.PRD_MODEL || "gpt-3.5-turbo"
    const maxTokens = parseInt(process.env.PRD_MAX_TOKENS || "4000")
    const temperature = parseFloat(process.env.PRD_TEMPERATURE || "0.7")
    
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: maxTokens,
      temperature: temperature,
    })

    const prdContent = completion.choices[0]?.message?.content

    if (!prdContent) {
      return NextResponse.json({ 
        error: 'Failed to generate PRD content' 
      }, { status: 500 })
    }

    // Create a comprehensive PRD document with metadata
    const title = transcription.title || 'Product Requirements Document'
    const sourceUrl = transcription.url
    const createdDate = new Date(transcription.createdAt).toLocaleDateString()
    const generatedDate = new Date().toLocaleDateString()
    
    const fullPRD = `# Product Requirements Document
## ${title}

**Generated from:** [${sourceUrl}](${sourceUrl})  
**Original Content Date:** ${createdDate}  
**PRD Generated:** ${generatedDate}

---

${prdContent}

---

## Document Information

- **Source:** Audio transcription and AI-generated notes
- **Generation Method:** AI-powered analysis using OpenAI GPT-3.5
- **Tool:** Audio Transcriber PRD Generator
- **Status:** Draft - Requires review and validation
- **Next Steps:** Review with stakeholders, validate assumptions, and refine requirements

*This PRD was automatically generated from transcribed audio content. Please review all requirements and assumptions before proceeding with development.*`

    // Save PRD to database
    await transcriptionsCollection.updateOne(
      { _id: new ObjectId(transcriptionId) },
      { 
        $set: { 
          prd: fullPRD,
          updatedAt: new Date()
        }
      }
    )

    // Only consume tokens AFTER successful generation and saving
    const { success, remainingTokens } = await consumeUserTokenWithHistory(
      session.user.id,
      'prd_generation',
      transcriptionId,
      transcription.title
    )
    
    if (!success) {
      return NextResponse.json({ 
        error: 'Failed to consume tokens. Please try again.',
        code: 'TOKEN_CONSUMPTION_FAILED'
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      prd: fullPRD,
      title: title,
      remainingTokens
    })

  } catch (error: any) {
    console.error('Error generating PRD:', error)
    
    // Handle specific OpenAI API errors
    if (error.code === 'insufficient_quota') {
      return NextResponse.json({ 
        error: 'OpenAI API quota exceeded. Please check your API usage.' 
      }, { status: 429 })
    }
    
    if (error.code === 'invalid_api_key') {
      return NextResponse.json({ 
        error: 'Invalid OpenAI API key. Please check your configuration.' 
      }, { status: 401 })
    }
    
    if (error.message?.includes('OPENAI_API_KEY')) {
      return NextResponse.json({ 
        error: 'OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      error: 'Failed to generate PRD. Please try again.' 
    }, { status: 500 })
  }
}
