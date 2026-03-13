"use client";

import Link from "next/link";
import { UserButton, useUser, SignInButton, SignUpButton } from "@clerk/nextjs";
import { ShieldCheck, LayoutDashboard, Activity } from "lucide-react";

export function Navbar() {
  const { isSignedIn } = useUser();

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-primary/20 p-2 rounded border border-primary/50 group-hover:bg-primary/30 transition-colors">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <span className="font-mono font-bold text-xl tracking-tighter uppercase">
                BIT<span className="text-primary">BY</span>BIT
              </span>
            </Link>

            {isSignedIn && (
              <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                <Link href="/dashboard" className="flex items-center gap-2 hover:text-foreground transition-colors">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link href="/projects" className="flex items-center gap-2 hover:text-foreground transition-colors">
                  <Activity className="w-4 h-4" />
                  Projects
                </Link>
                <Link href="/admin" className="flex items-center gap-2 hover:text-foreground transition-colors text-primary/60 hover:text-primary">
                  <ShieldCheck className="w-4 h-4" />
                  Admin
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {isSignedIn ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end mr-2">
                  <span className="text-xs text-muted-foreground uppercase font-mono tracking-widest">Balance</span>
                  <span className="text-sm font-mono text-accent">$0.00</span>
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
                  <button className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:bg-primary/90 transition-all active:scale-95 cursor-pointer">
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
