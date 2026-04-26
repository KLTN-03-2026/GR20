const repo = require("./building-image.repository");
const mapper = require("./building-image.mapper");
const { AppError } = require("../../common/app-error");
const {
  parseCreateBuildingImage,
  parsePathId,
  parseBuildingId,
} = require("./building-image.request");

const createBuildingImage = async (reqBody) => {
  const parsed = parseCreateBuildingImage(reqBody);
  const entity = mapper.toEntity(parsed);
  const result = await repo.createBuildingImage(entity);

  return {
    id: result.id,
  };
};

const createBuildingImageByFile = async ({ buildingId, file }) => {
  const parsed = parseCreateBuildingImage({
    buildingId,
    imageUrl: `/uploads/buildings/${file.filename}`,
  });
  const entity = mapper.toEntity(parsed);
  const result = await repo.createBuildingImage(entity);

  return {
    id: result.id,
    imageUrl: `/uploads/buildings/${file.filename}`,
  };
};

const getAllByBuildingId = async (buildingId) => {
  const parsedBuildingId = parseBuildingId(buildingId);
  const images = await repo.getAllByBuildingId(parsedBuildingId);

  return {
    data: images.map(mapper.toResponse),
    size: images.length,
  };
};

const softDeleteBuildingImage = async (id) => {
  const parsedId = parsePathId(id);
  const deleted = await repo.softDeleteBuildingImage(parsedId);

  if (!deleted) {
    throw new AppError(404, "Building image not found");
  }

  return {
    id: deleted.id,
  };
};

module.exports = {
  createBuildingImage,
  createBuildingImageByFile,
  getAllByBuildingId,
  softDeleteBuildingImage,
};
