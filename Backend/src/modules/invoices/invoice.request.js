const { z } = require("zod");

const invoiceStatusSchema = z.enum(["PENDING", "PAID", "OVERDUE", "CANCELLED"]);

const createInvoiceSchema = z.object({
  invoiceCode: z.string().trim().min(1).max(50).optional(),
  apartmentId: z.coerce.number().int().positive(),
  totalAmount: z.coerce.number().nonnegative().optional(),
  status: invoiceStatusSchema.optional(),
  billingMonth: z.coerce.number().int().min(1).max(12).optional(),
  billingYear: z.coerce.number().int().min(2000).max(2100).optional(),
  dueDate: z.string().date().optional(),
}).refine(
  (v) => (v.billingMonth === undefined && v.billingYear === undefined) || (v.billingMonth !== undefined && v.billingYear !== undefined),
  "billingMonth and billingYear must be provided together"
).refine(
  (v) => v.totalAmount !== undefined || (v.billingMonth !== undefined && v.billingYear !== undefined),
  "Provide totalAmount, or provide billingMonth and billingYear to auto-calculate from utilities and/or active RENT contract"
);

const updateInvoiceSchema = z
  .object({
    invoiceCode: z.string().trim().min(1).max(50).optional(),
    apartmentId: z.coerce.number().int().positive().optional(),
    totalAmount: z.coerce.number().nonnegative().optional(),
    status: invoiceStatusSchema.optional(),
    billingMonth: z.coerce.number().int().min(1).max(12).optional(),
    billingYear: z.coerce.number().int().min(2000).max(2100).optional(),
    dueDate: z.string().date().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, "At least one field is required for update")
  .refine(
    (v) => (v.billingMonth === undefined && v.billingYear === undefined) || (v.billingMonth !== undefined && v.billingYear !== undefined),
    "billingMonth and billingYear must be provided together"
  );

const parsePathId = (id) => z.coerce.number().int().positive().parse(id);
const parseCreateInvoice = (body) => createInvoiceSchema.parse(body);
const parseUpdateInvoice = (body) => updateInvoiceSchema.parse(body);
const parseInvoiceListQuery = (query) =>
  z
    .object({
      page: z.coerce.number().int().min(0).default(0),
      size: z.coerce.number().int().min(1).max(100).default(10),
    })
    .parse(query || {});
const parseInvoiceUserQuery = (query) =>
  z
    .object({
      page: z.coerce.number().int().min(0).default(0),
      size: z.coerce.number().int().min(1).max(100).default(10),
      status: invoiceStatusSchema.optional(),
    })
    .parse(query || {});

module.exports = { parsePathId, parseCreateInvoice, parseUpdateInvoice, parseInvoiceListQuery, parseInvoiceUserQuery };
