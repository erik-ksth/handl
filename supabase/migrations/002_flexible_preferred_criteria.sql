-- Migration: Convert preferred_criteria from ENUM to TEXT
-- This allows for flexible values like "cheapest, best_rated" from AI analysis

-- Step 1: Add a temporary text column
ALTER TABLE public.tasks ADD COLUMN preferred_criteria_new TEXT;

-- Step 2: Copy data from old column to new column
UPDATE public.tasks SET preferred_criteria_new = preferred_criteria::TEXT;

-- Step 3: Drop the old column
ALTER TABLE public.tasks DROP COLUMN preferred_criteria;

-- Step 4: Rename new column to original name
ALTER TABLE public.tasks RENAME COLUMN preferred_criteria_new TO preferred_criteria;

-- Step 5: Drop the enum type (optional, keeps things clean)
DROP TYPE IF EXISTS preferred_criteria;
