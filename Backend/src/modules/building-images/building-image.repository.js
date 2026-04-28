const { pool } = require("../../configs/database.config");
const { AppError } = require("../../common/app-error");

const isForeignKeyViolation = (err) => err && err.code === "23503";

const createBuildingImage = async (image) => {
  const query = `
    INSERT INTO building_images (building_id, image_url)
    VALUES ($1, $2)
    RETURNING id
  `;

  try {
    const result = await pool.query(query, [image.building_id, image.image_url]);
    return result.rows[0];
  } catch (err) {
    if (isForeignKeyViolation(err)) {
      throw new AppError(400, "Invalid buildingId (building does not exist)");
    }
    throw err;
  }
};

const getAllByBuildingId = async (buildingId, includeDeleted = false) => {
  const query = `
    SELECT *
    FROM building_images
    WHERE building_id = $1
      ${includeDeleted ? "" : "AND deleted_at IS NULL"}
    ORDER BY id ASC
  `;

  const result = await pool.query(query, [buildingId]);
  return result.rows;
};

const softDeleteBuildingImage = async (id) => {
  const query = `
    UPDATE building_images
    SET deleted_at = NOW()
    WHERE id = $1 AND deleted_at IS NULL
    RETURNING id
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  createBuildingImage,
  getAllByBuildingId,
  softDeleteBuildingImage,
};
