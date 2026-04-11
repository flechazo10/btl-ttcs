CREATE DATABASE IF NOT EXISTS bus_ticket_db;
USE bus_ticket_db;

CREATE TABLE province (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50)
);

CREATE TABLE station (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    province_id BIGINT,
    FOREIGN KEY (province_id) REFERENCES province(id)
);

CREATE TABLE bus_type (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    total_seats INT NOT NULL
);

CREATE TABLE bus (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    license_plate VARCHAR(50) NOT NULL,
    bus_type_id BIGINT,
    status VARCHAR(50),
    FOREIGN KEY (bus_type_id) REFERENCES bus_type(id)
);

CREATE TABLE route (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    start_station_id BIGINT,
    end_station_id BIGINT,
    FOREIGN KEY (start_station_id) REFERENCES station(id),
    FOREIGN KEY (end_station_id) REFERENCES station(id)
);

CREATE TABLE trip (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    route_id BIGINT,
    bus_id BIGINT,
    departure_time DATETIME,
    arrival_time DATETIME,
    price DECIMAL(10,2),
    status VARCHAR(50),
    booked_seats INT NOT NULL DEFAULT 0,
    FOREIGN KEY (route_id) REFERENCES route(id),
    FOREIGN KEY (bus_id) REFERENCES bus(id)
);

CREATE TABLE user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50)
);

-- CẬP NHẬT TẠI ĐÂY: Bảng Booking
CREATE TABLE booking (
    id VARCHAR(50) PRIMARY KEY,
    user_id BIGINT,
    trip_id BIGINT, -- 🌟 THAY ĐỔI 1: Thêm khóa ngoại để biết đơn này của chuyến nào
    passenger_name VARCHAR(255),
    passenger_phone VARCHAR(20),
    note TEXT,
    pickup_location VARCHAR(255),
    dropoff_location VARCHAR(255),
    total_amount DECIMAL(10,2),
    booking_time DATETIME,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', 
    total_tickets INT NOT NULL DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (trip_id) REFERENCES trip(id) -- 🌟 THAY ĐỔI 2: Khai báo liên kết với bảng TRIP
);

CREATE TABLE ticket (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id VARCHAR(50),
    trip_id BIGINT,
    seat_name VARCHAR(50),
    price DECIMAL(10,2),
    ticket_status VARCHAR(50),
    FOREIGN KEY (booking_id) REFERENCES booking(id),
    FOREIGN KEY (trip_id) REFERENCES trip(id)
);

CREATE TABLE payment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,             
    transaction_no VARCHAR(100),               
    payment_time DATETIME,                     
    status VARCHAR(50) NOT NULL,               
    FOREIGN KEY (booking_id) REFERENCES booking(id)
);