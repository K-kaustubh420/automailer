"use client";

import React from "react";

const Navbar = () => {
  return (
    <nav className="w-full border-b border-white/5 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-4">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#10b981] rounded-md flex items-center justify-center text-black font-bold text-lg">
            ⌘
          </div>
          <span className="text-white text-xl font-mono tracking-tighter font-semibold">
            Automailer
          </span>
        </div>

        {/* Center: Links */}
        <div className="flex items-center gap-8">
          <a href="#" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">Inbox</a>
          <a href="#" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">Triage</a>
          <a href="#" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">Settings</a>
        </div>

        {/* Right: Avatar */}
        <div className="flex items-center">
          <div className="w-10 h-10 bg-[#8b5cf6] rounded-full flex items-center justify-center text-white font-medium text-sm">
            K
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;