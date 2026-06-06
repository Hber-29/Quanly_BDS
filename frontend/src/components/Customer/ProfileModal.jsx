import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Spinner } from 'react-bootstrap';
import { profileApi } from '../../api/profileApi'; 

const ProfileModal = ({ show, handleClose }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // 🔥 Bổ sung thêm biến 'preferences' vào state
    const [profile, setProfile] = useState({
        fullName: '', gender: 1, dob: '', phone: '', email: '', address: '', preferences: '', avatar: ''
    });
    
    const [avatarFile, setAvatarFile] = useState(null);
    const [previewAvatar, setPreviewAvatar] = useState("https://ui-avatars.com/api/?name=User&background=ffffff&color=dc3545");

    const accountId = localStorage.getItem('accountId');
    const roleId = localStorage.getItem('roleId');

    useEffect(() => {
        if (show && accountId && roleId) {
            fetchProfile();
        }
    }, [show, accountId, roleId]);

    const fetchProfile = async () => {
        setLoading(true);
        setIsEditing(false); 
        
        try {
            const data = await profileApi.getProfile(accountId, roleId);
            if (data) {
                let formattedDob = '';
                if (data.dob) {
                    const d = new Date(data.dob);
                    if (!isNaN(d.getTime())) formattedDob = d.toISOString().split('T')[0];
                }

                setProfile({
                    fullName: data.fullName || data.full_name || '',
                    gender: data.gender !== undefined ? data.gender : 1,
                    dob: formattedDob,
                    phone: data.phone || '',
                    email: data.email || '',
                    address: data.address || '',
                    preferences: data.preferences || '', // 🔥 Cập nhật sở thích từ DB
                    avatar: data.avatar || ''
                });

                // 🔥 XỬ LÝ HIỂN THỊ AVATAR
                const avatarPath = data.avatar || '';
                if (avatarPath.trim() !== '') {
                    // Cắt bỏ phần dư thừa để không bị lặp chữ /api/account
                    let finalPath = avatarPath;
                    if (avatarPath.startsWith('/uploads')) {
                        finalPath = `/api/account${avatarPath}`;
                    } else if (avatarPath.startsWith('api/account')) {
                        finalPath = `/${avatarPath}`;
                    }
                    setPreviewAvatar(`http://localhost:8000${finalPath}`);
                } else {
                    const nameForAvatar = (data.fullName || data.full_name || 'User').replace(/\s+/g, '+');
                    setPreviewAvatar(`https://ui-avatars.com/api/?name=${nameForAvatar}&background=ffffff&color=dc3545`);
                }
            }
        } catch (error) {
            console.error("Lỗi khi tải hồ sơ: ", error);
        }
        setLoading(false);
    };

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setPreviewAvatar(URL.createObjectURL(file)); 
        }
    };

    const handleSave = async () => {
        setLoading(true);
        const formData = new FormData();
        formData.append('fullName', profile.fullName || '');
        formData.append('gender', profile.gender || 1);
        formData.append('dob', profile.dob || '');
        formData.append('phone', profile.phone || '');
        formData.append('email', profile.email || '');
        formData.append('address', profile.address || '');
        formData.append('preferences', profile.preferences || ''); // 🔥 Gửi sở thích xuống Java
        formData.append('oldAvatar', profile.avatar || ''); 

        if (avatarFile) {
            formData.append('avatar', avatarFile); 
        }

        const result = await profileApi.updateProfile(accountId, roleId, formData);
        
        if (result && result.status === 'success') {
            alert("✅ Cập nhật hồ sơ thành công!");
            setIsEditing(false);
            setAvatarFile(null); 
            fetchProfile(); 
        } else {
            alert(`❌ ${result?.message || 'Có lỗi xảy ra!'}`);
        }
        setLoading(false);
    };

    const onClose = () => {
        setIsEditing(false);
        setAvatarFile(null);
        handleClose();
    };

    return (
        <Modal show={show} onHide={onClose} size="md" centered backdrop="static">
            <Modal.Header closeButton className="bg-danger text-white border-0">
                <Modal.Title className="w-100 text-center fw-bold">Hồ Sơ Cá Nhân</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-0 bg-light">
                {loading ? (
                    <div className="text-center py-5"><Spinner animation="border" variant="danger" /></div>
                ) : (
                    <div>
                        {/* HEADER AVATAR */}
                        <div className="bg-white pt-4 pb-3 mb-3 shadow-sm d-flex flex-column align-items-center justify-content-center">
                            <div className="position-relative">
                                <img 
                                    src={previewAvatar} 
                                    alt="Avatar" 
                                    className="rounded-circle shadow-sm border border-4 border-danger"
                                    style={{ width: '160px', height: '160px', objectFit: 'cover' }}
                                />
                                {isEditing && (
                                    <Form.Label className="position-absolute bottom-0 end-0 bg-danger text-white rounded-circle p-2 shadow" style={{cursor: 'pointer', transform: 'translate(-10px, -10px)'}}>
                                        <i className="bi bi-camera-fill fs-5"></i>
                                        <Form.Control type="file" hidden accept="image/*" onChange={handleFileChange} />
                                    </Form.Label>
                                )}
                            </div>
                            <h4 className="mt-3 fw-bold text-dark mb-1">{profile.fullName || "Tên chưa cập nhật"}</h4>
                            <span className="badge bg-danger px-3 py-2 rounded-pill mt-1">
                                {roleId == 3 ? "Khách Hàng" : "Quản Trị Viên"}
                            </span>
                        </div>

                        {/* THÔNG TIN CHI TIẾT */}
                        <div className="px-4 pb-4">
                            <h6 className="fw-bold text-secondary mb-3 text-uppercase" style={{fontSize: '13px'}}>Thông tin liên hệ</h6>
                            <Form>
                                <Row className="mb-3">
                                    <Col md={12} className="mb-3">
                                        <Form.Group>
                                            <Form.Label className="fw-semibold text-muted small">Họ và Tên</Form.Label>
                                            <Form.Control className="border-0 shadow-sm" name="fullName" value={profile.fullName || ''} onChange={handleChange} disabled={!isEditing} />
                                        </Form.Group>
                                    </Col>
                                    
                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label className="fw-semibold text-muted small">Số điện thoại</Form.Label>
                                            <Form.Control className="border-0 shadow-sm" name="phone" value={profile.phone || ''} onChange={handleChange} disabled={!isEditing} />
                                        </Form.Group>
                                    </Col>
                                    
                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label className="fw-semibold text-muted small">Giới tính</Form.Label>
                                            <Form.Select className="border-0 shadow-sm" name="gender" value={profile.gender || 1} onChange={handleChange} disabled={!isEditing}>
                                                <option value={1}>Nam</option>
                                                <option value={0}>Nữ</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>

                                    <Col md={12} className="mb-3">
                                        <Form.Group>
                                            <Form.Label className="fw-semibold text-muted small">Ngày sinh</Form.Label>
                                            <Form.Control className="border-0 shadow-sm" type="date" name="dob" value={profile.dob || ''} onChange={handleChange} disabled={!isEditing} />
                                        </Form.Group>
                                    </Col>

                                    {/* 🔥 THÊM Ô CHỌN LOẠI BĐS QUAN TÂM (PREFERENCES) */}
                                    <Col md={12} className="mb-3">
                                        <Form.Group>
                                            <Form.Label className="fw-semibold text-muted small">Loại BĐS Quan Tâm</Form.Label>
                                            <Form.Select className="border-0 shadow-sm" name="preferences" value={profile.preferences || ''} onChange={handleChange} disabled={!isEditing}>
                                                <option value="">-- Chưa xác định --</option>
                                                <option value="Căn Hộ">Căn Hộ</option>
                                                <option value="Nhà Phố">Nhà Phố</option>
                                                <option value="Đất Nền">Đất Nền</option>
                                                <option value="Biệt Thự">Biệt Thự</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>

                                    <Col md={12}>
                                        <Form.Group>
                                            <Form.Label className="fw-semibold text-muted small">Địa chỉ hiện tại</Form.Label>
                                            <Form.Control className="border-0 shadow-sm" as="textarea" rows={2} name="address" value={profile.address || ''} onChange={handleChange} disabled={!isEditing} />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Form>
                        </div>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer className="bg-white border-top-0 d-flex justify-content-center pb-4">
                {isEditing ? (
                    <div className="w-100 px-3 d-flex gap-2">
                        <Button variant="light" className="w-50 fw-bold border shadow-sm" onClick={() => setIsEditing(false)}>Hủy Bỏ</Button>
                        <Button variant="danger" className="w-50 fw-bold shadow-sm" onClick={handleSave} disabled={loading}>
                            {loading ? "Đang xử lý..." : "Lưu Cập Nhật"}
                        </Button>
                    </div>
                ) : (
                    <Button variant="outline-danger" className="w-75 fw-bold rounded-pill shadow-sm" onClick={() => setIsEditing(true)}>
                        <i className="bi bi-pencil-square me-2"></i> Chỉnh Sửa Thông Tin
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    );
};

export default ProfileModal;