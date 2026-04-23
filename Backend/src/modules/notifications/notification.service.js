const notificationRepository = require("./notification.repository");
const AppError = require("../../common/app-error"); // Dùng AppError của bạn

class NotificationService {
  async getMyNotifications(userId) {
    const data = await notificationRepository.getResidentNotifications(userId);
    return data;
  }

  async readNotification(receiverId, userId) {
    const result = await notificationRepository.markAsRead(receiverId, userId);
    if (!result || result.length === 0) {
      throw new AppError(
        404,
        "Thông báo không tồn tại hoặc không thuộc về bạn",
      );
    }
    return { message: "Đã chuyển trạng thái Đã đọc" };
  }

  async removeNotification(receiverId, userId) {
    const result = await notificationRepository.deleteNotification(
      receiverId,
      userId,
    );
    if (!result || result.length === 0) {
      throw new AppError(404, "Không thể xóa thông báo này");
    }
    return { message: "Thông báo đã được xóa thành công" };
  }
}

module.exports = new NotificationService();
