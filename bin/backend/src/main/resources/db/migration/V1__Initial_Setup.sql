
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'USER',
    sustainability_preference VARCHAR(255)
);

CREATE TABLE emission_factors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(255) NOT NULL,
    activity_type VARCHAR(255) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    kg_co2_per_unit DOUBLE NOT NULL
);

CREATE TABLE activity_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category VARCHAR(255) NOT NULL,
    activity_type VARCHAR(255) NOT NULL,
    quantity DOUBLE NOT NULL,
    unit VARCHAR(50) NOT NULL,
    log_date DATETIME NOT NULL,
    emissions_kg_co2 DOUBLE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE goals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    description VARCHAR(255) NOT NULL,
    target_value DOUBLE NOT NULL,
    current_value DOUBLE NOT NULL,
    status VARCHAR(50) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE badges (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    date_earned DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert some default emission factors
INSERT INTO emission_factors (category, activity_type, unit, kg_co2_per_unit) VALUES
('Transport', 'Car', 'km', 0.192),
('Transport', 'Flight', 'km', 0.25),
('Transport', 'Public Transit', 'km', 0.04),
('Electricity', 'Grid', 'kWh', 0.4),
('Food', 'Meat Meal', 'servings', 3.3),
('Food', 'Vegan Meal', 'servings', 0.5),
('Shopping', 'Clothes', 'usd', 0.5);
