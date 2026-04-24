import type { OutcomeReportData } from "@/types";

function safe(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "N/A";
  return String(value);
}

export async function downloadCaseSummaryPdf(report: OutcomeReportData): Promise<void> {
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF();
  const margin = 18;
  const width = doc.internal.pageSize.getWidth() - margin * 2;
  let y = 18;

  const addLine = (label: string, value: string | number | null | undefined) => {
    if (y > 275) {
      doc.addPage();
      y = 18;
    }
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, margin, y);
    doc.setFont("helvetica", "normal");
    const wrapped = doc.splitTextToSize(safe(value), width - 55);
    doc.text(wrapped, margin + 55, y);
    y += Math.max(8, wrapped.length * 6);
  };

  const addSection = (title: string) => {
    if (y > 260) {
      doc.addPage();
      y = 18;
    }
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(title, margin, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("ACRLE Case Summary Report", margin, y);
  y += 12;
  doc.setFontSize(10);

  addSection("Claim Overview");
  addLine("Claim #", report.claimNumber);
  addLine("Database ID", report.claimId);
  addLine("Title", report.title);
  addLine("Company", report.companyName);
  addLine("Status", report.status);
  addLine("Priority", report.priorityLevel);
  addLine("Violation Type", report.violationType || report.grievanceType);
  addLine("Created", new Date(report.createdAt).toLocaleString());
  addLine("Updated", new Date(report.updatedAt).toLocaleString());

  addSection("Grievance");
  addLine("Details", report.grievanceText);

  addSection("Recovery Data");
  addLine("Claimed Amount", `${safe(report.claimedAmount)} ${safe(report.currency)}`);
  addLine("Recovered Amount", `${safe(report.recoveredAmount)} ${safe(report.currency)}`);
  addLine("Recovery Status", report.recoveryStatus);
  addLine("Statute Matches", report.statuteCount);
  addLine("Settlement Records", report.settlementCount);

  addSection("Timeline");
  report.timeline.forEach((item) => addLine(item.label, item.value));

  if (report.statutes.length > 0) {
    addSection("Matched Statutes");
    report.statutes.forEach((statute, index) => {
      addLine(`${index + 1}. ${statute.name}`, `${statute.article} - ${statute.description}`);
    });
  }

  doc.save(`case-summary-claim-${report.claimNumber}.pdf`);
}
