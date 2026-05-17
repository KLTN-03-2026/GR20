const { z } = require("zod");

const genderSchema = z.enum(["MALE", "FEMALE", "OTHER"]);

const createUserSchema = z.object({
  username: z
    .string({ error: "Username is required" })
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username is too long"),
  password: z
    .string({ error: "Password is required" })
    .min(6, "Password must be at least 6 characters")
    .max(255, "Password is too long"),
  email: z
    .string({ error: "Email is required" })
    .trim()
    .email("Email is invalid")
    .max(100, "Email is too long"),
  phone: z.string().trim().max(20, "Phone is too long").optional(),
  fullName: z.string().trim().max(100, "Full name is too long").optional(),
  dateOfBirth: z.string().date().optional(),
  gender: genderSchema.optional(),
  idCard: z.string().trim().max(20, "ID card is too long").optional(),
  avatarUrl: z.string().trim().max(255, "Avatar URL is too long").optional(),
  roleName: z.string().trim().max(100, "Role name is too long").optional(),
});

const updateUserSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(50)
      .optional(),
    password: z.string().min(6, "Password must be at least 6 characters").max(255).optional(),
    email: z.string().trim().email("Email is invalid").max(100).optional(),
    phone: z.string().trim().max(20).optional(),
    fullName: z.string().trim().max(100).optional(),
    dateOfBirth: z.string().date().optional(),
    gender: genderSchema.optional(),
    idCard: z.string().trim().max(20).optional(),
    avatarUrl: z.string().trim().max(255).optional(),
    roleName: z.string().trim().max(100).optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field is required for update"
  );

/** @param {unknown} body */
function parseCreateUser(body) {
  return createUserSchema.parse(body);
}

/** @param {unknown} body */
function parseUpdateUser(body) {
  return updateUserSchema.parse(body);
}

module.exports = {
  createUserSchema,
  updateUserSchema,
  parseCreateUser,
  parseUpdateUser,
};
