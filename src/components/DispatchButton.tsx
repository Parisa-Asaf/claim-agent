"use client"; 

import { useState } from "react";

export default function DispatchButton({ claimId }: { claimId: string }) {
  const [loading, setLoading] = useState(false);

  const handleDispatch = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimId }),
      });

      if (response.ok) {
        alert("Success! Claim dispatched via email.");
        window.location.reload(); // refresh
      } else {
        alert("Failed to dispatch. Check if the company has an email.");
      }
    } catch (error) {
      console.error(error);
      alert("Error connecting to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDispatch}
      disabled={loading}
      style={{
        backgroundColor: loading ? "#666" : "#000000",
        color: "white",
        padding: "8px 12px",
        borderRadius: "4px",
        border: "none",
        cursor: loading ? "not-allowed" : "pointer",
        fontWeight: "bold",
      }}
    >
      {loading ? "Sending..." : "🚀 Dispatch"}
    </button>
  );
}