const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { AppError } = require("../../common/app-error");
const repo = require("./auth.repository");
const { parseLogin } = require("./auth.request");

const ACCESS_TOKEN_TTL_SECONDS = 60 * 60; // 1h
const REFRESH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7d

const getJwtSecret = () => process.env.JWT_SECRET || "dev_secret_change_me";
const getRefreshSecret = () =>
  process.env.JWT_REFRESH_SECRET || getJwtSecret() + "_refresh";

const toFrontendUserShape = (row, tokenScope) => {
  const base = {
    _id: String(row.id),
    roles: row.role_name ? [row.role_name] : [],
    email: row.email,
    name: row.full_name ?? undefined,
    phone: row.phone ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    avatarUrl: row.avatar_url || null,
    dateOfBirth: row.date_of_birth || null,
  };
  if (tokenScope) {
    if (tokenScope.building_ids?.length) {
      base.buildingIds = tokenScope.building_ids;
    }
    if (tokenScope.building_id != null) {
      base.buildingId = tokenScope.building_id;
    }
    if (tokenScope.apartment_id != null) {
      base.apartmentId = tokenScope.apartment_id;
    }
  }
  return base;
};

const buildAccessTokenPayload = (userRow, scope) => {
  const payload = {
    sub: String(userRow.id),
    id: String(userRow.id),
    username: userRow.username,
    role: userRow.role_name,
  };

  if (scope.kind === "all") {
    return payload;
  }

  if (scope.kind === "resident") {
    if (scope.apartmentId != null) {
      payload.apartment_id = scope.apartmentId;
    }
    if (scope.buildingId != null) {
      payload.building_id = scope.buildingId;
      payload.building_ids = [scope.buildingId];
    }
    return payload;
  }

  if (scope.kind === "buildings") {
    payload.building_ids = scope.buildingIds;
    if (scope.buildingIds.length === 1) {
      payload.building_id = scope.buildingIds[0];
    }
    return payload;
  }

  return payload;
};

const resolveLoginScope = async (userRow) => {
  const role = userRow.role_name;

  if (role === "ADMIN") {
    return { kind: "all" };
  }

  if (role === "Người Dùng") {
    const resident = await repo.loadResidentApartmentScope(userRow.id);
    return {
      kind: "resident",
      apartmentId: resident.apartmentId,
      buildingId: resident.buildingId,
    };
  }

  const buildingIds = await repo.loadActiveBuildingIdsForUser(userRow.id);
  return { kind: "buildings", buildingIds };
};

const login = async (reqBody) => {
  const { username, password } = parseLogin(reqBody);

  const userRow = await repo.loadByUserName(username);
  if (!userRow) {
    throw new AppError(401, "Invalid username or password");
  }
  if (userRow.is_active === false) {
    throw new AppError(403, "Account is inactive");
  }

  // const ok = await bcrypt.compare(password, userRow.password);
  // if (!ok) {
  //   throw new AppError(401, "Invalid username or password");
  // }

  // Kiểm tra password có được hash chưa
  const isHashed = userRow.password.startsWith("$2b$");

  if (isHashed) {
    // Tài khoản đã hash → dùng bcrypt
    const ok = await bcrypt.compare(password, userRow.password);
    if (!ok) {
      throw new AppError(401, "Invalid username or password");
    }
  } else {
    // Tài khoản chưa hash → so sánh plain text
    if (password !== userRow.password) {
      throw new AppError(401, "Invalid username or password");
    }
  }
  const now = Math.floor(Date.now() / 1000);
  const accessExp = now + ACCESS_TOKEN_TTL_SECONDS;
  const refreshExp = now + REFRESH_TOKEN_TTL_SECONDS;

  const scope = await resolveLoginScope(userRow);
  const payload = buildAccessTokenPayload(userRow, scope);

  const access_token = jwt.sign(payload, getJwtSecret(), {
    expiresIn: ACCESS_TOKEN_TTL_SECONDS,
  });
  const refresh_token = jwt.sign(payload, getRefreshSecret(), {
    expiresIn: REFRESH_TOKEN_TTL_SECONDS,
  });

  return {
    access_token,
    refresh_token,
    expires: new Date(accessExp * 1000).toISOString(),
    refresh_expires: new Date(refreshExp * 1000).toISOString(),
    user: toFrontendUserShape(userRow, payload),
  };
};

module.exports = { login };
