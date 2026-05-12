const { z } = require("zod");

const chatRequestSchema = z.object({
  message: z
    .string({ required_error: "Tin nhắn không được để trống" })
    .min(1, "Tin nhắn phải có ít nhất 1 ký tự"),
});

module.exports = {
  chatRequestSchema,
};
