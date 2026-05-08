const toEntity = (req) => {
  return {
    building_id: req.buildingId ?? req.building_id,
    image_url: req.imageUrl ?? req.image_url,
  };
};

const toResponse = (row) => {
  if (!row) return null;

  return {
    id: row.id,
    buildingId: row.building_id,
    imageUrl: row.image_url,
    createdAt: row.created_at,
    deletedAt: row.deleted_at || null,
  };
};

module.exports = {
  toEntity,
  toResponse,
};
