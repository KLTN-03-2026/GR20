const { ZodError } = require("zod");
const { AppError } = require("../../common/app-error");
const service = require("./apartment.service");
const { pool } = require("../../configs/database.config");

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
    if (err.details !== undefined) {
      body.details = err.details;
    }
    return res.status(err.statusCode).json(body);
  }
  return res.status(500).json({ message: err.message });
};

// CREATE
const createApartment = async (req, res) => {
  try {
    const data = await service.createApartment(req.body);

    res.status(201).json({
      operationType: "Success",
      message: "Create apartment successfully",
      code: "CREATED",
      data,
      size: 1,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

// GET ALL
const getAllApartments = async (req, res) => {
  try {
    const result = await service.getAllApartments(req.query);

    res.json({
      operationType: "Success",
      message: "Get apartments successfully",
      code: "OK",
      ...result,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

const getByBuilding = async (req, res) => {
  try {
    const result = await service.getApartmentsByBuilding(
      Number(req.params.buildingId),
      req.query
    );

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

const getByFloor = async (req, res) => {
  try {
    const result = await service.getApartmentsByFloor(
      Number(req.params.floorId),
      req.query
    );

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

// GET DETAIL
const getApartmentById = async (req, res) => {
  try {
    const data = await service.getApartmentById(req.params.id);

    res.json({
      operationType: "Success",
      message: "Get apartment detail successfully",
      code: "OK",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

// UPDATE
const updateApartment = async (req, res) => {
  try {
    const data = await service.updateApartment(req.params.id, req.body);

    res.json({
      operationType: "Success",
      message: "Update apartment successfully",
      code: "OK",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

// DELETE (soft)
const deleteApartment = async (req, res) => {
  try {
    const data = await service.deleteApartment(req.params.id);

    res.json({
      operationType: "Success",
      message: "Delete apartment successfully",
      code: "OK",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

// ADD Resident
const addResident = async (req, res) => {
  try {
    const data = await service.addResident(req.params.id, req.body);
    res.status(201).json({
      operationType: "Success",
      message: "Add resident successfully",
      code: "CREATED",
      data,
    });
  } catch (err) {
    sendError(res, err);
  }
};

// GET /api/apartments/stats
const getStats = async (req, res) => {
  try {
    const total = await pool.query(`SELECT COUNT(*) FROM apartments WHERE status != 'MAINTENANCE'`);
    const occupied = await pool.query(`SELECT COUNT(*) FROM apartments WHERE status = 'OCCUPIED'`);
    const expiring = await pool.query(
      `SELECT COUNT(*) FROM contracts WHERE status = 'ACTIVE' AND end_date <= NOW() + INTERVAL '30 days'`
    );
    
    res.json({
      operationType: "Success",
      data: {
        totalApartments: parseInt(total.rows[0].count),
        occupiedApartments: parseInt(occupied.rows[0].count),
        occupancyRate: Math.round((parseInt(occupied.rows[0].count) / parseInt(total.rows[0].count)) * 100),
        expiringContracts: parseInt(expiring.rows[0].count),
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createApartment,
  getAllApartments,
  getByBuilding,
  getByFloor,
  getApartmentById,
  updateApartment,
  deleteApartment,
  addResident,
  getStats,
};