// src/types/resident.type.ts

export interface Resident {
  id: string
  fullName: string
  email: string
  phone: string
  avatarUrl: string | null
  apartmentCode: string
  buildingName: string
  floorNumber: number
  status: 'ACTIVE' | 'MOVED_OUT'
  isActive: boolean
  createdAt: string
}

// Response cho danh sách cư dân (SuccessResponseApi đã bọc ngoài)
export interface ResidentListData {
  data: Resident[]
  pagination: {
    page: number
    pageSize: number
    totalElements: number
    totalPages: number
  }
}

// Response cho chi tiết cư dân
export interface PersonalInfo {
  id: string
  fullName: string
  avatarUrl: string | null
  phone: string
  email: string
  dateOfBirth: string | null
  gender: 'MALE' | 'FEMALE' | 'OTHER' | null
  idCard: string | null
  isActive: boolean
  joinedAt: string
}

export interface ResidenceInfo {
  apartmentCode: string
  buildingName: string
  floorNumber: number
  relationship: string
  moveInDate: string
  status: string
}

export interface Contract {
  contractType: string
  startDate: string
  endDate: string
  status: string
  isValid: boolean
}

export interface FamilyMember {
  id: string
  fullName: string
  phone: string
  avatarUrl: string | null
  gender: string | null
  relationship: string
  moveInDate: string
}

export interface AccessHistory {
  lastAccessTime: string | null
  lastAccessGate: string | null
  todayAccessCount: number
  recentLogs: Array<{
    scanTime: string
    result: string
    gateName: string
  }>
}

export interface ResidentDetailData {
  personalInfo: PersonalInfo
  residenceInfo: ResidenceInfo | null
  contracts: Contract[]
  familyMembers: FamilyMember[]
  accessHistory: AccessHistory
}

export interface VerifyResponse {
  isValid: boolean
  fullName: string
  apartmentCode: string
  message: string
}
