const service = require("./resident.service");

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
    const status = err.message.includes("already") ? 409 : 500;
    res.status(status).json({
      message: err.message,
    });
  }
};

const getAllResidents = async (req, res) => {
  try {
    const result = await service.getAllResidents(req.query);

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
    const data = await service.getResidentById(req.params.id);

    res.json({
      operationType: "Success",
      message: "Get resident successfully",
      code: "OK",
      data,
      size: 1,
      timestamp: new Date(),
    });
  } catch (err) {
    res.status(404).json({
      message: err.message,
    });
  }
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
  getAllResidents,
  getResidentById,
  getResidentsByApartmentId,
  getUserApartments,
  updateResident,
  deleteResident,
};