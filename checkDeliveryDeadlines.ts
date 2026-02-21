import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // This function should be called by a scheduled task
    // It checks for orders approaching their delivery deadline
    
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    // Get all orders that are in_escrow and have delivery deadline within 24 hours
    const allOrders = await base44.asServiceRole.entities.Order.filter({ status: "in_escrow" });
    
    const ordersNearDeadline = allOrders.filter(order => {
      if (!order.delivery_deadline) return false;
      const deadline = new Date(order.delivery_deadline);
      return deadline > now && deadline <= tomorrow;
    });
    
    // Send reminder emails
    const results = [];
    for (const order of ordersNearDeadline) {
      try {
        await base44.asServiceRole.functions.invoke('sendOrderNotification', {
          notification_type: 'delivery_reminder',
          order_id: order.id,
          recipient_type: 'seller'
        });
        results.push({ order_id: order.id, status: 'sent' });
      } catch (error) {
        results.push({ order_id: order.id, status: 'failed', error: error.message });
      }
    }
    
    // Check for overdue orders and trigger auto-refund
    const overdueOrders = allOrders.filter(order => {
      if (!order.delivery_deadline) return false;
      const deadline = new Date(order.delivery_deadline);
      return deadline < now;
    });
    
    for (const order of overdueOrders) {
      try {
        // Trigger refund
        await base44.asServiceRole.functions.invoke('refundEscrow', {
          order_id: order.id,
          reason: 'Delivery deadline missed - automatic refund'
        });
        results.push({ order_id: order.id, status: 'auto_refunded' });
      } catch (error) {
        results.push({ order_id: order.id, status: 'refund_failed', error: error.message });
      }
    }
    
    return Response.json({
      success: true,
      checked: allOrders.length,
      reminders_sent: ordersNearDeadline.length,
      auto_refunded: overdueOrders.length,
      results
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});