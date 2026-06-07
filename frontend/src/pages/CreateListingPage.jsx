import { useState, useEffect } from 'react';
import axios from 'axios'; 
import axiosClient from '../api/axiosClient'; 
import { X, MapPin, Search, UploadCloud, ArrowLeft, CheckCircle, Tag, Key, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatPrice, formatArea } from '../utils/formatPrice';

const CreateListingPage = () => {
    const navigate = useNavigate();

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
            const uploadPromises = filesToUpload.map(async (file) => {
                const formData = new FormData();
                formData.append('file', file);
                try {
                    const res = await axiosClient.post('/api/upload/image', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    return res.imageUrl || (res.data && res.data.imageUrl) || null;
                } catch (err) {
                    console.error(`❌ Lỗi upload file ${file.name}:`, err);
                    return null; 
                }
            });

            const results = await Promise.all(uploadPromises);
            const validUrls = results.filter(url => url !== null);
            
            if (validUrls.length < filesToUpload.length) {
                alert("Một số ảnh bị lỗi trong quá trình tải lên. Vui lòng thử lại với các ảnh đó.");
            }
            setUploadedImages(prev => [...prev, ...validUrls]);
        } catch (err) {
            console.error("❌ Lỗi hệ thống upload:", err);
            alert("Đã xảy ra lỗi hệ thống trong quá trình tải ảnh.");
        } finally {
            setIsUploading(false);
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
            setIsSubmitting(false);
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
                alert("🎉 " + res.message); 
                navigate('/nha-dat-ban'); 
            } else {
                alert("❌ Có lỗi xảy ra: " + (res?.message || "Lỗi không xác định"));
            }
        } catch (err) {
            console.error("Lỗi khi đăng tin:", err);
            alert("❌ Không thể kết nối đến máy chủ Backend hoặc Lỗi xử lý giao diện!");
        } finally {
            setIsSubmitting(false);
        }
    };

    // TIÊU ĐỀ BƯỚC
    const getStepTitle = () => {
        if (formStep === 1) return "Bước 1. Thông tin BĐS";
        if (formStep === 2) return "Bước 2. Chi tiết & Hình ảnh";
        return "Bước 3. Xem trước & Xác nhận";
    };

    return (
        <div className="bg-light min-vh-100 font-sans" style={{ paddingBottom: '100px' }}>
            <style>
                {`
                .smooth-transition { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                
                /* Progress Header */
                .wizard-header { background: #fff; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
                .progress-container { width: 100%; height: 4px; background-color: #f1f3f5; position: absolute; bottom: 0; left: 0; }
                .progress-bar-fill { height: 100%; background-color: #dc3545; transition: width 0.4s ease; }
                
                /* Selection Cards (Nhu cầu) */
                .selection-card { border: 1px solid #dee2e6; border-radius: 8px; padding: 25px; cursor: pointer; background: #fff; transition: all 0.2s; display: flex; align-items: center; gap: 15px; }
                .selection-card.active { border-color: #212529; box-shadow: 0 0 0 1px #212529; }
                .selection-card:hover:not(.active):not(.disabled) { border-color: #adb5bd; }
                .selection-card.disabled { opacity: 0.5; cursor: not-allowed; background: #f8f9fa; }
                
                /* Forms */
                .form-control-lg, .form-select-lg { font-size: 15px; border-radius: 8px; padding: 12px 15px; border: 1px solid #ced4da; }
                .form-control-lg:focus, .form-select-lg:focus { border-color: #dc3545; box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.1); }
                .form-label { font-weight: 600; color: #212529; font-size: 14px; margin-bottom: 8px; }
                
                /* Sticky Footer */
                .sticky-footer { position: fixed; bottom: 0; left: 0; right: 0; background: #fff; border-top: 1px solid #dee2e6; padding: 15px 0; z-index: 100; box-shadow: 0 -4px 15px rgba(0,0,0,0.05); }
                
                .fade-in { animation: fadeIn 0.4s ease-in-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                `}
            </style>

            {/* HEADER WIZARD THEO CHUẨN ẢNH MẪU */}
            <div className="wizard-header">
                <div className="container-fluid px-4 px-md-5">
                    <div className="d-flex justify-content-between align-items-center py-3">
                        <h4 className="fw-bold mb-0 text-dark">Tạo tin đăng</h4>
                        <button onClick={() => navigate(-1)} className="btn btn-outline-dark rounded-pill px-4 fw-bold">
                            Thoát
                        </button>
                    </div>
                    <div className="pb-3">
                        <span className="text-dark fw-semibold" style={{fontSize: '14px'}}>{getStepTitle()}</span>
                    </div>
                </div>
                <div className="progress-container">
                    <div className="progress-bar-fill" style={{ width: `${(formStep / 3) * 100}%` }}></div>
                </div>
            </div>

            <div className="container py-5" style={{ maxWidth: '900px' }}>
                
                {/* ======================================================== */}
                {/* BƯỚC 1: NHU CẦU & ĐỊA CHỈ */}
                {/* ======================================================== */}
                {formStep === 1 && (
                    <div className="fade-in">
                        <div className="bg-white p-4 p-md-5 rounded-4 shadow-sm border border-light-subtle mb-4">
                            <h6 className="fw-bold text-dark mb-4 fs-5">Nhu cầu <span className="text-danger">*</span></h6>
                            <div className="row g-4">
                                <div className="col-md-6">
                                    <div className={`selection-card ${transactionType === 'SALE' ? 'active' : ''}`} onClick={() => setTransactionType('SALE')}>
                                        <Tag size={24} className={transactionType === 'SALE' ? 'text-dark' : 'text-muted'} />
                                        <span className="fw-bold fs-6">Bán</span>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="selection-card disabled" onClick={() => alert("Tính năng cho thuê đang phát triển!")}>
                                        <Key size={24} className="text-muted" />
                                        <span className="fw-bold fs-6 text-muted">Cho thuê</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-danger mt-3" style={{fontSize: '13px'}}>Thông tin này bắt buộc phải điền</div>
                        </div>

                        <div className="bg-white p-4 p-md-5 rounded-4 shadow-sm border border-light-subtle mb-4">
                            <h6 className="fw-bold text-dark mb-4 fs-5">Địa chỉ <span className="text-danger">*</span></h6>
                            <div 
                                onClick={() => setIsModalOpen(true)} 
                                className="d-flex align-items-center gap-3 border rounded-3 p-3 cursor-pointer smooth-transition"
                                style={{ borderColor: displayAddress ? '#212529' : '#ced4da', backgroundColor: '#fff' }}
                            >
                                <MapPin size={22} className={displayAddress ? "text-danger" : "text-muted"} />
                                <span className={displayAddress ? "text-dark fw-medium" : "text-muted"}>
                                    {displayAddress || "Bấm vào đây để nhập địa chỉ nhà đất..."}
                                </span>
                            </div>
                            <div className="text-danger mt-3" style={{fontSize: '13px'}}>Thông tin này bắt buộc phải điền</div>
                        </div>
                    </div>
                )}

                {/* ======================================================== */}
                {/* BƯỚC 2: CHI TIẾT & HÌNH ẢNH */}
                {/* ======================================================== */}
                {formStep === 2 && (
                    <div className="fade-in">
                        <div className="bg-white p-4 p-md-5 rounded-4 shadow-sm border border-light-subtle mb-4">
                            <h5 className="fw-bold text-dark mb-4">Thông tin chi tiết <span className="text-danger">*</span></h5>
                            
                            <div className="mb-4">
                                <label className="form-label">Loại hình Bất động sản</label>
                                <select 
                                    className="form-select form-select-lg"
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
                                <label className="form-label">Tiêu đề bài đăng</label>
                                <input 
                                    type="text" placeholder="VD: Bán nhà phố liền kề siêu đẹp..." 
                                    className="form-control form-control-lg"
                                    value={propertyDetails.title}
                                    onChange={(e) => setPropertyDetails({...propertyDetails, title: e.target.value})}
                                />
                                <div className="text-muted small mt-2">Nên viết tiếng Việt có dấu, mô tả ngắn gọn và thu hút.</div>
                            </div>
                            
                            <div className="mb-4">
                                <label className="form-label">Mô tả chi tiết</label>
                                <textarea 
                                    rows="6" placeholder="Nhập thông tin chi tiết về nhà đất, tiện ích xung quanh, pháp lý..." 
                                    className="form-control form-control-lg" style={{ resize: 'none' }}
                                    value={propertyDetails.description}
                                    onChange={(e) => setPropertyDetails({...propertyDetails, description: e.target.value})}
                                ></textarea>
                            </div>

                            <div className="row g-4">
                                <div className="col-md-6">
                                    <label className="form-label">Mức Giá (Triệu VNĐ)</label>
                                    <input 
                                        type="number" placeholder="VD: 2500" 
                                        className="form-control form-control-lg"
                                        value={propertyDetails.price}
                                        onChange={(e) => setPropertyDetails({...propertyDetails, price: e.target.value})}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Diện tích (m²)</label>
                                    <input 
                                        type="number" placeholder="VD: 100" 
                                        className="form-control form-control-lg"
                                        value={propertyDetails.area}
                                        onChange={(e) => setPropertyDetails({...propertyDetails, area: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 p-md-5 rounded-4 shadow-sm border border-light-subtle mb-4">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="fw-bold text-dark mb-0">Hình ảnh BĐS <span className="text-danger">*</span></h5>
                                <span className={`badge ${uploadedImages.length >= MAX_IMAGES ? 'bg-danger' : 'bg-secondary'} px-3 py-2`}>
                                    Đã tải lên: {uploadedImages.length} / {MAX_IMAGES}
                                </span>
                            </div>
                            
                            <div className={`position-relative border border-2 border-dashed rounded-4 p-5 text-center smooth-transition ${uploadedImages.length >= MAX_IMAGES ? 'bg-light border-secondary opacity-50' : 'bg-light border-danger border-opacity-25'}`}>
                                <input 
                                    type="file" multiple accept="image/*"
                                    onChange={handleImageUpload}
                                    className="position-absolute top-0 start-0 w-100 h-100 opacity-0"
                                    style={{ cursor: (isUploading || uploadedImages.length >= MAX_IMAGES) ? 'not-allowed' : 'pointer' }}
                                    disabled={isUploading || uploadedImages.length >= MAX_IMAGES}
                                />
                                {isUploading ? (
                                    <div className="text-danger">
                                        <div className="spinner-border mb-3" role="status"></div>
                                        <p className="fw-bold mb-0">Đang tải ảnh lên máy chủ...</p>
                                    </div>
                                ) : (
                                    <div className="text-secondary">
                                        <UploadCloud size={48} className="mb-3 text-danger opacity-75" />
                                        <h6 className="fw-bold text-dark">Nhấn để chọn ảnh hoặc kéo thả vào đây</h6>
                                        <p className="small mb-0">Hỗ trợ JPG, PNG (Tối đa 10MB/ảnh)</p>
                                    </div>
                                )}
                            </div>

                            {uploadedImages.length > 0 && (
                                <div className="row g-3 mt-4">
                                    {uploadedImages.map((url, idx) => (
                                        <div key={idx} className="col-6 col-md-3">
                                            <div className="position-relative rounded-3 overflow-hidden border shadow-sm" style={{ aspectRatio: '4/3' }}>
                                                <img src={url} alt={`Preview ${idx}`} className="w-100 h-100 object-fit-cover" />
                                                <button 
                                                    onClick={() => handleRemoveImage(idx)}
                                                    className="btn btn-dark btn-sm position-absolute top-0 end-0 m-2 rounded-circle p-1 d-flex align-items-center justify-content-center"
                                                    style={{ width: '28px', height: '28px' }}
                                                >
                                                    <X size={16} />
                                                </button>
                                                {idx === 0 && (
                                                    <div className="position-absolute bottom-0 start-0 w-100 bg-danger text-white text-center py-1 fw-bold" style={{ fontSize: '11px' }}>
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
                )}

                {/* ======================================================== */}
                {/* BƯỚC 3: XEM TRƯỚC (PREVIEW) */}
                {/* ======================================================== */}
                {formStep === 3 && (
                    <div className="fade-in">
                        <div className="alert alert-success d-flex align-items-center mb-4 border-0 shadow-sm rounded-4 p-4">
                            <CheckCircle className="me-3 text-success" size={28} />
                            <div>
                                <h6 className="fw-bold text-success mb-1">Gần hoàn tất!</h6>
                                <span className="text-success opacity-75 small">Vui lòng kiểm tra lại thông tin bên dưới trước khi đăng bài.</span>
                            </div>
                        </div>

                        <div className="card border border-light-subtle shadow-sm rounded-4 overflow-hidden mb-5">
                            <div className="position-relative bg-dark" style={{ height: '350px' }}>
                                <img src={uploadedImages[0]} alt="Cover" className="w-100 h-100 object-fit-cover opacity-75" />
                                <span className="position-absolute top-0 start-0 m-3 badge bg-danger fs-6 px-3 py-2 shadow-sm">TIN XEM TRƯỚC</span>
                            </div>

                            <div className="card-body p-4 p-md-5">
                                <h3 className="fw-bold text-dark mb-3 lh-base">{propertyDetails.title}</h3>
                                <div className="d-flex align-items-center text-muted mb-4">
                                    <MapPin size={18} className="me-2 text-danger" />
                                    <span>{displayAddress}</span>
                                </div>
                                <div className="row g-0 py-4 border-top border-bottom bg-light rounded-3 mb-4 text-center">
                                    <div className="col-4 border-end border-secondary-subtle">
                                        <div className="text-muted small mb-1">Mức giá</div>
                                        <div className="fw-bold text-danger fs-5">{formatPrice(propertyDetails.price)}</div>
                                    </div>
                                    <div className="col-4 border-end border-secondary-subtle">
                                        <div className="text-muted small mb-1">Diện tích</div>
                                        <div className="fw-bold text-dark fs-5">{propertyDetails.area} m²</div>
                                    </div>
                                    <div className="col-4">
                                        <div className="text-muted small mb-1">Loại hình</div>
                                        <div className="fw-bold text-dark fs-5">
                                            {categories.find(c => c.categoryId === propertyDetails.categoryId)?.categoryName}
                                        </div>
                                    </div>
                                </div>
                                
                                <h6 className="fw-bold mb-3 text-dark">Mô tả bài đăng</h6>
                                <p className="text-secondary lh-lg" style={{ whiteSpace: 'pre-line' }}>{propertyDetails.description}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* STICKY FOOTER (THANH ĐIỀU HƯỚNG CỐ ĐỊNH Ở ĐÁY) */}
            <div className="sticky-footer">
                <div className="container d-flex justify-content-between align-items-center" style={{ maxWidth: '900px' }}>
                    {formStep > 1 ? (
                        <button onClick={() => setFormStep(formStep - 1)} className="btn btn-link text-dark text-decoration-none fw-bold p-0 d-flex align-items-center gap-2">
                            <ArrowLeft size={18} /> Quay lại
                        </button>
                    ) : <div />}

                    {formStep < 3 ? (
                        <button 
                            onClick={() => {
                                if(formStep === 1) handleGoToStep2();
                                else if (formStep === 2) handleGoToStep3();
                            }} 
                            className="btn btn-danger py-3 px-5 rounded-3 shadow-sm fw-bold d-flex align-items-center gap-2"
                        >
                            Tiếp tục <ChevronRight size={18} />
                        </button>
                    ) : (
                        <button 
                            onClick={handleSubmitListing}
                            disabled={isSubmitting}
                            className="btn btn-danger py-3 px-5 rounded-3 shadow fw-bold fs-6 d-flex align-items-center gap-2"
                        >
                            {isSubmitting ? (
                                <><span className="spinner-border spinner-border-sm" role="status"></span> Đang xử lý...</>
                            ) : (
                                <><CheckCircle size={20} /> Xác nhận đăng tin</>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* MODAL ĐỊA CHỈ (GIỮ NGUYÊN LOGIC CỦA SẾP) */}
            {isModalOpen && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center fade-in" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050, padding: '15px' }}>
                    <div className="bg-white rounded-4 shadow-lg d-flex flex-column" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh' }}>
                        <div className="bg-dark text-white px-4 py-3 d-flex justify-content-between align-items-center" style={{ borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem' }}>
                            <h5 className="mb-0 fw-bold">{modalStep === 1 ? 'Chọn địa chỉ' : 'Nhập địa chỉ'}</h5>
                            <button onClick={() => setIsModalOpen(false)} className="btn btn-link text-white p-0 opacity-75 hover-opacity-100"><X size={24} /></button>
                        </div>
                        
                        <div className="p-4 overflow-auto custom-scrollbar">
                            {modalStep === 1 ? (
                                <div>
                                    <div className="position-relative mb-4">
                                        <Search size={18} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                                        <input type="text" placeholder="Tìm kiếm địa chỉ..." className="form-control form-control-lg ps-5 rounded-pill fs-6 bg-light border-0" />
                                    </div>
                                    <div className="d-flex align-items-center gap-3 mb-4">
                                        <hr className="flex-grow-1" /><span className="text-muted small fw-bold text-uppercase">Hoặc</span><hr className="flex-grow-1" />
                                    </div>
                                    <div className="text-center">
                                        <button onClick={() => setModalStep(2)} className="btn btn-outline-dark fw-bold rounded-pill px-4 py-2 w-100">
                                            Chọn địa chỉ hành chính
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="d-flex flex-column gap-3">
                                    <div>
                                        <label className="form-label">Tỉnh / Thành phố</label>
                                        <select className="form-select form-select-lg fs-6" value={selectedCodes.provinceCode} onChange={(e) => {
                                            const selected = provinces.find(p => p.code == e.target.value);
                                            setAddressData({...addressData, province: selected?.name || '', district: '', ward: ''});
                                            setSelectedCodes({...selectedCodes, provinceCode: e.target.value, districtCode: ''});
                                        }}>
                                            <option value="">Chọn Tỉnh/Thành</option>
                                            {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="form-label">Quận / Huyện</label>
                                        <select className="form-select form-select-lg fs-6" disabled={!selectedCodes.provinceCode} value={selectedCodes.districtCode} onChange={(e) => {
                                            const selected = districts.find(d => d.code == e.target.value);
                                            setAddressData({...addressData, district: selected?.name || '', ward: ''});
                                            setSelectedCodes({...selectedCodes, districtCode: e.target.value});
                                        }}>
                                            <option value="">Chọn Quận/Huyện</option>
                                            {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="form-label">Phường / Xã</label>
                                        <select className="form-select form-select-lg fs-6" disabled={!selectedCodes.districtCode} value={wards.find(w => w.name === addressData.ward)?.code || ''} onChange={(e) => {
                                            const selected = wards.find(w => w.code == e.target.value);
                                            setAddressData({...addressData, ward: selected?.name || ''});
                                        }}>
                                            <option value="">Chọn Phường/Xã</option>
                                            {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="form-label">Đường / Phố (Tùy chọn)</label>
                                        <input type="text" placeholder="VD: Lê Văn Lương" className="form-control form-control-lg fs-6" onChange={(e) => setAddressData({...addressData, street: e.target.value})} value={addressData.street} />
                                    </div>
                                    <div>
                                        <label className="form-label">Số nhà chi tiết</label>
                                        <input type="text" placeholder="VD: Số nhà 12, Ngõ 34..." className="form-control form-control-lg fs-6" onChange={(e) => setAddressData({...addressData, detail: e.target.value})} value={addressData.detail} />
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {modalStep === 2 && (
                            <div className="bg-light p-3 px-4 d-flex justify-content-between align-items-center border-top" style={{ borderBottomLeftRadius: '1rem', borderBottomRightRadius: '1rem' }}>
                                <button onClick={() => setModalStep(1)} className="btn btn-link text-dark fw-bold text-decoration-none px-0">Quay lại</button>
                                <button onClick={handleConfirmAddress} className="btn btn-dark fw-bold px-4 py-2 rounded-3 shadow-sm">Xác nhận</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateListingPage;