const express = require('express')
const { authMiddleware } = require('../middleware/authMiddleware')
const User = require('../models/User')

let stripe = null
try {
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
  }
} catch (e) {
  console.warn('Stripe init skipped:', e.message)
}

const PRICE_MAP = {
  pro: process.env.STRIPE_PRICE_PRO,
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE,
}

// Webhook router — mounted before JSON body parser
const webhookRouter = express.Router()

webhookRouter.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) return res.status(503).json({ message: 'Stripe not configured' })

  const sig = req.headers['stripe-signature']

  let event
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).json({ message: `Webhook Error: ${err.message}` })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const userId = session.metadata.userId
        const plan = session.metadata.plan

        await User.findByIdAndUpdate(userId, {
          subscriptionPlan: plan,
          stripeCustomerId: session.customer,
        })
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        const customerId = subscription.customer

        let plan = 'free'
        if (event.type === 'customer.subscription.updated') {
          const productId = subscription.items.data[0]?.price?.product
          if (productId === process.env.STRIPE_PRODUCT_PRO) plan = 'pro'
          else if (productId === process.env.STRIPE_PRODUCT_ENTERPRISE) plan = 'enterprise'
        }

        await User.findOneAndUpdate(
          { stripeCustomerId: customerId },
          { subscriptionPlan: plan }
        )
        break
      }
    }

    res.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    res.status(500).json({ message: 'Webhook handler failed' })
  }
})

// Main router — mounted after JSON body parser
const router = express.Router()

router.post('/create-checkout', authMiddleware, async (req, res) => {
  if (!stripe) return res.status(503).json({ success: false, message: 'Stripe not configured' })
  try {
    const { plan } = req.body
    const priceId = PRICE_MAP[plan]
    if (!priceId) {
      return res.status(400).json({ success: false, message: 'Invalid plan' })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: req.user.email,
      client_reference_id: req.user._id.toString(),
      metadata: { plan, userId: req.user._id.toString() },
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/plans`,
    })

    res.json({ success: true, url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    res.status(500).json({ success: false, message: 'Failed to create checkout session' })
  }
})

router.get('/portal', authMiddleware, async (req, res) => {
  if (!stripe) return res.status(503).json({ success: false, message: 'Stripe not configured' })
  try {
    const user = await User.findById(req.user._id)
    if (!user.stripeCustomerId) {
      return res.status(400).json({ success: false, message: 'No billing account found' })
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings`,
    })

    res.json({ success: true, url: session.url })
  } catch (error) {
    console.error('Stripe portal error:', error)
    res.status(500).json({ success: false, message: 'Failed to create portal session' })
  }
})

module.exports = { router, webhookRouter }
