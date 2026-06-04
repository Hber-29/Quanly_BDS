package com.bds.listener;

import com.bds.dao.PropertyDAO; // Đổi lại tên DAO cho đúng với code của bạn nhé
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;
import jakarta.servlet.annotation.WebListener;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.errors.WakeupException;
import org.apache.kafka.common.serialization.StringDeserializer;

import java.time.Duration;
import java.util.Collections;
import java.util.Properties;
import java.util.concurrent.atomic.AtomicBoolean;

@WebListener
public class PropertyStatusConsumerListener implements ServletContextListener {

    private KafkaConsumer<String, String> consumer;
    private Thread consumerThread;
    private final AtomicBoolean closed = new AtomicBoolean(false);

    // Khởi tạo DAO của bạn ở đây
    private PropertyDAO propertyDAO;

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        propertyDAO = new PropertyDAO();

        Properties props = new Properties();
        // Giả sử Kafka của bạn chạy ở localhost:9092
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        // Group ID riêng biệt cho Server Property
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "property-sync-group");
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");

        consumer = new KafkaConsumer<>(props);
        // LẮNG NGHE ĐÚNG CÁI TOPIC MÀ BOOKING VỪA BẮN SANG
        consumer.subscribe(Collections.singletonList("property-sold-topic"));

        consumerThread = new Thread(() -> {
            try {
                System.out.println("🚀 [PROPERTY CONSUMER] Bắt đầu nghe ngóng cập nhật trạng thái nhà...");
                while (!closed.get()) {
                    ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
                    for (ConsumerRecord<String, String> record : records) {
                        processStatusUpdate(record.value());
                    }
                }
            } catch (WakeupException e) {
                if (!closed.get()) throw e;
            } finally {
                consumer.close();
            }
        });
        consumerThread.start();
    }

    private void processStatusUpdate(String messageJson) {
        try {
            JsonObject json = JsonParser.parseString(messageJson).getAsJsonObject();
            int propertyId = json.get("propertyId").getAsInt();
            String status = json.get("status").getAsString();

            System.out.println("📥 [NHẬN LỆNH KAFKA] Yêu cầu chuyển căn nhà " + propertyId + " sang trạng thái: " + status);

            // GỌI DB ĐỂ CẬP NHẬT
            propertyDAO.updatePropertyStatus(propertyId, status);

        } catch (Exception e) {
            System.err.println("❌ Lỗi khi đọc tin nhắn đồng bộ: " + e.getMessage());
        }
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        closed.set(true);
        if (consumer != null) consumer.wakeup();
        try {
            if (consumerThread != null) consumerThread.join();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println("🛑 [PROPERTY CONSUMER] Đã tắt an toàn.");
    }
}
