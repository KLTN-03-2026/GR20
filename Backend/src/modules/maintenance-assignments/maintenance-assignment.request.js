const { z } = require("zod");

const createSchema = z.object({
  requestId: z.coerce.number().int().positive(),
  technicalId: z.coerce.number().int().positive(),
});

const listSchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  size: z.coerce.number().int().min(1).max(1000).default(10),
  requestId: z.coerce.number().int().positive().optional(),
  technicalId: z.coerce.number().int().positive().optional(),
});

const pathIdSchema = z.coerce.number().int().positive();

function parseCreate(body) {
  return createSchema.parse(body);
}
function parseList(query) {
  return listSchema.parse(query || {});
}
function parsePathId(id) {
  return pathIdSchema.parse(id);
}

module.exports = { parseCreate, parseList, parsePathId };

