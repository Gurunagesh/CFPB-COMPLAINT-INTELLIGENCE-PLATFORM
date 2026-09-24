/**
 * Recognized financial complaint terms and regulatory vocabulary.
 * 
 * IMPORTANT GOVERNANCE NOTICE:
 * These highlighted tokens represent detected textual keywords in the consumer narrative.
 * They are descriptive vocabulary signals and DO NOT represent causal feature attributions or model feature weights.
 */

export interface TextualSignal {
  category: string;
  terms: string[];
}

export const VOCABULARY_SIGNALS: TextualSignal[] = [
  {
    category: "Credit Reporting / Repair",
    terms: [
      "credit report",
      "credit bureau",
      "equifax",
      "experian",
      "transunion",
      "inaccurate",
      "delinquency",
      "dispute",
      "tradeline",
      "fcra",
      "late payment",
      "reinvestigation",
    ],
  },
  {
    category: "Debt Collection",
    terms: [
      "debt collector",
      "collection agency",
      "debt validation",
      "fdcpa",
      "harassment",
      "voicemail",
      "unverified debt",
      "ledger",
      "third-party",
      "adverse legal",
    ],
  },
  {
    category: "Mortgage / Escrow",
    terms: [
      "mortgage",
      "servicer",
      "escrow",
      "surplus",
      "respa",
      "disbursement",
      "closing date",
      "foreclosure",
      "loan modification",
      "principal balance",
    ],
  },
  {
    category: "Banking / Checking",
    terms: [
      "overdraft",
      "checking account",
      "savings account",
      "transaction sequence",
      "debit",
      "automated fee",
      "unauthorized",
      "posting order",
      "deposit",
    ],
  },
];

/**
 * Identifies textual signals matching the consumer narrative.
 */
export function extractTextualSignals(narrative: string): { term: string; category: string }[] {
  if (!narrative) return [];

  const lower = narrative.toLowerCase();
  const matched: { term: string; category: string }[] = [];
  const seen = new Set<string>();

  for (const group of VOCABULARY_SIGNALS) {
    for (const term of group.terms) {
      if (lower.includes(term.toLowerCase()) && !seen.has(term.toLowerCase())) {
        seen.add(term.toLowerCase());
        matched.push({ term, category: group.category });
      }
    }
  }

  return matched.slice(0, 8); // Top 8 distinct signals
}
