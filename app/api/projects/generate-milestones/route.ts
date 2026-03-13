import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

type GeneratedMilestone = {
  title: string;
  dod: string;
  amount: number;
};

function sanitizeMilestones(input: any): GeneratedMilestone[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((m) => ({
      title: typeof m?.title === "string" ? m.title.trim() : "",
      dod: typeof m?.dod === "string" ? m.dod.trim() : "",
      amount: typeof m?.amount === "number" && Number.isFinite(m.amount) ? m.amount : 0,
    }))
    .filter((m) => m.title.length > 0 && m.dod.length > 0)
    .slice(0, 12);
}

async function generateWithAI(task: string, title?: string) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // Safe fallback so dev builds work without a key.
    const base = title?.trim() ? title.trim() : "PROJECT";
    return {
      description: task,
      milestones: [
        {
          title: `${base} // DISCOVERY & PLAN`,
          dod: "Provide a clear plan, success criteria, and timeline. Include assumptions and risks.",
          amount: 0,
        },
        {
          title: `${base} // IMPLEMENTATION`,
          dod: "Deliver the core implementation. Provide proof (screenshots, links, or code summary) and note tradeoffs.",
          amount: 0,
        },
        {
          title: `${base} // QA & HANDOFF`,
          dod: "Provide testing notes, edge cases handled, and handoff instructions. All acceptance criteria met.",
          amount: 0,
        },
      ],
    };
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are generating milestone drafts for the BITBYBIT escrow protocol.

INPUT:
- Title (optional): ${title ? JSON.stringify(title) : "null"}
- Task: ${JSON.stringify(task)}

OUTPUT RULES:
- Return ONLY valid JSON (no markdown, no commentary).
- Generate 3 to 7 milestones.
- Each milestone must have:
  - title: short, clear
  - dod: "Definition of Done" acceptance criteria, specific and testable
  - amount: number (set to 0; employer will fill escrow allocation)

JSON SCHEMA:
{
  "description": string,
  "milestones": Array<{ "title": string, "dod": string, "amount": number }>
}
`;

  const result = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });
  const text = result.text ?? "";
  const jsonStr = text.match(/\{[\s\S]*\}/)?.[0] || text;
  const parsed = JSON.parse(jsonStr);

  return {
    description: typeof parsed?.description === "string" ? parsed.description : task,
    milestones: sanitizeMilestones(parsed?.milestones),
  };
}

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return new NextResponse("Unauthorized", { status: 401 });

  const user = await db.user.findUnique({ where: { clerkId } });
  if (!user || user.role !== "EMPLOYER") {
    return new NextResponse("Only employers can generate milestones", { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const task = typeof body?.task === "string" ? body.task.trim() : "";
  const title = typeof body?.title === "string" ? body.title.trim() : undefined;

  if (!task) return new NextResponse("Missing required field: task", { status: 400 });

  try {
    const generated = await generateWithAI(task, title);
    if (!generated.milestones.length) {
      return new NextResponse("AI did not generate milestones", { status: 422 });
    }
    return NextResponse.json(generated);
  } catch (e) {
    console.error("[PROJECTS_GENERATE_MILESTONES_ERROR]", e);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}



