package com.bds.dto.ResponseDTO;

import java.util.List;

public class PageResponse<T> {
    private List<T> data;
    private int currentPage;
    private int totalPages;
    private int totalItems;

    public PageResponse() {
    }

    public PageResponse(List<T> data, int currentPage, int totalPages, int totalItems) {
        this.data = data;
        this.currentPage = currentPage;
        this.totalPages = totalPages;
        this.totalItems = totalItems;
    }

    // Các hàm Getter và Setter
    public List<T> getData() { return data; }
    public void setData(List<T> data) { this.data = data; }

    public int getCurrentPage() { return currentPage; }
    public void setCurrentPage(int currentPage) { this.currentPage = currentPage; }

    public int getTotalPages() { return totalPages; }
    public void setTotalPages(int totalPages) { this.totalPages = totalPages; }

    public int getTotalItems() { return totalItems; }
    public void setTotalItems(int totalItems) { this.totalItems = totalItems; }
}