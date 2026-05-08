export type MaintenancePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
export type MaintenanceStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export interface MaintenanceRequest {
  id: number
  requestCode: string
  title: string
  description: string | null
  priority: MaintenancePriority
  status: MaintenanceStatus
  buildingId: number | null
  apartmentId: number | null
  unit: string | null
  reportedBy: number | null
  reporterName: string | null
  reporterPhone: string | null
  reportedAt: string | null
  scheduledDate: string | null
  completedAt: string | null
  technicianId: number | null
  technicianName: string | null
  estimatedCost: number | null
  actualCost: number | null
  notes: string | null
  createdAt: string
  updatedAt: string | null
}

export interface MaintenanceAssignment {
  id: number
  requestId: number
  technicalId: number
  assignedAt: string
}

