package com.bds.config;

public class KafkaConfig {
    // Trỏ tới cổng Kafka được mở trong docker-compose.yml của bạn
    public static final String BOOTSTRAP_SERVERS = "localhost:9092";

    // Tên của Topic chứa hàng đợi đặt chỗ
    public static final String BOOKING_TOPIC = "property-booking-requests";
}