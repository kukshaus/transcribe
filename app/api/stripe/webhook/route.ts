import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { getDatabase } from '@/lib/mongodb'
import { addTokensToUserWithHistory } from '@/lib/usage'
import { ObjectId } from 'mongodb'

export async function POST(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Payment system not configured' },
      { status: 503 }
    )
  }

  const body = await request.text()
  const signature = headers().get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    )
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any
      
      const { userId, tokens } = session.metadata
      
      if (!userId || !tokens) {
        console.error('Missing metadata in session:', session.metadata)
        return NextResponse.json(
          { error: 'Missing required metadata' },
          { status: 400 }
        )
      }

      // Add tokens to user account with history tracking
      const tokensToAdd = parseInt(tokens)
      const amount = session.amount_total / 100 // Convert from cents to dollars
      
      await addTokensToUserWithHistory(
        userId,
        tokensToAdd,
        'token_purchase',
        `Purchased ${tokensToAdd} tokens for $${amount.toFixed(2)}`
      )

      // Create payment record
      const db = await getDatabase()
      const paymentsCollection = db.collection('payments')
      await paymentsCollection.insertOne({
        userId: new ObjectId(userId),
        stripeSessionId: session.id,
        stripePaymentIntentId: session.payment_intent,
        amount: session.amount_total,
        currency: session.currency,
        tokensAdded: tokensToAdd,
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      console.log(`Added ${tokensToAdd} tokens to user ${userId}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
