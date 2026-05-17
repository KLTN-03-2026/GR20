

export interface XemDanhSachYeuCauAdmin {
  id: string;
    apartment_id: string;
    user_id: string;
    title: string;
    description: string;
    priority: string;
    status: string;
    created_at: string;
    reported_at: string;
    reported_by: string;
    apartment_code: string;
    building_name: string;
     resident_name: string;
    resident_phone: string;
}

export interface XemChiTietYeuCauAdmin {
  id: string;
    title: string;
    description: string;
    priority: string;
    status: string;
    createdAt: string;
    reportedAt: string;
    apartment: {
        id: string;
        code: string;
        area: string;
    };
    building: {
        name: string;
        address: string;
    };
    resident: {
        id: string;
        name: string;
        phone: string;
        email: string;
    };
    technician: null;
    comments: never[];
}

export interface CapNhatTrangThaiAdmin {
  id: string;
    apartment_id: string;
    user_id: string;
    title: string;
    description: string;
    priority: string;
    status: string;
    created_at: string;
    reported_at: string;
    reported_by: string;
}