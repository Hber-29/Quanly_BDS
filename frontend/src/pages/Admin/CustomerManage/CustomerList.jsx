import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Badge } from 'react-bootstrap';
import { adminApi } from '../../../api/adminApi';

const CustomerList = () => {
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [customers, setCustomers] = useState([]); 
  
  const [formData, setFormData] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const loadData = async () => {
    const data = await adminApi.getAllCustomers();
    setCustomers(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const getAvatarUrl = (avatarPath, fullName) => {
    if (!avatarPath) return `https://ui-avatars.com/api/?name=${fullName}&background=dc3545&color=fff`;
    if (avatarPath.startsWith('http')) return avatarPath;
    return `http://localhost:8081${avatarPath}`;
  };

  const handleOpenView = (user) => { setSelectedUser(user); setShowView(true); };
  
  const handleOpenEdit = (user) => { 
    setSelectedUser(user); 
    setFormData(user); 
    setAvatarFile(null);    
    setAvatarPreview(null); 
    setShowEdit(true); 
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file); 
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  const handleSaveChanges = async () => {
    const dataToSend = new FormData();
    dataToSend.append("accountId", formData.accountId);
    dataToSend.append("fullName", formData.fullName || "");
    dataToSend.append("phone", formData.phone || "");
    dataToSend.append("gender", formData.gender || "");
    dataToSend.append("dob", formData.dob || "");
    dataToSend.append("address", formData.address || "");
    
    if (avatarFile) {
      dataToSend.append("avatar", avatarFile);
    }

    const result = await adminApi.updateCustomer(dataToSend);
    
    if(result.status === 'success') {
      alert("🎉 " + result.message); 
      setShowEdit(false);            
      loadData();                    
    } else {
      alert("❌ " + result.message); 
    }
  };

  // 🔥 HÀM THAY ĐỔI TRẠNG THÁI (KHÓA / MỞ) CHUẨN
  const handleToggleStatus = async (userId, currentStatus) => {
    const isActive = currentStatus !== 'ACTIVE'; 
    const actionText = isActive ? "MỞ KHÓA" : "KHÓA";

    if(window.confirm(`⚠️ Sếp có chắc chắn muốn ${actionText} tài khoản này không?`)) {
      const result = await adminApi.changeStatus(userId, isActive);
      if(result.status === 'success') {
        alert("🎉 " + result.message); 
        loadData(); 
      } else {
        alert("❌ " + result.message); 
      }
    }
  };

  return (
    <div className="container-fluid bg-white p-4 rounded shadow-sm">
      <h4 className="mb-4 text-danger fw-bold border-bottom pb-2">
        <i className="bi bi-people-fill me-2"></i> DANH SÁCH KHÁCH HÀNG
      </h4>
      
      <Table responsive hover className="align-middle border">
        <thead className="table-light">
          <tr>
            <th>ID</th><th>Khách hàng</th><th>Email</th><th>SĐT</th><th>Trạng thái</th><th className="text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {customers.length > 0 ? (
            customers.map(user => (
              <tr key={user.accountId}>
                <td className="fw-bold">{user.accountId}</td>
                <td>
                  <div className="d-flex align-items-center">
                    <img 
                      src={getAvatarUrl(user.avatar, user.fullName)} 
                      alt="avatar" className="rounded-circle me-2 object-fit-cover" width="30" height="30" 
                    />
                    {user.fullName}
                  </div>
                </td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>
                  <Badge bg={user.status === 'ACTIVE' ? 'success' : 'danger'}>
                    {user.status === 'ACTIVE' ? 'Hoạt động' : 'Bị khóa'}
                  </Badge>
                </td>
                <td className="text-center">
                  <Button variant="outline-info" size="sm" className="me-2" onClick={() => handleOpenView(user)}>
                    <i className="bi bi-eye-fill"></i>
                  </Button>
                  <Button variant="outline-warning" size="sm" className="me-2" onClick={() => handleOpenEdit(user)}>
                    <i className="bi bi-pencil-square"></i>
                  </Button>
                  
                  {/* 🔥 NÚT BẤM ĐÃ ĐƯỢC CẬP NHẬT ĐỂ ĐỔI LINH HOẠT KHÓA/MỞ */}
                  {user.status === 'ACTIVE' ? (
                    <Button variant="outline-danger" size="sm" onClick={() => handleToggleStatus(user.accountId, user.status)} title="Khóa tài khoản">
                      <i className="bi bi-lock-fill"></i>
                    </Button>
                  ) : (
                    <Button variant="outline-success" size="sm" onClick={() => handleToggleStatus(user.accountId, user.status)} title="Mở khóa tài khoản">
                      <i className="bi bi-unlock-fill"></i>
                    </Button>
                  )}

                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="6" className="text-center text-muted py-4">Đang tải dữ liệu...</td></tr>
          )}
        </tbody>
      </Table>

      <Modal show={showView} onHide={() => setShowView(false)} centered backdrop="static">
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title className="fs-5">Chi tiết Khách hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <div className="text-center">
              <img 
                src={getAvatarUrl(selectedUser.avatar, selectedUser.fullName)} 
                alt="Avatar" className="rounded-circle mb-3 border border-3 border-danger shadow-sm object-fit-cover" width="100" height="100" 
              />
              <h5 className="fw-bold text-danger">{selectedUser.fullName}</h5>
              <Badge bg={selectedUser.status === 'ACTIVE' ? 'success' : 'danger'} className="mb-3">{selectedUser.status}</Badge>
              <div className="text-start px-3">
                <p><strong><i className="bi bi-envelope me-2"></i>Email:</strong> {selectedUser.email}</p>
                <p><strong><i className="bi bi-telephone me-2"></i>SĐT:</strong> {selectedUser.phone}</p>
                <p><strong><i className="bi bi-gender-ambiguous me-2"></i>Giới tính:</strong> {selectedUser.gender === "1" ? "Nam" : "Nữ"}</p>
                <p><strong><i className="bi bi-calendar me-2"></i>Ngày sinh:</strong> {selectedUser.dob}</p>
                <p><strong><i className="bi bi-geo-alt me-2"></i>Địa chỉ:</strong> {selectedUser.address}</p>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>

      <Modal show={showEdit} onHide={() => setShowEdit(false)} centered backdrop="static">
        <Modal.Header closeButton className="bg-warning text-dark border-bottom-0">
          <Modal.Title className="fs-5"><i className="bi bi-pencil-square me-2"></i>Chỉnh sửa Khách hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <div className="text-center mb-4">
              <img 
                src={avatarPreview || getAvatarUrl(formData.avatar, formData.fullName)} 
                alt="Avatar" className="rounded-circle border shadow-sm object-fit-cover" width="100" height="100" 
              />
              <div className="mt-3">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="form-control form-control-sm w-75 mx-auto" 
                  onChange={handleAvatarChange} 
                />
              </div>
            </div>
            
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Họ và tên</Form.Label>
              <Form.Control type="text" name="fullName" value={formData.fullName || ''} onChange={handleChange} />
            </Form.Group>

            <div className="row">
              <Form.Group className="mb-3 col-6">
                <Form.Label className="fw-bold">Số điện thoại</Form.Label>
                <Form.Control type="text" name="phone" value={formData.phone || ''} onChange={handleChange} />
              </Form.Group>

              <Form.Group className="mb-3 col-6">
                <Form.Label className="fw-bold">Giới tính</Form.Label>
                <Form.Select name="gender" value={formData.gender || ''} onChange={handleChange}>
                  <option value="">Chọn giới tính</option>
                  <option value="1">Nam</option>
                  <option value="0">Nữ</option>
                </Form.Select>
              </Form.Group>
            </div>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Ngày sinh</Form.Label>
              <Form.Control type="date" name="dob" value={formData.dob || ''} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Địa chỉ</Form.Label>
              <Form.Control as="textarea" rows={2} name="address" value={formData.address || ''} onChange={handleChange} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEdit(false)}>Hủy</Button>
          <Button variant="danger" onClick={handleSaveChanges}>Lưu thay đổi</Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default CustomerList;