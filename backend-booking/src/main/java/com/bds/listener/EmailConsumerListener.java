package com.bds.listener;

import com.bds.config.KafkaConfig;
import com.bds.util.EmailUtil;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;
import jakarta.servlet.annotation.WebListener;
import org.apache.kafka.clients.consumer.*;
import org.apache.kafka.common.errors.WakeupException;
import org.apache.kafka.common.serialization.StringDeserializer;

import java.time.Duration;
import java.util.Collections;
import java.util.Properties;
import java.util.concurrent.atomic.AtomicBoolean;

@WebListener
public class EmailConsumerListener implements ServletContextListener {

    private KafkaConsumer<String, String> consumer;
    private Thread consumerThread;
    private final AtomicBoolean closed = new AtomicBoolean(false);

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        Properties props = new Properties();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, KafkaConfig.BOOTSTRAP_SERVERS);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "email-worker-group");
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");

        consumer = new KafkaConsumer<>(props);
        consumer.subscribe(Collections.singletonList("email-topic"));

        consumerThread = new Thread(() -> {
            System.out.println("📬 [KAFKA EMAIL] Anh bưu tá đã sẵn sàng gửi thư...");
            try {
                while (!closed.get()) {
                    ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
                    for (ConsumerRecord<String, String> record : records) {
                        processEmailTask(record.value());
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

    private void processEmailTask(String messageJson) {
        try {
            JsonObject json = JsonParser.parseString(messageJson).getAsJsonObject();
            String email = json.get("email").getAsString();
            String name = json.get("name").getAsString();
            String propertyId = json.get("propertyId").getAsString();

            String subject = "🎉 Chúc mừng bạn đã đặt chỗ thành công BĐS #" + propertyId;
            String body = "<h2 style='color: #d9534f;'>Batdongsan.com.vn</h2>"
                    + "<p>Xin chào <b>" + name + "</b>,</p>"
                    + "<p>Yêu cầu đặt chỗ của bạn cho căn nhà mã số <b>" + propertyId + "</b> đã được xác nhận thành công!</p>"
                    + "<hr/>"
                    + "<h3>Thông tin tư vấn viên của bạn:</h3>"
                    + "<p>👨‍💼 Môi giới: <b>Trần Văn Mẫu (Tạm thời)</b></p>"
                    + "<p>📞 Số điện thoại: <b style='color: blue;'>0988.123.456</b></p>"
                    + "<p><i>Tư vấn viên của chúng tôi sẽ gọi lại cho bạn trong vòng 24h tới. Cảm ơn bạn đã tin tưởng hệ thống!</i></p>";

            EmailUtil.sendEmail(email, subject, body);

        } catch (Exception e) {
            System.err.println("❌ [KAFKA EMAIL] Lỗi xử lý tin nhắn gửi thư: " + e.getMessage());
        }
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        closed.set(true);
        if (consumer != null) consumer.wakeup();
    }
}
