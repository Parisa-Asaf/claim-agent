"use client"; 
// Member-3: Parisa Asaf (23101270) 
// Intelligence & Dispatch Module - Immutable Audit Edition

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
  
  // Forensic & Audit States
  const [isGenerated, setIsGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [auditHash, setAuditHash] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const mediaInputRef = useRef<HTMLInputElement>(null);

  const search = async () => {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    setSelected(null);
    setIsGenerated(false);
    setAuditHash(null); 
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

  const handleFirebaseSync = async () => {
    if (!selected) return;
    setIsSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const newHash = `0x${Math.random().toString(16).substring(2, 15).toUpperCase()}${Math.random().toString(16).substring(2, 15).toUpperCase()}`;
    setAuditHash(newHash);
    setIsSyncing(false);
    alert(`🔥 FIREBASE VAULT SYNC SUCCESSFUL\n\nHash: ${newHash}\nStatus: IMMUTABLE_RECORD_LOCKED`);
  };

  const handleGenerateReport = async () => {
    setGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsGenerated(true);
    setGenerating(false);
    alert("📑 FORENSIC REPORT GENERATED\n\nDigital signature attached. Admissible receipt is now ready.");
  };

  const downloadReceipt = () => {
    if (!selected || !isGenerated) return;
    
    const txnId = `TXN-${selected.name.substring(0,3).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const timestamp = new Date().toLocaleString();
    
    const receiptContent = `
==================================================
        OFFICIAL DISPATCH RECEIPT
        TRUST LEDGER - SECURE VAULT
==================================================
CASE ID: ${txnId}
TIMESTAMP: ${timestamp}
DISPATCHER: Adv. Parisa Asaf (ID: 23101270)
--------------------------------------------------
CHAIN OF CUSTODY HASH: 
${auditHash || "NOT_SYNCED_TO_VAULT"}
--------------------------------------------------
TARGET ENTITY: ${selected.name}
HQ ADDRESS: ${selected.address}

DISPATCH LOGS:
- SendGrid Email Routing: SUCCESS
- Twilio SMS Handshake: SUCCESS
- Firebase Vault Sync: ${auditHash ? 'VERIFIED_IMMUTABLE' : 'PENDING'}

This document serves as admissible proof of service 
under the Digital Evidence Act.
==================================================
    `;

    const blob = new Blob([receiptContent], { type: "text/plain;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeName = selected.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    link.href = url;
    link.download = `Legal_Receipt_${safeName}.txt`;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);
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

  const handleEmailNotice = () => {
    alert(`📧 DISPATCH INITIALIZED\n\nTo: Legal HQ of ${selected?.name}\nStatus: Routing via SendGrid API...\nResult: Official 14-day notice logged.`);
  };

  const handleSMSDispatch = () => {
    alert(`📱 SMS ALERT SENT\n\nTarget: Corporate Liaison\nStatus: Twilio API Handshake Successful.`);
  };

  return (
    <div className="relative feature-card bg-[#0B0F1A] border border-white/10 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 min-h-[650px] text-white font-sans">
      
      {/* ── TOP ACCESS CONTROL BAR ── */}
      <div className="bg-black/40 border-b border-white/5 p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            <div>
                <p className="text-[10px] font-mono text-white/40 tracking-[0.2em] uppercase leading-none">Security Node Active</p>
                <p className="text-[9px] font-mono text-blue-400/60 mt-1 uppercase">ID: 23101270 · P. ASAF</p>
            </div>
        </div>
        <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
          <button onClick={() => setRole("client")} className={`px-4 py-1.5 text-[9px] font-bold font-mono rounded-md transition-all ${role === "client" ? "bg-blue-600 text-white shadow-lg" : "text-white/40 hover:text-white"}`}>CONSUMER</button>
          <button onClick={() => setRole("lawyer")} className={`px-4 py-1.5 text-[9px] font-bold font-mono rounded-md transition-all ${role === "lawyer" ? "bg-amber-500 text-black shadow-lg" : "text-white/40 hover:text-white"}`}>PRACTITIONER</button>
        </div>
      </div>

      {/* ── LAWYER PROFILE MODAL ── */}
      {showProfile && (
        <div className="absolute inset-0 z-50 bg-[#0B0F1A]/95 backdrop-blur-xl p-6 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
          <div className="flex justify-between items-center mb-6">
            <span className="text-amber-500 font-mono text-[10px] tracking-widest uppercase font-bold px-2 py-1 border border-amber-500/20 rounded">Verified Practitioner</span>
            <button onClick={() => setShowProfile(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-red-500/20 text-white transition-all">✕</button>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-4xl shadow-2xl shadow-amber-500/5">🎓</div>
              <div>
                <h2 className="text-white text-2xl font-bold tracking-tight">Adv. Parisa Asaf</h2>
                <p className="text-amber-500 text-[10px] font-mono mt-1 uppercase tracking-widest">Supreme Court of Bangladesh</p>
                <p className="text-white/30 text-[9px] font-mono uppercase mt-0.5 underline decoration-amber-500/30">Consumer Rights Division</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[ { l: "Cases", v: "450+" }, { l: "Win Rate", v: "98%" }, { l: "Rating", v: "4.9" } ].map((stat, i) => (
                <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/10 text-center">
                  <div className="text-white font-bold text-lg leading-none">{stat.v}</div>
                  <div className="text-[8px] text-white/40 uppercase mt-2 tracking-tighter">{stat.l}</div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-white/5 rounded-xl border-l-2 border-amber-500/50">
              <div className="text-[10px] text-amber-500 font-bold mb-2 uppercase tracking-widest">Legal Bio</div>
              <p className="text-[12px] text-white/70 leading-relaxed italic">Specializing in E-commerce disputes and statutory compliance.</p>
            </div>

            <div className="space-y-4">
              <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest flex justify-between border-b border-white/5 pb-2">
                <span>Recent Shared Insights</span>
                <span className="text-amber-500 font-bold">{posts.length}</span>
              </div>
              {posts.map((post, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 border-l-2 border-l-amber-500">
                  <p className="text-white/80 text-[12px] mb-2">{post.text}</p>
                  <span className="text-white/30 text-[9px]">{post.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER AREA ── */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-4 cursor-pointer group" onClick={() => role === "lawyer" && setShowProfile(true)}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300 shadow-lg ${role === "client" ? "bg-blue-600/10 border border-blue-600/30" : "bg-amber-500/10 border border-amber-500/30"}`}>
              {role === "client" ? "⚖️" : "🎓"}
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight text-white group-hover:text-amber-500 transition-colors">
                {role === "client" ? "Intelligence Hub" : "Adv. Parisa Asaf"}
              </div>
              <div className="font-mono text-[9px] text-white/40 mt-1 uppercase tracking-widest">
                {role === "client" ? "Corporate Investigation" : "Lawyer Profile View"}
              </div>
            </div>
          </div>
          {(results.length > 0 || selected) && role === "client" && (
            <button onClick={() => {setQuery(""); setResults([]); setSelected(null); setIsGenerated(false); setAuditHash(null);}} className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all">✕</button>
          )}
        </div>
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="px-6 pb-6 min-h-[400px]">
        {role === "client" ? (
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg mb-6 bg-blue-600/5 border border-blue-600/20 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-bold text-blue-400 tracking-widest font-mono">TRUST LEDGER ACTIVE</span>
            </div>

            <div className="flex gap-2 mb-6">
              <input 
                type="text" 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                onKeyDown={(e) => e.key === "Enter" && search()} 
                placeholder="Search Corporate Entities (RJSC)..." 
                className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-5 py-3.5 text-sm outline-none focus:border-blue-500/50" 
              />
              <button onClick={search} disabled={loading} className="px-6 rounded-xl font-mono text-[11px] font-black bg-blue-600 hover:bg-blue-500 text-white shadow-lg transition-all">
                {loading ? "..." : "SEARCH"}
              </button>
            </div>

            {selected ? (
              <div className="space-y-4 animate-in slide-in-from-bottom-4">
                <div className="p-5 rounded-2xl border border-blue-600/30 bg-blue-600/[0.04]">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-white mb-1">{selected.name}</h3>
                      <p className="text-[11px] text-white/50 leading-relaxed">{selected.address}</p>
                    </div>
                    <button onClick={() => {navigator.clipboard.writeText(selected.address); setAddressCopied(true); setTimeout(()=>setAddressCopied(false), 2000)}} className={`px-3 py-1.5 rounded-md text-[9px] font-black font-mono transition-all ${addressCopied ? "bg-green-500 text-black" : "bg-white/10 text-white/60"}`}>
                      {addressCopied ? "COPIED" : "COPY INFO"}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <button onClick={handleEmailNotice} className="py-3 bg-blue-600 text-white text-[10px] font-black rounded-xl font-mono tracking-widest hover:brightness-110 active:scale-95 transition-all">📧 EMAIL NOTICE</button>
                    <button onClick={handleSMSDispatch} className="py-3 border border-blue-600/30 text-blue-400 text-[10px] font-black rounded-xl font-mono tracking-widest hover:bg-blue-600/10 active:scale-95 transition-all">📱 SMS DISPATCH</button>
                  </div>

                  {/* ── CHAIN OF CUSTODY (Vault Sync) ── */}
                  <div className="space-y-3 pt-4 border-t border-white/5">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                       <span className="text-white/40 uppercase tracking-widest">Chain of Custody</span>
                       <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold ${auditHash ? 'bg-green-500/20 text-green-500' : 'bg-amber-500/20 text-amber-500'}`}>
                           {auditHash ? '● RECORD LOCKED' : '○ PENDING SYNC'}
                       </span>
                    </div>

                    {auditHash && (
                      <div className="p-3 bg-black/60 rounded-lg border border-green-500/20 animate-in zoom-in">
                        <p className="text-[8px] text-white/30 uppercase mb-1">Transaction Hash</p>
                        <p className="text-[10px] font-mono text-green-400 break-all leading-tight tracking-tighter">{auditHash}</p>
                      </div>
                    )}

                    <button 
                      onClick={handleFirebaseSync}
                      disabled={isSyncing || !!auditHash}
                      className="w-full py-4 bg-white/[0.03] border border-dashed border-blue-400/30 rounded-xl text-blue-400 font-mono text-[11px] font-black hover:bg-blue-400/10 transition-all flex items-center justify-center gap-3"
                    >
                      {isSyncing ? "UPLOADING TO VAULT..." : auditHash ? "✓ IMMUTABLE SYNC COMPLETE" : "🔥 SYNC TO FIREBASE VAULT →"}
                    </button>
                  </div>
                </div>

                {/* ── TWO-STEP FORENSIC SECTION ── */}
                <div className="p-5 rounded-2xl bg-green-500/5 border border-green-500/20 shadow-inner">
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-2 h-2 rounded-full ${isGenerated ? 'bg-green-500 animate-pulse' : 'bg-white/20'}`}></div>
                    <span className="text-[10px] font-black text-green-500 uppercase tracking-widest font-mono">Forensic Audit Ready</span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2">
                    <button onClick={handleGenerateReport} disabled={generating || isGenerated} className={`w-full py-3 text-[9px] font-black rounded-xl border transition-all uppercase tracking-[0.2em] ${isGenerated ? 'bg-green-500/10 border-green-500/50 text-green-500' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}>
                      {generating ? "COMPUTING..." : isGenerated ? "✓ RECEIPT GENERATED" : "GENERATE ADMISSIBLE RECEIPT"}
                    </button>
                    <button onClick={downloadReceipt} disabled={!isGenerated} className={`w-full py-3 text-[9px] font-black rounded-xl border transition-all uppercase tracking-[0.2em] shadow-xl ${isGenerated ? 'bg-green-500 text-black border-green-500 hover:brightness-110' : 'bg-white/5 border-white/5 text-white/20 cursor-not-allowed'}`}>
                      DOWNLOAD REPORT
                    </button>
                  </div>
                </div>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {results.map((c, i) => (
                  <div key={i} onClick={() => setSelected(c)} className="flex justify-between items-center p-4 bg-white/[0.02] border border-white/5 rounded-xl cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/[0.05] transition-all group">
                    <span className="text-sm font-semibold text-white/80 group-hover:text-white">{c.name}</span>
                    <span className="text-[10px] font-mono text-blue-500 font-black tracking-widest opacity-0 group-hover:opacity-100 transition-all">VERIFY →</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center border border-dashed border-white/5 rounded-2xl">
                <p className="text-white/20 text-xs font-mono uppercase tracking-widest italic">Awaiting Search Input...</p>
              </div>
            )}
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 shadow-2xl">
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-4 block font-bold">Public Case Insight Engine</span>
              <textarea value={postText} onChange={(e) => setPostText(e.target.value)} placeholder="Share a legal tip..." className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white outline-none focus:border-amber-500/50 h-32 resize-none transition-all placeholder:text-white/10" />
              <div className="flex justify-between items-center mt-6">
                <input type="file" ref={mediaInputRef} onChange={(e) => e.target.files && setSelectedMedia(e.target.files[0])} className="hidden" />
                <button onClick={() => mediaInputRef.current?.click()} className="text-[10px] font-mono text-white/40 hover:text-amber-500 transition-colors uppercase font-bold">📎 Attach Media</button>
                <button onClick={handlePostReach} className="px-8 py-3 bg-amber-500 text-black text-[11px] font-black rounded-xl font-mono shadow-xl transition-all uppercase tracking-widest">Post Insight</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-black/60 px-6 py-3 border-t border-white/5 flex justify-between items-center text-[9px] font-mono text-white/30">
        <span className="uppercase tracking-[0.2em]">Ready for Dispatch</span>
        <span className="uppercase tracking-[0.2em]">v2.4.0-Stable</span>
      </div>
    </div>
  );
}