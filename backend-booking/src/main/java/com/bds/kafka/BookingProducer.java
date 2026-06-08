package com.bds.kafka;

import com.bds.config.KafkaConfig;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.serialization.StringSerializer;

import java.util.Properties;

public class BookingProducer {
    private static KafkaProducer<String, String> producer;

    // Khởi tạo Producer một lần duy nhất khi class được gọi (Singleton Pattern)
    static {
        Properties props = new Properties();
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, KafkaConfig.BOOTSTRAP_SERVERS);
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        // Đảm bảo tin nhắn không bị mất khi có sự cố mạng
        props.put(ProducerConfig.ACKS_CONFIG, "all");

        producer = new KafkaProducer<>(props);
    }

    /**
     * Hàm dùng để gửi tin nhắn đặt chỗ vào Topic
     */
    public static void sendBookingMessage(String propertyId, String messageJson) {
        //  BÍ QUYẾT RACE CONDITION:
        // Đặt 'propertyId' làm KAFKA KEY. Kafka sẽ ép tất cả tin nhắn có chung Key
        // phải đi chung 1 làn đường (Partition) và xếp hàng nối đuôi nhau tuyệt đối!
        ProducerRecord<String, String> record = new ProducerRecord<>(
                KafkaConfig.BOOKING_TOPIC,
                propertyId, // Key
                messageJson // Value
        );

        producer.send(record, (metadata, exception) -> {
            if (exception != null) {
                System.err.println("❌ Lỗi khi ném vào Kafka: " + exception.getMessage());
            } else {
                System.out.println("✅ Đã ném vào Kafka - Topic: " + metadata.topic() +
                        ", Phân luồng: " + metadata.partition() +
                        ", Vị trí xếp hàng: " + metadata.offset());
            }
        });
    }

    // Đóng Producer khi tắt server Tomcat
    public static void close() {
        if (producer != null) {
            producer.close();
        }
    }
}