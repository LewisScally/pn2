import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { orderId, reason } = await req.json();

    // Get order
    const orders = await base44.asServiceRole.entities.Order.filter({ id: orderId });
    if (orders.length === 0) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = orders[0];

    if (!order.stripe_payment_intent_id) {
      return Response.json({ error: 'No payment to refund' }, { status: 400 });
    }

    // Cancel/refund the payment
    const paymentIntent = await stripe.paymentIntents.cancel(
      order.stripe_payment_intent_id
    );

    // Update order
    await base44.asServiceRole.entities.Order.update(orderId, {
      status: 'refunded',
      refund_reason: reason
    });

    // Create transaction record
    await base44.asServiceRole.entities.Transaction.create({
      order_id: orderId,
      buyer_email: order.buyer_email,
      seller_email: order.seller_email,
      amount: order.amount,
      status: 'refunded',
      stripe_payment_intent_id: paymentIntent.id,
      refunded_at: new Date().toISOString()
    });

    return Response.json({
      success: true,
      message: 'Order refunded successfully'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});