const service = require("./resident.service");
const { AppError } = require("../../common/app-error");

const sendError = (res, err) => {
  if (err instanceof AppError) {
    const body = { message: err.message };
    if (err.details !== undefined) body.details = err.details;
    return res.status(err.statusCode).json(body);
  }
  const status = err.message && err.message.includes("already") ? 409 : 500;
  return res.status(status).json({ message: err.message });
};

const createResident = async (req, res) => {
  try {
    const data = await service.createResident(req.body);

    res.status(201).json({
      operationType: "Success",
      message: "Create resident successfully",
      code: "CREATED",
      data,
      size: 1,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

const createResidentAccount = async (req, res) => {
  try {
    const data = await service.createResidentAccount(req.body);

    res.status(201).json({
      operationType: "Success",
      message: "Tạo tài khoản cư dân thành công",
      code: "CREATED",
      data,
      size: 1,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

const getAllResidents = async (req, res) => {
  try {
    const currentUser = req.user;
    const result = await service.getAllResidents(req.query, currentUser);

    res.json({
      operationType: "Success",
      message: "Get residents successfully",
      code: "OK",
      ...result,
      timestamp: new Date(),
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const getResidentById = async (req, res) => {
  try {
    console.log('CONTROLLER - Request params:', req.params);
    console.log('CONTROLLER - Resident ID:', req.params.id);
    
    // Gọi service với id từ params
    const data = await service.getResidentById(req.params.id);
    
    console.log('CONTROLLER - Data returned:', data);
    
    res.json({
      operationType: "Success",
      message: "Get resident successfully",
      code: "OK",
      data,
      size: 1,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error('CONTROLLER - Error:', err.message);
    res.status(404).json({
      message: err.message,
    });
  }
};

module.exports = {
  getResidentById  // QUAN TRỌNG: Phải export
};

const getResidentsByApartmentId = async (req, res) => {
  try {
    const data = await service.getResidentsByApartmentId(req.params.apartmentId);

    res.json({
      operationType: "Success",
      message: "Get residents successfully",
      code: "OK",
      data,
      size: data.length,
      timestamp: new Date(),
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const getUserApartments = async (req, res) => {
  try {
    const data = await service.getUserApartments(req.params.userId);

    res.json({
      operationType: "Success",
      message: "Get user apartments successfully",
      code: "OK",
      data,
      size: data.length,
      timestamp: new Date(),
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const getMyApartments = async (req, res) => {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
    const data = await service.getUserApartments(String(userId));

    res.json({
      operationType: "Success",
      message: "Get user apartments successfully",
      code: "OK",
      data,
      size: data.length,
      timestamp: new Date(),
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const updateResident = async (req, res) => {
  try {
    const data = await service.updateResident(req.params.id, req.body);

    res.json({
      operationType: "Success",
      message: "Update resident successfully",
      code: "OK",
      data,
      size: 0,
      timestamp: new Date(),
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const deleteResident = async (req, res) => {
  try {
    const data = await service.deleteResident(req.params.id);

    res.json({
      operationType: "Success",
      message: "Delete resident successfully",
      code: "OK",
      data,
      size: 0,
      timestamp: new Date(),
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  createResident,
  createResidentAccount,
  getAllResidents,
  getResidentById,
  getResidentsByApartmentId,
  getUserApartments,
  getMyApartments,
  updateResident,
  deleteResident,
};