"use client";

import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [evidenceId, setEvidenceId] = useState<string | null>(null);

  // STEP 1: EXTRACT
  const handleUpload = async () => {
    if (!file) return alert("Select a file");
    setIsExtracting(true);
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/extract", { method: "POST", body: formData });
      const result = await res.json();
      
      if (result.success) {
        setExtractedData(result.data);
        setEvidenceId(result.evidenceId);
        alert("Extraction Complete! Data saved to Database.");
      }
    } catch (err) {
      alert("Error during extraction");
    } finally {
      setIsExtracting(false);
    }
  };

  // STEP 2: SEND
  const sendNotice = async () => {
    try {
      const res = await fetch("/api/send-notice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            evidenceId: evidenceId || "latest", 
            recipientEmail: "parisa.asaf@g.bracu.ac.bd" 
        }),
      });
      const data = await res.json();
      if (data.success) alert("🚀 LEGAL NOTICE DISPATCHED!");
    } catch (err) {
      alert("SendGrid Error");
    }
  };

  return (
    <div style={{ padding: "50px" }}>
      <h1>ClaimAgent Demo</h1>
      
      <div style={{ border: "1px solid black", padding: "20px", marginBottom: "20px" }}>
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button onClick={handleUpload}>
            {isExtracting ? "Analyzing..." : "1. Extract Evidence"}
        </button>
      </div>

      <div style={{ border: "1px solid red", padding: "20px" }}>
        <h3>Extracted Info:</h3>
        <p>Merchant: {extractedData?.merchantName || "Waiting..."}</p>
        <p>Amount: {extractedData?.amount || "0.00"}</p>
        
        <button 
          onClick={sendNotice} 
          style={{ background: "red", color: "white", padding: "20px", cursor: "pointer" }}
        >
          2. SEND NOTICE (SENDGRID)
        </button>
      </div>
    </div>
  );
}