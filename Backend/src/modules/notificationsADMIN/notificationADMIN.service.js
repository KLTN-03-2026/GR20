const notificationAdminRepository = require("./notificationADMIN.repository");
const AppError = require("../../common/app-error");
const { users, residentProfiles, apartments } = require("../../db/schema");
const { db } = require("../../configs/database.config");
const { eq, ilike } = require("drizzle-orm");

class NotificationAdminService {
  // Lấy danh sách cư dân theo tòa nhà (để admin chọn khi gửi cá nhân)
  async getResidentsByBuilding(buildingId, search = "") {
    const query = db
      .selectDistinct({
        userId: users.id,
        fullName: users.fullName,
        phone: users.phone,
        email: users.email,
      })
      .from(residentProfiles)
      .innerJoin(apartments, eq(residentProfiles.apartmentId, apartments.id))
      .innerJoin(users, eq(residentProfiles.userId, users.id))
      .where(eq(apartments.buildingId, buildingId));

    const rows = await query;

    // Lọc theo tên nếu có search
    if (search.trim()) {
      const keyword = search.trim().toLowerCase();
      return rows.filter((r) => r.fullName?.toLowerCase().includes(keyword));
    }

    return rows;
  }

  async sendNotification(senderId, data) {
    // Lưu thông báo gốc — không còn field type
    const newNotification =
      await notificationAdminRepository.createNotification({
        title: data.title,
        content: data.content,
        senderId: senderId,
        buildingId: data.buildingId ?? null,
        isBanner: data.isBanner ?? false,
      });

    let targetUserIds = [];

    switch (data.targetType) {
      case "ALL": {
        const all = await db.select({ id: users.id }).from(users);
        targetUserIds = all.map((u) => Number(u.id));
        break;
      }

      case "BUILDING": {
        const buildingUsers = await db
          .selectDistinct({ id: residentProfiles.userId })
          .from(residentProfiles)
          .innerJoin(
            apartments,
            eq(residentProfiles.apartmentId, apartments.id),
          )
          .where(eq(apartments.buildingId, data.buildingId));
        targetUserIds = buildingUsers.map((u) => Number(u.id));
        break;
      }

      case "INDIVIDUAL": {
        targetUserIds = [Number(data.targetUserId)];
        break;
      }

      default:
        throw new AppError(400, "Loại đối tượng nhận không hợp lệ");
    }

    if (targetUserIds.length === 0) {
      throw new AppError(404, "Không tìm thấy cư dân nào để gửi");
    }

    const receiversData = targetUserIds.map((uId) => ({
      notificationId: Number(newNotification.id),
      userId: uId,
      isRead: false,
    }));

    await notificationAdminRepository.insertReceivers(receiversData);
    return newNotification;
  }

  async getManagementHistory(senderId) {
    return await notificationAdminRepository.getManagementNotifications(
      senderId,
    );
  }

  async recall(notificationId, senderId) {
    const result = await notificationAdminRepository.recallNotification(
      notificationId,
      senderId,
    );
    if (!result || result.length === 0) {
      throw new AppError(
        404,
        "Không tìm thấy thông báo hoặc bạn không có quyền thu hồi",
      );
    }
    return { message: "Đã thu hồi thông báo và xóa khỏi thiết bị của cư dân" };
  }
}

module.exports = new NotificationAdminService();
