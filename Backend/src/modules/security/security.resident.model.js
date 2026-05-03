// src/modules/security/security.resident.model.js

function ResidentPersonalModel(data) {
  return {
    id: data.id,
    fullName: data.full_name,
    avatarUrl: data.avatar_url,
    phone: data.phone,
    email: data.email,
    dateOfBirth: data.date_of_birth,
    gender: data.gender,
    idCard: data.id_card,
    isActive: data.is_active,
    joinedAt: data.created_at
  };
}

function ResidenceInfoModel(data) {
  return {
    apartmentCode: data.apartment_code,
    buildingName: data.building_name,
    floorNumber: data.floor_number,
    relationship: data.relationship,
    moveInDate: data.move_in_date,
    status: data.status
  };
}

function ContractModel(data) {
  return {
    contractType: data.contract_type,
    startDate: data.start_date,
    endDate: data.end_date,
    status: data.status,
    isValid: data.is_valid
  };
}

function FamilyMemberModel(data) {
  return {
    id: data.id,
    fullName: data.full_name,
    phone: data.phone,
    avatarUrl: data.avatar_url,
    gender: data.gender,
    relationship: data.relationship,
    moveInDate: data.move_in_date
  };
}

function AccessHistoryModel(data) {
  return {
    lastAccessTime: data.last_access_time,
    lastAccessGate: data.last_access_gate,
    todayAccessCount: data.today_access_count,
    recentLogs: data.recent_logs || []
  };
}

function ResidentDetailModel(data) {
  return {
    personalInfo: data.personalInfo,
    residenceInfo: data.residenceInfo,
    contracts: data.contracts || [],
    familyMembers: data.familyMembers || [],
    accessHistory: data.accessHistory
  };
}

module.exports = {
  ResidentPersonalModel,
  ResidenceInfoModel,
  ContractModel,
  FamilyMemberModel,
  AccessHistoryModel,
  ResidentDetailModel
};