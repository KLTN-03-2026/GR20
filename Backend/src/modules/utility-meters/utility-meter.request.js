const { z } = require("zod");

const meterTypeSchema = z.enum(["ELECTRIC", "WATER", "GAS"]);
const meterStatusSchema = z.enum(["ACTIVE", "INACTIVE", "BROKEN"]);

const createUtilityMeterSchema = z.object({
  apartmentId: z.coerce.number().int().positive(),
  meterType: meterTypeSchema,
  meterCode: z.string().trim().min(1).max(50),
  installedDate: z.string().date().optional(),
  status: meterStatusSchema.default("ACTIVE"),
});

const updateUtilityMeterSchema = z
  .object({
    apartmentId: z.coerce.number().int().positive().optional(),
    meterType: meterTypeSchema.optional(),
    meterCode: z.string().trim().min(1).max(50).optional(),
    installedDate: z.string().date().optional(),
    status: meterStatusSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, "At least one field is required for update");

const parsePathId = (id) => z.coerce.number().int().positive().parse(id);
const parseCreateUtilityMeter = (body) => createUtilityMeterSchema.parse(body);
const parseUpdateUtilityMeter = (body) => updateUtilityMeterSchema.parse(body);
const parseUtilityMeterFilters = (query) =>
  z
    .object({
      meterType: meterTypeSchema.optional(),
      apartmentId: z.coerce.number().int().positive().optional(),
      status: meterStatusSchema.optional(),
      page: z.coerce.number().int().min(0).default(0),
      size: z.coerce.number().int().min(1).max(100).default(10),
    })
    .parse(query || {});
const parseUtilityMeterUserQuery = (query) =>
  z
    .object({
      page: z.coerce.number().int().min(0).default(0),
      size: z.coerce.number().int().min(1).max(100).default(10),
      meterType: meterTypeSchema.optional(),
      status: meterStatusSchema.optional(),
    })
    .parse(query || {});

module.exports = {
  parsePathId,
  parseCreateUtilityMeter,
  parseUpdateUtilityMeter,
  parseUtilityMeterFilters,
  parseUtilityMeterUserQuery,
};
