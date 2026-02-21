import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Parse payload from automation
        const payload = await req.json();
        const { event, data: offer } = payload;

        if (event.type !== 'create' || !offer) {
            return Response.json({ message: "Not a create event or no data" });
        }

        // Must use service role to read all users' saved filters and create notifications
        // We scan ALL saved filters. In a real app at scale, this would need optimization (e.g. specialized indexing)
        // For now, listing all is fine for typical scale.
        const allFilters = await base44.asServiceRole.entities.SavedFilter.list();

        const notifications = [];

        for (const filter of allFilters) {
            const criteria = filter.criteria || {};
            
            // Check matches
            let matches = true;

            // Category
            if (criteria.category && criteria.category !== 'all' && offer.category !== criteria.category) matches = false;
            
            // Pricing Model
            if (matches && criteria.pricingModel && criteria.pricingModel !== 'all' && offer.pricing_model !== criteria.pricingModel) matches = false;
            
            // Price Range
            if (matches && criteria.priceMin && offer.deal_price < Number(criteria.priceMin)) matches = false;
            if (matches && criteria.priceMax && offer.deal_price > Number(criteria.priceMax)) matches = false;

            // Audience
            if (matches && criteria.audienceMin && offer.audience_size < Number(criteria.audienceMin)) matches = false;

            // Search Query (Simple containment check)
            if (matches && criteria.searchQuery) {
                const query = criteria.searchQuery.toLowerCase();
                const text = `${offer.title} ${offer.description}`.toLowerCase();
                if (!text.includes(query)) matches = false;
            }

            if (matches) {
                notifications.push({
                    user_email: filter.user_email,
                    type: "offer_alert",
                    title: "New Offer Alert",
                    message: `A new offer "${offer.title}" matches your saved filter "${filter.name}".`,
                    link: `/OfferDetails?id=${offer.id}`,
                    read: false
                });
            }
        }

        // Batch create notifications
        if (notifications.length > 0) {
            await base44.asServiceRole.entities.Notification.bulkCreate(notifications);
        }

        return Response.json({ 
            processed: true, 
            notificationsCreated: notifications.length 
        });

    } catch (error) {
        console.error("Error in checkSavedFilters:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});