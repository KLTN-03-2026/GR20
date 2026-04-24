const notificationAdminService = require("./notificationADMIN.service");

class NotificationAdminController {
  async sendNotification(req, res, next) {
    try {
      const senderId = parseInt(req.user.sub, 10); // Lấy ID chuẩn giống lúc nãy
      const data = req.body;

      const newNotification = await notificationAdminService.sendNotification(
        senderId,
        data,
      );

      res.status(201).json({
        success: true,
        message: "Đã gửi thông báo thành công",
        data: newNotification,
      });
    } catch (error) {
      next(error);
    }
  }

  async getManagementHistory(req, res, next) {
    try {
      const senderId = parseInt(req.user.sub, 10);
      const history =
        await notificationAdminService.getManagementHistory(senderId);

      res.status(200).json({
        success: true,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }

  async recallNotification(req, res, next) {
    try {
      const senderId = parseInt(req.user.sub, 10);
      const notificationId = parseInt(req.params.id, 10); // ID thông báo để thu hồi

      const result = await notificationAdminService.recall(
        notificationId,
        senderId,
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

module.exports = new NotificationAdminController();
