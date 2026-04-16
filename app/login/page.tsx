"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { auth } from "@/lib/firebase"; 
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // The 16-character spaced regex you requested
  const APP_PASSWORD_REGEX = /^[a-z]{4}\s[a-z]{4}\s[a-z]{4}\s[a-z]{4}$/;

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter both credentials.");
      return;
    }

    // Regex check for the specific App Password format
    if (!APP_PASSWORD_REGEX.test(password)) {
      setError("Invalid format. Use: qzvk qjlk ptld xmob");
      return;
    }

    setLoading(true);

    try {
      Cookies.set("user_email", email, { expires: 7 });
      Cookies.set("user_pass", password, { expires: 7 });

      // Handshake check with backend
      const response = await fetch("/api/emails", { cache: 'no-store' });
      
      if (response.ok) {
        router.push("/dashboard");
      } else {
        const result = await response.json();
        Cookies.remove("user_email");
        Cookies.remove("user_pass");
        setError(result.error || "Invalid Credentials. Check App Password.");
      }
    } catch (err) {
      setError("AI Engine Offline. Ensure FastAPI is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (result.user.email) {
        setEmail(result.user.email);
        setError("Google Authenticated. Now enter your App Password below.");
      }
    } catch (err) {
      setError("Google Sign-In failed.");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-green-500/30">
      {/* NAVBAR */}
      <nav className="w-full border-b border-white/5">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between px-8 py-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#10b981] rounded-lg flex items-center justify-center text-black font-bold text-xl">
              ⌘
            </div>
            <span className="text-white text-xl font-medium tracking-tight font-mono">
              Automailer
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button className="px-5 py-2 rounded-lg bg-[#1f1f1f] text-[#a1a1a1] text-sm font-medium hover:bg-[#2a2a2a] transition-colors">
              Sign In
            </button>
            <button className="px-5 py-2 rounded-lg bg-[#e5e5e5] text-black text-sm font-bold hover:bg-white transition-colors">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* MAIN LOGIN CONTENT */}
      <div className="flex flex-col items-center justify-center mt-20 px-4">
        <div className="w-full max-w-[440px]">
          <h1 className="text-[32px] font-bold text-center mb-8 tracking-tight">
            Log in Goose
          </h1>

          {/* Error Message */}
          {error && (
            <div className={`mb-4 p-3 rounded-xl text-center text-xs font-bold border ${
              error.includes("Google") ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "bg-red-500/10 border-red-500/20 text-red-500"
            }`}>
              {error}
            </div>
          )}

          <div className="space-y-3">
            {/* Email Input */}
            <div className="bg-[#2d2a2a] border border-white/5 rounded-xl px-4 py-4 flex items-center gap-4">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-gray-400 text-sm min-w-[50px]">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="bg-transparent outline-none w-full text-sm text-gray-200 placeholder:text-gray-600"
              />
            </div>

            {/* Password Input */}
            <div className="bg-[#2d2a2a] border border-white/5 rounded-xl px-4 py-4 flex items-center gap-4">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-gray-400 text-sm min-w-[50px]">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="qzvk qjlk ktld xmob"
                className="bg-transparent outline-none w-full text-sm text-gray-200 placeholder:text-gray-600"
              />
            </div>

            {/* Phone Input */}
            <div className="bg-[#2d2a2a] border border-white/5 rounded-xl px-4 py-4 flex items-center gap-4">
              <div className="flex items-center gap-2 pr-2 border-r border-white/10">
                <span className="text-lg">🇮🇳</span>
                <span className="text-sm font-medium text-gray-300">+91</span>
                <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Enter phone number"
                className="bg-transparent outline-none w-full text-sm text-gray-200 placeholder:text-gray-600"
              />
            </div>

            {/* Login Button */}
            <button 
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-4 mt-2 rounded-xl bg-[#23864f] hover:bg-[#2ea05d] transition-all font-semibold text-lg disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Log In"}
            </button>

            {/* Forgot Link */}
            <div className="text-center py-2">
              <button className="text-sm text-[#10b981] hover:brightness-125 transition-all">
                Forgot password?
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-[1px] bg-white/10" />
              <span className="text-xs text-gray-500 font-medium uppercase tracking-widest">or</span>
              <div className="flex-1 h-[1px] bg-white/10" />
            </div>

            {/* Google Button */}
            <button 
              onClick={handleGoogleLogin}
              className="w-full py-3 rounded-xl bg-[#cecece] text-[#1a1a1a] flex items-center justify-center gap-3 hover:bg-[#d4d4d4] transition-all font-bold"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign up with Google
            </button>

            {/* NEW FOOTER TEXT */}
            <p className="text-center text-sm text-gray-500 pt-4">
              Don't have an account?{" "}
              <span className="text-[#10b981] font-medium">
                No worries just login with ur mail credentials
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}