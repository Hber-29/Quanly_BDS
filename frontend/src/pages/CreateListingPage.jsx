import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, MapPin, Search, UploadCloud, ArrowLeft } from 'lucide-react';

const CreateListingPage = () => {
    // ==========================================
    // 🌟 STATE QUẢN LÝ TIẾN TRÌNH (WIZARD FORM)
    // ==========================================
    const [formStep, setFormStep] = useState(1); 
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ==========================================
    // 🌟 STATE BƯỚC 1: NHU CẦU & ĐỊA CHỈ
    // ==========================================
    const [transactionType, setTransactionType] = useState('SALE');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalStep, setModalStep] = useState(1);
    const [addressData, setAddressData] = useState({
        province: '', district: '', ward: '', street: '', detail: ''
    });
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedCodes, setSelectedCodes] = useState({ provinceCode: '', districtCode: '' });

    // ==========================================
    // 🌟 STATE BƯỚC 2: CHI TIẾT & HÌNH ẢNH (MINIO)
    // ==========================================
    const [propertyDetails, setPropertyDetails] = useState({
        title: '', description: '', price: '', area: ''
    });
    const [uploadedImages, setUploadedImages] = useState([]); 
    const [isUploading, setIsUploading] = useState(false);

    // ---------------- LOGIC GỌI API ĐỊA CHỈ ----------------
    useEffect(() => {
        axios.get('https://provinces.open-api.vn/api/p/')
            .then(res => setProvinces(res.data))
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (selectedCodes.provinceCode) {
            axios.get(`https://provinces.open-api.vn/api/p/${selectedCodes.provinceCode}?depth=2`)
                .then(res => setDistricts(res.data.districts))
                .catch(err => console.error(err));
        } else {
            setTimeout(() => { setDistricts([]); setWards([]); }, 0);
        }
    }, [selectedCodes.provinceCode]);

    useEffect(() => {
        if (selectedCodes.districtCode) {
            axios.get(`https://provinces.open-api.vn/api/d/${selectedCodes.districtCode}?depth=2`)
                .then(res => setWards(res.data.wards))
                .catch(err => console.error(err));
        } else {
            setTimeout(() => { setWards([]); }, 0);
        }
    }, [selectedCodes.districtCode]);

    const displayAddress = [
        addressData.detail, addressData.street, addressData.ward, addressData.district, addressData.province
    ].filter(Boolean).join(', ');

    const handleConfirmAddress = () => {
        if (!addressData.province || !addressData.district || !addressData.ward) {
            alert("Vui lòng chọn đầy đủ Tỉnh, Quận và Phường!"); return;
        }
        setIsModalOpen(false); setModalStep(1);
    };

    const handleGoToStep2 = () => {
        if (!displayAddress) {
            alert("Vui lòng nhập địa chỉ bất động sản trước khi tiếp tục!"); return;
        }
        setFormStep(2);
        window.scrollTo(0, 0);
    };

    // ---------------- LOGIC UPLOAD ẢNH LÊN MINIO ----------------
    const handleImageUpload = async (event) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        const uploadPromises = [];

        for (let i = 0; i < files.length; i++) {
            const formData = new FormData();
            formData.append('file', files[i]);

            // Thay đổi Port 8080 thành Port Tomcat của bạn nếu cần
            const promise = axios.post('http://localhost:8082/api/upload/image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            }).then(res => {
                if (res.data && res.data.imageUrl) {
                    return res.data.imageUrl;
                }
            }).catch(err => {
                console.error("Lỗi upload ảnh:", err);
                return null;
            });
            uploadPromises.push(promise);
        }

        const urls = await Promise.all(uploadPromises);
        const validUrls = urls.filter(url => url !== null);
        
        setUploadedImages([...uploadedImages, ...validUrls]);
        setIsUploading(false);
    };

    const handleRemoveImage = (indexToRemove) => {
        setUploadedImages(uploadedImages.filter((_, index) => index !== indexToRemove));
    };

    // ---------------- LOGIC SUBMIT DATABASE ----------------
    const handleSubmitListing = () => {
        if (!propertyDetails.title || !propertyDetails.price || !propertyDetails.area) {
            alert("Vui lòng nhập đủ Tiêu đề, Giá và Diện tích!"); return;
        }
        if (uploadedImages.length === 0) {
            alert("Vui lòng tải lên ít nhất 1 hình ảnh!"); return;
        }

        const finalData = {
            transactionType,
            address: addressData,
            fullAddress: displayAddress,
            details: propertyDetails,
            images: uploadedImages
        };

        console.log("🚀 CHUẨN BỊ BẮN XUỐNG DATABASE:", finalData);
        alert("Dữ liệu đã sẵn sàng! Mở tab Console (F12) để xem JSON. Chờ kết nối API Create ở bước sau.");
    };

    return (
        <div className="bg-light min-vh-100 py-5 font-sans">
            <div className="container" style={{ maxWidth: '850px' }}>
                
                {/* Header Wizard (Bootstrap) */}
                <div className="mb-5">
                    <h2 className="fw-bold text-dark mb-4">Tạo tin đăng</h2>
                    <div className="d-flex text-center border-bottom border-2">
                        <div className={`pb-2 flex-fill ${formStep >= 1 ? 'border-bottom border-danger border-3' : ''}`}>
                            <span className={`fw-bold ${formStep >= 1 ? 'text-danger' : 'text-muted'}`}>1. Thông tin cơ bản</span>
                        </div>
                        <div className={`pb-2 flex-fill ${formStep >= 2 ? 'border-bottom border-danger border-3' : ''}`}>
                            <span className={`fw-bold ${formStep >= 2 ? 'text-danger' : 'text-muted'}`}>2. Thông tin chi tiết & Ảnh</span>
                        </div>
                    </div>
                </div>

                {/* ========================================================= */}
                {/* GIAO DIỆN BƯỚC 1 */}
                {/* ========================================================= */}
                {formStep === 1 && (
                    <div className="fade show">
                        <div className="card shadow-sm border-0 mb-4 rounded-4">
                            <div className="card-body p-4 p-md-5">
                                <h5 className="fw-bold text-dark mb-4">Nhu cầu <span className="text-danger">*</span></h5>
                                <div className="d-flex gap-3">
                                    <button 
                                        onClick={() => setTransactionType('SALE')} 
                                        className={`btn w-50 py-3 fw-bold rounded-3 ${transactionType === 'SALE' ? 'btn-outline-dark border-2 active' : 'btn-light border text-muted'}`}
                                    >
                                        Bán
                                    </button>
                                    <button 
                                        onClick={() => alert("Tính năng cho thuê đang được phát triển!")} 
                                        className="btn btn-light border text-muted w-50 py-3 fw-bold rounded-3 opacity-75 disabled"
                                    >
                                        Cho thuê
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="card shadow-sm border-0 mb-4 rounded-4">
                            <div className="card-body p-4 p-md-5">
                                <h5 className="fw-bold text-dark mb-4">Địa chỉ <span className="text-danger">*</span></h5>
                                <div 
                                    onClick={() => setIsModalOpen(true)} 
                                    className={`d-flex align-items-center gap-2 border p-3 rounded-3 cursor-pointer ${displayAddress ? 'border-dark text-dark bg-light' : 'text-muted bg-white'}`}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <MapPin size={20} className={displayAddress ? "text-danger" : "text-muted"} />
                                    <span className="text-truncate">{displayAddress || "Nhập địa chỉ nhà đất..."}</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-end mt-5">
                            <button onClick={handleGoToStep2} className="btn btn-danger fw-bold py-3 px-5 rounded-pill shadow-sm">
                                Tiếp tục Bước 2 &raquo;
                            </button>
                        </div>
                    </div>
                )}

                {/* ========================================================= */}
                {/* GIAO DIỆN BƯỚC 2 */}
                {/* ========================================================= */}
                {formStep === 2 && (
                    <div className="fade show">
                        <div className="card shadow-sm border-0 mb-4 rounded-4">
                            <div className="card-body p-4 p-md-5">
                                <h5 className="fw-bold text-dark mb-4">Thông tin chi tiết <span className="text-danger">*</span></h5>
                                
                                <div className="mb-4">
                                    <label className="form-label fw-semibold text-secondary">Tiêu đề bài đăng</label>
                                    <input 
                                        type="text" placeholder="VD: Bán biệt thự liền kề Vinhomes..." 
                                        className="form-control form-control-lg fs-6"
                                        value={propertyDetails.title}
                                        onChange={(e) => setPropertyDetails({...propertyDetails, title: e.target.value})}
                                    />
                                </div>
                                
                                <div className="mb-4">
                                    <label className="form-label fw-semibold text-secondary">Mô tả chi tiết</label>
                                    <textarea 
                                        rows="5" placeholder="Nhập thông tin chi tiết về nhà đất, tiện ích xung quanh..." 
                                        className="form-control form-control-lg fs-6" style={{ resize: 'none' }}
                                        value={propertyDetails.description}
                                        onChange={(e) => setPropertyDetails({...propertyDetails, description: e.target.value})}
                                    ></textarea>
                                </div>

                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold text-secondary">Giá (Triệu VNĐ)</label>
                                        <input 
                                            type="number" placeholder="VD: 2500" 
                                            className="form-control form-control-lg fs-6"
                                            value={propertyDetails.price}
                                            onChange={(e) => setPropertyDetails({...propertyDetails, price: e.target.value})}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold text-secondary">Diện tích (m²)</label>
                                        <input 
                                            type="number" placeholder="VD: 100" 
                                            className="form-control form-control-lg fs-6"
                                            value={propertyDetails.area}
                                            onChange={(e) => setPropertyDetails({...propertyDetails, area: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Khối Upload Hình ảnh MinIO (Bootstrap style) */}
                        <div className="card shadow-sm border-0 mb-4 rounded-4">
                            <div className="card-body p-4 p-md-5">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h5 className="fw-bold text-dark mb-0">Hình ảnh BĐS <span className="text-danger">*</span></h5>
                                    <span className="text-muted small">Đã tải lên: {uploadedImages.length} ảnh</span>
                                </div>
                                
                                {/* Khu vực kéo thả / chọn file */}
                                <div className="position-relative border border-2 border-dashed rounded-4 p-5 text-center bg-light" style={{ borderColor: '#ccc' }}>
                                    <input 
                                        type="file" multiple accept="image/*"
                                        onChange={handleImageUpload}
                                        className="position-absolute top-0 start-0 w-100 h-100 opacity-0"
                                        style={{ cursor: isUploading ? 'not-allowed' : 'pointer' }}
                                        disabled={isUploading}
                                    />
                                    {isUploading ? (
                                        <div className="text-danger">
                                            <div className="spinner-border mb-3" role="status"></div>
                                            <p className="fw-bold mb-0">Đang tải ảnh lên máy chủ MinIO...</p>
                                        </div>
                                    ) : (
                                        <div className="text-muted">
                                            <UploadCloud size={48} className="mb-3 opacity-50" />
                                            <h6 className="fw-bold text-dark">Kéo thả ảnh vào đây hoặc Nhấn để chọn</h6>
                                            <p className="small mb-0">Hỗ trợ JPG, PNG (Tối đa 10MB/ảnh)</p>
                                        </div>
                                    )}
                                </div>

                                {/* Grid hiển thị ảnh đã upload */}
                                {uploadedImages.length > 0 && (
                                    <div className="row g-3 mt-4">
                                        {uploadedImages.map((url, idx) => (
                                            <div key={idx} className="col-6 col-md-3">
                                                <div className="position-relative rounded overflow-hidden border bg-white" style={{ aspectRatio: '16/9' }}>
                                                    <img src={url} alt={`Preview ${idx}`} className="w-100 h-100 object-fit-cover" />
                                                    <button 
                                                        onClick={() => handleRemoveImage(idx)}
                                                        className="btn btn-dark btn-sm position-absolute top-0 end-0 m-1 rounded-circle p-1"
                                                        style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.8 }}
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                    {idx === 0 && (
                                                        <span className="position-absolute bottom-0 start-0 bg-danger text-white px-2 py-1" style={{ fontSize: '10px', fontWeight: 'bold' }}>ẢNH BÌA</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Nút Điều hướng Bước 2 */}
                        <div className="d-flex justify-content-between align-items-center mt-5">
                            <button onClick={() => setFormStep(1)} className="btn btn-link text-dark text-decoration-none fw-bold px-0 d-flex align-items-center gap-2">
                                <ArrowLeft size={18} /> Quay lại Bước 1
                            </button>
                            <button 
                                onClick={handleSubmitListing}
                                disabled={isUploading}
                                className={`btn py-3 px-5 rounded-pill shadow-sm fw-bold ${isUploading ? 'btn-secondary disabled' : 'btn-danger'}`}
                            >
                                Đăng tin ngay
                            </button>
                        </div>
                    </div>
                )}

                {/* ========================================================= */}
                {/* GIAO DIỆN MODAL ĐỊA CHỈ */}
                {/* ========================================================= */}
                {isModalOpen && (
                    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050, padding: '15px' }}>
                        <div className="bg-white rounded-4 shadow-lg d-flex flex-column" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh' }}>
                            <div className="bg-dark text-white px-4 py-3 d-flex justify-content-between align-items-center" style={{ borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem' }}>
                                <h5 className="mb-0 fw-bold">{modalStep === 1 ? 'Nhập địa chỉ' : 'Chọn địa chỉ'}</h5>
                                <button onClick={() => setIsModalOpen(false)} className="btn btn-link text-white p-0"><X size={24} /></button>
                            </div>
                            
                            <div className="p-4 overflow-auto">
                                {modalStep === 1 ? (
                                    <div>
                                        <div className="position-relative mb-4">
                                            <Search size={18} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                                            <input type="text" placeholder="Nhập địa chỉ..." className="form-control form-control-lg ps-5 rounded-pill fs-6" />
                                        </div>
                                        <div className="d-flex align-items-center gap-3 mb-4">
                                            <hr className="flex-grow-1" /><span className="text-muted small fw-bold uppercase">Hoặc</span><hr className="flex-grow-1" />
                                        </div>
                                        <div className="text-center">
                                            <button onClick={() => setModalStep(2)} className="btn btn-outline-dark fw-bold rounded-pill px-4 py-2">
                                                Chọn địa chỉ hành chính
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="d-flex flex-column gap-3">
                                        <div>
                                            <label className="form-label fw-semibold small mb-1">Tỉnh/Thành</label>
                                            <select className="form-select" value={selectedCodes.provinceCode} onChange={(e) => {
                                                const selected = provinces.find(p => p.code == e.target.value);
                                                setAddressData({...addressData, province: selected?.name || '', district: '', ward: ''});
                                                setSelectedCodes({...selectedCodes, provinceCode: e.target.value, districtCode: ''});
                                            }}>
                                                <option value="">Chọn Tỉnh/Thành</option>
                                                {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="form-label fw-semibold small mb-1">Quận/Huyện</label>
                                            <select className="form-select" disabled={!selectedCodes.provinceCode} value={selectedCodes.districtCode} onChange={(e) => {
                                                const selected = districts.find(d => d.code == e.target.value);
                                                setAddressData({...addressData, district: selected?.name || '', ward: ''});
                                                setSelectedCodes({...selectedCodes, districtCode: e.target.value});
                                            }}>
                                                <option value="">Chọn Quận/Huyện</option>
                                                {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="form-label fw-semibold small mb-1">Phường/Xã</label>
                                            <select className="form-select" disabled={!selectedCodes.districtCode} value={wards.find(w => w.name === addressData.ward)?.code || ''} onChange={(e) => {
                                                const selected = wards.find(w => w.code == e.target.value);
                                                setAddressData({...addressData, ward: selected?.name || ''});
                                            }}>
                                                <option value="">Chọn Phường/Xã</option>
                                                {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="form-label fw-semibold small mb-1">Đường/Phố</label>
                                            <input type="text" className="form-control" onChange={(e) => setAddressData({...addressData, street: e.target.value})} value={addressData.street} />
                                        </div>
                                        <div>
                                            <label className="form-label fw-semibold small mb-1">Địa chỉ chi tiết</label>
                                            <input type="text" placeholder="Số nhà, ngõ..." className="form-control" onChange={(e) => setAddressData({...addressData, detail: e.target.value})} value={addressData.detail} />
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {modalStep === 2 && (
                                <div className="bg-light p-3 d-flex justify-content-between align-items-center border-top" style={{ borderBottomLeftRadius: '1rem', borderBottomRightRadius: '1rem' }}>
                                    <button onClick={() => setModalStep(1)} className="btn btn-link text-dark fw-bold text-decoration-none">Quay lại</button>
                                    <button onClick={handleConfirmAddress} className="btn btn-danger fw-bold px-4 rounded-pill">Xác nhận</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateListingPage;