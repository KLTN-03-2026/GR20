export interface Resident {
  id: string
  userId: string
  fullName: string
  apartmentNumber: string
  buildingName: string
  relationship: string
  status: string
}

// export interface ResidentDetail extends Resident {
//   email: string
//   phone: string
//   avatarUrl: string
//   apartmentId: string
//   moveInDate: string
//   createdAt: string
// }

export interface ResidentDetail {
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