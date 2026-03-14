import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface AQAScore {
  completeness: number; // 0-100
  quality: number;      // 0-100
  integrity: number;    // 0-100
  overall: number;      // Weighted average
  feedback: string;
}

/**
 * Multi-agent style evaluation using a single structured prompt for efficiency
 * but distinctly prompting for different review perspectives.
 */
export async function evaluateSubmission(
  content: string,
  dod: string,
  projectDescription: string
): Promise<AQAScore> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
You are the FluxCred Autonomous Quality Assurance (AQA) System. 
Your task is to evaluate a freelancer's submission against the specific "Definition of Done" (DOD).

### CONTEXT
Project: ${projectDescription}
Definition of Done (DOD): ${dod}

### SUBMISSION CONTENT
${content}

### EVALUATION CRITERIA
1. COMPLETENESS AGENT: Verify that every single item in the DOD is addressed. Score 0-100.
2. QUALITY AGENT: Evaluate the professionalism and technical depth. Is it "good enough" or just filler? Score 0-100.
3. INTEGRITY AGENT: Does this actually solve the project's goal? Is it aligned with the description? Score 0-100.

### OUTPUT FORMAT
Return ONLY a JSON object with the following structure:
{
  "completeness": number,
  "quality": number,
  "integrity": number,
  "overall": number,
  "feedback": "Concise summary of strengths and specifically what is missing if the score is low."
}

Ensure the "overall" score accurately reflects the weighted importance of all three (Completeness is highest weight).
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Extract JSON (sometimes Gemini wraps in markdown)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid AI response format");
    
    const data = JSON.parse(jsonMatch[0]);
    
    return {
      completeness: data.completeness || 0,
      quality: data.quality || 0,
      integrity: data.integrity || 0,
      overall: data.overall || 0,
      feedback: data.feedback || "Evaluation complete."
    };
  } catch (error) {
    console.error("[EVALUATOR_ERROR]", error);
    return {
      completeness: 0,
      quality: 0,
      integrity: 0,
      overall: 0,
      feedback: "AI evaluation failed. Manual review may be required."
    };
  }
}
