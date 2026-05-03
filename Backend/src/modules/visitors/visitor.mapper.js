const toEntity = (req) => ({
  host_user_id: req.hostUserId,
  name: req.name,
  phone: req.phone,
  id_card: req.idCard,
});

const toResponse = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    hostUserId: row.host_user_id,
    name: row.name,
    phone: row.phone,
    idCard: row.id_card,
    createdAt: row.created_at,
  };
};

module.exports = { toEntity, toResponse };
