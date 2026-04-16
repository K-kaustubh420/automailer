"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [initial, setInitial] = useState("?");

  // Get user initial from cookie on mount
  useEffect(() => {
    const email = Cookies.get("user_email");
    if (email) {
      setInitial(email[0].toUpperCase());
    }
  }, []);

  const navLinks = [
    { name: "Inbox", href: "/inbox" },
    { name: "Triage", href: "/dashboard" }, // Triage is usually the main dashboard
    { name: "Settings", href: "/settings" },
  ];

  const handleLogout = () => {
    Cookies.remove("user_email");
    Cookies.remove("user_pass");
    router.push("/login");
  };

  return (
    <nav className="w-full border-b border-white/5 bg-[#0A0A0A] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-4">
        
        {/* Left: Logo - Links to Dashboard */}
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-[#10b981] rounded-md flex items-center justify-center text-black font-bold text-lg group-hover:scale-110 transition-transform">
            ⌘
          </div>
          <span className="text-white text-xl font-mono tracking-tighter font-semibold">
            Automailer
          </span>
        </Link>

        {/* Center: Dynamic Links */}
        <div className="flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  isActive 
                    ? "text-[#10b981]" 
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Right: Avatar with Logout Trigger */}
        <div className="flex items-center gap-4">
          <button 
            onClick={handleLogout}
            className="text-[10px] font-bold text-zinc-500 hover:text-red-400 uppercase tracking-widest transition-colors"
          >
            Logout
          </button>
          
          <div className="relative group">
            <div className="w-10 h-10 bg-[#8b5cf6] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-purple-500/10 cursor-pointer">
              {initial}
            </div>
            
            {/* Simple Tooltip on hover */}
            <div className="absolute top-full right-0 mt-2 hidden group-hover:block bg-[#1a1a1a] border border-white/10 px-3 py-1.5 rounded text-[10px] text-zinc-400 whitespace-nowrap">
              {Cookies.get("user_email")}
            </div>
          </div>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;