import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import sgMail from "@sendgrid/mail";

// Set your key (It's okay if this is empty for now)
sgMail.setApiKey(process.env.SENDGRID_API_KEY || "SG.MOCK_KEY");

export async function POST(req: NextRequest) {
  try {
    const { evidenceId, recipientEmail } = await req.json();

    // 1. Fetch the data YOU extracted in Feature 1
    const evidence = await prisma.evidence.findUnique({
      where: { id: evidenceId },
    });

    if (!evidence) {
      return NextResponse.json({ error: "Evidence not found" }, { status: 404 });
    }

    // 2. Draft the Official Notice
    const msg = {
      to: recipientEmail || "legal-dept@company.com",
      from: "notifications@claimagent.ai", // Your verified sender
      subject: `LEGAL NOTICE: Claim ID #${evidence.id.slice(-6)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; border: 2px solid #333; padding: 20px;">
          <h1 style="color: #d32f2f;">FORMAL LEGAL NOTICE</h1>
          <p><strong>To:</strong> Legal Department of ${evidence.merchantName}</p>
          <p>This is an automated legal notice regarding a transaction on <strong>${evidence.transactionDate?.toLocaleDateString()}</strong>.</p>
          <p><strong>Disputed Amount:</strong> ${evidence.currency}${evidence.amount}</p>
          <p><strong>Evidence Hash (SHA-256):</strong> <br/><code style="background: #eee;">${evidence.sha256Hash}</code></p>
          <p>This evidence has been digitally timestamped and hashed to ensure integrity.</p>
          <hr/>
          <p style="font-size: 10px;">Sent via ClaimAgent Communication API (SendGrid)</p>
        </div>
      `,
    };

    // 3. The "Demo Logic"
    if (!process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY.includes("MOCK")) {
      console.log("📧 --- DEMO MODE: EMAIL PREVIEW ---");
      console.log(`TO: ${msg.to}`);
      console.log(`SUBJECT: ${msg.subject}`);
      console.log("CONTENT: Legal notice generated successfully.");
      console.log("📧 -------------------------------");
      
      // Simulate network delay
      await new Promise(r => setTimeout(r, 1500));
      
      return NextResponse.json({ 
        success: true, 
        message: "Notice generated and sent to queue (Demo Mode)",
        preview: msg.subject 
      });
    }

    // If you have a real key, it sends here
    await sgMail.send(msg);
    return NextResponse.json({ success: true, message: "Notice Sent via SendGrid!" });

  } catch (error: any) {
    console.error("SendGrid Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}