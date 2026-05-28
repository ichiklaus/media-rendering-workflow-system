CREATE DATABASE IF NOT EXISTS mrws;
USE mrws;

-- CREATE RENDERS TABLE
CREATE TABLE renders (
  id VARCHAR(50) PRIMARY KEY,
  composition_id VARCHAR(100),
  status VARCHAR(20),
  input JSON,
  output_path TEXT,
  thumbnail_path TEXT,
  error TEXT,
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3,
  cancelled BOOLEAN DEFAULT FALSE,
  progress FLOAT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_status (status)
);

-- CREATE RECIPIENTS TABLE
CREATE TABLE recipients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campaign_uuid VARCHAR(36) NOT NULL,
    recipient_uuid VARCHAR(36) NOT NULL, 
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    videos JSON DEFAULT (JSON_ARRAY()), 
    render_id VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    current_template_id VARCHAR(100),
    current_template_request_id VARCHAR(60),
    current_template_request_year VARCHAR(4),
    current_template_path TEXT,
    INDEX idx_campaign (campaign_uuid),
    INDEX idx_recipient (recipient_uuid),
    UNIQUE KEY unique_campaign_recipient (campaign_uuid, recipient_uuid),
    CONSTRAINT fk_recipient_render 
    FOREIGN KEY (render_id) REFERENCES renders(id) 
    ON DELETE SET NULL
);

-- Create a history table for recipient template requests
CREATE TABLE recipient_template_requests (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  campaign_uuid VARCHAR(100) NOT NULL,
  recipient_uuid VARCHAR(100) NOT NULL,
  template_id VARCHAR(100) NOT NULL,
  template_request_id VARCHAR(50) NOT NULL,
  template_request_year VARCHAR(4) NOT NULL,
  template_path TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_recipient_template_history (recipient_uuid, template_id, created_at),
  INDEX idx_template_request_id (template_request_id)
);