// src/types/index.ts

// ─── Feature 1: Evidence Extraction ─────────────────────────────────────────
export interface ExtractedReceiptData {
  merchantName: string;
  transactionDate: string;
  amount: string;
  currency: string;
  confidenceMerchant: number;
  confidenceDate: number;
  confidenceAmount: number;
  rawText?: string;
}

export interface ExtractApiResponse {
  success: boolean;
  data?: ExtractedReceiptData;
  evidenceId?: string;
  error?: string;
}

// ─── Feature 2: Evidence Hashing ─────────────────────────────────────────────
export interface HashResult {
  sha256: string;
  algorithm: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  timestamp: string;
  legalStatus: "TAMPER_PROOF" | "VERIFIED";
}

export interface HashApiResponse {
  success: boolean;
  data?: HashResult;
  evidenceId?: string;
  error?: string;
}

// ─── Feature 3: Company Intelligence ─────────────────────────────────────────
export interface CompanyResult {
  id?: string;
  name: string;
  legalDept: string;
  address: string;
  city?: string;
  country: string;
  countryCode: string;
  industry?: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
  verified: boolean;
}

export interface CompanyApiResponse {
  success: boolean;
  results: CompanyResult[];
  source: "database" | "google_maps" | "fallback";
  error?: string;
}

// ─── Feature 4: Statute Lookup ───────────────────────────────────────────────
export interface Statute {
  name: string;
  jurisdiction: string;
  article: string;
  description: string;
  maxPenalty: string;
  relevanceScore?: number;
}

export interface StatuteApiResponse {
  success: boolean;
  statutes?: Statute[];
  lookupId?: string;
  model?: string;
  error?: string;
}

// ─── Shared ──────────────────────────────────────────────────────────────────
export type Jurisdiction = "BD" | "EU" | "US" | "UK" | "IN" | "INTL";

export const JURISDICTION_LABELS: Record<Jurisdiction, string> = {
  BD: "🇧🇩 Bangladesh",
  EU: "🇪🇺 European Union (GDPR)",
  US: "🇺🇸 United States (CCPA)",
  UK: "🇬🇧 United Kingdom",
  IN: "🇮🇳 India",
  INTL: "🌐 International",
};

export type GrievanceType =
  | "Data Privacy Violation"
  | "Unauthorized Charges"
  | "Product Defect / Refund Denial"
  | "False Advertising"
  | "Service Failure"
  | "Identity Theft";

export const GRIEVANCE_EXAMPLES: Record<GrievanceType, string> = {
  "Data Privacy Violation":
    "Company collected and sold my personal data without consent, violating my privacy rights.",
  "Unauthorized Charges":
    "Company charged my credit card $89.99 monthly without authorization after I cancelled my subscription.",
  "Product Defect / Refund Denial":
    "Purchased a laptop for $1,200 that failed within 30 days. Company refuses warranty replacement or refund.",
  "False Advertising":
    "Product advertised as 'waterproof to 50m' failed at 2m depth causing $800 in equipment loss.",
  "Service Failure":
    "Paid ৳5,000 for premium service plan. Service was unavailable for 3 weeks with no compensation offered.",
  "Identity Theft":
    "Company data breach exposed my personal details, leading to fraudulent transactions on my accounts.",
};
