const { z } = require("zod");

const meterTypeSchema = z.enum(["ELECTRIC", "WATER", "GAS"]);
const unitByMeterType = {
  ELECTRIC: "kWh",
  WATER: "m3",
  GAS: "kg",
};

const unitSchema = z
  .string()
  .trim()
  .min(1, "unit is required")
  .max(20, "unit must be at most 20 characters");

const effectiveFromSchema = z.string().date("effectiveFrom must be in YYYY-MM-DD format");

const createSchema = z.object({
  meterType: meterTypeSchema,
  pricePerUnit: z.coerce.number().positive("pricePerUnit must be greater than 0"),
  unit: unitSchema,
  effectiveFrom: effectiveFromSchema,
  isActive: z.boolean().optional(),
}).strict("Unknown field in request body");

const updateSchema = z
  .object({
    meterType: meterTypeSchema.optional(),
    pricePerUnit: z.coerce.number().positive("pricePerUnit must be greater than 0").optional(),
    unit: unitSchema.optional(),
    effectiveFrom: effectiveFromSchema.optional(),
    isActive: z.boolean().optional(),
  })
  .strict("Unknown field in request body")
  .refine((data) => Object.keys(data).length > 0, "At least one field is required for update");

const parsePathId = (id) => z.coerce.number().int().positive().parse(id);
const validateUnitByMeterType = ({ meterType, unit }) => {
  const expectedUnit = unitByMeterType[meterType];
  if (!expectedUnit) return;
  if (unit !== expectedUnit) {
    throw new z.ZodError([
      {
        code: "custom",
        message: `unit must be "${expectedUnit}" for meterType "${meterType}"`,
        path: ["unit"],
      },
    ]);
  }
};

const parseCreateUtilityPricing = (body) => {
  const parsed = createSchema.parse(body);
  validateUnitByMeterType(parsed);
  return parsed;
};
const parseUpdateUtilityPricing = (body) => updateSchema.parse(body);
const parseUtilityPricingListQuery = (query) =>
  z
    .object({
      page: z.coerce.number().int().min(0).default(0),
      size: z.coerce.number().int().min(1).max(100).default(10),
      meterType: meterTypeSchema.optional(),
      isActive: z
        .union([z.boolean(), z.enum(["true", "false"]).transform((v) => v === "true")])
        .optional(),
    })
    .parse(query || {});
const parseMeterTypePath = (meterType) => meterTypeSchema.parse(meterType);

module.exports = {
  parsePathId,
  parseCreateUtilityPricing,
  parseUpdateUtilityPricing,
  parseUtilityPricingListQuery,
  parseMeterTypePath,
  validateUnitByMeterType,
};
