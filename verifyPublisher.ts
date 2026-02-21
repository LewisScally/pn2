import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import OpenAI from 'npm:openai@4.77.3';

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY")
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { publisherId, website, description } = await req.json();

    // Fetch website to verify legitimacy
    const websiteResponse = await fetch(website);
    const websiteText = await websiteResponse.text();

    // AI verification
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are verifying a publisher for a crypto ad marketplace. Check:
          1. Website legitimacy and credibility
          2. Audience quality indicators
          3. Red flags for fraud
          4. Alignment with description
          
          Return JSON with:
          - verified: boolean
          - trust_score: number (0-100)
          - issues: array of concerns
          - recommendation: string`
        },
        {
          role: "user",
          content: `Website: ${website}\nDescription: ${description}\nWebsite content snippet: ${websiteText.slice(0, 2000)}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const verification = JSON.parse(response.choices[0].message.content);

    // Update publisher
    await base44.asServiceRole.entities.Publisher.update(publisherId, {
      verified: verification.verified,
      trust_score: verification.trust_score,
      verification_notes: verification.recommendation,
      verified_at: verification.verified ? new Date().toISOString() : null
    });

    return Response.json({
      success: true,
      verification
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});