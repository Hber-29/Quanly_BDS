package com.bds.dto;

public class RegisterDTO {
    private String username;
    private String password;
    private int roleId;       // Mới: Để lưu ID của quyền (mặc định CUSTOMER là 3)
    private String fullName;
    private int gender;       // Để int cho dễ xử lý (0: Nữ, 1: Nam)
    private String dob;       // Đổi sang String để nhận từ Form dễ hơn
    private String phone;
    private String email;
    private String address;
    private String preferences; // Mới: Lưu sở thích/nhu cầu khách hàng

    public RegisterDTO() {}

    // Getters and Setters
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public int getRoleId() {
        return roleId;
    }

    public void setRoleId(int roleId) {
        this.roleId = roleId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public int getGender() {
        return gender;
    }

    public void setGender(int gender) {
        this.gender = gender;
    }

    public String getDob() {
        return dob;
    }

    public void setDob(String dob) {
        this.dob = dob;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPreferences() {
        return preferences;
    }

    public void setPreferences(String preferences) {
        this.preferences = preferences;
    }
}