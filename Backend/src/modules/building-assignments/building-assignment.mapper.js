const toEntity = (req) => ({
  user_id: req.userId,
  building_id: req.buildingId,
  role: req.role,
});

const toResponse = (row) => ({
  id: row.id,
  userId: row.user_id,
  username: row.username || null,
  fullName: row.full_name || null,
  buildingId: row.building_id,
  buildingName: row.building_name || null,
  role: row.role,
  isActive: row.is_active,
  assignedAt: row.assigned_at,
});

module.exports = { toEntity, toResponse };
