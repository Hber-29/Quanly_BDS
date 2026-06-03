import { useState, useEffect } from 'react';
import axios from 'axios'; // Dùng cho Open API tỉnh thành
import axiosClient from '../api/axiosClient'; // Dùng cho API nội bộ qua Kong Gateway
import { X, MapPin, Search, UploadCloud, ArrowLeft, CheckCircle } from 'lucide-react';

const CreateListingPage = () => {
    // ==========================================
    // 🌟 CONSTANTS & STATE QUẢN LÝ TIẾN TRÌNH
    // ==========================================
    const MAX_IMAGES = 10;
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
    // 🌟 STATE BƯỚC 2: CHI TIẾT & HÌNH ẢNH
    // ==========================================
    const [propertyDetails, setPropertyDetails] = useState({
        title: '', description: '', price: '', area: '', categoryId: 1
    });
    const [categories, setCategories] = useState([]); 
    const [uploadedImages, setUploadedImages] = useState([]); 
    const [isUploading, setIsUploading] = useState(false);

    // ---------------- LOGIC GỌI API LẤY DANH MỤC ----------------
    useEffect(() => {
        axiosClient.get('/api/categories')
            .then(res => {
                const categoryData = res.data || res; 
                setCategories(categoryData);
                if (categoryData && categoryData.length > 0) {
                    setPropertyDetails(prev => ({...prev, categoryId: categoryData[0].categoryId}));
                }
            })
            .catch(err => console.error("❌ Lỗi tải danh mục:", err));
    }, []);

    // ---------------- LOGIC GỌI API ĐỊA CHỈ (OPEN API) ----------------
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

    // ---------------- LOGIC ĐIỀU HƯỚNG CÁC BƯỚC ----------------
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

    const handleGoToStep3 = () => {
        if (!propertyDetails.title || !propertyDetails.price || !propertyDetails.area) {
            alert("Vui lòng nhập đủ Tiêu đề, Giá và Diện tích!"); return;
        }
        if (uploadedImages.length === 0) {
            alert("Vui lòng tải lên ít nhất 1 hình ảnh!"); return;
        }
        setFormStep(3);
        window.scrollTo(0, 0);
    };

    // ---------------- LOGIC UPLOAD ẢNH CHUẨN NHẤT ----------------
    const handleImageUpload = async (event) => {
        const files = Array.from(event.target.files);
        if (!files || files.length === 0) return;

        const remainingSlots = MAX_IMAGES - uploadedImages.length;
        if (remainingSlots <= 0) {
            alert(`Bạn chỉ được tải lên tối đa ${MAX_IMAGES} ảnh!`);
            return;
        }

        const filesToUpload = files.slice(0, remainingSlots);
        if (files.length > remainingSlots) {
            alert(`Chỉ có thể tải thêm ${remainingSlots} ảnh. Các ảnh thừa đã bị loại bỏ.`);
        }

        setIsUploading(true);

        try {
            // Dùng Promise.all với map để gửi file song song, tối ưu tốc độ
            const uploadPromises = filesToUpload.map(async (file) => {
                const formData = new FormData();
                formData.append('file', file);

                try {
                    // Gọi API qua axiosClient (Kong Gateway)
                    const res = await axiosClient.post('/api/upload/image', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    return res.imageUrl || (res.data && res.data.imageUrl) || null;
                } catch (err) {
                    console.error(`❌ Lỗi upload file ${file.name}:`, err);
                    return null; // Trả về null để không làm sập toàn bộ Promise.all
                }
            });

            // Đợi tất cả hoàn thành
            const results = await Promise.all(uploadPromises);
            
            // Lọc ra các URL upload thành công (bỏ qua null)
            const validUrls = results.filter(url => url !== null);
            
            if (validUrls.length < filesToUpload.length) {
                alert("Một số ảnh bị lỗi trong quá trình tải lên. Vui lòng thử lại với các ảnh đó.");
            }

            // Nối ảnh mới vào danh sách cũ
            setUploadedImages(prev => [...prev, ...validUrls]);
        } catch (err) {
            console.error("❌ Lỗi hệ thống upload:", err);
            alert("Đã xảy ra lỗi hệ thống trong quá trình tải ảnh.");
        } finally {
            setIsUploading(false);
            // Reset giá trị thẻ input để có thể chọn lại chính ảnh đó nếu cần
            if (event.target) {
                event.target.value = null; 
            }
        }
    };

    const handleRemoveImage = (indexToRemove) => {
        setUploadedImages(uploadedImages.filter((_, index) => index !== indexToRemove));
    };

    // ---------------- LOGIC SUBMIT DATABASE ----------------
    const handleSubmitListing = async () => {
        setIsSubmitting(true); 
        if (!uploadedImages || uploadedImages.length === 0) {
            alert("Vui lòng tải lên ít nhất 1 hình ảnh trước khi đăng bài!");
            return;
        }
        const currentAccountId = localStorage.getItem('accountId') || localStorage.getItem('userId');
        if (!currentAccountId) {
                alert("Bạn cần đăng nhập để thực hiện chức năng này!");
                setIsSubmitting(false);
                return;
            }

        const payload = {
            accountId: parseInt(currentAccountId),
            transactionType,
            address: addressData,    
            fullAddress: displayAddress,
            details: propertyDetails, 
            images: uploadedImages    
        };

        try {
            const res = await axiosClient.post('/api/property/create', payload);
            
            if (res && res.status === 'success') {
                // 🔥 Đã xóa chữ .data
                alert("🎉 " + res.message); 
                window.location.href = '/nha-dat-ban'; 
            } else {
                // 🔥 Đã xóa chữ .data
                alert("❌ Có lỗi xảy ra: " + (res?.message || "Lỗi không xác định"));
            }
        } catch (err) {
            console.error("Lỗi khi đăng tin:", err);
            alert("❌ Không thể kết nối đến máy chủ Backend hoặc Lỗi xử lý giao diện!");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-light min-vh-100 py-5 font-sans">
            <div className="container" style={{ maxWidth: '850px' }}>
                
                {/* HEADER WIZARD 3 BƯỚC */}
                <div className="mb-5">
                    <h2 className="fw-bold text-dark mb-4">Tạo tin đăng</h2>
                    <div className="d-flex text-center border-bottom border-2">
                        <div className={`pb-2 flex-fill ${formStep >= 1 ? 'border-bottom border-danger border-3' : ''}`}>
                            <span className={`fw-bold ${formStep >= 1 ? 'text-danger' : 'text-muted'}`}>1. Thông tin cơ bản</span>
                        </div>
                        <div className={`pb-2 flex-fill ${formStep >= 2 ? 'border-bottom border-danger border-3' : ''}`}>
                            <span className={`fw-bold ${formStep >= 2 ? 'text-danger' : 'text-muted'}`}>2. Chi tiết & Ảnh</span>
                        </div>
                        <div className={`pb-2 flex-fill ${formStep >= 3 ? 'border-bottom border-danger border-3' : ''}`}>
                            <span className={`fw-bold ${formStep >= 3 ? 'text-danger' : 'text-muted'}`}>3. Xem trước</span>
                        </div>
                    </div>
                </div>

                {/* GIAO DIỆN BƯỚC 1: NHU CẦU & ĐỊA CHỈ */}
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

                {/* GIAO DIỆN BƯỚC 2: CHI TIẾT & HÌNH ẢNH */}
                {formStep === 2 && (
                    <div className="fade show">
                        <div className="card shadow-sm border-0 mb-4 rounded-4">
                            <div className="card-body p-4 p-md-5">
                                <h5 className="fw-bold text-dark mb-4">Thông tin chi tiết <span className="text-danger">*</span></h5>
                                
                                {/* DROPDOWN LOẠI HÌNH BĐS */}
                                <div className="mb-4">
                                    <label className="form-label fw-semibold text-secondary">Loại hình Bất động sản</label>
                                    <select 
                                        className="form-select form-select-lg fs-6"
                                        value={propertyDetails.categoryId}
                                        onChange={(e) => setPropertyDetails({...propertyDetails, categoryId: parseInt(e.target.value)})}
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat.categoryId} value={cat.categoryId}>
                                                {cat.categoryName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

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

                        {/* UPLOAD ẢNH MINIO */}
                        <div className="card shadow-sm border-0 mb-4 rounded-4">
                            <div className="card-body p-4 p-md-5">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h5 className="fw-bold text-dark mb-0">Hình ảnh BĐS <span className="text-danger">*</span></h5>
                                    <span className={`small fw-bold px-3 py-1 rounded-pill ${uploadedImages.length >= MAX_IMAGES ? 'bg-danger text-white' : 'bg-light text-dark border'}`}>
                                        Đã tải lên: {uploadedImages.length} / {MAX_IMAGES} ảnh
                                    </span>
                                </div>
                                
                                <div className={`position-relative border border-2 border-dashed rounded-4 p-5 text-center ${uploadedImages.length >= MAX_IMAGES ? 'bg-secondary bg-opacity-10 border-secondary' : 'bg-light border-primary border-opacity-50'}`}>
                                    <input 
                                        type="file" multiple accept="image/*"
                                        onChange={handleImageUpload}
                                        className="position-absolute top-0 start-0 w-100 h-100 opacity-0"
                                        style={{ cursor: (isUploading || uploadedImages.length >= MAX_IMAGES) ? 'not-allowed' : 'pointer' }}
                                        disabled={isUploading || uploadedImages.length >= MAX_IMAGES}
                                    />
                                    {isUploading ? (
                                        <div className="text-primary">
                                            <div className="spinner-border mb-3" role="status"></div>
                                            <p className="fw-bold mb-0">Đang tải ảnh lên máy chủ...</p>
                                        </div>
                                    ) : (
                                        <div className={uploadedImages.length >= MAX_IMAGES ? "text-muted" : "text-primary"}>
                                            <UploadCloud size={48} className="mb-3 opacity-75" />
                                            <h6 className="fw-bold">
                                                {uploadedImages.length >= MAX_IMAGES ? "Đã đạt giới hạn số lượng ảnh" : "Kéo thả ảnh vào đây hoặc Nhấn để chọn"}
                                            </h6>
                                            <p className="small mb-0 text-secondary">Hỗ trợ JPG, PNG (Tối đa 10MB/ảnh)</p>
                                        </div>
                                    )}
                                </div>

                                {uploadedImages.length > 0 && (
                                    <div className="row g-3 mt-4">
                                        {uploadedImages.map((url, idx) => (
                                            <div key={idx} className="col-6 col-md-3">
                                                <div className="position-relative rounded overflow-hidden border border-2 border-white shadow-sm" style={{ aspectRatio: '4/3' }}>
                                                    <img src={url} alt={`Preview ${idx}`} className="w-100 h-100 object-fit-cover" />
                                                    <button 
                                                        onClick={() => handleRemoveImage(idx)}
                                                        className="btn btn-dark btn-sm position-absolute top-0 end-0 m-1 rounded-circle p-0 d-flex align-items-center justify-content-center shadow"
                                                        style={{ width: '26px', height: '26px' }}
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                    {idx === 0 && (
                                                        <div className="position-absolute bottom-0 start-0 w-100 bg-dark bg-opacity-75 text-white text-center py-1" style={{ fontSize: '11px', fontWeight: 'bold' }}>
                                                            ẢNH BÌA
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mt-5">
                            <button onClick={() => setFormStep(1)} className="btn btn-link text-dark text-decoration-none fw-bold px-0 d-flex align-items-center gap-2">
                                <ArrowLeft size={18} /> Quay lại Bước 1
                            </button>
                            <button 
                                onClick={handleGoToStep3}
                                className="btn btn-danger py-3 px-5 rounded-pill shadow-sm fw-bold"
                            >
                                Xem trước bài đăng &raquo;
                            </button>
                        </div>
                    </div>
                )}

                {/* GIAO DIỆN BƯỚC 3: XEM TRƯỚC (PREVIEW) */}
                {formStep === 3 && (
                    <div className="fade show">
                        <div className="alert alert-success d-flex align-items-center mb-4 rounded-4 border-0 shadow-sm" role="alert">
                            <CheckCircle className="me-3" size={24} />
                            <div>
                                <h6 className="fw-bold mb-1">Gần xong rồi!</h6>
                                <span className="small">Vui lòng kiểm tra lại thông tin trước khi xác nhận đăng tin.</span>
                            </div>
                        </div>

                        <div className="card shadow border-0 mb-4 rounded-4 overflow-hidden">
                            <div className="position-relative bg-dark" style={{ height: '300px' }}>
                                <img src={uploadedImages[0]} alt="Cover" className="w-100 h-100 object-fit-cover opacity-75" />
                                <span className="position-absolute top-0 start-0 m-3 badge bg-danger fs-6 px-3 py-2">
                                    Đang bán
                                </span>
                                <div className="position-absolute bottom-0 end-0 m-3 d-flex gap-2">
                                    {uploadedImages.slice(1, 4).map((url, idx) => (
                                        <div key={idx} className="border border-white border-2 rounded overflow-hidden" style={{ width: '60px', height: '60px' }}>
                                            <img src={url} alt="thumbnail" className="w-100 h-100 object-fit-cover" />
                                        </div>
                                    ))}
                                    {uploadedImages.length > 4 && (
                                        <div className="border border-white border-2 rounded bg-dark text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: '60px', height: '60px' }}>
                                            +{uploadedImages.length - 4}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="card-body p-4 p-md-5">
                                <h4 className="fw-bold text-dark mb-3">{propertyDetails.title}</h4>
                                <div className="d-flex align-items-center text-muted mb-4">
                                    <MapPin size={18} className="me-2" />
                                    <span>{displayAddress}</span>
                                </div>
                                <div className="row g-4 mb-4 pb-4 border-bottom">
                                    <div className="col-6 col-md-3">
                                        <div className="text-muted small mb-1">Mức giá</div>
                                        <div className="fw-bold text-danger fs-5">{propertyDetails.price} Triệu</div>
                                    </div>
                                    <div className="col-6 col-md-3">
                                        <div className="text-muted small mb-1">Diện tích</div>
                                        <div className="fw-bold text-dark fs-5">{propertyDetails.area} m²</div>
                                    </div>
                                    <div className="col-6 col-md-3">
                                        <div className="text-muted small mb-1">Đơn giá</div>
                                        <div className="fw-bold text-dark fs-5">
                                            {propertyDetails.area > 0 ? (propertyDetails.price / propertyDetails.area).toFixed(1) : 0} Tr/m²
                                        </div>
                                    </div>
                                </div>
                                
                                <h6 className="fw-bold mb-3">Mô tả bài đăng</h6>
                                <p className="text-secondary" style={{ whiteSpace: 'pre-line' }}>{propertyDetails.description || "Chưa có mô tả chi tiết."}</p>
                            </div>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mt-5">
                            <button onClick={() => setFormStep(2)} className="btn btn-link text-dark text-decoration-none fw-bold px-0 d-flex align-items-center gap-2">
                                <ArrowLeft size={18} /> Chỉnh sửa lại
                            </button>
                            <button 
                                onClick={handleSubmitListing}
                                disabled={isSubmitting}
                                className="btn btn-danger py-3 px-5 rounded-pill shadow fw-bold fs-5"
                            >
                                {isSubmitting ? (
                                    <span><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Đang xử lý...</span>
                                ) : (
                                    <><CheckCircle size={20} className="me-2" /> Xác nhận đăng tin</>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* MODAL ĐỊA CHỈ */}
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