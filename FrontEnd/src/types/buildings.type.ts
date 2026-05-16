// export interface Buildings {
//   id: string
//   name: string
//   code: string
//   address: string
//   totalFloors: number
//   totalApartments: number
//   yearBuilt: number
//   status: string
//   createdAt: string
// }
export interface Buildings {
  id: string
  name: string
  code: string
  address: string
  totalFloors: number
  totalApartments: number
  yearBuilt: number
  status: string
  createdAt: string
  /** Số bản ghi tầng thực tế trong DB (dùng để chặn đóng tòa) */
  linkedFloorCount?: number
  /** Số căn không ở trạng thái bảo trì (dùng để chặn đóng tòa) */
  linkedApartmentCount?: number
}
