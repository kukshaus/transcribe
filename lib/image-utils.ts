/**
 * Optimizes Google profile image URLs for better loading and display
 * @param imageUrl - The original Google profile image URL
 * @param size - Desired image size (default: 96)
 * @returns Optimized image URL
 */
export function optimizeGoogleImageUrl(imageUrl: string, size: number = 96): string {
  if (!imageUrl) return ''
  
  // Check if it's a Google image URL
  if (imageUrl.includes('googleusercontent.com')) {
    try {
      // Remove existing size parameters and add our own
      const baseUrl = imageUrl.split('=')[0]
      return `${baseUrl}=s${size}-c`
    } catch (error) {
      console.warn('Failed to optimize Google image URL:', error)
      return imageUrl
    }
  }
  
  // For non-Google images, return as is
  return imageUrl
}

/**
 * Gets a fallback image URL if the primary one fails
 * @param imageUrl - The original image URL
 * @returns Fallback image URL or empty string
 */
export function getFallbackImageUrl(imageUrl: string): string {
  if (!imageUrl || !imageUrl.includes('googleusercontent.com')) {
    return ''
  }
  
  try {
    // Try a different size parameter as fallback
    const baseUrl = imageUrl.split('=')[0]
    return `${baseUrl}=s200-c`
  } catch (error) {
    return ''
  }
}
