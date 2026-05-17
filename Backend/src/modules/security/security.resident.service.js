const repo = require("./security.resident.repository");
const mapper = require("./security.resident.mapper");

// Lấy danh sách cư dân (có phân trang + tìm kiếm)
const getResidentList = async (queryParams = {}) => {
  const {
    page = 1,
    size = 10,
    keyword = ''
  } = queryParams;

  let pageNum = parseInt(page);
  let pageSize = parseInt(size);
  
  // Chuyển page từ 1-based sang 0-based cho repository
  const result = await repo.getResidentList({
    page: pageNum - 1,
    size: pageSize,
    keyword: keyword || ''
  });

  // Map dữ liệu
  const mappedData = result.rows.map(mapper.toListResponse);

  return {
    data: mappedData,
    size: mappedData.length,
    totalElements: result.total,
    totalPages: Math.ceil(result.total / pageSize),
    page: pageNum,
    pageSize: pageSize
  };
};

// Lấy chi tiết cư dân
const getResidentDetail = async (residentId) => {
  // 1. Thông tin cá nhân
  const personalInfo = await repo.getPersonalInfo(residentId);
  if (!personalInfo) {
    throw new Error("Không tìm thấy cư dân");
  }
  
  // 2. Thông tin cư trú
  const residenceInfo = await repo.getResidenceInfo(residentId);
  
  // 3. Lấy apartmentId để truy vấn hợp đồng và người thân
  let apartmentId = null;
  if (residenceInfo) {
    apartmentId = await repo.getApartmentIdByResidentId(residentId);
  }
  
  // 4. Hợp đồng
  let contracts = [];
  if (apartmentId) {
    contracts = await repo.getContracts(residentId, apartmentId);
  }
  
  // 5. Người ở cùng căn hộ
  let familyMembers = [];
  if (apartmentId) {
    familyMembers = await repo.getFamilyMembers(apartmentId, residentId);
  }
  
  // 6. Lịch sử ra vào
  const lastAccessLog = await repo.getLastAccessLog(residentId);
  // const todayAccessCount = await repo.getTodayAccessCount(residentId);
  // const recentAccessLogs = await repo.getRecentAccessLogs(residentId);
  const recentAccessLogs = await repo.getRecentAccessLogs(residentId);
  // 7. Map sang response
  return mapper.toDetailResponse(
    personalInfo,
    residenceInfo,
    contracts,
    familyMembers,
    lastAccessLog,
    // todayAccessCount,
    recentAccessLogs
  );
};

module.exports = {
  getResidentList,
  getResidentDetail,
};