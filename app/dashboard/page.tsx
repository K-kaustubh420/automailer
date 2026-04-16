"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/app/components/navbar";

const Dashboard = () => {
  // 1. State for dynamic data
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 2. Fetch data on mount
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

  // 3. Logic to calculate counts for the cards
  const highCount = emails.filter((e: any) => e.priority === "High").length;
  const mediumCount = emails.filter((e: any) => e.priority === "Medium").length;
  const lowCount = emails.filter((e: any) => e.priority === "Low").length;

  // 4. Filter for the "Recent High Priority" list
  const recentHighPriority = emails
    .filter((e: any) => e.priority === "High")
    .slice(0, 3); // Showing top 3 to match your original UI design

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white relative overflow-hidden selection:bg-green-500/30">
      <Navbar />

      {/* Subtle background glow */}
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-green-900/20 rounded-full blur-[120px] pointer-events-none" />

      <main className="max-w-7xl mx-auto px-8 pt-16 relative z-10">
        {/* Title Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-mono tracking-tighter font-bold mb-3">
            Dashboard
          </h1>
          <p className="text-zinc-500 text-lg">
            {loading ? "AI is analyzing your inbox..." : "Manage and triage your emails with absolute control."}
          </p>
        </div>

        {/* Priority Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* High */}
          <div className="bg-[#141414] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-[#7f1d1d]/80 text-[#ef4444] rounded-lg flex items-center justify-center font-bold text-lg">
              {loading ? "..." : highCount}
            </div>
            <span className="text-lg font-medium">High</span>
          </div>
          {/* Medium */}
          <div className="bg-[#141414] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-[#7c2d12]/80 text-[#f59e0b] rounded-lg flex items-center justify-center font-bold text-lg">
              {loading ? "..." : mediumCount}
            </div>
            <span className="text-lg font-medium">Medium</span>
          </div>
          {/* Low */}
          <div className="bg-[#141414] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-[#064e3b]/80 text-[#10b981] rounded-lg flex items-center justify-center font-bold text-lg">
              {loading ? "..." : lowCount}
            </div>
            <span className="text-lg font-medium">Low</span>
          </div>
        </div>

        {/* Email List Section */}
        <div className="mb-6">
          <h2 className="text-zinc-400 font-medium mb-4">Recent High Priority Emails</h2>
          <div className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden min-h-[100px]">
            {loading ? (
              <div className="p-8 text-center text-zinc-600 animate-pulse">Running AI Classification...</div>
            ) : recentHighPriority.length > 0 ? (
              recentHighPriority.map((email: any, idx: number) => (
                <div 
                  key={email.id || idx} 
                  className={`flex items-center justify-between p-5 ${idx !== recentHighPriority.length - 1 ? 'border-b border-white/5' : ''} hover:bg-white/[0.02] transition-colors`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-[#7f1d1d]/40 text-[#ef4444]">
                      High
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{email.sender}</span>
                      <span className="text-zinc-500 line-clamp-1">{email.subject}</span>
                    </div>
                  </div>
                  <div className="text-zinc-500 text-sm whitespace-nowrap ml-4">{email.time}</div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center text-zinc-500">No high priority emails found.</div>
            )}
          </div>
        </div>

        {/* View All link */}
        <button 
          onClick={() => window.location.href = '/inbox'}
          className="flex items-center gap-2 text-blue-400/80 hover:text-blue-400 transition-colors text-sm font-medium"
        >
          View All 
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </main>
    </div>
  );
};

export default Dashboard;