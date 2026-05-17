const notificationService = require("./notification.service");

class NotificationController {
  // Lấy danh sách
  async getMyNotifications(req, res, next) {
    try {
      const userId = parseInt(req.user.sub, 10);
      const notifications =
        await notificationService.getMyNotifications(userId);

      res.status(200).json({
        success: true,
        data: notifications,
      });
    } catch (error) {
      next(error);
    }
  }

  // Đánh dấu đã đọc
  async markAsRead(req, res, next) {
    try {
      const userId = parseInt(req.user.sub, 10);
      const receiverId = req.params.id; // ID của bảng notificationReceivers

      const result = await notificationService.readNotification(
        receiverId,
        userId,
      );

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  // Xóa thông báo
  async deleteNotification(req, res, next) {
    try {
      const userId = parseInt(req.user.sub, 10);
      const receiverId = req.params.id;

      const result = await notificationService.removeNotification(
        receiverId,
        userId,
      );

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();
