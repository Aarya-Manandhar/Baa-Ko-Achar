-- Create database
CREATE DATABASE IF NOT EXISTS baa_ko_achar;
USE baa_ko_achar;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  product_image VARCHAR(255),
  product_price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
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

-- Update the products table with more authentic Nepali pickle products
DELETE FROM products;

INSERT INTO products (name, description, price, category, spice_level, image, stock) VALUES
('Spicy Mango Pickle', 'Traditional raw mango pickle with mustard oil and authentic Nepali spices. A perfect blend of tangy and spicy flavors.', 350.00, 'mango', 'hot', 'PHOTOS/6.jpg', 50),
('Classic Lemon Pickle', 'Zesty lemon pickle made with sun-dried lemons, turmeric, and traditional spices. Refreshing and tangy.', 300.00, 'lemon', 'medium', 'PHOTOS/6.jpg', 30),
('Chicken Achar', 'Authentic Nepali chicken pickle with tender meat pieces marinated in traditional spices and mustard oil.', 450.00, 'chicken', 'hot', 'PHOTOS/6.jpg', 25),
('Mixed Vegetable Pickle', 'Assorted seasonal vegetables pickled in traditional Nepali style with aromatic spices.', 280.00, 'mixed', 'mild', 'PHOTOS/6.jpg', 40),
('Gundruk Pickle', 'Fermented leafy green vegetable pickle, a traditional Nepali delicacy rich in probiotics.', 320.00, 'gundruk', 'medium', 'PHOTOS/6.jpg', 35),
('Radish Pickle (Mula ko Achar)', 'Crunchy white radish pickle with sesame seeds and traditional Nepali spices.', 290.00, 'radish', 'mild', 'PHOTOS/6.jpg', 45),
('Bamboo Shoot Pickle', 'Traditional bamboo shoot pickle (Tama ko Achar) with authentic mountain flavors.', 380.00, 'bamboo', 'medium', 'PHOTOS/6.jpg', 20),
('Garlic Pickle (Lasun ko Achar)', 'Spicy garlic pickle with mustard oil, perfect for boosting immunity and flavor.', 340.00, 'garlic', 'hot', 'PHOTOS/6.jpg', 30),
('Cauliflower Pickle', 'Fresh cauliflower florets pickled with turmeric, chili, and traditional spices.', 310.00, 'cauliflower', 'medium', 'PHOTOS/6.jpg', 25),
('Green Chili Pickle', 'Fiery green chili pickle for spice lovers, made with fresh chilies and aromatic oils.', 360.00, 'chili', 'hot', 'PHOTOS/6.jpg', 40),
('Cucumber Pickle (Kakro ko Achar)', 'Refreshing cucumber pickle with mint and traditional Nepali seasonings.', 270.00, 'cucumber', 'mild', 'PHOTOS/6.jpg', 35),
('Tomato Pickle', 'Sweet and tangy tomato pickle with jaggery and traditional spices.', 300.00, 'tomato', 'medium', 'PHOTOS/6.jpg', 30),
('Bitter Gourd Pickle', 'Healthy bitter gourd pickle with medicinal properties and authentic taste.', 350.00, 'bitter-gourd', 'medium', 'PHOTOS/6.jpg', 15),
('Carrot Pickle (Gajar ko Achar)', 'Sweet and spicy carrot pickle with sesame seeds and mustard oil.', 290.00, 'carrot', 'mild', 'PHOTOS/6.jpg', 40),
('Fish Pickle (Machha ko Achar)', 'Traditional fish pickle with river fish and authentic Nepali spices.', 480.00, 'fish', 'hot', 'PHOTOS/6.jpg', 20),
('Potato Pickle (Alu ko Achar)', 'Spiced potato pickle with black mustard seeds and traditional seasonings.', 260.00, 'potato', 'mild', 'PHOTOS/6.jpg', 50),
('Sesame Seed Pickle', 'Nutty sesame seed pickle with jaggery and traditional Nepali spices.', 380.00, 'sesame', 'medium', 'PHOTOS/6.jpg', 25),
('Mustard Greens Pickle', 'Fermented mustard greens pickle with authentic mountain flavors.', 320.00, 'mustard-greens', 'medium', 'PHOTOS/6.jpg', 30),
('Pumpkin Pickle (Pharsi ko Achar)', 'Sweet pumpkin pickle with fennel seeds and traditional spices.', 300.00, 'pumpkin', 'mild', 'PHOTOS/6.jpg', 35),
('Dried Fish Pickle', 'Traditional dried fish pickle with intense flavors and authentic preparation.', 520.00, 'dried-fish', 'hot', 'PHOTOS/6.jpg', 15);

-- Insert admin user (password: admin123)
INSERT INTO users (first_name, last_name, email, password, role) VALUES
('Admin', 'User', 'admin@baakoachar.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');
