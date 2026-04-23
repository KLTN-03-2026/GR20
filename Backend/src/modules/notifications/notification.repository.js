const { eq, and, desc } = require("drizzle-orm");
const { db } = require("../../configs/database.config");
const { notifications, notificationReceivers } = require("../../db/schema");

class NotificationRepository {
  // 1. Lấy danh sách thông báo của 1 cư dân
  async getResidentNotifications(userId) {
    return await db
      .select({
        receiverId: notificationReceivers.id,
        notificationId: notifications.id,
        title: notifications.title,
        content: notifications.content,
        type: notifications.type,
        isRead: notificationReceivers.isRead,
        readAt: notificationReceivers.readAt,
        createdAt: notifications.createdAt,
      })
      .from(notificationReceivers)
      .innerJoin(
        notifications,
        eq(notificationReceivers.notificationId, notifications.id),
      )
      .where(eq(notificationReceivers.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  // 2. Cập nhật trạng thái đã đọc
  async markAsRead(receiverId, userId) {
    return await db
      .update(notificationReceivers)
      .set({
        isRead: true,
        readAt: new Date().toISOString(),
      })
      .where(
        and(
          eq(notificationReceivers.id, receiverId),
          eq(notificationReceivers.userId, userId),
        ),
      )
      .returning(); // Trả về dòng vừa update để check
  }

  // 3. Xóa thông báo (Xóa hẳn bản ghi nhận của user này)
  async deleteNotification(receiverId, userId) {
    return await db
      .delete(notificationReceivers)
      .where(
        and(
          eq(notificationReceivers.id, receiverId),
          eq(notificationReceivers.userId, userId),
        ),
      )
      .returning();
  }
}

module.exports = new NotificationRepository();
