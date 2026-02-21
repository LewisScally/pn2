import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = await req.json();

    // Get order
    const orders = await base44.entities.Order.filter({ id: orderId });
    if (orders.length === 0) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = orders[0];

    // Verify user is the buyer
    if (order.buyer_email !== user.email) {
      return Response.json({ error: 'Only buyer can release funds' }, { status: 403 });
    }

    if (order.status !== 'delivered') {
      return Response.json({ error: 'Order must be delivered first' }, { status: 400 });
    }

    // Capture the payment
    const paymentIntent = await stripe.paymentIntents.capture(
      order.stripe_payment_intent_id
    );

    // Update order status
    await base44.entities.Order.update(orderId, {
      status: 'completed',
      completed_at: new Date().toISOString()
    });

    // Create transaction record
    await base44.asServiceRole.entities.Transaction.create({
      order_id: orderId,
      buyer_email: order.buyer_email,
      seller_email: order.seller_email,
      amount: order.amount,
      status: 'released',
      stripe_payment_intent_id: paymentIntent.id,
      escrow_released_at: new Date().toISOString()
    });

    // Send completion notifications
    await base44.asServiceRole.functions.invoke('sendOrderNotification', {
      notification_type: 'order_completed',
      order_id: orderId,
      recipient_type: 'buyer'
    });

    await base44.asServiceRole.functions.invoke('sendOrderNotification', {
      notification_type: 'order_completed',
      order_id: orderId,
      recipient_type: 'seller'
    });

    return Response.json({
      success: true,
      message: 'Payment released to seller'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});