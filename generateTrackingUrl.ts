import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { campaign_id, offer_id, advertiser_email } = body;
        
        if (!campaign_id && !offer_id) {
            return Response.json({ error: 'campaign_id or offer_id is required' }, { status: 400 });
        }

        // Generate tracking URL
        const baseUrl = req.headers.get('origin') || 'https://yourapp.base44.com';
        const trackingParams = new URLSearchParams({
            ...(campaign_id && { cid: campaign_id }),
            ...(offer_id && { oid: offer_id }),
            ...(advertiser_email && { adv: advertiser_email }),
            utm_source: 'pinnacledealz',
            utm_medium: 'marketplace'
        });
        
        const tracking_url = `${baseUrl}/api/track/click?${trackingParams.toString()}`;

        // Generate conversion pixel code
        const pixel_code = `<!-- PinnacleDealz Conversion Pixel -->
<script>
(function() {
  var img = document.createElement('img');
  img.src = '${baseUrl}/api/track/convert?${trackingParams.toString()}&cv=1';
  img.style.display = 'none';
  img.width = 1;
  img.height = 1;
  document.body.appendChild(img);
})();
</script>
<!-- End Conversion Pixel -->`;

        // Alternative postback URL for server-to-server tracking
        const postback_url = `${baseUrl}/api/functions/trackConversion`;

        return Response.json({
            tracking_url,
            pixel_code,
            postback_url,
            instructions: {
                click_tracking: "Use the tracking_url in your ads. When users click, they'll be tracked automatically.",
                conversion_tracking: "Place the pixel_code on your conversion/thank-you page, or use postback_url for server-to-server tracking.",
                parameters: {
                    campaign_id: campaign_id || null,
                    offer_id: offer_id || null,
                    advertiser_email: advertiser_email || null
                }
            }
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});