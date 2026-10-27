# A Una Milla backend

NestJS API for comparing a cash fare with a points redemption. Points are treated as already earned. The API does not check live prices, award availability, or bookings.

## Setup

```bash
npm install
cp .env.example .env
npm run start:dev
```

The API listens on `PORT` when the platform sets it, and on port **3001** locally. It binds to `0.0.0.0`. The Next.js app stays on `http://localhost:3000`.

Production, including Railway:

```bash
npm run build
npm run start:prod
```

Use `npm run build` as the build command and `npm run start:prod` as the start command. Railway injects `PORT`.

## Environment variables

Copy `.env.example` to `.env`. Neither value is required. `.env` is ignored by git. `.env.example` contains placeholders only.

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3001` | Port the API listens on. Railway supplies this in production. |
| `FRONTEND_ORIGIN` | `http://localhost:3000` | Comma-separated browser origins allowed by CORS |

Set the Vercel site when its URL is known:

```text
FRONTEND_ORIGIN=http://localhost:3000,https://your-frontend.vercel.app
```

`http://localhost:3000` stays allowed even when the variable lists only the deployed site. A `*` wildcard is ignored, and credentialed CORS is disabled.

## Endpoints

### `GET /api/health`

```bash
curl http://localhost:3001/api/health
```

```json
{ "status": "ok" }
```

### `POST /api/comparisons`

Returns `201` with the estimated saving and a deterministic explanation.

```bash
curl -X POST http://localhost:3001/api/comparisons \
  -H 'Content-Type: application/json' \
  -d '{"origin":"Madrid","destination":"New York","cashFareEuros":850,"pointsRequired":60000,"redemptionTaxesFeesEuros":120.5}'
```

Negative saving, when taxes and fees are higher than the cash fare:

```bash
curl -X POST http://localhost:3001/api/comparisons \
  -H 'Content-Type: application/json' \
  -d '{"origin":"Madrid","destination":"Barcelona","cashFareEuros":40,"pointsRequired":15000,"redemptionTaxesFeesEuros":95}'
```

Request fields:

| Field | Meaning |
| --- | --- |
| `origin` | Departure name |
| `destination` | Arrival name |
| `cashFareEuros` | Cash fare in euros |
| `pointsRequired` | Whole points required |
| `redemptionTaxesFeesEuros` | Taxes and fees charged on the redemption, in euros |

## Validation limits

Invalid requests return `400` with a `message` array.

- `origin` and `destination` are required strings. Blank names are rejected. Leading and trailing spaces are removed. Maximum length is 80 characters.
- `cashFareEuros` and `redemptionTaxesFeesEuros` are required finite numbers, from 0 to 1,000,000 euros, with at most two decimal places.
- `pointsRequired` is a required whole number, from 0 to 10,000,000.

## Comparison formula

```text
estimatedSavingsEuros = cashFareEuros - redemptionTaxesFeesEuros
```

Amounts are rounded to cents. Points are not converted into euros.

`estimatedSavingsPercent` is `estimatedSavingsEuros / cashFareEuros * 100`, rounded to two decimal places. When `cashFareEuros` is 0, the percentage is `null`.

`appearsWorthwhile` is true only when `estimatedSavingsEuros` is greater than 0. The `explanation` string uses only the submitted numbers. It is not a live fare, an award search, or a booking confirmation.

## Checks

```bash
npm run build
npm run lint
npm test
```

`npm test` covers the comparison calculation and request validation. It does not boot Nest. The starter end-to-end script, `npm run test:e2e`, still imports `@nestjs/testing` and is not a check for this API.

On Node v24.7.0, Jest cannot load `@nestjs/testing` as CommonJS. That does not affect `npm run build` or `npm run start:prod`.
