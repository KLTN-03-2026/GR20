// src/types/notification.type.ts

export interface INotification {
  // Vì backend dùng BigInt cho ID, nhưng Drizzle có thể trả về string khi query.
  // Để an toàn, mình định nghĩa là string | number.
  // Tuy nhiên, dựa vào log Controller trước đó, ID là string '28'.
  id: string | number
  title: string
  content: string

  // senderId có thể là number (như 28 trong log) hoặc string tuỳ DB driver.
  // Mình để là string | number cho chắc ăn, sau này ép kiểu sau.
  senderId: string | number

  buildingId: string | number | null // Có thể null

  // Đây là union type, chỉ cho phép các giá trị này, gõ sai là TS báo lỗi ngay.
  type: 'NORMAL' | 'EMERGENCY' | 'MAINTENANCE' | 'PAYMENT'

  createdAt: string // ISO datetime string
  isBanner: boolean
}
