-- ==========================================================
-- FILE INSERT DỮ LIỆU MẪU (DÙNG LÀM TEMPLATE)
-- Ngày mặc định: 01/01/2026
-- Địa điểm: Hà Nội, Thanh Hóa, Hồ Chí Minh (6 bến xe)
-- Không có dữ liệu User, Booking, Payment
-- ==========================================================

USE bus_ticket_db;

-- 1. THÊM TỈNH THÀNH
INSERT INTO province (name, code) VALUES 
('Hà Nội', 'HN'),
('Thanh Hóa', 'TH'),
('Hồ Chí Minh', 'HCM');

-- 2. THÊM BẾN XE
INSERT INTO station (name, address, province_id) VALUES 
('Bến Xe Mỹ Đình', 'Nam Từ Liêm, Hà Nội', 1),   -- ID: 1
('Bến Xe Giáp Bát', 'Giải Phóng, Hà Nội', 1),    -- ID: 2
('Bến Xe Phía Bắc', 'TP. Thanh Hóa', 2),        -- ID: 3
('Bến Xe Phía Tây', 'TP. Thanh Hóa', 2),        -- ID: 4
('Bến Xe Miền Đông', 'Bình Thạnh, TP.HCM', 3),  -- ID: 5
('Bến Xe Miền Tây', 'Bình Tân, TP.HCM', 3);     -- ID: 6

-- 3. THÊM LOẠI XE
INSERT INTO bus_type (name, total_seats) VALUES 
('Xe Giường Nằm 40 chỗ', 40),
('Xe Limousine 9 chỗ', 9);

-- 4. THÊM XE
INSERT INTO bus (license_plate, bus_type_id, status) VALUES 
('29A-123.45', 1, 'ACTIVE'),
('29B-678.90', 1, 'ACTIVE'),
('36A-111.22', 2, 'ACTIVE'),
('36B-333.44', 2, 'ACTIVE'),
('51G-555.66', 1, 'ACTIVE'),
('51H-777.88', 1, 'ACTIVE');

-- 5. THÊM TUYẾN ĐƯỜNG (Route)
INSERT INTO route (start_station_id, end_station_id) VALUES 
(1, 3), (3, 1), -- Mỹ Đình <-> Phía Bắc
(2, 5), (5, 2), -- Giáp Bát <-> Miền Đông
(4, 6), (6, 4); -- Phía Tây <-> Miền Tây

-- 6. THÊM 10 CHUYẾN XE MẪU TRONG NGÀY 01/01/2026
-- Giá vé được chia làm 3 mức: 150k (gần), 250k (limousine), 750k-850k (đường dài)
INSERT INTO trip (route_id, bus_id, departure_time, arrival_time, price, status, booked_seats) VALUES 
(1, 1, '2026-01-01 06:00:00', '2026-01-01 09:30:00', 150000, 'ACTIVE', 0),
(2, 2, '2026-01-01 07:30:00', '2026-01-01 11:00:00', 150000, 'ACTIVE', 0),
(3, 5, '2026-01-01 08:00:00', '2026-01-02 09:00:00', 850000, 'ACTIVE', 0),
(4, 6, '2026-01-01 10:00:00', '2026-01-02 11:00:00', 850000, 'ACTIVE', 0),
(5, 3, '2026-01-01 13:00:00', '2026-01-02 15:00:00', 750000, 'ACTIVE', 0),
(6, 4, '2026-01-01 14:00:00', '2026-01-02 16:00:00', 750000, 'ACTIVE', 0),
(1, 1, '2026-01-01 17:00:00', '2026-01-01 20:30:00', 150000, 'ACTIVE', 0),
(2, 2, '2026-01-01 19:00:00', '2026-01-01 22:30:00', 150000, 'ACTIVE', 0),
(1, 3, '2026-01-01 21:00:00', '2026-01-02 00:30:00', 250000, 'ACTIVE', 0),
(3, 5, '2026-01-01 22:00:00', '2026-01-02 23:00:00', 850000, 'ACTIVE', 0);