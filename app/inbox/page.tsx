"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/navbar";

const Inbox = () => {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch emails from the Next.js API Bridge
  useEffect(() => {
    async function fetchInbox() {
      try {
        const response = await fetch("/api/emails");
        const data = await response.json();
        
        // Handle unauthorized or empty data
        if (data.error) {
          console.error("Auth error:", data.error);
          router.push("/login"); // Redirect to login if credentials are lost/expired
          return;
        }

        if (Array.isArray(data)) {
          setEmails(data);
        }
      } catch (error) {
        console.error("Connection error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchInbox();
  }, [router]);

  // Helper to color-code tags based on AI Priority
  const getTagStyles = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-[#7f1d1d]/40 text-[#ef4444]";
      case "Medium":
        return "bg-[#7c2d12]/40 text-[#f59e0b]";
      case "Low":
        return "bg-[#064e3b]/40 text-[#10b981]";
      default:
        return "bg-zinc-800 text-zinc-400";
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white relative overflow-hidden selection:bg-green-500/30">
      <Navbar />

      {/* Subtle background glow */}
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-green-900/10 rounded-full blur-[120px] pointer-events-none" />

      <main className="max-w-7xl mx-auto px-8 pt-16 relative z-10">
        
        {/* Header Section */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-4xl font-mono tracking-tighter font-bold">
              Email List
            </h1>
            {loading && (
               <p className="text-green-500 text-sm mt-2 animate-pulse font-medium">
                 AI Engine is triaging your inbox...
               </p>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-zinc-500">Sort by:</span>
            <button className="font-bold flex items-center gap-1 hover:text-zinc-300 transition-colors">
              Date
              <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Email List Container */}
        <div className="bg-[#141414]/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm shadow-2xl">
          {loading ? (
            // SKELETON LOADING STATE
            [...Array(7)].map((_, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-6 border-b border-white/5 animate-pulse">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-5 bg-white/5 rounded" />
                  <div className="flex flex-col gap-2">
                    <div className="w-32 h-4 bg-white/10 rounded" />
                    <div className="w-80 h-3 bg-white/5 rounded" />
                  </div>
                </div>
                <div className="w-16 h-4 bg-white/5 rounded" />
              </div>
            ))
          ) : emails.length > 0 ? (
            // REAL DATA LIST
            emails.map((email: any, idx) => (
              <div 
                key={email.id || idx} 
                onClick={() => router.push(`/inbox/${email.id}`)} // Navigation Logic
                className={`flex items-center justify-between px-6 py-5 ${idx !== emails.length - 1 ? 'border-b border-white/5' : ''} hover:bg-white/[0.04] transition-all cursor-pointer group`}
              >
                <div className="flex items-center gap-5">
                  {/* Priority Tag */}
                  <div className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded min-w-[55px] text-center border border-white/5 ${getTagStyles(email.priority)}`}>
                    {email.priority}
                  </div>
                  
                  {/* Sender & Subject */}
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white text-[15px] group-hover:text-green-400 transition-colors">
                      {email.sender}
                    </span>
                    <span className="text-zinc-500 text-[15px] line-clamp-1 max-w-xl">
                      {email.subject}
                    </span>
                  </div>
                </div>

                {/* Timestamp & Team */}
                <div className="flex items-center gap-6">
                  <span className="text-[10px] text-zinc-600 font-mono hidden md:block uppercase tracking-widest">
                    {email.assigned_team}
                  </span>
                  <div className="text-zinc-500 text-sm font-medium whitespace-nowrap">
                    {email.time}
                  </div>
                </div>
              </div>
            ))
          ) : (
            // EMPTY STATE
            <div className="py-24 text-center">
               <div className="text-zinc-600 mb-2">No emails found.</div>
               <p className="text-zinc-700 text-sm">Your inbox is clear or AI is waiting for new data.</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex items-center justify-between">
            <button className="flex items-center gap-2 text-[#3b82f6] hover:brightness-125 transition-all text-sm font-medium">
            View Archived 
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            </button>
            <p className="text-[10px] text-zinc-700 font-mono">SECURE IMAP SESSION ACTIVE</p>
        </div>

      </main>
    </div>
  );
};

export default Inbox;