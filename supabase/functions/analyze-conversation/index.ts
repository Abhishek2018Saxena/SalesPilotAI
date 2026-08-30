// SalesPilot AI — Conversation analysis edge function.
// Uses OpenAI when OPENAI_API_KEY is configured, otherwise falls back to a
// deterministic local analyzer so the app keeps working in Demo Mode.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface Analysis {
  prospect_name: string;
  company: string;
  email: string;
  buying_intent: "High" | "Medium" | "Low";
  deal_stage: string;
  follow_up_required: boolean;
  risk_level: "High" | "Medium" | "Low";
  next_best_action: string;
  reason: string;
  priority: "High" | "Medium" | "Low";
  priority_reasons: string[];
  customer_needs: string[];
  pain_points: string[];
  objections: string[];
  competitors: string[];
  commitments_salesperson: string[];
  commitments_prospect: string[];
  purchase_timeline: string;
  budget_signals: string;
  follow_up_date: string;
  urgency: string;
  decision_makers: string[];
  summary: string;
  demo_mode?: boolean;
}

function localAnalyze(text: string): Analysis {
  const lower = text.toLowerCase();
  const intentKw = ["pricing", "price", "quote", "budget", "contract", "sign", "buy", "purchase", "schedule a call", "product review", "demo", "evaluation", "evaluate", "interested", "send me"];
  const intentScore = intentKw.reduce((n, k) => (lower.includes(k) ? n + 1 : n), 0);
  const riskKw = ["comparing", "competitor", "alternative", "other solutions", "too expensive", "budget concern", "not sure", "delay", "postpone"];
  const riskHits = riskKw.filter((k) => lower.includes(k));

  const buyingIntent = intentScore >= 4 ? "High" : intentScore >= 2 ? "Medium" : "Low";
  const riskLevel = riskHits.length >= 2 ? "High" : riskHits.length === 1 ? "Medium" : "Low";
  const followUpRequired = intentScore >= 2 || lower.includes("follow up") || lower.includes("schedule");

  const nameMatch = text.match(/Prospect:\s*Hi,?\s*(?:I'm|I am|my name is|this is)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
  const name = nameMatch ? nameMatch[1].trim() : "Unknown Prospect";
  const companyMatch = text.match(/(?:from|at|with)\s+([A-Z][A-Za-z0-9]+(?:\s+[A-Z][A-Za-z0-9]+)?)/);
  const company = companyMatch ? companyMatch[1].trim() : "Unknown Company";
  const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  const email = emailMatch ? emailMatch[0] : "";

  let stage = "New";
  if (lower.match(/negotiat|contract|sign|final/)) stage = "Negotiation";
  else if (lower.match(/proposal|quote|pricing/)) stage = "Proposal";
  else if (lower.match(/evaluat|review|demo|product/)) stage = "Evaluation";
  else if (lower.match(/qualif|need|require|problem/)) stage = "Qualified";
  else if (lower.match(/contact|reach|call|spoke/)) stage = "Contacted";

  const timeline = lower.includes("next week") ? "Next week" : lower.includes("this week") ? "This week" : lower.includes("next month") ? "Next month" : "Not specified";
  const today = new Date();
  const fu = new Date(today);
  fu.setDate(fu.getDate() + (timeline === "Next week" ? 7 : timeline === "This week" ? 3 : 14));
  const followUpDate = `${fu.getFullYear()}-${String(fu.getMonth() + 1).padStart(2, "0")}-${String(fu.getDate()).padStart(2, "0")}`;

  const priority = buyingIntent === "High" && riskLevel !== "Low" ? "High" : buyingIntent === "High" || buyingIntent === "Medium" ? "Medium" : "Low";

  return {
    prospect_name: name,
    company,
    email,
    buying_intent: buyingIntent as Analysis["buying_intent"],
    deal_stage: stage,
    follow_up_required: followUpRequired,
    risk_level: riskLevel as Analysis["risk_level"],
    next_best_action: followUpRequired ? "Send pricing and schedule the product review call." : "Send a brief check-in email to keep the conversation warm.",
    reason: "Local deterministic analysis (Demo Mode).",
    priority: priority as Analysis["priority"],
    priority_reasons: ["Local heuristic analysis"],
    customer_needs: ["Conversation analysis", "Buying intent detection", "Follow-up recommendations", "CRM integration"],
    pain_points: ["Missed follow-ups", "Manual tracking"],
    objections: riskHits.length > 0 ? ["Comparing competitors"] : [],
    competitors: riskHits.length > 0 ? ["Competitor A", "Competitor B"] : [],
    commitments_salesperson: lower.includes("pricing") ? ["Send pricing information"] : [],
    commitments_prospect: lower.includes("schedule") ? ["Schedule a product review call"] : [],
    purchase_timeline: timeline,
    budget_signals: lower.includes("budget") ? "Budget mentioned" : "Not discussed",
    follow_up_date: followUpDate,
    urgency: buyingIntent,
    decision_makers: ["Prospect (evaluator)"],
    summary: `${name} from ${company} engaged in a sales conversation. Buying intent appears ${buyingIntent.toLowerCase()}.`,
    demo_mode: true,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string") {
      return new Response(JSON.stringify({ error: "Missing 'text' field" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      const analysis = localAnalyze(text);
      return new Response(JSON.stringify({ analysis, demo_mode: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = `Analyze this sales conversation and return ONLY a JSON object with these fields:
prospect_name, company, email, buying_intent (High|Medium|Low), deal_stage (New|Contacted|Qualified|Evaluation|Proposal|Negotiation|Won|Lost), follow_up_required (boolean), risk_level (High|Medium|Low), next_best_action, reason, priority (High|Medium|Low), priority_reasons (array), customer_needs (array), pain_points (array), objections (array), competitors (array), commitments_salesperson (array), commitments_prospect (array), purchase_timeline, budget_signals, follow_up_date (YYYY-MM-DD), urgency, decision_makers (array), summary.

Conversation:
${text}`;

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a sales conversation analyst. Return only valid JSON." },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
        response_format: { type: "json_object" },
      }),
    });

    if (!openaiRes.ok) {
      const analysis = localAnalyze(text);
      return new Response(JSON.stringify({ analysis, demo_mode: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await openaiRes.json();
    const content = data.choices?.[0]?.message?.content ?? "{}";
    let analysis: Analysis;
    try {
      analysis = JSON.parse(content);
    } catch {
      analysis = localAnalyze(text);
      return new Response(JSON.stringify({ analysis, demo_mode: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    analysis.demo_mode = false;
    return new Response(JSON.stringify({ analysis, demo_mode: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
