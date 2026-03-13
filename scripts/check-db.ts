import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  const projects = await prisma.project.findMany();
  console.log("Users:", JSON.stringify(users, null, 2));
  console.log("Projects:", JSON.stringify(projects, null, 2));
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
