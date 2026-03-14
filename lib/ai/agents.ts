// FluxCred Chatbot — Groq (Llama 3.3 70B) — Free tier: 30 RPM, 14,400 RPD
// No extra packages needed — uses raw fetch with OpenAI-compatible API

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

export type SpecialistType = "SCOPER" | "PREPARER" | "MEDIATOR" | "EXPERT" | "AGENT_OPS" | "ROUTER";

export interface AgentContext {
  role: "EMPLOYER" | "FREELANCER" | null;
  pfiScore: number;
  userName: string;
  activeProjects: any[];
}

const SPECIALISTS: Record<Exclude<SpecialistType, "ROUTER">, string> = {
  SCOPER: `You are the FluxCred Scoping Specialist.
    Your goal is to help Employers write high-quality project descriptions and "Definitions of Done" (DOD).
    High quality DODs reduce disputes and improve PFI scores.
    Focus on: Clarity, Measurability, and Completeness.`,
    
  PREPARER: `You are the FluxCred Submission Preparer.
    Your goal is to help Freelancers prepare for milestone submissions.
    Remind them to check their DOD, ensure all files are attached, and maintain on-time delivery.
    Advise them on how to maintain high Quality Scores.`,
    
  MEDIATOR: `You are the FluxCred Dispute Mediator.
    Your goal is to explain escrow policies and help resolve conflicts.
    You prioritize the platform's rules: funds are released only when DOD is met.
    Explain how rejections work and how to escalate to human review if needed.`,
    
  EXPERT: `You are the FluxCred Platform Expert.
    You know everything about PFI (Platform Fairness Index), Scores, and features.
    Explain how to improve scores, how escrow works, and where to find things.`,
    
  AGENT_OPS: `You are the FluxCred Agent Interface.
    You explain how the autonomous AI Project Monitor works.
    Explain "First-pass success", autonomous approvals, and how the monitor reduces friction.`
};

async function callGroq(messages: { role: string; content: string }[], maxTokens = 1024): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set in environment variables");
  }

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[GROQ_ERROR] Status: ${response.status}, Body: ${errorBody.substring(0, 300)}`);
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "I couldn't generate a response.";
}

export async function routeMessage(message: string, context: AgentContext): Promise<SpecialistType> {
  try {
    const result = await callGroq([
      {
        role: "system",
        content: `You are a routing classifier for the FluxCred freelancing platform. 
Analyze the user's message and route it to the best specialist.
Respond with ONLY one word — the specialist name in uppercase. Nothing else.
Options: SCOPER, PREPARER, MEDIATOR, EXPERT, AGENT_OPS`
      },
      {
        role: "user",
        content: `User Role: ${context.role || "UNKNOWN"}, PFI: ${context.pfiScore}. Message: "${message}"`
      }
    ], 10);

    const text = result.toUpperCase().trim();
    const validTypes: SpecialistType[] = ["SCOPER", "PREPARER", "MEDIATOR", "EXPERT", "AGENT_OPS"];
    const selected = validTypes.find(t => text.includes(t)) || "EXPERT";

    console.log(`[ROUTER] "${message.substring(0, 40)}..." => ${selected}`);
    return selected;
  } catch (error) {
    console.error("[ROUTER_ERROR]", error);
    return "EXPERT";
  }
}

export async function getSpecialistResponse(
  type: Exclude<SpecialistType, "ROUTER">,
  message: string,
  history: any[],
  context: AgentContext
): Promise<string> {
  try {
    const systemPrompt = `${SPECIALISTS[type]}

User Context:
- Name: ${context.userName}
- Role: ${context.role || "Not set"}
- PFI Score: ${context.pfiScore}
- Active Projects: ${JSON.stringify(context.activeProjects?.map(p => ({ title: p.title, status: p.status })) || [])}

Instructions:
- Maintain a professional, helpful, and premium "FluxCred" brand voice.
- Keep responses concise but helpful (2-4 paragraphs max).
- Use Markdown for formatting when helpful.
- If the user asks for actions like "check status" or "update milestone", mention that you can help.`;

    // Build messages array with history
    const messages: { role: string; content: string }[] = [
      { role: "system", content: systemPrompt }
    ];

    // Add recent chat history (last 10 messages)
    for (const h of history.slice(-10)) {
      messages.push({
        role: h.role === "assistant" ? "assistant" : "user",
        content: h.content
      });
    }

    // Add current message
    messages.push({ role: "user", content: message });

    const response = await callGroq(messages, 1024);
    console.log(`[SPECIALIST:${type}] Response: ${response.length} chars`);
    return response;
  } catch (error: any) {
    console.error(`[SPECIALIST_ERROR:${type}]`, error?.message || error);
    return `I apologize, but I'm experiencing a temporary issue. Please try again in a moment. If the problem persists, our team is here to help!`;
  }
}
