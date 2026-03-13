import { db } from "@/lib/db";
import { routeMessage, getSpecialistResponse, AgentContext } from "./agents";

export async function processUserMessage(userId: string, sessionId: string, message: string) {
  console.log(`[CHAT_ENGINE] Processing message for user=${userId}, session=${sessionId}`);
  
  // 1. Get User Context
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      projectsCreated: { where: { status: "ACTIVE" }, take: 5 },
      projectsAssigned: { where: { status: "ACTIVE" }, take: 5 },
    }
  });

  if (!user) {
    console.error(`[CHAT_ENGINE] User ${userId} not found in DB`);
    throw new Error("User not found");
  }

  const context: AgentContext = {
    role: user.role as any,
    pfiScore: user.pfiScore,
    userName: user.name || "User",
    activeProjects: user.role === "EMPLOYER" ? user.projectsCreated : user.projectsAssigned
  };

  // 2. Load or Create Session
  let session = await db.chatSession.findUnique({
    where: { id: sessionId },
    include: { messages: { orderBy: { createdAt: "asc" }, take: 20 } }
  });

  if (!session) {
    console.log(`[CHAT_ENGINE] Creating new session: ${sessionId}`);
    session = await db.chatSession.create({
      data: { id: sessionId, userId, context: context as any },
      include: { messages: true }
    });
  }

  // 3. Route to Specialist
  console.log(`[CHAT_ENGINE] Routing message: "${message.substring(0, 50)}..."`);
  const specialistType = await routeMessage(message, context);
  console.log(`[CHAT_ENGINE] Routed to: ${specialistType}`);

  // 4. Get Response from Specialist
  const response = await getSpecialistResponse(
    specialistType as any,
    message,
    session.messages,
    context
  );
  console.log(`[CHAT_ENGINE] Got response (${response.length} chars)`);

  // 5. Store Messages in DB
  try {
    await db.$transaction([
      db.chatMessage.create({
        data: {
          sessionId: session.id,
          role: "user",
          content: message
        }
      }),
      db.chatMessage.create({
        data: {
          sessionId: session.id,
          role: "assistant",
          content: response,
          agentName: specialistType,
          actions: generateSuggestedActions(specialistType, context) as any
        }
      })
    ]);
  } catch (dbError) {
    // Don't fail the response if DB storage fails
    console.error("[CHAT_ENGINE] Failed to store messages:", dbError);
  }

  return {
    response,
    specialist: specialistType,
    actions: generateSuggestedActions(specialistType, context)
  };
}

function generateSuggestedActions(type: string, context: AgentContext) {
  const actions = [];
  
  if (type === "SCOPER") {
    actions.push({ label: "Write a DOD", value: "Help me write a DOD for my project" });
    actions.push({ label: "Scope best practices", value: "What makes a good project scope?" });
  }
  
  if (type === "PREPARER") {
    actions.push({ label: "Check my submission", value: "Review my submission checklist" });
    actions.push({ label: "AQA tips", value: "How do I pass the AQA on first try?" });
  }

  if (type === "MEDIATOR") {
    actions.push({ label: "Escrow rules", value: "How does the escrow system work?" });
    actions.push({ label: "Dispute process", value: "What happens during a dispute?" });
  }

  if (context.role === "EMPLOYER") {
    actions.push({ label: "My active projects", value: "Show my active projects" });
  } else if (context.role === "FREELANCER") {
    actions.push({ label: "My earnings", value: "Check my virtual balance" });
  }

  return actions;
}
