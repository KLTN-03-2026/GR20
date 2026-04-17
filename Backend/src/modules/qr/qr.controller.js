const service = require("./qr.service");

const getPersonalQr = async (req, res) => {
  try {
    const data = await service.getPersonalQr(req.params.userId);
    res.json({ operationType: "Success", message: "Get personal QR successfully", code: "OK", data, timestamp: new Date() });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

const createGuestQr = async (req, res) => {
  try {
    const data = await service.createGuestQr(req.body);
    res.status(201).json({ operationType: "Success", message: "Create guest QR successfully", code: "CREATED", data, timestamp: new Date() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── DANH SÁCH QR KHÁCH (Có lọc, phân trang, sắp xếp) ───────────────────────────────────
const getGuestQrsByHost = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit, offset, onlyValid } = req.query;
    
    const data = await service.getGuestQrsByHost(userId, {
      limit,
      offset,
      onlyValid
    });
    
    res.json({ 
      operationType: "Success", 
      message: "Get guest QR list successfully", 
      code: "OK", 
      data, 
      timestamp: new Date() 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getGuestQrById = async (req, res) => {
  try {
    const data = await service.getGuestQrById(req.params.id);
    res.json({ operationType: "Success", message: "Get guest QR successfully", code: "OK", data, timestamp: new Date() });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

// Trong qr.controller.js
const scanQr = async (req, res) => {
  try {
    const { direction, gate, building_id } = req.query;
    const data = await service.scanQr(req.params.qrCode, {
      direction,
      gate,
      building_id: building_id ? parseInt(building_id) : null
    });
    res.json({ 
      operationType: "Success", 
      message: "QR hợp lệ", 
      code: "OK", 
      data, 
      timestamp: new Date() 
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateGuestQr = async (req, res) => {
  try {
    const data = await service.updateGuestQr(req.params.id, req.body);
    res.json({ operationType: "Success", message: "Update guest QR successfully", code: "OK", data, timestamp: new Date() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteGuestQr = async (req, res) => {
  try {
    const data = await service.deleteGuestQr(req.params.id);
    res.json({ operationType: "Success", message: "Delete guest QR successfully", code: "OK", data, timestamp: new Date() });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

const getGuestQrHistory = async (req, res) => {
  try {
    const data = await service.getGuestQrHistory(req.params.userId);
    res.json({ operationType: "Success", message: "Get QR history successfully", code: "OK", data, timestamp: new Date() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getPersonalQr,
  createGuestQr,
  getGuestQrsByHost,
  getGuestQrById,
  scanQr,
  updateGuestQr,
  deleteGuestQr,
  getGuestQrHistory,
};