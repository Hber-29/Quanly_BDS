package com.bds.model;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;

public class Property {
    private String propertyId;   // varchar(50)
    private String propertyCode; // varchar(50)
    private String propertyUuid;
    private int accountId;       // int4
    private String title;        // varchar(255)
    private String description;  // text
    private BigDecimal price;    // numeric(15,2)
    private String priceDisplay; // Thêm biến này để Frontend in ra chữ "Tỷ / Triệu"
    private float area;          // numeric(10,2)
    private String address;      // text (Đã sửa từ location)
    private String thumbnail;    // text (Chứa link ảnh MinIO)
    private String badge;        // varchar(50) (Chữ VIP)
    private Timestamp createdAt;
    private int categoryId;
    private int regionId;
    private List<String> images;
// Nhớ generate Getter và Setter cho 2 biến này nhé!// timestamp

    public Property() {
    }

    // --- Getters & Setters ---

    public String getPropertyId() { return propertyId; }
    public void setPropertyId(String propertyId) { this.propertyId = propertyId; }

    public String getPropertyCode() { return propertyCode; }
    public void setPropertyCode(String propertyCode) { this.propertyCode = propertyCode; }

    public int getAccountId() { return accountId; }
    public void setAccountId(int accountId) { this.accountId = accountId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public String getPriceDisplay() { return priceDisplay; }
    public void setPriceDisplay(String priceDisplay) { this.priceDisplay = priceDisplay; }

    public float getArea() { return area; }
    public void setArea(float area) { this.area = area; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getThumbnail() { return thumbnail; }
    public void setThumbnail(String thumbnail) { this.thumbnail = thumbnail; }

    public String getBadge() { return badge; }
    public void setBadge(String badge) { this.badge = badge; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public String getPropertyUuid() {
        return propertyUuid;
    }

    public void setPropertyUuid(String propertyUuid) {
        this.propertyUuid = propertyUuid;
    }

    public int getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(int categoryId) {
        this.categoryId = categoryId;
    }

    public int getRegionId() {
        return regionId;
    }

    public void setRegionId(int regionId) {
        this.regionId = regionId;
    }

    public List<String> getImages() {
        return images;
    }

    public void setImages(List<String> images) {
        this.images = images;
    }
}