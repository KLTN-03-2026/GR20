const { z } = require("zod");

const vehicleTypeEnum = z.enum(["MOTORBIKE", "CAR", "BICYCLE"]);
const vehicleStatusEnum = z.enum(["ACTIVE", "REMOVED"]);

const createSchema = z.object({
  ownerId: z.coerce.number().int().positive().nullable().optional(),
  apartmentId: z.coerce.number().int().positive().nullable().optional(),
  plateNumber: z.string().trim().min(1).max(20),
  vehicleType: vehicleTypeEnum,
  color: z.string().trim().min(1).max(20).nullable().optional(),
  status: vehicleStatusEnum.optional(),
});

const updateSchema = z
  .object({
    ownerId: z.coerce.number().int().positive().nullable().optional(),
    apartmentId: z.coerce.number().int().positive().nullable().optional(),
    plateNumber: z.string().trim().min(1).max(20).optional(),
    vehicleType: vehicleTypeEnum.optional(),
    color: z.string().trim().min(1).max(20).nullable().optional(),
    status: vehicleStatusEnum.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, "At least one field is required for update");

const listSchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  size: z.coerce.number().int().min(1).max(1000).default(10),
  search: z.string().trim().optional(),
  status: vehicleStatusEnum.optional(),
  ownerId: z.coerce.number().int().positive().optional(),
  apartmentId: z.coerce.number().int().positive().optional(),
});

const pathIdSchema = z.coerce.number().int().positive();

const parseCreate = (body) => createSchema.parse(body);
const parseUpdate = (body) => updateSchema.parse(body);
const parseList = (query) => listSchema.parse(query || {});
const parsePathId = (id) => pathIdSchema.parse(id);

module.exports = { parseCreate, parseUpdate, parseList, parsePathId };
