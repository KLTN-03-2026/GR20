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
    console.log('❌ ERROR:', err.message);
    console.log('❌ DETAILS:', err.details || err);
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
    const total = await pool.query(
      `SELECT COUNT(*) FROM apartments WHERE status != 'MAINTENANCE'`,
    );
    const occupied = await pool.query(
      `SELECT COUNT(*) FROM apartments WHERE status = 'OCCUPIED'`,
    );
    const expiring = await pool.query(
      `SELECT COUNT(*) FROM contracts WHERE status = 'ACTIVE' AND end_date <= NOW() + INTERVAL '30 days'`,
    );

    res.json({
      operationType: "Success",
      data: {
        totalApartments: parseInt(total.rows[0].count),
        occupiedApartments: parseInt(occupied.rows[0].count),
        occupancyRate: Math.round(
          (parseInt(occupied.rows[0].count) / parseInt(total.rows[0].count)) *
            100,
        ),
        expiringContracts: parseInt(expiring.rows[0].count),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//Available Apartment
const getAvailableApartments = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, b.name as building_name 
      FROM apartments a
      LEFT JOIN buildings b ON a.building_id = b.id
      WHERE a.status != 'AVAILABLE'
      AND a.id NOT IN (
        SELECT apartment_id FROM contracts WHERE status = 'ACTIVE'
        UNION
        SELECT apartment_id FROM contracts WHERE status = 'PENDING'
        UNION
        SELECT apartment_id FROM contracts WHERE status = 'EXPIRED'
      )
      ORDER BY a.id
    `);
    res.json({ operationType: "Success", data: result.rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const moveOutResident = async (req, res) => {
  try {
    // 1. Lấy thông tin resident
    const resident = await pool.query(
      `SELECT user_id, apartment_id, relationship FROM resident_profiles WHERE id = $1`,
      [req.params.id],
    );

    if (resident.rows.length === 0) {
      return res.status(404).json({ message: "Resident not found" });
    }

    const { user_id, apartment_id, relationship } = resident.rows[0];

    // 2. Update resident_profile
    await pool.query(
      `UPDATE resident_profiles SET status = 'MOVED_OUT', move_out_date = NOW() WHERE id = $1`,
      [req.params.id],
    );

    // 3. Nếu là OWNER → chuyển căn hộ về AVAILABLE
    if (relationship === "OWNER") {
      await pool.query(
        `UPDATE apartments SET owner_user_id = NULL, status = 'AVAILABLE', updated_at = NOW() WHERE id = $1`,
        [apartment_id],
      );
    }

    res.json({ operationType: "Success", message: "Resident moved out" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE Resident
const updateResident = async (req, res) => {
  try {
    const { relationship, moveInDate } = req.body;

    // 1. Update resident_profile
    const result = await pool.query(
      `UPDATE resident_profiles SET relationship = $1, move_in_date = $2 WHERE id = $3 RETURNING user_id, apartment_id`,
      [relationship, moveInDate, req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Resident not found" });
    }

    // 2. Nếu chuyển thành OWNER → update apartments
    if (relationship === "OWNER") {
      await pool.query(
        `UPDATE apartments SET owner_user_id = $1, status = 'OCCUPIED', updated_at = NOW() WHERE id = $2`,
        [result.rows[0].user_id, result.rows[0].apartment_id],
      );
    }

    res.json({ operationType: "Success", message: "Resident updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET MY APARTMENT - Cư dân xem căn hộ cá nhân
const getMyApartment = async (req, res) => {
  try {
    const userId = req.user?.id || 1; // Tạm dùng user 1, sau lấy từ JWT
    
    const result = await pool.query(`
      SELECT a.*, b.name as building_name, f.floor_number,
        json_build_object('id', owner.id, 'fullName', owner.full_name, 'phone', owner.phone, 'email', owner.email, 'avatarUrl', owner.avatar_url) as owner,
        COALESCE((SELECT json_agg(json_build_object('id', rp.id, 'fullName', u.full_name, 'phone', u.phone, 'relationship', rp.relationship, 'moveInDate', rp.move_in_date))
          FROM resident_profiles rp JOIN users u ON rp.user_id = u.id
          WHERE rp.apartment_id = a.id AND rp.status = 'ACTIVE'), '[]'::json) as residents,
        (SELECT json_build_object('id', c.id, 'contractType', c.contract_type, 'status', c.status, 'startDate', c.start_date, 'endDate', c.end_date, 'monthlyRent', c.monthly_rent)
          FROM contracts c WHERE c.apartment_id = a.id AND c.status = 'ACTIVE' LIMIT 1) as "currentContract"
      FROM apartments a
      LEFT JOIN buildings b ON a.building_id = b.id
      LEFT JOIN floors f ON a.floor_id = f.id
      LEFT JOIN users owner ON a.owner_user_id = owner.id
      WHERE a.id = (
        SELECT apartment_id FROM resident_profiles WHERE user_id = $1 AND status = 'ACTIVE' LIMIT 1
      )
    `, [userId]);

    if (result.rows.length === 0) {
      return res.json({ operationType: "Success", data: null });
    }

    res.json({ operationType: "Success", data: result.rows[0] });
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
  getAvailableApartments,
  moveOutResident,
  updateResident,
  getMyApartment,
};