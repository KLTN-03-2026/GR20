const { z } = require("zod");

const validateNotificationId = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID thông báo phải là một số hợp lệ"),
  }),
});

module.exports = {
  validateNotificationId,
};
