"use client";

import DispatchButton from "@/components/DispatchButton";
import { useEffect, useState } from "react";

type Claim = {
  id: string;
  title: string | null;
  status: string;
  company: {
    name: string;
  } | null;
};

export default function DispatcherDashboard() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/claims/get-all")
      .then((res) => res.json())
      .then((data) => {
        console.log("Data received:", data); 
        if (Array.isArray(data)) {
          setClaims(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, []);

  const handleEdit = async (id: string, currentTitle: string) => {
    const newTitle = window.prompt("Edit Claim Title:", currentTitle || "");
    if (newTitle && newTitle !== currentTitle) {
      const res = await fetch("/api/claims/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimId: id, newTitle }),
      });
      if (res.ok) {
        setClaims(claims.map(c => c.id === id ? { ...c, title: newTitle } : c));
      }
    }
  };

  if (loading) return <div style={{ color: "white", padding: "50px" }}>Loading Dashboard Data...</div>;

  return (
    <div style={{ padding: "40px", backgroundColor: "#000000", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto", backgroundColor: "rgb(200, 169, 110)", padding: "20px", borderRadius: "8px" }}>
        
        <h1 style={{ color: "#111827", marginBottom: "10px" }}>Admin Dispatcher Control</h1>
        <button 
          onClick={() => window.location.href = '/'} 
          style={{ marginBottom: "20px", cursor: "pointer", fontSize: "12px", background: "none", border: "1px solid #111827", padding: "5px 10px", borderRadius: "4px" }}
        >
          ← Back to Home
        </button>

        {claims.length === 0 ? (
          <p style={{ color: "black" }}>No claims found. Go to home and upload a receipt first!</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 10px" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", color: "black", padding: "10px" }}>ID</th>
                <th style={{ textAlign: "left", color: "black", padding: "10px" }}>Title (Edit)</th>
                <th style={{ textAlign: "left", color: "black", padding: "10px" }}>Company</th>
                <th style={{ textAlign: "left", color: "black", padding: "10px" }}>Status</th>
                <th style={{ textAlign: "left", color: "black", padding: "10px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => (
                <tr key={claim.id} style={{ backgroundColor: "#ffffff" }}>
                  <td style={{ padding: "12px", color: "#374151" }}>{claim.id.slice(0, 8)}</td>
                  <td 
                    style={{ padding: "12px", color: "#2563eb", cursor: "pointer", textDecoration: "underline" }}
                    onClick={() => handleEdit(claim.id, claim.title || "")}
                  >
                    {claim.title || "Set Title"} ✏️
                  </td>
                  <td style={{ padding: "12px", color: "#374151" }}>{claim.company?.name || "N/A"}</td>
                  
                  {/* Status Badge */}
                  <td style={{ padding: "12px" }}>
                    <span style={{ 
                      padding: "4px 8px", 
                      borderRadius: "12px", 
                      fontSize: "10px",
                      fontWeight: "bold",
                      backgroundColor: claim.status === "DISPATCHED" ? "#dcfce7" : "#fef9c3", 
                      color: claim.status === "DISPATCHED" ? "#166534" : "#854d0e" 
                    }}>
                      {claim.status}
                    </span>
                  </td>

                  {/* Action Column: Logic to hide/show button */}
                  <td style={{ padding: "12px" }}>
                    {claim.status === "DISPATCHED" ? (
                      <span style={{ color: "#166534", fontSize: "12px", fontWeight: "bold" }}>
                        ✅ Notice Sent
                      </span>
                    ) : (
                      <DispatchButton claimId={claim.id} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}