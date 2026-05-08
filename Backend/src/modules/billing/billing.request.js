const { z } = require("zod");

const generateInvoiceSchema = z.object({
  apartmentId: z.coerce.number().int().positive(),
  billingMonth: z.coerce.number().int().min(1).max(12),
  billingYear: z.coerce.number().int().min(2000).max(2100),
  dueDate: z.string().date().optional(),
});

const parseGenerateInvoice = (body) => generateInvoiceSchema.parse(body);

module.exports = {
  parseGenerateInvoice,
};
