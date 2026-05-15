const buildingIdsFromUser = require("./buildingIdsFromUser");

const checkBuildingAccess = (currentUser, options = {}) => {
  const scope = buildingIdsFromUser(currentUser);

  const qBuildingId =
    options.buildingId != null && options.buildingId !== ""
      ? Number(options.buildingId)
      : null;

  // ADMIN
  if (scope === null) {
    return {
      ok: true,
      type: "ADMIN",
      buildingFilter: qBuildingId || null,
    };
  }

  // USER / MANAGER
  if (!scope || scope.length === 0) {
    return {
      ok: false,
      error: "NO_BUILDING_ACCESS",
      data: [],
    };
  }

  // nếu có query buildingId
  if (qBuildingId != null && !Number.isNaN(qBuildingId)) {
    if (!scope.includes(qBuildingId)) {
      return {
        ok: false,
        error: "FORBIDDEN_BUILDING",
        data: [],
      };
    }

    return {
      ok: true,
      buildingFilter: qBuildingId,
    };
  }

  // không truyền buildingId → lấy all scope
  return {
    ok: true,
    buildingFilter: scope,
  };
};

module.exports = { checkBuildingAccess };
