/**
 * Quyền theo tòa từ JWT (đồng bộ với login).
 * @param {object|undefined} user — req.user sau authenticate / optionalVerifyToken
 * @returns {null | number[]}
 *   - null: không lọc theo tòa (chưa đăng nhập, hoặc ADMIN)
 *   - []: đã đăng nhập nhưng không có tòa được gán
 *   - [id,...]: chỉ các tòa này (Quản lý, cư dân, …)
 */
function buildingIdsFromUser(user) {
  if (!user) return null;
  if (user.role === "ADMIN") return null;
  const raw = user.building_ids;
  if (Array.isArray(raw) && raw.length > 0) {
    return raw.map((x) => Number(x));
  }
  if (user.building_id != null) {
    return [Number(user.building_id)];
  }
  return [];
}

/** Khách không token: cho phép (giữ API cũ). Có token + không phải admin: chỉ đúng tòa được gán. */
function userMayAccessBuilding(user, buildingId) {
  if (!user) return true;
  if (user.role === "ADMIN") return true;
  const ids = buildingIdsFromUser(user);
  const bid = Number(buildingId);
  if (ids === null) return true;
  if (ids.length === 0) return false;
  return ids.includes(bid);
}

module.exports = { buildingIdsFromUser, userMayAccessBuilding };
