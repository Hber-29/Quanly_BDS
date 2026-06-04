package com.bds.kafka;

import com.bds.config.KafkaConfig;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.serialization.StringSerializer;

import java.util.Properties;

public class PropertyStatusProducer {
    private static KafkaProducer<String, String> producer;

    // Tên topic dùng để báo tin cho server Property
    public static final String PROPERTY_SOLD_TOPIC = "property-sold-topic";

    // Khởi tạo 1 lần duy nhất (Singleton)
    static {
        Properties props = new Properties();
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, KafkaConfig.BOOTSTRAP_SERVERS);
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        producer = new KafkaProducer<>(props);
    }

    // Hàm bắn tin nhắn đi
    public static void sendStatusUpdate(String propertyId, String messageJson) {
        ProducerRecord<String, String> record = new ProducerRecord<>(PROPERTY_SOLD_TOPIC, propertyId, messageJson);
        producer.send(record, (metadata, exception) -> {
            if (exception == null) {
                System.out.println("   📢 [KAFKA SENDER] Đã bắn tin nhắn đổi trạng thái nhà " + propertyId + " sang Property Server!");
            } else {
                System.err.println("   ❌ [KAFKA SENDER] Lỗi khi bắn tin nhắn: " + exception.getMessage());
            }
        });
    }
}