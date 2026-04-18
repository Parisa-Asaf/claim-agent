"use client";
// src/components/FeatureCompany.tsx
// Member-3: Parisa Asaf (23101270) - THE COMPLETE MASTER BUILD

import { useState, useRef } from "react";
import type { CompanyApiResponse, CompanyResult } from "@/types";

interface Post {
  text: string;
  mediaName: string | null;
  timestamp: string;
}

export default function FeatureCompany() {
  const [role, setRole] = useState<"client" | "lawyer">("client");
  const [showProfile, setShowProfile] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CompanyResult[]>([]);
  const [selected, setSelected] = useState<CompanyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [addressCopied, setAddressCopied] = useState(false);
  
  // Posting State
  const [postText, setPostText] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  
  const mediaInputRef = useRef<HTMLInputElement>(null);

  const search = async () => {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    setSelected(null);
    try {
      const res = await fetch(`/api/company?q=${encodeURIComponent(q)}`);
      const data: CompanyApiResponse = await res.json();
      if (!data.success) throw new Error(data.error || "Search failed");
      setResults(data.results);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handlePostReach = () => {
    if (!postText && !selectedMedia) return;
    const newPost: Post = {
      text: postText,
      mediaName: selectedMedia ? selectedMedia.name : null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setPosts([newPost, ...posts]);
    setPostText("");
    setSelectedMedia(null);
    alert("Insight successfully added to your profile feed!");
  };

  return (
    <div className="relative feature-card bg-bg2 border border-border rounded-2xl overflow-hidden shadow-xl transition-all duration-500 min-h-[620px]">
      
      {/* ── FULL LAWYER PROFILE MODAL ── */}
      {showProfile && (
        <div className="absolute inset-0 z-50 bg-bg/95 backdrop-blur-md animate-in fade-in zoom-in duration-300 p-6 flex flex-col overflow-hidden">
          {/* Modal Header */}
          <div className="flex justify-between items-center mb-5">
            <span className="text-gold font-mono text-[10px] tracking-widest uppercase font-bold border-b border-gold/30 pb-1">Verified Practitioner</span>
            <button onClick={() => setShowProfile(false)} className="text-white/50 hover:text-danger text-xl transition-colors">✕</button>
          </div>
          
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
            {/* Identity Card */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gold/20 border-2 border-gold flex items-center justify-center text-3xl shadow-lg shadow-gold/10">🎓</div>
              <div>
                <h2 className="text-white text-xl font-bold">Adv. Parisa Asaf</h2>
                <p className="text-gold text-[10px] font-mono mt-1 uppercase tracking-tight">Supreme Court of Bangladesh</p>
                <p className="text-faint text-[9px] font-mono uppercase">Consumer Rights Division</p>
              </div>
            </div>

            {/* RESTORED: Professional Metrics Section */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-center">
                <div className="text-white font-bold text-lg leading-none">450+</div>
                <div className="text-[8px] text-faint uppercase mt-1">Total Cases</div>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-center">
                <div className="text-white font-bold text-lg leading-none">98%</div>
                <div className="text-[8px] text-faint uppercase mt-1">Win Rate</div>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-center">
                <div className="text-white font-bold text-lg leading-none">4.9</div>
                <div className="text-[8px] text-faint uppercase mt-1">Rating</div>
              </div>
            </div>

            {/* RESTORED: Biography Section */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
              <div className="text-[10px] text-gold font-bold mb-2 uppercase tracking-widest">Legal Bio</div>
              <p className="text-[11px] text-muted leading-relaxed italic">
                Specializing in E-commerce disputes and statutory compliance for consumer rights. Committed to providing direct legal access via digital-first evidence lockers.
              </p>
            </div>

            {/* Live Media Feed Section */}
            <div>
              <div className="text-[10px] font-mono text-faint uppercase tracking-widest mb-3 flex justify-between">
                <span>Recent Shared Insights</span>
                <span className="text-gold font-bold">{posts.length}</span>
              </div>
              
              {posts.length === 0 ? (
                <div className="py-8 text-center border border-dashed border-white/10 rounded-xl">
                  <p className="text-muted text-[10px]">Your shared legal tips and videos will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {posts.map((post, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3 animate-in slide-in-from-bottom-2 border-l-2 border-l-gold">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[9px] text-gold font-mono uppercase">Status Update</span>
                        <span className="text-[8px] text-faint font-mono">{post.timestamp}</span>
                      </div>
                      <p className="text-white text-[11px] leading-relaxed mb-3">{post.text}</p>
                      {post.mediaName && (
                        <div className="bg-black/40 rounded-lg p-2 flex items-center gap-2 border border-gold/10">
                          <span className="text-sm">🎞️</span>
                          <span className="text-[9px] text-gold font-mono truncate">{post.mediaName}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Modal CTA */}
          <button 
             onClick={() => {
                alert("🔐 SECURE GATEWAY INITIALIZED\n\nRedirecting to SSLCommerz...\n\n[System Note: This flow handles Firebase Auth session verification and escrow payment initialization.]");
             }}
             className="mt-5 w-full py-4 bg-gold text-bg font-bold rounded-xl text-sm shadow-xl active:scale-95 hover:brightness-110 transition-all uppercase tracking-widest"
          >
             Book Consultation
          </button>
        </div>
      )}

      <div className="h-0.5" style={{ background: role === "client" ? "linear-gradient(to right, var(--sky), transparent)" : "linear-gradient(to right, var(--gold), transparent)" }} />

      {/* ── HEADER ── */}
      <div className="p-6 border-b border-border">
        <div className="flex items-start justify-between">
          <div className="flex gap-4 cursor-pointer group" onClick={() => role === "lawyer" && setShowProfile(true)}>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-all ${role === "client" ? "bg-sky/10 border border-sky/20" : "bg-gold/10 border border-gold/20"}`}>
              {role === "client" ? "🏢" : "🎓"}
            </div>
            <div>
              <div className="font-mono text-[10px] text-faint tracking-widest mb-1 uppercase">Module 3 · {role === "client" ? "Consumer" : "Practitioner"}</div>
              <div className="text-base font-semibold tracking-tight text-white group-hover:text-gold transition-colors">{role === "client" ? "Intelligence & Dispatch" : "Adv. Parisa Asaf"}</div>
              <div className="font-mono text-[10px] text-faint mt-1 tracking-tight">{role === "lawyer" ? "Click to view Live Feed →" : "ID: 23101270 · Bangladesh"}</div>
            </div>
          </div>
          {(results.length > 0 || selected) && role === "client" && (
            <button onClick={() => {setQuery(""); setResults([]); setSelected(null);}} className="font-mono text-[10px] px-3 py-1.5 rounded-lg border border-danger/30 bg-danger/10 text-danger hover:bg-danger/20 transition-all uppercase tracking-tighter">🗑 Reset Search</button>
          )}
        </div>

        <div className="flex bg-bg/50 rounded-lg p-1 mt-6 border border-border/50 shadow-inner">
          <button onClick={() => {setRole("client"); setShowProfile(false);}} className={`flex-1 py-2 text-[10px] font-mono rounded-md transition-all ${role === "client" ? "bg-sky text-bg font-bold shadow-md" : "text-faint hover:text-white"}`}>CONSUMER MODE</button>
          <button onClick={() => {setRole("lawyer"); setShowProfile(false);}} className={`flex-1 py-2 text-[10px] font-mono rounded-md transition-all ${role === "lawyer" ? "bg-gold text-bg font-bold shadow-md" : "text-faint hover:text-white"}`}>LAWYER PORTAL</button>
        </div>
      </div>

      <div className="p-6 min-h-[400px]">
        {role === "client" ? (
          /* FULLY RESTORED CONSUMER VIEW */
          <div className="animate-in fade-in duration-500">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md mb-4 font-mono text-[10px] font-medium tracking-wider" style={{ background: "rgba(96,165,250,0.08)", color: "var(--sky)", border: "1px solid rgba(96,165,250,0.2)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" /> TRUST LEDGER ACTIVE
            </div>
            <div className="flex gap-2 mb-4">
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && search()} placeholder="Enter Company Name..." className="flex-1 bg-bg border border-border rounded-lg px-4 py-2.5 text-sm outline-none text-white focus:border-sky/50 transition-all" />
              <button onClick={search} disabled={loading} className="px-4 py-2.5 rounded-lg font-mono text-[11px] font-semibold bg-sky/15 text-sky border border-sky/30 hover:bg-sky/20 transition-all">{loading ? "..." : "SEARCH"}</button>
            </div>

            {selected ? (
              <div className="mt-2 p-4 rounded-xl border border-sky/20 bg-sky/5 animate-in slide-in-from-bottom-2 text-white shadow-2xl shadow-sky/5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="font-semibold text-sm truncate max-w-[180px]">{selected.name}</div>
                    <div className="text-[10px] text-muted leading-tight mt-1 truncate max-w-[200px]">{selected.address}</div>
                  </div>
                  <button onClick={() => {navigator.clipboard.writeText(selected.address); setAddressCopied(true); setTimeout(()=>setAddressCopied(false), 2000)}} className="text-[9px] font-mono text-sky underline hover:text-white transition-colors uppercase tracking-widest">{addressCopied ? "COPIED" : "COPY INFO"}</button>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button className="py-2.5 bg-sky text-bg text-[10px] font-bold rounded-lg font-mono tracking-widest hover:brightness-110 active:scale-95 transition-all">📧 EMAIL NOTICE</button>
                  <button className="py-2.5 border border-sky/30 text-sky text-[10px] font-bold rounded-lg font-mono tracking-widest hover:bg-sky/10 active:scale-95 transition-all">📱 SMS DISPATCH</button>
                </div>
                <div className="pt-4 border-t border-border/40">
                  <div className="flex justify-between text-[9px] font-mono mb-2 uppercase tracking-widest text-faint">
                    <span>Deadline Countdown</span>
                    <span className="text-red-500 font-bold animate-pulse">14 Days Window</span>
                  </div>
                  <div className="w-full bg-border/40 h-1 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 shadow-lg shadow-red-500/50" style={{ width: '90%' }} />
                  </div>
                </div>
              </div>
            ) : results.length > 0 && (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {results.map((c, i) => (
                  <div key={i} onClick={() => setSelected(c)} className="flex justify-between items-center p-3 bg-bg border border-border rounded-lg cursor-pointer hover:border-sky/50 text-white transition-all group">
                    <div className="text-sm font-semibold group-hover:text-sky transition-colors truncate max-w-[200px]">{c.name}</div>
                    <div className="text-[10px] font-mono text-sky font-bold tracking-widest">VERIFY →</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* LAWYER FEED CREATION VIEW */
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-5">
            <div className="bg-bg/40 border border-border rounded-xl p-4 shadow-inner">
              <span className="text-[10px] font-mono text-faint uppercase tracking-widest mb-3 block">Share Public Case Insight</span>
              <textarea 
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder="Write a tip or explain a recent win..." 
                className="w-full bg-bg border border-border rounded-lg p-3 text-xs text-white outline-none focus:border-gold/50 h-24 resize-none transition-all placeholder:text-muted/50 shadow-inner" 
              />
              
              {selectedMedia && (
                <div className="mt-3 p-2 bg-gold/5 border border-gold/20 rounded-lg flex items-center justify-between animate-in zoom-in">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-8 h-8 bg-gold/20 rounded flex items-center justify-center text-lg shadow-md">📽️</div>
                    <div className="text-[9px] font-mono text-gold truncate max-w-[150px]">{selectedMedia.name}</div>
                  </div>
                  <button onClick={() => setSelectedMedia(null)} className="text-danger font-bold px-2 hover:scale-125 transition-transform">✕</button>
                </div>
              )}

              <div className="flex justify-between items-center mt-4">
                <input type="file" ref={mediaInputRef} onChange={(e) => e.target.files && setSelectedMedia(e.target.files[0])} className="hidden" accept="video/*,image/*" />
                <button onClick={() => mediaInputRef.current?.click()} className="text-[10px] font-mono text-muted hover:text-gold flex items-center gap-1.5 transition-colors">📸 ATTACH MEDIA</button>
                <button onClick={handlePostReach} className="px-5 py-2 bg-gold text-bg text-[10px] font-bold rounded-lg font-mono shadow-lg shadow-gold/10 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest">Post</button>
              </div>
            </div>

            <div className="p-4 bg-bg border border-border rounded-xl border-l-4 border-l-gold shadow-lg">
               <div className="text-[9px] font-mono text-gold font-bold mb-1 uppercase tracking-widest">Active Leads Queue</div>
               <div className="text-sm font-bold text-white mb-1">bKash Dispute - ID #9921</div>
               <p className="text-[10px] text-muted leading-tight mb-3">Consumer waiting for verification help. Check profile to engage.</p>
               <button onClick={() => setShowProfile(true)} className="w-full py-2 bg-white/5 text-white/70 text-[10px] font-mono rounded-lg border border-white/10 hover:bg-gold/10 hover:text-gold transition-all">VIEW LIVE PROFILE FEED</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}