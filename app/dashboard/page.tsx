"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/navbar";

const Dashboard = () => {
  const router = useRouter();
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New state to handle which priority is currently selected (Default: High)
  const [selectedPriority, setSelectedPriority] = useState<string>("High");

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch("/api/emails");
        const data = await response.json();
        if (Array.isArray(data)) {
          setEmails(data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Calculate counts for cards
  const highCount = emails.filter((e: any) => e.priority === "High").length;
  const mediumCount = emails.filter((e: any) => e.priority === "Medium").length;
  const lowCount = emails.filter((e: any) => e.priority === "Low").length;

  // Filter emails based on the active selection
  const displayEmails = emails
    .filter((e: any) => e.priority === selectedPriority)
    .slice(0, 5); // Show top 5 for the dashboard view

  // Helper for dynamic row tag colors
  const getTagStyles = (priority: string) => {
    switch (priority) {
      case "High": return "bg-[#7f1d1d]/40 text-[#ef4444]";
      case "Medium": return "bg-[#7c2d12]/40 text-[#f59e0b]";
      case "Low": return "bg-[#064e3b]/40 text-[#10b981]";
      default: return "bg-zinc-800 text-zinc-400";
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white relative overflow-hidden selection:bg-green-500/30">
      <Navbar />

      {/* Subtle background glow */}
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-green-900/20 rounded-full blur-[120px] pointer-events-none" />

      <main className="max-w-7xl mx-auto px-8 pt-16 relative z-10">
        <div className="mb-12">
          <h1 className="text-4xl font-mono tracking-tighter font-bold mb-3">
            Dashboard
          </h1>
          <p className="text-zinc-500 text-lg">
            {loading ? "AI is analyzing your inbox..." : "Manage and triage your emails with absolute control."}
          </p>
        </div>

        {/* Priority Cards - Now Clickable */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* High Card */}
          <div 
            onClick={() => setSelectedPriority("High")}
            className={`cursor-pointer transition-all duration-300 p-5 rounded-2xl border flex items-center gap-4 ${
              selectedPriority === "High" ? "bg-[#1a1a1a] border-red-500/50 shadow-lg shadow-red-500/5" : "bg-[#141414] border-white/5 hover:border-white/10"
            }`}
          >
            <div className="w-10 h-10 bg-[#7f1d1d]/80 text-[#ef4444] rounded-lg flex items-center justify-center font-bold text-lg">
              {loading ? "..." : highCount}
            </div>
            <span className={`text-lg font-medium ${selectedPriority === "High" ? "text-white" : "text-zinc-400"}`}>High</span>
          </div>

          {/* Medium Card */}
          <div 
            onClick={() => setSelectedPriority("Medium")}
            className={`cursor-pointer transition-all duration-300 p-5 rounded-2xl border flex items-center gap-4 ${
              selectedPriority === "Medium" ? "bg-[#1a1a1a] border-orange-500/50 shadow-lg shadow-orange-500/5" : "bg-[#141414] border-white/5 hover:border-white/10"
            }`}
          >
            <div className="w-10 h-10 bg-[#7c2d12]/80 text-[#f59e0b] rounded-lg flex items-center justify-center font-bold text-lg">
              {loading ? "..." : mediumCount}
            </div>
            <span className={`text-lg font-medium ${selectedPriority === "Medium" ? "text-white" : "text-zinc-400"}`}>Medium</span>
          </div>

          {/* Low Card */}
          <div 
            onClick={() => setSelectedPriority("Low")}
            className={`cursor-pointer transition-all duration-300 p-5 rounded-2xl border flex items-center gap-4 ${
              selectedPriority === "Low" ? "bg-[#1a1a1a] border-green-500/50 shadow-lg shadow-green-500/5" : "bg-[#141414] border-white/5 hover:border-white/10"
            }`}
          >
            <div className="w-10 h-10 bg-[#064e3b]/80 text-[#10b981] rounded-lg flex items-center justify-center font-bold text-lg">
              {loading ? "..." : lowCount}
            </div>
            <span className={`text-lg font-medium ${selectedPriority === "Low" ? "text-white" : "text-zinc-400"}`}>Low</span>
          </div>
        </div>

        {/* Email List Section */}
        <div className="mb-6">
          <h2 className="text-zinc-400 font-medium mb-4">
            Recent {selectedPriority} Priority Emails
          </h2>
          <div className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden min-h-[100px]">
            {loading ? (
              <div className="p-8 text-center text-zinc-600 animate-pulse">Running AI Classification...</div>
            ) : displayEmails.length > 0 ? (
              displayEmails.map((email: any, idx: number) => (
                <div 
                  key={email.id || idx} 
                  onClick={() => router.push(`/inbox/${email.id}`)}
                  className={`flex items-center justify-between p-5 cursor-pointer group ${
                    idx !== displayEmails.length - 1 ? 'border-b border-white/5' : ''
                  } hover:bg-white/[0.04] transition-all`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded w-16 text-center ${getTagStyles(email.priority)}`}>
                      {email.priority}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white group-hover:text-green-400 transition-colors">
                        {email.sender}
                      </span>
                      <span className="text-zinc-500 line-clamp-1">{email.subject}</span>
                    </div>
                  </div>
                  <div className="text-zinc-500 text-sm whitespace-nowrap ml-4">{email.time}</div>
                </div>
              ))
            ) : (
              <div className="p-16 text-center text-zinc-500 font-mono text-sm uppercase tracking-widest">
                No {selectedPriority.toLowerCase()} priority items found
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={() => router.push('/inbox')}
          className="flex items-center gap-2 text-blue-400/80 hover:text-blue-400 transition-colors text-sm font-medium"
        >
          View All Inbox
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </main>
    </div>
  );
};

export default Dashboard;