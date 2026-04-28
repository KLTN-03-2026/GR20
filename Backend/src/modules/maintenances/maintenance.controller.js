const { ZodError } = require("zod");
const { AppError } = require("../../common/app-error");
const service = require("./maintenance.service");

const sendError = (res, err) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation failed",
      errors: err.flatten().fieldErrors,
      formErrors: err.flatten().formErrors,
    });
  }
  if (err instanceof AppError) {
    const body = { message: err.message };
    if (err.details !== undefined) body.details = err.details;
    return res.status(err.statusCode).json(body);
  }
  return res.status(500).json({ message: err.message });
};
const createMaintenanceRequest = async (req, res) => {
  try {
    const data = await service.createMaintenanceRequest(req.body);

    res.status(201).json({
      operationType: "Success",
      message: "Create maintenance request successfully",
      code: "CREATED",
      data,
      size: 1,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

const getAllMaintenanceRequests = async (req, res) => {
  try {
    const result = await service.getAllMaintenanceRequests(req.query);

    res.json({
      operationType: "Success",
      message: "success",
      code: "OK",
      ...result,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

const getMaintenanceRequestById = async (req, res) => {
  try {
    const data = await service.getMaintenanceRequestById(req.params.id);

    res.json({
      operationType: "Success",
      message: "Get maintenance request detail successfully",
      code: "OK",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

const updateMaintenanceRequest = async (req, res) => {
  try {
    const data = await service.updateMaintenanceRequest(req.params.id, req.body);

    res.json({
      operationType: "Success",
      message: "Update maintenance request successfully",
      code: "OK",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

const deleteMaintenanceRequest = async (req, res) => {
  try {
    const data = await service.deleteMaintenanceRequest(req.params.id);

    res.json({
      operationType: "Success",
      message: "Delete maintenance request successfully",
      code: "OK",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const data = await service.updateStatus(req.params.id, status);

    res.json({
      operationType: "Success",
      message: "Update status successfully",
      code: "OK",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

const assignTechnician = async (req, res) => {
  try {
    const { technicianId, technicianName } = req.body;
    const data = await service.assignTechnician(req.params.id, technicianId, technicianName);

    res.json({
      operationType: "Success",
      message: "Assign technician successfully",
      code: "OK",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

const getStatistics = async (req, res) => {
  try {
    const { buildingId } = req.query;
    const data = await service.getStatistics(buildingId);

    res.json({
      operationType: "Success",
      message: "Get statistics successfully",
      code: "OK",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

module.exports = {
  createMaintenanceRequest,
  getAllMaintenanceRequests,
  getMaintenanceRequestById,
  updateMaintenanceRequest,
  deleteMaintenanceRequest,
  updateStatus,
  assignTechnician,
  getStatistics,
};