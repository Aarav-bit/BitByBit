"use client";

import Link from "next/link";
import { UserButton, useUser, SignInButton, SignUpButton } from "@clerk/nextjs";
import { ShieldCheck, LayoutDashboard, Activity, Briefcase, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { usePathname } from "next/navigation";

export function Navbar() {
  const { isSignedIn, user } = useUser();
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      setIsAdmin(user.primaryEmailAddress?.emailAddress === "admin@fluxcred.com");
      
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

  const navLinks = [
    { href: "/dashboard", icon: <LayoutDashboard className="w-3.5 h-3.5" />, label: "Terminal" },
    { 
      href: "/projects", 
      icon: userRole === "FREELANCER" ? <Activity className="w-3.5 h-3.5" /> : <Briefcase className="w-3.5 h-3.5" />, 
      label: userRole === "FREELANCER" ? "Mining" : "Nodes" 
    },
    ...(isAdmin ? [{ href: "/admin", icon: <ShieldCheck className="w-3.5 h-3.5" />, label: "Command", highlight: true }] : [])
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled 
        ? "py-3 bg-slate-950/90 backdrop-blur-2xl border-b border-primary/30 shadow-[0_8px_32px_rgba(0,0,0,0.6)]" 
        : "py-5 bg-transparent border-b border-white/5"
    }`}>
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-30" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex justify-between items-center h-12">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-4 group relative">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full group-hover:bg-primary/40 transition-all duration-500" />
                <motion.div 
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  className="relative bg-slate-900 border border-primary/40 p-2.5 rounded-xl group-hover:border-primary/80 transition-all shadow-lg scanner-line"
                >
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </motion.div>
              </div>
              <div className="flex flex-col">
                <span className="font-mono font-black text-2xl tracking-tighter uppercase leading-none italic group-hover:text-glow-primary transition-all duration-300">
                  FLUX<span className="text-primary not-italic">CRED</span>
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <motion.div 
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-1 h-1 rounded-full bg-primary" 
                  />
                  <span className="text-[7px] text-primary/70 leading-none font-bold tracking-[0.4em] uppercase">Auth_Protocol_v0.2.1</span>
                </div>
              </div>
            </Link>

            {isSignedIn && (
              <div className="hidden md:flex items-center gap-1 ml-4 p-1.5 bg-slate-900/50 rounded-full border border-white/10 backdrop-blur-md relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                {navLinks.map((link) => (
                  <NavLink 
                    key={link.href}
                    {...link}
                    isActive={pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-6">
            {isSignedIn ? (
              <div className="flex items-center gap-6">
                <div className="hidden lg:flex flex-col items-end border-r border-white/10 pr-6">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-[7px] text-slate-500 uppercase font-black tracking-[0.2em]">System_Integrity</span>
                    <Zap className="w-2 h-2 text-accent animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <motion.div 
                          key={i} 
                          animate={{ height: [12, 16, 12], opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                          className={`w-1 rounded-full ${i < 5 ? 'bg-primary' : 'bg-primary/20'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-mono font-bold text-primary text-glow-primary">OPTIMAL</span>
                  </div>
                </div>
                
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-4 bg-slate-900/80 pl-4 pr-1.5 py-1.5 rounded-full border border-primary/20 hover:border-primary/40 transition-all group"
                >
                  <div className="flex flex-col items-end">
                    <span className="text-[7px] text-slate-500 uppercase font-bold tracking-widest group-hover:text-primary/70 transition-colors">BUFFER_SESS</span>
                    <span className="text-[10px] font-mono text-accent font-black tracking-tighter leading-none italic text-glow-accent">
                      {(user.username || user.firstName || "OPERATOR").slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-sm rounded-full group-hover:bg-primary/40 transition-all" />
                    <UserButton 
                      appearance={{
                        elements: {
                          userButtonAvatarBox: "w-8 h-8 border border-white/20 rounded-full overflow-hidden transition-transform group-hover:scale-110",
                          userButtonPopoverCard: "bg-slate-950 border border-primary/20 backdrop-blur-2xl"
                        }
                      }}
                    />
                  </div>
                </motion.div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <SignInButton mode="modal">
                  <button className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-primary transition-all duration-300 cursor-pointer px-4 relative group">
                    <span className="relative z-10">Access_Portal</span>
                    <div className="absolute bottom-0 left-0 w-0 h-px bg-primary group-hover:w-full transition-all duration-300" />
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="relative group cursor-pointer overflow-hidden px-10 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border border-primary/50 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                    <div className="absolute inset-0 bg-primary opacity-20 group-hover:opacity-30 transition-opacity" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <div className="absolute inset-0 scanner-line opacity-0 group-hover:opacity-10" />
                    <span className="relative z-10 text-primary group-hover:text-white transition-colors">Initialization</span>
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

function NavLink({ href, icon, label, highlight = false, isActive = false }: { href: string; icon: React.ReactNode; label: string; highlight?: boolean; isActive?: boolean }) {
  return (
    <Link 
      href={href} 
      className={`relative px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.15em] flex items-center gap-2.5 transition-all group z-10 ${
        isActive 
          ? "text-primary shadow-[inset_0_0_10px_rgba(59,130,246,0.1)]" 
          : highlight 
            ? "text-primary/80 hover:text-primary" 
            : "text-slate-500 hover:text-slate-200"
      }`}
    >
      {isActive && (
        <motion.div 
          layoutId="nav-active"
          className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-full z-0"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      <span className={`relative z-10 transition-all duration-300 ${isActive ? 'scale-110 text-glow-primary' : 'group-hover:scale-110'}`}>{icon}</span>
      <span className="relative z-10">{label}</span>
      
      {!isActive && (
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 rounded-full transition-opacity transition-all duration-300 scale-90 group-hover:scale-100" />
      )}
    </Link>
  );
}

