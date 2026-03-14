"use client";

import Link from "next/link";
import { UserButton, useUser, SignInButton, SignUpButton } from "@clerk/nextjs";
import { ShieldCheck, LayoutDashboard, Activity, Briefcase } from "lucide-react";
import { useEffect, useState } from "react";

export function Navbar() {
  const { isSignedIn, user } = useUser();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      // Admin check
      setIsAdmin(user.primaryEmailAddress?.emailAddress === "admin@fluxcred.com");
      
      // Fetch role from our DB since it's not in Clerk public metadata by default
      fetch("/api/user/me")
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.role) {
            setUserRole(data.role);
          }
        })
        .catch(console.error);
    }
  }, [user]);

  return (
    <nav className="border-b border-white/5 bg-slate-900/60 backdrop-blur-2xl sticky top-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-0 pointer-events-none bg-[length:100%_4px,3px_100%]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="bg-primary/10 p-2 rounded-sm border border-primary/30 group-hover:bg-primary/20 transition-all group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                <ShieldCheck className="w-5 h-5 text-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              </div>
              <div className="flex flex-col">
                <span className="font-mono font-black text-xl tracking-tighter uppercase glow-text leading-none">
                  FLUX<span className="text-primary">CRED</span>
                </span>
                <span className="text-[8px] text-primary/40 leading-none mt-1 font-bold tracking-[0.2em]">OS // BRANCH_ALPHA</span>
              </div>
            </Link>

            {isSignedIn && userRole === "EMPLOYER" && (
              <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                <Link href="/dashboard" className="flex items-center gap-2 hover:text-foreground transition-colors">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link href="/projects" className="flex items-center gap-2 hover:text-foreground transition-colors">
                  <Briefcase className="w-4 h-4" />
                  My Projects
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="flex items-center gap-2 hover:text-foreground transition-colors text-primary/60 hover:text-primary">
                    <ShieldCheck className="w-4 h-4" />
                    Admin
                  </Link>
                )}
              </div>
            )}

            {isSignedIn && userRole === "FREELANCER" && (
              <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                <Link href="/dashboard" className="flex items-center gap-2 hover:text-foreground transition-colors">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link href="/projects" className="flex items-center gap-2 hover:text-foreground transition-colors">
                  <Activity className="w-4 h-4" />
                  Find Work
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="flex items-center gap-2 hover:text-foreground transition-colors text-primary/60 hover:text-primary">
                    <ShieldCheck className="w-4 h-4" />
                    Admin
                  </Link>
                )}
              </div>
            )}

            {isSignedIn && !userRole && (
               <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                <Link href="/dashboard" className="flex items-center gap-2 hover:text-foreground transition-colors">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {isSignedIn ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end mr-4 border-l border-white/5 pl-4">
                  <span className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">Escrow_Buffer</span>
                  <span className="text-xs font-mono text-accent tabular-nums">$0.00</span>
                </div>
                <div className="hidden sm:flex flex-col items-end mr-4 border-l border-white/5 pl-4">
                  <span className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">Network_Sync</span>
                  <span className="text-[10px] font-mono text-green-500 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    LIVE
                  </span>
                </div>
                <UserButton />
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <SignInButton mode="modal">
                  <button className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-primary text-primary-foreground px-6 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-all active:scale-95 cursor-pointer shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                    Get Started
                  </button>
                </SignUpButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
