"use client";

import { useState } from "react";
import type { CurrencyApiResponse } from "@/types";

const currencies = ["BDT", "USD", "EUR", "GBP", "INR", "CAD", "AUD", "SGD", "AED", "SAR", "MYR", "JPY"];

export default function FeatureCurrencySettlement() {
  const [claimId, setClaimId] = useState("");
  const [amount, setAmount] = useState("100");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("BDT");
  const [transactionDate, setTransactionDate] = useState("");
  const [extraFeesLocal, setExtraFeesLocal] = useState("500");
  const [compensationRequestedLocal, setCompensationRequestedLocal] = useState("1000");
  const [offerAmount, setOfferAmount] = useState("6000");
  const [offerCurrency, setOfferCurrency] = useState("BDT");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [result, setResult] = useState<CurrencyApiResponse["data"]>();

  async function convertNow() {
    try {
      setLoading(true);
      setError("");
      setWarning("");
      setResult(undefined);

      const res = await fetch("/api/currency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claimId: claimId || undefined,
          amount,
          fromCurrency,
          toCurrency,
          transactionDate: transactionDate || undefined,
          extraFeesLocal,
          compensationRequestedLocal,
          offerAmount: offerAmount || undefined,
          offerCurrency,
        }),
      });

      const data: CurrencyApiResponse = await res.json();
      if (!data.success || !data.data) throw new Error(data.error || "Calculation failed");

      setWarning(data.warning || "");
      setResult(data.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="feature-card border border-border rounded-2xl bg-bg2 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <p className="font-mono text-[11px] tracking-widest text-gold uppercase">
            Module 2 · Member 4
          </p>
          <h2 className="font-playfair text-2xl font-bold mt-1">Currency & Settlement Engine</h2>
          <p className="text-sm text-muted mt-2 max-w-2xl">
            Convert a foreign transaction to local currency, add extra fees and requested compensation, then compare the company offer. If you enter a Claim #, the result is saved for search and reports.
          </p>
        </div>
        <span className="font-mono text-[10px] px-2 py-1 rounded border border-border text-sky-300">
          FX + SETTLEMENT
        </span>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-muted mb-2">Claim # optional</label>
          <input
            value={claimId}
            onChange={(e) => setClaimId(e.target.value)}
            className="w-full rounded-xl border border-border bg-bg3 px-4 py-3 outline-none"
            placeholder="1, 2, 3..."
          />
        </div>

        <div>
          <label className="block text-sm text-muted mb-2">Original Amount</label>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-xl border border-border bg-bg3 px-4 py-3 outline-none"
            placeholder="100"
          />
        </div>

        <div>
          <label className="block text-sm text-muted mb-2">Transaction Date optional</label>
          <input
            type="date"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            className="w-full rounded-xl border border-border bg-bg3 px-4 py-3 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm text-muted mb-2">From Currency</label>
          <select
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
            className="w-full rounded-xl border border-border bg-bg3 px-4 py-3 outline-none"
          >
            {currencies.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm text-muted mb-2">Local Claim Currency</label>
          <select
            value={toCurrency}
            onChange={(e) => {
              setToCurrency(e.target.value);
              setOfferCurrency(e.target.value);
            }}
            className="w-full rounded-xl border border-border bg-bg3 px-4 py-3 outline-none"
          >
            {currencies.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm text-muted mb-2">Company Offer Currency</label>
          <select
            value={offerCurrency}
            onChange={(e) => setOfferCurrency(e.target.value)}
            className="w-full rounded-xl border border-border bg-bg3 px-4 py-3 outline-none"
          >
            {currencies.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm text-muted mb-2">Delivery / Extra Fees ({toCurrency})</label>
          <input
            value={extraFeesLocal}
            onChange={(e) => setExtraFeesLocal(e.target.value)}
            className="w-full rounded-xl border border-border bg-bg3 px-4 py-3 outline-none"
            placeholder="500"
          />
        </div>

        <div>
          <label className="block text-sm text-muted mb-2">Compensation Requested ({toCurrency})</label>
          <input
            value={compensationRequestedLocal}
            onChange={(e) => setCompensationRequestedLocal(e.target.value)}
            className="w-full rounded-xl border border-border bg-bg3 px-4 py-3 outline-none"
            placeholder="1000"
          />
        </div>

        <div>
          <label className="block text-sm text-muted mb-2">Company Offer</label>
          <input
            value={offerAmount}
            onChange={(e) => setOfferAmount(e.target.value)}
            className="w-full rounded-xl border border-border bg-bg3 px-4 py-3 outline-none"
            placeholder="6000"
          />
        </div>
      </div>

      <button
        onClick={convertNow}
        disabled={loading}
        className="w-full mt-4 rounded-xl px-4 py-3 font-semibold transition disabled:opacity-60"
        style={{
          background: "linear-gradient(135deg, rgba(96,165,250,0.18), rgba(74,222,128,0.16))",
          border: "1px solid rgba(96,165,250,0.25)",
        }}
      >
        {loading ? "Calculating..." : "Calculate Settlement Value"}
      </button>

      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 mt-4">{error}</div>}
      {warning && <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200 mt-4">{warning}</div>}

      {result && (
        <div className="mt-5 space-y-4">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-border bg-bg3 p-4">
              <p className="text-xs text-muted mb-2">Converted Transaction</p>
              <p className="text-2xl font-bold">{result.convertedAmount} {result.toCurrency}</p>
              <p className="text-xs text-muted mt-2">1 {result.fromCurrency} = {result.exchangeRate} {result.toCurrency}</p>
            </div>
            <div className="rounded-2xl border border-border bg-bg3 p-4">
              <p className="text-xs text-muted mb-2">Total Claim Value</p>
              <p className="text-2xl font-bold">{result.totalClaimValue} {result.toCurrency}</p>
              <p className="text-xs text-muted mt-2">Includes fees + compensation.</p>
            </div>
            <div className="rounded-2xl border border-border bg-bg3 p-4">
              <p className="text-xs text-muted mb-2">Offer Coverage</p>
              <p className="text-2xl font-bold">{result.offerPercentage ?? "N/A"}%</p>
              <p className="text-xs text-muted mt-2">Offer: {result.offerAmountLocal ?? "N/A"} {result.toCurrency}</p>
            </div>
            <div className="rounded-2xl border border-border bg-bg3 p-4">
              <p className="text-xs text-muted mb-2">Suggested Action</p>
              <p className="text-2xl font-bold">{result.suggestedAction}</p>
              <p className="text-xs text-muted mt-2">Score: {result.fairnessScore}/100</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-bg3 p-4">
            <div className="grid md:grid-cols-3 gap-3 text-sm">
              <p><span className="text-muted">Extra fees:</span> {result.extraFeesLocal} {result.toCurrency}</p>
              <p><span className="text-muted">Compensation:</span> {result.compensationRequestedLocal} {result.toCurrency}</p>
              <p><span className="text-muted">Shortfall:</span> {result.shortfall ?? 0} {result.toCurrency}</p>
              <p><span className="text-muted">Negotiation target:</span> {result.negotiationTarget} {result.toCurrency}</p>
              <p><span className="text-muted">Rate source:</span> {result.source}</p>
              <p><span className="text-muted">Saved to claim:</span> {result.savedToClaim ? `Claim #${result.claimNumber}` : "No"}</p>
            </div>
            <p className="text-sm text-muted mt-4 leading-6">{result.recommendation}</p>
          </div>
        </div>
      )}
    </section>
  );
}
