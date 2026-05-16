const notificationAdminService = require("./notificationADMIN.service");

class NotificationAdminController {
  // Lấy danh sách cư dân theo tòa nhà (dùng khi chọn cá nhân)
  async getResidentsByBuilding(req, res, next) {
    try {
      const buildingId = parseInt(req.params.buildingId, 10);
      const search = req.query.search || "";
      const residents = await notificationAdminService.getResidentsByBuilding(
        buildingId,
        search,
      );
      res.status(200).json({ success: true, data: residents });
    } catch (error) {
      next(error);
    }
  }

  async sendNotification(req, res, next) {
    try {
      const senderId = parseInt(req.user.sub, 10);
      const newNotification = await notificationAdminService.sendNotification(
        senderId,
        req.body,
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
      res.status(200).json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  }

  async recallNotification(req, res, next) {
    try {
      const senderId = parseInt(req.user.sub, 10);
      const notificationId = parseInt(req.params.id, 10);
      const result = await notificationAdminService.recall(
        notificationId,
        senderId,
      );
      res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationAdminController();
