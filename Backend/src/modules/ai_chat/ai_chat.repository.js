const { db } = require("../../configs/database.config");
const schema = require("../../db/schema");
const { eq, and, inArray, desc, or } = require("drizzle-orm");

const getUserContextData = async (userId) => {
  const numericUserId = Number(userId);

  // Bước 1: Bắt buộc lấy thông tin căn hộ trước vì các bước sau cần apartmentId / buildingId
  const residentInfo = await db
    .select({
      apartmentCode: schema.apartments.apartmentCode,
      apartmentId: schema.apartments.id,
      buildingId: schema.apartments.buildingId,
      relationship: schema.residentProfiles.relationship,
    })
    .from(schema.residentProfiles)
    .innerJoin(
      schema.apartments,
      eq(schema.residentProfiles.apartmentId, schema.apartments.id),
    )
    .where(
      and(
        eq(schema.residentProfiles.userId, numericUserId),
        eq(schema.residentProfiles.status, "ACTIVE"),
      ),
    );

  const currentApartment = residentInfo.length > 0 ? residentInfo[0] : null;

  // Bước 2: CHẠY SONG SONG TẤT CẢ CÁC TRUY VẤN CÒN LẠI
  // Khai báo sẵn các Promise thay vì await từng cái
  const pendingInvoicesPromise = currentApartment
    ? db
        .select({
          invoiceCode: schema.invoices.invoiceCode,
          totalAmount: schema.invoices.totalAmount,
          dueDate: schema.invoices.dueDate,
        })
        .from(schema.invoices)
        .where(
          and(
            eq(schema.invoices.apartmentId, currentApartment.apartmentId),
            eq(schema.invoices.status, "PENDING"),
          ),
        )
    : Promise.resolve([]);

  const vehiclesPromise = db
    .select({
      plateNumber: schema.vehicles.plateNumber,
      vehicleType: schema.vehicles.vehicleType,
      color: schema.vehicles.color,
    })
    .from(schema.vehicles)
    .where(
      and(
        eq(schema.vehicles.ownerId, numericUserId),
        eq(schema.vehicles.status, "ACTIVE"),
      ),
    );

  const maintenancePromise = db
    .select({
      title: schema.maintenanceRequests.title,
      status: schema.maintenanceRequests.status,
      priority: schema.maintenanceRequests.priority,
    })
    .from(schema.maintenanceRequests)
    .where(
      and(
        eq(schema.maintenanceRequests.userId, numericUserId),
        inArray(schema.maintenanceRequests.status, ["OPEN", "IN_PROGRESS"]),
      ),
    );

  const qrCodePromise = db
    .select({
      qrCode: schema.qrCodes.qrCode,
      expiresAt: schema.qrCodes.expiresAt,
      status: schema.qrCodes.status,
    })
    .from(schema.qrCodes)
    .where(
      and(
        eq(schema.qrCodes.userId, numericUserId),
        eq(schema.qrCodes.status, "ACTIVE"),
      ),
    )
    .limit(1);

  const notificationsPromise = currentApartment
    ? db
        .select({
          title: schema.notifications.title,
          createdAt: schema.notifications.createdAt,
        })
        .from(schema.notifications)
        .leftJoin(
          schema.notificationReceivers,
          eq(
            schema.notifications.id,
            schema.notificationReceivers.notificationId,
          ),
        )
        .where(
          or(
            eq(schema.notifications.buildingId, currentApartment.buildingId),
            eq(schema.notificationReceivers.userId, numericUserId),
          ),
        )
        .orderBy(desc(schema.notifications.createdAt))
        .limit(5)
    : db
        .select({
          title: schema.notifications.title,
          createdAt: schema.notifications.createdAt,
        })
        .from(schema.notifications)
        .innerJoin(
          schema.notificationReceivers,
          eq(
            schema.notifications.id,
            schema.notificationReceivers.notificationId,
          ),
        )
        .where(eq(schema.notificationReceivers.userId, numericUserId))
        .orderBy(desc(schema.notifications.createdAt))
        .limit(5);

  // Gom tất cả chạy cùng lúc
  const [
    pendingInvoices,
    vehicles,
    maintenanceRequests,
    myQrCode,
    notifications,
  ] = await Promise.all([
    pendingInvoicesPromise,
    vehiclesPromise,
    maintenancePromise,
    qrCodePromise,
    notificationsPromise,
  ]);

  return {
    apartmentCode: currentApartment?.apartmentCode || null,
    relationship: currentApartment?.relationship || null,
    pendingInvoices,
    vehicles,
    maintenanceRequests,
    qrCode: myQrCode.length > 0 ? myQrCode[0] : null,
    notifications,
  };
};

module.exports = { getUserContextData };
