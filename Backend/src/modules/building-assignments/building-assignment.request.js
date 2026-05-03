const { z } = require("zod");

const createBuildingAssignmentSchema = z.object({
  userId: z.coerce.number().int().positive("userId must be greater than 0"),
  buildingId: z.coerce.number().int().positive("buildingId must be greater than 0"),
  role: z.string().trim().min(1, "Role cannot be empty").max(50, "Role is too long"),
});

const updateBuildingAssignmentSchema = z
  .object({
    userId: z.coerce.number().int().positive("userId must be greater than 0").optional(),
    buildingId: z.coerce.number().int().positive("buildingId must be greater than 0").optional(),
    role: z.string().trim().min(1, "Role cannot be empty").max(50, "Role is too long").optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, "At least one field is required for update");

const pathIdSchema = z.coerce.number().int().positive("id must be greater than 0");

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  size: z.coerce.number().int().min(1).max(100).default(10),
  userId: z.coerce.number().int().positive().optional(),
  buildingId: z.coerce.number().int().positive().optional(),
  role: z.string().trim().optional(),
  isActive: z.union([z.boolean(), z.enum(["true", "false", "1", "0"])]).optional(),
  search: z.string().trim().optional(),
});

const parseCreateBuildingAssignment = (body) => createBuildingAssignmentSchema.parse(body);
const parseUpdateBuildingAssignment = (body) => updateBuildingAssignmentSchema.parse(body);
const parsePathId = (id) => pathIdSchema.parse(id);
const parseListQuery = (query) => listQuerySchema.parse(query || {});

module.exports = {
  parseCreateBuildingAssignment,
  parseUpdateBuildingAssignment,
  parsePathId,
  parseListQuery,
};
