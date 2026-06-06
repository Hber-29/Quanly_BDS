import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Badge } from 'react-bootstrap';
// Import file API sếp vừa tạo ở bước trước
import { adminApi } from '../../../api/adminApi'; 

const CustomerList = () => {
  // --- STATES ---
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [customers, setCustomers] = useState([]); // Khởi tạo mảng rỗng

  // --- GỌI API KHI VÀO TRANG ---
  useEffect(() => {
    const loadData = async () => {
      const data = await adminApi.getAllCustomers();
      setCustomers(data);
    };
    loadData();
  }, []);

  // --- HANDLERS ---
  const handleOpenView = (user) => { setSelectedUser(user); setShowView(true); };
  const handleOpenEdit = (user) => { setSelectedUser(user); setShowEdit(true); };
  
  const handleDisable = (userId) => {
    if(window.confirm("Sếp có chắc chắn muốn vô hiệu hóa tài khoản này không?")) {
      alert("Chức năng đang được xây dựng cho ID: " + userId);
    }
  };

  return (
    <div className="container-fluid bg-white p-4 rounded shadow-sm">
      <h4 className="mb-4 text-danger fw-bold border-bottom pb-2">
        <i className="bi bi-people-fill me-2"></i> DANH SÁCH KHÁCH HÀNG
      </h4>
      
      {/* --- BẢNG DỮ LIỆU --- */}
      <Table responsive hover className="align-middle border">
        <thead className="table-light">
          <tr>
            <th>ID</th>
            <th>Khách hàng</th>
            <th>Email</th>
            <th>SĐT</th>
            <th>Trạng thái</th>
            <th className="text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {customers.length > 0 ? (
            customers.map(user => (
              <tr key={user.accountId}>
                <td className="fw-bold">{user.accountId}</td>
                <td>
                  <div className="d-flex align-items-center">
                    {/* Tự động tạo Avatar từ tên nếu không có ảnh */}
                    <img 
                      src={user.avatar || `https://ui-avatars.com/api/?name=${user.fullName}&background=dc3545&color=fff`} 
                      alt="avatar" 
                      className="rounded-circle me-2" 
                      width="30" 
                      height="30" 
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
                  <Button variant="outline-info" size="sm" className="me-2" title="Xem chi tiết" onClick={() => handleOpenView(user)}>
                    <i className="bi bi-eye-fill"></i>
                  </Button>
                  <Button variant="outline-warning" size="sm" className="me-2" title="Chỉnh sửa" onClick={() => handleOpenEdit(user)}>
                    <i className="bi bi-pencil-square"></i>
                  </Button>
                  <Button variant="outline-danger" size="sm" title="Vô hiệu hóa" onClick={() => handleDisable(user.accountId)}>
                    <i className="bi bi-lock-fill"></i>
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center text-muted py-4">Đang tải dữ liệu hoặc không có khách hàng nào...</td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* ================= MODAL XEM CHI TIẾT ================= */}
      <Modal show={showView} onHide={() => setShowView(false)} centered backdrop="static">
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title className="fs-5">Chi tiết Khách hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <div className="text-center">
              <img 
                src={selectedUser.avatar || `https://ui-avatars.com/api/?name=${selectedUser.fullName}&background=dc3545&color=fff`} 
                alt="Avatar" 
                className="rounded-circle mb-3 border border-3 border-danger shadow-sm" 
                width="100" 
                height="100" 
              />
              <h5 className="fw-bold text-danger">{selectedUser.fullName}</h5>
              <Badge bg={selectedUser.status === 'ACTIVE' ? 'success' : 'danger'} className="mb-3">
                {selectedUser.status}
              </Badge>

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

      {/* ================= MODAL CHỈNH SỬA (Sẽ nối API sau) ================= */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)} centered backdrop="static">
        <Modal.Header closeButton className="bg-warning text-dark border-bottom-0">
          <Modal.Title className="fs-5"><i className="bi bi-pencil-square me-2"></i>Chỉnh sửa Khách hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <Form>
              <div className="text-center mb-4">
                <img 
                  src={selectedUser.avatar || `https://ui-avatars.com/api/?name=${selectedUser.fullName}&background=dc3545&color=fff`} 
                  alt="Avatar" 
                  className="rounded-circle border shadow-sm" 
                  width="90" 
                  height="90" 
                />
              </div>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Họ và tên</Form.Label>
                <Form.Control type="text" defaultValue={selectedUser.fullName} />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEdit(false)}>Hủy</Button>
          <Button variant="danger">Lưu thay đổi</Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default CustomerList;