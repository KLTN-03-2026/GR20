const { db } = require("../../configs/database.config");
const {
  maintenanceRequests,
  maintenanceAssignments,
  apartments,
} = require("../../db/schema");
const { eq, and, sql } = require("drizzle-orm");

// 1. Đếm yêu cầu chờ xử lý (OPEN)
const countPending = async () => {
  const result = await db
    .select({ count: sql`count(*)`.mapWith(Number) })
    .from(maintenanceRequests)
    .where(eq(maintenanceRequests.status, "OPEN"));
  return result[0].count;
};

// 2. Đếm yêu cầu đang xử lý (IN_PROGRESS)
const countInProgress = async () => {
  const result = await db
    .select({ count: sql`count(*)`.mapWith(Number) })
    .from(maintenanceRequests)
    .where(eq(maintenanceRequests.status, "IN_PROGRESS"));
  return result[0].count;
};

// 3. Đếm yêu cầu hoàn thành hôm nay
const countDoneToday = async () => {
  const result = await db
    .select({ count: sql`count(*)`.mapWith(Number) })
    .from(maintenanceRequests)
    .where(
      sql`${maintenanceRequests.status} = 'DONE' AND DATE(${maintenanceRequests.createdAt}) = CURRENT_DATE`,
    );
  return result[0].count;
};

// 4. Đếm yêu cầu quá hạn (> 48h mà vẫn OPEN hoặc IN_PROGRESS)
const countOverdue = async () => {
  const result = await db
    .select({ count: sql`count(*)`.mapWith(Number) })
    .from(maintenanceRequests)
    .where(
      sql`${maintenanceRequests.status} IN ('OPEN', 'IN_PROGRESS') AND ${maintenanceRequests.createdAt} < NOW() - INTERVAL '48 HOURS'`,
    );
  return result[0].count;
};

// 5. Đếm việc của tôi (Đã gán cho userId hiện tại và chưa DONE)
const countMyTasks = async (userId) => {
  if (!userId) return 0;

  const result = await db
    .select({ count: sql`count(*)`.mapWith(Number) })
    .from(maintenanceAssignments)
    .innerJoin(
      maintenanceRequests,
      eq(maintenanceAssignments.requestId, maintenanceRequests.id),
    )
    .where(
      and(
        eq(maintenanceAssignments.technicalId, BigInt(userId)),
        sql`${maintenanceRequests.status} != 'DONE'`,
      ),
    );
  return result[0].count;
};
// 1. Phân bố theo mức độ ưu tiên
const getRequestsByPriority = async () => {
  return await db
    .select({
      priority: maintenanceRequests.priority,
      count: sql`count(*)`.mapWith(Number),
    })
    .from(maintenanceRequests)
    .groupBy(maintenanceRequests.priority);
};

// 2. Phân bố theo căn hộ (Lấy Top 5 căn hộ báo lỗi nhiều nhất)
const getRequestsByApartment = async () => {
  return await db
    .select({
      apartmentCode: apartments.apartmentCode,
      count: sql`count(*)`.mapWith(Number),
    })
    .from(maintenanceRequests)
    .innerJoin(apartments, eq(maintenanceRequests.apartmentId, apartments.id))
    .groupBy(apartments.apartmentCode)
    .orderBy(sql`count(*) DESC`)
    .limit(5);
};

// ==========================================
// THÊM MỚI CHO PHẦN 3.3: CẢNH BÁO (ALERTS)
// ==========================================

// 1. Ưu tiên CAO chưa xử lý > 2h
const getHighPriorityOverdue = async () => {
  const result = await db
    .select({ count: sql`count(*)`.mapWith(Number) })
    .from(maintenanceRequests)
    .where(
      sql`${maintenanceRequests.priority} IN ('HIGH', 'URGENT')
      AND ${maintenanceRequests.status} = 'OPEN'
      AND ${maintenanceRequests.createdAt} < NOW() - INTERVAL '2 HOURS'`,
    );
  return result[0].count;
};

// 2. Kỹ thuật viên quá tải (> 3 việc đang làm)
const getOverloadedTechsCount = async () => {
  const result = await db
    .select({ count: sql`count(*)`.mapWith(Number) })
    .from(maintenanceAssignments)
    .innerJoin(
      maintenanceRequests,
      eq(maintenanceAssignments.requestId, maintenanceRequests.id),
    )
    .where(eq(maintenanceRequests.status, "IN_PROGRESS"))
    .groupBy(maintenanceAssignments.technicalId)
    .having(sql`count(*) > 3`);

  return result.length; // Trả về số lượng nhân viên đang bị quá tải
};
module.exports = {
  countPending,
  countInProgress,
  countDoneToday,
  countOverdue,
  countMyTasks,
  getRequestsByPriority,
  getRequestsByApartment,
  getHighPriorityOverdue,
  getOverloadedTechsCount,
};
