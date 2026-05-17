const { ZodError } = require("zod");
const { AppError } = require("../../common/app-error");
const service = require("./amenity.service");

const sendError = (res, err) => {
  if (err instanceof ZodError) return res.status(400).json({ message: "Validation failed", errors: err.flatten().fieldErrors });
  if (err instanceof AppError) return res.status(err.statusCode).json({ message: err.message });
  return res.status(500).json({ message: err.message });
};

const createAmenity = async (req, res) => {
  try {
    const data = await service.createAmenity(Number(req.params.buildingId), req.body);
    res.status(201).json({ operationType: "Success", message: "Create amenity successfully", code: "CREATED", data });
  } catch (err) { sendError(res, err); }
};

const getAmenitiesByBuilding = async (req, res) => {
  try {
    const result = await service.getAmenitiesByBuilding(Number(req.params.buildingId), req.query);
    res.json({ operationType: "Success", message: "Get amenities successfully", code: "OK", ...result });
  } catch (err) { sendError(res, err); }
};

const getAmenityById = async (req, res) => {
  try {
    const data = await service.getAmenityById(req.params.id);
    res.json({ operationType: "Success", message: "Get amenity detail successfully", code: "OK", data });
  } catch (err) { sendError(res, err); }
};

const updateAmenity = async (req, res) => {
  try {
    const data = await service.updateAmenity(req.params.id, req.body);
    res.json({ operationType: "Success", message: "Update amenity successfully", code: "OK", data });
  } catch (err) { sendError(res, err); }
};

const deleteAmenity = async (req, res) => {
  try {
    await service.deleteAmenity(req.params.id);
    res.json({ operationType: "Success", message: "Delete amenity successfully", code: "OK" });
  } catch (err) { sendError(res, err); }
};

module.exports = { createAmenity, getAmenitiesByBuilding, getAmenityById, updateAmenity, deleteAmenity };