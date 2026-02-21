import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    console.log("Starting import process...");
    try {
        const base44 = createClientFromRequest(req);
        
        // 1. Get the file URL from the payload
        const { file_url } = await req.json();
        
        if (!file_url) {
            return Response.json({ error: "file_url is required" }, { status: 400 });
        }

        // 2. Extract data from the PDF using LLM
        const extractionPrompt = `
            Extract influencer and publisher offer data from this file. 
            Return a JSON object with a key "items" containing an array of offers.
            
            For each offer, extract:
            - publisher_name: The name of the publisher/influencer
            - title: The name/title of the offer or service
            - description: Description of the offer (combine relevant details)
            - category: Map to one of: newsletter, twitter, telegram, youtube, podcast, website, blog, linkedin, instagram, tiktok, pr, kol, other
            - ad_type: Map to one of: sponsored_post, banner, video, article, newsletter_placement, twitter_thread, story, other
            - rrp_price: The regular price (number)
            - deal_price: The discounted/our price (number). If not found, use rrp_price.
            - audience_size: Number of followers/subscribers (number)
            - delivery_days: Estimated delivery time in days (number, default 7)
            
            If the file contains a table, go row by row.
            Ignore header rows.
            Clean up price strings (remove currency symbols).
        `;

        const extractionRes = await base44.integrations.Core.InvokeLLM({
            prompt: extractionPrompt,
            file_urls: [file_url],
            response_json_schema: {
                type: "object",
                properties: {
                    items: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                publisher_name: { type: "string" },
                                title: { type: "string" },
                                description: { type: "string" },
                                category: { type: "string" },
                                ad_type: { type: "string" },
                                rrp_price: { type: "number" },
                                deal_price: { type: "number" },
                                audience_size: { type: "number" },
                                delivery_days: { type: "number" }
                            },
                            required: ["publisher_name", "title", "deal_price"]
                        }
                    }
                }
            }
        });

        const data = extractionRes;
        const items = data.items || [];
        const results = { created_publishers: 0, created_offers: 0, errors: [] };

        // 3. Process each item
        for (const item of items) {
            try {
                // Find or create publisher
                let publisherId;
                const existingPublishers = await base44.entities.Publisher.filter({ 
                    company_name: item.publisher_name 
                });

                if (existingPublishers.length > 0) {
                    publisherId = existingPublishers[0].id;
                } else {
                    const placeholderEmail = `publisher_${Date.now()}_${Math.floor(Math.random()*1000)}@placeholder.com`;
                    
                    const newPublisher = await base44.entities.Publisher.create({
                        company_name: item.publisher_name,
                        user_email: placeholderEmail,
                        description: `Imported publisher: ${item.publisher_name}`,
                        verified: true,
                        rating: 5,
                        total_deals: 0
                    });
                    publisherId = newPublisher.id;
                    results.created_publishers++;
                }

                // Create offer
                await base44.entities.Offer.create({
                    publisher_id: publisherId,
                    title: item.title || "Untitled Offer",
                    description: item.description || "No description provided",
                    category: item.category || "other",
                    ad_type: item.ad_type || "other",
                    rrp_price: item.rrp_price || 0,
                    deal_price: item.deal_price || 0,
                    audience_size: item.audience_size || 0,
                    delivery_days: item.delivery_days || 7,
                    status: "active",
                    moderation_status: "approved",
                    inventory_count: 999
                });
                results.created_offers++;

            } catch (err) {
                results.errors.push(`Failed for ${item.publisher_name}: ${err.message}`);
            }
        }

        return Response.json(results);

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});