package com.bds.service;

import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import java.io.InputStream;
import java.util.UUID;

public class MinioService {
    // Cấu hình máy chủ MinIO (Thay đổi thông số này khớp với server MinIO bạn đã cài)
    private static final String MINIO_URL = "http://localhost:9000";
    private static final String ACCESS_KEY = "minioadmin";
    private static final String SECRET_KEY = "minioadmin";
    private static final String BUCKET_NAME = "bds-images"; // Tên "cái xô" chứa ảnh

    private MinioClient minioClient;

    public MinioService() {
        // Khởi tạo cầu nối đến MinIO
        this.minioClient = MinioClient.builder()
                .endpoint(MINIO_URL)
                .credentials(ACCESS_KEY, SECRET_KEY)
                .build();
    }

    // Hàm nhận luồng dữ liệu (InputStream) từ Servlet và bắn lên MinIO
    public String uploadImage(InputStream imageStream, String originalFileName, String contentType) throws Exception {
        // 1. Kiểm tra xem bucket (xô chứa) đã tồn tại chưa, chưa có thì tạo mới
        boolean isExist = minioClient.bucketExists(BucketExistsArgs.builder().bucket(BUCKET_NAME).build());
        if (!isExist) {
            minioClient.makeBucket(MakeBucketArgs.builder().bucket(BUCKET_NAME).build());
            System.out.println("📦 Đã tạo Bucket mới: " + BUCKET_NAME);
        }

        // 2. Tạo tên file ngẫu nhiên (UUID) để tránh trùng lặp đè mất ảnh cũ
        String extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        String newFileName = UUID.randomUUID().toString() + extension;

        // 3. Tiến hành đẩy stream ảnh lên MinIO
        minioClient.putObject(
                PutObjectArgs.builder()
                        .bucket(BUCKET_NAME)
                        .object(newFileName)
                        .stream(imageStream, -1, 10485760) // Cho phép xử lý stream động
                        .contentType(contentType)
                        .build()
        );

        // 4. Trả về đường link URL tĩnh (Public) để Frontend gọi hiển thị ảnh
        // Lưu ý: Cần cấu hình Access Policy của Bucket MinIO thành "Public" để xem được ảnh này
        return MINIO_URL + "/" + BUCKET_NAME + "/" + newFileName;
    }
}
