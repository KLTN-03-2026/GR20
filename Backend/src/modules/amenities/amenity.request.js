const { z } = require("zod");

const AmenityStatusEnum = z.enum(["OPEN", "CLOSED", "MAINTENANCE"]);

const createSchema = z.object({
  name: z.string().min(1, "Tên tiện ích không được để trống").max(255),
  description: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  operatingHours: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  status: AmenityStatusEnum.optional().default("OPEN"),
  closedReason: z.string().optional().nullable(),
});

const updateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  operatingHours: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  status: AmenityStatusEnum.optional(),
  closedReason: z.string().optional().nullable(),
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided",
});

const parseCreate = (data) => createSchema.parse(data);
const parseUpdate = (data) => updateSchema.parse(data);

module.exports = { parseCreate, parseUpdate, AmenityStatusEnum };