"use client";
// src/components/FeatureRBAC.tsx
// Feature 3: Role-Based Access Control — Member: Raj Rohit Nath (22201126)

import { useState } from "react";

type Role = "ADMIN" | "LEGAL_EXPERT" | "VIEWER";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  assignedBy: string | null;
  createdAt: string;
}

const ROLE_STYLES: Record<Role, { bg: string; color: string; border: string }> = {
  ADMIN:        { bg: "rgba(248,113,113,0.1)",  color: "#f87171", border: "rgba(248,113,113,0.3)"  },
  LEGAL_EXPERT: { bg: "rgba(251,191,36,0.1)",   color: "#fbbf24", border: "rgba(251,191,36,0.3)"   },
  VIEWER:       { bg: "rgba(74,222,128,0.1)",   color: "#4ade80", border: "rgba(74,222,128,0.3)"   },
};

export default function FeatureRBAC() {
  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [role, setRole]           = useState<Role>("LEGAL_EXPERT");
  const [loading, setLoading]     = useState(false);
  const [users, setUsers]         = useState<User[]>([]);
  const [result, setResult]       = useState<User | null>(null);
  const [error, setError]         = useState<string | null>(null);

  const createUser = async () => {
    if (!name || !email) { setError("Name and email are required"); return; }
    setLoading(true); setError(null); setResult(null);

    try {
      const res = await fetch("/api/rbac", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role, assignedBy: "Admin" }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setResult(data.data);
      setName(""); setEmail("");
      loadUsers();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    const res = await fetch("/api/rbac");
    const data = await res.json();
    if (data.success) setUsers(data.data);
  };

  const toggleActive = async (user: User) => {
    await fetch("/api/rbac", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id, isActive: !user.isActive, performedBy: "Admin" }),
    });
    loadUsers();
  };

  const deleteUser = async (id: string) => {
    await fetch(`/api/rbac?id=${id}&performedBy=Admin`, { method: "DELETE" });
    setUsers((prev) => prev.filter((u) => u.id !== id));
    if (result?.id === id) setResult(null);
  };

  const handleClear = () => {
    setName(""); setEmail(""); setRole("LEGAL_EXPERT");
    setResult(null); setError(null); setUsers([]);
  };

  return (
    <div className="feature-card bg-bg2 border border-border rounded-2xl overflow-hidden">
      <div className="h-0.5" style={{ background: "linear-gradient(to right, #f87171, transparent)" }} />

      {/* Header */}
      <div className="flex items-start gap-4 p-6 border-b border-border">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)" }}>
          🛡️
        </div>
        <div className="flex-1">
          <div className="font-mono text-[10px] text-faint tracking-widest mb-1">FEATURE 03 · MEMBER-2</div>
          <div className="text-base font-semibold tracking-tight">Role-Based Access Control</div>
          <div className="font-mono text-[11px] text-faint mt-1">Raj Rohit Nath · 22201126</div>
        </div>
        {(result || error || users.length > 0) && (
          <button onClick={handleClear}
            className="font-mono text-[10px] px-3 py-1.5 rounded-lg border transition-all flex-shrink-0"
            style={{ color: "var(--danger)", borderColor: "rgba(248,113,113,0.3)", background: "rgba(248,113,113,0.08)" }}>
            🗑 CLEAR
          </button>
        )}
      </div>

      <div className="p-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md mb-4 font-mono text-[10px] font-medium tracking-wider"
          style={{ background: "rgba(248,113,113,0.08)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse-dot" />
          ADMIN INTERFACE
        </div>

        <p className="text-sm text-muted leading-relaxed font-light mb-5">
          Admin interface to manage Legal Experts who verify and update the
          system's internal database of law statutes. Assign roles and control access.
        </p>

        {/* Name */}
        <div className="mb-3">
          <label className="font-mono text-[11px] text-faint tracking-wider block mb-2">FULL NAME</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Nusrat Jahan"
            className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-sm outline-none"
            style={{ color: "var(--text)" }} />
        </div>

        {/* Email */}
        <div className="mb-3">
          <label className="font-mono text-[11px] text-faint tracking-wider block mb-2">EMAIL</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. nusrat@lawfirm.com"
            className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-sm outline-none"
            style={{ color: "var(--text)" }} />
        </div>

        {/* Role */}
        <div className="mb-4">
          <label className="font-mono text-[11px] text-faint tracking-wider block mb-2">ASSIGN ROLE</label>
          <div className="flex gap-2">
            {(["ADMIN", "LEGAL_EXPERT", "VIEWER"] as Role[]).map((r) => (
              <button key={r} onClick={() => setRole(r)}
                className="flex-1 py-2 rounded-lg font-mono text-[10px] font-semibold border transition-all"
                style={role === r
                  ? { background: ROLE_STYLES[r].bg, color: ROLE_STYLES[r].color, borderColor: ROLE_STYLES[r].border }
                  : { background: "none", color: "var(--faint)", borderColor: "var(--border)" }}>
                {r === "LEGAL_EXPERT" ? "LEGAL EXPERT" : r}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="text-danger text-sm font-mono p-3 rounded-lg border mb-4"
            style={{ background: "rgba(248,113,113,0.08)", borderColor: "rgba(248,113,113,0.2)" }}>
            ⚠ {error}
          </div>
        )}

        <button onClick={createUser} disabled={loading}
          className="w-full py-2.5 rounded-lg text-sm font-semibold font-mono tracking-wider transition-all mb-4 disabled:opacity-50"
          style={{ background: "#f87171", color: "#0a0b0f" }}>
          {loading ? "Creating User..." : "+ ADD USER"}
        </button>

        {/* Result */}
        {result && (
          <div className="animate-fade-up p-4 rounded-xl border mb-4"
            style={{ background: ROLE_STYLES[result.role].bg, borderColor: ROLE_STYLES[result.role].border }}>
            <div className="font-mono text-[10px] mb-2" style={{ color: ROLE_STYLES[result.role].color }}>
              ✓ USER CREATED — {result.role.replace("_", " ")}
            </div>
            <div className="text-sm font-semibold">{result.name}</div>
            <div className="font-mono text-[11px] text-muted mt-1">{result.email}</div>
            <div className="font-mono text-[10px] text-faint mt-2">ID: {result.id}</div>
          </div>
        )}

        {/* Users list */}
        {users.length > 0 && (
          <div>
            <div className="font-mono text-[11px] text-faint tracking-wider mb-3">
              ALL USERS ({users.length})
              <button onClick={loadUsers} className="ml-3 text-[10px]" style={{ color: "#f87171" }}>↻ REFRESH</button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between bg-bg border border-border rounded-lg px-4 py-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-semibold truncate">{user.name}</div>
                      {!user.isActive && (
                        <span className="font-mono text-[9px] px-1.5 py-0.5 rounded"
                          style={{ background: "rgba(248,113,113,0.1)", color: "#f87171" }}>
                          INACTIVE
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-[10px] text-faint mt-0.5">{user.email}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-mono text-[9px] px-2 py-0.5 rounded border"
                      style={{ color: ROLE_STYLES[user.role].color, borderColor: ROLE_STYLES[user.role].border }}>
                      {user.role.replace("_", " ")}
                    </span>
                    <button onClick={() => toggleActive(user)}
                      className="font-mono text-[10px] px-2 py-1 rounded border transition-all"
                      style={{ color: user.isActive ? "#fbbf24" : "#4ade80", borderColor: user.isActive ? "rgba(251,191,36,0.3)" : "rgba(74,222,128,0.3)" }}>
                      {user.isActive ? "DEACTIVATE" : "ACTIVATE"}
                    </button>
                    <button onClick={() => deleteUser(user.id)}
                      className="font-mono text-[10px] px-2 py-1 rounded border"
                      style={{ color: "var(--danger)", borderColor: "rgba(248,113,113,0.3)" }}>
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {users.length === 0 && !result && (
          <button onClick={loadUsers}
            className="w-full py-2 rounded-lg font-mono text-[11px] border transition-all"
            style={{ color: "var(--faint)", borderColor: "var(--border)" }}>
            ↻ Load All Users
          </button>
        )}
      </div>
    </div>
  );
}