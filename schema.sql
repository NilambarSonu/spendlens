-- ==========================================================
-- SPENDLENS DATABASE SCHEMA
-- Suitable for running on Supabase SQL Editor or Neon SQL Editor
-- ==========================================================

-- Enable UUID extension if not already enabled (Standard PostgreSQL)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    role VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create the audits table to store AI spend optimization records
CREATE TABLE IF NOT EXISTS audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    public_token UUID DEFAULT gen_random_uuid() NOT NULL,
    team_size INTEGER NOT NULL,
    primary_use_case VARCHAR(50) NOT NULL,
    tools JSONB NOT NULL,
    total_monthly_spend NUMERIC(10, 2) NOT NULL,
    total_monthly_savings NUMERIC(10, 2) NOT NULL,
    total_annual_savings NUMERIC(10, 2) NOT NULL,
    recommendations JSONB NOT NULL,
    ai_summary TEXT,
    ip_hash VARCHAR(64),
    user_agent VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Lead capture fields (populated after user provides their email)
    email VARCHAR(255),
    company_name VARCHAR(255),
    role VARCHAR(100),
    lead_captured_at TIMESTAMP WITH TIME ZONE,
    
    -- Authenticated User reference
    user_id UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Indexing for fast retrieval of audits via the unique public sharing token
CREATE UNIQUE INDEX IF NOT EXISTS idx_audits_public_token ON audits(public_token);

-- Indexing for email searches/lead lookups
CREATE INDEX IF NOT EXISTS idx_audits_email ON audits(email);

-- Indexing for audit creation times
CREATE INDEX IF NOT EXISTS idx_audits_created_at ON audits(created_at);

-- Alter table to safely add user_id column if audits already exists
ALTER TABLE audits ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Indexing for user association
CREATE INDEX IF NOT EXISTS idx_audits_user_id ON audits(user_id);

-- Optional Row-Level Security (RLS) setup for Supabase:
-- ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow public insert" ON audits FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Allow read via public token" ON audits FOR SELECT USING (true);
