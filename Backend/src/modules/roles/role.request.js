const { z } = require("zod");

const createRoleSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .trim()
    .min(1, "Name cannot be empty")
    .max(100, "Name is too long"),
  description: z
    .string()
    .trim()
    .max(500, "Description is too long")
    .optional(),
});

const updateRoleSchema = z
  .object({
    name: z.string().trim().min(1, "Name cannot be empty").max(100).optional(),
    description: z.string().trim().max(500).optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field is required for update"
  );

/** @param {unknown} body */
function parseCreateRole(body) {
  return createRoleSchema.parse(body);
}

/** @param {unknown} body */
function parseUpdateRole(body) {
  return updateRoleSchema.parse(body);
}

module.exports = {
  createRoleSchema,
  updateRoleSchema,
  parseCreateRole,
  parseUpdateRole,
};
