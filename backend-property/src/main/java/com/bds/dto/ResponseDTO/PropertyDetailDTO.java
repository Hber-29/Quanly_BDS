package com.bds.dto.ResponseDTO;



import java.math.BigDecimal;
import java.util.List;

public class PropertyDetailDTO {
    private int propertyId;
    private String title;
    private String description;
    private BigDecimal price;
    private float area;
    private String address;
    private List<String> images;

    // --- GETTER VÀ SETTER ---


    public int getPropertyId() {
        return propertyId;
    }

    public void setPropertyId(int propertyId) {
        this.propertyId = propertyId;
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public float getArea() { return area; }
    public void setArea(float area) { this.area = area; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }
}
