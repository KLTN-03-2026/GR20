const { buildingIdsFromUser } = require("../../common/building-scope");

/**
 * Hàm dùng chung khi API list căn hộ / cư dân / …: từ JWT + query (?buildingId) → phạm vi tòa được xem.
 * Quản lý chỉ các tòa trong token; ADMIN không giới hạn (hoặc lọc theo query).
 *
 * @param {object} currentUser req.user sau authenticate.
 * @param {object} [query] req.query (?buildingId, …).
 * @returns {{ deny: boolean, buildingIds: null | number[] }}
 * - deny=true: đăng nhập nhưng không có tòa được gán → danh sách rỗng.
 * - buildingIds=null: không thêm điều kiện tòa trong SQL (ADMIN, toàn bộ).
 * - buildingIds=[]: không được xem (?buildingId ngoài phạm vi) → rỗng.
 */
function getScopedBuildingIdsForList(currentUser, query = {}) {
  const qBuildingId =
    query.buildingId != null && query.buildingId !== ""
      ? Number(query.buildingId)
      : null;

  const scope = buildingIdsFromUser(currentUser);

  if (scope === null) {
    if (qBuildingId != null && !Number.isNaN(qBuildingId)) {
      return { deny: false, buildingIds: [qBuildingId] };
    }
    return { deny: false, buildingIds: null };
  }

  if (scope.length === 0) {
    return { deny: true, buildingIds: [] };
  }

  if (qBuildingId != null && !Number.isNaN(qBuildingId)) {
    return {
      deny: false,
      buildingIds: scope.includes(qBuildingId) ? [qBuildingId] : [],
    };
  }

  return { deny: false, buildingIds: scope };
}

module.exports = { getScopedBuildingIdsForList };
