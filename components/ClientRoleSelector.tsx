"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Shield, Activity } from "lucide-react";

export default function ClientRoleSelector() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const selectRole = async (role: string) => {
    setLoading(role);
    try {
      const res = await fetch("/api/user/role", {
        method: "POST",
        body: JSON.stringify({ role }),
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
      <RoleCard 
        title="Protocol Authority" 
        description="Initialize protocols, fund escrow, and verify milestones." 
        icon={<Shield className="w-8 h-8" />}
        loading={loading === "EMPLOYER"}
        onClick={() => selectRole("EMPLOYER")}
      />
      <RoleCard 
        title="Node Freelancer" 
        description="Complete milestones, build PFI reputation, and earn credit." 
        icon={<Activity className="w-8 h-8" />}
        loading={loading === "FREELANCER"}
        onClick={() => selectRole("FREELANCER")}
      />
    </div>
  );
}

function RoleCard({ title, description, icon, loading, onClick }: { title: string, description: string, icon: React.ReactNode, loading: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      disabled={loading !== false && loading !== null}
      className="p-8 border border-border bg-card hover:border-primary transition-all text-left flex flex-col items-center gap-4 group disabled:opacity-50 cursor-pointer"
    >
      <div className="text-primary group-hover:scale-110 transition-transform">
        {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : icon}
      </div>
      <div>
        <h3 className="font-mono font-bold text-xl text-center mb-2 uppercase tracking-tight">{title}</h3>
        <p className="text-sm text-muted-foreground text-center font-sans">{description}</p>
      </div>
    </button>
  );
}
