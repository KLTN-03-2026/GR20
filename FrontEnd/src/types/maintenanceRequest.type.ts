export interface maintenanceRequest {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  apartmentId: string;
  reported_at: string;
  createdAt: string;
}

export interface maintenanceRequestDetail{
   id: string;
    apartment_id: string;
    user_id: string;
    title: string;
    description: string;
    priority: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
    created_at: string;
    reported_at: string;
    reported_by: string;
}

export interface UpdateStatusRequest{
    title: string;
    description: string;
    priority: string;
}




export interface CreateMaintenanceRequest {
  title: string;
  description: string;
  priority?: string;
}

export interface updateMaintenanceRequest {
  title?: string;
  description?: string;
  priority?: string;
}

export interface updateStatusRequest {
  status: 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
  note?: string;
}

export interface assignTechnicianRequest {
  technicianId: number;
  technicianName: string;
}