-- Migration: create orders table
-- Run this in the `baa_ko_achar` database (phpMyAdmin or mysql CLI)

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  location VARCHAR(255) DEFAULT '',
  phone VARCHAR(50) DEFAULT '',
  items JSON NOT NULL,
  total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status VARCHAR(50) DEFAULT 'pending',
  payment_transaction_id VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
