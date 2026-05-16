const repo = require("./resident.repository");
const mapper = require("./resident.mapper");
const apartmentRepo = require("../apartments/apartment.repository");
const userService = require("../profile/user.service");
const userRepo = require("../profile/user.repository");
const { AppError } = require("../../common/app-error");

const normalizePhone = (raw) => {
  let p = String(raw).trim().replace(/\s+/g, "");
  if (p.startsWith("+84")) {
    p = `0${p.slice(3)}`;
  } else if (p.startsWith("84") && p.length === 11) {
    p = `0${p.slice(2)}`;
  }
  return p;
};

const buildResidentPlaceholderEmail = (phoneNorm) => {
  const digits = phoneNorm.replace(/\D/g, "") || "resident";
  return `${digits}@resident.local`;
};
const {
  getScopedBuildingIdsForList,
} = require("../../utils/access/scoped-building-access");

/**
 * Thêm cư dân:
 * - Có fullName + phone + apartmentId → cùng luồng với POST /api/apartments/:id/residents (tạo/khớp user, OWNER, cập nhật căn hộ).
 * - Chỉ có userId + apartmentId → gán user có sẵn vào căn, vẫn áp dụng quy tắc OWNER.
 */
const createResident = async (reqBody) => {
  const apartmentId = Number(reqBody.apartmentId);
  if (!Number.isFinite(apartmentId)) {
    throw new AppError(400, "apartmentId không hợp lệ");
  }

  const fullName =
    reqBody.fullName != null ? String(reqBody.fullName).trim() : "";
  const phone = reqBody.phone != null ? String(reqBody.phone).trim() : "";
  const useRichPayload = fullName.length > 0 && phone.length > 0;

  if (useRichPayload) {
    const created = await apartmentRepo.addResident(apartmentId, {
      fullName,
      phone,
      email:
        reqBody.email != null ? String(reqBody.email).trim() || null : null,
      relationship: reqBody.relationship || "FAMILY",
      moveInDate: reqBody.moveInDate,
    });
    const profile = await repo.getResidentByUserAndApartment(
      created.id,
      apartmentId,
    );
    if (!profile) {
      throw new AppError(500, "Không tìm thấy hồ sơ cư dân sau khi tạo");
    }
    return { id: profile.id };
  }

  const userId = Number(reqBody.userId);
  if (!Number.isFinite(userId)) {
    throw new AppError(
      400,
      "Cần userId (user đã tồn tại) hoặc fullName + phone để tạo cư dân mới",
    );
  }

  const existing = await repo.getResidentByUserAndApartment(
    userId,
    apartmentId,
  );
  if (existing) {
    throw new AppError(409, "Người dùng đã là cư dân của căn hộ này");
  }

  const relationship = reqBody.relationship || "FAMILY";

  if (relationship === "OWNER") {
    const currentOwner = await repo.getActiveOwnerForApartment(apartmentId);
    if (currentOwner) {
      throw new AppError(
        400,
        `Căn hộ này đã có chủ hộ là ${currentOwner.full_name}. Không thể thêm OWNER.`,
      );
    }
  } else {
    const currentOwner = await repo.getActiveOwnerForApartment(apartmentId);
    if (!currentOwner) {
      throw new AppError(
        400,
        "Căn hộ chưa có chủ hộ. Vui lòng thêm chủ hộ (OWNER) trước.",
      );
    }
  }

  const entity = mapper.toEntity({
    ...reqBody,
    userId,
    apartmentId,
    relationship,
  });

  const orphanProfile = await repo.getUnassignedProfileByUserId(userId);
  const result = orphanProfile
    ? await repo.assignUnassignedProfile(orphanProfile.id, entity)
    : await repo.createResident(entity);

  if (relationship === "OWNER") {
    await repo.setApartmentOwnerAndOccupied(apartmentId, userId);
  }

  return { id: result.id };
};

/**
 * Tạo user (tài khoản đăng nhập) cho cư dân, chưa gắn căn hộ.
 * Role luôn là người dùng mặc định (Người Dùng / user — theo resolveRoleId trong user.service).
 */
const createResidentAccount = async (reqBody) => {
  const fullName =
    reqBody.fullName != null ? String(reqBody.fullName).trim() : "";

  const phoneRaw = reqBody.phone != null ? String(reqBody.phone).trim() : "";

  const password = reqBody.password != null ? String(reqBody.password) : "";

  const email =
    reqBody.email != null ? String(reqBody.email).trim().toLowerCase() : "";

  // Full name
  if (!fullName) {
    throw new AppError(400, "Vui lòng nhập họ tên");
  }

  // Phone
  if (!phoneRaw) {
    throw new AppError(400, "Vui lòng nhập số điện thoại");
  }

  const phone = normalizePhone(phoneRaw);

  if (!/^0[1-9][0-9]{8}$/.test(phone)) {
    throw new AppError(400, "Số điện thoại không hợp lệ (VD: 0901234567)");
  }

  // Email required
  if (!email) {
    throw new AppError(400, "Vui lòng nhập email");
  }

  // Email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    throw new AppError(400, "Email không đúng định dạng");
  }

  // Password
  if (!password) {
    throw new AppError(400, "Vui lòng nhập mật khẩu");
  }

  if (password.length < 6) {
    throw new AppError(400, "Mật khẩu tối thiểu 6 ký tự");
  }

  // Check duplicate phone
  const existingPhone = await userRepo.getUserByUsername(phone);

  if (existingPhone) {
    throw new AppError(409, "Số điện thoại đã được đăng ký");
  }

  // Check duplicate email
  const existingEmail = await userRepo.getUserByEmail(email);

  if (existingEmail) {
    throw new AppError(409, "Email đã được đăng ký");
  }

  return userService.createUser({
    username: phone,
    fullName,
    phone,
    email,
    password,
    roleName: "Người Dùng",
  });
};

const getAllResidents = async (query, currentUser) => {
  const { page = 0, size = 10, status } = query;
  const sizeNum = Number(size);
  const pageNum = Number(page);

  const scope = getScopedBuildingIdsForList(currentUser, query);

  if (scope.deny) {
    return {
      data: [],
      size: 0,
      totalElements: 0,
      totalPages: 0,
      page: pageNum,
      pageSize: sizeNum,
    };
  }

  if (Array.isArray(scope.buildingIds) && scope.buildingIds.length === 0) {
    return {
      data: [],
      size: 0,
      totalElements: 0,
      totalPages: 0,
      page: pageNum,
      pageSize: sizeNum,
    };
  }

  const filterByBuilding =
    query.buildingId != null && String(query.buildingId).trim() !== "";

  const result = await repo.getAllResidents({
    page: pageNum,
    size: sizeNum,
    buildingIds: scope.buildingIds,
    status,
    filterByBuilding,
  });

  return {
    data: result.rows.map(mapper.toListResponse),
    size: result.rows.length,
    totalElements: result.total,
    totalPages: Math.ceil(result.total / sizeNum) || 0,
    page: pageNum,
    pageSize: sizeNum,
  };
};

const getResidentById = async (id) => {
  const raw = String(id).trim();

  if (raw.startsWith("u-")) {
    const userId = Number(raw.slice(2));
    if (!Number.isFinite(userId)) {
      throw new AppError(400, "Mã cư dân không hợp lệ");
    }
    const data = await repo.getResidentByUserId(userId);
    if (!data) {
      throw new AppError(404, "Không tìm thấy cư dân");
    }
    return mapper.toResponse(data);
  }

  const profileId = Number(raw);
  if (!Number.isFinite(profileId)) {
    throw new AppError(400, "Mã cư dân không hợp lệ");
  }

  let data = await repo.getResidentById(profileId);
  if (!data) {
    data = await repo.getResidentByUserId(profileId);
  }
  if (!data) {
    throw new AppError(404, "Không tìm thấy cư dân");
  }

  return mapper.toResponse(data);
};

const getResidentsByApartmentId = async (apartmentId) => {
  const data = await repo.getResidentsByApartmentId(apartmentId);
  return data.map(mapper.toListResponse);
};

const getUserApartments = async (userId) => {
  const data = await repo.getUserApartments(userId);
  return data.map((row) => ({
    apartmentId: row.apartment_id,
    apartmentNumber: row.apartment_number,
    buildingName: row.building_name,
    relationship: row.relationship,
    status: row.status,
  }));
};

const updateResident = async (id, reqBody) => {
  const entity = mapper.toEntity(reqBody);
  const updated = await repo.updateResident(id, entity);

  if (!updated) {
    throw new Error("Update failed - Resident not found");
  }

  return { id: updated.id };
};

const deleteResident = async (id) => {
  const deleted = await repo.deleteResident(id);

  if (!deleted) {
    throw new Error("Delete failed - Resident not found");
  }

  return { id: deleted.id };
};

module.exports = {
  createResident,
  createResidentAccount,
  getAllResidents,
  getResidentById,
  getResidentsByApartmentId,
  getUserApartments,
  updateResident,
  deleteResident,
};
