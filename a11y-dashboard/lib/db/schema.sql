-- A11y Dashboard Database Schema
-- PostgreSQL schema for accessibility checking tool

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'designer' CHECK (role IN ('admin', 'designer', 'developer')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Figma Files table
CREATE TABLE figma_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_key VARCHAR(255) UNIQUE NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT,
  last_scanned_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Figma Pages table
CREATE TABLE figma_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID REFERENCES figma_files(id) ON DELETE CASCADE,
  page_id VARCHAR(255) NOT NULL,
  page_name VARCHAR(255) NOT NULL,
  last_scanned_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(file_id, page_id)
);

-- Scans table
CREATE TABLE scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID REFERENCES figma_files(id) ON DELETE CASCADE,
  initiated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  scan_type VARCHAR(50) NOT NULL CHECK (scan_type IN ('full_file', 'single_page')),
  total_issues INTEGER DEFAULT 0,
  critical_count INTEGER DEFAULT 0,
  high_count INTEGER DEFAULT 0,
  medium_count INTEGER DEFAULT 0,
  low_count INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- Issues table
CREATE TABLE issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID REFERENCES scans(id) ON DELETE CASCADE,
  page_id UUID REFERENCES figma_pages(id) ON DELETE CASCADE,
  element_id VARCHAR(255),
  element_name VARCHAR(255),
  category VARCHAR(50) NOT NULL CHECK (category IN ('contrast', 'text_size', 'touch_target', 'heading_structure', 'color_only', 'keyboard', 'semantics', 'focus_indicator', 'alt_text')),
  severity VARCHAR(50) NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  wcag_criteria VARCHAR(50),
  wcag_level VARCHAR(10) CHECK (wcag_level IN ('A', 'AA', 'AAA')),
  description TEXT NOT NULL,
  current_value VARCHAR(255),
  required_value VARCHAR(255),
  fix_recommendation TEXT,
  screenshot_url TEXT,
  location_x INTEGER,
  location_y INTEGER,
  frame_name VARCHAR(255),
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'wont_fix', 'duplicate')),
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP
);

-- Annotations table
CREATE TABLE annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  page_id UUID REFERENCES figma_pages(id) ON DELETE CASCADE,
  annotation_type VARCHAR(50) NOT NULL CHECK (annotation_type IN ('blue_line', 'keyboard_flow', 'focus_state', 'aria_label', 'screen_reader', 'note')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  svg_data TEXT,
  position_data JSONB,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- WCAG Guidelines table (migrated from JSON)
CREATE TABLE wcag_guidelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  criteria_number VARCHAR(50) UNIQUE NOT NULL,
  level VARCHAR(10) NOT NULL CHECK (level IN ('A', 'AA', 'AAA')),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  how_to_meet JSONB,
  common_mistakes JSONB,
  examples JSONB,
  tags JSONB,
  url TEXT,
  version VARCHAR(10) DEFAULT '2.1'
);

-- Indexes for performance
CREATE INDEX idx_issues_scan_id ON issues(scan_id);
CREATE INDEX idx_issues_page_id ON issues(page_id);
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_severity ON issues(severity);
CREATE INDEX idx_issues_category ON issues(category);
CREATE INDEX idx_issues_assigned_to ON issues(assigned_to);
CREATE INDEX idx_issues_created_at ON issues(created_at DESC);

CREATE INDEX idx_scans_file_id ON scans(file_id);
CREATE INDEX idx_scans_created_at ON scans(created_at DESC);

CREATE INDEX idx_pages_file_id ON figma_pages(file_id);

CREATE INDEX idx_comments_issue_id ON comments(issue_id);
CREATE INDEX idx_annotations_issue_id ON annotations(issue_id);
CREATE INDEX idx_annotations_page_id ON annotations(page_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_figma_files_updated_at BEFORE UPDATE ON figma_files
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_figma_pages_updated_at BEFORE UPDATE ON figma_pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_issues_updated_at BEFORE UPDATE ON issues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_annotations_updated_at BEFORE UPDATE ON annotations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
