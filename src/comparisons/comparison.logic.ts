import { ComparisonInput, ComparisonResult } from './comparison.types';

export function compareRedemption(input: ComparisonInput): ComparisonResult {
  const estimatedSavingsEuros = roundToCents(
    input.cashFareEuros - input.redemptionTaxesFeesEuros,
  );
  const estimatedSavingsPercent =
    input.cashFareEuros === 0
      ? null
      : roundToCents((estimatedSavingsEuros / input.cashFareEuros) * 100);
  const appearsWorthwhile = estimatedSavingsEuros > 0;

  return {
    ...input,
    estimatedSavingsEuros,
    estimatedSavingsPercent,
    appearsWorthwhile,
    explanation: explain(input, estimatedSavingsEuros, estimatedSavingsPercent),
  };
}

function explain(
  input: ComparisonInput,
  savings: number,
  percent: number | null,
): string {
  const route = `${input.origin} to ${input.destination}`;
  const cash = formatEuros(input.cashFareEuros);
  const taxes = formatEuros(input.redemptionTaxesFeesEuros);
  const savingsText = formatEuros(savings);
  const points = String(input.pointsRequired);
  const percentSentence =
    percent === null
      ? 'A savings percentage is not defined because the cash fare is €0.00.'
      : `That is ${percent.toFixed(2)}% of the cash fare.`;
  const disclaimer =
    'Points are treated as already earned and are not given a euro price. This uses only the numbers you submitted. It is not a live price, an award-availability check, or a booking confirmation.';

  if (savings > 0) {
    return `Redeeming ${points} points for ${route} appears worthwhile on these numbers. The cash fare is ${cash} and the redemption taxes and fees are ${taxes}, so the estimated saving is ${savingsText}. ${percentSentence} ${disclaimer}`;
  }

  if (savings < 0) {
    return `Redeeming ${points} points for ${route} does not appear worthwhile on these numbers. The cash fare is ${cash} and the redemption taxes and fees are ${taxes}, so the estimated result is ${savingsText}. ${percentSentence} ${disclaimer}`;
  }

  const tie =
    input.pointsRequired > 0
      ? 'The taxes and fees match the cash fare, so there is no euro saving, and points would still be spent.'
      : 'The taxes and fees match the cash fare, so there is no euro difference and no points would be spent.';

  return `Redeeming ${points} points for ${route} does not appear worthwhile on these numbers. ${tie} ${percentSentence} ${disclaimer}`;
}

function formatEuros(amount: number): string {
  const sign = amount < 0 ? '-' : '';
  return `${sign}€${Math.abs(amount).toFixed(2)}`;
}

function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}
