// Simple test script to check if the transcriptions API is working
const fetch = require('node-fetch')

async function testAPI() {
  try {
    console.log('Testing transcriptions API...')
    
    const response = await fetch('http://localhost:3000/api/transcriptions')
    
    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))
    
    if (response.ok) {
      const data = await response.json()
      console.log('Response data structure:', Object.keys(data))
      
      if (data.transcriptions) {
        console.log('Transcriptions count:', data.transcriptions.length)
        if (data.transcriptions.length > 0) {
          console.log('First transcription:', {
            id: data.transcriptions[0]._id,
            title: data.transcriptions[0].title,
            status: data.transcriptions[0].status
          })
        }
      }
      
      if (data.pagination) {
        console.log('Pagination:', data.pagination)
      }
    } else {
      const errorText = await response.text()
      console.log('Error response:', errorText)
    }
    
  } catch (error) {
    console.error('Error testing API:', error.message)
  }
}

// Run test if called directly
if (require.main === module) {
  testAPI()
}

module.exports = { testAPI }
