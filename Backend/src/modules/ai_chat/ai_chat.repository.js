const { db } = require("../../configs/database.config");
const schema = require("../../db/schema");
const { eq, and } = require("drizzle-orm");

const getUserContextData = async (userId) => {
  // 1. Lấy thông tin căn hộ user đang ở
  const residentInfo = await db
    .select({
      apartmentCode: schema.apartments.apartmentCode,
      apartmentId: schema.apartments.id,
    })
    .from(schema.residentProfiles)
    .innerJoin(
      schema.apartments,
      eq(schema.residentProfiles.apartmentId, schema.apartments.id),
    )
    .where(
      and(
        eq(schema.residentProfiles.userId, BigInt(userId)),
        eq(schema.residentProfiles.status, "ACTIVE"),
      ),
    );

  if (!residentInfo.length) return null;
  const currentApartment = residentInfo[0];

  // 2. Lấy danh sách hóa đơn chưa thanh toán của căn hộ
  const pendingInvoices = await db
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
    );

  return {
    apartmentCode: currentApartment.apartmentCode,
    pendingInvoices: pendingInvoices,
  };
};

module.exports = {
  getUserContextData,
};
