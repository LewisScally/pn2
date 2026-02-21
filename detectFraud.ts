import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, activityType, metadata } = await req.json();

    // Get user's activity history
    const orders = await base44.asServiceRole.entities.Order.filter({ 
      buyer_email: userId 
    });
    const disputes = await base44.asServiceRole.entities.Dispute.filter({ 
      raised_by: userId 
    });

    // Fraud detection rules
    const riskFactors = [];
    let riskScore = 0;

    // Check dispute rate
    const disputeRate = disputes.length / Math.max(orders.length, 1);
    if (disputeRate > 0.3) {
      riskFactors.push('High dispute rate');
      riskScore += 30;
    }

    // Check for rapid orders
    const recentOrders = orders.filter(o => {
      const createdDate = new Date(o.created_date);
      const hoursSinceCreation = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60);
      return hoursSinceCreation < 24;
    });
    
    if (recentOrders.length > 5) {
      riskFactors.push('Unusual order volume');
      riskScore += 25;
    }

    // Check for refund patterns
    const refundedOrders = orders.filter(o => o.status === 'refunded');
    const refundRate = refundedOrders.length / Math.max(orders.length, 1);
    
    if (refundRate > 0.4) {
      riskFactors.push('High refund rate');
      riskScore += 35;
    }

    // Check account age
    const accountAge = Date.now() - new Date(user.created_date).getTime();
    const accountAgeDays = accountAge / (1000 * 60 * 60 * 24);
    
    if (accountAgeDays < 1 && orders.length > 2) {
      riskFactors.push('New account with high activity');
      riskScore += 20;
    }

    const riskLevel = riskScore > 60 ? 'high' : riskScore > 30 ? 'medium' : 'low';

    return Response.json({
      riskScore,
      riskLevel,
      riskFactors,
      recommendations: riskLevel === 'high' 
        ? ['Manual review required', 'Consider account restrictions']
        : riskLevel === 'medium'
        ? ['Monitor closely', 'Request additional verification']
        : ['Normal activity']
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});