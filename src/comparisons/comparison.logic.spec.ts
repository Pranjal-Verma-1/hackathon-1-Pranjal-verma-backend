import { compareRedemption } from './comparison.logic';
import { parseComparisonRequest } from './parse-comparison-request';

describe('compareRedemption', () => {
  const route = {
    origin: 'Madrid',
    destination: 'New York',
    pointsRequired: 60000,
  };

  it('subtracts redemption taxes and fees from the cash fare', () => {
    const result = compareRedemption({
      ...route,
      cashFareEuros: 850,
      redemptionTaxesFeesEuros: 120.5,
    });

    expect(result.estimatedSavingsEuros).toBe(729.5);
    expect(result.estimatedSavingsPercent).toBe(85.82);
    expect(result.appearsWorthwhile).toBe(true);
    expect(result.explanation).toContain('appears worthwhile');
    expect(result.explanation).toContain('not a live price');
  });

  it('reports negative savings when taxes and fees exceed the cash fare', () => {
    const result = compareRedemption({
      origin: 'Madrid',
      destination: 'Barcelona',
      cashFareEuros: 40,
      pointsRequired: 15000,
      redemptionTaxesFeesEuros: 95,
    });

    expect(result.estimatedSavingsEuros).toBe(-55);
    expect(result.estimatedSavingsPercent).toBe(-137.5);
    expect(result.appearsWorthwhile).toBe(false);
    expect(result.explanation).toContain('does not appear worthwhile');
  });

  it('leaves the percentage undefined when the cash fare is zero', () => {
    const result = compareRedemption({
      origin: 'Lisbon',
      destination: 'Porto',
      cashFareEuros: 0,
      pointsRequired: 8000,
      redemptionTaxesFeesEuros: 0,
    });

    expect(result.estimatedSavingsEuros).toBe(0);
    expect(result.estimatedSavingsPercent).toBeNull();
    expect(result.appearsWorthwhile).toBe(false);
  });
});

describe('parseComparisonRequest', () => {
  it('trims route names and accepts a valid comparison', () => {
    const parsed = parseComparisonRequest({
      origin: '  Madrid ',
      destination: 'Barcelona',
      cashFareEuros: 40,
      pointsRequired: 15000,
      redemptionTaxesFeesEuros: 12.5,
    });

    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value.origin).toBe('Madrid');
      expect(parsed.value.redemptionTaxesFeesEuros).toBe(12.5);
    }
  });

  it('rejects empty names, negative amounts, and fractional points', () => {
    const parsed = parseComparisonRequest({
      origin: ' ',
      destination: '',
      cashFareEuros: -1,
      pointsRequired: 1.5,
      redemptionTaxesFeesEuros: '20',
    });

    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.errors).toEqual([
        'origin must be a non-empty name.',
        'destination must be a non-empty name.',
        'cashFareEuros must be nonnegative.',
        'pointsRequired must be a whole number.',
        'redemptionTaxesFeesEuros must be a finite number of euros.',
      ]);
    }
  });
});
