const { z } = require("zod");

const apartmentStatusSchema = z.enum(["AVAILABLE", "OCCUPIED", "INACTIVE"]);

const directionSchema = z.enum([
  "NORTH",
  "SOUTH",
  "EAST",
  "WEST",
  "NORTHEAST",
  "NORTHWEST",
  "SOUTHEAST",
  "SOUTHWEST",
]);

const apartmentCodeSchema = z
  .string({ error: "Apartment code is required" })
  .trim()
  .min(1, "Apartment code cannot be empty")
  .max(50, "Apartment code is too long")
  .regex(
    /^[A-Za-z0-9_-]+$/,
    "Apartment code may only contain letters, digits, underscore and hyphen"
  );

// CREATE
const createApartmentSchema = z.object({
  buildingId: z.coerce
    .number({ error: "buildingId must be a number" })
    .int("buildingId must be an integer")
    .positive("buildingId must be greater than 0"),

  ownerUserId: z.coerce
    .number({ error: "ownerUserId must be a number" })
    .int("ownerUserId must be an integer")
    .positive("ownerUserId must be greater than 0")
    .optional(),

  floorId: z.coerce
    .number({ error: "floorId must be a number" })
    .int("floorId must be an integer")
    .positive("floorId must be greater than 0"),

  apartmentCode: apartmentCodeSchema,

  area: z.coerce
    .number({ error: "area must be a number" })
    .positive("area must be greater than 0"),

  bedrooms: z.coerce
    .number({ error: "bedrooms must be a number" })
    .int("bedrooms must be an integer")
    .min(0, "bedrooms cannot be negative"),

  bathrooms: z.coerce
    .number({ error: "bathrooms must be a number" })
    .int("bathrooms must be an integer")
    .min(0, "bathrooms cannot be negative"),

  balconyDirection: directionSchema.optional(),

  status: apartmentStatusSchema.optional(),
});

// UPDATE
const updateApartmentSchema = z
  .object({
    buildingId: z.coerce.number().int().positive().optional(),

    ownerUserId: z.coerce.number().int().positive().optional(),

    floorId: z.coerce.number().int().positive().optional(),

    apartmentCode: apartmentCodeSchema.optional(),

    area: z.coerce.number().positive().optional(),

    bedrooms: z.coerce.number().int().min(0).optional(),

    bathrooms: z.coerce.number().int().min(0).optional(),

    balconyDirection: directionSchema.optional(),

    status: apartmentStatusSchema.optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field is required for update"
  );

/** @param {unknown} body */
function parseCreateApartment(body) {
  return createApartmentSchema.parse(body);
}

/** @param {unknown} body */
function parseUpdateApartment(body) {
  return updateApartmentSchema.parse(body);
}

module.exports = {
  createApartmentSchema,
  updateApartmentSchema,
  parseCreateApartment,
  parseUpdateApartment,
};