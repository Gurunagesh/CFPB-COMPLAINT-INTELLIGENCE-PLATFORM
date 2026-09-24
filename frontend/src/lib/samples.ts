/**
 * Synthetic demonstration complaints for testing and analyst demonstrations.
 * 
 * IMPORTANT NOTICE:
 * These scenarios are purely synthetic, redacted test cases constructed for demonstration purposes.
 * They do not contain actual consumer PII and do NOT represent official CFPB case decisions.
 */

export interface SampleComplaint {
  id: string;
  title: string;
  categoryHint: string;
  company: string;
  narrative: string;
  dateReceived?: string;
  badge: string;
}

export const SYNTHETIC_SAMPLES: SampleComplaint[] = [
  {
    id: "sample-credit-card-dispute",
    title: "Credit Card Dispute (Unrecognized Charge)",
    categoryHint: "Credit card or prepaid card",
    badge: "Credit Card",
    company: "CITIBANK, N.A.",
    narrative:
      "I am disputing an unauthorized charge of $489.50 that appeared on my monthly credit card billing statement from a merchant I have never patronized. I immediately contacted customer service to report the fraudulent activity and request a replacement card. The representative promised a provisional credit within 48 hours, but two billing cycles have elapsed and the balance remains on my card with accumulating interest charges.",
    dateReceived: "2026-09-18T10:00:00",
  },
  {
    id: "sample-debt-collection",
    title: "Debt Collection Complaint (Unverified Debt Harassment)",
    categoryHint: "Debt collection",
    badge: "Debt Collection",
    company: "PORTFOLIO RECOVERY ASSOCIATES, LLC",
    narrative:
      "A third-party debt collection agency repeatedly calls my workplace and left voicemails disclosing alleged personal debt details to my supervisor. I sent a formal debt validation notice via certified mail requesting the original contract and accounting ledger. Rather than validating the debt, they resumed automated calling and threatened adverse legal action in direct violation of the FDCPA.",
    dateReceived: "2026-09-19T14:30:00",
  },
  {
    id: "sample-mortgage-escrow",
    title: "Mortgage / Escrow Complaint (Surplus Withholding)",
    categoryHint: "Mortgage",
    badge: "Mortgage",
    company: "WELLS FARGO & COMPANY",
    narrative:
      "My mortgage servicer conducted an annual escrow analysis and calculated an escrow surplus balance of $1,450. Under RESPA regulations, any surplus balance exceeding $50 must be refunded to the borrower within 30 days. Over 60 days have passed and multiple customer care inquiries have only produced automated responses stating the disbursement is pending review.",
    dateReceived: "2026-09-20T09:15:00",
  },
  {
    id: "sample-credit-report",
    title: "Credit Reporting Dispute (Delinquency Error)",
    categoryHint: "Credit reporting, repair, or other",
    badge: "Credit Reporting",
    company: "EQUIFAX, INC.",
    narrative:
      "I am writing to formally dispute an erroneous 60-day late payment mark reported on my credit report for auto account ending in 4012. I provided certified settlement documents proving the balance was paid prior to the closing date. Despite multiple written FCRA reinvestigation requests, the agency failed to correct the tradeline or contact the furnishers.",
    dateReceived: "2026-09-21T11:45:00",
  },
];
