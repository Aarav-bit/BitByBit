import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { Navbar } from "@/components/Navbar";
import { redirect, notFound } from "next/navigation";
import ProjectTerminal from "@/components/ProjectTerminal";

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const [user, project] = await Promise.all([
    db.user.findUnique({ where: { clerkId } }),
    db.project.findUnique({
      where: { id },
      include: {
        milestones: {
          include: { submissions: true },
          orderBy: { createdAt: "asc" },
        },
        employer: true,
        freelancer: true,
      }
    })
  ]);

  if (!project) notFound();
  if (!user) redirect("/sign-in");

  // Basic authorization check
  const isEmployer = project.employerId === user.id;
  const isFreelancer = project.freelancerId === user.id;
  const isUnassigned = !project.freelancerId;

  if (!isEmployer && !isFreelancer && !isUnassigned) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <ProjectTerminal project={project} user={user} />
    </div>
  );
}
