export interface BuildingAssignment {
  id: string
  userId: string
  username: string | null
  fullName: string | null
  buildingId: string
  buildingName: string | null
  role: string
  isActive: boolean
  assignedAt: string
}
