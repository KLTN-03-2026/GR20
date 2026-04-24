const { z } = require("zod");

const validateNotificationId = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID thông báo phải là một số hợp lệ"),
  }),
});

const createNotificationSchema = z.object({
  body: z.object({
    title: z.string().min(5, "Tiêu đề phải có ít nhất 5 ký tự"),
    content: z.string().min(10, "Nội dung phải có ít nhất 10 ký tự"),
    type: z
      .enum(["NORMAL", "EMERGENCY", "MAINTENANCE", "PAYMENT"])
      .default("NORMAL"),
    targetType: z
      .enum(["ALL", "BUILDING", "FLOOR", "INDIVIDUAL"])
      .default("ALL"),
    targetId: z.number().optional(), // ID của tòa nhà, tầng hoặc user (nếu có)
    isBanner: z.boolean().optional().default(false),
  }),
});

module.exports = {
  validateNotificationId,
  createNotificationSchema,
};
