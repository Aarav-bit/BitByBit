import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { Navbar } from "@/components/Navbar";
import { redirect } from "next/navigation";
import ProjectsContent from "@/components/ProjectsContent";

export default async function ProjectsPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await db.user.findUnique({
    where: { clerkId },
  });

  if (!user) redirect("/sign-in");

  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Navbar />
      <ProjectsContent user={user} />
    </div>
  );
}
