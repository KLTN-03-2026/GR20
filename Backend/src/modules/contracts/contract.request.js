const { z } = require("zod");

const createSchema = z.object({
  residentId: z.coerce.number().int().positive(),
  apartmentId: z.coerce.number().int().positive(),
  contractType: z.string(),
  status: z.string().optional(),
  startDate: z.string().date(),
  endDate: z.string().date(),
  monthlyRent: z.coerce.number().min(0).optional().nullable(),
  deposit: z.coerce.number().min(0).optional().nullable(),
  note: z.string().optional(),
});

const updateSchema = z
  .object({
  residentId: z.coerce.number().int().positive().optional(),
  apartmentId: z.coerce.number().int().positive().optional(),
  contractType: z.string().optional(),
  status: z.string().optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  monthlyRent: z.coerce.number().min(0).optional().nullable(),
  deposit: z.coerce.number().min(0).optional().nullable(),
  note: z.string().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, "At least one field is required for update");

const renewSchema = z.object({
  newEndDate: z.string().date(),
  newMonthlyRent: z.coerce.number().min(0),
});

const listSchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  size: z.coerce.number().int().min(1).max(1000).default(10),
  search: z.string().trim().optional(),
  status: z.string().optional(),
  contractType: z.string().optional(),
  residentId: z.coerce.number().int().positive().optional(),
  apartmentId: z.coerce.number().int().positive().optional(),
});

const pathIdSchema = z.coerce.number().int().positive();

const parseCreate = (data) => createSchema.parse(data);
const parseUpdate = (data) => updateSchema.parse(data);
const parseRenew = (data) => renewSchema.parse(data);
const parseList = (query) => listSchema.parse(query || {});
const parsePathId = (id) => pathIdSchema.parse(id);

module.exports = {
  parseCreate,
  parseUpdate,
  parseRenew,
  parseList,
  parsePathId,
};