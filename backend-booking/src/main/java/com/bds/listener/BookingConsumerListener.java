package com.bds.listener;

import com.bds.config.KafkaConfig;
import com.bds.dao.BookingRequestDAO;
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

// 🔥 Chú thích @WebListener giúp Tomcat tự động nhận diện và chạy file này khi Server Start
@WebListener
public class BookingConsumerListener implements ServletContextListener {

    private KafkaConsumer<String, String> consumer;
    private BookingRequestDAO bookingDAO;
    private Thread consumerThread;

    // Cờ báo hiệu vòng lặp chạy ngầm (true = đang dừng, false = đang chạy)
    private final AtomicBoolean closed = new AtomicBoolean(false);

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        bookingDAO = new BookingRequestDAO();

        // 1. Cấu hình người nhận (Consumer)
        Properties props = new Properties();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, KafkaConfig.BOOTSTRAP_SERVERS);
        // GROUP_ID dùng để đánh dấu nhóm công nhân.
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "booking-worker-group");
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest"); // Đọc từ tin nhắn cũ nhất nếu lỡ bị tắt server

        consumer = new KafkaConsumer<>(props);
        consumer.subscribe(Collections.singletonList(KafkaConfig.BOOKING_TOPIC));

        // 2. Tạo một Thread riêng để không làm treo Tomcat
        consumerThread = new Thread(() -> {
            try {
                System.out.println("🚀 [KAFKA CONSUMER] Bắt đầu chạy ngầm chờ đơn đặt chỗ...");
                while (!closed.get()) {
                    // Cứ 100 mili-giây lại nhìn vào Kafka xem có phong bì nào mới không
                    ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));

                    for (ConsumerRecord<String, String> record : records) {
                        processBooking(record.value());
                    }
                }
            } catch (WakeupException e) {
                // Lỗi này văng ra khi ta ép Consumer phải tắt (bỏ qua nếu server đang shutdown)
                if (!closed.get()) throw e;
            } finally {
                consumer.close();
            }
        });

        consumerThread.start();
    }

    // 3. HÀM CỐT LÕI XỬ LÝ TRANH MUA (RACE CONDITION)
    private void processBooking(String messageJson) {
        try {
            // Đọc JSON lấy thông tin
            JsonObject json = JsonParser.parseString(messageJson).getAsJsonObject();
            int bookingId = json.get("bookingId").getAsInt();

            // 🌟 ĐÃ SỬA LỖI Ở ĐÂY: Lấy propertyId kiểu số Nguyên (Int) thay vì String
            int propertyId = json.get("propertyId").getAsInt();

            System.out.println("📦 [XỬ LÝ] Bóc phong bì Đặt chỗ ID: " + bookingId + " cho căn nhà: " + propertyId);

            // KIỂM TRA: Căn nhà này đã có ai Đặt thành công trước đó chưa?
            boolean isBooked = bookingDAO.isPropertyAlreadyBooked(propertyId);

            if (isBooked) {
                // Người B đến sau -> Căn nhà đã có cờ SUCCESS -> Bị từ chối
                bookingDAO.updateBookingStatus(bookingId, "FAILED", "Thất bại: Chậm tay, nhà đã có người đặt trước.");
                System.out.println("   ❌ Kết quả: THẤT BẠI (Đã có người nhanh tay hơn)");
            } else {
                // Người A đến trước -> Căn nhà vẫn nguyên sơ -> Cho phép Đặt
                bookingDAO.updateBookingStatus(bookingId, "SUCCESS", "Thành công: Yêu cầu đặt chỗ hợp lệ.");
                System.out.println("   ✅ Kết quả: THÀNH CÔNG (Người này nhanh tay nhất)");

                // MỤC TIÊU 2 VÀ 3 (LÀM SAU):
                // Tại vị trí này, sau này ta sẽ viết code để gọi API cập nhật trạng thái nhà
                // sang backend_property và đẩy 1 tin nhắn vào Topic Gửi Email.
            }
            System.out.println("---------------------------------------------------");
        } catch (Exception e) {
            System.err.println("❌ Lỗi khi bóc phong bì Kafka: " + e.getMessage());
        }
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        // Hàm này tự chạy khi bạn bấm nút Stop (Tắt server Tomcat)
        closed.set(true);
        if (consumer != null) {
            consumer.wakeup(); // Đánh thức vòng lặp Thread để cho nó thoát an toàn
        }
        try {
            if (consumerThread != null) {
                consumerThread.join();
            }
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println("🛑 [KAFKA CONSUMER] Đã tắt an toàn cùng Tomcat.");
    }
}