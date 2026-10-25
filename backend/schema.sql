CREATE TABLE IF NOT EXISTS bookings (
  id BIGSERIAL PRIMARY KEY,
  pickup TEXT NOT NULL,
  destination TEXT NOT NULL,
  ride_type TEXT NOT NULL CHECK (ride_type IN ('bike', 'go', 'xl')),
  estimated_fare_bdt INTEGER NOT NULL CHECK (estimated_fare_bdt >= 0),
  status TEXT NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested', 'accepted', 'in_progress', 'completed', 'cancelled')),
  rider_name TEXT,
  rider_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS bookings_created_at_idx ON bookings (created_at DESC);