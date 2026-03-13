import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Find a user to be the employer
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log("No users found. Please sign in first.");
    return;
  }

  const project = await prisma.project.create({
    data: {
      title: "GENESIS // PROTOCOL_01",
      description: "Initial system verification node. Requires written technical documentation for the BITBYBIT escrow layer.",
      status: "OPEN",
      totalEscrow: 500,
      employerId: user.id,
      milestones: {
        create: [
          {
            title: "Technical Architecture Doc",
            description: "Provide a complete markdown documentation of the AQA logic.",
            definitionOfDone: "Document must cover Gemini integration, prompt structure, and verification levels.",
            amount: 250,
            status: "PENDING"
          },
          {
            title: "Security Audit Report",
            description: "Review current API endpoints for potential leaks.",
            definitionOfDone: "Report must list all API routes and their auth middleware status.",
            amount: 250,
            status: "PENDING"
          }
        ]
      }
    }
  });

  console.log("Genesis Project Created:", project.id);
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
