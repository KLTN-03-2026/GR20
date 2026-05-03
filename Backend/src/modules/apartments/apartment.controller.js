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
    const floorId = req.params.floorId;
    const result = floorId
      ? await service.getApartmentsByFloor(Number(floorId), req.query)
      : await service.getAllApartments(req.query);

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

const getAvailableApartments = async (req, res) => {
  try {
    const data = await service.getAvailableApartments();
    res.json({
      operationType: "Success",
      message: "success",
      code: "OK",
      data,
      size: data.length,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const data = await service.getDashboardStats();
    res.json({
      operationType: "Success",
      message: "success",
      code: "OK",
      data,
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

const getMyApartment = async (req, res) => {
  try {
    const userIdRaw = req.user?.sub;
    if (userIdRaw === undefined || userIdRaw === null || userIdRaw === "") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = Number(userIdRaw);
    if (!Number.isFinite(userId)) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await pool.query(
      `
      SELECT 
        a.*,
        b.name AS building_name,
        f.floor_number,
        json_build_object(
          'id', owner.id,
          'fullName', owner.full_name,
          'phone', owner.phone,
          'email', owner.email,
          'avatarUrl', owner.avatar_url
        ) AS owner,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', rp.id,
                'fullName', u.full_name,
                'phone', u.phone,
                'relationship', rp.relationship,
                'moveInDate', rp.move_in_date
              )
            )
            FROM resident_profiles rp
            JOIN users u ON rp.user_id = u.id
            WHERE rp.apartment_id = a.id AND rp.status = 'ACTIVE'
          ),
          '[]'::json
        ) AS residents,
        (
          SELECT json_build_object(
            'id', c.id,
            'contractType', c.contract_type,
            'status', c.status,
            'startDate', c.start_date,
            'endDate', c.end_date,
            'monthlyRent', c.monthly_rent,
            'deposit', COALESCE(c.deposit, 0),
            'note', c.note,
            'signer', json_build_object(
              'fullName', signer.full_name,
              'phone', signer.phone,
              'email', signer.email
            )
          )
          FROM contracts c
          LEFT JOIN users signer ON c.resident_id = signer.id
          WHERE c.apartment_id = a.id
            AND c.resident_id = $1
          ORDER BY
            CASE c.status
              WHEN 'ACTIVE'::public.contract_status_enum THEN 0
              WHEN 'PENDING'::public.contract_status_enum THEN 1
              WHEN 'EXPIRED'::public.contract_status_enum THEN 2
              ELSE 3
            END,
            c.id DESC
          LIMIT 1
        ) AS "currentContract"
      FROM apartments a
      LEFT JOIN buildings b ON a.building_id = b.id
      LEFT JOIN floors f ON a.floor_id = f.id
      LEFT JOIN users owner ON a.owner_user_id = owner.id
      WHERE a.id = COALESCE(
        (
          SELECT c.apartment_id
          FROM contracts c
          WHERE c.resident_id = $1
          ORDER BY
            CASE c.status
              WHEN 'ACTIVE'::public.contract_status_enum THEN 0
              WHEN 'PENDING'::public.contract_status_enum THEN 1
              WHEN 'EXPIRED'::public.contract_status_enum THEN 2
              ELSE 3
            END,
            c.id DESC
          LIMIT 1
        ),
        (
          SELECT apartment_id
          FROM resident_profiles
          WHERE user_id = $1 AND status = 'ACTIVE'
          ORDER BY id ASC
          LIMIT 1
        )
      )
      `,
      [userId],
    );

    if (result.rows.length === 0) {
      return res.json({
        operationType: "Success",
        message: "success",
        code: "OK",
        data: null,
        timestamp: new Date(),
      });
    }

    res.json({
      operationType: "Success",
      message: "success",
      code: "OK",
      data: result.rows[0],
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

module.exports = {
  createApartment,
  getAllApartments,
  getAvailableApartments,
  getDashboardStats,
  getByBuilding,
  getByFloor,
  getApartmentById,
  updateApartment,
  deleteApartment,
  getMyApartment,
};