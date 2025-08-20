import Stripe from 'stripe'

// Initialize Stripe only if environment variable is available
export const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-07-30.basil',
      typescript: true,
    })
  : null

// Token packages configuration
export const TOKEN_PACKAGES = [
  {
    id: 'tokens_10',
    name: '10 Tokens',
    description: 'Perfect for getting started with transcription. Great for short meetings, interviews, or quick audio notes.',
    tokens: 10,
    price: 100, // $1.00 in cents (reduced for testing)
    priceDisplay: '$1.00',
    popular: false,
  },
  {
    id: 'tokens_25',
    name: '25 Tokens',
    description: 'Ideal for regular users. Handle weekly meetings, podcasts, and multiple audio files with ease.',
    tokens: 25,
    price: 100, // $1.00 in cents (reduced for testing)
    priceDisplay: '$1.00',
    popular: true,
  },
  {
    id: 'tokens_50',
    name: '50 Tokens',
    description: 'Best value for power users. Perfect for content creators, researchers, and heavy transcription needs.',
    tokens: 50,
    price: 100, // $1.00 in cents (reduced for testing)
    priceDisplay: '$1.00',
    popular: false,
  },
]

export function getTokenPackageById(id: string) {
  return TOKEN_PACKAGES.find(pkg => pkg.id === id)
}
