const { z } = require("zod");

const validateNotificationId = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID thông báo phải là một số hợp lệ"),
  }),
});

const createNotificationSchema = z.object({
  body: z
    .object({
      title: z.string().min(5, "Tiêu đề phải có ít nhất 5 ký tự"),
      content: z.string().min(10, "Nội dung phải có ít nhất 10 ký tự"),
      targetType: z.enum(["ALL", "BUILDING", "INDIVIDUAL"]).default("ALL"),
      // Dùng khi targetType = BUILDING
      buildingId: z.coerce.number().optional(),
      targetUserId: z.coerce.number().optional(),
      isBanner: z.boolean().optional().default(false),
    })
    .superRefine((val, ctx) => {
      if (val.targetType === "BUILDING" && !val.buildingId) {
        ctx.addIssue({
          path: ["buildingId"],
          code: z.ZodIssueCode.custom,
          message: "Phải chọn tòa nhà khi gửi theo tòa nhà",
        });
      }
      if (val.targetType === "INDIVIDUAL" && !val.targetUserId) {
        ctx.addIssue({
          path: ["targetUserId"],
          code: z.ZodIssueCode.custom,
          message: "Phải chọn cư dân khi gửi cá nhân",
        });
      }
    }),
});

module.exports = { validateNotificationId, createNotificationSchema };
