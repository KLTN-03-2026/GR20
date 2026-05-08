const { z } = require("zod");

const createBuildingImageSchema = z.object({
  buildingId: z.coerce
    .number({ error: "buildingId must be a number" })
    .int("buildingId must be an integer")
    .positive("buildingId must be greater than 0"),
  imageUrl: z
    .string({ error: "imageUrl is required" })
    .trim()
    .min(1, "imageUrl cannot be empty")
    .max(255, "imageUrl is too long"),
});

const parseCreateBuildingImage = (body) => createBuildingImageSchema.parse(body);

const pathIdSchema = z.coerce
  .number({ error: "id must be a number" })
  .int("id must be an integer")
  .positive("id must be greater than 0");

const buildingIdSchema = z.coerce
  .number({ error: "buildingId must be a number" })
  .int("buildingId must be an integer")
  .positive("buildingId must be greater than 0");

const parsePathId = (id) => pathIdSchema.parse(id);
const parseBuildingId = (buildingId) => buildingIdSchema.parse(buildingId);

module.exports = {
  createBuildingImageSchema,
  parseCreateBuildingImage,
  parsePathId,
  parseBuildingId,
};
