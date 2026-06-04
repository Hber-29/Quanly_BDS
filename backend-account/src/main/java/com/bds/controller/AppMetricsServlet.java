package com.bds.controller;
import io.prometheus.client.CollectorRegistry;
import io.prometheus.client.exporter.common.TextFormat;
import io.prometheus.client.hotspot.DefaultExports;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.Writer;

@WebServlet("/metrics")
public class AppMetricsServlet extends HttpServlet {

    @Override
    public void init() throws ServletException {
        // KÍCH HOẠT CẢM BIẾN: Bắt đầu đo lường RAM, CPU, Luồng của hệ thống
        DefaultExports.initialize();
        System.out.println("🚀 [Prometheus] Đã kích hoạt cảm biến giám sát tại /metrics");
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        // Cấu hình chuẩn định dạng dữ liệu cho Prometheus
        resp.setStatus(HttpServletResponse.SC_OK);
        resp.setContentType(TextFormat.CONTENT_TYPE_004);

        // Tự tay xuất số liệu sức khỏe ra màn hình trình duyệt
        try (Writer writer = resp.getWriter()) {
            TextFormat.write004(writer, CollectorRegistry.defaultRegistry.metricFamilySamples());
            writer.flush();
        }
    }
}