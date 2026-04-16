const { z } = require("zod");

const loginSchema = z.object({
  username: z
    .string({ error: "Username is required" })
    .trim()
    .min(1, "Username cannot be empty"),
  password: z
    .string({ error: "Password is required" })
    .min(1, "Password cannot be empty"),
});

/** @param {unknown} body */
function parseLogin(body) {
  return loginSchema.parse(body);
}

module.exports = { loginSchema, parseLogin };
