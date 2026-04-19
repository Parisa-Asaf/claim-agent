// src/app/api/letter/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            claimId,
            senderName,
            senderAddress,
            senderEmail,
            senderPhone,
            recipientName,
            recipientAddress,
            selectedStatutes
        } = body;

        if (!claimId || !senderName || !senderAddress) {
            return NextResponse.json(
                { success: false, error: "Missing required fields (claimId, senderName, senderAddress)" },
                { status: 400 }
            );
        }

        // Fetch claim with related statutes only
        const claim = await prisma.claim.findUnique({
            where: { id: claimId },
            include: {
                statutes: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                },
            },
        });

        if (!claim) {
            return NextResponse.json({ success: false, error: "Claim not found" }, { status: 404 });
        }

        const statuteLookup = claim.statutes[0];
        const statutes = statuteLookup ? (statuteLookup.statutes as any[]) : [];
        const recipientNameValue = recipientName?.trim() || "To Whom It May Concern";
        const recipientAddressValue = recipientAddress?.trim() || "";

        // Construct letter content
        const date = new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });

        // Determine jurisdiction (Default to BD for this implementation)
        const isBD = claim.statutes[0]?.jurisdiction === "BD" || true;

        const subject = `LEGAL NOTICE: Formal Demand for Resolution — ${claim.violationType || "Consumer Dispute"}`;

        let bodyText = `Under the instructions from my client, I am hereby serving you this Legal Notice regarding a grievance concerning ${claim.violationType?.toLowerCase() || "a significant consumer dispute"}.\n\n`;
        bodyText += `**FACTS OF THE CASE:**\n${claim.grievanceText || "The client has encountered unresolved issues with your services/products as documented in our records."}\n\n`;
        bodyText += `**LEGAL POSITION:**\nThis serves as formal notice that your actions/omissions appear to be in direct violation of the relevant provisions of the **Consumer Rights Protection Act, 2009** (and other applicable laws of Bangladesh) as detailed in the attached schedule.\n\n`;
        bodyText += `**OUR DEMAND:**\nYou are hereby requested to rectify this grievance and provide a satisfactory resolution within **15 (fifteen) days** from the receipt of this notice. Failure to comply with this demand will leave my client with no choice but to initiate appropriate legal proceedings before the Directorate of National Consumer Rights Protection (DNCRP) or the competent Courts of Law at your own risk and cost.\n\n`;
        bodyText += `Please treat this as a formal attempt to resolve the matter amicably before escalation.`;

        // Save letter metadata to DB
        const letter = await prisma.demandLetter.create({
            data: {
                claimId,
                senderName,
                senderAddress,
                senderEmail,
                senderPhone,
                recipientName: recipientNameValue,
                recipientAddress: recipientAddressValue,
                letterContent: bodyText,
                selectedStatutes: selectedStatutes || statutes,
            },
        });

        return NextResponse.json({
            success: true,
            data: {
                id: letter.id,
                date,
                senderName,
                senderAddress,
                senderEmail,
                senderPhone,
                recipientName: recipientNameValue,
                recipientAddress: recipientAddressValue,
                subject,
                body: bodyText,
                statutes: (selectedStatutes || statutes).map((s: any) => ({
                    name: s.name,
                    article: s.article,
                    description: s.description
                })),
            },
        });
    } catch (error) {
        console.error("[/api/letter] Error:", error);
        return NextResponse.json(
            { success: false, error: (error as Error).message || "Internal server error" },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    const claimId = req.nextUrl.searchParams.get("claimId");

    if (!claimId) {
        return NextResponse.json({ success: false, error: "?claimId= required" }, { status: 400 });
    }

    const letters = await prisma.demandLetter.findMany({
        where: { claimId },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: letters });
}
