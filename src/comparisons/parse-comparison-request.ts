import { ComparisonInput, ParseResult } from './comparison.types';

const MAX_ROUTE_LENGTH = 80;
const MAX_EUROS = 1_000_000;
const MAX_POINTS = 10_000_000;

export function parseComparisonRequest(body: unknown): ParseResult {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, errors: ['Request body must be a JSON object.'] };
  }

  const record = body as Record<string, unknown>;
  const errors: string[] = [];
  const origin = readRoute(record, 'origin', errors);
  const destination = readRoute(record, 'destination', errors);
  const cashFareEuros = readEuros(record, 'cashFareEuros', errors);
  const pointsRequired = readPoints(record, 'pointsRequired', errors);
  const redemptionTaxesFeesEuros = readEuros(
    record,
    'redemptionTaxesFeesEuros',
    errors,
  );

  if (
    errors.length > 0 ||
    origin === undefined ||
    destination === undefined ||
    cashFareEuros === undefined ||
    pointsRequired === undefined ||
    redemptionTaxesFeesEuros === undefined
  ) {
    return { ok: false, errors };
  }

  const value: ComparisonInput = {
    origin,
    destination,
    cashFareEuros,
    pointsRequired,
    redemptionTaxesFeesEuros,
  };
  return { ok: true, value };
}

function readRoute(
  record: Record<string, unknown>,
  field: 'origin' | 'destination',
  errors: string[],
): string | undefined {
  if (
    !(field in record) ||
    record[field] === undefined ||
    record[field] === null
  ) {
    errors.push(`${field} is required.`);
    return undefined;
  }
  if (typeof record[field] !== 'string') {
    errors.push(`${field} must be a string.`);
    return undefined;
  }
  const value = record[field].trim();
  if (value.length === 0) {
    errors.push(`${field} must be a non-empty name.`);
    return undefined;
  }
  if (value.length > MAX_ROUTE_LENGTH) {
    errors.push(`${field} must be at most ${MAX_ROUTE_LENGTH} characters.`);
    return undefined;
  }
  return value;
}

function readEuros(
  record: Record<string, unknown>,
  field: 'cashFareEuros' | 'redemptionTaxesFeesEuros',
  errors: string[],
): number | undefined {
  if (
    !(field in record) ||
    record[field] === undefined ||
    record[field] === null
  ) {
    errors.push(`${field} is required.`);
    return undefined;
  }
  const value = record[field];
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    errors.push(`${field} must be a finite number of euros.`);
    return undefined;
  }
  if (value < 0) {
    errors.push(`${field} must be nonnegative.`);
    return undefined;
  }
  if (value > MAX_EUROS) {
    errors.push(`${field} must be at most ${MAX_EUROS} euros.`);
    return undefined;
  }
  if (!hasAtMostTwoDecimalPlaces(value)) {
    errors.push(`${field} must have at most two decimal places.`);
    return undefined;
  }
  return roundToCents(value);
}

function readPoints(
  record: Record<string, unknown>,
  field: 'pointsRequired',
  errors: string[],
): number | undefined {
  if (
    !(field in record) ||
    record[field] === undefined ||
    record[field] === null
  ) {
    errors.push(`${field} is required.`);
    return undefined;
  }
  const value = record[field];
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    errors.push(`${field} must be a finite number.`);
    return undefined;
  }
  if (!Number.isInteger(value)) {
    errors.push(`${field} must be a whole number.`);
    return undefined;
  }
  if (value < 0) {
    errors.push(`${field} must be nonnegative.`);
    return undefined;
  }
  if (value > MAX_POINTS) {
    errors.push(`${field} must be at most ${MAX_POINTS}.`);
    return undefined;
  }
  return value;
}

function hasAtMostTwoDecimalPlaces(value: number): boolean {
  return Math.abs(value * 100 - Math.round(value * 100)) < 1e-6;
}

function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}
