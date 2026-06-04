# --- GIAI ĐOẠN 1: Build bằng Node.js ---
FROM node:20-alpine as build-stage
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# --- GIAI ĐOẠN 2: Chạy bằng Nginx ---
FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

# LƯU Ý QUAN TRỌNG: Vite build ra thư mục /app/dist (không phải /app/build)
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy file cấu hình Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]