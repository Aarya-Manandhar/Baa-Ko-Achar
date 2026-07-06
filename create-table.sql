-- Make sure to run this SQL in your MySQL database first

CREATE DATABASE IF NOT EXISTS baa_ko_achar;
USE baa_ko_achar;

-- Drop existing tables if they exist (be careful with this in production!)
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS products;

-- Create users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100),
  spice_level ENUM('mild', 'medium', 'hot') DEFAULT 'medium',
  image VARCHAR(255),
  stock INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create improved cart_items table (only essential data)
CREATE TABLE cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_product (user_id, product_id)
);

-- Insert sample products
INSERT INTO products (name, description, price, category, spice_level, image, stock) VALUES
('Spicy Mango Pickle', 'Fiery, tangy, and full of flavor. A bestseller!', 350.00, 'mango', 'hot', 'images/mango-pickle.jpg', 50),
('Classic Lemon Pickle', 'Zesty and refreshing, made with sun-ripened lemons.', 300.00, 'lemon', 'medium', 'images/lemon-pickle.jpg', 30),
('Chicken Achar', 'Unique blend of tender chicken and Nepali spices.', 450.00, 'chicken', 'hot', 'images/chicken-achar.jpg', 25),
('Mixed Vegetable Pickle', 'Garden fresh vegetables in traditional spices.', 280.00, 'mixed', 'mild', 'images/mixed-pickle.jpg', 40);

-- Insert admin user (password: admin123)
INSERT INTO users (first_name, last_name, email, password, role) VALUES
('Admin', 'User', 'admin@baakoachar.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');
