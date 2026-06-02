package com.bds.dto.ResponseDTO;

import com.bds.model.Property;

import java.util.List;

public class PropertyPageResponse {
    private int totalItems;      // Tổng số bài đăng trong DB
    private int totalPages;      // Tổng số trang
    private int currentPage;     // Trang hiện tại
    private List<Property> properties; // Danh sách bài đăng của trang đó

    public PropertyPageResponse() {}

    public int getTotalItems() { return totalItems; }
    public void setTotalItems(int totalItems) { this.totalItems = totalItems; }

    public int getTotalPages() { return totalPages; }
    public void setTotalPages(int totalPages) { this.totalPages = totalPages; }

    public int getCurrentPage() { return currentPage; }
    public void setCurrentPage(int currentPage) { this.currentPage = currentPage; }

    public List<Property> getProperties() { return properties; }
    public void setProperties(List<Property> properties) { this.properties = properties; }
}