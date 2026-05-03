const { z } = require("zod");

const createSchema = z.object({
  invoiceId: z.coerce.number().int().positive(),
  itemName: z.string().trim().min(1).max(255),
  amount: z.coerce.number().nonnegative(),
  meterId: z.coerce.number().int().positive().optional(),
});

const updateSchema = z
  .object({
    invoiceId: z.coerce.number().int().positive().optional(),
    itemName: z.string().trim().min(1).max(255).optional(),
    amount: z.coerce.number().nonnegative().optional(),
    meterId: z.coerce.number().int().positive().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, "At least one field is required for update");

const parsePathId = (id) => z.coerce.number().int().positive().parse(id);
const parseCreateInvoiceItem = (body) => createSchema.parse(body);
const parseUpdateInvoiceItem = (body) => updateSchema.parse(body);

module.exports = { parsePathId, parseCreateInvoiceItem, parseUpdateInvoiceItem };
