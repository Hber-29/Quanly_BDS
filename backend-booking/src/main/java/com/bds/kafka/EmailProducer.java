package com.bds.kafka;

import com.bds.config.KafkaConfig;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.serialization.StringSerializer;

import java.util.Properties;

public class EmailProducer {
    private static KafkaProducer<String, String> producer;

    // Đích đến chính xác của anh bưu tá
    public static final String EMAIL_TOPIC = "email-topic";

    static {
        Properties props = new Properties();
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, KafkaConfig.BOOTSTRAP_SERVERS);
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        producer = new KafkaProducer<>(props);
    }

    public static void sendEmailTask(String messageJson) {
        // Ném thẳng vào đúng email-topic
        ProducerRecord<String, String> record = new ProducerRecord<>(EMAIL_TOPIC, messageJson);
        producer.send(record, (metadata, exception) -> {
            if (exception != null) {
                System.err.println("❌ Lỗi khi gửi lệnh Email: " + exception.getMessage());
            }
        });
    }
}
