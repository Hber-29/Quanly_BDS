package com.bds.util;

import jakarta.mail.*;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import java.util.Properties;

public class EmailUtil {

    // 🌟 ĐIỀN EMAIL VÀ APP PASSWORD CỦA BẠN VÀO ĐÂY (Viết liền không dấu cách)
    private static final String MY_EMAIL = "hbernguyen2905@gmail.com";
    private static final String MY_APP_PASSWORD = "qakhyvbpnnpxbdwh";

    public static void sendEmail(String toEmail, String subject, String body) {
        Properties props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", "smtp.gmail.com");
        props.put("mail.smtp.port", "587");

        Session session = Session.getInstance(props, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(MY_EMAIL, MY_APP_PASSWORD);
            }
        });

        try {
            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress(MY_EMAIL, "Hệ Thống BĐS 2026"));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(toEmail));
            message.setSubject(subject);

            // Gửi email định dạng HTML
            message.setContent(body, "text/html; charset=UTF-8");

            Transport.send(message);
            System.out.println("   📧 [EMAIL] Đã gửi thư thành công tới: " + toEmail);

        } catch (Exception e) {
            System.err.println("   ❌ [EMAIL] Lỗi gửi thư: " + e.getMessage());
        }
    }
}
