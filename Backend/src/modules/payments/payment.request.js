const { z } = require("zod");

const paymentStatusSchema = z.enum(["PENDING", "SUCCESS", "FAILED"]);
const dateLikeSchema = z.union([z.string().datetime(), z.string().date()]);

const createSchema = z.object({
  invoiceId: z.coerce.number().int().positive(),
  amount: z.coerce.number().nonnegative(),
  paymentMethod: z.string().trim().min(1).max(50).optional(),
  paymentGateway: z.string().trim().max(50).optional(),
  gatewayTransactionNo: z.string().trim().max(100).optional(),
  responseCode: z.string().trim().max(50).optional(),
  status: paymentStatusSchema.optional(),
  paymentDate: dateLikeSchema.optional(),
});

const updateSchema = z
  .object({
    invoiceId: z.coerce.number().int().positive().optional(),
    amount: z.coerce.number().nonnegative().optional(),
    paymentMethod: z.string().trim().min(1).max(50).optional(),
    paymentGateway: z.string().trim().max(50).optional(),
    gatewayTransactionNo: z.string().trim().max(100).optional(),
    responseCode: z.string().trim().max(50).optional(),
    status: paymentStatusSchema.optional(),
    paymentDate: dateLikeSchema.optional(),
  })
  .refine((v) => Object.keys(v).length > 0, "At least one field is required for update");

const parsePathId = (id) => z.coerce.number().int().positive().parse(id);
const parseCreatePayment = (body) => createSchema.parse(body);
const parseUpdatePayment = (body) => updateSchema.parse(body);
const parseUserPaymentsQuery = (query) =>
  z
    .object({
      page: z.coerce.number().int().min(0).default(0),
      size: z.coerce.number().int().min(1).max(100).default(10),
      status: paymentStatusSchema.optional(),
    })
    .parse(query || {});
const parsePaymentListQuery = (query) =>
  z
    .object({
      page: z.coerce.number().int().min(0).default(0),
      size: z.coerce.number().int().min(1).max(100).default(10),
      invoiceId: z.coerce.number().int().positive().optional(),
      status: paymentStatusSchema.optional(),
      paymentMethod: z.string().trim().min(1).max(50).optional(),
      includeDeleted: z
        .union([z.boolean(), z.enum(["true", "false"]).transform((v) => v === "true")])
        .default(false),
    })
    .parse(query || {});

module.exports = { parsePathId, parseCreatePayment, parseUpdatePayment, parsePaymentListQuery, parseUserPaymentsQuery };
