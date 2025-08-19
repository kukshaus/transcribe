# Stripe Payment Integration Setup Guide

This guide will help you set up Stripe payment processing for token purchases in your transcriber application.

## Prerequisites

- A Stripe account (create one at https://stripe.com)
- Access to your Stripe Dashboard
- The application already running locally or deployed

## Step 1: Get Stripe API Keys

1. Log in to your Stripe Dashboard: https://dashboard.stripe.com
2. Go to **Developers** → **API Keys**
3. Copy the following keys:
   - **Publishable key** (starts with `pk_test_...` for test mode)
   - **Secret key** (starts with `sk_test_...` for test mode)

## Step 2: Configure Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## Step 3: Set Up Stripe Webhooks

Webhooks are essential for processing successful payments and adding tokens to user accounts.

### For Local Development:

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login to Stripe CLI: `stripe login`
3. Forward events to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
4. Copy the webhook signing secret from the CLI output and add it to your `.env.local`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_xxx...
   ```

### For Production:

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **+ Add endpoint**
3. Set endpoint URL to: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
5. Copy the webhook signing secret and add it to your production environment variables

## Step 4: Token Package Configuration

The token packages are configured in `lib/stripe.ts`. You can modify the packages and prices:

```typescript
export const TOKEN_PACKAGES = [
  {
    id: 'tokens_10',
    name: '10 Tokens',
    description: 'Perfect for getting started',
    tokens: 10,
    price: 500, // $5.00 in cents
    priceDisplay: '$5.00',
    popular: false,
  },
  // Add or modify packages as needed
]
```

## Step 5: Test the Integration

1. Start your application: `npm run dev`
2. Sign in to your application
3. Navigate to `/payment/buy-tokens`
4. Try purchasing tokens with Stripe's test card: `                        `
5. Check that tokens are added to your account after payment

## Step 6: Production Checklist

Before going live:

- [ ] Replace test API keys with live keys
- [ ] Set up production webhooks
- [ ] Update webhook URL to production domain
- [ ] Test with real payment methods
- [ ] Verify webhook signature verification is working
- [ ] Set up proper error monitoring

## Available API Endpoints

### Checkout Session Creation
- **POST** `/api/stripe/checkout`
- Creates a Stripe checkout session for token purchase

### Webhook Handler
- **POST** `/api/stripe/webhook`
- Handles Stripe events and updates user token balance

## Payment Flow

1. User clicks "Purchase Tokens" → `/payment/buy-tokens`
2. User selects a token package
3. Frontend calls `/api/stripe/checkout` to create session
4. User is redirected to Stripe Checkout
5. After payment, user is redirected to `/payment/success`
6. Stripe sends webhook to `/api/stripe/webhook`
7. Webhook handler adds tokens to user account

## Token Packages

| Package | Tokens | Price | Cost per Token |
|---------|--------|-------|----------------|
| Starter | 10     | $5.00 | $0.50          |
| Popular | 25     | $10.00| $0.40          |
| Value   | 50     | $18.00| $0.36          |
| Pro     | 100    | $30.00| $0.30          |

## Troubleshooting

### Common Issues:

1. **Webhook signature verification failed**
   - Ensure `STRIPE_WEBHOOK_SECRET` is correctly set
   - Verify the webhook endpoint URL

2. **Payment succeeded but tokens not added**
   - Check webhook logs in Stripe Dashboard
   - Verify database connection
   - Check server logs for errors

3. **Checkout session creation fails**
   - Verify `STRIPE_SECRET_KEY` is set
   - Check if user is authenticated
   - Ensure package ID is valid

### Testing Cards:

- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- **Insufficient funds**: `4000 0000 0000 9995`

## Security Notes

- Never expose secret keys in client-side code
- Always verify webhook signatures
- Use HTTPS in production
- Keep Stripe libraries updated
- Monitor for suspicious activity

## Support

For Stripe-specific issues, refer to:
- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com

For application-specific issues, check:
- Server logs for API errors
- Browser console for client-side errors
- Database logs for data persistence issues
