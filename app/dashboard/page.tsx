import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { Navbar } from "@/components/Navbar";
import { redirect } from "next/navigation";
import DashboardContent from "@/components/DashboardContent";
import ClientRoleSelector from "@/components/ClientRoleSelector";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const clerkUser = await currentUser();
  
  // Ensure user exists in our DB
  let user = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      projectsCreated: true,
      projectsAssigned: true,
    }
  });

  if (!user) {
    user = await db.user.create({
      data: {
        clerkId: userId,
        email: clerkUser?.emailAddresses[0].emailAddress || "",
        name: [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" "),
      },
      include: {
        projectsCreated: true,
        projectsAssigned: true,
      }
    });
  }

  // If no role, show role selection
  if (!user.role) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="max-w-2xl w-full text-center">
            <h2 className="text-3xl font-mono font-bold uppercase mb-8 tracking-tighter">SELECT PROTOCOL BRANCH</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ClientRoleSelector />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <DashboardContent user={user} />
    </div>
  );
}
