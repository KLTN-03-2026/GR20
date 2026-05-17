const { eq, and, desc } = require("drizzle-orm");
const { db } = require("../../configs/database.config");
const { notifications, notificationReceivers } = require("../../db/schema");

class NotificationAdminRepository {
  // 1. Tạo bản ghi thông báo gốc
  async createNotification(data) {
    const [newNotification] = await db
      .insert(notifications)
      .values(data)
      .returning();
    return newNotification;
  }

  // 2. Gửi cho cư dân (Chèn nhiều dòng vào notification_receivers)
  async insertReceivers(receiversData) {
    if (receiversData.length === 0) return [];
    return await db
      .insert(notificationReceivers)
      .values(receiversData)
      .returning();
  }

  // 3. BQL lấy danh sách lịch sử đã gửi
  async getManagementNotifications(senderId) {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.senderId, senderId))
      .orderBy(desc(notifications.createdAt));
  }

  // 4. Thu hồi thông báo
  async recallNotification(notificationId, senderId) {
    return await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.senderId, senderId),
        ),
      )
      .returning();
  }
}

module.exports = new NotificationAdminRepository();
