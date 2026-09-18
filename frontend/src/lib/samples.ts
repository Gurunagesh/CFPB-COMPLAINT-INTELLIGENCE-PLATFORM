/**
 * Synthetic / redacted demonstration complaints for testing and analyst demonstrations.
 * (Does not contain raw consumer PII or unredacted production narratives)
 */

export interface SampleComplaint {
  id: string;
  title: string;
  categoryHint: string;
  company: string;
  narrative: string;
  dateReceived?: string;
}

export const SYNTHETIC_SAMPLES: SampleComplaint[] = [
  {
    id: "sample-credit-report",
    title: "Credit Bureau Dispute (Inaccurate Delinquency)",
    categoryHint: "Credit reporting, repair, or other",
    company: "EQUIFAX, INC.",
    narrative:
      "I am writing to formally dispute an erroneous 60-day late payment reported on my credit profile for account ending in 4012. I submitted certified documentation demonstrating that the balance was settled in full prior to the statement closing date. Despite multiple written requests under the Fair Credit Reporting Act, the agency has failed to conduct a reasonable reinvestigation or remove the inaccurate tradeline.",
    dateReceived: "2026-09-10T09:30:00",
  },
  {
    id: "sample-mortgage-escrow",
    title: "Mortgage Servicing (Escrow Account Surplus)",
    categoryHint: "Mortgage",
    company: "WELLS FARGO & COMPANY",
    narrative:
      "My mortgage servicer conducted an annual escrow analysis in July and identified an escrow surplus exceeding $1,200. Under RESPA guidelines, any surplus greater than $50 must be refunded within 30 days of the analysis. Over 60 days have passed, and customer care representatives repeatedly state the check was queued but fail to provide tracking or disbursement verification.",
    dateReceived: "2026-09-12T14:15:00",
  },
  {
    id: "sample-debt-collection",
    title: "Third-Party Debt Collection (Unverified Debt)",
    categoryHint: "Debt collection",
    company: "PORTFOLIO RECOVERY ASSOCIATES, LLC",
    narrative:
      "A third-party debt collector contacted my employer and left repeated voicemails disclosing alleged personal debt details. I sent a timely debt validation notice requesting proof of ownership, original contract, and accounting ledger. Rather than validating the debt, they resumed automated calling and threatened adverse legal action.",
    dateReceived: "2026-09-15T11:00:00",
  },
  {
    id: "sample-checking-overdraft",
    title: "Checking Account (Unauthorized Overdraft Sequence)",
    categoryHint: "Checking or savings account",
    company: "JPMORGAN CHASE & CO.",
    narrative:
      "The financial institution reordered multiple debit transactions from highest to lowest amount rather than chronological posting order, which triggered four consecutive overdraft fees totaling $136 on a single business day. Customer service acknowledged the transaction sequence but refused to reverse the automated fees.",
    dateReceived: "2026-09-16T16:45:00",
  },
];
