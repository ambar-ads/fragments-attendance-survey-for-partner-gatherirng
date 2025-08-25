-- Migration: Add Credit Note Claim Fields (Fixed Version)
-- Date: 2025-08-25
-- Description: Add fields for credit note claim functionality to acp_registrations table
-- This version handles existing data properly

-- Step 1: Add columns without constraints first
ALTER TABLE acp_registrations 
ADD COLUMN claim_credit_note_to VARCHAR(20);

ALTER TABLE acp_registrations 
ADD COLUMN distributor_name VARCHAR(255);

ALTER TABLE acp_registrations 
ADD COLUMN master_dealer_name VARCHAR(255);

-- Step 2: Update existing rows with default values
-- Set all existing records to use 'distributor' as default and pick a default distributor
UPDATE acp_registrations 
SET claim_credit_note_to = 'distributor',
    distributor_name = 'Agres Info Teknologi, PT'
WHERE claim_credit_note_to IS NULL;

-- Step 3: Now add the constraints
ALTER TABLE acp_registrations 
ADD CONSTRAINT check_claim_credit_note_to 
CHECK (claim_credit_note_to IN ('distributor', 'master_dealer'));

ALTER TABLE acp_registrations 
ADD CONSTRAINT check_credit_note_claim 
CHECK (
  (claim_credit_note_to = 'distributor' AND distributor_name IS NOT NULL AND master_dealer_name IS NULL) OR
  (claim_credit_note_to = 'master_dealer' AND master_dealer_name IS NOT NULL AND distributor_name IS NULL)
);

-- Step 4: Add comments
COMMENT ON COLUMN acp_registrations.claim_credit_note_to IS 'Where to claim credit note: distributor or master_dealer';
COMMENT ON COLUMN acp_registrations.distributor_name IS 'Name of the distributor if claim_credit_note_to is distributor';
COMMENT ON COLUMN acp_registrations.master_dealer_name IS 'Name of the master dealer if claim_credit_note_to is master_dealer';
