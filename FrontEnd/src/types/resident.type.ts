export interface Resident {
  id: string
  fullName: string
  email: string
  phone: string
  avatarUrl?: string
  apartmentCode: string
  buildingName: string
  floorNumber: number
  status: 'ACTIVE' | 'MOVED_OUT'
  isActive: boolean
  createdAt: string
}

export interface Resident1 {
  apartmentNumber: string
  buildingName: string
  fullName: string
  id: string
  relationship: string
  status: string
  userId: string
}

export interface ResidentDetail {
  personalInfo: {
    id: string
    fullName: string
    avatarUrl: string
    phone: string
    email: string
    dateOfBirth: string
    gender: string
    idCard: string
    isActive: boolean
    joinedAt: string
  }
  residenceInfo: {
    apartmentCode: string
    buildingName: string
    floorNumber: number
    relationship: string
    moveInDate: string
    status: string
  }
  contracts: {
    contractType: string
    startDate: string
    endDate: string
    status: string
    isValid: boolean
  }[]
  familyMembers: {
    id: string
    fullName: string
    phone: string
    avatarUrl: string
    gender: string
    relationship: string
    moveInDate: string
  }[]
  accessHistory: {
    lastAccessTime: string
    lastAccessGate: string
    todayAccessCount: number
    recentLogs: {
      scanTime: string
      result: string
      gateName: string
    }[]
  }
}

//HIEU
export interface Resident12 {
  id: string
  userId: string
  fullName: string
  phone?: string
  email?: string
  apartmentNumber: string | null
  buildingName: string | null
  relationship: string | null
  status: string
  isUnassigned?: boolean
}

export interface ResidentDetail12 {
  id: string
  userId: string
  fullName: string
  email: string
  phone: string
  avatarUrl: string
  apartmentId: string
  apartmentNumber: string
  buildingName: string
  relationship: 'OWNER' | 'TENANT' | 'FAMILY'
  moveInDate: string
  status: 'ACTIVE' | 'INACTIVE' | 'MOVED_OUT'
  createdAt: string
}

export interface UserApartment {
  apartmentId: string
  apartmentNumber: string
  buildingName: string
  relationship: 'OWNER' | 'TENANT' | 'FAMILY'
  status: 'ACTIVE' | 'INACTIVE' | 'MOVED_OUT'
}