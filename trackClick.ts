import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const body = await req.json();
        
        const { offer_id, order_id, campaign_id } = body;
        
        if (!offer_id) {
            return Response.json({ error: 'offer_id is required' }, { status: 400 });
        }

        // Get offer and order details
        const offer = await base44.asServiceRole.entities.Offer.filter({ id: offer_id });
        const offerData = offer[0];
        
        let orderData = null;
        if (order_id) {
            const order = await base44.asServiceRole.entities.Order.filter({ id: order_id });
            orderData = order[0];
        }

        // Generate unique click ID
        const click_id = crypto.randomUUID();

        // Parse user agent for device type
        const userAgent = req.headers.get('user-agent') || '';
        let device_type = 'unknown';
        if (/mobile/i.test(userAgent)) device_type = 'mobile';
        else if (/tablet/i.test(userAgent)) device_type = 'tablet';
        else if (/desktop/i.test(userAgent)) device_type = 'desktop';

        // Create click record
        const click = await base44.asServiceRole.entities.Click.create({
            offer_id,
            order_id: order_id || null,
            campaign_id: campaign_id || null,
            advertiser_email: orderData?.buyer_email || null,
            publisher_email: offerData?.created_by || null,
            click_id,
            ip_address: req.headers.get('x-forwarded-for') || 'unknown',
            user_agent: userAgent,
            referrer: req.headers.get('referer') || null,
            device_type,
            converted: false
        });

        return Response.json({ 
            success: true, 
            click_id,
            tracking_url: `https://yourapp.base44.com/track/convert?click_id=${click_id}`
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});