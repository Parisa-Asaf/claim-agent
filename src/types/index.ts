// Member 4 shared types only

export type Jurisdiction = "BD" | "EU" | "US" | "UK" | "IN" | "INTL";

export const JURISDICTION_LABELS: Record<Jurisdiction, string> = {
  BD: "Bangladesh",
  EU: "European Union (GDPR)",
  US: "United States (CCPA/FTC)",
  UK: "United Kingdom",
  IN: "India",
  INTL: "International",
};

export type GrievanceType =
  | "Data Privacy Violation"
  | "Unauthorized Charges"
  | "Product Defect / Refund Denial"
  | "False Advertising"
  | "Service Failure"
  | "Identity Theft";


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
  warning?: string;
}

export interface StatuteRuleRecord extends Statute {
  id: string;
  createdAt: string;
  updatedAt: string;
  keywords: string[];
  grievanceTypes: string[];
  isActive: boolean;
}

export type CurrencySource = "live_api" | "fallback";
export type CurrencyFairnessLabel = "FAIR" | "ACCEPTABLE" | "PARTIAL" | "LOW";

export interface CurrencyConversionResult {
  claimNumber?: number | null;
  claimId?: string | null;
  fromCurrency: string;
  toCurrency: string;
  offerCurrency: string;
  originalAmount: number;
  convertedAmount: number;
  exchangeRate: number;
  transactionDate?: string | null;
  extraFeesLocal: number;
  compensationRequestedLocal: number;
  totalClaimValue: number;
  offerAmount?: number;
  offerAmountLocal?: number;
  offerPercentage?: number;
  shortfall?: number;
  surplus?: number;
  fairnessScore: number;
  fairnessLabel: CurrencyFairnessLabel;
  suggestedAction: "Accept" | "Consider Accepting" | "Negotiate" | "Reject";
  negotiationTarget: number;
  recommendation: string;
  savedToClaim: boolean;
  timestamp: string;
  source: CurrencySource;
}

export interface CurrencyApiResponse {
  success: boolean;
  data?: CurrencyConversionResult;
  error?: string;
  warning?: string;
}

export interface ClaimSearchResult {
  id: string;
  claimNumber: number;
  title: string;
  status: string;
  grievanceType: string | null;
  priorityLevel: string | null;
  companyName: string | null;
  createdAt: string;
  updatedAt: string;
  claimedAmount: number | null;
  recoveredAmount: number | null;
  currency: string | null;
}

export interface SearchApiResponse {
  success: boolean;
  results: ClaimSearchResult[];
  count: number;
  error?: string;
}

export interface ClaimInputRecord extends ClaimSearchResult {
  grievanceText: string | null;
  violationType: string | null;
  companyAddress: string | null;
  companyCountry: string | null;
}

export interface ClaimsApiResponse {
  success: boolean;
  claims?: ClaimInputRecord[];
  claim?: ClaimInputRecord;
  count?: number;
  error?: string;
}

export interface OutcomeTimelineItem {
  label: string;
  value: string;
}

export interface OutcomeReportData {
  claimId: string;
  claimNumber: number;
  title: string;
  status: string;
  grievanceText: string | null;
  grievanceType: string | null;
  violationType: string | null;
  priorityLevel: string;
  companyName: string | null;
  companyAddress: string | null;
  createdAt: string;
  updatedAt: string;
  statuteCount: number;
  settlementCount: number;
  claimedAmount: number | null;
  recoveredAmount: number | null;
  currency: string | null;
  recoveryStatus: string;
  timeline: OutcomeTimelineItem[];
  statutes: Statute[];
}

export interface OutcomeReportApiResponse {
  success: boolean;
  data?: OutcomeReportData;
  error?: string;
}
