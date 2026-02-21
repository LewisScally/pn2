import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const body = await req.json();
        
        const { click_id, conversion_value, conversion_type, metadata } = body;
        
        if (!click_id) {
            return Response.json({ error: 'click_id is required' }, { status: 400 });
        }

        // Get the click record
        const clicks = await base44.asServiceRole.entities.Click.filter({ click_id });
        if (clicks.length === 0) {
            return Response.json({ error: 'Click not found' }, { status: 404 });
        }
        
        const click = clicks[0];

        // Check if already converted
        if (click.converted) {
            return Response.json({ error: 'Click already converted' }, { status: 400 });
        }

        // Create conversion record
        const conversion = await base44.asServiceRole.entities.Conversion.create({
            click_id,
            offer_id: click.offer_id,
            order_id: click.order_id,
            campaign_id: click.campaign_id,
            advertiser_email: click.advertiser_email,
            publisher_email: click.publisher_email,
            conversion_value: conversion_value || 0,
            conversion_type: conversion_type || 'custom',
            metadata: metadata || {}
        });

        // Update click to mark as converted
        await base44.asServiceRole.entities.Click.update(click.id, {
            converted: true
        });

        return Response.json({ 
            success: true,
            conversion_id: conversion.id
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});