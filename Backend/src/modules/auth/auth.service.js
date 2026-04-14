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

const toFrontendUserShape = (row) => {
  return {
    _id: String(row.id),
    roles: row.role_name ? [row.role_name] : [],
    email: row.email,
    name: row.full_name ?? undefined,
    phone: row.phone ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
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

  const ok = await bcrypt.compare(password, userRow.password);
  if (!ok) {
    throw new AppError(401, "Invalid username or password");
  }

  const now = Math.floor(Date.now() / 1000);
  const accessExp = now + ACCESS_TOKEN_TTL_SECONDS;
  const refreshExp = now + REFRESH_TOKEN_TTL_SECONDS;

  const payload = {
    sub: String(userRow.id),
    username: userRow.username,
    role: userRow.role_name,
  };

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
    user: toFrontendUserShape(userRow),
  };
};

module.exports = { login };

