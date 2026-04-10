const { z } = require("zod");

const currentYear = new Date().getFullYear();

const buildingStatusSchema = z.enum(["ACTIVE", "CLOSED"]);

const codeSchema = z
  .string({ error: "Code is required" })
  .trim()
  .min(1, "Code cannot be empty")
  .max(64, "Code is too long")
  .regex(
    /^[A-Za-z0-9_-]+$/,
    "Code may only contain letters, digits, underscore and hyphen"
  );

const createBuildingSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .trim()
    .min(1, "Name cannot be empty")
    .max(255, "Name is too long"),
  code: codeSchema,
  address: z
    .string({ error: "Address is required" })
    .trim()
    .min(1, "Address cannot be empty")
    .max(500, "Address is too long"),
  totalFloors: z.coerce
    .number({ error: "totalFloors must be a number" })
    .int("totalFloors must be an integer")
    .positive("totalFloors must be greater than 0"),
  totalApartments: z.coerce
    .number({ error: "totalApartments must be a number" })
    .int("totalApartments must be an integer")
    .min(0, "totalApartments cannot be negative"),
  yearBuilt: z.coerce
    .number({ error: "yearBuilt must be a number" })
    .int("yearBuilt must be an integer")
    .min(1800, "yearBuilt is too early")
    .max(currentYear + 1, "yearBuilt cannot be in the distant future"),
  status: buildingStatusSchema.optional(),
});

const updateBuildingSchema = z
  .object({
    name: z.string().trim().min(1, "Name cannot be empty").max(255).optional(),
    code: codeSchema.optional(),
    address: z
      .string()
      .trim()
      .min(1, "Address cannot be empty")
      .max(500)
      .optional(),
    totalFloors: z.coerce
      .number()
      .int()
      .positive("totalFloors must be greater than 0")
      .optional(),
    totalApartments: z.coerce
      .number()
      .int()
      .min(0, "totalApartments cannot be negative")
      .optional(),
    yearBuilt: z.coerce
      .number()
      .int()
      .min(1800)
      .max(currentYear + 1)
      .optional(),
    status: buildingStatusSchema.optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field is required for update"
  );

/** @param {unknown} body */
function parseCreateBuilding(body) {
  return createBuildingSchema.parse(body);
}

/** @param {unknown} body */
function parseUpdateBuilding(body) {
  return updateBuildingSchema.parse(body);
}

module.exports = {
  createBuildingSchema,
  updateBuildingSchema,
  parseCreateBuilding,
  parseUpdateBuilding,
};
