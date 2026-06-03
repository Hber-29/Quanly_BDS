package com.bds.service;

import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.SetBucketPolicyArgs; // 🔥 Bổ sung thêm thư viện này
import java.io.InputStream;
import java.util.UUID;

public class MinioService {
    // Cấu hình máy chủ MinIO
    private static final String MINIO_URL = "http://localhost:9000";
    private static final String ACCESS_KEY = "admin";
    private static final String SECRET_KEY = "minio_password123";
    private static final String BUCKET_NAME = "bds-media";

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

        // 🔥 2. ÉP MINIO CHUYỂN SANG CHẾ ĐỘ PUBLIC BẰNG CODE JAVA (Hacker way)
        String policy = "{\n" +
                "  \"Version\": \"2012-10-17\",\n" +
                "  \"Statement\": [\n" +
                "    {\n" +
                "      \"Effect\": \"Allow\",\n" +
                "      \"Principal\": \"*\",\n" +
                "      \"Action\": [\"s3:GetObject\"],\n" +
                "      \"Resource\": [\"arn:aws:s3:::" + BUCKET_NAME + "/*\"]\n" +
                "    }\n" +
                "  ]\n" +
                "}";
        minioClient.setBucketPolicy(
                SetBucketPolicyArgs.builder()
                        .bucket(BUCKET_NAME)
                        .config(policy)
                        .build()
        );

        // 3. Tạo tên file ngẫu nhiên (UUID) để tránh trùng lặp
        String extension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        String newFileName = UUID.randomUUID().toString() + extension;

        // 4. Tiến hành đẩy stream ảnh lên MinIO
        minioClient.putObject(
                PutObjectArgs.builder()
                        .bucket(BUCKET_NAME)
                        .object(newFileName)
                        .stream(imageStream, -1, 10485760) // Tối đa part size 10MB
                        .contentType(contentType)
                        .build()
        );

        // 5. Trả về đường link URL tĩnh
        return MINIO_URL + "/" + BUCKET_NAME + "/" + newFileName;
    }
}