const { z } = require("zod");

const createSchema = z.object({
  hostUserId: z.coerce.number().int().positive().nullable().optional(),
  name: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(1).max(20).nullable().optional(),
  idCard: z.string().trim().min(1).max(20).nullable().optional(),
});

const updateSchema = z
  .object({
    hostUserId: z.coerce.number().int().positive().nullable().optional(),
    name: z.string().trim().min(1).max(100).optional(),
    phone: z.string().trim().min(1).max(20).nullable().optional(),
    idCard: z.string().trim().min(1).max(20).nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, "At least one field is required for update");

const listSchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  size: z.coerce.number().int().min(1).max(1000).default(10),
  search: z.string().trim().optional(),
  hostUserId: z.coerce.number().int().positive().optional(),
});

const pathIdSchema = z.coerce.number().int().positive();

const parseCreate = (body) => createSchema.parse(body);
const parseUpdate = (body) => updateSchema.parse(body);
const parseList = (query) => listSchema.parse(query || {});
const parsePathId = (id) => pathIdSchema.parse(id);

module.exports = { parseCreate, parseUpdate, parseList, parsePathId };
