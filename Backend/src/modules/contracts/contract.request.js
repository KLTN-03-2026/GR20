const { z } = require("zod");

const createSchema = z.object({
  residentId: z.number(),
  apartmentId: z.number(),
  contractType: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  monthlyRent: z.number(),
  deposit: z.number(),
  note: z.string().optional(),
});

const updateSchema = z.object({
  endDate: z.string().optional(),
  monthlyRent: z.number().optional(),
  note: z.string().optional(),
});

const renewSchema = z.object({
  newEndDate: z.string(),
  newMonthlyRent: z.number(),
});

const parseCreate = (data) => createSchema.parse(data);
const parseUpdate = (data) => updateSchema.parse(data);
const parseRenew = (data) => renewSchema.parse(data);

module.exports = {
  parseCreate,
  parseUpdate,
  parseRenew,
};