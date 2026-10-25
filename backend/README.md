# GorurGari API (starter)

This is the first backend scaffold for the GorurGari frontend.

## What is included
- `GET /api/health` — API health check.
- `POST /api/fare-estimate` — demo estimate from a supplied distance.
- `POST /api/bookings` — validates a request and saves it to PostgreSQL.

## Run locally
1. Install Node.js 20 or newer and PostgreSQL.
2. In this folder, run `npm install`.
3. Create a PostgreSQL database named `gorurgari`.
4. Run `schema.sql` against that database.
5. Copy `.env.example` to `.env` and set `DATABASE_URL`.
6. Run `npm run dev`.

Test the health route at `http://localhost:4000/api/health`.

## Important limitations
- This is a development starter, not a production-ready ride-hailing system.
- Fare calculation is a placeholder and does not calculate actual route distance.
- A maps provider, rider/driver authentication, driver assignment, payment integration, rate limiting, and production security review are still required.
- Never commit your real `.env` file or database credentials.
