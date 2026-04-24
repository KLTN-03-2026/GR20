const notificationAdminRepository = require("./notificationADMIN.repository");
const AppError = require("../../common/app-error");
const {
  users,
  residentProfiles,
  apartments,
  notificationReceivers,
} = require("../../db/schema");
const { db } = require("../../configs/database.config");
const { eq, inArray } = require("drizzle-orm");
class NotificationAdminService {
  async sendNotification(senderId, data) {
    // 1. Lưu thông báo gốc vào bảng notifications
    const newNotification =
      await notificationAdminRepository.createNotification({
        title: data.title,
        content: data.content,
        type: data.type,
        targetType: data.targetType,
        targetId: data.targetId,
        senderId: senderId,
      });

    let targetUserIds = [];

    // 2. Logic lọc ID người nhận dựa trên targetType
    switch (data.targetType) {
      case "ALL":
        // Lấy tất cả user (hoặc chỉ những user là Cư dân)
        const all = await db.select({ id: users.id }).from(users);
        targetUserIds = all.map((u) => Number(u.id));
        break;

      case "BUILDING":
        // Lọc cư dân thuộc tòa nhà targetId
        const buildingUsers = await db
          .selectDistinct({ id: residentProfiles.userId })
          .from(residentProfiles)
          .innerJoin(
            apartments,
            eq(residentProfiles.apartmentId, apartments.id),
          )
          .where(eq(apartments.buildingId, data.targetId));
        targetUserIds = buildingUsers.map((u) => Number(u.id));
        break;

      case "FLOOR":
        // Lọc cư dân thuộc tầng targetId
        const floorUsers = await db
          .selectDistinct({ id: residentProfiles.userId })
          .from(residentProfiles)
          .innerJoin(
            apartments,
            eq(residentProfiles.apartmentId, apartments.id),
          )
          .where(eq(apartments.floorId, data.targetId));
        targetUserIds = floorUsers.map((u) => Number(u.id));
        break;

      case "INDIVIDUAL":
        // Gửi đích danh cho 1 người (targetId chính là userId)
        targetUserIds = [Number(data.targetId)];
        break;

      default:
        throw new AppError(400, "Loại đối tượng nhận không hợp lệ");
    }

    // 3. Nếu không tìm thấy ai thỏa điều kiện thì báo lỗi hoặc dừng lại
    if (targetUserIds.length === 0) {
      throw new AppError(
        404,
        "Không tìm thấy cư dân nào thuộc đối tượng này để gửi",
      );
    }

    // 4. Chuẩn bị data và chèn hàng loạt vào notification_receivers
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
