export interface ComparisonInput {
  origin: string;
  destination: string;
  cashFareEuros: number;
  pointsRequired: number;
  redemptionTaxesFeesEuros: number;
}

export interface ComparisonResult extends ComparisonInput {
  estimatedSavingsEuros: number;
  estimatedSavingsPercent: number | null;
  appearsWorthwhile: boolean;
  explanation: string;
}

export type ParseResult =
  { ok: true; value: ComparisonInput } | { ok: false; errors: string[] };
