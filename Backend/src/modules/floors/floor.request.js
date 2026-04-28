const { z } = require("zod");

const createFloorSchema = z.object({
  // Keep snake_case for FE/BE consistency with existing DB naming
  building_id: z.coerce
    .number({ error: "building_id must be a number" })
    .int("building_id must be an integer")
    .positive("building_id must be greater than 0"),
  floor_number: z.coerce
    .number({ error: "floor_number must be a number" })
    .int("floor_number must be an integer"),
  name: z
    .string()
    .trim()
    .max(255, "name is too long")
    .optional()
    .nullable(),
});

const updateFloorSchema = z
  .object({
    building_id: z.coerce
      .number({ error: "building_id must be a number" })
      .int("building_id must be an integer")
      .positive("building_id must be greater than 0")
      .optional(),
    floor_number: z.coerce
      .number({ error: "floor_number must be a number" })
      .int("floor_number must be an integer")
      .optional(),
    name: z
      .string()
      .trim()
      .max(255, "name is too long")
      .optional()
      .nullable(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field is required for update",
  );

const paginationSchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  // FE dropdowns are requesting up to 500 items
  size: z.coerce.number().int().min(1).max(1000).default(10),
  search: z.string().trim().optional(),
  buildingId: z.coerce.number().int().positive().optional(),
  includeDeleted: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .optional()
    .transform((v) => (v === "true" ? true : v === "false" ? false : v)),
  status: z.enum(["active", "deleted", "all"]).optional(),
});

/** @param {unknown} body */
function parseCreateFloor(body) {
  return createFloorSchema.parse(body);
}

/** @param {unknown} body */
function parseUpdateFloor(body) {
  return updateFloorSchema.parse(body);
}

/** @param {unknown} query */
function parseFloorPagination(query) {
  return paginationSchema.parse(query || {});
}

module.exports = {
  createFloorSchema,
  updateFloorSchema,
  paginationSchema,
  parseCreateFloor,
  parseUpdateFloor,
  parseFloorPagination,
};
