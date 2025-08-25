-- Migration: Add Credit Note Claim Fields
-- Date: 2025-08-25
-- Description: Add fields for credit note claim functionality to acp_registrations table

-- Add fields for credit note claim functionality to acp_registrations table
ALTER TABLE acp_registrations 
ADD COLUMN claim_credit_note_to VARCHAR(20) CHECK (claim_credit_note_to IN ('distributor', 'master_dealer'));

ALTER TABLE acp_registrations 
ADD COLUMN distributor_name VARCHAR(255);

ALTER TABLE acp_registrations 
ADD COLUMN master_dealer_name VARCHAR(255);

-- Add constraint to ensure one of the fields is filled based on claim_credit_note_to
ALTER TABLE acp_registrations 
ADD CONSTRAINT check_credit_note_claim 
CHECK (
  (claim_credit_note_to = 'distributor' AND distributor_name IS NOT NULL AND master_dealer_name IS NULL) OR
  (claim_credit_note_to = 'master_dealer' AND master_dealer_name IS NOT NULL AND distributor_name IS NULL)
);

-- Add comments
COMMENT ON COLUMN acp_registrations.claim_credit_note_to IS 'Where to claim credit note: distributor or master_dealer';
COMMENT ON COLUMN acp_registrations.distributor_name IS 'Name of the distributor if claim_credit_note_to is distributor';
COMMENT ON COLUMN acp_registrations.master_dealer_name IS 'Name of the master dealer if claim_credit_note_to is master_dealer';
