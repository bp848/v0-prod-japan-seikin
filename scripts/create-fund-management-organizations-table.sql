-- Create fund_management_organizations table
CREATE TABLE IF NOT EXISTS public.fund_management_organizations (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    politician_id BIGINT REFERENCES public.politicians(id) ON DELETE SET NULL,
    organization_name VARCHAR(255) NOT NULL,
    office_type VARCHAR(100),
    report_year INTEGER,
    notified_date DATE,
    jurisdiction VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_fmo_politician_id ON public.fund_management_organizations(politician_id);
CREATE INDEX IF NOT EXISTS idx_fmo_organization_name ON public.fund_management_organizations(organization_name);
CREATE INDEX IF NOT EXISTS idx_fmo_report_year ON public.fund_management_organizations(report_year);
CREATE INDEX IF NOT EXISTS idx_fmo_jurisdiction ON public.fund_management_organizations(jurisdiction);

-- RLS (Row Level Security) - Enable if needed, and define policies
-- ALTER TABLE public.fund_management_organizations ENABLE ROW LEVEL SECURITY;
-- Example Policy: Allow public read-only access
-- CREATE POLICY "Allow public read-only access" ON public.fund_management_organizations FOR SELECT USING (true);

COMMENT ON TABLE public.fund_management_organizations IS 'Stores information about political fund management organizations.';
COMMENT ON COLUMN public.fund_management_organizations.id IS 'Primary key for the fund management organization.';
COMMENT ON COLUMN public.fund_management_organizations.politician_id IS 'Foreign key referencing the politicians table, linking the organization to a specific politician.';
COMMENT ON COLUMN public.fund_management_organizations.organization_name IS 'The official name of the fund management organization.';
COMMENT ON COLUMN public.fund_management_organizations.office_type IS 'The type of public office associated with the organization (e.g., 衆議院議員, 参議院議員).';
COMMENT ON COLUMN public.fund_management_organizations.report_year IS 'The year for which the financial report is made (e.g., 2023).';
COMMENT ON COLUMN public.fund_management_organizations.notified_date IS 'The date the organization or its details were officially notified or registered.';
COMMENT ON COLUMN public.fund_management_organizations.jurisdiction IS 'The governing jurisdiction for the organization (e.g., 東京都, 大阪府).';
COMMENT ON COLUMN public.fund_management_organizations.is_active IS 'Indicates whether the organization is currently active.';
COMMENT ON COLUMN public.fund_management_organizations.created_at IS 'Timestamp of when the record was created.';
COMMENT ON COLUMN public.fund_management_organizations.updated_at IS 'Timestamp of when the record was last updated.';

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on row update
CREATE TRIGGER set_timestamp_fund_management_organizations
BEFORE UPDATE ON public.fund_management_organizations
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();
