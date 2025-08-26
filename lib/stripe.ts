import Stripe from 'stripe'

// Initialize Stripe only if environment variable is available
export const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-07-30.basil',
      typescript: true,
    })
  : null

// Bison Bucks packages configuration
export const TOKEN_PACKAGES = [
  {
    id: 'tokens_10',
    name: '10 Bison Bucks',
    description: 'Perfect for getting started with transcription. Great for short meetings, interviews, or quick audio notes.',
    tokens: 10,
    price: 500, // $5.00 in cents
    priceDisplay: '$5.00',
    popular: false,
  },
  {
    id: 'tokens_25',
    name: '25 Bison Bucks',
    description: 'Ideal for regular users. Handle weekly meetings, podcasts, and multiple audio files with ease.',
    tokens: 25,
    price: 1000, // $10.00 in cents
    priceDisplay: '$10.00',
    popular: true,
  },
  {
    id: 'tokens_50',
    name: '50 Bison Bucks',
    description: 'Best value for power users. Perfect for content creators, researchers, and heavy transcription needs.',
    tokens: 50,
    price: 1800, // $18.00 in cents (reduced for testing)
    priceDisplay: '$18.00',
    popular: false,
  },
]

export function getTokenPackageById(id: string) {
  return TOKEN_PACKAGES.find(pkg => pkg.id === id)
}
