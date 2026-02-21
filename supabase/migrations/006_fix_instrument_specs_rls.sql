-- Fix RLS policies for instrument_specs table
-- Allow authenticated users to insert new instruments during CSV import

DROP POLICY IF EXISTS "All authenticated users can insert instrument specs" ON instrument_specs;

CREATE POLICY "All authenticated users can insert instrument specs"
  ON instrument_specs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Optional: Allow users to update instruments (for future features)
DROP POLICY IF EXISTS "All authenticated users can update instrument specs" ON instrument_specs;

CREATE POLICY "All authenticated users can update instrument specs"
  ON instrument_specs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
