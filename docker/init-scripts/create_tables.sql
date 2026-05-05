-- 1. BẢNG ACCOUNT
CREATE TABLE account (
                         account_id SERIAL PRIMARY KEY,
                         username VARCHAR(50) UNIQUE NOT NULL,
                         password VARCHAR(255) NOT NULL,
                         role VARCHAR(20) NOT NULL,
                         is_active BOOLEAN DEFAULT TRUE,
                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. BẢNG STAFF INFO
CREATE TABLE staff_info (
                            staff_id SERIAL PRIMARY KEY,
                            account_id INT UNIQUE REFERENCES account(account_id),
                            full_name VARCHAR(100) NOT NULL,
                            gender SMALLINT,
                            dob DATE,
                            phone VARCHAR(15),
                            email VARCHAR(100),
                            avatar_url VARCHAR(255),
                            site_id VARCHAR(10)
);

-- 3. BẢNG CUSTOMER INFO
CREATE TABLE customer_info (
                               customer_id SERIAL PRIMARY KEY,
                               account_id INT UNIQUE REFERENCES account(account_id),
                               full_name VARCHAR(100) NOT NULL,
                               gender SMALLINT,
                               dob DATE,
                               phone VARCHAR(15),
                               email VARCHAR(100),
                               address TEXT,
                               preferences TEXT
);

-- 4. BẢNG CATEGORY
CREATE TABLE category (
                          category_id SERIAL PRIMARY KEY,
                          category_name VARCHAR(100) NOT NULL
);

-- 5. BẢNG REGION
CREATE TABLE region (
                        region_id SERIAL PRIMARY KEY,
                        region_name VARCHAR(100) NOT NULL,
                        site_id VARCHAR(10)
);

-- 6. BẢNG PROPERTY
CREATE TABLE property (
                          property_id VARCHAR(20) PRIMARY KEY,
                          title VARCHAR(255) NOT NULL,
                          category_id INT REFERENCES category(category_id),
                          region_id INT REFERENCES region(region_id),
                          account_id INT REFERENCES account(account_id),
                          price DECIMAL(15,2),
                          area FLOAT,
                          address TEXT,
                          latitude DECIMAL(10,8),
                          longitude DECIMAL(11,8),
                          thumbnail VARCHAR(255),
                          status INT DEFAULT 0
);

-- 7. BẢNG PROPERTY IMAGE
CREATE TABLE property_image (
                                image_id SERIAL PRIMARY KEY,
                                property_id VARCHAR(20) REFERENCES property(property_id) ON DELETE CASCADE,
                                image_url VARCHAR(255) NOT NULL
);

-- 8. BẢNG INQUIRY
CREATE TABLE inquiry (
                         inquiry_id SERIAL PRIMARY KEY,
                         property_id VARCHAR(20) REFERENCES property(property_id),
                         customer_id INT REFERENCES customer_info(customer_id),
                         message TEXT,
                         is_processed BOOLEAN DEFAULT FALSE,
                         sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. BẢNG TRANSACTIONS
CREATE TABLE transactions (
                              transaction_id SERIAL PRIMARY KEY,
                              property_id VARCHAR(20) REFERENCES property(property_id),
                              customer_id INT REFERENCES customer_info(customer_id),
                              amount DECIMAL(15,2) NOT NULL,
                              payment_method VARCHAR(50),
                              status VARCHAR(20) DEFAULT 'PENDING',
                              transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert dữ liệu mẫu để test Đăng nhập luôn
INSERT INTO account (username, password, role) VALUES ('admin', '123456', 'ADMIN');