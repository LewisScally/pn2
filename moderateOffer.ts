import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import OpenAI from 'npm:openai@4.77.3';

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY")
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { offerId, title, description } = await req.json();

    // AI moderation check
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a content moderator for a crypto advertising marketplace. Analyze offers for:
          1. Fraudulent content or scams
          2. Inappropriate/offensive content
          3. Misleading claims
          4. Compliance with crypto advertising standards
          
          Return a JSON object with:
          - approved: boolean
          - confidence: number (0-1)
          - flags: array of issues found
          - reason: string explaining decision`
        },
        {
          role: "user",
          content: `Title: ${title}\n\nDescription: ${description}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const moderation = JSON.parse(response.choices[0].message.content);

    // Update offer moderation status
    const moderationStatus = moderation.approved ? 'approved' : 'rejected';
    await base44.asServiceRole.entities.Offer.update(offerId, {
      moderation_status: moderationStatus,
      moderation_notes: moderation.reason,
      moderation_confidence: moderation.confidence,
      moderation_flags: moderation.flags
    });

    return Response.json({
      success: true,
      moderation
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});