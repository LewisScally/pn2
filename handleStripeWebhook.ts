import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET"));
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    // Verify webhook signature
    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);

    // Handle event types
          switch (event.type) {
            case 'checkout.session.completed': {
              const session = event.data.object;
              const orderId = session.metadata?.order_id;

              if (orderId) {
                // Find order by ID from metadata
                const orders = await base44.asServiceRole.entities.Order.filter({ id: orderId });

                if (orders.length > 0) {
                  await base44.asServiceRole.entities.Order.update(orders[0].id, {
                    status: 'in_escrow',
                    stripe_payment_intent_id: session.payment_intent, // Save the Payment Intent ID
                    payment_confirmed_at: new Date().toISOString()
                  });

                  // Send payment confirmation email
                  try {
                    await base44.asServiceRole.functions.invoke('sendOrderNotification', {
                      notification_type: 'payment_confirmed',
                      order_id: orders[0].id,
                      recipient_type: 'buyer'
                    });
                  } catch (e) {
                    console.error("Failed to send notification", e);
                  }
                }
              }
              break;
            }

            case 'payment_intent.succeeded': {
              // This runs when funds are captured (after release escrow)
              const paymentIntent = event.data.object;
              // We might not need to do anything here if releaseEscrow handles the logic
              // But logging or extra confirmation doesn't hurt
              break;
            }

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        
        const failedOrders = await base44.asServiceRole.entities.Order.filter({
          stripe_payment_intent_id: failedPayment.id
        });
        
        if (failedOrders.length > 0) {
          await base44.asServiceRole.entities.Order.update(failedOrders[0].id, {
            status: 'payment_failed',
            payment_error: failedPayment.last_payment_error?.message
          });
        }
        break;

      case 'charge.refunded':
        const refund = event.data.object;
        
        // Mark transaction as refunded
        const transactions = await base44.asServiceRole.entities.Transaction.filter({
          stripe_payment_intent_id: refund.payment_intent
        });
        
        if (transactions.length > 0) {
          await base44.asServiceRole.entities.Transaction.update(transactions[0].id, {
            status: 'refunded',
            refunded_at: new Date().toISOString()
          });
        }
        break;
    }

    return Response.json({ received: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
});