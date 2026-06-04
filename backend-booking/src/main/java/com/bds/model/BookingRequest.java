package com.bds.model;

import java.sql.Timestamp;

public class BookingRequest {
    private int bookingId;
    private int propertyId;
    private int accountId;
    private String status;
    private Timestamp createdAt;
    private String notes;

    // --- GETTER VÀ SETTER ---
    public int getBookingId() { return bookingId; }
    public void setBookingId(int bookingId) { this.bookingId = bookingId; }

    public int getPropertyId() {
        return propertyId;
    }

    public void setPropertyId(int propertyId) {
        this.propertyId = propertyId;
    }

    public int getAccountId() {
        return accountId;
    }

    public void setAccountId(int accountId) {
        this.accountId = accountId;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}