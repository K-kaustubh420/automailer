"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/app/components/navbar";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const departments = ["Engineering", "Product Team", "Finance", "Customer Support", "Cybersecurity", "HR"];

export default function SettingsPage() {
  const [teamEmails, setTeamEmails] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load existing mappings from Firebase
  useEffect(() => {
    async function loadConfig() {
      try {
        const docRef = doc(db, "settings", "routing");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setTeamEmails(docSnap.data());
        }
      } catch (e) {
        console.error("Firebase load error:", e);
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "routing"), teamEmails);
      alert("Success: Routing configuration synced to Cloud.");
    } catch (e) {
      alert("Error: Could not save settings. Check Firebase Rules.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <Navbar />
      <main className="max-w-3xl mx-auto px-8 py-16">
        <header className="mb-10">
          <h1 className="text-4xl font-mono tracking-tighter font-bold mb-2">Team Routing</h1>
          <p className="text-zinc-500 text-sm">Configure destination emails for AI-triaged tickets.</p>
        </header>

        <div className="bg-[#111111] border border-white/5 rounded-2xl p-8 space-y-6 shadow-2xl">
          {loading ? (
            <div className="py-20 text-center animate-pulse text-zinc-600">Loading Configuration...</div>
          ) : (
            <>
              {departments.map((dept) => (
                <div key={dept} className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">{dept} Email</label>
                  <input 
                    type="email"
                    placeholder={`e.g. ${dept.toLowerCase().replace(' ', '')}@company.com`}
                    value={teamEmails[dept] || ""}
                    onChange={(e) => setTeamEmails({...teamEmails, [dept]: e.target.value})}
                    className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 outline-none focus:border-green-500 transition-all text-sm text-zinc-200 placeholder:text-zinc-700"
                  />
                </div>
              ))}

              <button 
                onClick={handleSave}
                disabled={saving}
                className="w-full py-4 bg-[#10b981] text-black font-bold rounded-xl hover:bg-[#059669] transition-all mt-4 disabled:opacity-50"
              >
                {saving ? "Saving to Cloud..." : "Save Configuration"}
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}