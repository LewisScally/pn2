import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const EMAIL_TEMPLATES = {
  order_created: {
    buyer: {
      subject: "Order Confirmed - #{order_id}",
      body: `
        <h2>Order Confirmed!</h2>
        <p>Hi {buyer_name},</p>
        <p>Your order has been confirmed and payment is being processed.</p>
        <h3>Order Details:</h3>
        <ul>
          <li>Order ID: #{order_id}</li>
          <li>Amount: ${amount}</li>
          <li>Publisher: {seller_name}</li>
          <li>Expected Delivery: {delivery_deadline}</li>
        </ul>
        <p>You'll receive another email once the publisher delivers your order.</p>
        <p>Best regards,<br>PinnacleDealz Team</p>
      `
    },
    seller: {
      subject: "New Order Received - #{order_id}",
      body: `
        <h2>New Order Received!</h2>
        <p>Hi {seller_name},</p>
        <p>You have a new order waiting for delivery.</p>
        <h3>Order Details:</h3>
        <ul>
          <li>Order ID: #{order_id}</li>
          <li>Amount: ${amount}</li>
          <li>Buyer: {buyer_name}</li>
          <li>Delivery Deadline: {delivery_deadline}</li>
        </ul>
        <p><strong>Important:</strong> Please deliver by {delivery_deadline} to avoid automatic refund.</p>
        <p>Best regards,<br>PinnacleDealz Team</p>
      `
    }
  },
  payment_confirmed: {
    subject: "Payment Confirmed - #{order_id}",
    body: `
      <h2>Payment Confirmed!</h2>
      <p>Hi {buyer_name},</p>
      <p>Your payment of ${amount} has been confirmed and is held in escrow.</p>
      <p>The funds will be released to the publisher once you confirm delivery.</p>
      <p>Order ID: #{order_id}</p>
      <p>Best regards,<br>PinnacleDealz Team</p>
    `
  },
  delivery_reminder: {
    subject: "Delivery Reminder - #{order_id}",
    body: `
      <h2>Delivery Deadline Approaching</h2>
      <p>Hi {seller_name},</p>
      <p>This is a reminder that your order #{order_id} is due for delivery soon.</p>
      <p>Delivery Deadline: {delivery_deadline}</p>
      <p>Amount at stake: ${amount}</p>
      <p><strong>Action Required:</strong> Please upload proof of delivery before the deadline to avoid automatic refund.</p>
      <p>Best regards,<br>PinnacleDealz Team</p>
    `
  },
  order_delivered: {
    subject: "Order Delivered - Please Review - #{order_id}",
    body: `
      <h2>Order Delivered!</h2>
      <p>Hi {buyer_name},</p>
      <p>The publisher has marked your order as delivered.</p>
      <p>Order ID: #{order_id}</p>
      <p>Proof: {proof_url}</p>
      <p><strong>Action Required:</strong> Please review the delivery and confirm completion to release payment.</p>
      <p>Best regards,<br>PinnacleDealz Team</p>
    `
  },
  order_completed: {
    buyer: {
      subject: "Order Completed - #{order_id}",
      body: `
        <h2>Order Completed!</h2>
        <p>Hi {buyer_name},</p>
        <p>Your order #{order_id} has been successfully completed.</p>
        <p>Amount: ${amount}</p>
        <p>Thank you for using PinnacleDealz!</p>
        <p>Best regards,<br>PinnacleDealz Team</p>
      `
    },
    seller: {
      subject: "Payment Released - #{order_id}",
      body: `
        <h2>Payment Released!</h2>
        <p>Hi {seller_name},</p>
        <p>Congratulations! The buyer has confirmed delivery and payment has been released.</p>
        <p>Amount: ${amount}</p>
        <p>Order ID: #{order_id}</p>
        <p>Funds will be transferred to your account during the next payout cycle.</p>
        <p>Best regards,<br>PinnacleDealz Team</p>
      `
    }
  },
  dispute_opened: {
    subject: "Dispute Opened - #{order_id}",
    body: `
      <h2>Dispute Opened</h2>
      <p>Hi {recipient_name},</p>
      <p>A dispute has been opened for order #{order_id}.</p>
      <p>Reason: {dispute_reason}</p>
      <p>Description: {dispute_description}</p>
      <p>Our team will review the dispute and contact you within 48 hours.</p>
      <p>Best regards,<br>PinnacleDealz Team</p>
    `
  },
  dispute_resolved: {
    subject: "Dispute Resolved - #{order_id}",
    body: `
      <h2>Dispute Resolved</h2>
      <p>Hi {recipient_name},</p>
      <p>The dispute for order #{order_id} has been resolved.</p>
      <p>Resolution: {resolution_notes}</p>
      <p>Status: {order_status}</p>
      <p>Best regards,<br>PinnacleDealz Team</p>
    `
  }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { notification_type, order_id, recipient_type } = await req.json();

    // Fetch order details
    const orders = await base44.asServiceRole.entities.Order.filter({ id: order_id });
    if (orders.length === 0) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }
    const order = orders[0];

    // Get buyer and seller info
    const buyers = await base44.asServiceRole.entities.User.filter({ email: order.buyer_email });
    const sellers = await base44.asServiceRole.entities.User.filter({ email: order.seller_email });
    
    const buyer = buyers[0] || { full_name: order.buyer_email, email: order.buyer_email };
    const seller = sellers[0] || { full_name: order.seller_email, email: order.seller_email };

    // Get template
    let template = EMAIL_TEMPLATES[notification_type];
    if (!template) {
      return Response.json({ error: 'Invalid notification type' }, { status: 400 });
    }

    // Handle templates with buyer/seller variants
    if (template.buyer && template.seller) {
      template = recipient_type === 'buyer' ? template.buyer : template.seller;
    }

    // Replace variables
    const deliveryDate = order.delivery_deadline 
      ? new Date(order.delivery_deadline).toLocaleDateString() 
      : 'Not set';

    let subject = template.subject
      .replace('{order_id}', order.id.slice(0, 8));
    
    let body = template.body
      .replace(/{order_id}/g, order.id.slice(0, 8))
      .replace(/{amount}/g, order.amount?.toLocaleString() || '0')
      .replace(/{buyer_name}/g, buyer.full_name || buyer.email)
      .replace(/{seller_name}/g, seller.full_name || seller.email)
      .replace(/{recipient_name}/g, recipient_type === 'buyer' ? buyer.full_name : seller.full_name)
      .replace(/{delivery_deadline}/g, deliveryDate)
      .replace(/{proof_url}/g, order.proof_url || 'No proof provided')
      .replace(/{dispute_reason}/g, req.dispute_reason || '')
      .replace(/{dispute_description}/g, req.dispute_description || '')
      .replace(/{resolution_notes}/g, req.resolution_notes || '')
      .replace(/{order_status}/g, order.status);

    // Send email
    const recipient = recipient_type === 'buyer' ? buyer.email : seller.email;
    await base44.asServiceRole.integrations.Core.SendEmail({
      from_name: "PinnacleDealz",
      to: recipient,
      subject: subject,
      body: body
    });

    return Response.json({ success: true, sent_to: recipient });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});