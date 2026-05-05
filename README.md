#  HỆ THỐNG QUẢN LÝ BẤT ĐỘNG SẢN (MICROSERVICES ARCHITECTURE)

Dự án Hệ thống Quản lý Bất động sản được thiết kế theo kiến trúc Microservices hiện đại, tập trung vào khả năng **chịu tải cao (High Scalability)**, **chịu lỗi (Fault Tolerance)** và xử lý **đồng bộ hóa (Concurrency)** bằng hàng đợi thông điệp.

---

##  KIẾN TRÚC HỆ THỐNG (ARCHITECTURE OVERVIEW)

Dự án áp dụng các công nghệ tiên tiến để giải quyết các bài toán thực tế trong hệ thống phân tán:

### 1. Tầng Gateway & Điều phối (Traffic Management)
* **Kong API Gateway (Port 8000):** Điểm tiếp nhận duy nhất từ Frontend, thực hiện điều hướng request (Routing) và xử lý CORS.
* **Nginx Load Balancer (Port 5433):** Đóng vai trò cân bằng tải giữa các Database Node, hỗ trợ chiến lược **Read-Write Splitting**.

### 2. Tầng Dữ liệu phân tán (Distributed Database)
* **PostgreSQL Master-Replica:**
    * **Master Node (Port 5431):** Chuyên trách xử lý các tác vụ Ghi (Insert, Update, Delete).
    * **Replica Node (Port 5432):** Sao lưu dữ liệu thời gian thực từ Master, phục vụ các tác vụ Đọc (Select).
* **Lợi ích:** Tăng tốc độ truy xuất dữ liệu và đảm bảo an toàn dữ liệu khi một node gặp sự cố.

### 3. Tầng Xử lý hàng đợi (Message Queue)
* **Apache Kafka & Zookeeper:** Xử lý bài toán "Tranh mua" (High Concurrency). Khi nhiều người cùng thao tác trên một sản phẩm, Kafka đảm bảo quy tắc **FIFO (First In First Out)**, tránh tình trạng Race Condition và đảm bảo tính nhất quán dữ liệu.

---

## 🛠 CÔNG NGHỆ SỬ DỤNG (TECH STACK)

| Thành phần | Công nghệ |
| :--- | :--- |
| **Frontend** | ReactJS, Axios, Lucide-react |
| **Backend** | Java Servlet (Jakarta EE), Maven |
| **Security** | BCrypt Password Hashing, CORS Filter |
| **Database** | PostgreSQL 16 |
| **DevOps** | Docker, Docker Compose, Nginx, Kong Gateway |
| **Middleware** | Apache Kafka, Zookeeper |

---

##  CẤU TRÚC BACKEND (PROJECT STRUCTURE)

Dự án tuân thủ nghiêm ngặt mô hình **3-Layer Architecture**:

* **`com.bds.controller`**: Servlet tiếp nhận request, gọi Service và trả về dữ liệu JSON.
* **`com.bds.service`**: Lớp xử lý nghiệp vụ chính, thực hiện Validation và quản lý Database Transaction (Rollback).
* **`com.bds.dao`**: Thao tác trực tiếp với DB qua SQL (Prepared Statement) để chống SQL Injection.
* **`com.bds.dto`**: Các đối tượng vận chuyển dữ liệu (Data Transfer Object) giữa FE và BE.
* **`com.bds.model`**: Các thực thể (Entity) ánh xạ 1-1 với bảng trong Database.
* **`com.bds.filter`**: Xử lý tiền xử lý (CORS, Authentication).
* **`com.bds.util`**: Công cụ dùng chung (DBContext kết nối Master/Replica).

---

## 🛡 QUY TẮC VALIDATION & BẢO MẬT (INPUT VALIDATION)

Hệ thống áp dụng các quy tắc kiểm tra nghiêm ngặt cho chức năng Đăng ký:
* **Username:** 3-50 ký tự, không dấu cách, không ký tự đặc biệt, UNIQUE.
* **Password:** Tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt. Mã hóa bằng **BCrypt (Salt log 12)**.
* **Email & Phone:** Đúng định dạng Regex và phải là Duy nhất (UNIQUE).
* **Age:** Kiểm tra ngày sinh (Date of Birth), yêu cầu người dùng phải từ 13 tuổi trở lên.
* **Transaction:** Đảm bảo tính nhất quán khi ghi đồng thời vào bảng `account` và `customer_info`.

---

## 🚀 HƯỚNG DẪN TRIỂN KHAI (DEPLOYMENT)

### 1. Yêu cầu hệ thống
* Docker & Docker Compose.
* Java JDK 17+.
* Node.js & npm.

### 2. Khởi chạy hạ tầng (Docker)

Di chuyển vào thư mục chứa file `docker-compose.yml` và chạy:

[//]: # (```bash)
docker-compose up -d


### 3. Khởi chạy Backend (IntelliJ IDEA)
1. **Import Project**: Chọn `File` -> `Open` -> Chọn thư mục gốc của dự án để IntelliJ nhận diện các module Maven.
2. **Cấu hình Tomcat**:
    - Nhấn `Add Configuration` -> `Tomcat Server` -> `Local`.
    - Trong tab `Deployment`, nhấn dấu `+`, chọn `Artifact` -> `backend-account:war exploded`.
    - Ở ô **Application context**, sửa thành: `/backend-account`.
3. **Run**: Nhấn nút `Run` (màu xanh) để khởi động server.

### 4. Khởi chạy Frontend (ReactJS)
Mở terminal tại thư mục gốc và chạy các lệnh sau:
```bash
cd frontend
npm install
npm start



