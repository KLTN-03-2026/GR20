const { z } = require("zod");

// Enum values từ database
const ContractTypeEnum = z.enum(["RENT", "OWNERSHIP", "TRANSFER"]);
const ContractStatusEnum = z.enum(["ACTIVE", "EXPIRED", "TERMINATED", "PENDING"]);

const createSchema = z.object({
  residentId: z.number().int().positive("Resident ID must be a positive integer"),
  apartmentId: z.number().int().positive("Apartment ID must be a positive integer"),
  contractType: ContractTypeEnum,
  status: ContractStatusEnum.optional().default('PENDING'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  monthlyRent: z.number().min(0, "Monthly rent must be >= 0"),
  deposit: z.number().min(0, "Deposit must be >= 0"),
  note: z.string().optional(),
})
.refine(data => new Date(data.endDate) > new Date(data.startDate), {
  message: "Ngày kết thúc phải sau ngày bắt đầu",
  path: ["endDate"],
})
.refine(data => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  return diffMonths >= 3;
}, {
  message: "Hợp đồng phải có thời hạn ít nhất 3 tháng",
  path: ["endDate"],
})
.refine(data => {
  const start = new Date(data.startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return start >= today;
}, {
  message: "Ngày bắt đầu không được trong quá khứ",
  path: ["startDate"],
});

const updateSchema = z.object({
  status: ContractStatusEnum.optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format").optional(),
  monthlyRent: z.number().min(0).optional(),
  note: z.string().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided",
});

const renewSchema = z.object({
  status: ContractStatusEnum.optional(),
  newEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  newMonthlyRent: z.number().min(0, "Monthly rent must be >= 0"),
});

const parseCreate = (data) => createSchema.parse(data);
const parseUpdate = (data) => updateSchema.parse(data);
const parseRenew = (data) => renewSchema.parse(data);

module.exports = {
  parseCreate,
  parseUpdate,
  parseRenew,
  ContractTypeEnum,
  ContractStatusEnum,
};