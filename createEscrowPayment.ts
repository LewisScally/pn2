import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

// Use STRIPE_SECRET as per existing secrets
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, amount, currency = "usd", origin } = await req.json();

    if (!orderId || !amount) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const appOrigin = origin || "https://pinnacledealz.com"; // Fallback if not provided

    const secretKey = Deno.env.get("STRIPE_SECRET");
    const publishableKey = Deno.env.get("STRIPE_PUBLISHABLE_KEY");

    // Validate keys exist
    if (!secretKey || !publishableKey) {
      return Response.json({ error: 'Stripe configuration missing (keys not set)' }, { status: 500 });
    }

    // Validate key mode consistency
    const isLiveSecret = secretKey.startsWith('sk_live_');
    const isLivePublishable = publishableKey.startsWith('pk_live_');
    
    if (isLiveSecret !== isLivePublishable) {
      return Response.json({ 
        error: `Stripe key mismatch: Secret is ${isLiveSecret ? 'Live' : 'Test'} but Publishable is ${isLivePublishable ? 'Live' : 'Test'}. Both must match.` 
      }, { status: 500 });
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: currency,
          product_data: {
            name: `Order #${orderId}`,
            description: 'Escrow protected payment',
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      payment_intent_data: {
        capture_method: 'manual', // Hold funds
        metadata: {
            order_id: orderId,
            buyer_email: user.email,
            platform: 'pinnacledealz'
        }
      },
      metadata: {
        order_id: orderId,
        type: 'escrow'
      },
      success_url: `${appOrigin}/Marketplace?success=true&order_id=${orderId}`,
      cancel_url: `${appOrigin}/Marketplace?canceled=true`,
      customer_email: user.email,
    });

    return Response.json({
      sessionId: session.id,
      publishableKey: publishableKey
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});