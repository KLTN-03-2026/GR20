const {
  ResidentPersonalModel,
  ResidenceInfoModel,
  ContractModel,
  FamilyMemberModel,
  AccessHistoryModel,
  ResidentDetailModel
} = require("./security.resident.model");

// Map từ database row sang PersonalInfo
const toPersonalInfo = (row) => {
  return ResidentPersonalModel({
    id: row.id,
    full_name: row.full_name,
    avatar_url: row.avatar_url,
    phone: row.phone,
    email: row.email,
    date_of_birth: row.date_of_birth,
    gender: row.gender,
    id_card: row.id_card,
    is_active: row.is_active,
    created_at: row.created_at
  });
};

// Map từ database row sang ResidenceInfo
const toResidenceInfo = (row) => {
  if (!row) return null;
  
  return ResidenceInfoModel({
    apartment_code: row.apartment_code,
    building_name: row.building_name,
    floor_number: row.floor_number,
    relationship: row.relationship,
    move_in_date: row.move_in_date,
    status: row.status
  });
};

// Map từ database row sang Contract
const toContract = (row) => {
  if (!row) return null;
  
  const endDate = new Date(row.end_date);
  const now = new Date();
  
  return ContractModel({
    contract_type: row.contract_type,
    start_date: row.start_date,
    end_date: row.end_date,
    status: row.status,
    is_valid: row.status === 'ACTIVE' && endDate > now
  });
};

// Map danh sách contracts
const toContractList = (rows) => {
  if (!rows || rows.length === 0) return [];
  return rows.map(toContract);
};

// Map từ database row sang FamilyMember
const toFamilyMember = (row) => {
  return FamilyMemberModel({
    id: row.id,
    full_name: row.full_name,
    phone: row.phone,
    avatar_url: row.avatar_url,
    gender: row.gender,
    relationship: row.relationship,
    move_in_date: row.move_in_date
  });
};

// Map danh sách family members
const toFamilyMemberList = (rows) => {
  if (!rows || rows.length === 0) return [];
  return rows.map(toFamilyMember);
};

// Map từ database row sang AccessHistory
const toAccessHistory = (row, todayCount, recentLogs) => {
  return AccessHistoryModel({
    last_access_time: row?.scan_time || null,
    last_access_gate: row?.gate || null,
    today_access_count: todayCount || 0,
    recent_logs: recentLogs || []
  });
};

// Map danh sách recent logs
const toRecentLogs = (rows) => {
  if (!rows || rows.length === 0) return [];
  return rows.map(log => ({
    scanTime: log.scan_time,
    result: log.result,
    gateName: log.gate
  }));
};

// Hàm chuyển đổi relationship sang tiếng Việt
const getRelationshipLabel = (relationship) => {
  const map = {
    'OWNER': 'Chủ hộ',
    'TENANT': 'Người thuê',
    'FAMILY': 'Thành viên gia đình'
  };
  return map[relationship] || relationship;
};

// Map danh sách cư dân (cho bảng)
const toListResponse = (row) => {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    avatarUrl: row.avatar_url,
    apartmentCode: row.apartment_code,
    buildingName: row.building_name,
    floorNumber: row.floor_number,
    status: row.resident_status || "ACTIVE",
    isActive: row.is_active,
    createdAt: row.created_at,
  };
};

// Map chi tiết đầy đủ
const toDetailResponse = (
  personalInfo,
  residenceInfo,
  contracts,
  familyMembers,
  lastAccessLog,
  todayAccessCount,
  recentAccessLogs
) => {
  return {
    personalInfo: {
      id: personalInfo?.id,
      fullName: personalInfo?.full_name,
      avatarUrl: personalInfo?.avatar_url,
      phone: personalInfo?.phone,
      email: personalInfo?.email,
      dateOfBirth: personalInfo?.date_of_birth,
      gender: personalInfo?.gender,
      idCard: personalInfo?.id_card,
      isActive: personalInfo?.is_active,
      joinedAt: personalInfo?.created_at,
    },
    residenceInfo: residenceInfo
      ? {
          apartmentCode: residenceInfo.apartment_code,
          buildingName: residenceInfo.building_name,
          floorNumber: residenceInfo.floor_number,
          relationship: getRelationshipLabel(residenceInfo.relationship),
          moveInDate: residenceInfo.move_in_date,
          status: residenceInfo.status,
        }
      : null,
    contracts: (contracts || []).map((c) => {
      const endDate = new Date(c.end_date);
      const now = new Date();
      return {
        contractType: c.contract_type,
        startDate: c.start_date,
        endDate: c.end_date,
        status: c.status,
        isValid: c.status === "ACTIVE" && endDate > now,
      };
    }),
    familyMembers: (familyMembers || []).map((m) => ({
      id: m.id,
      fullName: m.full_name,
      phone: m.phone,
      avatarUrl: m.avatar_url,
      gender: m.gender,
      relationship: getRelationshipLabel(m.relationship),
      moveInDate: m.move_in_date,
    })),
    accessHistory: {
      lastAccessTime: lastAccessLog?.scan_time || null,
      lastAccessGate: lastAccessLog?.gate || null,
      todayAccessCount: todayAccessCount || 0,
      recentLogs: (recentAccessLogs || []).map((log) => ({
        scanTime: log.scan_time,
        result: log.result,
        gateName: log.gate,
      })),
    },
  };
};

// Map cho response danh sách đơn giản
const toResidentResponse = (row) => {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    avatarUrl: row.avatar_url,
    isActive: row.is_active,
    createdAt: row.created_at,
    status: row.resident_status,
    apartment: {
      code: row.apartment_code,
      floor: row.floor_number,
      building: row.building_name
    }
  };
};

// ✅ Chỉ export một lần duy nhất ở cuối file
module.exports = {
  toPersonalInfo,
  toResidenceInfo,
  toContract,
  toContractList,
  toFamilyMember,
  toFamilyMemberList,
  toAccessHistory,
  toRecentLogs,
  toListResponse,
  toDetailResponse,
  getRelationshipLabel,
  toResidentResponse
};