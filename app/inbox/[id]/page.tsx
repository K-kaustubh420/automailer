"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/app/components/navbar";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

const TriagePage = () => {
  const { id } = useParams();
  const router = useRouter();

  // --- STATE ---
  const [email, setEmail] = useState<any>(null);
  const [teamEmails, setTeamEmails] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [customMail, setCustomMail] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const teams = [
    "Engineering",
    "Product Team",
    "Finance",
    "Customer Support",
    "Cybersecurity",
    "HR",
    "Legal",
  ];

  // --- 1. SUGGESTION LOGIC ---
  // This maps the AI Category to a specific internal team
const getSuggestedTeam = (category: string) => {
  const cat = category?.toLowerCase().trim() || "";

  // Define high-priority keywords for each team
  // Order matters: More specific terms should be checked thoroughly
  const TEAM_MAP: { [key: string]: string[] } = {
    "Finance": [
      "billing", "payment", "refund", "invoice", "charge", "transaction", 
      "price", "cost", "subscription", "credit card", "money", "checkout"
    ],
    "Engineering": [
      "bug", "crash", "error", "performance", "slow", "lag", "api", 
      "integration", "broken", "failure", "timeout", "frontend", "backend", "code"
    ],
    "Cybersecurity": [
      "security", "hack", "breach", "unauthorized", "suspicious", "phishing", 
      "vulnerability", "leak", "threat", "compromised"
    ],
    "Product Team": [
      "feature", "suggestion", "improvement", "request", "roadmap", "idea", 
      "functionality", "ux", "ui", "feedback"
    ],
    "HR": [
      "wellness", "hiring", "job", "interview", "leave", "employee", 
      "salary", "benefits", "recruitment"
    ],
    "Legal": [
      "terms", "privacy", "compliance", "contract", "gdpr", "policy", "legal"
    ],
    "Customer Support": [
      "help", "how to", "question", "support", "login", "access", "account", 
      "assistance", "cannot", "issue", "problem"
    ]
  };

  // 1. First, check for an EXACT match (Highest accuracy)
  for (const [team, keywords] of Object.entries(TEAM_MAP)) {
    if (keywords.includes(cat)) return team;
  }

  // 2. Check for "High Intent" categories first (Finance & Security)
  // We do this so "Billing Support" goes to Finance, not Support.
  const highIntentTeams = ["Finance", "Cybersecurity", "Engineering"];
  for (const team of highIntentTeams) {
    if (TEAM_MAP[team].some(keyword => cat.includes(keyword))) {
      return team;
    }
  }

  // 3. General keyword check for the rest
  for (const [team, keywords] of Object.entries(TEAM_MAP)) {
    if (keywords.some(keyword => cat.includes(keyword))) {
      return team;
    }
  }

  // 4. Ultimate Fallback
  return "Customer Support";
};

  // --- 2. DATA INITIALIZATION ---
  useEffect(() => {
    async function loadData() {
      try {
        // Fetch specific email from our Next.js API Bridge
        const res = await fetch("/api/emails");
        const data = await res.json();
        const found = data.find((e: any) => e.id === id);
        setEmail(found);

        // Fetch routing emails from Firebase Settings
        const docSnap = await getDoc(doc(db, "settings", "routing"));
        if (docSnap.exists()) setTeamEmails(docSnap.data());
      } catch (err) {
        console.error("Triage Load Error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    const handleClickOutside = (e: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsAssigning(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [id]);

  // --- 3. DISPATCH LOGIC (NODEMAILER) ---
  const dispatchEmail = async (target: string, type: string, mailBody: string, mailSubject: string) => {
    if (!target || !target.includes("@")) {
      alert("Error: Destination email is invalid or unconfigured.");
      return;
    }

    setProcessing(type);
    try {
      const response = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: target, subject: mailSubject, body: mailBody }),
      });

      if (response.ok) {
        alert(`SUCCESS: Triage dispatch completed to ${target}`);
        if (type === "custom") setCustomMail("");
      } else {
        alert("FAIL: SMTP Authentication failed. Check your App Password.");
      }
    } catch (err) {
      alert("NETWORK ERROR: Backend unreachable.");
    } finally {
      setProcessing(null);
      setIsAssigning(false);
    }
  };

  // --- 4. BUTTON HANDLERS ---
  const onAssign = (team: string) => {
    const target = teamEmails[team];
    const body = `AI TRIAGE TICKET\nPriority: ${email.priority}\nCategory: ${email.primary_category}\nSummary: ${email.summary}\n\nOriginal Content:\n${email.body}`;
    dispatchEmail(target, "assigning", body, `[TRIAGE-${team.toUpperCase()}] ${email.subject}`);
  };

  const onAutoReply = () => {
    const body = `Hi there,\n\nOur AI has triaged your request regarding "${email.primary_category}". It has been routed to our ${getSuggestedTeam(email.primary_category)} team for resolution.\n\nBest,\nAutomailer AI Team`;
    dispatchEmail(email.sender, "replying", body, `Re: ${email.subject}`);
  };

  const onCustomSend = () => {
    const body = `FORWARDED TRIAGE TICKET\n\n${email.body}`;
    dispatchEmail(customMail, "custom", body, `FW: ${email.subject}`);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin" />
      <p className="font-mono text-green-500 tracking-widest text-xs uppercase">Executing Neural Analysis</p>
    </div>
  );

  if (!email) return <div className="p-20 text-white text-center">404: Analysis Node Offline</div>;

  const suggested = getSuggestedTeam(email.primary_category);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-green-500/30">
      <Navbar />

      <main className="max-w-7xl mx-auto px-8 py-12 relative z-10">
        <button onClick={() => router.back()} className="mb-8 text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-sm">
          ← Back to Feed
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-16">
          
          {/* LEFT: EMAIL CONTENT */}
          <div className="space-y-10">
            <h1 className="text-5xl font-bold tracking-tight leading-tight">{email.subject}</h1>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/20">
                {email.sender?.[0] || "?"}
              </div>
              <div>
                <h3 className="text-zinc-200 font-semibold italic">{email.sender}</h3>
                <p className="text-zinc-500 text-sm">Processed by Triage Engine v1.0</p>
              </div>
            </div>

            <div className="bg-[#111111] border border-white/5 rounded-[32px] p-10 space-y-10 shadow-2xl">
              <div className="whitespace-pre-wrap text-zinc-400 leading-relaxed font-light text-[16px] min-h-[350px]">
                {email.body}
              </div>

              {/* ACTION BUTTONS (As Required) */}
              <div className="flex flex-wrap items-center gap-4 pt-10 border-t border-white/5">
                
                {/* 1. ASSIGN DROPDOWN */}
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsAssigning(!isAssigning)}
                    className="h-12 px-8 bg-[#164e33] hover:bg-[#1e6342] text-[#4ade80] rounded-xl font-bold flex items-center gap-3 transition-all active:scale-95"
                  >
                    {processing === "assigning" ? "Dispatching..." : "Assign"}
                    <span className="text-[10px] opacity-60">▼</span>
                  </button>
                  
                  {isAssigning && (
                    <div className="absolute bottom-full mb-3 left-0 w-60 bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl">
                      <div className="px-4 py-2 bg-black/20 text-[9px] font-black text-zinc-600 uppercase tracking-widest">Select Recipient Team</div>
                      {teams.map(team => (
                        <button 
                          key={team} 
                          onClick={() => onAssign(team)}
                          className="w-full text-left px-5 py-3.5 text-sm hover:bg-white/5 border-b border-white/5 flex justify-between items-center transition-colors group"
                        >
                          <span className={team === suggested ? "text-green-400 font-bold" : "text-zinc-400"}>{team}</span>
                          {team === suggested && <span className="text-[9px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded border border-green-500/20">SUGGESTED</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. AUTO REPLY */}
                <button 
                  onClick={onAutoReply}
                  disabled={!!processing}
                  className="h-12 px-8 bg-[#141414] border border-white/10 text-white rounded-xl font-bold hover:bg-white/5 transition-all disabled:opacity-50"
                >
                  {processing === "replying" ? "Sending..." : "Send Autogenerated Reply"}
                </button>

                {/* 3. CUSTOM MAIL DISPATCH */}
                <div className="flex items-center gap-2 bg-[#1a1a1a] border border-white/10 p-1 rounded-xl focus-within:border-green-500/50 transition-colors">
                  <input 
                    type="email" 
                    placeholder="Custom recipient..." 
                    value={customMail}
                    onChange={(e) => setCustomMail(e.target.value)}
                    className="bg-transparent px-4 outline-none text-sm w-48 text-zinc-300 placeholder:text-zinc-700"
                  />
                  <button 
                    onClick={onCustomSend}
                    disabled={!!processing}
                    className="bg-[#10b981] text-black h-10 px-5 rounded-lg font-bold hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {processing === "custom" ? "..." : "Send Ticket"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: AI ANALYSIS SIDEBAR */}
          <div className="lg:border-l lg:border-white/5 lg:pl-12 space-y-8">
            <h2 className="text-xl font-mono tracking-tighter font-bold text-zinc-100 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Triage Analysis
            </h2>

            <div className="bg-[#111111] border border-white/5 rounded-[32px] p-8 space-y-8">
              
              {/* PRIORITY BOX */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Calculated Priority</span>
                <div className={`w-full py-4 rounded-2xl text-center font-bold tracking-[0.2em] text-xs border ${
                  email.priority === 'High' 
                  ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                  : email.priority === 'Medium' 
                  ? 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                  : 'bg-green-500/10 text-green-500 border-green-500/20'
                }`}>
                  {email.priority || "PENDING"} PRIORITY
                </div>
              </div>

              {/* STATS GRID */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                   <p className="text-[9px] text-zinc-500 uppercase mb-1">Certainty</p>
                   <p className="text-xl font-bold">{(email.confidence * 100 || 0).toFixed(0)}%</p>
                </div>
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                   <p className="text-[9px] text-zinc-500 uppercase mb-1">Top Class</p>
                   <p className="text-sm font-bold truncate">{email.primary_category || "Unsorted"}</p>
                </div>
              </div>

              {/* MUSTARD SUMMARY CARD */}
              <div className="bg-[#b49447] rounded-[28px] p-6 text-black relative overflow-hidden">
                <div className="flex items-center gap-2 mb-4 opacity-70">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  <span className="text-[10px] font-black uppercase tracking-widest">AI Summary Insight</span>
                </div>

                <p className="font-bold text-xl leading-tight mb-6">
                  {email.summary || "Synthesizing intent..."}
                </p>

                <div className="bg-black/10 backdrop-blur-sm rounded-2xl p-4 border border-black/5">
                  <p className="text-[9px] font-black uppercase mb-1 opacity-50">Route Recommendation</p>
                  <p className="text-sm font-bold leading-snug">
                    Suggested dispatch to <span className="underline decoration-2">{suggested}</span>. 
                    Target: <span className="opacity-70">{teamEmails[suggested] || "unconfigured"}</span>
                  </p>
                </div>
              </div>

              {/* LABEL CLOUD */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Detected Intents</span>
                <div className="flex flex-wrap gap-2">
                  {email.labels?.map((l: any, i: number) => (
                    <div key={i} className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg text-xs font-medium text-zinc-300">
                      {l.label} <span className="opacity-40 ml-1">{l.confidence}%</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TriagePage;