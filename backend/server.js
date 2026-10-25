require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const port = Number(process.env.PORT || 4000);
const pool = process.env.DATABASE_URL ? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
}) : null;

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN
    ? process.env.FRONTEND_ORIGIN.split(",").map((s) => s.trim())
    : true
}));
app.use(express.json({ limit: "20kb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "GorurGari API", databaseConfigured: Boolean(pool) });
});

// Demo-only estimate: replace with distance/time from a maps provider before production.
function estimateFare(rideType, distanceKm) {
  const rates = {
    bike: { base: 30, perKm: 12 },
    go: { base: 70, perKm: 20 },
    xl: { base: 120, perKm: 28 }
  };
  const rate = rates[rideType];
  if (!rate) return null;
  return Math.round(rate.base + distanceKm * rate.perKm);
}

app.post("/api/fare-estimate", (req, res) => {
  const { rideType, distanceKm } = req.body || {};
  const distance = Number(distanceKm);
  if (!Number.isFinite(distance) || distance <= 0 || distance > 500) {
    return res.status(400).json({ error: "distanceKm must be between 0 and 500." });
  }
  const fare = estimateFare(rideType, distance);
  if (fare === null) return res.status(400).json({ error: "rideType must be bike, go, or xl." });
  res.json({
    rideType,
    distanceKm: distance,
    estimatedFareBdt: fare,
    note: "Demo estimate only; not a live quote. Connect a maps provider for real route distance."
  });
});

app.post("/api/bookings", async (req, res) => {
  if (!pool) return res.status(503).json({ error: "Database is not configured yet." });
  const { pickup, destination, rideType, distanceKm, riderName, riderPhone } = req.body || {};
  if (typeof pickup !== "string" || typeof destination !== "string" ||
      !pickup.trim() || !destination.trim() ||
      pickup.trim().toLowerCase() === destination.trim().toLowerCase()) {
    return res.status(400).json({ error: "Enter different pickup and destination locations." });
  }
  const distance = Number(distanceKm);
  if (!Number.isFinite(distance) || distance <= 0 || distance > 500) {
    return res.status(400).json({ error: "A valid distanceKm is required." });
  }
  const fare = estimateFare(rideType, distance);
  if (fare === null) return res.status(400).json({ error: "rideType must be bike, go, or xl." });

  try {
    const result = await pool.query(
      `INSERT INTO bookings (pickup, destination, ride_type, estimated_fare_bdt, rider_name, rider_phone)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, pickup, destination, ride_type, estimated_fare_bdt, status, created_at`,
      [pickup.trim(), destination.trim(), rideType, fare,
       typeof riderName === "string" ? riderName.trim().slice(0, 100) : null,
       typeof riderPhone === "string" ? riderPhone.trim().slice(0, 30) : null]
    );
    res.status(201).json({ booking: result.rows[0] });
  } catch (error) {
    console.error("Booking insert failed:", error.message);
    res.status(500).json({ error: "Could not create booking right now." });
  }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(400).json({ error: "Invalid request." });
});

app.listen(port, () => console.log(`GorurGari API listening on port ${port}`));