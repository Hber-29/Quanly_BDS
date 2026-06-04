/**
 * 🟢 HÀM ĐỊNH DẠNG GIÁ TIỀN - CHUẨN VIỆT NAM
 * Tái sử dụng trên cả 3 trang: HomePage, PropertySalePage, PropertyDetailPage
 */

// Format giá tiền: Chuyển đổi từ triệu sang tỷ nếu cần
export const formatPrice = (value) => {
    if (!value) return 'Thỏa thuận';
    const num = Number(value);
    if (isNaN(num)) return 'Thỏa thuận';
    
    if (num >= 1000) {
        const billions = num / 1000;
        return `${billions.toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} tỷ`;
    }
    return `${num.toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} triệu`;
};

// Format diện tích theo chuẩn Việt Nam (có dấu phân cách hàng nghìn)
export const formatArea = (value) => {
    if (!value) return '0';
    const num = Number(value);
    if (isNaN(num)) return '0';
    return num.toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
};

// Format đơn giá: Giá (triệu) ÷ Diện tích (m²)
export const formatUnitPrice = (price, area) => {
    if (!price || !area) return '0';
    const priceNum = Number(price);
    const areaNum = Number(area);
    
    if (isNaN(priceNum) || isNaN(areaNum) || areaNum === 0) return '0';
    
    const unitPrice = priceNum / areaNum;
    return unitPrice.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
};
