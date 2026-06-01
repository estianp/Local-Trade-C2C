CREATE DATABASE IF NOT EXISTS LocalTrade_DB;
USE LocalTrade_DB;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0,
    total_ratings INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    parent_id INT NULL,
    UNIQUE KEY unique_category (name, parent_id),
    FOREIGN KEY (parent_id) REFERENCES categories(id)
);

CREATE TABLE items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image_filename VARCHAR(255),
    is_sold BOOLEAN DEFAULT FALSE,
    sold_to INT DEFAULT NULL,
    sold_at TIMESTAMP DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (sold_to) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_category_id (category_id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_is_sold (is_sold)
);

CREATE TABLE payment_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    card_holder_name VARCHAR(255) NOT NULL,
    card_number VARCHAR(255) NOT NULL,
    expiry_date VARCHAR(7) NOT NULL,
    cvv VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE shipping_addresses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    street_address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rater_id INT NOT NULL,
    ratee_id INT NOT NULL,
    item_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 10),
    review TEXT,
    rating_type ENUM('buyer_to_seller', 'seller_to_buyer') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rater_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (ratee_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
    UNIQUE KEY unique_rating (rater_id, ratee_id, item_id, rating_type),
    INDEX idx_ratee_id (ratee_id),
    INDEX idx_item_id (item_id)
);

INSERT INTO categories (name, parent_id) VALUES 
('Electronics', NULL),
('Mobile Phones', 1),
('Computers & Laptops', 1),
('Tablets', 1),
('Audio Equipment', 1),
('Clothing & Fashion', NULL),
('Mens Clothing', 6),
('Womens Clothing', 6),
('Shoes', 6),
('Fashion Accessories', 6),
('Home & Living', NULL),
('Furniture', 11),
('Home Decor', 11),
('Kitchen Appliances', 11),
('Bedding & Linens', 11),
('Sports & Outdoors', NULL),
('Sports Equipment', 16),
('Outdoor Gear', 16),
('Fitness', 16),
('Bikes & Scooters', 16),
('Books & Education', NULL),
('Books', 21),
('Textbooks', 21),
('Learning Materials', 21),
('Toys & Games', NULL),
('Board Games', 25),
('Video Games', 25),
('Toys', 25),
('Beauty & Personal Care', NULL),
('Skincare', 29),
('Haircare', 29),
('Makeup', 29),
('Health & Wellness', NULL),
('Vitamins & Supplements', 33),
('Medical Equipment', 33),
('Fitness Equipment', 33),
('Automotive', NULL),
('Car Parts', 37),
('Motorcycle Parts', 37),
('Auto Accessories', 37),
('Pets & Pet Supplies', NULL),
('Pet Food', 41),
('Pet Toys', 41),
('Pet Accessories', 41),
('Musical Instruments', NULL),
('Guitars', 45),
('Keyboards', 45),
('Drums', 45),
('Art & Collectibles', NULL),
('Art', 49),
('Collectibles', 49),
('Vintage Items', 49),
('Other', NULL);

-- Add trigger to automatically update user ratings when a new rating is inserted
DELIMITER //

CREATE TRIGGER update_user_rating_on_insert 
AFTER INSERT ON ratings
FOR EACH ROW
BEGIN
    UPDATE users 
    SET average_rating = (SELECT AVG(rating) FROM ratings WHERE ratee_id = NEW.ratee_id),
        total_ratings = (SELECT COUNT(*) FROM ratings WHERE ratee_id = NEW.ratee_id)
    WHERE id = NEW.ratee_id;
END //

DELIMITER ;

