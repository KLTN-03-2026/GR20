const { z } = require("zod");

const baseSchema = z.object({
  meterId: z.coerce.number().int().positive(),
  readingDate: z.string().date(),
  previousReading: z.coerce.number().min(0),
  currentReading: z.coerce.number().min(0),
});

const createSchema = baseSchema.refine((v) => v.currentReading >= v.previousReading, {
  message: "currentReading must be greater than or equal to previousReading",
  path: ["currentReading"],
});

const updateSchema = z
  .object({
    meterId: z.coerce.number().int().positive().optional(),
    readingDate: z.string().date().optional(),
    previousReading: z.coerce.number().min(0).optional(),
    currentReading: z.coerce.number().min(0).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, "At least one field is required for update");

const parsePathId = (id) => z.coerce.number().int().positive().parse(id);
const parseCreateMeterReading = (body) => createSchema.parse(body);
const parseUpdateMeterReading = (body) => updateSchema.parse(body);
const parseMeterReadingListQuery = (query) =>
  z
    .object({
      page: z.coerce.number().int().min(0).default(0),
      size: z.coerce.number().int().min(1).max(100).default(10),
      apartmentId: z.coerce.number().int().positive().optional(),
      billingMonth: z.coerce.number().int().min(1).max(12).optional(),
      billingYear: z.coerce.number().int().min(2000).max(2100).optional(),
    })
    .refine(
      (d) =>
        (d.billingMonth === undefined && d.billingYear === undefined) ||
        (d.billingMonth !== undefined && d.billingYear !== undefined),
      { message: "billingMonth and billingYear must be provided together", path: ["billingYear"] }
    )
    .parse(query || {});
const parseMeterReadingUserQuery = (query) =>
  z
    .object({
      page: z.coerce.number().int().min(0).default(0),
      size: z.coerce.number().int().min(1).max(100).default(10),
      meterType: z.enum(["ELECTRIC", "WATER", "GAS"]).optional(),
      fromMonth: z.coerce.number().int().min(1).max(12).optional(),
      fromYear: z.coerce.number().int().min(2000).max(2100).optional(),
      toMonth: z.coerce.number().int().min(1).max(12).optional(),
      toYear: z.coerce.number().int().min(2000).max(2100).optional(),
      apartmentId: z.coerce.number().int().positive().optional(),
      billingMonth: z.coerce.number().int().min(1).max(12).optional(),
      billingYear: z.coerce.number().int().min(2000).max(2100).optional(),
    })
    .refine(
      (d) =>
        (d.billingMonth === undefined && d.billingYear === undefined) ||
        (d.billingMonth !== undefined && d.billingYear !== undefined),
      { message: "billingMonth and billingYear must be provided together", path: ["billingYear"] }
    )
    .parse(query || {});

const suggestPreviousQuerySchema = z.object({
  meterId: z.coerce.number().int().positive(),
  readingDate: z.string().date(),
});
const parseSuggestPreviousQuery = (query) => suggestPreviousQuerySchema.parse(query || {});

module.exports = {
  parsePathId,
  parseCreateMeterReading,
  parseUpdateMeterReading,
  parseMeterReadingListQuery,
  parseMeterReadingUserQuery,
  parseSuggestPreviousQuery,
};
