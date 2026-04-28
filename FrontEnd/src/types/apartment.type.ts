export type ApartmentData = {
  id: string;
  buildingId: string;
  ownerUserId: string;
  floorId: string;
  apartmentCode: string;
  area: string;
  bedrooms: number;
  bathrooms: number;
  balconyDirection: string;
  status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";
  buildingName?: string;
  floorNumber?: number;
  ownerName?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type ApartmentDetailData = ApartmentData & {
  owner?: {
    id: number;
    fullName: string;
    phone: string;
    email: string;
    avatarUrl: string;
  } | null;
  residents?: Array<{
    id: number;
    fullName: string;
    phone: string;
  }>;
  currentContract?: {
    id: number;
    contractType: string;
    status: string;
    startDate: string;
    endDate: string;
    monthlyRent: number;
  } | null;
};
